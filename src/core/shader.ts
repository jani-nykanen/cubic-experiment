import { Matrix4 } from "./matrix.js";
import { RGBA, Vector3 } from "./vector.js";



export class Shader {


    private shaderProgram : WebGLShader;
    private readonly gl : WebGLRenderingContext;

    private uniformTransform : WebGLUniformLocation;
    private uniformRotation : WebGLUniformLocation;
    private uniformVertexTranslation : WebGLUniformLocation;
    private uniformVertexScale : WebGLUniformLocation;
    private uniformFragmentTranslation : WebGLUniformLocation;
    private uniformFragmentScale : WebGLUniformLocation;
    private uniformFragmentColor : WebGLUniformLocation;
    private uniformTextureSampler : WebGLUniformLocation;
    private uniformFogDensity : WebGLUniformLocation;
    private uniformFogColor : WebGLUniformLocation;
    private uniformLightDirection : WebGLUniformLocation;
    private uniformLightMag : WebGLUniformLocation;


    constructor(gl : WebGLRenderingContext, vertexSource : string, fragmentSource : string) {

        this.gl = gl;

        this.shaderProgram = this.buildShader(vertexSource, fragmentSource);
        this.getUniformLocations();
    }   


    private createShader(src : string, type : number) {

        let gl = this.gl
    
        let shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
    
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    
            throw "Shader error:\n" + 
                gl.getShaderInfoLog(shader);
                
        }
    
        return shader;
    }


    private buildShader(vertexSource : string, fragmentSource : string) : WebGLShader {

        let gl = this.gl;
    
        let vertex = this.createShader(vertexSource, 
                gl.VERTEX_SHADER);
        let frag = this.createShader(fragmentSource, 
                gl.FRAGMENT_SHADER);
    
        let program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, frag);
    
        this.bindLocations(program);

        gl.linkProgram(program);
    
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    
            throw "Shader error: " + gl.getProgramInfoLog(program);
        }
        
        return program;
    }

    
    private bindLocations(program : WebGLShader) {

        let gl = this.gl;

        gl.bindAttribLocation(program, 0, "vertexPos");
        gl.bindAttribLocation(program, 1, "vertexUV");
        gl.bindAttribLocation(program, 2, "vertexNormal");
    }


    private getUniformLocations() {

        let gl = this.gl;

        this.uniformTransform = gl.getUniformLocation(this.shaderProgram, "transform");
        this.uniformRotation = gl.getUniformLocation(this.shaderProgram, "rotation");
        this.uniformVertexTranslation = gl.getUniformLocation(this.shaderProgram, "pos");
        this.uniformVertexScale = gl.getUniformLocation(this.shaderProgram, "size");
        this.uniformFragmentTranslation = gl.getUniformLocation(this.shaderProgram, "texPos");
        this.uniformFragmentScale = gl.getUniformLocation(this.shaderProgram, "texSize");
        this.uniformFragmentColor = gl.getUniformLocation(this.shaderProgram, "color");
        this.uniformTextureSampler = gl.getUniformLocation(this.shaderProgram, "texSampler");
        this.uniformFogDensity = gl.getUniformLocation(this.shaderProgram, "fogDensity");
        this.uniformFogColor = gl.getUniformLocation(this.shaderProgram, "fogColor");
        this.uniformLightDirection = gl.getUniformLocation(this.shaderProgram, "lightDir");
        this.uniformLightMag = gl.getUniformLocation(this.shaderProgram, "lightMag");
    }


    public use() {

        let gl = this.gl;
    
        gl.useProgram(this.shaderProgram);
        this.getUniformLocations();

        gl.uniform1i(this.uniformTextureSampler, 0);

        this.setVertexTransform(0, 0, 0, 1, 1, 1);
        this.setFragTransform(0, 0, 1, 1);
        this.setTransformMatrix(Matrix4.identity());
        this.setColor(1, 1, 1, 1);
        this.setFog(1.0, new RGBA());
    }


    public setVertexTransform(x : number, y : number, z : number, 
        w : number, h : number, d : number) {

        let gl = this.gl;

        gl.uniform3f(this.uniformVertexTranslation, x, y, z);
        gl.uniform3f(this.uniformVertexScale, w, h, d);
    }


    public setFragTransform(x : number, y : number, w : number, h : number) {

        let gl = this.gl;

        gl.uniform2f(this.uniformFragmentTranslation, x, y);
        gl.uniform2f(this.uniformFragmentScale, w, h);
    }


    public setColor(r = 1, g = 1, b = 1, a = 1) {

        let gl = this.gl;
        gl.uniform4f(this.uniformFragmentColor, r, g, b, a);
    }


    public setTransformMatrix(matrix : Matrix4) {

        matrix.passToShader(this.gl, this.uniformTransform);
    }


    public setRotationMatrix(matrix : Matrix4) {

        matrix.passToShader(this.gl, this.uniformRotation);
    }


    public setFog(density : number, color : RGBA) {

        let gl = this.gl;
        gl.uniform1f(this.uniformFogDensity, density);
        gl.uniform4f(this.uniformFogColor, color.r, color.g, color.b, color.a);
    }


    public setLight(mag : number, dir : Vector3) {

        let gl = this.gl;
        gl.uniform1f(this.uniformLightMag, mag);
        gl.uniform3f(this.uniformLightDirection, dir.x, dir.y, dir.z);
    }
}
