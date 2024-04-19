#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"
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

vec3 blurCircle(in vec3 color, in vec2 uv, in vec2 pos, in float scale) {
    uv -= pos;
    uv /= scale;

    float d = 1. - distance(vec2(0.), uv);

    return color * d;
}


/*
! only for view or rects without radius, will not clip corners

! if view has nodes with shaders that manipulate the destination texture
this should be added to a rect instead of the view

view.add(<Rect size={view.size} shaders={catppuccin} />)
*/
void main() {
    vec2 uv = sourceUV;
    vec3 col = mix(vec3(1.), blurCircle(pink.rgb, uv, vec2(.1,.6), .8), 1.);
    col = max(col, .6 * blurCircle(lightBrown.rgb, uv, vec2(.2,.8), .8));
    col = mix(col, blurCircle(darkBlue.rgb, uv, vec2(.8,.8), 1.), blurCircle(darkBlue.rgb, uv, vec2(.8,.8), 1.).b);
    col += blurCircle(turquoise.rgb, uv, vec2(1.,.3), .9);

    col = max(blurCircle(pink.rgb, uv, vec2(.65, .3), .7) * 1.4, col);

    col = max(col, blurCircle(primaryPurple.rgb, uv, vec2(-.2), 2.));

    col = smoothstep(0.1, 1.5, col);

    vec2 lightUV = (uv - 0.5) * 3.0;
    float lightCol = light(lightUV - sin(time/11.0) / 4.0, 0.0 + time / 75.0, 0.5 * sin(time / 10.0) + 1.0);
    float shadowCol = light(lightUV + cos(time/13.0) / 4.0, PI + time / 75.0 + sin(time/20.0) / 2.0, 0.5 * sin(time / 7.0) + 1.0);
    lightCol *= 3.0 / exp(lightCol * (3.0 + sin(time/13.0)));
    shadowCol *= .5 / exp(shadowCol * (1.4 + sin(time/10.0)));

    col += lightCol;
    col -= shadowCol;
    col = smoothstep(-.1, 1.1, col);

    vec4 source = texture(sourceTexture, uv);

    // draw self and children on top of background
    outColor = mix(vec4(vec3(source.rgb), 1.), vec4(col, 1.), 1. - source.a);
}