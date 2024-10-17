import { MeshStandardMaterial, PlaneGeometry, Vector3 } from "three";
import createResourceManager from "../utils/ResourceManager";
import createGameEntity, { GameEntity } from "../entities/GameEntity";

function createMapTile(position: Vector3): GameEntity {
  const gameEntity = createGameEntity(position);

  gameEntity.load = async () => {
    const resourceManager = createResourceManager();
    await resourceManager.load();
    const tileTexture = await resourceManager.getRandomGroundTexture();
    const geometry = new PlaneGeometry(1, 1);
    const material = new MeshStandardMaterial({
      map: tileTexture,
    });

    gameEntity.mesh.geometry = geometry;
    gameEntity.mesh.material = material;
    gameEntity.mesh.position.set(position.x, position.y, position.z);
  };

  return {
    ...gameEntity,
    // load,
  };
}

interface GameMap extends GameEntity {
  tiles: GameEntity[];
}

function createGameMap(position: Vector3, size: number): GameMap {
  const gameEntity = createGameEntity(position);
  const tiles: GameEntity[] = [];

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      tiles.push(createMapTile(new Vector3(i, j, 0)));
    }
  }

  gameEntity.load = async () => {
    for (const tile of tiles) {
      await tile.load();
      gameEntity.mesh.add(tile.mesh);
    }
  };

  return {
    ...gameEntity,
    tiles,
    // load,
  };
}

export { createGameEntity, createMapTile, createGameMap };
