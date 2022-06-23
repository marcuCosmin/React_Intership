import { faSortDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {useEffect, useRef} from 'react';
import styles from './Dropdown.module.css';
import sstyles from '../Sign/Sign.module.css';

export default function Dropdown(props) {

    const dropdownListRef = useRef(null);

  return (
    <div className={`position-relative mt-3`} style={props.style}>
        <div style={props.titleStyle} onBlur={function(e) {!dropdownListRef.current.contains(e.relatedTarget) && props.setVisibility(false)}} tabIndex='0' className={`p-2 d-flex justify-content-between rounded-top ${props.visible ? styles.dropdown_title_open : undefined} ${!props.visible ? 'rounded-bottom' : undefined} ${styles.dropdown_title} ${props.error ? sstyles.inputs_errors: undefined}`} onClick={props.setVisibility}><span className={!props.items.includes(props.value) ? styles.dropdown_title_placeholder : undefined}>{props.value}</span> <FontAwesomeIcon icon={faSortDown}/></div>

        {props.visible && (
          <ul ref={dropdownListRef} className={`position-absolute bg-white shadow rounded-bottom p-2 w-100 ${styles.dropdown_list}`}>
              {props.items && props.items.map((e, index) => <li onBlur={function(e) {!dropdownListRef.current.contains(e.relatedTarget) && props.setVisibility(false)}} key={index} tabIndex={props.visible ? '0' : '-1'} onClick={function() {props.setValue(e);}}>{e}</li>)}
          </ul>
        )}
    </div>
  )
}
