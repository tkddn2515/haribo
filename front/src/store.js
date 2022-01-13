import { createSlice, configureStore } from '@reduxjs/toolkit';

const initialState ={
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
  }
}

const slice = createSlice({
  name: "haribo",
  initialState,
  reducers: {
    LOGIN: (state, action) => { return {...state, user: action.payload}},
    SET_USER: (state, action) => { return {...state, user: action.payload}},
    SET_AVATAR: (state, action) => { return {...state, avatar: action.payload}}
  }
})

export const { LOGIN, SET_USER, SET_AVATAR } = slice.actions;

export default configureStore({ reducer: slice.reducer });