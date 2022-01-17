import React, { memo, useEffect, useState } from 'react'
import styles from './Login.module.css';
import { connect } from 'react-redux'
import { get } from '../api';
import store, { LOGIN, SET_PAGE } from '../store';
import { useNavigate } from 'react-router-dom';
import { connectSocket } from '../socket';

const Login = memo(({user, LOGIN, setPage }) => {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState('');
  
  useEffect(() => {

    setPage("Login");

    getAccount();
    
    const unsubscribe = store.subscribe(() => {
      Login();
    });

    window.ethereum.on('accountsChanged', function(_accounts) {
      setWallet(_accounts[0]);
    });

    connectSocket();
    return () => {
      unsubscribe();
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

  const onClickLogin = async () => {
    const res = await get(`user/login/${wallet}`)
    if(res) {
      res[0].createtime = res[0].createtime.replace("T", " ");
      LOGIN(res[0]);
    } else {
      
    }
  }

  const Login = () => {
    if(user) {
      navigate('/main');
    }
  }

  const onClickJoin = () => {
    navigate('/join');
  }

  return (
    <>
      <div className={styles.background}>
        <div className={`${styles.form} center`}>
          <div className={styles.form_img_container}>
            <img className={`${styles.form_img} center`} alt=''/>
          </div>
          <div className={styles.form_login_container}>
            <form className='center'>
              <label htmlFor='account' className={styles.login_label}>지갑주소를 적자!</label>
              <input id={styles.account} value={wallet} onChange={onChangeWallet} readOnly/>
              <div className={styles.btns}>
                <button className={styles.login} type='button' onClick={onClickLogin}>로그인</button>
                <button className={styles.join} type='button' onClick={onClickJoin}>회원가입</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
});

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    LOGIN: data => dispatch(LOGIN(data)),
    setPage: data => dispatch(SET_PAGE(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);