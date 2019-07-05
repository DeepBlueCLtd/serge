import { applyMiddleware, combineReducers, createStore } from 'redux';
import { messageTypesReducer } from "../ActionsAndReducers/dbMessageTypes/messageTypes_Reducer";
import { messagesReducer } from "../ActionsAndReducers/dbMessages/messages_Reducer";
import { currentModal } from "../ActionsAndReducers/Modal/Modal_Reducer";
import { currentViewURIReducer } from "../ActionsAndReducers/setCurrentViewFromURI/setCurrentViewURI_Reducer";
import { umpireMenuReducer } from "../ActionsAndReducers/UmpireMenu/umpireMenu_Reducer";
import { wargamesReducer } from "../ActionsAndReducers/dbWargames/wargames_Reducer";
import { notificationReducer } from "../ActionsAndReducers/Notification/Notification_Reducer";
import { playerUiReducer } from "../ActionsAndReducers/playerUi/playerUi_Reducer";
import { loadingDbReducer } from "../ActionsAndReducers/loadingDb_Reducer";
import { exportItems } from "../ActionsAndReducers/ExportItems/ExportItems_Reducer";
import { gameInfo } from "../ActionsAndReducers/sergeInfo/sergeInfo_Reducer";

import thunk from 'redux-thunk';
const optimisticMiddleware = () => {
  return (next) => {
    return (action) => {
      const { method, ...rest } = action;

      if (!method) {
        return next(action);
      }

      next({ ...rest, optimisticState: 'OPTIMISTIC_UPDATE_START' });
      return method((error) => {
        if (error) {
          return next({
            optimisticState: 'OPTIMISTIC_UPDATE_FAILURE',
            ...rest
          });
        }

        return next({ ...rest, optimisticState: 'OPTIMISTIC_UPDATE_SUCCESS' });
      });
    };
  };
};
const middlewares = [thunk, optimisticMiddleware];

if (process.env.NODE_ENV === `development`) {
  const { logger } = require(`redux-logger`);
  middlewares.push(logger);
}

export default createStore(combineReducers({
  messageTypes: messageTypesReducer,
  messages: messagesReducer,
  umpireMenu: umpireMenuReducer,
  currentViewURI: currentViewURIReducer,
  currentModal,
  notifications: notificationReducer,
  wargame: wargamesReducer,
  playerUi: playerUiReducer,
  dbLoading: loadingDbReducer,
  exportItems,
  gameInfo,
}), applyMiddleware(...middlewares));
