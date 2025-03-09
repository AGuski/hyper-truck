import { writable } from 'svelte/store';

/**
 * Available game modes
 */
export enum GameMode {
  MENU = 'menu',
  TIME_TRIAL = 'time-trial',
  INFINITE = 'infinite-mode'
}

/**
 * Interface defining the game state
 */
export interface GameState {
  // Current game mode
  currentMode: GameMode;
  
  // Player settings
  playerName: string;
  
  // Game settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  
  // Session data
  lastPlayedMode: GameMode | null;
  sessionStartTime: number;
  
  // Persistence
  savePreferences: boolean;
}

/**
 * Default game state values
 */
const DEFAULT_GAME_STATE: GameState = {
  currentMode: GameMode.MENU,
  playerName: 'Player',
  soundEnabled: true,
  musicEnabled: true,
  lastPlayedMode: null,
  sessionStartTime: Date.now(),
  savePreferences: true
};

/**
 * Global game state store using Svelte's state management
 * This provides reactive access to game state throughout the application
 */
export const gameState = writable<GameState>(loadGameState());

/**
 * Loads game state from localStorage if available
 * @returns The loaded game state or default values
 */
function loadGameState(): GameState {
  if (typeof window === 'undefined') {
    return DEFAULT_GAME_STATE;
  }
  
  try {
    const savedState = localStorage.getItem('hyper-truck-game-state');
    
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      
      // Ensure we have all required properties by merging with defaults
      return { ...DEFAULT_GAME_STATE, ...parsedState };
    }
  } catch (error) {
    console.error('Failed to load game state from localStorage:', error);
  }
  
  return DEFAULT_GAME_STATE;
}

/**
 * Saves the current game state to localStorage
 * @param state - The current game state to save
 */
export function saveGameState(state: GameState): void {

  // COMMMENTED OUT FOR TESTING!!!

  // if (typeof window === 'undefined' || !state.savePreferences) {
  //   return;
  // }
  
  // try {
  //   localStorage.setItem('hyper-truck-game-state', JSON.stringify(state));
  // } catch (error) {
  //   console.error('Failed to save game state to localStorage:', error);
  // }
}

/**
 * Sets the current game mode
 * @param mode - The game mode to set
 */
export function setGameMode(mode: GameMode): void {
  gameState.update(state => {
    const updatedState = { 
      ...state, 
      currentMode: mode,
      lastPlayedMode: mode !== GameMode.MENU ? mode : state.lastPlayedMode
    };
    
    saveGameState(updatedState);
    return updatedState;
  });
}

/**
 * Updates the player name
 * @param name - The new player name
 */
export function setPlayerName(name: string): void {
  gameState.update(state => {
    const updatedState = { ...state, playerName: name };
    saveGameState(updatedState);
    return updatedState;
  });
}

/**
 * Toggles sound effects on/off
 * @param enabled - Whether sound should be enabled
 */
export function setSoundEnabled(enabled: boolean): void {
  gameState.update(state => {
    const updatedState = { ...state, soundEnabled: enabled };
    saveGameState(updatedState);
    return updatedState;
  });
}

/**
 * Toggles background music on/off
 * @param enabled - Whether music should be enabled
 */
export function setMusicEnabled(enabled: boolean): void {
  gameState.update(state => {
    const updatedState = { ...state, musicEnabled: enabled };
    saveGameState(updatedState);
    return updatedState;
  });
}

/**
 * Resets game state to default values
 */
export function resetGameState(): void {
  gameState.set(DEFAULT_GAME_STATE);
  saveGameState(DEFAULT_GAME_STATE);
}
