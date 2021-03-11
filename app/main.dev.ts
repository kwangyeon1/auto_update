/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { LooseObject } from 'CustomTypes'; // TO-DO 타입스크립트로 type 선언 또는 함수, 이벤트 등을 커스텀할때 예시

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let backgroundWindow: BrowserWindow | null = null; // 백그라운드
let splashWindow: BrowserWindow | null = null; // 시작시 나오는 창
let response: LooseObject = {}; // LooseObject 타입으로 일반적인 javascript Object처럼 동적으로 프로퍼티를 추가하는게 가능하다
let appPath: string = '';
let tray: Tray | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  // require('electron-debug')();
}

if ( (process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true') && process.env.ERB_SECURE !== 'true' ){
  appPath =`file://${__dirname}`;
}else{
  appPath =`file://${__dirname}/dist`;
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createBackgroundWindow = async () => { // 백그라운드 함수
  backgroundWindow = new BrowserWindow({  // 백그라운드 생성
    show : false,
    webPreferences:
    (process.env.NODE_ENV === 'development' ||
      process.env.E2E_BUILD === 'true') &&
    process.env.ERB_SECURE !== 'true'
      ? {
          nodeIntegration: true,
        }
      : {
          preload: path.join(__dirname, 'dist/background.renderer.prod.js'),
          nodeIntegration: true
        },
  });

  backgroundWindow.loadURL(appPath+`/background.html?appPath=${appPath}`); // 백그라운드 실행
  return backgroundWindow;
}

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    // await installExtensions(); //백그라운드도 개발자도구를 열어버려서 경고문 발생 => 주석처리
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1300,
    height: 800,
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
      process.env.ERB_SECURE !== 'true'
        ? {
            nodeIntegration: true,
            webviewTag:true
          }
        : {
            nodeIntegration: true,
            preload: path.join(__dirname, 'dist/main.renderer.prod.js'),
            webviewTag:true,
            devTools:true
          },
  });

  mainWindow.loadURL(appPath+`/app.html?appPath=${appPath}`);
  mainWindow.setContentProtection(true); // 캡처방지
  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
      // createBackgroundWindow().then(background => {
      //   backgroundWindow = background;
      //   // if(process.env.NODE_ENV === 'development'){
      //     backgroundWindow?.webContents.openDevTools();
      //   // }
      // });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    backgroundWindow = null;
    app.quit();
  });
  
  mainWindow.webContents.session.clearCache();
  mainWindow.webContents.session.clearStorageData();
  // if(process.env.NODE_ENV === 'development'){ // TODO 빌드후 console.log로 결과를 보고싶다면 주석처리
    mainWindow.webContents.openDevTools();
  // }

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    console.log("second-instance");
    if (backgroundWindow) {
      if (backgroundWindow.isMinimized()) backgroundWindow.restore()
      splashWindow?.focus()
    }
  });
  console.log("gotTheLock",gotTheLock);

  app.allowRendererProcessReuse = false; // 렌더링시 기존 모듈을 재사용하지 않고 재 렌더링(navigation이 일어 날때)하도록한다 *이슈가 몇개 존재한다고함
  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  if (process.env.E2E_BUILD === 'true') {
    // eslint-disable-next-line promise/catch-or-return
    // app.whenReady().then(createWindow);
    app.whenReady().then( ()=>
      // createBackgroundWindow().then(background => {
      //   backgroundWindow = background;
      //   // if(process.env.NODE_ENV === 'development'){
      //     backgroundWindow?.webContents.openDevTools();
      //   // }
      // })
      {}
    );
  } else {
    // app.on('ready', createWindow);
    app.on('ready', ()=>
        createBackgroundWindow().then(background => {
          if(process.env.NODE_ENV === 'development'){
            backgroundWindow?.webContents.openDevTools();
          }
          var trayIconPath = '';
          if (process.env.NODE_ENV === 'production') {
            trayIconPath = path.join(__dirname,'dist/assets/icon16.png');
          }else{
            trayIconPath = path.join(__dirname,'assets/icon16.png');
          }
          var image = nativeImage.createFromPath(trayIconPath);
          tray = new Tray(image);
          if (process.platform === 'win32' ) {
            tray.on('click', tray.popUpContextMenu);
          }
        
          const menu = Menu.buildFromTemplate([
            {
              label: '열기',
              click() { 
                splashWindow?.destroy();
                splashWindow = new BrowserWindow({width: 450, height: 600, show: true,  autoHideMenuBar: true, resizable: false});
                splashWindow.loadURL(appPath+`/splash.html?splash_img=${appPath + '/assets/splash.png'}`);
              }
            },
            {
              label: '종료',
              click() { app.quit(); }
            }
          ]);
        
          tray.setToolTip('ranking');
          tray.setContextMenu(menu);

          splashWindow = new BrowserWindow({width: 450, height: 600, show: true,  autoHideMenuBar: true, resizable: false});
          splashWindow.loadURL(appPath+`/splash.html?splash_img=${appPath + '/assets/splash.png'}`);
        })
    );
  }

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
  });

}

ipcMain.on('main', (event, arg) => {
  /* Event emitter for sending asynchronous messages */
  console.log("main listen sender.id - ", event.sender.id)
  console.log("main listen arg - ", arg)
  if( Array.isArray(arg) || !!!arg || !!!arg?.mode ) return;

  switch(arg.mode){
    case 'async ping': // ping pong방식으로 연결 확인
      console.log('async pong')
      event.reply('response', {status: 'async pong', response: response}) // [TO: ping을 날린 프로세스]로 status가 'async pong'인 메세지 반환
      break;
    case 'ps-list': // 프로세스 리스트 (특정 mode를 백그라운드에서 비동기적으로 결과를 취득하는데 그결과로 response에 ps_list프로퍼티를 동적을 할당한다)
      console.log('get ps-list')
      response.ps_list = arg.data // LooseObject타입으로써 동적으로 response에 프로퍼티를 할당가능
      mainWindow?.webContents.send('response', {status: 'get-ps-list', response: response}) // [TO: mainWindow]로 status가 'get-ps-list'인 메세지 반환
      break;
    case 'lolInstallLocation':

      break;
    default: console.log('default')
  }
});

/* Event handler for synchronous incoming messages */
ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg);
  switch(arg?.mode){
    case 'background_id':
      event.returnValue = backgroundWindow?.webContents.id;
      break;
    case 'quit':
      if (process.platform !== 'darwin') {
        app.quit();
      }
      break;
    default: console.log('default')
  }

});


autoUpdater.on('update-available', (info ) => {
  console.log("update-available", info);
});

autoUpdater.on('update-downloaded', (info ) => {
  console.log("update-available", info );
});
