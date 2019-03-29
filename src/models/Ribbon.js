import * as T from 'three';
import * as d3 from 'd3';

import { atoms } from '../utils';

export const TYPE = atoms`
  SOLID

`;

const PI2 = Math.PI*2;

const DEFAULTS = {
  data: [...Array(100)].map((_, i) => [i, Math.log(Math.random()*10)]),
  xFn: ([x]) => x,
  yFn: ([_, y]) => y,
  width: 2000,
  height: 90,
  strokeWidth: 4,
  strokeDepth: 30,
  color: 0xff0000,
  transparent: false,
  opacity: 0.2,
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

const dot = ([x1, y1], [x2, y2]) => {
  return x1 * x2 + y1 * y2;
}

const magnitude = v => Math.hypot.apply(Math, v);

const angle = (v1, v2) => {
  return Math.acos(dot(v1, v2) / (magnitude(v1) * magnitude(v2)));
};

const unitVec = ([x1, y1], [x2, y2]) => {
  const [ ux, uy ] = [ x2 - x1, y2 - y1 ];
  const magnitude = Math.hypot(ux, uy);
  return [ ux / magnitude, uy / magnitude ];
}

const translateLine = ([[x1, y1], [x2, y2]], w=0) => {
  const [ vx, vy ] = normalVec([x1, y1], [x2, y2]);

  // translate stroke
  return [[ x1 + vx * w, y1 + vy * w ], [ x2 + vx * w, y2 + vy * w ]];
};

const rotate = ([vx, vy], a) => {
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return [cos * vx + sin * vy, -sin * vx + cos * vy];
}

const slope = ([[x1, y1], [x2, y2]]) => (y2 - y1) / (x2 - x1);

const contains = ([[x1, y1], [x2, y2]], [px, py]) => {
  const maxX = Math.max(x1, x2);
  const maxY = Math.max(y1, y2);
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);

  return px >= minX && px <= maxX && py >= minY && py <= maxY
};

const strokeWidthPath = (w, segmentSize=Math.PI/20) => (p, i, a) => {
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

  const arcAngle = angle(normalVec(...prevRef), normalVec(...nextRef));
  const numArcs = arcAngle / segmentSize;
  const numPoints = Math.max(0, Math.floor(numArcs) - 1);

  const arcPoints = [...Array(numPoints)]
    .map((_, i) => {
      const [ rx, ry ] = rotate(
        normalVec(...prevRef),
        (i + 1) * arcAngle / (numPoints + 1)
      );

      return [ px + rx * w, py + ry * w ];
    })
  ;

  return [prev[1], ...arcPoints];
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
  const material = new T.MeshLambertMaterial({
    color: $.color,
    opacity: $.opacity,
    transparent: $.transparent,
  });

  const mesh = new T.Mesh(geometry, material);

  mesh.castShadow = $.castShadow;
  mesh.receiveShadow = $.receiveShadow;

  mesh.position.set($.x, $.y, $.z);

  return mesh;
}
