import React, { memo, useEffect, useState, useRef, useMemo, useCallback } from 'react'
import styles from './Main.module.css';
import { put } from '../api';
import { SET_USER, SET_AVATAR } from '../store';
import { useNavigate } from 'react-router-dom';
import BattleRoom from '../components/BattleRoom';
import MainProfile from '../components/MainProfile';
import CreateAvatar from '../components/CreateAvatar';
import { Haribo_Contract_Provider, mint, burn, getAvatar } from '../contract';
import { connect } from 'react-redux';
import { connectSocket } from '../socket';

const Main = ({ user, setUser, setAvatar }) => {
  const wsUri = "ws://localhost:8080/main";
  const webSocket = useRef(null);
  const nicknameInput = useRef('');
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {

    if(!user.id) {
      navigate('/login');
      return;
    }
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

  const onClickTest = () => {
    const data = {
      type: 'createRoom',
      user
    }
    console.log("send", data);
    webSocket.current.send(JSON.stringify(data));
  }

  

  const onClickCreateAvatar = async (nickname) => {
    if(nickname) {
      nicknameInput.current = nickname;
      console.log('nicknameInput.current', nicknameInput.current);
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

  const setCreateAvatar = useCallback((_b) => {
    setShowCreate(_b);
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
    console.log('data', data);
    setShowCreate(false);
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

  const onCllickCreateRoom = () => {

  }

  const onClickBurn = () => {
    burn(user.wallet);
  }

  return (
    <>
    {/* <div style={{position:'fixed', color:'red', fontSize:'20px', fontWeight:'bold', top:'0', textAlign:'right', right:'0'}}>
      {'id : ' + user.id}<br />
      {'wallet : ' + user.wallet}<br />
      {'avatar_id : ' + user.avatar_id}<br />
      {'nickname : ' + user.nickname}<br />
    </div> */}
      
      <div className={styles.container}>
        <div className={styles.roomlist_container}>
          <BattleRoom />
          <BattleRoom />
          <BattleRoom />
        </div>
        <MainProfile setCreateAvatar={setCreateAvatar} onClickBurn={onClickBurn}/>
      </div> 
      {showCreate && <CreateAvatar onClickCreateAvatar={onClickCreateAvatar} setCreateAvatar={setCreateAvatar} onCllickCreateRoom={onCllickCreateRoom}/>}
      <button onClick={onClickTest}>클릭~</button>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    user : state.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUser: data => dispatch(SET_USER(data)),
    setAvatar: data => dispatch(SET_AVATAR(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);