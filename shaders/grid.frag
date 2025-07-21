// grid.frag
precision mediump float;

uniform vec2 resolution;
uniform float density;

uniform vec3 color0;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform int colorCount;

uniform int mode;

varying vec2 vTexCoord;

vec3 getColor(int index) {
  if (index == 0) return color0;
  else if (index == 1) return color1;
  else if (index == 2) return color2;
  else if (index == 3) return color3;
  return vec3(1.0); // fallback white
}

void main() {
  vec2 uv = vTexCoord;
  vec2 pixel = uv * resolution;

  float stepSize = density;
  int idx;

  if (mode == 0) {
    // CROSSHATCH
    float x = floor(pixel.x / stepSize);
    float y = floor(pixel.y / stepSize);
    idx = int(mod(x + y, float(colorCount)));
    vec3 col = getColor(idx);

    float lineX = mod(pixel.x, stepSize);
    float lineY = mod(pixel.y, stepSize);

    if (lineX < 1.0 || lineY < 1.0) {
      gl_FragColor = vec4(col, 1.0);
    } else {
      discard;
    }
  } else if (mode == 1) {
    // ISOMETRIC LINES
    float spacing = stepSize;
    float angle = 1.1;

    float fx = mod(pixel.x + pixel.y * angle, spacing);
    float bx = mod(pixel.x - pixel.y * angle, spacing);

    idx = int(mod(floor(pixel.x / stepSize), float(colorCount)));
    vec3 col = getColor(idx);

    if (fx < 1.0 || bx < 1.0) {
      gl_FragColor = vec4(col, 1.0);
    } else {
      discard;
    }
  } else if (mode == 2) {
    // DOTTED GRID
    float x = floor(pixel.x / stepSize);
    float y = floor(pixel.y / stepSize);
    idx = int(mod(x + y, float(colorCount)));
    vec3 col = getColor(idx);

    float dx = mod(pixel.x, stepSize) - stepSize / 2.0;
    float dy = mod(pixel.y, stepSize) - stepSize / 2.0;
    float dist = sqrt(dx * dx + dy * dy);

    if (dist < stepSize * 0.15) {
      gl_FragColor = vec4(col, 1.0);
    } else {
      discard;
    }
  } else {
    // fallback
    gl_FragColor = vec4(1.0);
  }
}
