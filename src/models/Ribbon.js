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
  height: 90,
  strokeWidth: 4,
  strokeDepth: 30,
  color: 0xff0000,
  edges: false,
  x: 0,
  y: 0,
  z: 0,
  castShadow: true,
  receiveShadow: true,
};

const normalVec = ([x1, y1], [x2, y2]) => {
  // normal
  const [ nx, ny ] = [ y1 - y2, x2 - x1 ];
  const magnitude = Math.hypot(nx, ny);

  // normal vector
  return [ nx / magnitude, ny / magnitude ];
}

const translateLine = ([[x1, y1], [x2, y2]], w=0) => {
  const [ vx, vy ] = normalVec([x1, y1], [x2, y2]);

  // translate stroke
  return [[ x1 + vx * w, y1 + vy * w ], [ x2 + vx * w, y2 + vy * w ]];
};

const slope = ([[x1, y1], [x2, y2]]) => (y2 - y1) / (x2 - x1);

const contains = ([[x1, y1], [x2, y2]], [px, py]) => {
  const maxX = Math.max(x1, x2);
  const maxY = Math.max(y1, y2);
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);

  return px >= minX && px <= maxX && py >= minY && py <= maxY
};

const strokeWidthPath = w => (p, i, a) => {
  const [px, py] = p;
  // reference point for stroke
  const prevRef = [a[i - 1] || [], p];
  const nextRef = [p, a[i + 1] || []];

  const prev = translateLine(prevRef, w);
  const next = translateLine(nextRef, w);

  if (a[i - 1] === undefined)
    return [next[0]];

  if (a[i + 1] === undefined)
    return [prev[1]];

  const prevSlope = slope(prev);
  const nextSlope = slope(next);
  const slopeDiff = nextSlope - prevSlope;

  //if (Math.abs(slopeDiff) < 0.0000001)
  //  return [prev[1]];

  const prevY0 = [prev[0][1] - prevSlope * prev[0][0]];
  const nextY0 = [next[0][1] - nextSlope * next[0][0]];

  const intersectX = (prevY0 - nextY0) / (nextSlope - prevSlope);
  const intersectY = ((prevY0 * nextSlope) - (nextY0 * prevSlope)) / slopeDiff;

  const intersect = [intersectX, intersectY];

  if (contains(prev, intersect) || contains(next, intersect))
    return [intersect];

  const [dx, dy] = [intersectX - px, intersectY - py];
  const magnitude = Math.hypot(dx, dy);
  const [vx, vy] = [dx / magnitude, dy / magnitude];
  return [prev[1], [w * vx + px, w * vy + py], next[0]];

  //const pv = [prev[1][0] - prev[0][0], prev[1][1] - prev[0][1]];
  //const nv = [next[1][0] - next[0][0], next[1][1] - next[0][1]];
  //const dot = pv[0] * nv[0] + pv[1] * nv[1];



  //return [prev[1], [w * vx + px, w * vy + py]];

  //const distance = Math.hypot(prev[1][0] - next[0][0], prev[1][1] - next[0][1]);
  //const angle = asin(

};

window.strokeWidthPath = strokeWidthPath;
window.translateLine = translateLine;

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

  const forwardPath = points
    .map(stroke)
    .reduce((a,x) => a.concat(x), [])
  ;

  const reversePath = points
    .reverse()
    .map(stroke)
    .reduce((a,x) => a.concat(x), [])
  ;

  const path = forwardPath.concat(reversePath);

  const shape = new T.Shape();

  const [ startX, startY ] = path[0];

  shape.moveTo(startX, startY);
  path
    .slice(1)
    .forEach(([ x, y ]) => shape.lineTo(x, y))
  ;
  shape.lineTo(startX, startY);

  const geometry = new T.ExtrudeBufferGeometry(
    shape, 
    { depth: $.strokeDepth, bevelEnabled: false }
  );
  const material = new T.MeshLambertMaterial({ color: $.color });
  const mesh = new T.Mesh(geometry, material);

  mesh.castShadow = $.castShadow;
  mesh.receiveShadow = $.receiveShadow;

  mesh.position.set($.x, $.y, $.z);

  return mesh;
}
