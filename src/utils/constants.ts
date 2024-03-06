import { AssetsManifest } from "pixi.js";

export const FONT_FAMILY = "Zubilo Black";
export const COLOR_GREEN = 0x00ff99;
export const COLOR_RED = 0xff0000
export const COLOR_WHITE = 0xffffff;
export const COLOR_PURP = 0xbaa0de;
export const COLOR_DARC_PURP = 0x4a1850;
export const COLOR_DARK_GRAY = 0x333333;

export const TIME = 60000;
export const COUNT_ENEMY = 5;
export const COUNT_PROJECTILE = 10;
export const HEALTH = 4;
export const TIMEOUT_FOR_SHOOT_BOSS = 2000;
export const SPEED_BOSS_PROJECTLE = 3;
export const SPEED_PLAYER_PROJECTLE = -6;


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
