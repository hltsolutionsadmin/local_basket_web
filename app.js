// app.js
const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("path");
const fs = require("fs");

let appWindow;

function createWindow() {
  appWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    title: "Local Basket",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      sandbox: false,
    },
  });

  const indexPath = path.join(__dirname, "dist/eato/browser/index.html");

  if (process.env.NODE_ENV === "development") {
    appWindow
      .loadURL("http://localhost:4200")
      .then(() => console.log("[Main] Loaded dev server"))
      .catch((err) => console.error("[Main] Error loading dev server:", err));
  } else {
    appWindow
      .loadFile(indexPath)
      .then(() => console.log("[Main] index.html loaded successfully"))
      .catch((err) => console.error("[Main] Error loading index.html:", err));
  }

  appWindow.webContents.on("did-fail-load", () => {
    appWindow.loadFile(indexPath);
  });
}

app.whenReady().then(() => {
  session.defaultSession
    .clearStorageData({ storages: ["permissions"] })
    .then(() => {
      createWindow();
    });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("get-printers", async () => {
  try {
    const printers = await appWindow.webContents.getPrintersAsync();
    console.log("[Main] Available printers:", printers);
    return printers;
  } catch (err) {
    console.error("[Main] Error fetching printers:", err);
    return [];
  }
});

// ✅ Silent print with image rasterization (works for POS58)
ipcMain.handle("print", async (event, html, deviceName) => {
  try {
    if (!deviceName) return { success: false, error: "No printer selected" };

    console.log(`[Main] 🖨 Starting print job for: ${deviceName}`);

    const printableHtml = html?.trim()
      ? html
      : `
        <div style="font-family: monospace; font-size: 14px; padding: 10px;">
          <h2 style="text-align:center;">Local Basket</h2>
          <p>------------------------------------</p>
          <p><b>Order #1234</b></p>
          <p>Item 1 .......... ₹50</p>
          <p>Item 2 .......... ₹25</p>
          <p>------------------------------------</p>
          <p>Total ........... ₹75</p>
          <p style="text-align:center;">Thank you!</p>
        </div>
      `;

    // Create hidden print window
    const printWin = new BrowserWindow({
      width: 380,
      height: 600,
      show: true, // visible for rendering (POS printers need it)
      webPreferences: { contextIsolation: true },
    });

    const htmlPage = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: monospace; margin: 0; padding: 10px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${printableHtml}</body>
      </html>
    `;

    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlPage)}`);

    await new Promise((resolve) => {
      printWin.webContents.once("did-finish-load", resolve);
    });

    console.log("[Main] Rendering print window to image...");

    // ✅ Capture the HTML as an image (so printer gets raster data)
    const image = await printWin.webContents.capturePage();
    const imgPath = path.join(app.getPath("temp"), "receipt.png");
    fs.writeFileSync(imgPath, image.toPNG());
    console.log("[Main] Image saved to:", imgPath);

    // Load that image for printing
    const imageHtml = `
      <html>
        <body style="margin:0; padding:0;">
          <img src="file://${imgPath}" style="width:100%;" />
        </body>
      </html>
    `;
    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(imageHtml)}`);

    await new Promise((resolve) => {
      printWin.webContents.once("did-finish-load", resolve);
    });

    console.log(`[Main] Printing silently to ${deviceName}...`);

    return new Promise((resolve) => {
      printWin.webContents.print(
        {
          silent: true,
          deviceName,
          printBackground: true,
          color: false,
          margin: { marginType: "none" },
        },
        (success, reason) => {
          if (success) {
            console.log("[Main] ✅ Silent image print success");
            setTimeout(() => printWin.close(), 1000);
            resolve({ success: true });
          } else {
            console.error("[Main] ❌ Print failed:", reason);
            printWin.close();
            resolve({ success: false, error: reason });
          }
        }
      );
    });
  } catch (err) {
    console.error("[Main] Print error:", err);
    return { success: false, error: err.message };
  }
});
