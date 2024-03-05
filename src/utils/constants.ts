import { AssetsManifest } from "pixi.js";

export const FONT_FAMILY = "Zubilo Black";
export const COLOR_GREEN = 0x00ff99;
export const COLOR_WHITE = 0xffffff;
export const COLOR_BLUE = 0x003d71;
export const COLOR_LIGHT_BLUE = 0x9ac6ff;
export const COLOR_ORANGE = 0xff6801;
export const COLOR_LIGHT_ORANGE = 0xf4ad25;
export const COLOR_1_PLACE = 0xc16001;
export const COLOR_2_PLACE = 0x205caf;
export const COLOR_3_PLACE = 0x8a1a00;
export const COLOR_DARK_GRAY = 0x333333;

export const manifest: AssetsManifest = {
    bundles: [
        {
            name: "initial-bundle",
            assets: {
                spritesheet: "assets/textures/texture.json",
                font: "assets/fonts/Zubilo_Black.woff2",
            },
        },
    ],
};
