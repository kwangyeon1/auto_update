import {qrCodeEventEmitter, QRCodeEventEmitter} from './QRCodeEventEmitter';

interface Detector{
  detect() : void
}

class QRCodeDetector implements Detector{
  private static instance: QRCodeDetector;
  private qrCodeEventEmitter: QRCodeEventEmitter = qrCodeEventEmitter;

  static get getInstance(){
    if(!QRCodeDetector.instance){
      QRCodeDetector.instance = new QRCodeDetector();
    }
    return this.instance;
  }

  detect() : void{
    // TODO detect Logic
    this.qrCodeEventEmitter.emit('createQRCode');
  }
}

const qrCodeDetector = QRCodeDetector.getInstance;
export {qrCodeDetector, QRCodeDetector};

