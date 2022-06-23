import React, {useEffect} from 'react';
import sstyles from '../../../Sign/Sign.module.css';

export default function ProjectInput(props) {

  return (
    <div className='d-flex justify-content-between' style={props.style}>
        <input maxLength='10' placeholder='Project ID' className={`rounded ${sstyles.inputs}`} type='text' onChange={props.updateProject} value={props.project}/>
        <label>Hours:
            <input min='1' max='8' className={`p-2 text-center rounded ms-2 ${sstyles.inputs}`} placeholder='Number of hours' type='number' onChange={props.updateHours} value={props.hours}/>
        </label>
    </div>
  )
}
