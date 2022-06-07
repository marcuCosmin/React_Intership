import React, {useState, useEffect, useRef, useContext} from 'react';

import styles from './Lobby.module.css';
import cstyles from '../../Common.module.css';

import Checkbox from '../Checkbox/Checkbox';

import {user} from '../../Contexts/Authentication';

import { doc, updateDoc, arrayUnion, onSnapshot, collection, setDoc, query, where } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

export default function Lobby() {

    const u = useContext(user);

    const dropdownRef = useRef(null);

    const [ids, setIds] = useState([]);

    const [tables, setTables] = useState([]);

    const [inputs, setInputs] = useState({
        stakes: {
            dropdownVisible: false,
            small: '0.01',
            big: '0.02'
        },
        debug: false,
        maxPlayers: 2
    });

    function setStakes(e) {
        if (e.key === 'Enter' || e.type === 'click' ) {
            let stakes = e.target.innerText.replace('-', '');
            setInputs({...inputs, stakes: {...inputs.stakes, small: stakes.split(" ")[0], big: stakes.split(" ")[2]}});
        }
    }

    function generateTableId() {
        const genratedId = Math.random() * 999999999999999999999;
        return ids.includes(genratedId) ? generateTableId() : genratedId;
    }

    async function addTable() {
        const id = generateTableId();

        const botNames = ["Tony", "Mark", "John", "Joe", "Maria", "Alex", "Helen", "Rodriguez", "Mike", "Alice", "Patricia", "Daniel", "Jennifer", "Marcus", "Gabriela"];
        const pickedBotNames = [];

        if (inputs.debug) {
            for (let i = 0; i < 8; i++) {
                pickedBotNames.push(botNames.splice(Math.floor(Math.random() * botNames.length), 1)[0]);
            }
        }

        await setDoc(doc(collection(getFirestore(), 'tables'), id.toString()), {
            blinds: {
                small: parseFloat(inputs.stakes.small),
                big:  parseFloat(inputs.stakes.big)
            },
            debug: {
                active: inputs.debug,
                placingButton: false,
                paused: false
            },
            maxPlayers: inputs.debug ? 9 : inputs.maxPlayers,
            players: [{
                name: u.displayName,
                uid: u.uid,
                hand: {cards: [], strength: null, topCard: null},
                sitOut: false,
                currentPosition: null
            }],
            pending: true,
            id,
            bots: inputs.debug ? pickedBotNames : null
        });

        await updateDoc(doc(collection(getFirestore(), 'tables'), 'ids'), {
            values: arrayUnion(id.toString())
        });

        document.location.href = `/tables/${id}`;
    }

    useEffect(async function() {
        onSnapshot(doc(getFirestore(), 'tables', 'ids'), function(doc) {
            setIds([...doc.data().values]);
        });
        onSnapshot(query(collection(getFirestore(), 'tables')), function(querySnapshot) {
            const tablesSnapshot = []
            querySnapshot.forEach(function(doc) {
                const data = doc.data();
                if (!doc.data().debug) {
                    tablesSnapshot.push(doc.data())
                }
            });

            tablesSnapshot.splice(tablesSnapshot.findIndex((element) => !element.hasOwnProperty('id')), 1);

            setTables([...tablesSnapshot]);
        });
    }, []);

    function escapeDropdown(e) {
        if (e.target !== dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setInputs({...inputs, stakes: {...inputs.stakes, dropdownVisible: false}});
        }
    }

    useEffect(function() {
        if (inputs.stakes.dropdownVisible) {
            window.addEventListener('click', escapeDropdown, {once: true});
        }
    }, [inputs.stakes]);

    return (
        <div className='d-flex flex-column align-items-center justify-content-center mt-4'>

            <div>
                <div>Active tables</div>
            </div>
            
            <div>
                <div>
                    <form className={`shadow rounded p-3`} onSubmit={addTable}>
                        <div className='position-relative'>
                            <div tabIndex='0' className={`d-flex align-items-center justify-content-around ${inputs.stakes.dropdownVisible ? 'rounded-top' : 'rounded'} ${styles.list_title} ${inputs.stakes.dropdownVisible && styles.list_title_active}`} onKeyUp={function(e) {if (e.key === 'Enter') {
                                window.removeEventListener('click', escapeDropdown);
                                setInputs({...inputs, stakes: {...inputs.stakes, dropdownVisible: !inputs.stakes.dropdownVisible}});}
                            }} onClick={function() {!inputs.stakes.dropdownVisible && setInputs({...inputs, stakes: {...inputs.stakes, dropdownVisible: true}})}}>
                                <h6 className='m-0 rounded-left p-1'>Blinds</h6>
                                <span>{inputs.stakes.small} - {inputs.stakes.big}</span>
                            </div>
                            <ul ref={dropdownRef} className={`position-absolute rounded-bottom w-100 p-0 ${styles.main_list} ${inputs.stakes.dropdownVisible ? 'visible' : 'invisible'}`} style={{maxHeight: `${inputs.stakes.dropdownVisible ? 310 : 0}px`}}>
                                <ul>
                                    <h6>Micro stakes</h6>
                                    <li onKeyUp={setStakes} onClick={setStakes} tabIndex='0'>0.01 - 0.02</li>
                                    <li onKeyUp={setStakes} onClick={setStakes} tabIndex='0'>0.02 - 0.05</li>
                                </ul>
                                <ul>
                                    <h6>Low stakes</h6>
                                    <li onKeyUp={setStakes} onClick={setStakes} tabIndex='0'>0.1 - 0.25</li>
                                    <li onKeyUp={setStakes} onClick={setStakes} tabIndex='0'>0.25 - 0.5</li>
                                </ul>
                                <ul>
                                    <h6>Medium stakes</h6>
                                    <li onKeyUp={setStakes} onClick={setStakes} tabIndex='0'>1 - 2.5</li>
                                    <li onKeyUp={setStakes} onClick={setStakes} tabIndex='0'>2.5 - 5</li>
                                </ul>
                                <ul>
                                    <h6>High stakes</h6>
                                    <li onKeyUp={setStakes} onClick={setStakes} tabIndex='0'>10 - 20</li>
                                    <li onKeyUp={setStakes} onClick={setStakes} tabIndex='0'>25 - 50</li>
                                </ul>
                            </ul>
                        </div>

                        <div tabIndex='0' onKeyUp={function(e) {
                            if (e.key === 'ArrowUp') {
                                inputs.maxPlayers < 9 && setInputs({...inputs, maxPlayers: inputs.maxPlayers + 1});
                            } else if (e.key === 'ArrowDown') {
                                inputs.maxPlayers > 2 && setInputs({...inputs, maxPlayers: inputs.maxPlayers - 1});
                            }
                        }} className={`mt-3 d-flex justify-content-around align-items-center rounded ${styles.list_title}`}>
                            <div>Max Players</div>
                            <div className='d-flex flex-column justify-content-center'>
                                <FontAwesomeIcon className='mt-1' icon={faSortUp} onClick={function() {inputs.maxPlayers < 9 && setInputs({...inputs, maxPlayers: inputs.maxPlayers + 1})}}/>
                                <span>{inputs.maxPlayers}</span>
                                <FontAwesomeIcon className='mb-1' icon={faSortDown} onClick={function() {inputs.maxPlayers > 2 && setInputs({...inputs, maxPlayers: inputs.maxPlayers - 1})}}/>
                            </div>
                        </div>

                        <div className='mt-3 d-flex align-items-center'>
                            <Checkbox state={{value: inputs.debug, update: function(e) {(e.type === 'click' || e.key === 'Enter') && setInputs({...inputs, debug: !inputs.debug});}}} label={{value: 'Debug mode', fontSize: 100}}/>
                            <FontAwesomeIcon className='ms-3' icon={faInfo}/>
                        </div>

                        <button className={`mt-3 w-100 rounded p-2 ${cstyles.btn}`} type='button'>Create new table</button>
                    </form>
                </div>
                <ul>

                </ul>
            </div>
        </div>
    );
}
