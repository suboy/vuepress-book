import texVertRaw from '../shader/tex.vert.glsl?raw'
import dropFragRaw from '../shader/drop.frag.glsl?raw'
import updateFragRaw from '../shader/update.frag.glsl?raw'
import renderVertRaw from '../shader/render.vert.glsl?raw'
import renderFragRaw from '../shader/render.frag.glsl?raw'

function isPercentage(str) {
  return str[str.length - 1] == '%';
}

function createImageData(width, height) {
  try {
    return new ImageData(width, height);
  }
  catch (e) {
    // Fallback for IE
    const canvas = document.createElement('canvas');
    return canvas.getContext('2d').createImageData(width, height);
  }
}

function translateBackgroundPosition(value) {
  const parts = value.split(' ');
  if (parts.length === 1) {
    switch (value) {
      case 'center':
        return ['50%', '50%'];
      case 'top':
        return ['50%', '0'];
      case 'bottom':
        return ['50%', '100%'];
      case 'left':
        return ['0', '50%'];
      case 'right':
        return ['100%', '50%'];
      default:
        return [value, '50%'];
    }
  }
  else {
    return parts.map(function(part) {
      switch (value) {
        case 'center':
          return '50%';
        case 'top':
        case 'left':
          return '0';
        case 'right':
        case 'bottom':
          return '100%';
        default:
          return part;
      }
    });
  }
}

function extractUrl(value) {
  const urlMatch = /url\(["']?([^"']*)["']?\)/.exec(value);
  if (urlMatch == null) {
    return null;
  }
  return urlMatch[1];
}

function isDataUri(url) {
  return url.match(/^data:/);
}

function isPowerOfTwo(x) {    // 2的倍数
  return (x & (x - 1)) == 0;
}

export default class WaterRipple {
  static #config = null
  static defaultOptions = {
    imageUrl: null,
    resolution: 256,
    dropRadius: 20,
    perturbance: 0.03,
    interactive: true,
    crossOrigin: '',
    rain: true
  }
  static #loadConfig() {
    const canvas = document.createElement('canvas');
    const webgl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!webgl) {
      // Browser does not support WebGL.
      return null;
    }
    // Load extensions
    const extensions = {};
    [
      'OES_texture_float',
      'OES_texture_half_float',
      'OES_texture_float_linear',
      'OES_texture_half_float_linear'
    ].forEach((name)=>{
      const extension = webgl.getExtension(name);
      if (extension) {
        extensions[name] = extension;
      }
    });
    // If no floating point extensions are supported we can bail out early.
    if (!extensions.OES_texture_float) {
      return null;
    }
    const configs = [];
    function createConfig(type, glType, arrayType) {
      const name = 'OES_texture_' + type;
      const nameLinear = name + '_linear';
      const linearSupport = nameLinear in extensions
      const configExtensions = [name];
      if (linearSupport) {
        configExtensions.push(nameLinear);
      }
      return {
        type: glType,
        arrayType: arrayType,
        linearSupport: linearSupport,
        extensions: configExtensions
      };
    }
    configs.push(
      createConfig('float', webgl.FLOAT, Float32Array)
    );
    if (extensions.OES_texture_half_float) {
      configs.push(
        // Array type should be Uint16Array, but at least on iOS that breaks. In that case we
        // just initialize the textures with data=null, instead of data=new Uint16Array(...).
        // This makes initialization a tad slower, but it's still negligible.
        createConfig('half_float', extensions.OES_texture_half_float.HALF_FLOAT_OES, null)
      );
    }
    // Setup the texture and framebuffer
    const texture = webgl.createTexture();
    const framebuffer = webgl.createFramebuffer();
    webgl.bindFramebuffer(webgl.FRAMEBUFFER, framebuffer);
    webgl.bindTexture(webgl.TEXTURE_2D, texture);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
    // Check for each supported texture type if rendering to it is supported
    for (var i = 0; i < configs.length; i++) {
      webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, 32, 32, 0, webgl.RGBA, configs[i].type, null);
      webgl.framebufferTexture2D(webgl.FRAMEBUFFER, webgl.COLOR_ATTACHMENT0, webgl.TEXTURE_2D, texture, 0);
      if (webgl.checkFramebufferStatus(webgl.FRAMEBUFFER) === webgl.FRAMEBUFFER_COMPLETE) {
        this.#config = configs[i];
        return configs[i];
      }
    }
  }
  static initRipples(el, option) {
    const opt = Object.assign({}, WaterRipple.defaultOptions, option)
    const ripple =  new WaterRipple(el, opt)
    // setTimeout(()=>{
      const dropping = ()=>{    // 自动滴水
        var x = Math.random() * el.offsetWidth;
        var y = Math.random() * el.offsetHeight;
        var dropRadius = 20;
        var strength = 0.04 + Math.random() * 0.04;
        if(ripple.running){
          ripple.drop(x, y, dropRadius, strength);
        }
        setTimeout(dropping, 1000);
      }
      if(opt.rain){
        dropping()
      }
    // }, 0)
    return ripple
  }
  context = null
  createProgram(vertexSource, fragmentSource, uniformValues) {
    function compileSource(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error('compile error: ' + gl.getShaderInfoLog(shader));
      }
      return shader;
    }
    const gl = this.context
    const program = {};
    program.id = gl.createProgram();
    gl.attachShader(program.id, compileSource(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program.id, compileSource(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program.id);
    if (!gl.getProgramParameter(program.id, gl.LINK_STATUS)) {
      throw new Error('link error: ' + gl.getProgramInfoLog(program.id));
    }
    // Fetch the uniform and attribute locations
    program.uniforms = {};
    program.locations = {};
    gl.useProgram(program.id);
    gl.enableVertexAttribArray(0);
    var match, name, regex = /uniform (\w+) (\w+)/g, shaderCode = vertexSource + fragmentSource;
    while ((match = regex.exec(shaderCode)) != null) {
      name = match[2];
      program.locations[name] = gl.getUniformLocation(program.id, name);
    }
    return program;
  }
  bindTexture(texture, unit) {
    const gl = this.context
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }
  constructor(el, options) {
    if(!this.constructor.#config){
      this.constructor.#loadConfig()
    }
    const config = this.constructor.#config;
    const that = this;
    this.el = el
    this.elCss = window.getComputedStyle(el, null)
    Object.assign(el.style, {
      position: 'relative',
      zIndex: 0,
      backgroundSize: 'cover',
      backgroundPosition: 'center bottom',
      backgroundRepeat: 'no-repeat',
    })
    // Init properties from options
    this.interactive = options.interactive;
    this.resolution = options.resolution;
    this.textureDelta = new Float32Array([1 / this.resolution, 1 / this.resolution]);
    this.perturbance = options.perturbance;
    this.dropRadius = options.dropRadius;
    this.crossOrigin = options.crossOrigin;
    this.imageUrl = options.imageUrl;
    // Init WebGL canvas
    var canvas = document.createElement('canvas');
    canvas.width = this.el.offsetWidth;
    canvas.height = this.el.offsetHeight;
    this.canvas = canvas;
    Object.assign(this.canvas.style, {
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      zIndex: -1
    })
    this.el.appendChild(canvas);
    this.context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const gl = this.context
    // console.log(gl)
    // Load extensions
    config.extensions.forEach((name)=>{
      gl.getExtension(name);
    });
    // Auto-resize when window size changes.
    this.updateSize = this.updateSize.bind(this)
    window.addEventListener('resize', this.updateSize);
    // Init rendertargets for ripple data.
    this.textures = [];
    this.frameBuffers = [];
    this.bufferWriteIndex = 0;
    this.bufferReadIndex = 1;
    const arrayType = config.arrayType
    const textureData = arrayType ? new arrayType(this.resolution * this.resolution * 4) : null;
    for (var i = 0; i < 2; i++) {
      const texture = gl.createTexture();
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, config.linearSupport ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, config.linearSupport ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.resolution, this.resolution, 0, gl.RGBA, config.type, textureData);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      this.textures.push(texture);
      this.frameBuffers.push(framebuffer);
    }
    // Init GL stuff
    this.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, +1, -1,
      +1, +1, -1, +1
    ]), gl.STATIC_DRAW);
    this.initShaders();
    this.initTexture();
    // this.setTransparentTexture();
    this.loadImage();
    // Set correct clear color and blend mode (regular alpha blending)
    gl.clearColor(0, 0, 0, 0);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // Plugin is successfully initialized!
    this.visible = true;
    this.running = true;
    this.inited = true;
    this.destroyed = false;
    this.setupPointerEvents();
    // Init animation
    function step() {
      if (!that.destroyed) {
        that.step();
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }
  setupPointerEvents() {
    const that = this;
    function dropAtPointer(pointer, big) {
      if (that.visible && that.running && that.interactive) {
        that.dropAtPointer(
          pointer,
          that.dropRadius * (big ? 1.5 : 1),
          (big ? 0.14 : 0.01)
        );
      }
    }
    // Start listening to pointer events
    this.el.addEventListener('mousemove', (e)=>{
      dropAtPointer(e);
    })
    this.el.addEventListener('mousedown', (e)=>{
      dropAtPointer(e, true);
    });

    // touch触屏
    // this.el.addEventListener('touchmove', (e)=>{
    //   const touches = e.originalEvent.changedTouches;
    //   for (var i = 0; i < touches.length; i++) {
    //     dropAtPointer(touches[i]);
    //   }
    // })
    // this.el.addEventListener('touchstart', (e)=>{
    //   const touches = e.originalEvent.changedTouches;
    //   for (var i = 0; i < touches.length; i++) {
    //     dropAtPointer(touches[i]);
    //   }
    // })
  }
  loadImage() {
    const that = this;
    let gl = this.context;
    const newImageSource = this.imageUrl ||
      extractUrl(this.originalCssBackgroundImage) ||
      extractUrl(this.elCss.getPropertyValue('background-image'));
    // If image source is unchanged, don't reload it.
    if (newImageSource == this.imageSource) {
      return;
    }
    this.imageSource = newImageSource;
    // Falsy source means no background.
    if (!this.imageSource) {
      this.setTransparentTexture();
      return;
    }
    // Load the texture from a new image.
    const image = new Image;
    image.onload = function() {
      gl = that.context;
      // Only textures with dimensions of powers of two can have repeat wrapping.
      var wrapping = (isPowerOfTwo(image.width) && isPowerOfTwo(image.height)) ? gl.REPEAT : gl.CLAMP_TO_EDGE;
      gl.bindTexture(gl.TEXTURE_2D, that.backgroundTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapping);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapping);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      that.backgroundWidth = image.width;
      that.backgroundHeight = image.height;
      // Hide the background that we're replacing.
      that.hideCssBackground();
    };
    // Fall back to a transparent texture when loading the image failed.
    image.onerror = function() {
      gl = that.context;
      that.setTransparentTexture();
    };
    // Disable CORS when the image source is a data URI.
    image.crossOrigin = isDataUri(this.imageSource) ? null : this.crossOrigin;
    image.src = this.imageSource;
  }
  step() {
    if (!this.visible) {
      return;
    }
    this.computeTextureBoundaries();
    if (this.running) {
      this.update();
    }
    this.render();
  }
  drawQuad() {
    const gl = this.context
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }
  render() {
    const gl = this.context
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.enable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.renderProgram.id);
    this.bindTexture(this.backgroundTexture, 0);
    this.bindTexture(this.textures[0], 1);
    gl.uniform1f(this.renderProgram.locations.perturbance, this.perturbance);
    gl.uniform2fv(this.renderProgram.locations.topLeft, this.renderProgram.uniforms.topLeft);
    gl.uniform2fv(this.renderProgram.locations.bottomRight, this.renderProgram.uniforms.bottomRight);
    gl.uniform2fv(this.renderProgram.locations.containerRatio, this.renderProgram.uniforms.containerRatio);
    gl.uniform1i(this.renderProgram.locations.samplerBackground, 0);
    gl.uniform1i(this.renderProgram.locations.samplerRipples, 1);
    this.drawQuad();
    gl.disable(gl.BLEND);
  }
  update() {
    const gl = this.context
    gl.viewport(0, 0, this.resolution, this.resolution);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[this.bufferWriteIndex]);
    this.bindTexture(this.textures[this.bufferReadIndex]);
    gl.useProgram(this.updateProgram.id);
    this.drawQuad();
    this.swapBufferIndices();
  }
  swapBufferIndices() {
    this.bufferWriteIndex = 1 - this.bufferWriteIndex;
    this.bufferReadIndex = 1 - this.bufferReadIndex;
  }
  computeTextureBoundaries() {
    var backgroundSize = this.elCss.getPropertyValue('background-size');
    var backgroundAttachment = this.elCss.getPropertyValue('background-attachment');
    var backgroundPosition = translateBackgroundPosition(this.elCss.getPropertyValue('background-position'));
    // Here the 'container' is the element which the background adapts to
    // (either the chrome window or some element, depending on attachment)
    var container;
    if (backgroundAttachment == 'fixed') {
      container = { left: window.pageXOffset, top: window.pageYOffset };
      container.width = window.innerWidth;
      container.height = window.innerHeight;
    }
    else {
      container = { left: this.el.offsetLeft, top: this.el.offsetTop };
      container.width = this.el.offsetWidth;
      container.height = this.el.offsetHeight;
    }
    // TODO: background-clip
    if (backgroundSize == 'cover') {
      var scale = Math.max(container.width / this.backgroundWidth, container.height / this.backgroundHeight);
      var backgroundWidth = this.backgroundWidth * scale;
      var backgroundHeight = this.backgroundHeight * scale;
    }
    else if (backgroundSize == 'contain') {
      var scale = Math.min(container.width / this.backgroundWidth, container.height / this.backgroundHeight);
      var backgroundWidth = this.backgroundWidth * scale;
      var backgroundHeight = this.backgroundHeight * scale;
    }
    else {
      backgroundSize = backgroundSize.split(' ');
      var backgroundWidth = backgroundSize[0] || '';
      var backgroundHeight = backgroundSize[1] || backgroundWidth;
      if (isPercentage(backgroundWidth)) {
        backgroundWidth = container.width * parseFloat(backgroundWidth) / 100;
      }
      else if (backgroundWidth != 'auto') {
        backgroundWidth = parseFloat(backgroundWidth);
      }
      if (isPercentage(backgroundHeight)) {
        backgroundHeight = container.height * parseFloat(backgroundHeight) / 100;
      }
      else if (backgroundHeight != 'auto') {
        backgroundHeight = parseFloat(backgroundHeight);
      }
      if (backgroundWidth == 'auto' && backgroundHeight == 'auto') {
        backgroundWidth = this.backgroundWidth;
        backgroundHeight = this.backgroundHeight;
      }
      else {
        if (backgroundWidth == 'auto') {
          backgroundWidth = this.backgroundWidth * (backgroundHeight / this.backgroundHeight);
        }
        if (backgroundHeight == 'auto') {
          backgroundHeight = this.backgroundHeight * (backgroundWidth / this.backgroundWidth);
        }
      }
    }
    // Compute backgroundX and backgroundY in page coordinates
    var backgroundX = backgroundPosition[0];
    var backgroundY = backgroundPosition[1];
    if (isPercentage(backgroundX)) {
      backgroundX = container.left + (container.width - backgroundWidth) * parseFloat(backgroundX) / 100;
    }
    else {
      backgroundX = container.left + parseFloat(backgroundX);
    }
    if (isPercentage(backgroundY)) {
      backgroundY = container.top + (container.height - backgroundHeight) * parseFloat(backgroundY) / 100;
    }
    else {
      backgroundY = container.top + parseFloat(backgroundY);
    }
    var elementOffset = { left: this.el.offsetLeft, top: this.el.offsetTop };
    this.renderProgram.uniforms.topLeft = new Float32Array([
      (elementOffset.left - backgroundX) / backgroundWidth,
      (elementOffset.top - backgroundY) / backgroundHeight
    ]);
    this.renderProgram.uniforms.bottomRight = new Float32Array([
      this.renderProgram.uniforms.topLeft[0] + this.el.offsetWidth / backgroundWidth,
      this.renderProgram.uniforms.topLeft[1] + this.el.offsetHeight / backgroundHeight
    ]);
    var maxSide = Math.max(this.canvas.width, this.canvas.height);
    this.renderProgram.uniforms.containerRatio = new Float32Array([
      this.canvas.width / maxSide,
      this.canvas.height / maxSide
    ]);
  }
  initShaders() {
    const gl = this.context
    const vertexShader = texVertRaw;
    this.dropProgram = this.createProgram(vertexShader, dropFragRaw);
    this.updateProgram = this.createProgram(vertexShader, updateFragRaw);
    gl.uniform2fv(this.updateProgram.locations.delta, this.textureDelta);
    this.renderProgram = this.createProgram(renderVertRaw, renderFragRaw);
    gl.uniform2fv(this.renderProgram.locations.delta, this.textureDelta);
  }
  initTexture() {
    const gl = this.context
    this.backgroundTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  setTransparentTexture() {
    const gl = this.context
    const transparentPixels = createImageData(32, 32);
    gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, transparentPixels);
  }
  hideCssBackground() {
    // Check whether we're changing inline CSS or overriding a global CSS rule.
    var inlineCss = this.elCss.getPropertyValue('background-image');
    if (inlineCss == 'none') {
      return;
    }
    this.originalInlineCss = inlineCss;
    this.originalCssBackgroundImage = this.elCss.getPropertyValue('background-image');
    this.elCss.getPropertyValue('background-image', 'none');
  }
  restoreCssBackground() {
    // Restore background by either changing the inline CSS rule to what it was, or
    // simply remove the inline CSS rule if it never was inlined.
    this.elCss.getPropertyValue('background-image', this.originalInlineCss || '');
  }
  dropAtPointer(pointer, radius, strength) {
    var borderLeft = parseInt(this.elCss.getPropertyValue('border-left-width')) || 0,
        borderTop = parseInt(this.elCss.getPropertyValue('border-top-width')) || 0;
    this.drop(
      pointer.pageX - this.el.offsetLeft - borderLeft,
      pointer.pageY - this.el.offsetTop - borderTop,
      radius,
      strength
    );
  }
  drop(x, y, radius, strength) {
    const gl = this.context
    var elWidth = this.el.offsetWidth;
    var elHeight = this.el.offsetHeight;
    var longestSide = Math.max(elWidth, elHeight);
    radius = radius / longestSide;
    var dropPosition = new Float32Array([
      (2 * x - elWidth) / longestSide,
      (elHeight - 2 * y) / longestSide
    ]);
    gl.viewport(0, 0, this.resolution, this.resolution);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[this.bufferWriteIndex]);
    this.bindTexture(this.textures[this.bufferReadIndex]);
    gl.useProgram(this.dropProgram.id);
    gl.uniform2fv(this.dropProgram.locations.center, dropPosition);
    gl.uniform1f(this.dropProgram.locations.radius, radius);
    gl.uniform1f(this.dropProgram.locations.strength, strength);
    this.drawQuad();
    this.swapBufferIndices();
  }
  updateSize() {
    var newWidth = this.el.offsetWidth,
        newHeight = this.el.offsetHeight;
    if (newWidth != this.canvas.width || newHeight != this.canvas.height) {
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;
    }
  }
  destroy() {
    // this.$el
    //   .off('.ripples')
    //   .removeData('ripples');
    // Make sure the last used context is garbage-collected
    this.context = null
    window.removeEventListener('resize', this.updateSize);
    this.el.removeChild(this.canvas);
    this.restoreCssBackground();
    this.destroyed = true;
  }
  show() {
    this.visible = true;
    this.canvas.style.display=='';
    this.hideCssBackground();
  }
  hide() {
    this.visible = false;
    this.canvas.style.display=='none';
    this.restoreCssBackground();
  }
  pause() {
    this.running = false;
  }
  play() {
    this.running = true;
  }
  set(property, value) {
    switch (property) {
      case 'dropRadius':
      case 'perturbance':
      case 'interactive':
      case 'crossOrigin':
        this[property] = value;
        break;
      case 'imageUrl':
        this.imageUrl = value;
        this.loadImage();
        break;
    }
  }
}