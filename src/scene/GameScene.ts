import {
  AxesHelper,
  Clock,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

import { createGameMap } from "../map/GameMap";
import createResourceManager from "../utils/ResourceManager";
import { GameEntity } from "../entities/GameEntity";
import createPlayerTank from "../entities/PlayerTank";
import createWall from "../map/Wall";

interface IGameScene {
  load: () => Promise<void>;
  render: () => void;
  addToScene: (gameEntity: GameEntity) => void;
}

export const createGameScene = (): IGameScene => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scene = new Scene();

  const axesHelper = new AxesHelper(5);
  scene.add(axesHelper);

  //game entities array
  let gameEntities: GameEntity[] = [];

  const clock: Clock = new Clock();

  const mapSize = 15;

  //add the game map
  const gameMap = createGameMap(new Vector3(0, 0, 0), mapSize);
  gameEntities.push(gameMap);

  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  const targetElement = document.querySelector<HTMLDivElement>("#app");
  if (!targetElement) {
    throw new Error("Unable to find target element");
  }
  targetElement.appendChild(renderer.domElement);

  const aspectRatio = width / height;
  const camera = new PerspectiveCamera(45, aspectRatio, 0.1, 1000);
  camera.position.set(7, 7, 15);

  const createWalls = () => {
    const edge = mapSize - 1;

    gameEntities.push(createWall(new Vector3(0, 0, 0)));
    gameEntities.push(createWall(new Vector3(edge, 0, 0)));
    gameEntities.push(createWall(new Vector3(edge, edge, 0)));
    gameEntities.push(createWall(new Vector3(0, edge, 0)));

    for (let i = 1; i < edge; i++) {
      gameEntities.push(createWall(new Vector3(i, 0, 0)));
      gameEntities.push(createWall(new Vector3(0, i, 0)));
      gameEntities.push(createWall(new Vector3(edge, i, 0)));
      gameEntities.push(createWall(new Vector3(i, edge, 0)));
    }
  };

  createWalls();

  const addToScene = (entity: GameEntity) => {
    gameEntities.push(entity);
    scene.add(entity.mesh);
  };

  //add tank player
  const playerTank = createPlayerTank(
    new Vector3(7, 7, 0),
    camera,
    gameEntities,
    addToScene
  );
  gameEntities.push(playerTank);

  const resize = () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  };

  window.addEventListener("resize", resize, false);

  const load = async () => {
    await createResourceManager().load();
    // await ResourceManager.instance.load();

    for (let index = 0; index < gameEntities.length; index++) {
      const element = gameEntities[index];
      await element.load();
      scene.add(element.mesh);
    }
    // add a light to the scene
    const light = new HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(light);
  };

  const render = () => {
    requestAnimationFrame(render);

    disposeEntities();

    const deltaT = clock.getDelta();

    for (let index = 0; index < gameEntities.length; index++) {
      const element = gameEntities[index];
      element.update(deltaT);
    }
    console.log("game entities", gameEntities);

    renderer.render(scene, camera);
  };

  const disposeEntities = () => {
    const entitiesToBeDisposed = gameEntities.filter((e) => e.shouldDispose);
    entitiesToBeDisposed.forEach((element) => {
      scene.remove(element.mesh);
      element.dispose();
    });
    // update entities array
    gameEntities = [...gameEntities.filter((e) => !e.shouldDispose)];
  };

  return {
    load,
    render,
    addToScene,
  };
};
