#version 300 es
precision highp float;

uniform vec2 delta;

#include "@motion-canvas/core/shaders/common.glsl"

void main() {
    vec2 uv = sourceUV;
    uv += delta;

    float alpha = texture(sourceTexture, sourceUV).a;

    outColor = vec4(uv, 0., alpha);
}