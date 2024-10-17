import {
  Box3,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Sphere,
  Vector3,
} from "three";
import createGameEntity, { GameEntity } from "./GameEntity";
import createResourceManager from "../utils/ResourceManager";
import createBullet from "./Bullet";

interface KeyboardState {
  LeftPressed: boolean;
  RightPressed: boolean;
  UpPressed: boolean;
  DownPressed: boolean;
}

function createPlayerTank(
  position: Vector3,
  camera: PerspectiveCamera,
  gameEntities: GameEntity[],
  addToScene: (gameEntity: GameEntity) => void
): GameEntity {
  const gameEntity = createGameEntity(position, "player");

  let rotation: number = 0;

  const _keyboardState: KeyboardState = {
    LeftPressed: false,
    RightPressed: false,
    UpPressed: false,
    DownPressed: false,
  };

  const handleKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowLeft":
        _keyboardState.LeftPressed = true;
        break;
      case "ArrowRight":
        _keyboardState.RightPressed = true;
        break;
      case "ArrowUp":
        _keyboardState.UpPressed = true;
        break;
      case "ArrowDown":
        _keyboardState.DownPressed = true;
        break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        _keyboardState.UpPressed = false;
        break;
      case "ArrowDown":
        _keyboardState.DownPressed = false;
        break;
      case "ArrowLeft":
        _keyboardState.LeftPressed = false;
        break;
      case "ArrowRight":
        _keyboardState.RightPressed = false;
        break;
      case " ":
        shoot();
        break;
      default:
        break;
    }
  };

  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("keyup", handleKeyUp);

  const shoot = async () => {
    // create an offset position (shoot a bit ahead of the tank)
    const offset = new Vector3(
      Math.sin(rotation) * 0.3,
      -Math.cos(rotation) * 0.3,
      0
    );
    const shootingPosition = gameEntity.mesh.position.clone().add(offset);
    // create and load the bullet
    const bullet = createBullet(shootingPosition, rotation);
    await bullet.load();
    addToScene(bullet);
  };

  gameEntity.load = async () => {
    const resourceManager = createResourceManager();
    await resourceManager.load();

    // ask the models and textures to the resource manager
    const tankModel = resourceManager.getModel("tannk");
    if (!tankModel) {
      throw new Error("unable to get tank model");
    }
    // debugger;
    // the model contains the meshes we need for the scene
    const tankBodyMesh = tankModel.scene.children.find(
      (m) => m.name === "Body"
    ) as Mesh;

    const tankTurretMesh = tankModel.scene.children.find(
      (m) => m.name === "Turret"
    ) as Mesh;

    const tankBodyTexture = resourceManager.getTexture("tank-body");
    const tankTurretTexture = resourceManager.getTexture("tank-turrent");

    if (
      !tankBodyMesh ||
      !tankTurretMesh ||
      !tankBodyTexture ||
      !tankTurretTexture
    ) {
      throw new Error("unable to load player model or textures");
    }

    // with all the assets we can build the final mesh and materials
    const bodyMaterial = new MeshStandardMaterial({
      map: tankBodyTexture,
    });
    const turretMaterial = new MeshStandardMaterial({
      map: tankTurretTexture,
    });

    tankBodyMesh.material = bodyMaterial;
    tankTurretMesh.material = turretMaterial;

    // add meshes as child of entity mesh
    gameEntity.mesh.add(tankBodyMesh);
    gameEntity.mesh.add(tankTurretMesh);

    const collider = new Box3()
      .setFromObject(gameEntity.mesh)
      .getBoundingSphere(new Sphere(gameEntity.mesh.position.clone()));
    // Уменьшаем радиус немного
    collider.radius *= 0.75;
    gameEntity.colider = collider;
  };

  // console.log("gameEntities", gameEntities);

  gameEntity.update = (deltaT: number) => {
    let computedRotation = rotation;
    let computeMovement = new Vector3();
    const moveSpeed = 2;

    const yMovement = moveSpeed * deltaT * Math.cos(computedRotation);
    const xMovement = moveSpeed * deltaT * Math.sin(computedRotation);

    let fullCircle = Math.PI * 2;

    if (computedRotation > fullCircle) {
      computedRotation = fullCircle - computedRotation;
    } else if (computedRotation < 0) {
      computedRotation = fullCircle + computedRotation;
    }

    if (_keyboardState.UpPressed) {
      computeMovement = new Vector3(xMovement, -yMovement, 0);
    } else if (_keyboardState.DownPressed) {
      computeMovement = new Vector3(-xMovement, yMovement, 0);
    }

    if (_keyboardState.LeftPressed) {
      computedRotation += Math.PI * deltaT;
    } else if (_keyboardState.RightPressed) {
      computedRotation -= Math.PI * deltaT;
    }

    rotation = computedRotation;

    gameEntity.mesh.setRotationFromAxisAngle(
      new Vector3(0, 0, 1),
      computedRotation
    );
    gameEntity.mesh.position.add(computeMovement);

    let testingSphere = (gameEntity.colider as Sphere).clone();
    testingSphere.center.add(computeMovement);

    const colliders = gameEntities.filter(
      (e) =>
        e !== gameEntity &&
        e.entityType !== "bullet" &&
        e.colider &&
        e.colider!.intersectsSphere(testingSphere)
    );
    console.log("testingSphere", colliders.length);

    // Что-то блокирует танк!
    if (colliders.length) {
      return;
    }

    gameEntity.mesh.position.add(computeMovement);
    (gameEntity.colider as Sphere).center.add(computeMovement);

    camera.position.set(
      gameEntity.mesh.position.x,
      gameEntity.mesh.position.y,
      camera.position.z
    );
  };

  return {
    ...gameEntity,
    // load,
    // update,
  };
}

export default createPlayerTank;
