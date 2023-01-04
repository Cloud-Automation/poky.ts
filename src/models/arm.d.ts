import * as THREE from 'three';
export declare function createPathElement(path: string): HTMLElement;
export declare function createGeometryFromSVG(elem: HTMLElement, depth: number, material: THREE.Material): THREE.Group;
export type Config = {
    bigRadius: number;
    smallRadius?: number;
    length: number;
    depth: number;
    socketRadius: number;
    material?: THREE.Material;
};
export default class ArmModel extends THREE.Group {
    private config;
    constructor(config: Config);
}
