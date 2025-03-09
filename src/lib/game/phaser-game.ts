import Phaser from 'phaser';
import { TimeTrialScene } from './scenes/time-trial-scene';
import { InfiniteModeScene } from './scenes/infinite-mode-scene';
import { MenuBackgroundScene } from './scenes/menu-background-scene';

/**
 * Configuration interface for the Phaser game
 */
interface GameConfig {
  parent: HTMLElement;
  width: number;
  height: number;
  mode?: 'time-trial' | 'infinite' | 'menu-background';
}

/**
 * Creates and initializes a Phaser game instance
 * @param config - Configuration for the game
 * @returns A cleanup function to destroy the game when no longer needed
 */
export function createPhaserGame(config: GameConfig): () => void {

  const dpiRatio = window.devicePixelRatio;
  // Game configuration
  const phaserConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: config.parent,
    width: config.width*dpiRatio,
    height: config.height*dpiRatio,
    backgroundColor: '#111111',
    scene: [
      // MenuBackgroundScene
      config.mode === 'time-trial' 
        ? TimeTrialScene : InfiniteModeScene
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


  // Return a cleanup function
  return (): void => {
    game.destroy(true);
  };
}
