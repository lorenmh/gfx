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

const PI2 = Math.PI*2;


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
    scene.background = new T.Color(0x051231);

    const directionalLight = new T.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(0, 200, 1000).normalize();
    scene.add(directionalLight);

    const ambientLight = new T.AmbientLight(0xcccccc);
    scene.add(ambientLight);

    const background = Box({
      width: 3000,
      height: 3000,
      depth: 10,
      // color: 0x8f8f8f8f,
       color: 0x000827,
      //edges: true,
      x: 0,
      y: 100,
      z: -200,
    });
    scene.add(background);

    const spotLight = new T.SpotLight(0xffffff, 0.5);
    spotLight.castShadow = true;
    spotLight.position.set(0, 50, 1200);
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

    //scene.add(new T.AxesHelper(5));

    window.d3 = d3;

    Object.assign(this, { scene, camera, renderer });
  }

  populateScene() {
    const { scene }  = this;

    const colors = d3.schemeSet3.map(s => parseInt(s.slice(1), 16));
    const color = i => colors[Math.floor(Math.random()*10)];

    const ribbons = [...Array(20)]
      .map((_, i) => Ribbon({ color: color(i), data: rdata(), y: 1000 - 100*i }))
    ;

    scene.add.apply(scene, ribbons);

    Object.assign(this, { ribbons });
  }

  animate(i) {
    const { camera, renderer, scene, ribbons } = this;

    ribbons.forEach((r, $i) => {
      r.position.z = (
        ((Math.sin((i * PI2 / 100) + ($i * PI2 / 10)) + 1) * 8)
      ) + 100;
    });

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

    requestAnimationFrame(this.animate.bind(this, ++i % 100));
  }

  componentDidMount() {
    this.initialize();
    this.populateScene();
    this.animate(0);
  }

  render() {
    return <StyledViewWrapper ref={this.viewRef} />;
  }
}
