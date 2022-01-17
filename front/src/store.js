import { createSlice, configureStore } from '@reduxjs/toolkit';
import { sendMessage } from './socket';

const initialState ={
  page: '',
  user: {
    id: '',
    wallet: '',
    avatar_id: '',
    nickname: '',
    createtime: ''
  },
  avatar: {
    tokenId: '',
    hp: '',
    hungry: '',
    thirst: '',
    level: '',
    battle_hp: '',
    battle_att: '',
    battle_def: '',
    battle_cri_per: '',
    battle_cri_att_increase: '',
    exp: '',
    fill_hungry_time: '',
    fill_thirst_time: '',
    battle_win_count: '',
    battle_lose_count: '',
    is_dead: ''
  },
  battleRoomList: []
}

const slice = createSlice({
  name: "haribo",
  initialState,
  reducers: {
    SET_PAGE: (state, action) => { 
      if(action.payload) {
        const data = {
          type: "page",
          page: action.payload,
        }
        sendMessage(JSON.stringify(data)); 
      }
      return {...state, page: action.payload}
    },
    LOGIN: (state, action) => { return {...state, user: action.payload}},
    SET_USER: (state, action) => { return {...state, user: action.payload}},
    SET_AVATAR: (state, action) => { return {...state, avatar: action.payload}},
    SET_BATTLEROOMLIST: (state, action) => { return {...state, battleRoomList: action.payload}}
  }
})

export const { SET_PAGE, LOGIN, SET_USER, SET_AVATAR, SET_BATTLEROOMLIST } = slice.actions;

export default configureStore({ reducer: slice.reducer });