import React, {useState, useEffect} from 'react';
import styles from './Card.module.css';

export default function Card(props) {
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(function() {
    if (document.cookie.includes('favs')) {
      if (document.cookie.split('favs=')[1].includes(props.element.name)) {
        setIsFavourite(true);
      }
    }
  }, []);

  useEffect(function() {
    if (isFavourite) {
      if (document.cookie.includes('favs')) {
        if (!document.cookie.split('favs=')[1].includes(props.element.name)) {
          document.cookie = `favs=${(document.cookie.split('favs=')[1] + ',') + props.element.name}; expires=27 June ${new Date().getFullYear() + 10} 00:00:00; secure`;
        }
      }
    } else if (document.cookie.includes('favs')) {
        document.cookie = `favs=${document.cookie.split('favs=')[1].replace(`,${props.element.name}`, "")}; expires=27 June ${document.cookie.split('favs=')[1].replace(`,${props.element.name}`, '').length > 0 ? new Date().getFullYear() + 10 : '2000'} 00:00:00; secure`;
    }
  }, [isFavourite]);

  return (
    <li className={`position-relative text-white ${styles.card} ${props.hasBottomMargin && 'mb-5'}`}>

        <div className={`${[styles.descr_container, styles[props.isEven ? 'even' : 'odd']].join(" ")}`}>
          <div className='d-flex align-items-center justify-content-between'>
            <span className={`fw-bold ${styles.name}`}>{props.element.name}</span>

            <button className={[styles.star, styles[`star_${props.isEven ? 'even' : 'odd'}`]].join(" ")} onKeyUp={function(e) {e.code === 'Space' && setIsFavourite(!isFavourite);}} onClick={function() { setIsFavourite(!isFavourite);}}>

              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path className={isFavourite ? styles[`star_filled_${props.isEven ? 'even' : 'odd'}`] : '' } d="M8.25956 1.50639C8.51555 0.831203 9.48434 0.831203 9.74114 1.50639L11.3971 6.09352C11.4549 6.24295 11.5566 6.37134 11.6889 6.46175C11.8211 6.55216 11.9777 6.60034 12.1379 6.59992H16.2074C16.9594 6.59992 17.2874 7.5359 16.6962 7.99429L13.8003 10.5999C13.6706 10.6996 13.5758 10.8378 13.5295 10.9948C13.4832 11.1517 13.4878 11.3193 13.5427 11.4734L14.6003 15.9558C14.8579 16.6758 14.0243 17.2942 13.3939 16.851L9.46034 14.355C9.32563 14.2603 9.16499 14.2095 9.00035 14.2095C8.8357 14.2095 8.67506 14.2603 8.54035 14.355L4.60681 16.851C3.97722 17.2942 3.14283 16.675 3.40043 15.9558L4.45802 11.4734C4.51288 11.3193 4.5175 11.1517 4.47122 10.9948C4.42494 10.8378 4.33014 10.6996 4.20042 10.5999L1.30446 7.99429C0.712472 7.5359 1.04207 6.59992 1.79246 6.59992H5.86199C6.02222 6.60045 6.17884 6.55232 6.31112 6.4619C6.4434 6.37147 6.54511 6.24301 6.60278 6.09352L8.25876 1.50639H8.25956Z" stroke={props.isEven ? '#E6FF83' : '#FF5A5A'} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

            </button>
            
          </div>

          <div className={`mt-2 ${styles.info_block}`}>
            <span>Height: </span>
            <span>{props.element.height}</span>
          </div>

          <div className={styles.info_block}>
            <span>Birth year: </span>
            <span>{props.element.birth_year}</span>
          </div>
        </div>

        <div className={`position-absolute rounded-circle ${[styles.planet, styles[`planet_${props.isEven ? "even" : 'odd'}`]].join(" ")}`}></div>
    </li>
  )
}
