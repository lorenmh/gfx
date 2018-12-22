class Model {
  constructor(id,
              mesh_vec3_arr=[],
              color_vec4_arr=[],
              position_vec3=[0,0,0]) {
    this.mesh = mesh;
  }

  position_mat4() {
    return Float32Array([
      position_vec3[0], 0, 0, 0,
      0, position_vec3[1], 0, 0,
      0, 0, position_vec3[2], 0,
      0, 0, 0, 1,
    ]);
  }
}
