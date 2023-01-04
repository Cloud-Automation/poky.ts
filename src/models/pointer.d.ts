import * as THREE from 'three';
export type Config = {
    connector: {
        radius: number;
        length: number;
    };
    knob: {
        radius: number;
    };
    material?: THREE.Material;
};
export default class PointerModel extends THREE.Group {
    private _config;
    constructor(config: Config);
    get length(): number;
}
