#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

void main() {
    vec2 uv = sourceUV;
    float yBias = sin(
        uv.x * 3.1415 * 2. * 2. +
        time * 3. -
        uv.x * 3.1415 * 2. * sin(-time)
    );
    uv.y += sin(yBias) / 5.9;
    uv -= .5;
    uv *= .81;
    uv += .5;

    vec4 background = texture(sourceTexture, uv);
    vec4 source = texture(sourceTexture, sourceUV);

    background.r = texture(sourceTexture, uv + sin(time / 3.) / 3.).r;
    background.g = texture(sourceTexture, uv - sin(time / 3.) / 3.).g;
    
    background.a *= source.a;

    vec4 outline = source;
    // outline.rgb *= (1.2 - uv.y) * (1.2 - uv.x);

    outColor = mix( background, outline, floor((source.r + source.g + source.b) / 2.99));
}