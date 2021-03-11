import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';
import { setCsrf } from './step1Slice';

const extensionSlice = createSlice({
  name: 'extension',
  initialState: { step: 1 as any, url: 'http://testrankingtest.xyz/' as string, preloadJs: '/extension/inject.js' as string },
  reducers: {
    init: (state) => {
      state.step = 1;
      state.url = 'http://testrankingtest.xyz/';
      state.preloadJs = '/extension/inject.js';
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
    setWebView: (state, action) => {
      state.url = action.payload.url;
      state.preloadJs = action.payload.preloadJs;
    },
    logout: (state) => {
      state.url = 'http://testrankingtest.xyz/a/logout';
    },
  },
});

export const { init, setStep, setWebView, logout } = extensionSlice.actions;

// 기존 redux의 action단의 동작은 즉시 실행이었다(#1)
// 하지만 action을 지연시키거나 작업이 오래 걸려 callback 즉 이벤트로써 action하길원할때는
// 기존에는 container에서 지연 또는 event 또는 callback 작업으로 async하였다
// 그래서 redux-thunk을 사용하면 조건부로 해당action을 무시하거나 (#2)
// action을 지연시켜 callback을 줄수 있다 즉 async가 가능하고 아무 결과도 리턴하지않거나 throw로 에러 처리가 가능하다 (#3)
// 이러한 작업들을 container가 아닌 action에서 수행가능하다

//(#2) 건부로 기존의 action을 무시: initValid()
export const initValid = (): AppThunk => {
  return (dispatch, getState) => {
    const state = getState();

    dispatch(setCsrf(''));
    dispatch(init());
    dispatch(logout());
  };
};

export const setStepValid = (csrf: any): AppThunk => {
  return (dispatch, getState) => {
    const state = getState();
    if (!!!state.extension.step) {
      return;
    }
    dispatch(setStep(csrf));
  };
};

//(#3) 건부로 기존의 action을 무시: initAsync()
export const initAsync = (delay = 1000): AppThunk => (dispatch) => {
  setTimeout(() => {
    dispatch(init());
  }, delay);
};

export const setWebViewValid = (url:string, preloadJs: string): AppThunk => {
  return (dispatch, getState) => {
    const state = getState();
    if (!!!state.step1.csrf) {
      return;
    }
    dispatch(setWebView({url, preloadJs}));
  };
};

export default extensionSlice.reducer;

export const selectStep = (state: RootState) : any => state.extension.step; // (#1)
