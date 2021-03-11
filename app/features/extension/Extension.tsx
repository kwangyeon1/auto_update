import React from 'react';
import homeStyles from '../../components/Home.css';
import styles from './Extension.css';
import Top from './Top';
import Step1 from './Step1';
import Step2 from './Step2';
import { remote } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import { selectStep, setStepValid } from './extensionSlice';
import { setCsrf } from './step1Slice';
import routes from '../../constants/routes.json';

export default function Extension() {
  listenWebView();
  const step = String(useSelector(selectStep)); // 현재 store에 있는 state를 가져온다

  const stepList: {[key: string]: any} = {
    "1" : <Step1 />,
    "2" : <Step2 />,
  };

  return (
    <div className={styles.extensionPc +' '+ homeStyles.flexItemPc+' '+routes.EXTENSION}>
      <Top />
      {stepList[step]}
    </div>
  );
}

const _remote = remote;

const listenWebView = () =>{
  const dispatch = useDispatch();
  _remote.ipcMain.on('loginSuccess', (_event, msg) => {
    console.log(msg);
    if(!!msg){
      dispatch(setCsrf(msg));
      dispatch(setStepValid(2));
    }
    return;
  });
}

