/* eslint-disable */

const sizeSimulationFragmentShader = `
	// this is the texture position the data for this particle is stored in
	varying vec2 vUv;

	uniform sampler2D tWebcam;

	uniform float defaultSize;
	uniform float outlineMultiplier;

	float getSize() {
		vec4 currPosition = vec4((vUv.x * 1.0), (vUv.y * 1.0), 0.0, 1.0);
		float webcamParticleVal = texture2D(tWebcam, vec2(currPosition.x, currPosition.y)).r;
		float size = defaultSize + (outlineMultiplier * webcamParticleVal);

		return size;
	}

	void main() {
		gl_FragColor = vec4(0.0, 0.0, 0.0, getSize());
	}
`

const sizeSimulationVertexShader = `
	// this value stores the texture coordinates the data for this vertex is stored in
	varying vec2 vUv;

	void main() {
	  vUv = vec2(uv);

		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`

export {
  sizeSimulationFragmentShader,
  sizeSimulationVertexShader
}
