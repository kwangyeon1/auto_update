import React, {createRef, RefObject, useEffect} from 'react';
import styles from './Home.css';
import {WebviewTag} from 'electron';

interface Props {
    url: string;
    preloadJs: string;
}

export let refWebview: Promise<any>;
export let refWebviewProps: Promise<any>;

export default function CustomWebview({url, preloadJs} : Props) {
  const ref = createRef();
  refWebview = new Promise((resolve, reject)=>{
    useEffect(() => {
      if(!!ref.current) {
        resolve(ref.current); 
      }
    }, []);
  });
  
  return (
    <webview ref={ref as RefObject<WebviewTag>} src={url} className={styles.webViewTag} allowpopups={"true"} style={{width: '100%'}} preload={new URLSearchParams(global.location.search).get('appPath') + '/webview_preloadjs' + preloadJs} />
  );
}
// export function CustomWebviewProps(props : Props) {
//   return (
//     <webview ref={refWebviewProps as RefObject<WebviewTag>} src={props.url} className={styles.webViewTag} allowpopups={"true"} style={{width: '100%'}} preload={new URLSearchParams(global.location.search).get('appPath') + '/webview_preloadjs' + props.preloadJs} />
//   );
// }

// RefObject<WebviewTag>
// // parameter 타입정의시 interface 정의 없이 할수있는 즉시 비구조화 정의를 사용한 예제 (Typing Immediately Destructured Parameters)
// export function _WebView2({url}: {url: string} , {preloadJs}: {preloadJs: string}, {preloadJsPublicPath = 'webview_preloadjs'}: {preloadJsPublicPath: string}) {
//   useEffect(() => { // componentDidMount와 비슷한 효과를 낸다 사용법에 따라 class형 컴포넌트와 같이 life cycle 흉내가 가능하다
//     refWebViewProps.current?.addEventListener("did-finish-load", () => { //webview의 개발자모드창 open
//       refWebViewProps.current?.getWebContents().session.clearCache();
//       refWebViewProps.current?.openDevTools();
//     });
//   }, []);
//   return (
//     <webview src={url} className={styles.webViewTag} allowpopups={"true"} preload={new URLSearchParams(global.location.search).get('appPath') + preloadJsPublicPath + preloadJs} />
//   );
// }

// export function _WebView3(props : Props) {
//   return (
//     <webview src={props.url} className={styles.webViewTag} allowpopups={"true"} preload={new URLSearchParams(global.location.search).get('appPath') + props.preloadJsPublicPath + props.preloadJs} />
//   );
// }

// // parameter 타입정의시 interface 정의 없이 할수있는 즉시 비구조화 정의를 사용한 예제 (Typing Immediately Destructured Parameters)
// export function _WebView4(url: string, preloadJs: string, preloadJsPublicPath: string  = 'webview_preloadjs') {
//   return (
//     <webview src={url} className={styles.webViewTag} allowpopups={"true"} preload={new URLSearchParams(global.location.search).get('appPath') + preloadJsPublicPath + preloadJs} />
//   );
// }

