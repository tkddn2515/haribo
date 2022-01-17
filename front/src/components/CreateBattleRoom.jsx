import React, { useState} from 'react';
import styles from './CreateBattleRoom.module.css';

const CreateBattleRoom = ({onClickCreateBattleRoom, setCreateBattleRoom}) => {
  const [roomName, setRoomName] = useState('');

  const onChangeRoomName = (e) => {
    setRoomName(e.target.value);
  }

  const onClickCreateRoom = () => {
    onClickCreateBattleRoom(roomName); 
    setCreateBattleRoom(false);
  }

  return (
    <div className={styles.view}>
       <div className={`${styles.container} center`}>
          <span className={styles.close} onClick={()=>{setCreateBattleRoom(false)}}>x</span>
          <div className="center">
            <input className={`${styles.input}`}  type='text' placeholder="방 제목을 입력하다." maxLength={20} value={roomName} onChange={onChangeRoomName}/>
            <button className={`${styles.btn}`} onClick={onClickCreateRoom}>방 생성</button>
          </div>
       </div>
    </div>
  )
}
export default CreateBattleRoom;