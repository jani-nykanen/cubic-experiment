import { Mesh } from "./mesh.js";
import { OBJModel, OBJMesh } from "./objloader.js";


export class Model {


    private meshes : Array<Mesh>;


    constructor(meshes : Array<Mesh>, gl? : WebGLRenderingContext, rawModel? : OBJModel) {

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


    public pushMesh(gl : WebGLRenderingContext, rawMesh : OBJMesh) {

        this.meshes.push(new Mesh(gl,
            new Float32Array(rawMesh.vertices), 
            new Float32Array(rawMesh.uvs), 
            new Float32Array(rawMesh.normals.map(a => -a)),
            new Uint16Array(rawMesh.vertexIndices)));
    }


    public draw(gl : WebGLRenderingContext) {

        for (let m of this.meshes) {

            m.bind(gl);
            m.draw(gl);
        }
    }
}
