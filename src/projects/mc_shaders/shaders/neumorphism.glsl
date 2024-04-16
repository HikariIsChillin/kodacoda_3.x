#version 300 es
precision highp float;

uniform vec2 size;
uniform vec4 radius;

uniform float waveDistance;
// [.01, 0.001]
uniform float waveDiff;

#include "@motion-canvas/core/shaders/common.glsl"

float sdRoundedBox(in vec2 p, in vec2 b, in vec4 r){
    r.xy = (p.x > 0.0)?r.xy : r.zw;
    r.x = (p.y>0.0)?r.x: r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

void main() {
    vec2 uv = (sourceUV - .5) * 2.;
    outColor = texture(destinationTexture, destinationUV);
    
    vec2 normalizedSize = size / vec2(textureSize(sourceTexture,0));
    vec4 normalizedRadius = 2.*min(
        radius / vec2(textureSize(sourceTexture,0)).x,
        radius / vec2(textureSize(sourceTexture,0)).y
    );

    vec2 box = normalizedSize;
    // bgar
    vec4 r = normalizedRadius.bgar;
    // r = vec4(0.);

    float d1 = sdRoundedBox(uv + clamp(waveDiff, 0.0, 0.01), box, r) - waveDistance;
    float d2 = sdRoundedBox(uv - clamp(waveDiff, 0.0, 0.01), box, r) - waveDistance;

    d1 = 1. - exp(-20. * abs(d1));
    d2 = 1. - exp(-20. * abs(d2));

    d1 = smoothstep(.0, 1., d1);
    d2 = smoothstep(.0, 1., d2);

    outColor.rgb += abs(d1) - abs(d2);

    vec4 sourceCol = texture(sourceTexture, sourceUV);
    outColor = mix(outColor, sourceCol, sourceCol.a);
}