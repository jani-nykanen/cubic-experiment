import { Vector3 } from "./vector.js";
export class Matrix4 {
    constructor(data = null) {
        this.clone = () => new Matrix4(this.m);
        this.m = data != null ?
            Float32Array.from(data) :
            (new Float32Array(4 * 4)).fill(0);
    }
    static rotate(angle, x, y, z) {
        let A = Matrix4.identity();
        let ca = Math.cos(angle * x);
        let sa = Math.sin(angle * x);
        let cb = Math.cos(angle * y);
        let sb = Math.sin(angle * y);
        let cc = Math.cos(angle * z);
        let sc = Math.sin(angle * z);
        A.m[0] = cb * cc;
        A.m[1] = -cb * sc;
        A.m[2] = sb;
        A.m[4] = sa * sb * cc + ca * sc;
        A.m[4 + 1] = -sa * sb * sc + ca * cc;
        A.m[4 + 2] = -sa * cb;
        A.m[8] = -ca * sb * cc;
        A.m[8 + 1] = ca * sb * sc + sa * cc;
        A.m[8 + 2] = ca * cb;
        return A;
    }
    static ortho(left, right, bottom, top, near, far) {
        let A = new Matrix4();
        A.m[0] = 2.0 / (right - left);
        A.m[3] = -(right + left) / (right - left);
        A.m[4 + 1] = 2.0 / (top - bottom);
        A.m[4 + 3] = -(top + bottom) / (top - bottom);
        A.m[8 + 2] = -2.0 / (far - near);
        A.m[8 + 3] = -(far + near) / (far - near);
        A.m[12 + 3] = 1.0;
        return A;
    }
    static ortho2D(left, right, bottom, top) {
        return Matrix4.ortho(left, right, bottom, top, -1, 1);
    }
    static perspective(fovY, aspectRatio, near, far) {
        let A = new Matrix4();
        let f = 1.0 / Math.tan((fovY / 180.0 * Math.PI) / 2.0);
        A.m[0] = f / aspectRatio;
        A.m[5] = f;
        A.m[10] = -(far + near) / (far - near);
        A.m[11] = -2.0 * far * near / (far - near);
        A.m[14] = -1.0;
        return A;
    }
    static isometricProjection() {
        return new Matrix4(new Float32Array([1, 0, -1, 0,
            1, -1, 1, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]));
    }
    static lookAt(eye, target, upDir = new Vector3(0, 1, 0)) {
        let A = Matrix4.identity();
        let forward = Vector3.normalize(new Vector3(eye.x - target.x, eye.y - target.y, eye.z - target.z));
        let left = Vector3.cross(forward, upDir);
        let up = Vector3.cross(forward, left);
        A.m[0] = left.x;
        A.m[1] = left.y;
        A.m[2] = left.z;
        A.m[4] = up.x;
        A.m[5] = up.y;
        A.m[6] = up.z;
        A.m[8] = forward.x;
        A.m[9] = forward.y;
        A.m[10] = forward.z;
        A.m[3] = -left.x * eye.x - left.y * eye.y - left.z * eye.z;
        A.m[7] = -up.x * eye.x - up.y * eye.y - up.z * eye.z;
        A.m[11] = -forward.x * eye.x - forward.y * eye.y - forward.z * eye.z;
        return A;
    }
    static multiply(left, right) {
        let out = new Matrix4();
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                for (let k = 0; k < 4; ++k) {
                    out.m[i * 4 + j] += left.m[i * 4 + k] * right.m[k * 4 + j];
                }
            }
        }
        return out;
    }
    static transpose(A) {
        let out = new Matrix4();
        for (let j = 0; j < 4; ++j) {
            for (let i = 0; i < 4; ++i) {
                out.m[i * 4 + j] = A.m[j * 4 + i];
            }
        }
        return out;
    }
    passToShader(gl, uniform) {
        gl.uniformMatrix4fv(uniform, false, Matrix4.transpose(this).m);
    }
}
Matrix4.identity = () => new Matrix4(new Float32Array([1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1]));
Matrix4.translate = (x = 0, y = 0, z = 0) => new Matrix4(new Float32Array([1, 0, 0, x,
    0, 1, 0, y,
    0, 0, 1, z,
    0, 0, 0, 1]));
Matrix4.scale = (sx = 1, sy = 1, sz = 1) => new Matrix4(new Float32Array([sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1]));
