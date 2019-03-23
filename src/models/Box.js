import * as T from 'three';
import { atoms } from '../utils';

export const TYPE = atoms`
  EDGE
  SOLID
`;

window.atoms = atoms;

const DEFAULTS = {
  width: 100,
  height: 100,
  depth: 100,
  color: 0xff0000,
  edges: false,
  x: 0,
  y: 0,
  z: 0,
  castShadow: false,//true,
  receiveShadow: false,//true,
};

export default function Box($) {
  $ = Object.assign({}, DEFAULTS, $);

  const group = new T.Group();

  const geometry = new T.BoxBufferGeometry($.width, $.height, $.depth);
  const material = new T.MeshLambertMaterial({ color: $.color });
  const mesh = new T.Mesh(geometry, material);
  mesh.castShadow = $.castShadow;
  mesh.receiveShadow = $.receiveShadow;

  group.add(mesh);

  if ($.edges) {
    const edges = {};
    edges.geometry = new T.EdgesGeometry(geometry);
    edges.material = new T.LineBasicMaterial({ color: 0xffffff ^ $.color });
    edges.mesh = new T.LineSegments(edges.geometry, edges.material);
    group.add(edges.mesh);
  }

  group.position.set($.x, $.y, $.z);

  return group;
}
