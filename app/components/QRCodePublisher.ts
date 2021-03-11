import {Observer, QRCodeObserver} from './QRCodeObserver';

interface Publisher{
  attach(observer : Observer): void

  detach(observer : Observer): void

  notify(): void
}

class QRCodePublisher implements Publisher{
  private static instance: QRCodePublisher;
  public state: string = ''

  private observers: Observer[] = [];

  static get getInstance(){
    if(!QRCodePublisher.instance){
      QRCodePublisher.instance = new QRCodePublisher();
      QRCodePublisher.instance.attach(QRCodeObserver.getInstance);
    }
    return this.instance;
  }

  public attach(observer: Observer) :void{
    const isExist = this.observers.includes(observer);
    if(isExist){
      return console.log('Publisher: Observer has been attached already');
    }

    this.observers.push(observer);
  }

  public detach(observer: Observer) :void{
    const observerIndex = this.observers.indexOf(observer);

    if(observerIndex === -1){
      return console.log("Publisher: Nonexistent observer'");
    }

    this.observers.splice(observerIndex, 1);
  }

  public notify(): void{

    // TODO QRCode 만들어야 하는 조건을 찾은 경우 이 메소드를 호출한다.
    for(const observer of this.observers){
      observer.update(this);
    }
  }
}

const qrCodePublisher = QRCodePublisher.getInstance;
export {Publisher, qrCodePublisher, QRCodePublisher};
