import { Canvas } from "./canvas";


const Repeat = {
    Horizontal: 1,
    Vertical: 3
};


export class Bitmap {

    private texture : WebGLTexture;

    public readonly width : number;
    public readonly height : number;


    constructor(gl : WebGLRenderingContext, image : HTMLImageElement, 
        data = <Uint8Array>null, width = 0, height = 0) {

        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        /*
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, 
            (repeatFlag & Repeat.Horizontal) ?  gl.REPEAT : gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, 
            (repeatFlag & Repeat.Vertical) ? gl.REPEAT : gl.CLAMP_TO_EDGE);
            */
        if (image != null) {

            gl.texImage2D(gl.TEXTURE_2D, 
                0, gl.RGBA, gl.RGBA, 
                gl.UNSIGNED_BYTE, image);

            this.width = image.width;
            this.height = image.height;
        }
        else {

            gl.texImage2D(gl.TEXTURE_2D, 
                0, gl.RGBA, width, height, 0, 
                gl.RGBA, gl.UNSIGNED_BYTE, data);

            this.width = width;
            this.height = height;
        }
        
    }


    public bind(gl : WebGLRenderingContext) {

        // We could have used the own reference to gl as well
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
}

