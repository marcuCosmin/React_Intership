import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './DashboardLink.module.css';

export default function DashboardLink(props) {

  return (
    <li className={`d-flex align-items-center ${useLocation().pathname === props.location && styles.dashboard_current} ${props.visible ? 'd-block' : 'd-none'}`}>
        <Link className='p-3 w-100' exact='true' to={props.location}><FontAwesomeIcon className='me-2' icon={props.icon}/>{props.title}</Link>
    </li>
  )
}
