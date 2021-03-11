import {Publisher, QRCodePublisher} from './QRCodePublisher';
import {remote} from 'electron';

interface Observer{
  update(publisher : Publisher): void
}

class QRCodeObserver implements Observer{
  private static instance: QRCodeObserver;
  private rankingWebview: HTMLElement | undefined;
  // private ipcMain: NodeJS.EventEmitter = remote.ipcMain;
  private remote = remote;

  static get getInstance(){
    if(!QRCodeObserver.instance){
      QRCodeObserver.instance = new QRCodeObserver();
      const webView = document.getElementById('ranking');
      // @ts-ignore
      QRCodeObserver.instance.setRankingWebview(webView);
    }
    return this.instance;
  }

  public update(publisher: Publisher) :void {
    if(publisher instanceof QRCodePublisher){
      // TODO QRCode를 만드는 Event를 날린다.
      if(!this.rankingWebview) {
        const webView = document.getElementById('ranking');
        if(!webView) {return console.log("can't find Ranking.gg Webview");}
        this.setRankingWebview(webView);
      }

      this.rankingWebview.addEventListener("did-start-loading", () => {
        this.rankingWebview.openDevTools();
        this.rankingWebview.send("createQRCode", "testData");
        this.remote.getCurrentWindow().show();
      });
    }
  }

  public setRankingWebview(webView: HTMLElement) : void{
    this.rankingWebview = webView;
  }
}

const qrCodeObserver = QRCodeObserver.getInstance;
export {Observer, QRCodeObserver, qrCodeObserver};

