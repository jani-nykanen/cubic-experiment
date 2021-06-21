import { Canvas, ShaderType } from "./core/canvas.js";
import { CoreEvent, Scene } from "./core/core.js";
import { Model } from "./core/model.js";
import { Vector3 } from "./core/vector.js";
import { Player } from "./player.js";
import { ShapeGenerator } from "./shapegen.js";


export class GameScene implements Scene {


    private player : Player;


    constructor(param : any, event : CoreEvent) {


        // TODO: Create models in "ModelGen"?
        let cube = (new ShapeGenerator())
            .generateCube(event);
        event.assets.addModel("cube", new Model([cube]));

        this.player = new Player(0, 0, 0);
    }   


    public update(event : CoreEvent) {

        this.player.update(event);
    }
    

    public redraw(canvas : Canvas) {

        let lightDir = Vector3.normalize(new Vector3(-1, -1, 1));
        
        canvas.toggleDepthTest(true);
        canvas.clear(0.67, 0.67, 0.67);
        canvas.resetVertexAndFragmentTransforms();

        // 3D
        canvas.changeShader(ShaderType.TexturedLight);
        
        canvas.transform.loadIdentity();
        canvas.transform.setIsometricCamera(canvas.width/canvas.height, 0.5);
        canvas.transform.use();

        canvas.setDrawColor(1, 1, 1);
        canvas.setLight(1.0, lightDir);

        this.player.draw(canvas);

        // 2D
        canvas.changeShader(ShaderType.Textured);
        canvas.toggleDepthTest(false);
        canvas.transform.loadIdentity();
        canvas.transform.fitHeight(720.0, canvas.width/canvas.height);
        canvas.transform.use();

        canvas.drawText(canvas.getBitmap("font"), "TEST", 8, 8, -24, 0, false, 0.5, 0.5);
    }


    public dispose() : any {

        return null;
    }
}
