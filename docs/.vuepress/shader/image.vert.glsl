attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position.xy, 0.0, 1.0);
  // v_texCoord = a_texCoord;
  v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);    // 变换坐标，不然图像是倒的
}