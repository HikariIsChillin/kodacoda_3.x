#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"
#include "./perlin_noise.glsl"

void main() {
    vec4 s_col = texture(sourceTexture, sourceUV);
    vec4 d_col = texture(destinationTexture, destinationUV);

    float n = perlinNoise(sourceUV, 13, 6);
    n *= 0.03;
    vec4 d_col_blur = texture(destinationTexture, destinationUV + n);

    // discrete chromatic aberration for colored backdrops
    // d_col_blur = floor(d_col_blur * 4.0) / 4.0;

    d_col = mix(d_col, d_col_blur, ceil(s_col.a));

    outColor = mix(s_col, d_col, 1.-s_col.a);
    outColor.a = 1.0;

    // outColor = vec4(n*100., 0.,-n * 100.,1.);
    // outColor = vec4(vec3(smoothstep(-.02,.02,n)),1.);
}
