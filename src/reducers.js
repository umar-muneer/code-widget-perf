import { Map, fromJS } from "immutable";
const initialState = Map(fromJS({
  codeEditors: [],
}));
export const reducers = (state = initialState, action) => {
  switch (action.type) {
    case 'CODE_CHANGED':
      const { code, index } = action.payload;
      return state.updateIn(['codeEditors'], list => list.update(index, () => code));
    default:
      return state;
  }
};