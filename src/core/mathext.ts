import { Vector2, Vector3 } from "./vector";


export const negMod = (m : number, n : number) : number => {

    m |= 0;
    n |= 0;

    return ((m % n) + n) % n;
}


export const clamp = (x : number, min : number, max : number) : number => {

    return Math.max(min, Math.min(x, max));
}


export const isInsideTriangle = (p : Vector3, A : Vector2, B : Vector2, C : Vector2) : boolean => {

    // Source: Stack Overflow, many years ago
    // That explains different variable naming, I'll
    // rename them once I come up with descriptive names

	let as_x = p.x - A.x;
    let as_y = p.z - A.y;
    let s_ab = ((B.x-A.x) * as_y - (B.y-A.y) * as_x) >= 0;

    return !(( (C.x-A.x) * as_y - (C.y - A.y) * as_x > 0) == s_ab || 
        	((C.x-B.x)*(p.z-B.y)-(C.y-B.y)*(p.x-B.x) > 0) != s_ab);
}
