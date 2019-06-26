import {app, BrowserWindow, session, ipcMain, Event} from 'electron';
import fs from 'fs';

let mainWindow: BrowserWindow | null;

async function createMainWindow() {
    const window = new BrowserWindow({
        width: 1000,
        height: 1000,
        webPreferences: {
            nodeIntegration: true,
            preload: __dirname + '/preload.js',
        },
    });

    const view = new BrowserWindow({
        width: 300,
        height: 300,
        webPreferences: {
            nodeIntegration: true,
        },
    });


    ipcMain.on('wsDataCandlesHistory', (_: Event, data: string) => {
        view.webContents.send('wsDataCandlesHistory', data);
    });

    ipcMain.on('wsData', (_: Event, d: any) => {
        // view.webContents.send('wsData', data);
        if (d.type === 'orderbook') {
            fs.appendFileSync('data.json', `${JSON.stringify(d.data)}\n`);
        }
    });

    ipcMain.on('connectToWs', async () => {
        if (session.defaultSession) {
            const cookies = await session.defaultSession.cookies.get({secure: true, session: true});
            if (Array.isArray(cookies)) {
                const sessionCookie = cookies.find(cookie => cookie.name === 'psid');
                if (sessionCookie) {
                    window.webContents.send('sessionId', sessionCookie.value);
                }
            }

            await session.defaultSession.cookies.flushStore();
        }
    });

    await view.loadFile(__dirname + '/index.html');
    await window.loadURL('https://tinkoff.ru/invest-terminal');

    window.on('closed', () => {
        mainWindow = null;
    });

    return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', async () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = await createMainWindow();
    }
});

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
    mainWindow = await createMainWindow();
});
