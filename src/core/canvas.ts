import { AssetManager } from "./assets.js";
import { Bitmap } from "./bitmap.js";
import { Mesh } from "./mesh.js";
import { Model } from "./model.js";
import { OBJModel } from "./objloader.js";
import { Shader } from "./shader.js";
import { FragmentSource, VertexSource } from "./shadersource.js";
import { Sprite } from "./sprite.js";
import { Transformations } from "./transformations.js";
import { RGBA, Vector3 } from "./vector.js";


export enum Flip {

    None = 0,
    Horizontal = 1,
    Vertical = 2,
    Both = 3,
};


export enum ShaderType {

    Textured = 0,
    NoTextures = 1,
    NoTexturesLight = 2,
    TexturedFog = 3,
    TexturedLight = 4,
};


export class Canvas {

    private stretch : boolean;

    private readonly assets : AssetManager;

    private canvas : HTMLCanvasElement;
    private glCtx : WebGLRenderingContext;

    private shaders : Array<[ShaderType, Shader]>;
    private activeShader : Shader;

    private rectangle : Mesh;

    private activeMesh : Mesh;
    private activeTexture : Bitmap;

    private depthTestState : boolean;

    private activeColor : RGBA;

    public readonly transform : Transformations;


    public get width() : number {

        return this.canvas.width;
    }
    public get height() {
        
        return this.canvas.height;
    }


    constructor(width : number, height : number, assets : AssetManager) {

        this.stretch = width <= 0 || height <= 0;

        if (width <= 0) width = window.innerWidth;
        if (height <= 0) height = window.innerHeight;

        this.createHtml5Canvas(width, height);
        this.initOpenGL();

        window.addEventListener("resize", () => this.resize(
            window.innerWidth, window.innerHeight));

        this.shaders = new Array<[ShaderType, Shader]> ();

        this.shaders[0] =  [
            ShaderType.Textured, 
                new Shader(this.glCtx, VertexSource.Textured, FragmentSource.Textured)]; 

        this.shaders[1] =  [
            ShaderType.NoTextures, 
                new Shader(this.glCtx, VertexSource.NoTexture, FragmentSource.NoTexture)]; 

        this.shaders[2] =  [
            ShaderType.NoTexturesLight, 
                new Shader(this.glCtx, VertexSource.NoTexture, FragmentSource.NoTextureLight)]; 

        this.shaders[3] =  [
            ShaderType.TexturedFog, 
                new Shader(this.glCtx, VertexSource.Textured, FragmentSource.TexturedFog)];    
                
        this.shaders[4] =  [
            ShaderType.TexturedLight, 
                new Shader(this.glCtx, VertexSource.Textured, FragmentSource.TexturedLight)];            

        
        this.activeShader =  this.shaders[0][1];
        this.activeShader.use();

        this.rectangle = this.createRectangleMesh();
        this.rectangle.bind(this.glCtx);

        this.transform = new Transformations(this.activeShader);

        this.activeTexture = null;
        this.activeMesh = null;

        this.depthTestState = true;

        this.assets = assets;
        
        this.activeColor = new RGBA(1, 1, 1, 1);
    }


    private createHtml5Canvas(width : number, height : number) {

        let cdiv = document.createElement("div");
        cdiv.setAttribute("style", 
            "position: absolute; top: 0; left: 0; z-index: -1;");

        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;

        this.canvas.setAttribute(
            "style", 
            "position: absolute; top: 0; left: 0; z-index: -1;");
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);

        this.glCtx = this.canvas.getContext("webgl", {alpha: false, antialias: true});

        this.resize(window.innerWidth, window.innerHeight);
        
    }


    private resize(width : number, height : number) {

        let c = this.canvas;
        let gl = this.glCtx;

        if (this.stretch) {

            this.canvas.width = width;
            this.canvas.height = height;

            gl.viewport(0, 0, width, height);
            return;
        }

        let mul = Math.min(
            width / c.width, 
            height / c.height);

        let totalWidth = c.width * mul;
        let totalHeight = c.height * mul;
        let x = width/2 - totalWidth/2;
        let y = height/2 - totalHeight/2;

        let top = String(y | 0) + "px";
        let left = String(x | 0) + "px";

        c.style.width = String(totalWidth | 0) + "px";
        c.style.height = String(totalHeight | 0) + "px";
        
        c.style.top = top;
        c.style.left = left;
    }


    private createRectangleMesh() : Mesh {

        return new Mesh(
            this.glCtx,
            new Float32Array([
                0, 0, 0,
                1, 0, 0,
                1, 1, 0,
                0, 1, 0,
            ]),
            new Float32Array([
                0, 0,
                1, 0,
                1, 1,
                0, 1
            ]),
            new Float32Array([
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
            ]),
            new Uint16Array([
                0, 1, 2, 
                2, 3, 0
            ]),
        );
    }


    private initOpenGL() {

        let gl = this.glCtx;

        gl.activeTexture(gl.TEXTURE0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, 
            gl.ONE_MINUS_SRC_ALPHA, gl.ONE, 
            gl.ONE_MINUS_SRC_ALPHA);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);

        if (!this.stretch)
            gl.viewport(0, 0, this.width, this.height);
    }


    public clear(r = 1, g = 1, b = 1) {

        let gl = this.glCtx;

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.clearColor(r, g, b, 1.0);
    }


    public clearDepth() {

        let gl = this.glCtx;

        gl.clear(gl.DEPTH_BUFFER_BIT);
    }


    public bindMesh(mesh : Mesh) {

        if (this.activeMesh == mesh) return;

        mesh.bind(this.glCtx);

        // Otherwise we might get weird bugs, because
        // the rectangle mesh is bounded in the loading screen,
        // but new meshes is loaded during that
        if (this.assets.hasLoaded())
            this.activeMesh = mesh;
    }


    public bindTexture(bmp : Bitmap) {

        if (this.activeTexture == bmp) return;

        bmp.bind(this.glCtx);
        this.activeTexture = bmp;
    }


    public resetVertexAndFragmentTransforms() {

        this.activeShader.setVertexTransform(0, 0, 0, 1, 1, 1);
        this.activeShader.setFragTransform(0, 0, 1, 1);
    }


    public setVertexTransform(x : number, y : number, z : number,
        w : number, h : number, d : number) {

        this.activeShader.setVertexTransform(x, y, z, w, h, d);
    }


    public setFragmentTransform(x : number, y : number,
        w : number, h : number) {

        this.activeShader.setFragTransform(x, y, w, h);
    }
    

    public changeShader(type : ShaderType) {

        let newShader : Shader;

        for (let i of this.shaders) {

            if (i[0] == type) {

                newShader = i[1];
                break;
            }
        }

        if (newShader == null ||
            newShader == this.activeShader) return;

        this.activeShader = newShader;
        this.activeShader.use();

        this.transform.setActiveShader(this.activeShader);
        this.transform.use();    
    }


    public setDrawColor(r = 1, g = 1, b = 1, a = 1) {

        this.activeShader.setColor(r, g, b, a);

        this.activeColor = new RGBA(r, g, b, a);
    }


    public drawRectangle(x : number, y : number, w : number, h : number) {

        this.activeShader.setVertexTransform(x, y, 0, w, h, 1);

        this.bindMesh(this.rectangle);
        this.rectangle.draw(this.glCtx);
    }



    public drawBitmap(bmp : Bitmap, 
        dx : number, dy : number, dw = bmp.width, dh = bmp.height) {

        this.drawBitmapRegion(bmp, 0, 0, bmp.width, bmp.height,
            dx, dy, dw, dh);
    }


    public drawBitmapRegion(bmp : Bitmap, 
        sx : number, sy : number, sw : number, sh : number,
        dx : number, dy : number, dw = sw, dh = sh) {

        this.activeShader.setVertexTransform(dx, dy, 0, dw, dh, 1);
        this.activeShader.setFragTransform(
            sx / bmp.width, sy / bmp.height, 
            sw / bmp.width, sh / bmp.height);

        this.bindMesh(this.rectangle);
        this.bindTexture(bmp);

        this.rectangle.draw(this.glCtx);
    }


    public drawText(font : Bitmap, str : string, 
        dx : number, dy : number, 
        xoff = 0.0, yoff = 0.0, center = false, scalex = 1, scaley = 1,
        wave = 0.0, amplitude = 0.0, period = 0.0) {

        let cw = (font.width / 16) | 0;
        let ch = cw;

        let x = dx;
        let y = dy;
        let chr : number;

        let yoffset : number;

        if (center) {

            dx -= ((str.length+1) * (cw + xoff) * scalex)/ 2.0 ;
            x = dx;
        }

        for (let i = 0; i < str.length; ++ i) {

            chr = str.charCodeAt(i);
            if (chr == '\n'.charCodeAt(0)) {

                x = dx;
                y += (ch + yoff) * scaley;
                continue;
            }

            yoffset = Math.sin(wave + i * period) * amplitude;

            this.drawBitmapRegion(
                font, 
                (chr % 16) * cw, ((chr/16)|0) * ch,
                cw, ch, 
                x, y + yoffset, 
                cw * scalex, ch * scaley);

            x += (cw + xoff) * scalex;
        }
    }


    public drawTextWithShadow(font : Bitmap, str : string, 
        dx : number, dy : number, 
        xoff = 0.0, yoff = 0.0, center = false, scalex = 1, scaley = 1,
        shadowOffX = 0, shadowOffY = 0, shadowAlpha = 1.0,
        wave = 0.0, amplitude = 0.0, period = 0.0) {

        let color = this.activeColor.clone();

        this.setDrawColor(0, 0, 0, shadowAlpha * color.a);
        this.drawText(font, str, dx + shadowOffX, dy + shadowOffY, 
            xoff, yoff, center, scalex, scaley, 
            wave, amplitude, period);

        this.setDrawColor(color.r, color.g, color.b, color.a);
        this.drawText(font, str, dx , dy, 
            xoff, yoff, center, scalex, scaley, 
            wave, amplitude, period);

    }


    public drawSpriteFrame(spr : Sprite, bmp : Bitmap, 
        column : number, row : number,
        dx : number, dy : number, 
        dw = spr.width, dh = spr.height, flip = Flip.None) {

        if (flip == Flip.Horizontal) {

            dx += dw;
            dw *= -1;
        }
        if (flip == Flip.Vertical) {

            dy += dh;
            dh *= -1;
        }

        spr.drawFrame(this, bmp, column, row, dx, dy, dw, dh);
    }


    public drawSprite(spr : Sprite, bmp : Bitmap, dx : number, dy : number, 
        dw = spr.width, dh = spr.height, flip = Flip.None) {

        if (flip == Flip.Horizontal) {
            
            dx += dw;
            dw *= -1;
        }
        if (flip == Flip.Vertical) {

            dy += dh;
            dh *= -1;
        }

        spr.draw(this, bmp, dx, dy, dw, dh);
    }


    public drawModel(model : Model) {

        model.draw(this.glCtx);
        this.activeMesh = null;
    }


    public drawMesh(mesh : Mesh) {

        this.bindMesh(mesh);
        mesh.draw(this.glCtx);
    }


    public createBitmap(image : HTMLImageElement, repeatFlag = 0) : Bitmap {

        return new Bitmap(this.glCtx, image, null, repeatFlag);
    }
    

    public createModel(rawData : OBJModel) : Model {

        return new Model(null, this.glCtx, rawData);
    }
    

    public getBitmap(name : string) : Bitmap {

        return this.assets.getBitmap(name);
    }


    public getModel(name : string) : Model {

        return this.assets.getModel(name);
    }


    public constructMesh = (vertices : Float32Array, 
        textureCoordinates : Float32Array, 
        normals : Float32Array,
        indices : Uint16Array) : Mesh => 
        (new Mesh(this.glCtx, vertices, textureCoordinates, normals, indices));


    public toggleDepthTest(state : boolean) {

        let gl = this.glCtx;

        if (state)
            gl.enable(gl.DEPTH_TEST);
        else
            gl.disable(gl.DEPTH_TEST);

        this.depthTestState = state;
    }


    public getDepthTestState = () : boolean => this.depthTestState;
    

    public setFog = (density : number, color : RGBA) : void => this.activeShader.setFog(density, color);
    public setLight = (mag : number, dir : Vector3) : void => this.activeShader.setLight(mag, dir);


    public destroyMesh(mesh : Mesh) {

        mesh.dispose(this.glCtx);
    }
}
