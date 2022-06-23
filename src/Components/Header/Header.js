import React, {useContext, useEffect, useState, useRef} from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";
import styles from './Header.module.css';
import cstyles from '../../Common.module.css';
import {user} from '../../Contexts/Authentication';
import { deviceWidth } from '../../Contexts/DeviceWidth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faCog, faBell } from '@fortawesome/free-solid-svg-icons';

export default function Header() {

    const u = useContext(user);
    const dw = useContext(deviceWidth);

    const [signDropdown, setSignDropdown] = useState(false);
    const signDropdownRef = useRef(null);

    function escapeDropdown(e) {
        if (signDropdownRef.current) {
            if (e.target !== signDropdownRef.current && !signDropdownRef.current.contains(e.target)) {
                setSignDropdown(false);
                window.removeEventListener('click', escapeDropdown);
            }
        }
    }


    useEffect(function() {

        if (signDropdown) {
            window.addEventListener('click', escapeDropdown);
        }

    }, [signDropdown]);
    
    return (
        <nav className='d-flex w-100 justify-content-end align-items-end navbar py-2 pt-0 ps-2 pe-4' style={{minHeight: '75px'}}>

            <div>  
                <div className={`position-relative ${styles.dropdown}`}>
                    <div tabIndex='0' className={`fw-bold text-center pt-2 ${styles.dropdown_title} ${signDropdown && styles.dropdown_title_active}`} onClick={function() {!signDropdown && setSignDropdown(true);}}>
                        <img className={`rounded-circle ${styles.profile_image}`} src={u.photoURL}/>
                        <div>{u.displayName}</div>
                    </div>
                    <ul ref={signDropdownRef} className={`rounded ${[cstyles.list, styles.dropdown_list].join(' ')} ${signDropdown ? 'visible py-2 px-3' : 'invisible p-0'}`} style={{maxHeight: `${signDropdown ? 500 : 0}px`}}>
                        <li tabIndex='0' className={`text-nowrap mb-${dw <= 450 ? '3' : '2'}`}><FontAwesomeIcon className='me-2' icon={faBell}/>Notifications</li>
                        <li tabIndex='0' className={`text-nowrap mb-${dw <= 450 ? '3' : '2'}`}><NavLink exact="true" to={`/settings/${u.uid}`}><FontAwesomeIcon className='me-2' icon={faCog}/>Settings</NavLink></li>
                        <li tabIndex='0' className='text-nowrap' onKeyUp={function(e) {
                            if (e.key === 'Enter') {
                                signOut(getAuth()).then(function() {
                                    window.location.href = '/';
                                });
                            }
                        }} onClick={function() {
                            signOut(getAuth()).then(function() {
                                window.location.href = '/';
                            });
                        }}><FontAwesomeIcon className='me-2' icon={faSignOutAlt}/>Sign out</li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
