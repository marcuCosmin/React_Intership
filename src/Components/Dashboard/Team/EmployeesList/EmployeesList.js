import React from 'react';
import Card from '../Card/Card';
import { getFirestore, doc, collection, deleteDoc, getDocs, query, setDoc } from "firebase/firestore";
import { getAuth, updateProfile, getIdToken, sendPasswordResetEmail } from 'firebase/auth';

export default function EmployeesList(props) {

    props.thisPage && console.log(props);

    // title, array, update, thisPage, key
  return (
    <div className='w-75'>

        <h5 className='text-center'>{props.title}</h5>

        <ul className='d-flex flex-wrap justify-content-between'>

            {props.array.filter((element) => element.id).length === 0

                ? <li className='w-100 text-center'>There are no {props.thisPage ? 'teams' : 'employees'} for this category.</li>

                : props.array.filter((element) => element.id).map((u) =>

                    <Card
                        delete={function() {setDoc(doc(collection(getFirestore(), props.category.toLowerCase().trim()), u.id), {})}}
                        {...u}
                        type={props.thisPage ? 1 : 2}
                        key={u.id}
                        displayName={u.displayName}
                        department={u.type}
                        employees={props.employees.filter(emp => emp.shift === u.shift)}
                    />
                )
            }

        </ul>

    </div>
  )
}
