import React, { Component } from 'react';
import * as T from 'three';
import styled from 'styled-components';
import * as d3 from 'd3'; 

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

    const ambientLight = new T.AmbientLight(0xa8a8a8);
    scene.add(ambientLight);

    const background = Cube({
      width: 1000,
      height: 1000,
      depth: 10,
      color: 0x8f8f8f8f,
      edges: true,
      x: 0,
      y: 0,
      z: 0,
    });
    scene.add(background);

    const spotLight = new T.SpotLight(0xffffff, 0.4);
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

    const cube1 = Cube({ color: 0xfa4444, x: 0,    y: 300,   z: 60, edges: false });
    const cube2 = Cube({ color: 0xfa4444, x: -260, y: -150,  z: 60, edges: false });
    const cube3 = Cube({ color: 0xfa4444, x: 260,  y: -150,  z: 60, edges: false });

    const group = new T.Group();
    group.add(cube1, cube2, cube3);
    scene.add(group);

    window.test = this;
    Object.assign(this, { group, cube1, cube2, cube3 });
  }

  animate(d1=1, d2=1, d3=1) {
    const { group, cube1, cube2, cube3, renderer, scene, camera } = this;
    group.position.z += 0.01;

    const dchange = (d, c) => (c.position.z < 60 || c.position.z > 400)
      ? d * -1
      : d

    d1 = dchange(d1, cube1);
    d2 = dchange(d2, cube2);
    d3 = dchange(d3, cube3);

    cube1.position.z += d1 * 10;
    cube2.position.z += d2 * 10;
    cube3.position.z += d3 * 10;

    if (camera.position.z < 1000) {
      //camera.position.z += 5;
      //camera.position.y += 5;
      //camera.lookAt(0, 0, 0);
    } else {
    }

    renderer.render(scene, camera);

    requestAnimationFrame(this.animate.bind(this, d1, d2, d3));
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
