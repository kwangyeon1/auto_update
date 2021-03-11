import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { history, configuredStore } from './store';
import './app.global.css';
import { ipcRenderer } from 'electron';

const store = configuredStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Root = require('./containers/Root').default;
  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );
});

ipcRenderer.send('main', {mode: 'async ping'}); // ping을 날려서 연결가능한지 발신 (main 프로세스로 ping)
ipcRenderer.on('response', (event, arg) => { // main으로부터 수신
  switch(arg?.status){
    case 'async pong':
      console.log("arg", arg);
      break;
    case 'get-ps-list':
      console.log("arg", arg);
      break;
  }
});