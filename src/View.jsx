import React, { Component, Fragment } from 'react';
import styled from 'styled-components';

const StyledCanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: green;


  & > canvas {
    width: 100%;
    height: 100%;
  }
`;

const vertexShaderSource = `
  attribute vec3 positionAttr;
  attribute vec4 colorAttr;

  varying vec4 vColor;

  void main(void) {
    gl_Position = vec4(positionAttr, 1.0);
    vColor = colorAttr;
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  varying vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;

export default class View extends Component {
  constructor(props) {
    super(props);

    this.vertexRef = React.createRef();
    this.fragmentRef = React.createRef();
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    this.draw();
  }

  draw() {
    if (!this.canvasRef || !this.vertexRef || !this.fragmentRef) return;

    const canvasEl = this.canvasRef.current;
    const vertexEl = this.vertexRef.current;
    const fragmentEl = this.fragmentRef.current;

    let gl;

    try {
      gl = canvasEl.getContext('webgl');

      if (!gl) {
        gl = canvasEl.getContext('experimental-webgl');
      }
    } catch(e) {
      return console.log('gl not created');
    }

    gl.viewportWidth = canvasEl.width;
    gl.viewportHeight = canvasEl.height;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexEl.text);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      return console.error(gl.getShaderInfoLog(vertexShader));
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentEl.text);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      return console.error(gl.getShaderInfoLog(fragmentShader));
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return console.log("could not initialise shaders");
    }

    gl.useProgram(program);

    program.positionAttr = gl.getAttribLocation(program, 'positionAttr');
    gl.enableVertexAttribArray(program.positionAttr);

    program.colorAttr = gl.getAttribLocation(program, 'colorAttr');
    gl.enableVertexAttribArray(program.colorAttr);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const vertexData = [
        // X    Y     Z     R     G     B     A
        0.0,   0.8,  0.0,  1.0,  0.0,  0.0,  1.0,
        // X    Y     Z     R     G     B     A
        -0.8, -0.8,  0.0,  0.0,  1.0,  0.0,  1.0,
        // X    Y     Z     R     G     B     A
        0.8,  -0.8,  0.0,  0.0,  0.0,  1.0,  1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.disable(gl.DEPTH_TEST);

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const stride = 7 * Float32Array.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(
      program.positionAttr,
      3,
      gl.FLOAT,
      false,
      stride,
      0
    );

    gl.vertexAttribPointer(
      program.colorAttr,
      4,
      gl.FLOAT,
      false,
      stride,
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  render() {
    return (
      <Fragment>
        <script ref={this.vertexRef} type="x-shader/x-vertex">
          {vertexShaderSource}
        </script>

        <script ref={this.fragmentRef} type="x-shader/x-fragment">
          {fragmentShaderSource}
        </script>

        <StyledCanvasWrapper>
          <canvas ref={this.canvasRef} />
        </StyledCanvasWrapper>
      </Fragment>
    );
  }
}
