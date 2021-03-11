import React, { createRef, RefObject } from 'react';
import styles from './Home.css';
import {WebviewTag} from 'electron';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import {ExtensionPage} from '../constants/LazyPages';
import Challenge from '../features/challenge/Challenge';
import {qrCodeDetector} from './QRCodeDetector';
import {loginListener} from './LoginListener';
import {authListener} from './AuthListener'; 
import {qrCodeEventEmitter} from './QRCodeEventEmitter';
import { RootState } from '../store';
import { connect } from 'react-redux';


interface State {
  item: any;
}

class Home extends React.Component<any, State>{
  
  constructor(props: any) {
    super(props);
    this.state = {
      ...this.state,
      item: ''
    };
  }

  /* 사용가능한 코드 및 설명을 위한 information 그룹주석 */
  /*
    현재 class형 컴포넌트는 redux와 연결되었고 아래 예제와같이 
    this.props.dispatch(setCsrf('안녕')); this.props로 상속받은 action을 dispatch하는게 가능하다
  */
  /*
    학습용 dom-ready vs did-finish-load
    dom-ready: webview관련 메소드를 사용하기 전에 webview 요소를로드해야합니다.
    did-finish-load: 탐색이 완료되면 시작됩니다. 즉, 탭의 스피너가 회전을 중지하고 (DOM 이벤트)onload이벤트가 전달됩니다
  */

  isLoadedExtension = false; // state가 아닌 단순 class 변수로 재 렌더링이 일어나지 않도록 방지
  isLoadedChallenge = false;

  isLogoutExtension = false; // 굳이 redux없이 home에 한정된 state로써 동작하기 위한 toggle용 변수
  isLogoutChallenge = false;

  webViewRef :RefObject<WebviewTag> = createRef();

  getSnapshotBeforeUpdate(prevProps: any, prevState: any){
    return null;
  }

  toggleRightMenu = (item: string) => { // right menu의 style속성을 이용한 right menu 스위칭 및 토글
    switch(item){
      case routes.EXTENSION:
        if(!!document.getElementsByClassName(routes.CHALLENGE)?.length){
          document.getElementsByClassName(routes.CHALLENGE)[0].style.display = 'none';
        }
        if(!!document.getElementsByClassName(routes.EXTENSION)?.length){
          if(!!document.getElementsByClassName(routes.EXTENSION)[0].style.display &&  document.getElementsByClassName(routes.EXTENSION)[0].style.display == 'block'){
            document.getElementsByClassName(routes.EXTENSION)[0].style.display = 'none';
          }else{
            document.getElementsByClassName(routes.EXTENSION)[0].style.display = 'block';
            document.getElementsByClassName(routes.EXTENSION)[0].style.flex = '3';
          }
        }
        break;
      case routes.CHALLENGE:
        if(!!document.getElementsByClassName(routes.EXTENSION)?.length){
          document.getElementsByClassName(routes.EXTENSION)[0].style.display = 'none';
        }

        if(!!document.getElementsByClassName(routes.CHALLENGE)?.length){
          if(!!document.getElementsByClassName(routes.CHALLENGE)[0].style.display &&  document.getElementsByClassName(routes.CHALLENGE)[0].style.display == 'block'){
            document.getElementsByClassName(routes.CHALLENGE)[0].style.display = 'none';
          }else{
            document.getElementsByClassName(routes.CHALLENGE)[0].style.display = 'block';
            document.getElementsByClassName(routes.CHALLENGE)[0].style.flex = '3';
          }
        }
        break;
    }
  }

  showListItem = (item: string, e: React.SyntheticEvent) => { // right menu선택에 따른 renderer화면 재렌더링 , logout을 통한 사용자 로그인정보 초기화등 webView화면 contents의 초기화 
    e.preventDefault();
    if(item == routes.EXTENSION){
      this.isLogoutChallenge = false;
      if(!!document.getElementsByClassName(routes.EXTENSION)?.length){
        if(!!this.isLogoutExtension ){
          console.log("ex1 toggle");
          this.toggleRightMenu(routes.EXTENSION);
        }else{
          console.log("ex2");
          this.webViewRef.current?.loadURL('http://testrankingtest.xyz/a/logout').then(()=>{
              this.isLogoutExtension = !this.isLogoutExtension;
              console.log("ex2 toggle");
              this.toggleRightMenu(routes.EXTENSION);
            });
        }
      }else{
        console.log("else_ex");
        this.webViewRef.current?.loadURL('http://testrankingtest.xyz/a/logout').then(()=>{
            this.isLogoutExtension = !this.isLogoutExtension;
            this.isLoadedExtension = true;
            this.setState({
              item: item
            });
          });
      }
    }

    if(item == routes.CHALLENGE){
      this.isLogoutExtension = false;
      if(!!document.getElementsByClassName(routes.CHALLENGE)?.length){
        if(!!this.isLogoutChallenge ){
          console.log("ch1 toggle");
          this.toggleRightMenu(routes.CHALLENGE);
        }else{
          console.log("ch2");
          this.webViewRef.current?.loadURL('http://testrankingtest.xyz/a/logout').then(()=>{
              this.isLogoutChallenge = !this.isLogoutChallenge;
              console.log("ch2 toggle");
              this.toggleRightMenu(routes.CHALLENGE);
            });
        }
      }else{
        console.log("else_ch");
        this.webViewRef.current?.loadURL('http://testrankingtest.xyz/a/logout').then(()=>{
            this.isLogoutChallenge = !this.isLogoutChallenge;
            this.isLoadedChallenge = true;
            this.setState({
              item: item
            });
          });
      }
    }

    // if(item == routes.HOME){
    //   this.isLoadedChallenge = true;
    //   // this.webViewRef.current?.getWebContents().session.clearCache();
    //   this.webViewRef.current?.loadURL('http://testrankingtest.xyz/a/logout').then(()=>{
    //       this.isLogoutChallenge = !this.isLogoutChallenge;
    //       this.setState({
    //         item: item
    //       });
    //     });
    // }

    if(item == routes.COUNTER){
    }
    
  }
  
  toggleNav = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (document.getElementsByClassName(styles.arrowRightPc)[0].classList.contains(styles.active)) {
      document.getElementsByClassName(styles.arrowRightPc)[0].classList.remove(styles.active);
      document.getElementsByClassName(styles.arrowLeftPc)[0].classList.add(styles.active);

      document.getElementsByClassName(styles.rightNavPc)[0].classList.remove(styles.active);
    }else{
      document.getElementsByClassName(styles.arrowLeftPc)[0].classList.remove(styles.active);
      document.getElementsByClassName(styles.arrowRightPc)[0].classList.add(styles.active);

      document.getElementsByClassName(styles.rightNavPc)[0].classList.add(styles.active);
    }
  }

  componentDidMount() {

    // loginListener.listen();
    // authListener.listen();
    // qrCodeEventEmitter.listen();
    // qrCodeDetector.detect();

    // console.log("this.props",this.props);
    this.webViewRef.current?.addEventListener("dom-ready", () => { //webview의 개발자모드창 open
      this.webViewRef.current?.openDevTools();
    });
    // webViewRef.current?.addEventListener('console-message', (e) => { //webview의 콘솔메세지 수신
    //   console.log('Guest message:', e.message);
    // });
    (document.getElementsByClassName(styles.arrowLeftPc)[0] as HTMLElement).click();
  }

  componentDidUpdate(prevProps: any, prevState: any, snapshot: any) { // 초기 렌더링 -> state업데이트 -> 재렌더링 -> dom 렌더링 -> componentDidUpdate 순이기때문에 재렌더링 없이 로드된 dom으로 참조하여 style속성으로 toggle을 구현
    // if (snapshot !== null) {
      this.toggleRightMenu(this.state.item);
    // }
  }

  componentWillUnmount() {
    // if (document.getElementsByClassName('arrowRightPc[0].classList.contains('thatClass')) {
    // }
  }

  render() {
    return (
      <div className={styles.flaxPc}>
        <div className={styles.homeContainer +' '+ styles.flexItemPc}>
          <i onClick={this.toggleNav} className={styles.arrowPc +' '+ styles.arrowLeftPc}></i>
          <div className={styles.webViewTag }>
            <webview ref={this.webViewRef as RefObject<WebviewTag>} src={this.props.extension.url} className={styles.webViewTag} allowpopups={"true"} style={{width: '100%'}} preload={new URLSearchParams(global.location.search).get('appPath') + '/webview_preloadjs' + this.props.extension.preloadJs} />
          </div>
        </div>
        {this.isLoadedExtension?<ExtensionPage {...this.props}/>:''}
        {this.isLoadedChallenge?<Challenge {...this.props}/>:''}
        <div className={styles.rightNavPc +' '+ styles.flexItemPc}>
          <i onClick={this.toggleNav} className={styles.arrowPc +' '+ styles.arrowRightPc}></i>
          <div className={styles.listWrapPc}>
            <div className={styles.listItemPc}><a onClick={e =>this.showListItem(routes.CHALLENGE, e)}>챌린지 인증</a></div>
            <div className={styles.listItemPc}><Link to={routes.COUNTER}>COUNTER</Link></div>
            <div className={styles.listItemPc}><a onClick={e =>this.showListItem(routes.EXTENSION, e)}>캐릭터 인증</a></div>
          </div>
        </div>
      </div>
    )
  }

}

export default connect((state: RootState)=>state)(Home);