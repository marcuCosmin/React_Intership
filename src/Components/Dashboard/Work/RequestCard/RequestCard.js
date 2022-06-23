import React, {useState} from 'react';
import sstyles from '../../../Sign/Sign.module.css';

export default function RequestCard(props) {

  const [status, setStatus] = useState({declined: false, reason: {visible: false, value: ''}});

  return (
    <li className={`p-2 m-3 shadow bg-white rounded`}>
        <h5>{props.title}</h5>
        <div>Number of hours: {props.hours}</div>
        <div>Requested by {props.requester}</div>
        <div>Requested at {props.date}</div>
        <div className='d-flex justify-content-between mt-3'>
            <button className={`p-2 rounded ${sstyles.inputs}`} type='button'>Accept</button>
            <button className={`p-2 rounded ${sstyles.inputs}`} onClick={function() {setStatus({...status, reason: {...status.reason, visible: !status.reason.visible}})}} type='button'>{status.reason.visible ? 'Cancel' : 'Decline'}</button>
        </div>
        {status.reason.visible && <textarea rows={5} className={`m-auto mt-4 p-2 rounded ${sstyles.inputs}`} placeholder='Why this request was rejected?' value={status.reason.value} onChange={function(e) {setStatus({...status, reason: {...status.reason, value: e.target.value}})}}/>}
    </li>
  )
}
