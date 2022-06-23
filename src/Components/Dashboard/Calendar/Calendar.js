import React, {useState, useEffect, useContext} from 'react';
import styles from './Calendar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../../Dropdown/Dropdown';
import {user} from '../../../Contexts/Authentication';
import { getFirestore, doc, updateDoc, arrayUnion, onSnapshot, collection, setDoc, query, where } from "firebase/firestore";
import sstyles from '../../Sign/Sign.module.css';
import cloneDeep from 'lodash.clonedeep';

export default function Calendar() {

  const [date, setDate] = useState({
    weeks: getWeeks(new Date()),
    month: new Date().toLocaleString('default', {month: 'long'}),
    year: new Date().getFullYear()
  });

  const u = useContext(user);

  const [currentDay, setCurrentDay] = useState();

  const [modal, setModal] = useState({
    visible: false,
    request: {
      visible: false,
      error: false,
      value: 'Please select a request'
    },
    hours: 1
  });

  const [requests, setRequests] = useState([]);

  useEffect(function() {
    
    onSnapshot(query(collection(getFirestore(), 'requests')), function(querySnapshot) {
      const shallowRequests = cloneDeep(requests);
      querySnapshot.forEach(function(doc) {
        if (doc.data()) {
          if (doc.data().requesterId === u.uid) {
            shallowRequests.push(doc.data())
          }
        }
      });
      setRequests(shallowRequests);
    });
  }, []);

  useEffect(function() {
    if (modal.visible) {
    window.addEventListener('keyup', function(e) {
      if (e.key === 'Escape') {
        setModal((modal) => ({...modal, visible: false}));

        if (modal.request.value !== 'Please select a request') {
          setDoc(doc(collection(getFirestore(), 'requests'), u.uid), {
            title: modal.request.value,
            requester: u.displayName,
            date: `${new Date().toLocaleString('default', {month: 'long'})}/${new Date().getDate()}/${new Date().getFullYear()}` 
          });
        }
      }
    });
    }
  }, [modal.visible]);

  function getWeeks(date) {
    
    const weeks = [];
    let stringifiedWeeks = ''
    const numberOfDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= numberOfDays; i++) {
      stringifiedWeeks += (new Date(`${[date.getMonth() + 1, i, date.getFullYear()].join(' ')}`).getDay() === 0 ? '7 ': new Date(`${[date.getMonth() + 1, i, date.getFullYear()].join(' ')}`).getDay());
    }

    stringifiedWeeks = stringifiedWeeks.split(' ');
    let currentDay = 1;
    for (const index in stringifiedWeeks) {

      weeks.push([]);

      for (let i = 1; i <= 7; i++) {

        if (stringifiedWeeks[index].includes(i)) {
          weeks[index].push(currentDay);
          currentDay++;
        } else {
          weeks[index].push('');
        }
      }
    }

    return weeks;
  }

  return (
    <>
      {modal.visible && (
        <div className={`d-flex justify-content-center align-items-center position-fixed w-100 h-100 ${styles.modal_container}`}>
          <div className={`rounded shadow bg-white ${styles.modal}`}>

            <div className={`d-flex flex-column text-center rounded-top text-white ${styles.modal_header}`}>
              <div className={`pe-3 pt-2 ms-auto ${styles.modal_close}`} onClick={function() {
                setModal({...modal, visible: false}); 
                if (modal.request.value !== 'Please select a request') {
                  setDoc(doc(collection(getFirestore(), 'requests'), (Math.random() * 999999999999999999999).toString()), {
                    title: modal.request.value,
                    requester: u.displayName,
                    date: `${new Date().toLocaleString('default', {month: 'long'})}/${new Date().getDate()}/${new Date().getFullYear()}`,
                    day: currentDay,
                    hours: modal.hours,
                    requesterId: u.uid,
                    status: false,
                    reason: ''
                  });
                }}}
              ><FontAwesomeIcon icon={faTimes}></FontAwesomeIcon></div>
              <div className='fw-bold'>{`${modal.title} of ${date.month} ${date.year}`}</div>
            </div>

            <form className='p-3'>
              <Dropdown visible={modal.request.visible} setValue={function(val) {
                setModal({...modal, request: {...modal.request, value: val, error: false}, });
              }} error={modal.request.error} setVisibility={function() {setModal({...modal, request: {...modal.request, visible: !modal.request.visible}})}} items={['Work from home', 'Day off', 'Overtime', 'Medical leave']} value={modal.request.value}/>
              <input type='number' placeholder='Number of hours' className={`text-center p-2 rounded mt-4 ${sstyles.inputs}`} value={modal.hours} onChange={function(e) {setModal({...modal, hours: e.target.value > 8 ? 8 : e.target.value < 1 ? 1 : e.target.value })}}/>
            </form>


            <div>

            </div>

          </div>
        </div>
      )}

      <table className={`w-50 m-auto ${styles.calendar}`}>
        <thead className={`text-white rounded-top ${styles.calendar_header}`}>
          <tr className='p-2'>
            <td>Monday</td>
            <td>Tuesday</td>
            <td>Wednesday</td>
            <td>Thursday</td>
            <td>Friday</td>
            <td>Saturday</td>
            <td>Sunday</td>
          </tr>
        </thead>

        <tbody className={`${styles.calendar_body}`}>
          {date.weeks.map((element, index) => 
          <tr key={index}>{element.map((e, i) => 
            <td tabIndex={e !== '' ? '0' : '-1'} onClick={function() {if (e !== '') {
              setModal({...modal, visible: true, title: `${e + (e === 1 ? 'st' : e === 2 ? 'nd' : e === 3 ? 'rd' : 'th')}`});
              setCurrentDay(e);
            }
            }} className={[e === '' ? styles.disabled_td : null, e === new Date().getDate() ? styles.calendar_current_day : null].join(' ')} key={element.findIndex(x => x === e) + i.toString()}>
              <div>
                {(requests.find(el => el.day === e) !== undefined) && 
                <>
                  <div className='text-center'>{requests.find(el => el.day === e).title}</div>
                  <div className='text-center'>{requests.find(el => el.day === e).hours.toString() + ' hours'}</div>
                </>
                }
              </div>
              {e}
            </td>)}
          </tr>)}
        </tbody>

        <tfoot>
        </tfoot>
      </table>

    </>
  )
}
