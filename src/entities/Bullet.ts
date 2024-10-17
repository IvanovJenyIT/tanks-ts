import {
  Box3,
  Material,
  Mesh,
  MeshPhongMaterial,
  Sphere,
  SphereGeometry,
  Vector3,
} from "three";
import createGameEntity, { GameEntity } from "./GameEntity";

interface Bullet extends GameEntity {
  angle: number;
}

const createBullet = (
  position: Vector3,
  angle: number,
  gameEntities?: GameEntity[]
): Bullet => {
  const entity = createGameEntity(position, "bullet") as Bullet;
  entity.angle = angle;

  entity.load = async () => {
    const bulletGeometry = new SphereGeometry(0.085);
    const bulletMaterial = new MeshPhongMaterial({ color: 0x262626 });

    entity.mesh = new Mesh(bulletGeometry, bulletMaterial);
    entity.mesh.position.set(position.x, position.y, position.z);

    // create the collider
    entity.colider = new Box3()
      .setFromObject(entity.mesh)
      .getBoundingSphere(new Sphere(entity.mesh.position));
  };

  entity.update = (deltaT: number) => {
    const travelSpeed = 9;
    const computedMovement = new Vector3(
      travelSpeed * Math.sin(entity.angle) * deltaT,
      -travelSpeed * Math.cos(entity.angle) * deltaT,
      0
    );

    // move the bullet and its collider
    entity.mesh.position.add(computedMovement);

    // check for collisions
    const colliders =
      gameEntities &&
      gameEntities.filter(
        (c) =>
          c.colider &&
          c !== entity &&
          c.entityType !== "player" &&
          c.colider.intersectsSphere(entity.colider as Sphere)
      );

    // if there is a collision this bullet can be disposed
    if (colliders?.length) {
      entity.shouldDispose = true;
    }
  };

  entity.dispose = () => {
    (entity.mesh.material as Material).dispose();
    entity.mesh.geometry.dispose();
  };

  return entity;
};

export default createBullet;
