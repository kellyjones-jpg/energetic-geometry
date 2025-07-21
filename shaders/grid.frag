// shaders/grid.frag
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_density;
uniform int u_gridType; // 0 = crosshatch, 1 = isometric, 2 = dotted
uniform vec3 u_colors[10];
uniform int u_colorCount;

varying vec2 vTexCoord;

void main() {
  vec2 uv = vTexCoord;
  float d = u_density;

  vec3 color = vec3(0.0);
  int ci = int(mod(floor(uv.x * 10.0 + uv.y * 10.0), float(u_colorCount)));
  color = u_colors[ci];

  float lineWidth = 0.015;

  if (u_gridType == 0) {
    // Crosshatch
    float vLine = step(abs(mod(uv.x * d, 1.0) - 0.5), lineWidth);
    float hLine = step(abs(mod(uv.y * d, 1.0) - 0.5), lineWidth);
    float grid = max(vLine, hLine);
    gl_FragColor = vec4(color * grid, grid);
  }
  else if (u_gridType == 1) {
    // Isometric (diagonal lines)
    float iso1 = step(abs(mod((uv.x + uv.y) * d, 1.0) - 0.5), lineWidth);
    float iso2 = step(abs(mod((uv.x - uv.y) * d, 1.0) - 0.5), lineWidth);
    float grid = max(iso1, iso2);
    gl_FragColor = vec4(color * grid, grid);
  }
  else if (u_gridType == 2) {
    // Dotted matrix
    vec2 cell = fract(uv * d);
    float dist = length(cell - 0.5);
    float dot = step(dist, 0.1);
    gl_FragColor = vec4(color * dot, dot);
  }
  else {
    // fallback to black
    gl_FragColor = vec4(0.0);
  }
}
