import "./style.css";
import { createGameScene } from "./scene/GameScene";

const gameScene = createGameScene();
await gameScene.load();
gameScene.render();
