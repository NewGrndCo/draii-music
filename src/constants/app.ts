
// Performance constants
export const EARNINGS_UPDATE_INTERVAL = 2000; // 2 seconds instead of 1 for better performance
export const RATE_UPDATE_INTERVAL = 2000;

// UI constants
export const MOBILE_BREAKPOINT = 768;
export const ANIMATION_DURATION = 300;

// Audio constants
export const SKIP_DURATION = 10; // seconds
export const DEFAULT_VOLUME = 0.7;

// Earnings constants (imported from earningsUtil)
export { 
  BASE_EARNING_RATE_PER_SECOND,
  MAX_EARNING_RATE,
  HEART_VALUE,
  INITIAL_RESERVE_POOL 
} from '../utils/earningsUtil';

// Network constants
export const MIN_NETWORK_USERS = 70;
export const MAX_NETWORK_USERS = 100;

// Cache constants
export const MAX_CACHE_SIZE = 1000;
export const CACHE_CLEANUP_PROBABILITY = 0.01;
