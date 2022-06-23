import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './Checkbox.module.css';

export default function Checkbox(props) {
  return (
    <div tabIndex='0' className={`d-flex align-items-center ${styles.container}`} onClick={props.state.update} onKeyUp={props.state.update}>
      {props.label && <div className={`me-2 ${styles.label}`}>{props.label}</div>}
      <div className={`d-flex align-items-center justify-content-center rounded ${styles.checkbox}`}>
        <FontAwesomeIcon className={`${props.state.value ? `visible` : `invisible ${styles.not_active}`}`} icon={faCheck}/>
      </div>
    </div>
  );
}
