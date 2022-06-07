import React, {useContext, useState} from 'react';

import Card from '../Card/Card';
import styles from './Player.module.css';

import { deviceWidth } from '../../Contexts/DeviceWidth';
import { getAuth } from 'firebase/auth';

export default function Player(props) {

  const dw = useContext(deviceWidth);
  const [faceDown, setFaceDown] = useState(getAuth().currentUser.uid !== props.uid);
  return (
    <div className={`position-absolute ${styles.player_container} ${dw <= 600 && styles.player_mobile}`} style={props.position[`${dw < 600 ? 'responsive' : 'desktop'}`]}>
      {props.uid ? (
        <>
          <div className={`text-white rounded mb-1 ${styles.standard_bg}`}>
            <div className={`text-center fw-bold`}>{props.name}</div>
            <div className={`text-center`}></div>
            <div className={`text-center`}>{props.stack}</div>
          </div>

          <div tabIndex={props.isDebug ? "0" : "-1"} onClick={function() {(getAuth().currentUser.uid !== props.uid && props.isDebug) && setFaceDown(!faceDown)}} className={`d-flex justify-content-around ${styles.cards_container}`} style={{visibility: props.hand.cards.length === 2 ? 'visible' : 'hidden', transform: `translateY(${props.hand.cards.length === 2 ? 0 : -50}px)`, opacity: props.hand.cards.length === 2 ? '1' : '0'}}>
            {props.hand.cards[0] && (
              <div className='me-1'><Card size={getAuth().currentUser.uid === props.uid ? 'medium' : 'small'} name={props.hand.cards[0].name} suit={props.hand.cards[0].suit} faceDown={faceDown}/></div>
            )}
            {props.hand.cards[1] && (
              <div><Card size={getAuth().currentUser.uid === props.uid ? 'medium' : 'small'} name={props.hand.cards[1].name} suit={props.hand.cards[1].suit} faceDown={faceDown}/></div>
            )}
          </div>
        </>
      ) : (
        <div>
          <div className={`fw-bold rounded text-white p-2 ${styles.standard_bg} ${styles.empty_seat}`}>Empty seat</div>
        </div>
      )}

    </div>
  )
}
