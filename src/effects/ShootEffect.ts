import { DodecahedronGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import createGameEntity, { GameEntity } from "../entities/GameEntity";
import { randomIntInRange, randomSign } from "../utils/MathUtils";

const shootEffect = (position: Vector3, angle: number): GameEntity => {
  const entity = createGameEntity(position);
  const fire = new Mesh();
  const smoke = new Mesh();
  const size = 0.1;
  let effectDuration = 1;

  entity.load = async () => {
    const particleGeometry = new DodecahedronGeometry(size, 0);

    const smokeMaterial = new MeshPhongMaterial({
      color: 0xfafafa,
      transparent: true,
    });

    const fireMaterial = new MeshPhongMaterial({ color: 0xff4500 });
    const totalParticles = randomIntInRange(4, 9);

    for (let i = 0; i < totalParticles; i++) {
      // build a random angle offset (very small)
      const angleOffest = Math.PI * 0.08 * Math.random() * randomSign();
      // each particle will have a random speed
      const particleSpeed = 1.75 * Math.random() * 3;
      // build a fire particle
      const fireParticle = new Mesh(particleGeometry, fireMaterial);
      // store this particle info
      fireParticle.userData = {
        angle: angle + angleOffest,
        speed: particleSpeed,
      };
      fire.add(fireParticle);

      // create smoke particles
      const smokePositionOffest = new Vector3(
        Math.random() * size * randomSign(),
        Math.random() * size * randomSign(),
        Math.random() * size * randomSign()
      );
      const smokeParticle = new Mesh(particleGeometry, smokeMaterial);
      smokeParticle.position.add(smokePositionOffest);
      smoke.add(smokeParticle);
    }

    entity.mesh.add(fire);
    entity.mesh.add(smoke);
  };

  entity.update = (deltaT: number) => {
    // update duration
    effectDuration -= deltaT;
    if (effectDuration <= 0) {
      entity.shouldDispose = true;
      return;
    }

    fire.children.forEach((element) => {
      const fireParticle = element as Mesh;
      const angle = fireParticle.userData["angle"];
      const speed = fireParticle.userData["speed"];
      // calculate movement
      const computedMovement = new Vector3(
        speed * Math.sin(angle) * deltaT * effectDuration * 0.75,
        -speed * Math.cos(angle) * deltaT * effectDuration * 0.75
      );
      fireParticle.position.add(computedMovement);
      // update the size (will get smaller as the effects progress)
      fireParticle.scale.set(
        (fireParticle.scale.x = effectDuration),
        (fireParticle.scale.y = effectDuration),
        (fireParticle.scale.z = effectDuration)
      );
    });

    // update smoke opacity and position
    smoke.children.forEach((element) => {
      const smokeParticle = element as Mesh;
      (smokeParticle.material as MeshPhongMaterial).opacity = effectDuration;
      smokeParticle.position.add(new Vector3(0, 0, 3 * deltaT));
    });
  };

  entity.dispose = () => {
    fire.children.forEach((element) => {
      (element as Mesh).geometry.dispose();
      ((element as Mesh).material as MeshPhongMaterial).dispose();
      fire.remove(element);
    });

    entity.mesh.remove(fire);

    smoke.children.forEach((element) => {
      (element as Mesh).geometry.dispose();
      ((element as Mesh).material as MeshPhongMaterial).dispose();
      smoke.remove(element);
    });

    entity.mesh.remove(smoke);
  };

  return {
    ...entity,
  };
};

export default shootEffect;
