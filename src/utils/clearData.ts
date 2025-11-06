/**
 * Utility to clear corrupted localStorage data
 * This can be called from the browser console if the app gets stuck
 */

export function clearTrackerData() {
  try {
    localStorage.removeItem('tracker-data-v2');
    console.log('✓ Tracker data cleared successfully');
    console.log('Please refresh the page to start fresh');
    return true;
  } catch (error) {
    console.error('Failed to clear tracker data:', error);
    return false;
  }
}

export function clearAllAppData() {
  try {
    // Get all keys
    const keys = Object.keys(localStorage);
    const trackerKeys = keys.filter(key => 
      key.startsWith('tracker-') || 
      key.includes('trackora') ||
      key === 'theme'
    );
    
    // Remove tracker-related keys
    trackerKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✓ Removed: ${key}`);
    });
    
    console.log('✓ All app data cleared successfully');
    console.log('Please refresh the page to start fresh');
    return true;
  } catch (error) {
    console.error('Failed to clear app data:', error);
    return false;
  }
}

// Make these functions available globally in development
if (typeof window !== 'undefined') {
  (window as any).clearTrackerData = clearTrackerData;
  (window as any).clearAllAppData = clearAllAppData;
  console.log('Debug utilities loaded. Available functions:');
  console.log('  - clearTrackerData(): Clear tracker data only');
  console.log('  - clearAllAppData(): Clear all app data including theme');
}
