import React from 'react';
import styles from './Loader.module.css';

export default function Loader({text, absolute, size, background}) {
  return (
    <div className={`w-100 h-100 rounded fw-bold d-flex align-items-center justify-content-center ${absolute ? 'position-absolute' : ''} ${styles.loader}`} style={{fontSize: size, backdropFilter: background ? 'blur(5px)' : 'none'}}>
        <div className={styles.loader_text}>
          {text}
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
    </div>
  )
}
