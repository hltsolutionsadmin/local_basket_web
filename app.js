const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { execSync } = require('child_process');

let appWindow;

// Helper: Get default printer name from Windows registry (fallback)
function getWindowsDefaultPrinterName() {
  try {
    const result = execSync(
      'reg query "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Windows" /v Device',
      { encoding: 'utf8' }
    );
    const match = result.match(/Device\s+REG_SZ\s+([^,]+)/);
    return match ? match[1].trim() : null;
  } catch (err) {
    console.error('[Main] Failed to read default printer from registry:', err);
    return null;
  }
}

function createWindow() {
  appWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    title: "Local Basket",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      allowServiceWorkers: true,
      sandbox: false,
    },
  });

  const indexPath = path.join(__dirname, 'dist/eato/browser/index.html');

  if (process.env.NODE_ENV === 'development') {
    appWindow.loadURL('http://localhost:4200')
      .then(() => console.log('[Main] Loaded dev server'))
      .catch((err) => console.error('[Main] Error loading dev server:', err));
  } else {
    appWindow.loadFile(indexPath)
      .then(() => console.log('[Main] index.html loaded successfully'))
      .catch((err) => console.error('[Main] Error loading index.html:', err));
  }

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });

  appWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('[Main] Failed to load:', errorDescription, 'Retrying...');
    appWindow.loadFile(indexPath)
      .then(() => console.log('[Main] Retried loading index.html successfully'))
      .catch((err) => console.error('[Main] Retry failed:', err));
  });
}

app.whenReady().then(() => {
  session.defaultSession.clearStorageData({ storages: ['permissions'] }).then(() => {
    createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC: Get available printers
ipcMain.handle('get-printers', async () => {
  try {
    const printers = await appWindow.webContents.getPrintersAsync();
    console.log('[Main] Available printers:', printers);
    return printers;
  } catch (err) {
    console.error('[Main] Error fetching printers:', err);
    return [];
  }
});

// IPC: Get default printer name
ipcMain.handle('get-default-printer', async () => {
  try {
    const printers = await appWindow.webContents.getPrintersAsync();
    let defaultPrinter = printers.find(p => p.isDefault);

    // Fallback: Registry
    if (!defaultPrinter) {
      console.warn('[Main] No default printer marked by Electron — checking registry...');
      const winDefaultName = getWindowsDefaultPrinterName();
      if (winDefaultName) {
        // Improved matching: trim and case-insensitive
        defaultPrinter = printers.find(p => p.name.trim().toLowerCase() === winDefaultName.trim().toLowerCase());
        if (defaultPrinter) {
          console.log('[Main] Default printer resolved via registry:', defaultPrinter.name);
        } else {
          console.warn('[Main] Registry default printer not found in Electron list.');
        }
      }
    }

    // Final fallback: Hardcoded
    if (!defaultPrinter) {
      const fallbackName = 'POS58 Printer(6)'; // Your known fallback
      defaultPrinter = printers.find(p => p.name.trim().toLowerCase() === fallbackName.trim().toLowerCase());
      if (defaultPrinter) {
        console.log('[Main] Using fallback printer:', fallbackName);
      }
    }

    return defaultPrinter ? defaultPrinter.name : null;
  } catch (err) {
    console.error('[Main] Error getting default printer:', err);
    return null;
  }
});

// IPC: Print handler (now accepts HTML and optional deviceName)
ipcMain.handle('print', async (event, html, deviceName) => {
  try {
    const printWin = new BrowserWindow({ show: false, webPreferences: { webSecurity: false } });
    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    return new Promise((resolve) => {
      printWin.webContents.on('did-finish-load', () => {
        const options = { silent: true };
        if (deviceName) {
          options.deviceName = deviceName;
          console.log('[Main] Printing via specified device:', deviceName);
        } else {
          console.log('[Main] Printing via system default (no deviceName provided)');
        }

        printWin.webContents.print(options, (success, error) => {
          printWin.destroy();
          if (!success) {
            console.error('[Main] Print failed:', error);
            resolve({ success: false, error: error || 'Print failed' });
          } else {
            console.log('[Main] Print job sent successfully.');
            resolve({ success: true });
          }
        });
      });

      // Timeout for load failure
      setTimeout(() => {
        if (!printWin.isDestroyed()) {
          printWin.destroy();
          resolve({ success: false, error: 'Print load timeout' });
        }
      }, 10000);
    });
  } catch (err) {
    console.error('[Main] Print error:', err);
    return { success: false, error: err.message };
  }
});