import {remote} from 'electron';

class AuthListener {
  private ipcMain: NodeJS.EventEmitter = remote.ipcMain;
  private static instance:AuthListener;

  static get getInstance(){
    if(!AuthListener.instance){
      AuthListener.instance = new AuthListener();
    }
    return this.instance;
  }

  listen() : void{
    this.ipcMain.on('authSuccess', (_event) => {
      // TODO QRCode Auth Success
      this.sendNotification();
    });
  }

  sendNotification() {
    console.log('successAuth');
    const notification = {
      title: '본인 인증 성공',
      body: '챌린지 본인 인증 성공하셨습니다.',
    };
    const myNotification = new window.Notification(notification.title, notification);
    myNotification.onclick = () => {
      console.log("authSuccess");
    }
  }
}

const authListener = AuthListener.getInstance;
export {authListener, AuthListener};
