import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = setTimeout(()=> {
      navigate('/login');
    }, 3000);
    return () => {
      clearTimeout(redirect);
    }
  }, []);

  return (
    <div>
      <img className={styles.notfoundpage} />
    </div>
  )
}

export default  NotFoundPage;
