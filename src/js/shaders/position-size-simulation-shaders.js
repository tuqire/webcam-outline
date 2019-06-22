/* eslint-disable */

const positionSizeSimulationFragmentShader = `
	/** generates a random number between 0 and 1 **/
	highp float rand(vec2 co) {
		highp float a = 12.9898;
		highp float b = 78.233;
		highp float c = 43758.5453;
		highp float dt= dot(co.xy ,vec2(a,b));
		highp float sn= mod(dt,3.14);
		return fract(sin(sn) * c);
	}

	// this is the texture position the data for this particle is stored in
	varying vec2 vUv;

	uniform sampler2D tWebcam;
	uniform sampler2D tPrev;
	uniform sampler2D tCurr;

	uniform vec3 mouse;
	uniform sampler2D tParams;
	uniform float yThreshold;
	uniform float mouseRadius;
	uniform float mousePush;

	uniform float defaultSize;
	uniform float outlineMultiplier;

	vec3 getPos() {
		vec3 defaultPos = vec3((vUv.x * 1.0) - 0.5, (vUv.y * 1.0) - 0.5, 0.0);
		vec3 deacceleration = vec3(1.1);
		vec3 prevPos = texture2D(tPrev, vUv).xyz;
		vec3 currPos = texture2D(tCurr, vUv).xyz;
		vec3 velocity = currPos == defaultPos ? vec3(0.0) : (currPos - prevPos) / deacceleration;
		vec3 pos = currPos;
		float distanceToMouse = length(pos - mouse);

		if (distanceToMouse < mouseRadius) {
			velocity += (normalize(pos - mouse) * mousePush);
		}

		float xSpeed = texture2D(tParams, vUv).x;
		float ySpeed = texture2D(tParams, vUv).y;
		velocity.y += ySpeed;
		velocity.x += rand(vec2(defaultPos.x, defaultPos.y)) > 0.5 ? xSpeed : -xSpeed;

		if (pos == vec3(0.0) || pos.y > yThreshold + defaultPos.y) {
			pos = defaultPos;
		} else {
			pos += velocity;
		}

		return pos;
	}

	float getSize() {
		vec2 defaultPixel = vec2((vUv.x * 1.0), (vUv.y * 1.0));
		float webcamParticleVal = texture2D(tWebcam, vec2(defaultPixel.x, defaultPixel.y)).r;
		float size = defaultSize + (outlineMultiplier * webcamParticleVal);

		return size;
	}

	void main() {
		gl_FragColor = vec4(getPos(), getSize());
	}
`

const positionSizeSimulationVertexShader = `
	// this value stores the texture coordinates the data for this vertex is stored in
	varying vec2 vUv;

	void main() {
	  vUv = vec2(uv);

		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`

export {
  positionSizeSimulationFragmentShader,
  positionSizeSimulationVertexShader
}
