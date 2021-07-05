import { Menu, MenuButton } from "./menu.js";
export class ConfirmationBox {
    constructor(yes, no, event) {
        this.update = (event) => this.menu.update(event);
        this.draw = (canvas, bgAlpha = 0.33) => this.menu.draw(canvas, 0.5, true, bgAlpha, 24, "Are you sure?");
        this.isActive = () => this.menu.isActive();
        this.activate = () => this.menu.activate(1);
        this.deactivate = () => this.menu.deactivate();
        this.menu = new Menu([
            new MenuButton("Yes", yes),
            new MenuButton("No", no)
        ]);
    }
}
