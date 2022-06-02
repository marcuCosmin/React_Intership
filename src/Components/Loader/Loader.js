import React from 'react';
import styles from './Loader.module.css';
import Card from '../Card/Card';

export default function Loader({text}) {
  return (
    <div className={`position-absolute w-100 h-100 rounded d-flex align-items-center justify-content-center flex-column ${styles.loader}`}>
        <div className="position-relative w-100 h-25 d-flex align-items-end justify-content-center">
            <div className={`position-absolute ${styles.loader_cards}`}><Card name='A' suit='spades' size='small'/></div>
            <div className={`position-absolute ${styles.loader_cards}`}><Card faceDown={true} size='small'/></div>
        </div>
        <div className={`mt-2-2 fw-bold ${styles.loader_text}`}>{text}<span className='ms-1'>.</span><span>.</span><span>.</span></div>
    </div>
  )
}
