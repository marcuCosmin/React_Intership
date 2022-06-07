import React, { useContext } from 'react';

import styles from './Dealer.module.css';
import { deviceWidth } from '../../Contexts/DeviceWidth';
import { getFirestore } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";

export default function Dealer(props) {
    const dw = useContext(deviceWidth);

    return (
        <div
        onClick={function() {
            if (props.placeholder) {
                const players = props.table.players.slice();
                players[players.findIndex(player => player.uid === props.uid)].currentPosition = props.table.players.filter(player => !player.sitOut).length - 1;
                updateDoc(doc(getFirestore(), 'tables', props.table.id.toString()), {
                    pending: false,
                    players
                }).then(function() {props.clear()});
            }
        }}
        onKeyUp={function(e) {
            if (e.key === "Enter" && props.placeholder) {
                const players = props.table.players.slice();
                players[players.findIndex(player => player.uid === props.uid)].currentPosition = props.table.players.filter(player => !player.sitOut).length - 1;
                updateDoc(doc(getFirestore(), 'tables', props.table.id.toString()), {
                    pending: false,
                    players
                }).then(function() {props.clear()});
            }
        }}
        tabIndex={props.placeholder ? '0' : '-1'}
        className={`d-flex justify-content-center align-items-center position-absolute text-white rounded-circle fw-bold ${styles.dealer} ${props.placeholder ? styles.dealer_placeholder : styles.dealer_fill}`}
        style={props[dw < 480 ? 'responsive' : 'desktop']}>
            {props.placeholder ? '' : 'D'}
        </div>
    )
}
