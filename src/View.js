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
    scene.background = new T.Color(0xeaeaea);

    const directionalLight = new T.DirectionalLight(0xffffff, 0.1);
    directionalLight.position.set(0, 0, 1000).normalize();
    scene.add(directionalLight);

    const ambientLight = new T.AmbientLight(0xd8d8d8);
    scene.add(ambientLight);

    const background = Cube({
      width: 1000,
      height: 1000,
      depth: 1,
      color: 0x8f8f8f8f,
      edges: true,
      x: 0,
      y: 0,
      z: 0,
    });
    scene.add(background);

    const spotLight = new T.SpotLight(0xffffff, 0.1);
    spotLight.castShadow = true;
    spotLight.position.set(0, 0, 1000);
    spotLight.angle = Math.PI / 3
    spotLight.shadow.camera.near = 200;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.mapSize.width = 4096;
    spotLight.shadow.mapSize.height = 4096;
    spotLight.target = background;
    scene.add(spotLight);


    const camera = new T.PerspectiveCamera(90, width/height, 1, 10000);
    const renderer = new T.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFShadowMap;
    renderer.setSize(width, height);
    viewEl.appendChild(renderer.domElement);

    camera.position.set(0, -1000, 500);
    camera.lookAt(0, 0, 0);

    scene.add(new T.AxesHelper(5));

    Object.assign(this, { scene, camera, renderer });
  }

  populateScene() {
    const { scene }  = this;

    const cube1 = Cube({ color: 0xfa4444, x: 0,    y: 300,   z: 50, edges: false });
    const cube2 = Cube({ color: 0xfa4444, x: -260, y: -150,  z: 50, edges: false });
    const cube3 = Cube({ color: 0xfa4444, x: 260,  y: -150,  z: 50, edges: false });

    const group = new T.Group();
    group.add(cube1, cube2, cube3);
    scene.add(group);

    window.test = this;
    Object.assign(this, { group, cube1, cube2, cube3 });
  }

  animate() {
    const { group, cube1, cube2, cube3, renderer, scene, camera } = this;
    requestAnimationFrame(this.animate);
    group.rotation.z += 0.01;
    cube1.rotation.z -= 0.005;
    cube2.rotation.z -= 0.005;
    cube3.rotation.z -= 0.005;
    if (camera.position.z < 1000) {
      camera.position.z += 5;
      camera.position.y += 5;
      camera.lookAt(0, 0, 0);
    } else {
    }

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
