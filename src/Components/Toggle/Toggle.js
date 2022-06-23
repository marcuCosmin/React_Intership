import React from 'react';
import styles from './Toggle.module.css';

export default function Toggle(props) {
  return (
    <div className='d-flex justify-content-center mt-2 mb-3'>

        <div className='rounded p-2 bg-white d-flex align-items-center'>

          <div className={`${styles.toggle_text} ${props.value && styles.toggle_active_text}`}>{props.labels[0]}</div>

          <div tabIndex='0' className={`mx-2 ${styles.toggle}`} onClick={props.updateValue}>
            <div className={`${styles.toggle_circle}`} style={{transform: `translateX(${props.value ? 0 : 100}%) scale(1.1)`}}/>
          </div>

          <div className={`${styles.toggle_text} ${!props.value && styles.toggle_active_text}`}>{props.labels[1]}</div>

        </div>

      </div>
  )
}
