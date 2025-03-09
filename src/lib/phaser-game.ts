import Phaser from 'phaser';
import { TimeTrialScene } from './scenes/time-trial-scene';
import { InfiniteModeScene } from './scenes/infinite-mode-scene';
import { MenuBackgroundScene } from './scenes/menu-background-scene';
import { GameMode, gameState } from './stores/game-state-store';

/**
 * Configuration interface for the Phaser game
 */
interface GameConfig {
  parent: HTMLElement;
  width: number;
  height: number;
  mode?: GameMode;
}

/**
 * Creates and initializes a Phaser game instance
 * @param config - Configuration for the game
 * @returns A cleanup function to destroy the game when no longer needed
 */
/**
 * Maps game modes to their corresponding scene keys
 */
const SCENE_MAP = {
  [GameMode.MENU]: 'MenuBackgroundScene',
  [GameMode.TIME_TRIAL]: 'TruckScene',  // Updated to match the key in TimeTrialScene constructor
  [GameMode.INFINITE]: 'InfiniteModeScene'
};

/**
 * Starts the appropriate scene based on the game mode
 * @param game - The Phaser game instance
 * @param mode - The game mode to start
 */
function startSceneForGameMode(game: Phaser.Game, mode: GameMode): void {
  const sceneKey = SCENE_MAP[mode];
  
  console.log(`Switching to game mode: ${mode}, scene: ${sceneKey}`);
  
  // Stop all active scenes first
  Object.values(SCENE_MAP).forEach(key => {
    if (game.scene.isActive(key)) {
      console.log(`Stopping scene: ${key}`);
      game.scene.sleep(key);
    }
  });

  console.log(game.scene.getScene(sceneKey));
  
  // Start the new scene if it exists
  if (game.scene.getScene(sceneKey)) {
    if (game.scene.isSleeping(sceneKey)) {
      console.log(`Waking scene: ${sceneKey}`);
      game.scene.wake(sceneKey);
    } else {
      console.log(`Starting scene: ${sceneKey}`);
      game.scene.start(sceneKey);
    }
  } else {
    console.error(`Scene ${sceneKey} not found!`);
  }
}

export function createPhaserGame(config: GameConfig): () => void {

  console.log('Creating Phaser game with config:', config);

  const dpiRatio = window.devicePixelRatio;
  // Game configuration
  const phaserConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: config.parent,
    width: config.width*dpiRatio,
    height: config.height*dpiRatio,
    backgroundColor: '#111111',
    scene: [
      MenuBackgroundScene,
      TimeTrialScene,
      InfiniteModeScene
    ],
    // Basic rendering settings for sharper display
    roundPixels: true,
    antialias: true,
    // Add a canvas renderer with pixel art mode disabled
    render: {
      pixelArt: false
    },
    // Scale mode for high-DPI displays
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };

  // Create the game instance
  const game = new Phaser.Game(phaserConfig);
  
  // Start the initial scene based on the current game mode
  startSceneForGameMode(game, config.mode || GameMode.MENU);
  
  // Subscribe to game state changes to handle scene switching
  const unsubscribe = gameState.subscribe(state => {
    startSceneForGameMode(game, state.currentMode);
  });

  // Return a cleanup function
  return (): void => {
    // Unsubscribe from the game state store
    unsubscribe();
    // Destroy the game instance
    game.destroy(true);
  };
}
