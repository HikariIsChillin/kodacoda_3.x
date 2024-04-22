#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"
#include "@/glsl/perlin_noise.glsl"

#define SPEED (1.0 / 150.0)
#define PI 3.1415926535

vec4 primaryPurple = vec4(167.0 / 255.0, 133.0 / 255.0, 238.0 / 255.0, 1.0);
vec4 lightBrown = vec4(229.0 / 255.0, 217.0 / 255.0, 212.0 / 255.0, 1.0);
vec4 pink = vec4(254.0 / 255.0, 146.0 / 255.0, 237.0 / 255.0, 1.0);
vec4 darkBlue = vec4(144.0 / 255.0, 135.0 / 255.0, 255.0 / 255.0, 1.0);
vec4 turquoise = vec4(100.0 / 255.0, 208.0 / 255.0, 252.0 / 255.0, 1.0);

float sdParabola( in vec2 pos, in float k )
{
    pos.x = abs(pos.x);
    float ik = 1.0/k;
    float p = ik*(pos.y - 0.5*ik)/3.0;
    float q = 0.25*ik*ik*pos.x;
    float h = q*q - p*p*p;
    float r = sqrt(abs(h));
    float x = (h>0.0) ? 
        pow(q+r,1.0/3.0) - pow(abs(q-r),1.0/3.0)*sign(r-q) :
        2.0*cos(atan(r,q)/3.0)*sqrt(p);
    return length(pos-vec2(x,k*x*x)) * sign(pos.x-x);
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

float light(in vec2 uv, float angle, float kBias) {
    uv = rotate2d(angle + 2.0) * uv;

    float d = sdParabola(uv, kBias - distance(uv * exp(abs(uv.x)) / 30., vec2(.0)));

    float value = smoothstep(0. - distance(uv * exp(abs(uv.x)) / 1.7, vec2(.0)) / 5., .1, -d);

    value *= ( 1. - .3*distance( uv + vec2(0.,.2), vec2(0.) ) ) / 1.;

    value *= smoothstep(0., 1.,1. - .3 *distance(uv, vec2(0.))); 

    return value;
}

float level(float value, float target, float range) {
    float top = smoothstep(target, target + range, value);
    float bottom = 1.0 - smoothstep(target - range, target, value);
    return 1.0 - (bottom + top);
}

void main() {
    vec2 uv = sourceUV;
    float value = perlinNoise(sourceUV / 4.0 + time * SPEED, 1, 4);
    value = (value + 1.0) * 0.5;
    value = fract(value + time * SPEED);

    vec3 col = level(value, 0.0, 0.3) * pink.rgb;
    col += level(value, 0.35, 0.3) * darkBlue.rgb;
    col += level(value, 0.5, 0.1) * lightBrown.rgb;
    col += level(value, 0.75, 0.3) * primaryPurple.rgb;
    col += level(value, 1.0, 0.3) * pink.rgb;

    value = perlinNoise(abs(sourceUV / 4.0 - time * SPEED), 1, 4);
    value = (value + 1.0) * 0.5;
    value = fract(value + time * SPEED);

    vec3 col2 = level(value, 0.0, 0.3) * pink.rgb;
    col2 += level(value, 0.35, 0.3) * darkBlue.rgb;
    col2 += level(value, 0.5, 0.1) * lightBrown.rgb;
    col2 += level(value, 0.75, 0.3) * primaryPurple.rgb;
    col2 += level(value, 1.0, 0.3) * pink.rgb;

    vec3 finalCol = mix(col, col2, 0.5 + col.r + col2.g + col.b - col2.r - col.g - col2.b);

    vec2 lightUV = (uv - 0.5) * 3.0;
    float lightCol = light(lightUV - sin(13.6 * time * SPEED) / 4.0, 0.0 + 2.0 * time * SPEED, 0.5 * sin(15.0 * time * SPEED) + 1.0);
    float shadowCol = light(lightUV + cos(11.53 * time * SPEED) / 4.0, PI + 2.0 * time * SPEED + sin(7.5 * time * SPEED) / 2.0, 0.5 * sin(21.0 * time * SPEED) + 1.0);
    lightCol *= 3.0 / exp(lightCol * (1.5 + sin(11.53 * time * SPEED)));
    shadowCol *= 1.5 / exp(shadowCol * (1.4 + sin(15.0 * time * SPEED)));

    // finalCol = smoothstep(-0.2, 1.0, finalCol);
    finalCol *= lightCol + shadowCol + 0.2;

    outColor = vec4(finalCol,1.0);
}