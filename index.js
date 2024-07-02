const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let myWindow, workerWindow;

app.whenReady().then(() => {
    myWindow = new BrowserWindow({
        width: 900,
        height: 600,
        icon: path.join(__dirname, 'public/assets/logo.png'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    });

    myWindow.removeMenu()
    myWindow.loadFile('index.html');
    myWindow.webContents.openDevTools();    

    // create hidden worker window
    // workerWindow = new BrowserWindow({
    //     show: false,
    //     webPreferences: {
    //         nodeIntegration: true,
    //         enableRemoteModule: true,
    //         contextIsolation: false
    //     }
    // });

    // workerWindow.removeMenu()
    // workerWindow.loadFile('worker.html');
    // workerWindow.webContents.openDevTools();  

    ipcMain.on('select-dirs', async (event, path) => {
        const result = await dialog.showOpenDialog(myWindow, {
          properties: ['openDirectory']
        })
        if (!result.canceled && result.filePaths.length > 0) {
            event.reply('selected-directory', result.filePaths[0]);
        }
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})
