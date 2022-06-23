import React, {useState, useEffect} from 'react';
import styles from './Work.modules.css';
import { getFirestore, doc, updateDoc, arrayUnion, onSnapshot, collection, setDoc, query, where } from "firebase/firestore";
import RequestCard from './RequestCard/RequestCard';

export default function Work() {

  const [requests, setRequests] = useState({loading: false, values: []});

  console.log(requests);

  useEffect(function() {
    onSnapshot(query(collection(getFirestore(), 'requests')), function(querySnapshot) {
      const users = []
      querySnapshot.forEach(function(doc) {
          users.push(doc.data());
      });
      setRequests({loading: false, values: users});
    });
  }, []);

  return (
    <div className='d-flex justify-content-center me-2'>
      <ul>
        {requests.values.map(function(req,index) {if (!req.hasOwnProperty('value')) {return <RequestCard title={req.title} key={index} requester={req.requester} date={req.date} hours={req.hours}/>}})}
      </ul>
    </div>
  )
}
