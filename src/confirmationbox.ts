import { Canvas } from "./core/canvas.js";
import { CoreEvent } from "./core/core.js";
import { Menu, MenuButton } from "./menu.js";



export class ConfirmationBox {


    private menu : Menu;


    constructor(yes : (event : CoreEvent) => void, 
        no : (event : CoreEvent) => void, 
        event : CoreEvent) {

        this.menu = new Menu(
            [
                new MenuButton("Yes", yes),
                new MenuButton("No", no)
            ]
        );
    }

    public update = (event : CoreEvent) : void => this.menu.update(event);

    public draw = (canvas : Canvas, bgAlpha = 0.33) : void => this.menu.draw(canvas, 0.5, true, bgAlpha, 24, "Are you sure?");


    public isActive = () : boolean => this.menu.isActive();
    public activate = () : void => this.menu.activate(1);
    public deactivate = () : void => this.menu.deactivate();
}
