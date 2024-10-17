import { Box3, Mesh, Sphere, Vector3 } from "three";

export interface GameEntity {
  mesh: Mesh;
  load: () => Promise<void>;
  update: (newDelta: number) => void;
  dispose: () => void;
  colider: Box3 | Sphere;
  entityType: GameEntityType;
  shouldDispose: boolean;
}

type GameEntityType = "general" | "player" | "bullet";

function createGameEntity(
  position: Vector3,
  entityType: GameEntityType = "general"
): GameEntity {
  const _position = position;
  let mesh = new Mesh();
  let colider = new Box3() || new Sphere();
  mesh.position.set(_position.x, _position.y, _position.z);
  let shouldDispose = false;

  return {
    mesh,
    load: async () => {},
    update: (delta: number) => {},
    dispose: () => {},
    colider,
    entityType,
    shouldDispose,
  };
}

export default createGameEntity;
