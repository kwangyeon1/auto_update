import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import counterReducer from './features/counter/counterSlice';
import extensionReducer from './features/extension/extensionSlice';
import step1Reducer from './features/extension/step1Slice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    counter: counterReducer,
    extension: extensionReducer,
    step1: step1Reducer,
  });
}
