import React, { memo, useRef, useEffect } from 'react'
import styles from './CreateAvatar.module.css';
import { useSelector, connect } from 'react-redux'

const CreateAvatar = ({ onClickCreateAvatar, setCreateAvatar }) => {
  const nicknameRef = useRef(null)
  const user = useSelector((state) => state.user);

  return (
    <div>
      <div className={styles.view}>
        <div className={styles.container}>
          <span className={styles.close} onClick={()=>{setCreateAvatar(false)}}>x</span>
          <div className="center">
            <div className={styles.title}>아바타 생성</div>
            <input type="text" className={styles.input_wallet} value={user.wallet} readOnly/>
            <input type="text" className={styles.input_nickname} placeholder='닉네임을 입력해 주세요.' maxLength={10} ref={nicknameRef} />
            <button className={styles.btn} onClick={() => onClickCreateAvatar(nicknameRef.current.value)}>생성</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAvatar;