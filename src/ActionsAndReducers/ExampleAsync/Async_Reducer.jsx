import ActionConstant from '../ActionConstants';
import copyState from "../copyStateHelper.js";

var initialState = {
  isLoading: false,
  hasErrored: false,
  payload: null
};

export const asyncReducer = (state = initialState, action) => {

  var newState = copyState(state);

  switch (action.type) {

    case ActionConstant.ASYNC_LOADING:
      newState.isLoading = action.isLoading;
      return newState;

    case ActionConstant.ASYNC_FAIL:
      newState.hasErrored = action.error ? true : false;
      return newState;

    case ActionConstant.ASYNC_SUCCESS:
      newState.payload = action.payload;
      return newState;

    default:
      return newState;
  }
};