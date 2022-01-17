import React, { memo, useEffect, useState } from 'react'
import styles from './Join.module.css';
import { useSelector, useDispatch, connect } from 'react-redux'
import { get, post } from '../api';
import store, { LOGIN, SET_PAGE } from '../store';
import { useNavigate } from 'react-router-dom';

const Join = memo(({Login, setPage}) => {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState('');

  useEffect(() => {

    setPage("Join");
    
    getAccount();
    
    const subscribe = store.subscribe(() => {
      Join();
    });
    
    window.ethereum.on('accountsChanged', function(_accounts) {
      setWallet(_accounts[0]);
    });
    

    return () => {
      subscribe();
    }
  }, [])

  const getAccount = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(account[0]);
    }
  }

  const onChangeWallet = (e) => {
    setWallet(e.target.value);
  }

  const Join = () => {
    if(store.getState().user.id) {
      navigate('/main');
    }
  }

  const onClickJoin = async () => {
    const data = {
      wallet
    }
    const res = await post(`user/join`, data);
    if(res) {
      Login(res);
    } else {
      alert('이미 가입된 주소입니다.');
    }
  }

  return (
    <>
      <div className={styles.background}>
        <div className={`${styles.form} center`}>
          <div className={styles.form_join_container}>
            <form className='center'>
              <label htmlFor='account' className={styles.join_label}>가입을 위해 지갑주소를 적자!</label>
              <input id={styles.account} value={wallet} onChange={onChangeWallet} readOnly/>
              <div className={styles.btns}>
                <button className={styles.join} type='button' onClick={onClickJoin}>회원가입</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
});

const mapDispatchToProps = (dispatch) => {
  return {
    Login: data => dispatch(LOGIN(data)),
    setPage: data => dispatch(SET_PAGE(data)),
  }
}

export default connect(null, mapDispatchToProps)(Join);