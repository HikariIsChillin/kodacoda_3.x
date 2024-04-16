#version 300 es
precision highp float;

// aux
uniform float a_step;
uniform float uv_offset;
uniform float duv_offset;

uniform float uv_peek;
uniform float d_field_peek;
uniform float multiplier_peek;

// actual
uniform float chromatic;

#include "@motion-canvas/core/shaders/common.glsl"

float cl(float value) {
    return clamp(value, 0.0, 1.0);
}

float stepFactor(float target) {
    return cl(a_step - (target - 1.0));
}

float peakFactor(float target) {
    return a_step < target
        ? stepFactor(target)
        : cl( (target + 1.0) - a_step );
}

void main() {
    vec2 uv = sourceUV;
    uv -= uv_offset;

    float d = distance(uv, vec2(0.0));

    outColor = texture(sourceTexture, uv);

    // STEP 1
    outColor.rgb = mix(outColor.rgb, texture(destinationTexture, destinationUV + duv_offset).rgb, stepFactor(1.0));
    if (duv_offset > 0.001 || duv_offset < -0.001) {
        outColor = mix(outColor, texture(destinationTexture, destinationUV + duv_offset), stepFactor(1.0));
    }

    // STEP 2
    outColor = mix(outColor, texture(destinationTexture, destinationUV - uv), stepFactor(2.0));

    // STEP > 2
    // 3 divides the uv by 10 to avoid the reflection of the destination texture temporarily
    // 4 turns on the multiplier
    // 5 maps the multiplier to be [0, 1], making the deformed texture blend nicely with the surroundings
    // 6 reveals the outline
    // 7 modulates the uv based on texture size instead of dividing by 10

    // 3
    vec2 size = vec2(textureSize(sourceTexture, 0));
    uv *= mix(vec2(1.0), mix(vec2(.1),size/3500., stepFactor(7.0)), stepFactor(3.0));
    float multiplier = 1.0 - pow(d, 3.) * 8.;
    // 5
    multiplier = mix(multiplier, smoothstep(0., 1., multiplier), stepFactor(5.0));
    // 4
    vec2 step7uv = uv * mix(1.0, multiplier, stepFactor(4.0));
    // 2
    outColor.rgb = mix(outColor.rgb, texture(destinationTexture, destinationUV - step7uv).rgb, stepFactor(2.0));
    // 6
    vec4 source = texture(sourceTexture, sourceUV);
    outColor = mix(outColor,
        mix(source, outColor, 1. - floor(source.a)),
        stepFactor(6.0)
    );

    // ! PEEKS

    // UV_PÉEK
    outColor.rgb = mix(outColor.rgb, vec3(uv, 0.0), uv_peek);
    
    // D_FIELD_PEEK
    outColor.rgb = mix(outColor.rgb, vec3(d), d_field_peek);

    // MULTIPLIER_PEEK
    outColor.rgb = mix(outColor.rgb, vec3(multiplier), multiplier_peek);






    // center uv
    // uv -= 0.5;

    // float d = distance(uv, vec2(0.0));
    // float m = smoothstep(0.0, 1.0, 1.0 - d * d * d * 8.0);

    // uv *= m;

    // vec2 size = vec2(textureSize(sourceTexture, 0));
    // uv *= size / 5000.0;

    // initialize color
    // outColor = vec4(1.0);

    // vec4 source = texture(sourceTexture, sourceUV);

    // sample distorted backdrop
    // outColor.r = texture(destinationTexture, destinationUV - uv + chromatic * ceil(source.a) ).r;
    // outColor.g = texture(destinationTexture, destinationUV - uv ).g;
    // outColor.b = texture(destinationTexture, destinationUV - uv - chromatic * ceil(source.a) ).b;

    // shade lens
    // if(source.a > 0.0) outColor.rgb *= mix(source.rgb, vec3(1.0), 1. - source.a) - d * 1.5;

    // draw outline (and other opaque objects)
    // outColor = mix(source, outColor, 1. - floor(source.a));
}