/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import glob from 'glob';
import path from 'path';
import fs from 'fs';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  protocol,
  powerSaveBlocker,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import MenuBuilder from './menu';
import { parseAndSaveSongs, resolveHtmlPath } from './util';
import { StorageSchema } from '../types';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const store = new Store();

let powerSaveBlockerId: number = -1;

ipcMain.on('load-song', async (event, id) => {
  const songData = (store.get('songs') as StorageSchema['songs'])[id];

  glob(
    `${songData.dir}/*(*.mid|*.ogg|*.opus)`,
    { ignore: [`${songData.dir}/crowd.ogg`, `${songData.dir}/preview.ogg`] },
    (err, files) => {
      const midiFilePath = files.find((file) => path.extname(file) === '.mid');
      if (!midiFilePath) {
        return;
      }
      const audio = files
        .filter((file) => ['.ogg', '.opus'].includes(path.extname(file)))
        .map((file) => ({
          src: `gh://${file}`,
          name: path.parse(file).name,
        }));
      const midiData = fs.readFileSync(midiFilePath);
      event.reply('load-song', { data: songData, midi: midiData, audio });
    },
  );
});

ipcMain.on('load-song-list', async (event) => {
  event.reply(
    'load-song-list',
    Object.values(store.get('songs') as StorageSchema['songs']),
  );
});

ipcMain.on('rescan-songs', async (event) => {
  await parseAndSaveSongs(store, (songs) => {
    event.reply('rescan-songs', Object.values(songs));
  });
});

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

ipcMain.on('check-dev', async (event) => {
  event.reply('check-dev', isDebug);
});

ipcMain.on('like-song', async (event, id, liked) => {
  store.set(`songs.${id}.liked`, liked);
});

ipcMain.on('prevent-sleep', async () => {
  powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
});

ipcMain.on('resume-sleep', async () => {
  powerSaveBlocker.stop(powerSaveBlockerId);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (isDebug) {
  // require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  if (!store.get('songs')) {
    await parseAndSaveSongs(store);
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    x: 0,
    y: 0,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'gh',
    privileges: {
      supportFetchAPI: true,
    },
  },
]);

app
  .whenReady()
  .then(() => {
    protocol.registerFileProtocol('gh', (request, callback) => {
      const url = decodeURIComponent(request.url.substr(5));
      callback({ path: url });
    });

    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
