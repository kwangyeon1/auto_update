// import { createSlice } from '@reduxjs/toolkit';
// // eslint-disable-next-line import/no-cycle
// import { AppThunk, RootState } from '../../store';

// const step2Slice = createSlice({
//   name: 'step2',
//   initialState: { url: 'http://testrankingtest.xyz/' as string, preloadJs: '/extension/step2.js' as string },
//   reducers: {
//     setStep2: (state, action ) => {
//       state.url = action.payload.url;
//       state.preloadJs = action.payload.preloadJs;
//     } 
//   },
// });

// export const { setStep2 } = step2Slice.actions;

// export const setStep2Valid = (step2: any): AppThunk => {
//   console.log("setCsrfValid 실행");
//   return (dispatch, getState) => {
//     const state = getState();
//     if (!!!state.step2) {
//       return;
//     }
//     dispatch(setStep2(step2));
//   };
// };

// export const setStep2Async = (step2: any, delay = 1000): AppThunk => (dispatch) => {
//   setTimeout(() => {
//     dispatch(setStep2(step2));
//   }, delay);
// };

// export default step2Slice.reducer;

// export const selectStep2 = (state: RootState): Object => state.step2; // (#1)
