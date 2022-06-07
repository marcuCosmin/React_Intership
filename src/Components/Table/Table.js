import React, {useContext, useEffect, useState, useRef} from 'react';
import { useLocation } from 'react-router-dom';

import styles from './Table.module.css';
import cstyles from '../../Common.module.css';

import Card from '../Card/Card';
import Player from '../Player/Player';
import Loader from '../Loader/Loader';
import Dealer from '../Dealer/Dealer';
import Chip from '../Chip/Chip';

import { deviceWidth } from '../../Contexts/DeviceWidth';
import { arrayUnion, arrayRemove, getFirestore } from "firebase/firestore";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { user } from '../../Contexts/Authentication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faUndo, faUserMinus, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { getAuth } from 'firebase/auth';

export default function Table() {

  class Bot {
    constructor(name, uid, sitOut, currentPosition, hand) {
      this.name = name;
      this.uid = uid;
      this.sitOut = sitOut;
      this.currentPosition = currentPosition;
      this.hand = hand;
    }
  }

  const id = useLocation().pathname.split('/')[2];
  
  const u = useContext(user);
  const dw = useContext(deviceWidth);

  const [table, setTable] = useState({});
  const [seats, setSeats] = useState([]);
  const [deck, setDeck] = useState([]);

  // hand.stages = 0 - 'Pre-flop'
  // hand.stages = 1 - 'Flop'
  // hand.stages = 2 - 'Turn'
  // hand.stages = 3 - 'River'

  const [hand, setHand] = useState({
    stage: 0,
    pot: 0,
    button: 0,
    board: {
      flop: [],
      turn: {},
      river: {}
    },
    currentHand: {
      players: [],
      board: [],
      pot: 0,
      no: 1
    }
  });

  const footerRef = useRef(null);

  function draw(hand, number) {

    for (let i = 0; i < number; i++) {
      const index = generateIndex(deck);
      hand.push(deck[index]);
    }

  }

  function generateIndex(array, excluded) {
    let index = Math.floor(Math.random() * array.length);

    return excluded ? (array[index] || !excluded.includes(index)) ? index : generateIndex(array) : array[index] ? index : generateIndex(array);
  }

  useEffect(function() {
    onSnapshot(doc(getFirestore(), 'tables', id), function(doc) {
      const data = doc.data();
      const seatsToBeSorted = [];
      const positions = {
        button: {
          responsive: [
            {top: '88%'},
            {top: '79%', left: '32%'},
            {top: '65%', left: '27%'},
            {top: '30%', left: '27%'},
            {top: '18%', left: '32%'},
            {top: '18%', right: '32%'},
            {top: '30%', right: '27%'},
            {top: '65%', right: '27%'},
            {top: '79%', right: '32%'}
          ],
          desktop: [
            {top: '88%'},
            {top: '79%', left: '24%'},
            {top: '62%', left: '17%'},
            {top: '30%', left: '17%'},
            {top: '13%', left: '24%'},
            {top: '13%', right: '24%'},
            {top: '30%', right: '17%'},
            {top: '62%', right: '17%'},
            {top: '79%', right: '23%'}
          ]
        },
        responsive: [
          {top: '100%'},
          {top: '83%', left: '2%'},
          {top: '60%', left: '-5%'},
          {top: '22%', left: '-5%'},
          {top: '-2%', left: '2%'},
          {top: '-2%', right: '2%'},
          {top: '22%', right: '-5%'},
          {top: '60%', right: '-5%'},
          {top: '83%', right: '2%'},
        ],
        desktop: [
          {top: '100%'},
          {top: '92%', left: '20%'},
          {top: '70%', left: '0%'},
          {bottom: '70%', left: '0%'},
          {bottom: '92%', left: '20%'},
          {bottom: '92%', right: '20%'},
          {bottom: '70%', right: '0%'},
          {top: '70%', right: '0%'},
          {top: '92%', right: '20%'},
        ]
      };

      const breakingIndex = data.players.findIndex((player) => player.uid === getAuth().currentUser.uid);

      seatsToBeSorted.push(...data.players.slice(breakingIndex));
      seatsToBeSorted.push(...data.players.slice(0, data.players.length - seatsToBeSorted.length));

      if (data.players.length < data.maxPlayers) {
        const missingPlayers = [];

        for (let i = 0; i < data.maxPlayers - data.players.length; i++) {
          missingPlayers.push({name:'', uid: '', sitOut: true, hand: []});
        }
        seatsToBeSorted.push(...missingPlayers);
      } 

      for (const index in seatsToBeSorted) {
        seatsToBeSorted[index] = {...seatsToBeSorted[index], position: {button: {responsive: positions.button.responsive[index], desktop: positions.button.desktop[index]}, responsive: positions.responsive[index], desktop: positions.desktop[index]}};
      }
      
      setTable({...data});
      setSeats(seatsToBeSorted);
  });
  }, []);

  useEffect(function() {
    if (hand.stage === 0) {
      const deckCopy = [];
      for (let suit = 0; suit < 4; suit++) {
        for (let value = 2; value <= 15; value ++) {
          value !== 11 && (
              deckCopy.push({
                  value,
                  suit: suit === 0 ? 'hearts' : suit === 1 ? 'diams' : suit === 2 ? 'spades' : 'clubs',
                  name: value < 11 ? value.toString() : value === 12 ? 'J' : value === 13 ? 'Q' : value === 14 ? 'K' : 'A'
              })
          )
        }
      }

      setDeck([...deckCopy]);
    }
  }, [hand.no]);

  useEffect(function() {
    if (table.hasOwnProperty('players') && table.hasOwnProperty('debug')) {
      if (!table.debug.active) {
        updateDoc(doc(getFirestore(), 'tables', id), {
          pending: !(table.players.map(function(player, index) {
            if (!player.sitOut) {
              return {player, index};
            }
          }).length >= 2)
        });
      }
    }
    
  }, [table.players])

  useEffect(function() {
    if (table.hasOwnProperty('pending')) {
      // Deal the cards

      let playersToBeSaved = table.players.slice();
      const activePlayers = table.players.filter(player => !player.sitOut);
      let playerIndexAtButton;
      let deckCopy = deck.slice();

      if (table.debug.active) {
        playerIndexAtButton = activePlayers.findIndex(pl => pl.currentPosition === activePlayers.length - 1);
      } else if (!table.some(pl => pl.currentPosition === activePlayers.length - 1)) {
        function getRandomActivePlayer() {
          const player = generateIndex(table.players);
          return player.sitOut ? getRandomActivePlayer() : player;
        }
        playerIndexAtButton = getRandomActivePlayer();  
      } else {
        if (playerIndexAtButton === activePlayers.length - 1) {
          playerIndexAtButton = 0;
        } else {
          playerIndexAtButton += 1;
        }
      }

      for (const player of playersToBeSaved) {
        if (table.pending) {

          player.hand = {cards: [], strength: null, topCard: null};
          player.currentPosition = null;

        } else {
          console.log(playerIndexAtButton);
          let position = playerIndexAtButton + 1 >= activePlayers.length ? 0 : playerIndexAtButton + 1;
          for (let i = 0; i < activePlayers.length - 1; i++) {
            console.log(position);
            activePlayers[position].currentPosition = i;
            position = position + 1 >= activePlayers.length ? 0 : position + 1;
          }

          console.log(activePlayers);

          if (!player.sitOut && player.hand.cards.length === 0) {
            draw(player.hand.cards, 2);
            deckCopy = deckCopy.filter((element) => !player.hand.cards.includes(element));
          }
        }
      }

      setDeck(deckCopy);

      updateDoc(doc(getFirestore(), 'tables', id), {
        players: playersToBeSaved
      });

    }
  }, [table.pending]);

  return (

    <div className='d-flex align-items-center justify-content-center'>

      {seats.length ? (
        <>

          <div className={`d-flex flex-column align-items-center justify-content-center position-relative rounded-circle ${styles.table}`} style={{width: `${dw < 1025 ? 97 : 100}%`, background: `repeating-radial-gradient(rgb(220, 53, 69), black ${dw / 1.7}px)`}}>

          {seats.map((player, index) => <Player isDebug={table.debug.active} hand={player.hand} position={player.position} uid={player.uid} stack={4000} name={player.name} key={index}/>)}

          {table.debug.placingButton ? seats.map(function(player, index) {
            if (!player.sitOut) {
             return <Dealer table={table} clear={function() {
              updateDoc(doc(getFirestore(), 'tables', id), {
                debug: {
                  active: true,
                  placingButton: false,
                  paused: false
                }
              });
             }} uid={player.uid} placeholder={true} responsive={player.position.button.responsive} desktop={player.position.button.desktop} key={index}/>
            }
          }) : (
            table.players.some(player => player.currentPosition === table.players.filter(pl => !pl.sitOut).length - 1) && <Dealer responsive={seats.find(player => player.uid === table.players.find(pl => pl.currentPosition === table.players.filter(p => !p.sitout).length - 1).uid).position.button.responsive} desktop={seats.find(player => player.uid === table.players.find(pl => pl.currentPosition === table.players.filter(p => !p.sitout).length - 1).uid).position.button.desktop}/>
          )}

          {!table.pending ? (
            <>
              <Chip/>
              <div className='mb-2 text-white fw-bold'>Pot:</div>
              <ul className={`d-flex p-0 ${cstyles.list}`}>
                <li className='me-2'><Card name='A' suit='diams' size={dw >= 700 ? 'large' : dw > 500 ? 'medium' : 'small'}/></li>
                <li className='me-2'><Card name='A' suit='spades' size={dw >= 700 ? 'large' : dw > 500 ? 'medium' : 'small'}/></li>
                <li className='me-2'><Card name='A' suit='hearts' size={dw >= 700 ? 'large' : dw > 500 ? 'medium' : 'small'}/></li>
                <li className='me-2'><Card name='A' suit='clubs' size={dw >= 700 ? 'large' : dw > 500 ? 'medium' : 'small'}/></li>
                <li><Card name='3' suit='diams' size={dw >= 700 ? 'large' : dw > 500 ? 'medium' : 'small'}/></li>
              </ul>
            </>
          ) : (
            table.debug.placingButton && (
              <div className='fw-bold text-white'>Please choose what player is going to be positioned on the button for the first hand</div>
            )
          )}
          </div>

          <footer ref={footerRef} className={`d-flex position-fixed w-100 p-2 rounded-top ${styles.menu} ${!seats.some((player) => player.uid === u.uid) && 'p-4 justify-content-center align-items-center'}`}>
            {seats.some((player) => player.uid === u.uid) ? (
              
              <>
                {table.debug.active && (
                  
                  <div className={`d-flex align-items-center ${styles.debug_menu}`}>

                    <div className='d-flex'>

                      <div className='d-flex flex-column me-3'>
                        <FontAwesomeIcon tabIndex='0' className={`mb-3 ${styles.menu_btn} ${table.players.length < 2 && styles.debug_menu_item_disabled}`} icon={(table.pending && !table.debug.placingButton) ? faPlay : faStop} onClick={function() {
                          const activePlayers = table.players.filter(player => !player.sitOut);
                          if (!table.debug.placingButton && !activePlayers.some(player => player.currentPosition === activePlayers.length - 1)) {
                            updateDoc(doc(getFirestore(), 'tables', id), {
                              debug: {
                                active: true,
                                placingButton: true,
                                paused: false
                              }
                            });
                          } else {
                            updateDoc(doc(getFirestore(), 'tables', id), {
                              debug: {
                                active: true,
                                placingButton: false,
                                paused: false
                              },
                              pending: true
                            });
                          }
                        }}/>
                        <FontAwesomeIcon tabIndex='0' onKeyUp={function(e) {
                          if (e.key === "Enter" && table.bots.length && table.pending) {
                            const pickedIndex = generateIndex(table.bots);
                            updateDoc(doc(getFirestore(), 'tables', id), {
                            players: arrayUnion({...new Bot(table.bots[pickedIndex], `Bot - ${table.bots[pickedIndex]}`, false, null, {cards: [], strength: null, topCard: null})}),
                            bots: arrayRemove(table.bots[pickedIndex])
                          });
                          }
                        }} onClick={function() {
                          if (table.bots.length && table.pending) {
                            const pickedIndex = generateIndex(table.bots);
                            updateDoc(doc(getFirestore(), 'tables', id), {
                              players: arrayUnion({...new Bot(table.bots[pickedIndex], `Bot - ${table.bots[pickedIndex]}`, false, null, {cards: [], strength: null, topCard: null})}),
                              bots: arrayRemove(table.bots[pickedIndex])
                            });
                          }
                        }}
                        className={`${styles.menu_btn} ${(table.players.length === 9 || !table.pending) && styles.debug_menu_item_disabled}`} icon={faUserPlus}/>
                      </div>
                      <div className='d-flex flex-column'>
                        <FontAwesomeIcon tabIndex='0' className={`mb-3 ${styles.menu_btn} ${(!table.players.filter(player => !player.sitOut).some(player => player.currentPosition === table.players.filter(player => !player.sitOut).length - 1) && !table.debug.placingButton) && styles.debug_menu_item_disabled}`} icon={faUndo} style={{transform: 'rotateY(180deg)'}}
                          onClick={function() {
                            const activePlayers = table.players.filter(player => !player.sitOut);
                            if (table.debug.placingButton || activePlayers.some(player => player.currentPosition === activePlayers.length - 1)) {
                              updateDoc(doc(getFirestore(), 'tables', id), {
                                pending: true,
                                debug: {
                                  active: true,
                                  placingButton: false,
                                  paused: false
                                }
                              });
                            }
                          }}
                          onKeyUp={function(e) {
                            if (e.key === 'Enter') {
                              const activePlayers = table.players.filter(player => !player.sitOut);
                              if (table.debug.placingButton || activePlayers.some(player => player.currentPosition === activePlayers.length - 1)) {
                                updateDoc(doc(getFirestore(), 'tables', id), {
                                  pending: true,
                                  debug: {
                                    active: true,
                                    placingButton: false,
                                    paused: false
                                  }
                                });
                              }
                            }
                          }}
                        />
                        <FontAwesomeIcon tabIndex='0' onKeyUp={function(e) {
                          if (e.key === "Enter" && table.players.some(player => player.uid.includes('Bot')) && table.pending)  {
                            updateDoc(doc(getFirestore(), 'tables', id), {
                              players: arrayRemove(table.players[table.players.length - 1]),
                              bots: arrayUnion(table.players[table.players.length - 1].name)
                            });
                          }
                        }} onClick={function() {
                          if (table.players.some(player => player.uid.includes('Bot')) && table.pending) {
                            updateDoc(doc(getFirestore(), 'tables', id), {
                              players: arrayRemove(table.players[table.players.length - 1]),
                              bots: arrayUnion(table.players[table.players.length - 1].name)
                            });
                          }
                        }} className={`${styles.menu_btn} ${(!table.players.some(player => player.uid.includes('Bot')) || !table.pending) && styles.debug_menu_item_disabled}`} icon={faUserMinus}/>
                      </div>

                    </div>

                  </div>
                )}


                <div className='ms-auto'>

                  <div className='d-flex flex-column align-items-center'>
                    <div className='d-flex justify-content-between mb-2 w-100'>
                      <div tabIndex='0' className={`fw-bold ${styles.menu_btn}`}>Min</div>
                      <div tabIndex='0' className={`fw-bold ${styles.menu_btn}`}>x3</div>
                      <div tabIndex='0' className={`fw-bold ${styles.menu_btn}`}>1/2 Pot</div>
                      <div tabIndex='0' className={`fw-bold ${styles.menu_btn}`}>Pot</div>
                      <div tabIndex='0' className={`fw-bold ${styles.menu_btn}`}>All in</div>
                    </div>

                    <input className={`rounded border-0 w-50 mb-2`} type='text'/>
                  </div>

                  <button type='button'>Fold</button>
                  <button type='button'>Check</button>
                  <button type='button'>Bet</button>
                  <button type='button'>Raise</button>
                </div>

              </>
            ) : (
              <div tabIndex='0' className={`fw-bold ${styles.menu_btn}`}>Join Table</div>
            )}
          </footer>
        
        </>
      ) : (

      <Loader text="Generating Table"/>

      )}

    </div>
  )
}
