import * as T from 'three';
import * as d3 from 'd3';

import { atoms } from '../utils';

export const TYPE = atoms`
  SOLID

`;

const DEFAULTS = {
  data: [...Array(100)].map((_, i) => [i, Math.log(Math.random()*10)]),
  xFn: ([x]) => x,
  yFn: ([_, y]) => y,
  width: 2000,
  height: 100,
  strokeWidth: 1,
  strokeDepth: 100,
  color: 0xff0000,
  edges: false,
  x: 0,
  y: 0,
  z: 0,
  castShadow: true,
  receiveShadow: true,
};

const strokeWidthPath = w => (p, i, a) => {
  // reference point for stroke
  const [ px, py ] = p;

  // p1 and p2 used to compute normal
  const [ p1, p2 ] = a[i+1] === undefined ? [a[i-1], p] : [p, a[i+1]];

  const [ x1, y1 ] = p1;
  const [ x2, y2 ] = p2;

  // normal
  const [ nx, ny ] = [ y1 - y2, x2 - x1 ];
  const magnitude = Math.hypot(nx, ny);

  // normal vector
  const [ vx, vy ] = [ nx / magnitude, ny / magnitude ];

  // translate stroke
  return [ px + vx * w/2, py + vy * w/2 ];
};

export default function Ribbon($) {
  $ = Object.assign({}, DEFAULTS, $);

  const x = $.data.map($.xFn);
  const y = $.data.map($.yFn);

  const xBounds = [ Math.min.apply(null, x), Math.max.apply(null, x) ];
  const yBounds = [ Math.min.apply(null, y), Math.max.apply(null, y) ];

  const xScale = d3.scaleLinear()
    .domain(xBounds)
    .range([ -$.width/2, $.width/2 ])
  ;

  const yScale = d3.scaleLinear()
    .domain(yBounds)
    .range([ -$.height/2, $.height/2 ])
  ;

  const points = d3.zip(x.map(xScale), y.map(yScale));

  const stroke = strokeWidthPath($.strokeWidth)

  const forwardPath = points.map(stroke);
  const reversePath = points.reverse().map(stroke);

  const path = forwardPath.concat(reversePath);

  const shape = new T.Shape();

  const [ startX, startY ] = path[0];

  shape.moveTo(startX, startY);
  path
    .slice(1)
    .forEach(([ x, y ]) => shape.lineTo(x, y))
  ;
  shape.lineTo(startX, startY);

  const geometry = new T.ExtrudeBufferGeometry(shape, { depth: $.strokeDepth });
  const material = new T.MeshLambertMaterial({ color: $.color });
  const mesh = new T.Mesh(geometry, material);

  mesh.castShadow = $.castShadow;
  mesh.receiveShadow = $.receiveShadow;

  mesh.position.set($.x, $.y, $.z);

  return mesh;
}
