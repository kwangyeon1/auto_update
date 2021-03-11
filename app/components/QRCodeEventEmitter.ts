import {qrCodePublisher} from './QRCodePublisher';
const EventEmitter = require('events');

class QRCodeEventEmitter extends EventEmitter{
  private static instance: QRCodeEventEmitter;

  static get getInstance(){
    if(!QRCodeEventEmitter.instance){
      QRCodeEventEmitter.instance = new QRCodeEventEmitter();
    }
    return this.instance;
  }
  listen(): void{
    this.on('createQRCode', () => {
      qrCodePublisher.notify();
    });
  }
}

const qrCodeEventEmitter = QRCodeEventEmitter.getInstance;

export {qrCodeEventEmitter, QRCodeEventEmitter};
