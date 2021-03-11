import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';

const step1Slice = createSlice({
  name: 'step1',
  initialState: { csrf: '' as string },
  reducers: {
    setCsrf: (state, action) => {
      state.csrf = action.payload;
    } 
  },
});

export const { setCsrf } = step1Slice.actions;

//(#2) 건부로 기존의 action을 무시: setCsrfValid()
export const setCsrfValid = (csrf: string): AppThunk => {
  console.log("setCsrfValid 실행");
  return (dispatch, getState) => {
    const state = getState();
    if (!!!state.step1.csrf) {
      return;
    }
    dispatch(setCsrf(csrf));
  };
};

//(#3) 건부로 기존의 action을 무시: setCsrfAsync()
export const setCsrfAsync = (delay = 1000, csrf: string): AppThunk => (dispatch) => {
  setTimeout(() => {
    dispatch(setCsrf(csrf));
  }, delay);
};

export default step1Slice.reducer;

export const selectStep1Csrf = (state: RootState): string => state.step1.csrf; // (#1)
