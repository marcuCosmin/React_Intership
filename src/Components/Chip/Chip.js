import React from 'react';
import styles from './Chip.module.css';

export default function Chip() {
    return (
        <div className={`rounded-circle ${styles.chip_container}`}>
            <div className={`rounded-circle ${styles.chip_edges}`}></div>
        </div>
    );
}
