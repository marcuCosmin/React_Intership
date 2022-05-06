import React, {useState, useEffect} from 'react';
import Card from './Card';
import styles from './Column.module.css';

export default function Column(props) {
    const [world, setWorld] = useState({});
    useEffect(function() {
        fetch(props.link).then(raw => raw.json()).then(r => setWorld(r));
    }, []);
  return (
    <li className={styles.column_list}>
        <div className='fw-bold text-white text-center mb-3'>{world.name}</div>
        <ul>
            {props.heroes.map((el, index) => <Card key={index} hasBottomMargin={(props.heroes.length !== 1 && index !== props.heroes.length - 1)} element={el} isEven={index % 2 === 0}/>)}
        </ul>
    </li>
  )
}
