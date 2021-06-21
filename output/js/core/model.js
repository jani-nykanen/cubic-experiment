import { Mesh } from "./mesh.js";
export class Model {
    constructor(meshes, gl, rawModel) {
        if (meshes != null) {
            this.meshes = Array.from(meshes);
            return;
        }
        this.meshes = new Array();
        if (rawModel != undefined) {
            rawModel.unwrapIndices()
                .iterateMeshes(mesh => this.pushMesh(gl, mesh.invertUVs()));
        }
    }
    pushMesh(gl, rawMesh) {
        this.meshes.push(new Mesh(gl, new Float32Array(rawMesh.vertices), new Float32Array(rawMesh.uvs), new Float32Array(rawMesh.normals.map(a => -a)), new Uint16Array(rawMesh.vertexIndices)));
    }
    draw(gl) {
        for (let m of this.meshes) {
            m.bind(gl);
            m.draw(gl);
        }
    }
}
