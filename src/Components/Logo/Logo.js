import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

export default function Logo({isLink, className}) {
  return (
      <>
        {isLink ? (
            <Link className={`d-flex text-white ${[styles.logo, className].join(' ')}`} exact='true' to='/'>
                <span>Papery</span>
                <FontAwesomeIcon className='ms-1' icon={faPaperPlane}/>
            </Link>
        ) : (
            <div className={`d-flex text-white ${[styles.logo, className].join(' ')}`}>
                <span>Papery</span>
                <FontAwesomeIcon className='ms-1' icon={faPaperPlane}/>
            </div>
        )}
      </>
  )
}
