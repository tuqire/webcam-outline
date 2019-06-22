/* eslint-disable */

const fragmentShader = `
	uniform sampler2D tColour;
	uniform sampler2D starImg;

	varying vec2 vUv;

	void main() {
		vec4 colour = texture2D(tColour, vUv).rgba;

		gl_FragColor = colour;

		if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard; // makes particles a circle
	}
`

const vertexShader = `
	uniform sampler2D tPosition;
	uniform sampler2D tSize;

	uniform float sizeMultiplierForScreen;

	varying vec2 vUv;

	void main() {
		vUv = position.xy;

		// vec4 position = vec4((vUv.x * 1.0) - 0.5, (vUv.y * 1.0) - 0.5, 0.0, 1.0);
		vec3 position = texture2D(tSize, vUv).xyz;
		float size = texture2D(tSize, vUv).w;

		vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
		gl_PointSize = size * (sizeMultiplierForScreen / -mvPosition.z);
		gl_Position = projectionMatrix * mvPosition;
	}
`

export {
  fragmentShader,
  vertexShader
}
