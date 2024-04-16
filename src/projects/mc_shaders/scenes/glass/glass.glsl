#version 300 es
precision highp float;

uniform float chromatic;

#include "@motion-canvas/core/shaders/common.glsl"

void main() {
    vec2 uv = sourceUV;

    // center uv
    uv -= 0.5;

    // distort uv
    float d = distance(uv, vec2(0.0));
    float multiplier = 1. - d * d * d * 8.;

    multiplier = smoothstep(0., 1., multiplier);

    uv *= multiplier;

    // modulate distortion to texture size
    vec2 size = vec2(textureSize(sourceTexture, 0));
    uv *= size / 5000.0;

    // initialize color
    outColor = vec4(1.0);

    vec4 source = texture(sourceTexture, sourceUV);

    // sample distorted backdrop
    outColor.r = texture(destinationTexture, destinationUV - uv + chromatic * ceil(source.a) ).r;
    outColor.g = texture(destinationTexture, destinationUV - uv ).g;
    outColor.b = texture(destinationTexture, destinationUV - uv - chromatic * ceil(source.a) ).b;

    // shade lens
    vec3 shade = mix(source.rgb, vec3(1.0), 1. - source.a) - d * 1.5;
    if(source.a > 0.0) outColor.rgb *= shade;

    // if(source.a > 0.0 && source.a < 0.08) outColor.rgb = vec3(1.0);

    // draw outline (and other opaque objects)
    outColor = mix(source, outColor, 1. - floor(source.a));
}