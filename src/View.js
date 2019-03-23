import React, { Component } from 'react';
import * as T from 'three';
import styled from 'styled-components';
import * as d3 from 'd3'; 

import Box from './models/Box';
import Ribbon from './models/Ribbon';

const StyledViewWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: green;
`;


const rdata = () => [...Array(100)]
  .map((_, i) => [i, Math.log(Math.random()*10)])
;

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
    directionalLight.position.set(0, 200, 1000).normalize();
    scene.add(directionalLight);

    const ambientLight = new T.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);

    const background = Box({
      width: 2000,
      height: 2000,
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

    camera.position.set(0, -2000, 100);
    camera.lookAt(0, 0, 0);

    scene.add(new T.AxesHelper(5));

    window.d3 = d3;

    Object.assign(this, { scene, camera, renderer });
  }

  populateScene() {
    const { scene }  = this;

    const colors = d3.schemeSet3.map(s => parseInt(s.slice(1), 16));

    const ribbons = [...Array(10)]
      .map((_, i) => Ribbon({ color: colors[i], data: rdata(), y: 900 - 200*i }))
    ;
    scene.add.apply(scene, ribbons);

    const box1 = Box({ color: 0xfa4444, x: 0,    y: 300,   z: 60, edges: false });
    const box2 = Box({ color: 0xfa4444, x: -260, y: -150,  z: 60, edges: false });
    const box3 = Box({ color: 0xfa4444, x: 260,  y: -150,  z: 60, edges: false });

    const group = new T.Group();
    //group.add(box1, box2, box3);
    //scene.add(group);

    window.test = this;
    Object.assign(this, { group, box1, box2, box3 });
  }

  animate(d1=1, d2=1, d3=1) {
    const { group, box1, box2, box3, renderer, scene, camera } = this;
    group.position.z += 0.01;

    const dchange = (d, {position: {z}}) => (z < 60 || z > 400)
      ? d * -1
      : d
    ;

    

    // d1 = dchange(d1, box1);
    // d2 = dchange(d2, box2);
    // d3 = dchange(d3, box3);

    // box1.position.z += d1 * 10;
    // box2.position.z += d2 * 10;
    // box3.position.z += d3 * 10;

    if (camera.position.y < 0) {
      camera.position.z += 4;
      camera.position.y += 5;
      camera.lookAt(0, 0, 0);
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
