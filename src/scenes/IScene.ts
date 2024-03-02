import { Application, type DisplayObject } from "pixi.js";

export interface ISceneView extends DisplayObject {
  handleResize: (options: { viewWidth: number; viewHeight: number }) => void;
}

export type ISceneViewResizeParams = Parameters<ISceneView["handleResize"]>[0];

export interface IScene {
  name: string;
  view: ISceneView;
  handleUpdate: (deltaMS: number) => void;
  mountedHandler?: () => void;
  unmountedHandler?: () => void;
  handleResize: (options: { viewWidth: number; viewHeight: number }) => void;
}

export type ISceneResizeParams = Parameters<IScene["handleResize"]>[0];
export type ISceneUpdateParams = Parameters<IScene["handleUpdate"]>[0];

export type PixiApp = Application<HTMLCanvasElement>;
