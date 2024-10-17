import { Texture, TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface IResourceManager {
  load: () => Promise<void>;
  getRandomGroundTexture: () => Promise<Texture>;
  getModel: (modelName: string) => GLTF | undefined;
  getTexture: (textureName: string) => Texture | undefined;
}

const createResourceManager = (): IResourceManager => {
  const groundTextures: Texture[] = [];
  const model = new Map<string, GLTF>();
  const texture = new Map<string, Texture>();

  const loadTextures = async (textureLoader: TextureLoader) => {
    const tankBodyTexture = await textureLoader.loadAsync(
      "textures/tank-body.png"
    );
    const tankTurrentTexture = await textureLoader.loadAsync(
      "textures/tank-turret.png"
    );

    texture.set("tank-body", tankBodyTexture);
    texture.set("tank-turrent", tankTurrentTexture);

    //wall texture
    const wallTexture = await textureLoader.loadAsync("textures/wall.png");
    texture.set("wall", wallTexture);
  };

  const loadModels = async () => {
    const modelLoader = new GLTFLoader();
    const playerTank = await modelLoader.loadAsync("models/tank.glb");
    model.set("tannk", playerTank);
  };

  const loadGroundTextures = async (textureLoader: TextureLoader) => {
    const groundTextureFiles = [
      "g1.png",
      "g2.png",
      "g3.png",
      "g4.png",
      "g5.png",
      "g6.png",
      "g7.png",
      "g8.png",
    ];

    for (const file of groundTextureFiles) {
      const texture = await textureLoader.loadAsync(`textures/${file}`);
      groundTextures.push(texture);
    }
  };

  const getModel = (modelName: string): GLTF | undefined => {
    return model.get(modelName);
  };

  const getTexture = (textureName: string): Texture | undefined => {
    return texture.get(textureName);
  };

  const load = async () => {
    const textureLoader = new TextureLoader();
    await loadGroundTextures(textureLoader);
    await loadTextures(textureLoader);
    await loadModels();
  };

  const getRandomGroundTexture = async () => {
    return groundTextures[Math.floor(Math.random() * groundTextures.length)];
  };

  return {
    load,
    getRandomGroundTexture,
    getModel,
    getTexture,
  };
};

export default createResourceManager;
