import React, {useState, useContext, useEffect} from 'react';

import styles from './Dashboard.module.css';

import Logo from '../Logo/Logo';

import { faBriefcase, faCalendarAlt, faReceipt, faUsers, faSortDown } from '@fortawesome/free-solid-svg-icons';

import DashboardLink from './DashboardLink/DashboardLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { user } from '../../Contexts/Authentication';
import { getFirestore, onSnapshot, collection, query } from "firebase/firestore";

// import { additional } from '../../Contexts/Additional';

export default function Dashboard() {

  const [requests, setRequests] = useState(false);

  const u = useContext(user);

  const [a, setA] = useState({});

  useEffect(function() {
    onSnapshot(query(collection(getFirestore(), 'users')), function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
          if (doc._key.path.segments[doc._key.path.segments.length - 1] === u.uid) {
              setA(doc.data());
          }
      });
    });
  }, []);


  return (
    <div className={`position-fixed h-100 ${styles.dashboard}`}>
      <div>
        <Logo className='m-3' isLink={false}/>
        <ul className={`p-0 m-0 text-white rounded ${styles.dashboard_list}`}>
          <DashboardLink location="/teams" visible={a.jobTitle === 'Team Leader' || a.jobTitle === 'CEO'} title="Teams / Employees" icon={faUsers}/>
          <DashboardLink location="/" visible={true} title="Calendar" icon={faCalendarAlt}/>
          <DashboardLink location="/work" visible={a.jobTitle === 'Human Resources' || a.jobTitle === 'CEO'} title="Work" icon={faBriefcase}/>
          <li className={`p-3 position-relative`}>
            <span className={`${styles.requests_title} ${requests && styles.requests_title_active}`} onClick={function(){setRequests(!requests)}}><FontAwesomeIcon className='me-2' icon={faReceipt}/>Requests <FontAwesomeIcon icon={faSortDown}/></span>
            {requests && <ul className={`shadow border rounded position-absolute ${styles.requests_list}`}>
              <li><a href='https://firebasestorage.googleapis.com/v0/b/alexandru-matei.appspot.com/o/Salary%20Flyer.xlsx?alt=media&token=54a7f363-6a84-4873-95d4-8be2806b1ac9' download={true}>Salary Flyer</a></li>
              <li><a href='https://firebasestorage.googleapis.com/v0/b/alexandru-matei.appspot.com/o/Dummy.xlsx?alt=media&token=30d18aa8-da8b-4a4f-bb4c-e13899c7f7c6' download={true}>Dummy Request</a></li>
            </ul>
            }
          </li>
        </ul>
      </div>
    </div>
  )
}
