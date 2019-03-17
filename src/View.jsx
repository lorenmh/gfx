import React, { Component } from 'react';
import * as T from 'three';
import styled from 'styled-components';

const StyledViewWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: green;
`;

export default class View extends Component {
  constructor(props) {
    super(props);

    this.viewRef = React.createRef();
  }

  initialize() {
    const viewEl = this.viewRef.current;
    const { width, height } =  viewEl.getBoundingClientRect();

    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(75, width/height, 0.1, 1000);
    this.renderer = new T.WebGLRenderer();
    this.renderer.setSize(width, height);
    viewEl.appendChild(this.renderer.domElement);
  }

  draw() {
    const { camera, scene, renderer } = this;

    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    const material = new T.LineBasicMaterial({color: 0xff0000});

    const geometry = new T.Geometry();
    geometry.vertices.push(new T.Vector3(-10, 0, 0));
    geometry.vertices.push(new T.Vector3(0, 10, 0));
    geometry.vertices.push(new T.Vector3(10, 0, 0));

    const line = new T.Line(geometry, material);

    scene.add(line);
    renderer.render(scene, camera);
  }

  componentDidMount() {
    this.initialize();
    this.draw();
  }

  render() {
    return <StyledViewWrapper ref={this.viewRef} />;
  }
}
