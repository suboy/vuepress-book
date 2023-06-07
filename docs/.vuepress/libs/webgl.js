export function setTexture(gl, image) {
  var texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)    // 水平重复方式
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)    // 垂直重复方式
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)       // 缩小过滤方式
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)       // 放大过滤方式
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)  // 纹理数据上传到GPU
}

export function createProgram(gl, vertexSrc, fragmentSrc){
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)    // 创建顶点着色器
  gl.shaderSource(vertexShader, vertexSrc)          // 绑定顶点着色器源码
  gl.compileShader(vertexShader)                    // 编译定点着色器
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)  // 创建片段着色器
  gl.shaderSource(fragmentShader, fragmentSrc)      // 绑定片段着色器源码
  gl.compileShader(fragmentShader)                  // 编译片段着色器
  const program = gl.createProgram()                // 创建着色器程序
  gl.attachShader(program, vertexShader)            // 指定顶点着色器
  gl.attachShader(program, fragmentShader)          // 指定片段着色色器
  gl.linkProgram(program)                           // 链接程序
  gl.useProgram(program)                            // 使用着色器
  gl.program = program
  return program
}

export function setAttribute(gl, program, name, data, options) {
  const attr = gl.getAttribLocation(program, name)  // 获取程序变量
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, options.usage||gl.STATIC_DRAW)   // 设置变量值
  gl.enableVertexAttribArray(attr)      // 启用变量
  gl.vertexAttribPointer(  // 设置变量属性
    attr,
    options.size,               // attribute的分量数 1,2,3,4
    options.type||gl.FLOAT,     // attribute数据类型
    options.normalize||false,   // 是否归一化
    options.stride||0,          // 每个顶点数据占用的字节数
    options.offset||0)          // 顶点数据在缓冲区中的偏移量
}

export function setUniform(gl, program, typeSuffix, name, ...values) {
  const func = gl['uniform'+typeSuffix]
  func && func.call(gl, gl.getUniformLocation(program, name), ...values)
}

export function resetWebgl(gl) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
}