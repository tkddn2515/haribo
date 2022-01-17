import React, { memo, useEffect, useState, useRef, useMemo, useCallback } from 'react'
import styles from './Main.module.css';
import { put } from '../api';
import { SET_USER, SET_AVATAR, SET_PAGE } from '../store';
import { useNavigate } from 'react-router-dom';
import BattleRoom from '../components/BattleRoom';
import MainProfile from '../components/MainProfile';
import CreateAvatar from '../components/CreateAvatar';
import CreateBattleRoom from '../components/CreateBattleRoom';
import { Haribo_Contract_Provider, mint, burn, getAvatar } from '../contract';
import { connect } from 'react-redux';
import { connectSocket, sendMessage } from '../socket';

const Main = ({ user, battleRoomList, setUser, setAvatar, setPage }) => {
  
  const nicknameInput = useRef('');
  const [showCreateAvatar, setShowCreateAvatar] = useState(false);
  const [showCreateBattleRoom, setShowCreateBattleRoom] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {

    if(!user.id) {
      navigate('/login');
      return;
    }

    setPage("Main");

    connectSocket();

    if(user.avatar_id) {
      getAvatar(user.wallet, getAvatarInContract);
    } else{
      Haribo_Contract_Provider.on("EventMint", (_addr, _tokenId) => {
        if(_addr.toLowerCase() === user.wallet.toLowerCase()) {
          updateAvatarId(_addr, parseInt(_tokenId._hex, 16));
        }
      });
    }
  }, []);

  useEffect(() => {
  }, [user])

  const onClickCreateAvatar = async (nickname) => {
    if(nickname) {
      nicknameInput.current = nickname;
      mint(user.wallet, nickname, (res) => {
      }, (error) => {
        if(JSON.stringify(error).includes("this address already exist avatar")) {
          alert("이미 존재하는 계정입니다.");
        }else {
          alert("Error");
        }
      });
    }
  }

  const onClickCreateBattleRoom = async (roomName) => {
    const data = {
      type: "createBattleRoom",
      roomName,
      user
    }
    sendMessage(JSON.stringify(data));
  }

  const setCreateAvatar = useCallback((_b) => {
    setShowCreateAvatar(_b);
  }, []);

  const setCreateBattleRoom = useCallback((_b) => {
    setShowCreateBattleRoom(_b);
  }, [])

  let updated = false;
  const updateAvatarId = async (wallet, avatar_id) => {
    if(updated) {
      return;
    }
    updated = true;
    const data = {
      wallet,
      avatar_id,
      nickname: nicknameInput.current
    }
    setShowCreateAvatar(false);
    getAvatar(user.wallet, getAvatarInContract);
    const res = await put("user/update", data);
    if(res){
      const _user = {...user};
      _user.avatar_id = data.avatar_id;
      _user.nickname = data.nickname;
      setUser(_user);
    }else {
      alert('unkown Error')
    }
    updated = false;
  }

  const getAvatarInContract = (data) => {
    setAvatar({
      tokenId: parseInt(data.tokenId, 16),
      hp: data.hp,
      hungry: data.hungry,
      thirst: data.thirst,
      level: data.level,
      battle_hp: data.battle_hp,
      battle_att: data.battle_att,
      battle_def: data.battle_def,
      battle_cri_per: data.battle_cri_per,
      battle_cri_att_increase: data.battle_cri_att_increase,
      exp: data.exp,
      fill_hungry_time: parseInt(data.fill_hungry_time, 16),
      fill_thirst_time: parseInt(data.fill_thirst_time, 16),
      battle_win_count: parseInt(data.battle_win_count, 16),
      battle_lose_count: parseInt(data.battle_lose_count, 16),
      is_dead: data.is_dead
    });
  }

  const onClickBurn = () => {
    burn(user.wallet);
  }

  const onClickAll = () => {
    const data = {
      type: "getAllListner"
    }
    sendMessage(JSON.stringify(data));
  }

  const onClickRoom = () => {
    const data = {
      type: "getPageListener"
    }
    sendMessage(JSON.stringify(data));
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.roomlist_container}>
          {battleRoomList.map(v => <BattleRoom key={`${v.owner.id}`} roomInfo={v} />)}
        </div>
        <MainProfile setCreateAvatar={setCreateAvatar} setCreateBattleRoom={setCreateBattleRoom} onClickBurn={onClickBurn}/>
      </div> 
      {showCreateAvatar && <CreateAvatar onClickCreateAvatar={onClickCreateAvatar} setCreateAvatar={setCreateAvatar} />}
      {showCreateBattleRoom && <CreateBattleRoom onClickCreateBattleRoom={onClickCreateBattleRoom} setCreateBattleRoom={setCreateBattleRoom} />}
      <button onClick={onClickAll}>모든</button>
      <button onClick={onClickRoom}>방별</button>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    user : state.user,
    battleRoomList : state.battleRoomList,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUser: data => dispatch(SET_USER(data)),
    setAvatar: data => dispatch(SET_AVATAR(data)),
    setPage: data => dispatch(SET_PAGE(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);