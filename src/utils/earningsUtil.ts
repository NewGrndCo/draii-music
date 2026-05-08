// Base rate per second in dollars
export const BASE_EARNING_RATE_PER_SECOND = 0.001486;

// Maximum rate per second in dollars
export const MAX_EARNING_RATE = 0.001783;

// Heart value in dollars - updated to exactly 0.30
export const HEART_VALUE = 0.30;

// Initial reserve pool amount in dollars ($6219.74)
export const INITIAL_RESERVE_POOL = 6219.74;

// Current fluctuating rate - initialize with base
let currentRate = BASE_EARNING_RATE_PER_SECOND;

// Session total
let sessionTotal = 0;

// Network user count simulation (50-100 users to ensure always active)
let networkUsers = Math.floor(Math.random() * 30) + 70; // Bias toward higher user count for demo

// Use memoization to improve performance - clear rarely used keys
const rates = new Map<string, number>();

// Performance optimization - clear the memoization cache when it gets too large
const clearRatesCache = () => {
  if (rates.size > 1000) {
    rates.clear();
  }
};

// Get the current earning rate with fluctuations
export const getEarningRate = (): number => {
  return currentRate;
};

// Get current network users count
export const getNetworkUsers = (): number => {
  return networkUsers;
};

// Update network users count (simulate users joining/leaving)
export const updateNetworkUsers = (): number => {
  // Random fluctuation in user count, but bias toward higher values for demo
  const change = Math.floor(Math.random() * 5) - 1; // -1 to +3 bias
  networkUsers = Math.max(70, Math.min(100, networkUsers + change)); // Minimum 70 users for demo
  return networkUsers;
};

// Update the rate with a fluctuation (called periodically)
export const updateEarningRate = (): number => {
  // Update network users
  updateNetworkUsers();
  
  // User factor based on network size (more users = higher rate)
  const userFactor = Math.min(1.0, networkUsers / 100);
  
  // Apply user factor to calculate base rate between BASE and MAX
  const baseRateForUsers = BASE_EARNING_RATE_PER_SECOND + 
    ((MAX_EARNING_RATE - BASE_EARNING_RATE_PER_SECOND) * userFactor);
  
  // Add random fluctuation of up to 20% up or down
  const fluctuationFactor = 1 + ((Math.random() - 0.5) * 0.4); // Range: 0.8 to 1.2 (±20%)
  
  // Apply fluctuation to the base rate and round to 6 decimal places
  currentRate = Math.round(baseRateForUsers * fluctuationFactor * 1000000) / 1000000;
  
  return currentRate;
};

// Calculate earnings for a given duration in seconds
export const calculateEarnings = (seconds: number): number => {
  // Performance optimization for small values
  if (seconds < 0.01) return 0;
  
  // Calculate earnings based on current rate
  const earnings = seconds * currentRate;
  
  // Update session total
  sessionTotal += earnings;
  
  // Periodically clear cache for performance
  if (Math.random() < 0.01) {
    clearRatesCache();
  }
  
  return earnings;
};

// Get current session total
export const getSessionTotal = (): number => {
  return sessionTotal;
};

// Reset session total (called when song changes)
export const resetSessionTotal = (): void => {
  sessionTotal = 0;
};

// Enhanced formatting functions
export const formatEarnings = (dollars: number): string => {
  // Use toLocaleString for number formatting with 2 decimal places
  return `$${dollars.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

// More precise rate formatting - show 4 decimal places for cents
export const formatRate = (rate: number): string => {
  return `${(rate * 100).toFixed(4)}¢/sec`;
};

// Add a reset function for session earnings
export const resetSessionEarnings = (): void => {
  // Reset session total in memory
  sessionTotal = 0;
  // Reset session total in localStorage
  localStorage.removeItem('sessionTotal');
};

// Enhanced total earnings reset with optional reserve pool preservation
export const resetTotalEarnings = (preserveReservePool: boolean = true): number => {
  // Only reset the user earnings, not the initial reserve
  localStorage.setItem('userEarnings', '0');
  return preserveReservePool ? INITIAL_RESERVE_POOL : 0;
};

// Get user earnings from local storage (without reserve pool)
export const getUserEarnings = (): number => {
  const stored = localStorage.getItem('userEarnings');
  return stored ? parseFloat(stored) : 0;
};

// Store total earnings in local storage (only user earnings, not reserve)
export const storeTotalEarnings = (additionalEarnings: number): number => {
  // Skip very small values to reduce storage operations
  if (additionalEarnings < 0.0001) return getUserEarnings();
  
  const currentEarnings = getUserEarnings();
  const newTotal = currentEarnings + additionalEarnings;
  localStorage.setItem('userEarnings', newTotal.toString());
  return newTotal;
};

// Commit session earnings to total (used when song ends or is skipped)
export const commitSessionEarnings = (): number => {
  const currentSessionTotal = getSessionTotal();
  if (currentSessionTotal > 0) {
    const newTotal = storeTotalEarnings(currentSessionTotal);
    resetSessionTotal();
    return newTotal;
  }
  return getUserEarnings();
};

// Deduct from total earnings (for heart interactions)
export const deductFromTotalEarnings = (amount: number): number => {
  const currentEarnings = getUserEarnings();
  const newTotal = Math.max(0, currentEarnings - amount);
  localStorage.setItem('userEarnings', newTotal.toString());
  return newTotal;
};

// Get total earnings (user earnings plus reserve pool)
export const getTotalEarnings = (): number => {
  return getUserEarnings();
};

// Get payment info from local storage
export const getPaymentInfo = (): { type: 'cashapp' | 'paypal', value: string } | null => {
  const stored = localStorage.getItem('paymentInfo');
  return stored ? JSON.parse(stored) : null;
};

// Store payment info in local storage
export const storePaymentInfo = (type: 'cashapp' | 'paypal', value: string): void => {
  localStorage.setItem('paymentInfo', JSON.stringify({ type, value }));
};

// Check if payment threshold reached
export const isPaymentThresholdReached = (): boolean => {
  return getUserEarnings() >= 15; // $15 threshold
};
