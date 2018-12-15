import React, { Component } from 'react';
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

export default class View extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
  }

  draw() {
    if (!this.myRef)
      return;
  }

  render() {
    return (
      <canvas />
    );
  }
}
