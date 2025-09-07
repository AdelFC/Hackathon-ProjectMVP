/**
 * Debug utility for localStorage persistence issues
 */

export const debugStorage = () => {
  console.group('🔍 Storage Debug Info');
  
  // Check localStorage availability
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    console.log('✅ localStorage is available');
  } catch (e) {
    console.error('❌ localStorage is NOT available:', e);
  }
  
  // List all stored keys
  console.log('📦 Stored keys:', Object.keys(localStorage));
  
  // Check for Zustand stores
  const stores = ['project-storage', 'strategy-storage', 'integration-storage', 'preferences-storage'];
  stores.forEach(storeName => {
    const data = localStorage.getItem(storeName);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`✅ ${storeName}:`, parsed);
      } catch (e) {
        console.error(`❌ Error parsing ${storeName}:`, e);
      }
    } else {
      console.warn(`⚠️ ${storeName} not found in localStorage`);
    }
  });
  
  console.groupEnd();
};

// Auto-run on page load in development
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    debugStorage();
  });
}

// Expose to window for manual debugging
if (typeof window !== 'undefined') {
  (window as any).debugStorage = debugStorage;
}