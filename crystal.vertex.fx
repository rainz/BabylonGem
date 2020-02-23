precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform mat4 world;

// Varying
varying vec2 vUV;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;

void main(void) {
    vWorldPos = vec3(world * vec4(position, 1.0));
    vWorldNormal = normalize(mat3(world) * normal);
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vUV = uv;
}