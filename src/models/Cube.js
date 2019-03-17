import * as T from 'three';

export default class Cube {
  constructor() {
    const geometry = new T.BoxBufferGeometry(200, 200, 200);
    const edges = new T.EdgesGeometry(geometry);
    const material = new T.LineBasicMaterial({color: 0xff0000});
    const lineSegments = new T.LineSegments(edges, material);

    Object.assign(this, {geometry, edges, material, lineSegments});
  }
}
