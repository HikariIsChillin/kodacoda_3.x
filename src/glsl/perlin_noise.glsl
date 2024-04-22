uint hash(uint x, uint seed) {
    const uint m = 0x5bd1e995U;
    uint hash = seed;
    // process input
    uint k = x;
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
    // some final mixing
    hash ^= hash >> 13;
    hash *= m;
    hash ^= hash >> 15;
    return hash;
}

uint hash(uvec2 x, uint seed){
    const uint m = 0x5bd1e995U;
    uint hash = seed;
    // process first vector element
    uint k = x.x; 
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
    // process second vector element
    k = x.y; 
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
	// some final mixing
    hash ^= hash >> 13;
    hash *= m;
    hash ^= hash >> 15;
    return hash;
}

vec2 gradientDirection(uint hash) {
    switch (int(hash) & 3) { // look at the last two bits to pick a gradient direction
    case 0:
        return vec2(1.0, 1.0);
    case 1:
        return vec2(-1.0, 1.0);
    case 2:
        return vec2(1.0, -1.0);
    case 3:
        return vec2(-1.0, -1.0);
    }
}

float interpolate(float value1, float value2, float value3, float value4, vec2 t) {
    return mix(mix(value1, value2, t.x), mix(value3, value4, t.x), t.y);
}

vec2 fade(vec2 t) {
    // 6t^5 - 15t^4 + 10t^3
	return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlinNoise(vec2 uv, uint seed) {
    vec2 floorUV = floor(uv);
    vec2 fractUV = fract(uv);
    uvec2 cellCoordinates = uvec2(floorUV);
    float value1 = dot(gradientDirection(hash(cellCoordinates, seed)), fractUV);
    float value2 = dot(gradientDirection(hash(cellCoordinates + uvec2(1,0), seed)), fractUV - vec2(1.0, 0.0));
    float value3 = dot(gradientDirection(hash(cellCoordinates + uvec2(0,1), seed)), fractUV - vec2(0.0, 1.0));
    float value4 = dot(gradientDirection(hash(cellCoordinates + uvec2(1,1), seed)), fractUV - vec2(1.0, 1.0));
    return interpolate(value1, value2, value3, value4, fade(fractUV));
}

float perlinNoise(vec2 uv, int frequency, int octaveCount, float persistence, float lacunarity, uint seed) {
    float value = 0.0;
    float amplitude= 1.0;
    float currentFrequency = float(frequency);
    uint currentSeed = seed;
    for (int i = 0; i < octaveCount; i++) {
        currentSeed = hash(currentSeed, 0x0U);
        value += perlinNoise(uv * currentFrequency, currentSeed) * amplitude;
        amplitude *= persistence;
        currentFrequency *= lacunarity;
    }
    return value;
}

// default seed
float perlinNoise(vec2 uv, int frequency, int octaveCount, float persistence, float lacunarity) {
    return perlinNoise(uv, frequency, octaveCount, persistence, lacunarity, 0x578437adU);
}

// default persistence to 0.5 and lacunarity to 2.0
float perlinNoise(vec2 uv, int frequency, int octaveCount, uint seed) {
    return perlinNoise(uv, frequency, octaveCount, 0.5, 2.0, seed);
}

// default seed, persistence to 0.5 and lacunarity to 2.0
float perlinNoise(vec2 uv, int frequency, int octaveCount) {
    return perlinNoise(uv, frequency, octaveCount, 0.5, 2.0, 0x578437adU);
}