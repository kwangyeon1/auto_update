import React from 'react';
import homeStyles from '../../components/Home.css';
import styles from './Challenge.css';
import Login from './Login';
import routes from '../../constants/routes.json';
import { remote, ipcRenderer } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import { selectStep1Csrf, setCsrf } from '../extension/step1Slice';

export default function Challenge(props: any) {
  const step = String(1); // 임시
  const stepList: {[key: string]: Function} = {
    "1" : Login
  };

  listenWebViewAsync().then( (csrf=useSelector(selectStep1Csrf)) =>{
    console.log(".then csrf",csrf);
    remote.ipcMain.removeAllListeners('loginSuccess');
    const background_id = ipcRenderer.sendSync('synchronous-message', {mode: 'background_id'});
    ipcRenderer.sendTo(background_id, 'renderer-main', {mode: 'getCsrf', data: {csrf: csrf} });
    // listenBackgroundAsync().then(res => {
    //   ipcRenderer.removeAllListeners('renderer-background');
    //   console.log('file:', res);
    // });
  });

  

  let StepComponent = stepList[step];
  return (
    <div className={styles.extensionPc +' '+ homeStyles.flexItemPc+' '+routes.CHALLENGE}>
      <StepComponent />
    </div>
  );
}



const listenWebViewAsync = (): Promise<string> =>{
  const dispatch = useDispatch();
  return new Promise((resolve, reject)=>{
    remote.ipcMain.on('loginSuccess', (_event, msg) => {
      console.log('loginSuccess',msg);
      if(!!msg){
        dispatch(setCsrf(msg));
        resolve(msg);
      }
      return;
    });
  });
}

const listenBackgroundAsync = (): Promise<string> =>{
  return new Promise((resolve, reject)=>{
    ipcRenderer.on('renderer-background', (_event, msg) => {
      console.log(msg);
      if(msg?.status == 'lol_logs'){
        resolve(msg);
      }
      if(msg?.status == 'lol_noLogs'){
        resolve(msg);
      }
      return;
    });
  });
}