import { writable } from 'svelte/store';

/**
 * Device orientation types
 */
export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

/**
 * Interface defining device information
 */
export interface DeviceInfo {
  isMobile: boolean;
  orientation: Orientation;
  width: number;
  height: number;
}

/**
 * Checks if the current device is a mobile device
 * @returns boolean indicating if the device is mobile
 */
function detectMobile(): boolean {
  // Use navigator.userAgent to detect mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Regular expressions to match mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Check if screen size is typical for mobile devices (as a fallback)
  const screenSizeCheck = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent) || screenSizeCheck;
}

/**
 * Determines the current device orientation
 * @returns The current orientation (portrait or landscape)
 */
function getOrientation(): Orientation {
  return window.innerHeight > window.innerWidth 
    ? Orientation.PORTRAIT 
    : Orientation.LANDSCAPE;
}

/**
 * Creates and returns the device info store
 * @returns A writable store with device information
 */
function createDeviceStore() {
  // Create a writable store with default values
  // Default to non-mobile and landscape since we'll update immediately
  const deviceStore = writable<DeviceInfo>({
    isMobile: false,
    orientation: Orientation.LANDSCAPE,
    width: 0,
    height: 0
  });

  // Function to update the device info
  const updateDeviceInfo = () => {
    deviceStore.update(() => ({
      isMobile: detectMobile(),
      orientation: getOrientation(),
      width: window.innerWidth,
      height: window.innerHeight
    }));
  };

  // Only run in browser environment
  if (typeof window !== 'undefined') {
    // Initial update
    updateDeviceInfo();
    
    // Add event listeners for orientation and resize changes
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    // Clean up event listeners when the store is no longer used
    return {
      ...deviceStore,
      destroy: () => {
        window.removeEventListener('resize', updateDeviceInfo);
        window.removeEventListener('orientationchange', updateDeviceInfo);
      }
    };
  }
  
  return deviceStore;
}

/**
 * Device information store
 * Provides reactive access to device type and orientation
 */
export const deviceInfo = createDeviceStore();

/**
 * Derived helper to check if device is in portrait mode
 * @returns True if the device is in portrait orientation
 */
export function isPortrait(): boolean {
  let result = false;
  
  deviceInfo.subscribe(info => {
    result = info.orientation === Orientation.PORTRAIT;
  })();
  
  return result;
}

/**
 * Derived helper to check if device is in landscape mode
 * @returns True if the device is in landscape orientation
 */
export function isLandscape(): boolean {
  let result = false;
  
  deviceInfo.subscribe(info => {
    result = info.orientation === Orientation.LANDSCAPE;
  })();
  
  return result;
}

/**
 * Derived helper to check if current device is mobile
 * @returns True if the device is mobile
 */
export function isMobileDevice(): boolean {
  let result = false;
  
  deviceInfo.subscribe(info => {
    result = info.isMobile;
  })();
  
  return result;
}
