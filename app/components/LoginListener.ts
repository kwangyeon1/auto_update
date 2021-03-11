import {remote} from 'electron';

class LoginListener{
  private ipcMain: NodeJS.EventEmitter = remote.ipcMain;
  private static instance:LoginListener;

  static get getInstance(){
    if(!LoginListener.instance){
      LoginListener.instance = new LoginListener();
    }
    return this.instance;
  }

  listen() : void{
    this.ipcMain.on('loginSuccess', (_event, msg) => {
      console.log(msg) // msg from web page
    });
  }
}

const loginListener = LoginListener.getInstance;
export {loginListener};
