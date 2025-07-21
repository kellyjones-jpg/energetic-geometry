// grid.frag — Fragment Shader
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform float u_density;
uniform int u_gridType;
uniform vec3 u_colors[10];
uniform int u_colorCount;

vec3 getColor(int index) {
  if (index == 0) return u_colors[0];
  else if (index == 1) return u_colors[1];
  else if (index == 2) return u_colors[2];
  else if (index == 3) return u_colors[3];
  else if (index == 4) return u_colors[4];
  else if (index == 5) return u_colors[5];
  else if (index == 6) return u_colors[6];
  else if (index == 7) return u_colors[7];
  else if (index == 8) return u_colors[8];
  else if (index == 9) return u_colors[9];
  return vec3(1.0); // fallback color (white)
}

void main() {
  vec2 uv = fract(vTexCoord * u_density);
  float threshold = 0.03;
  vec3 color = vec3(0.0);

  // Choose color based on a hash of coordinates
  int ci = int(mod(floor(vTexCoord.x * 10.0 + vTexCoord.y * 10.0), float(u_colorCount)));
  color = getColor(ci);

  float alpha = 0.0;

  if (u_gridType == 0) {
    // Crosshatch
    if (uv.x < threshold || uv.y < threshold) alpha = 1.0;
  } else if (u_gridType == 1) {
    // Isometric (approximate)
    float s = 1.73205; // sqrt(3)
    float fx = fract((vTexCoord.x + vTexCoord.y) * s * u_density);
    float fy = fract((vTexCoord.x - vTexCoord.y) * s * u_density);
    if (fx < threshold || fy < threshold) alpha = 1.0;
  } else if (u_gridType == 2) {
    // Dotted matrix
    float dx = abs(uv.x - 0.5);
    float dy = abs(uv.y - 0.5);
    if (dx < 0.04 && dy < 0.04) alpha = 1.0;
  }

  gl_FragColor = vec4(color, alpha);
}
