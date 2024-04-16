#version 300 es
precision highp float;

uniform float a_step;

uniform vec2 delta;

#include "@motion-canvas/core/shaders/common.glsl"

float cl(float value) {
    return clamp(value, 0.0, 1.0);
}

void main() {
    // do nothing
    outColor = texture(sourceTexture, sourceUV);

    // show uv x
    outColor = mix( outColor, vec4(sourceUV.x, 0., 0., 1.), cl(a_step) );

    // show uv xy
    vec2 uv = sourceUV;
    uv += delta;
    outColor = mix( outColor, vec4(uv, 0., 1.), cl(a_step - 1.0) );

    // show texture moving around
    outColor = mix( outColor, texture(sourceTexture, uv), cl(a_step - 2.0) );
}