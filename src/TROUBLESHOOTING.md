# Trackora Troubleshooting Guide

## Common Issues and Solutions

### Blank Screen / DecimalError: Invalid argument: NaN

If you encounter a blank screen with a `DecimalError: Invalid argument: NaN` error, this means there's corrupted data in your browser's localStorage.

#### Quick Fix (Recommended)

1. Open your browser's Developer Console:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows/Linux) / `Cmd+Option+K` (Mac)
   - **Safari**: Enable Developer menu in Preferences, then press `Cmd+Option+C`

2. In the console, type one of these commands and press Enter:

   ```javascript
   // Option 1: Clear only tracker data (keeps theme settings)
   clearTrackerData()
   ```

   ```javascript
   // Option 2: Clear all app data including theme
   clearAllAppData()
   ```

3. Refresh the page (`F5` or `Ctrl+R` / `Cmd+R`)

#### Manual Fix

If the above doesn't work, manually clear localStorage:

1. Open Developer Console (see above)
2. Go to the "Application" tab (Chrome/Edge) or "Storage" tab (Firefox)
3. In the left sidebar, expand "Local Storage"
4. Click on your domain
5. Find and delete the `tracker-data-v2` key
6. Refresh the page

#### Alternative: Settings Menu

1. If you can access the Settings page:
2. Click "Clear All Data" button
3. Confirm the action
4. The app will reset to initial state

### Data Not Saving

If your data isn't persisting between sessions:

1. Check if your browser allows localStorage
2. Check if you're in Private/Incognito mode (some browsers restrict storage)
3. Try exporting your data (Settings → Export JSON) as a backup
4. Clear browser cache and try again

### Charts Not Displaying

If charts appear blank or show errors:

1. Make sure you have added at least one protocol
2. Make sure you have tracked some data for the current month
3. Try switching months and coming back
4. Clear cache and refresh

### Performance Issues

If the app feels slow:

1. Check how much data you have stored (Export JSON to see file size)
2. Consider clearing old months' data you no longer need
3. Reduce the number of active protocols if you have many

## Browser Compatibility

Trackora works best on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Reporting Issues

If none of these solutions work:

1. Note the exact error message from the console
2. Export your data if possible (Settings → Export JSON)
3. Note which browser and version you're using
4. Note what you were doing when the error occurred

## Data Export/Import

Always keep a backup of your data:

1. Go to Settings
2. Click "Export JSON"
3. Save the file somewhere safe
4. To restore: Click "Import JSON" and select your saved file

## Reset Everything

To start completely fresh:

1. Run `clearAllAppData()` in the console, OR
2. Go to Settings → Clear All Data, OR
3. Manually clear all localStorage data for the site

After resetting, refresh the page and the app will start with a clean slate.
