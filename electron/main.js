
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '../public/favicon.ico'), // 假设您有一个图标
  });

  // 在开发环境加载 localhost，在生产环境加载打包后的文件
  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:5173'); // 默认 Vite 端口
    // win.webContents.openDevTools(); // 开发时可以打开控制台
  } else {
    // 生产环境加载 dist/index.html
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  
  // 隐藏菜单栏 (可选)
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
