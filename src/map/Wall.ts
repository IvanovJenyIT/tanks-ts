import { Box3, BoxGeometry, MeshStandardMaterial, Vector3 } from "three";
import createGameEntity, { GameEntity } from "../entities/GameEntity";
import createResourceManager from "../utils/ResourceManager";

function createWall(position: Vector3): GameEntity {
  const gameEntity = createGameEntity(position);

  gameEntity.load = async () => {
    const resourceManager = createResourceManager();
    await resourceManager.load();

    // debugger;

    const wallTexture = resourceManager.getTexture("wall");

    if (!wallTexture) {
      throw new Error("unable to get wall texture");
    }

    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({
      map: wallTexture,
    });

    gameEntity.mesh.geometry = geometry;
    gameEntity.mesh.material = material;
    gameEntity.mesh.position.set(position.x, position.y, position.z);
    // debugger;
    // const meshWall = gameEntity.mesh;
    gameEntity.colider = new Box3().setFromObject(gameEntity.mesh);
  };

  return {
    ...gameEntity,
    // load,
  };
}

export default createWall;
