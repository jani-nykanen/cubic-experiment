


let isWhitespace = (ch : string) : boolean  => [" ", "\t", "\n"].includes(ch);


let removeComment = (str : string) : string => {

	const COMMENT_SIGN = "#";

	let out = "";
	let begun = false;
	let ch : string;
	for (let i = 0; i < str.length; ++ i) {

		ch = str.charAt(i);
		if (!begun && isWhitespace(ch))
			continue;
		
		begun = true;

		if (ch == COMMENT_SIGN)
			break;

		out += ch;
	}
	return out;
}


let isEmpty = (str : string) : boolean => {

	if (str.length == 0) return true;

	for (let i = 0; i < str.length; ++ i) {

		if (!isWhitespace(str.charAt(i)))
			return false;
	}
	return true;
}


let unwrapIndexedArray = (arr : Array<number>, indices : Array<number>, offset : number) => {

	let out = new Array();

	for (let i = 0; i < indices.length; ++ i) {

		for (let j = 0; j < offset; ++ j) {

			out.push(arr[indices[i]*offset + j]);
		}
	}

	return out;
}


export class OBJMesh {


    public vertices : Array<number>;
    public uvs : Array<number>;
    public normals : Array<number>;

    public vertexIndices : Array<number>;
    public uvIndices : Array<number>;
    public normalIndices : Array<number>;


	constructor() {
		
		this.vertices = [];
		this.uvs = [];
		this.normals = [];
		
		this.vertexIndices = [];
		this.uvIndices = [];
		this.normalIndices = [];
	}


	// Actually just the V coordinate
	public invertUVs() : OBJMesh {

		for (let i = 1; i < this.uvs.length; i += 2) {

			this.uvs[i] = 1.0 - this.uvs[i];
		}

		return this;
	}
}



export class OBJModel {


    private meshes : Array<OBJMesh>;
    private activeMesh : OBJMesh;

    
    constructor(input? : string) {
		
		this.meshes = new Array<OBJMesh>();
		this.activeMesh = null;

		if (input != undefined)
			this.parse(input);
	}


	private pushData(array : Array<number>, data : Array<string>) {

		if (this.activeMesh == null)
			this.pushEmptyMesh();

		array.push(
			...data.slice(1, data.length)
				.map(a => Number(a)));
	}


	private parseFace(faceStr : string) {

		if (this.activeMesh == null)
			this.pushEmptyMesh();

		let values = faceStr.split("/").map(a => Number(a) - 1);

		this.activeMesh.vertexIndices.push(values[0]);
		this.activeMesh.uvIndices.push(values[1]);
		this.activeMesh.normalIndices.push(values[2]);
	}


	private pushEmptyMesh() {

		this.meshes.push(new OBJMesh());
		this.activeMesh = this.meshes[this.meshes.length-1];
	}


	private parseLine(data : Array<string>) {

		if (data.length <= 1) return;

		switch(data[0]) {

		case "o":

			// We ignore mesh names for now
			this.pushEmptyMesh();
			break;

		case "v":

			this.pushData(this.activeMesh.vertices, data);
			break;

		case "vt":

			this.pushData(this.activeMesh.uvs, data);
			break;	

		case "vn":
				
			this.pushData(this.activeMesh.normals, data);
			break;	

		case "f":

			data.slice(1, data.length)
				.map(a => this.parseFace(a));
			break;

		default:
			break;
		}
	}


	private parse(dataStr : string) {

		dataStr.split("\n")
			.map(a => removeComment(a))
			.filter(a => !isEmpty(a))
			.map(a => a.split(" "))
			.map(a => this.parseLine(a));

		this.activeMesh = null;
	}
	

	// Removes indices (that is, make them linear)
	// to make it easier to use in WebGL programs
	public unwrapIndices() : OBJModel {

		let copy = new OBJModel();

		for (let m of this.meshes) {

			copy.pushEmptyMesh();

			copy.activeMesh.vertices = unwrapIndexedArray(m.vertices, m.vertexIndices, 3);
			copy.activeMesh.uvs = unwrapIndexedArray(m.uvs, m.uvIndices, 2);
			copy.activeMesh.normals = unwrapIndexedArray(m.normals, m.normalIndices, 3);

			copy.activeMesh.vertexIndices = (new Array(copy.activeMesh.vertices.length / 3))
				.fill(0)
				.map( (a, i) => i);
			copy.activeMesh.uvIndices = Array.from(copy.activeMesh.vertexIndices);
			copy.activeMesh.normalIndices = Array.from(copy.activeMesh.vertexIndices);
		}

		copy.activeMesh = null;

		return copy;
	}


    public iterateMeshes( cb : (mesh : OBJMesh) => void) {

        for (let m of this.meshes) {

            cb(m);
        }
    }


	static load(path : string, callback : (o : OBJModel) => any) {

		let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("text/plain");
        xobj.open("GET", path, true);

        xobj.onreadystatechange = () => {

            if (xobj.readyState == 4 ) {

                if(String(xobj.status) == "200") {
                    
                    callback(new OBJModel(xobj.responseText));
                }
            }
                
        };
        xobj.send(null);  
	}
}
