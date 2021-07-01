export class Mesh {
    constructor(gl, vertices, textureCoordinates, normals, indices) {
        this.elementCount = indices.length;
        this.vertexBuffer = gl.createBuffer();
        this.uvBuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }
    bind(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }
    draw(gl) {
        gl.drawElements(gl.TRIANGLES, this.elementCount, gl.UNSIGNED_SHORT, 0);
    }
    dispose(gl) {
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.normalBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
}
