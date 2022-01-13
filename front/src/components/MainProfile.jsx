import React, { memo, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { get, post } from '../api';
import store, { LOGIN } from '../store';
import { useNavigate } from 'react-router-dom';
import styles from './MainProfile.module.css';

const MainProfile = ({user, avatar, setCreateAvatar, onClickBurn, onCllickCreateRoom}) => {
  return (
    <div>
      <div className={styles.profile_container}>
        {
          user.avatar_id ?
          <div className={`${styles.profile_view} center`}>
            <img className={styles.thumb} />
            <div className={styles.nickname}>{user.nickname}</div>
            <div className={styles.wallet}>{user.wallet}</div>
            <div className={styles.createRoom} onClick={onCllickCreateRoom}>방 생성</div>
            <div className={styles.avatarStatus}>
              아바타 정보
              {Object.entries(avatar).filter(v=> !["tokenId", "fill_hungry_time", "fill_thirst_time"].includes(v[0])).map((v, idx) => 
                <div className={styles.status} key={idx}>{v[0] + ':' + v[1]}</div>
              )}
            </div>
            <button onClick={onClickBurn}>아바타 삭제</button>
          </div>
          :
          <div className={`${styles.none} center`}>
            <button onClick={()=>{ setCreateAvatar(true)}}>아바타 생성</button>
          </div>
        }
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    avatar: state.avatar
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setCreateAvatar: ownProps.setCreateAvatar,
    onClickBurn: ownProps.onClickBurn,
    onCllickCreateRoom: ownProps.onCllickCreateRoom
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainProfile);
