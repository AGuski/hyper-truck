import Phaser from 'phaser';
import { TimeTrialScene } from './scenes/time-trial-scene';
import { InfiniteModeScene } from './scenes/infinite-mode-scene';
import { MenuBackgroundScene } from './scenes/menu-background-scene';
import { GameMode, gameState } from './stores/game-state-store';
import { deviceInfo } from './stores/device-store';

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
  
  // Handle active scenes
  Object.entries(SCENE_MAP).forEach(([gameMode, key]) => {
    const scene = game.scene.getScene(key);
    if (scene && game.scene.isActive(key)) {
      console.log(`Handling scene: ${key}`);
      if (key === SCENE_MAP[GameMode.MENU]) {
        // Only sleep the menu background scene
        console.log(`Sleeping MenuBackgroundScene: ${key}`);
        game.scene.sleep(key);
      } else {
        // Destroy other scenes
        console.log(`Destroying scene: ${key}`);
        game.scene.remove(key);
        // Re-add the scene to the manager
        game.scene.add(key, gameMode === GameMode.TIME_TRIAL ? TimeTrialScene : InfiniteModeScene);
      }
    }
  });
  
  // Start the new scene if it exists
  const targetScene = game.scene.getScene(sceneKey);
  if (targetScene) {
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

/**
 * Handles game resizing based on device orientation and screen size
 * @param game - The Phaser game instance
 */
function handleGameResize(game: Phaser.Game): void {
  // Get current dimensions
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Update the game size
  game.scale.resize(width, height);
  
  // Force redraw of the canvas with correct dimensions
  game.scale.refresh();
}

export function createPhaserGame(config: GameConfig): () => void {
  console.log('Creating Phaser game with config:', config);

  // Game configuration
  const phaserConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: config.parent,
    width: config.width,
    height: config.height,
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
    // Scale mode for responsive design
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      expandParent: true
    }
  };

  // Create the game instance
  const game = new Phaser.Game(phaserConfig);
  
  // Set up orientation change and resize handlers
  let orientationChangeTimeout: number | null = null;
  
  const handleOrientationChange = (): void => {
    // Clear any existing timeout
    if (orientationChangeTimeout !== null) {
      window.clearTimeout(orientationChangeTimeout);
    }
    
    // Add a small delay to ensure dimensions have updated
    orientationChangeTimeout = window.setTimeout(() => {
      handleGameResize(game);
      orientationChangeTimeout = null;
    }, 200);
  };
  
  // Listen for orientation changes
  window.addEventListener('orientationchange', handleOrientationChange);
  window.addEventListener('resize', handleOrientationChange);
  
  // Subscribe to our device store for orientation changes
  const unsubscribeDevice = deviceInfo.subscribe(() => {
    handleOrientationChange();
  });
  
  // Start the initial scene based on the current game mode
  startSceneForGameMode(game, config.mode || GameMode.MENU);
  
  // Subscribe to game state changes to handle scene switching
  const unsubscribeGameState = gameState.subscribe(state => {
    startSceneForGameMode(game, state.currentMode);
  });

  // Return a cleanup function
  return (): void => {
    // Unsubscribe from stores
    unsubscribeGameState();
    unsubscribeDevice();
    
    // Remove event listeners
    window.removeEventListener('orientationchange', handleOrientationChange);
    window.removeEventListener('resize', handleOrientationChange);
    
    // Clear any pending timeouts
    if (orientationChangeTimeout !== null) {
      window.clearTimeout(orientationChangeTimeout);
    }
    
    // Destroy the game instance
    game.destroy(true);
  };
}
