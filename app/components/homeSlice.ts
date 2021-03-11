// import { createSlice } from '@reduxjs/toolkit';
// // eslint-disable-next-line import/no-cycle
// import { AppThunk, RootState } from '../store';
// import { WebviewTag } from 'electron';
// import { RefObject } from 'react';

// const homeSlice = createSlice({
//   name: 'home',
//   initialState: { webView: null as any },
//   reducers: {
//     setWebView: (state, action) => {
//       state.webView = (action.payload as RefObject<WebviewTag>).current;
//       // state.webView = action.payload;
//     } 
//   },
// });

// export const { setWebView } = homeSlice.actions;

// //(#2) 건부로 기존의 action을 무시: incrementIfOdd()
// export const loadIfOdd = (webView: any): AppThunk => {
//   return (dispatch, getState) => {
//     const state = getState();
//     if (!!!state.home.webView) {
//       return;
//     }
//     dispatch(setWebView(webView));
//   };
// };

// //(#3) 건부로 기존의 action을 무시: incrementAsync()
// export const loadAsync = (delay = 1000,webView: any): AppThunk => (dispatch) => {
//   setTimeout(() => {
//     dispatch(setWebView(webView));
//   }, delay);
// };

// export default homeSlice.reducer;

// export const selectHomeWebView = (state: RootState): WebviewTag => state.home.webView; // (#1)
