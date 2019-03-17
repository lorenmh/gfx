import React, { Component } from 'react';
import * as T from 'three';
import styled from 'styled-components';

import Cube from './models/Cube';

const StyledViewWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: green;
`;

export default class View extends Component {
  constructor(props) {
    super(props);

    this.viewRef = React.createRef();
    this.animate = this.animate.bind(this);
  }

  initialize() {
    const viewEl = this.viewRef.current;
    const { width, height } =  viewEl.getBoundingClientRect();

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(75, width/height, 0.1, 1000);
    const renderer = new T.WebGLRenderer();
    renderer.setSize(width, height);
    viewEl.appendChild(renderer.domElement);

    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);

    Object.assign(this, {scene, camera, renderer});
  }

  populateScene() {
    const { scene }  = this;

    const cube = new Cube();

    scene.add(cube.lineSegments);

    window.cube = cube;
    Object.assign(this, { cube });
  }

  animate() {
    const { cube, renderer, scene, camera } = this;
    requestAnimationFrame(this.animate);
    cube.lineSegments.rotation.x += 0.005;
    cube.lineSegments.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  componentDidMount() {
    this.initialize();
    this.populateScene();
    this.animate();
  }

  render() {
    return <StyledViewWrapper ref={this.viewRef} />;
  }
}
