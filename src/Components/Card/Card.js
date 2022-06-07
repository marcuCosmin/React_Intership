import React from 'react';

import styles from './Card.module.css';

export default function Card(props) {

    return (
        <div onClick={props.flip} className={`d-flex bg-white px-1 flex-column rounded ${styles[props.suit]} ${styles.card} ${styles[props.size]} ${props.faceDown && [styles[`facedown_${props.size}`], "py-1"].join(" ")}`} style={props.styles}>
            {props.faceDown ? (
                <div className={`w-100 h-100 rounded ${styles.facedown_background}`}/>
            ) : (
                <>
                    <div>
                        <span className='fw-bold'>{props.name}</span>
                        <span dangerouslySetInnerHTML={{__html: `&${props.suit};`}}/>
                    </div>
                    <span className={`align-self-center ${styles.suit}`} dangerouslySetInnerHTML={{__html: `&${props.suit};`}}/>
                    <div className={`align-self-end ${styles.card_footer}`}>
                        <span className='fw-bold'>{props.name}</span>
                        <span dangerouslySetInnerHTML={{__html: `&${props.suit};`}}/>
                    </div>
                </>
            )}
        </div>    
    );
}
