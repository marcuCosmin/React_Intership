import React, {useEffect, useState, useRef} from 'react';
import styles from './Card.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash} from '@fortawesome/free-solid-svg-icons';
import userImg from '../../../../User Standard Img.jpg';
import { getFirestore, doc, updateDoc, arrayRemove, onSnapshot, collection, query, arrayUnion, getDoc, getDocs } from "firebase/firestore";
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import sstyles from '../../../Sign/Sign.module.css';
import cstyles from '../../../../Common.module.css';
import Loader from '../../../Loader/Loader';
import Toggle from '../../../Toggle/Toggle';

export default function Card(props) {

  const [isLoading, setIsLoading] = useState(false);

  const [editing, setEditing] = useState(false);

  const [manager, setManager] = useState({});

  const [members, setMembers] = useState([]);

  const addMemberRef = useRef(null);

  const [editInputs, setEditInputs] = useState({
    displayName: props.displayName,
    manager: {
      value: manager.hasOwnProperty('displayName')? manager.displayName : '',
      visible: false,
      id: ''
    },
    shift: props.shift === 'Morning',
    managers: []
  });

  const [addMember, setAddMember] = useState({
    value: '',
    visible: false,
    loading: false
  });

  useEffect(function() {
    if (props.type === 1) {
      onSnapshot(query(collection(getFirestore(), props.speciality.toLowerCase())), function(querySnapshot) {

        let shallowMembers = [];

        querySnapshot.forEach(function(doc) {
          if (props.members.includes(doc._key.path.segments[doc._key.path.segments.length - 1]) && !shallowMembers.some(m => m.id === doc._key.path.segments[doc._key.path.segments.length - 1])) {
            shallowMembers = [...shallowMembers, doc.data()];
          }
        });

        setMembers(shallowMembers);
      });

      onSnapshot(query(collection(getFirestore(), 'teamleaders')), function(querySnapshot) {

        let shallowTeamLeaders = [];

        querySnapshot.forEach(function(doc) {
          if (doc.data().id !== manager.id && doc.data().type + 's' === props.speciality) {
            shallowTeamLeaders = [...shallowTeamLeaders, doc.data()];
          }
        });

        setEditInputs({...editInputs, managers: shallowTeamLeaders})

      });

      if (props.manager) {
          onSnapshot(doc(getFirestore(), 'teamleaders', props.manager), function(doc) {
            setManager({...doc.data()});
          });
      }
    }
    
  }, []);
  // types:
  // 1 - Team
  // 2 - Employee
  // 3 - Employee create Team

   return (
    <div className={`p-3 shadow bg-white rounded mt-2 position-relative`}>
        {isLoading && <Loader absolute={true} text='Loading' background={true}/>}
        <div>
            {props.type === 1 && (
              <div className='text-center'>
                <h4>{props.name}</h4>
              </div>
            )}

            <div className='text-center'>
              {props.type === 1 ? <FontAwesomeIcon className={styles.team_logo} icon={faUsers}/> : <img className={`rounded-circle ${styles.image}`} style={{width: '50px'}} src={userImg}/>}
              {props.type !== 1 ?
                <h6 className={`text-center mt-2 ${styles.sub}`}>{props.displayName}</h6>
              : (
                <div className='d-flex justify-content-center w-100'>
                  <input disabled={!editing} type='text' className={`text-center border-0 fw-bold ${styles.sub}`} value={editInputs.displayName} onChange={(e) => setEditInputs({...editInputs, displayName: e.target.value})}/> 
                </div>
              )}
              {props.type === 2 && <h5>{props.department && props.department} {props.title}</h5>}
              {props.type === 2 && <div className='mb-2'>{props.email}</div>}
            </div>


            {props.type !== 3 && <div className={`${styles.sub}`}>{props.type === 1 ? 'Created' : 'Joined'} {props.created}</div>}

            {props.type !== 3 && <div className={`${styles.sub}`}>Manager: {manager.displayName ? manager.displayName : 'None'}</div>}
            {props.type !== 3 && 
              <div className={`${editing && 'd-flex align-items-center'} ${styles.sub}`}>{(editing && props.type === 2) ? (
                <>
                  Shift: <Toggle labels={["Morning", "Night"]} value={editInputs.shift} updateValue={function() {setEditInputs({...editInputs, shift: !editInputs.shift})}}/>
                </>
              ) : (
                <>
                  Shift: {editInputs.shift ? 'Morning' : 'Night'}
                </> 
              )}</div>
            }
            {props.type === 2 && <div className={`${styles.sub}`}>Team: {props.team ? props.team : 'None'}</div>}
            {props.type === 1 && (
              <div>
                <h5 className='text-center mt-2'>Members</h5>
                <ul className='d-flex flex-wrap justify-content-between' style={{width: '400px'}}>
                    {members.length ?
                      members.map(member => <Card delete={function() {
                        updateDoc(doc(getFirestore(), props.speciality.toLowerCase() + 'teams', props.id), {
                          members: arrayRemove(member.id)
                        }).then(() => setMembers(members.filter(m => m.id !== member.id)));
                      }} {...member} type={3} key={member.id}/>)
                  :
                    <li className='text-center w-100'>No members to show</li>
                  }
                </ul>

                {(editing && props.type === 1) &&
                  <div className='position-relative'>
                    {addMember.loading &&  <Loader absolute={true} background={true} text='Adding User'/>}
                    <input
                    onBlur={function(e) {
                      if (!addMemberRef.current.contains(e.relatedTarget)) {
                        setAddMember({...addMember, visible: false});
                      }}}
                    onFocus={function() {props.employees.filter(emp => !members.some((e) => e.id === emp.id)).length !== 0 && setAddMember({...addMember, visible: true})}}
                    disabled={addMember.loading || props.employees.filter(emp => !members.some((e) => e.id === emp.id)).length === 0}
                    maxLength='15'
                    className={`p-2 w-100 mt-3 me-3 rounded ${sstyles.inputs} ${props.employees.filter(emp => !members.some((e) => e.id === emp.id)).length === 0 && cstyles.disabled_input} ${addMember.visible && styles.searchbox_active}`} type='text'
                    placeholder={props.employees.filter(emp => !members.some((e) => e.id === emp.id)).length === 0 ? 'No employees available to add' : 'Add a member to the team'}
                    value={addMember.value}
                    onChange={function(e) {setAddMember({...addMember, value: e.target.value})}}/>
                    
                    {(addMember.visible && 
                    
                    <ul ref={addMemberRef} className={`position-absolute bg-white shadow rounded-bottom p-2 m-0 ${styles.search_dropdown}`}>

                      {props.employees.filter(emp => !members.some((e) => e.id === emp.id)).length !== 0 ? (
                        
                        props.employees.filter(emp => !members.some((e) => e.id === emp.id)).map(function(emp) {

                          return (
                            <li 
                              onBlur={function(e) {
                                if (!addMemberRef.current.contains(e.relatedTarget)) {
                                  setAddMember({...addMember, visible: false});
                                }
                              }}
                              tabIndex='0'
                              onClick={function() {
                                setAddMember({...addMember, value: emp.displayName, visible: false, loading: true});
                                updateDoc(doc(getFirestore(), props.speciality.toLowerCase() + 'teams', props.id), {
                                  members: arrayUnion(emp.id)
                                }).then(() => updateDoc(doc(getFirestore(), props.speciality.toLowerCase(), emp.id), {
                                  team: props.displayName
                                }).then(() => getDoc(doc(getFirestore(), props.speciality.toLowerCase(), emp.id)).then(doc => setMembers([...members, doc.data()]))
                                ).then(() => setAddMember({
                                  value: '',
                                  visible: false,
                                  loading: false
                                })));
                              }}
                              key={emp.id}>{emp.displayName}
                            </li>
                          )

                        }) 

                      ) : <li className='fw-normal'>No users found</li>}

                    </ul>)}

                </div>
                }
              </div>
            )}

        </div>
  
        <div className='d-flex justify-content-center mt-3'>
          {editing ? (
            <>
              <button className={`rounded me-2 ${sstyles.inputs}`} onClick={function() {
                const objectToBePosted = {
                  displayName: editInputs.displayName,
                  shift: editInputs.shift ? 'Morning' : 'Night'
                }

                if (props.type === 3) {
                  objectToBePosted.manager = editInputs.manager.id;
                }
                setIsLoading(true);
                updateDoc(doc(getFirestore(), props.type === 1 ? props.speciality.toLowerCase() + 'teams' : props.title.toLowerCase() + 's', props.id), objectToBePosted).then(function() {
                  setIsLoading(false);
                  setEditing(false);
                });
              }}>Save changes</button>
              <button className={`rounded ${sstyles.inputs}`} onClick={function() {
                setEditing(false);
                setEditInputs({...editInputs,
                  displayName: props.displayName,
                  manager: {
                    value: manager.displayName,
                    visible: false,
                    id: ''
                  },
                });
              }}>Exit editing</button>
            </>
          ) : (
            <>
              <FontAwesomeIcon className={`${props.type !== 3 && 'me-4'} ${styles.svgs}`} onClick={props.delete} icon={faTrash}/>
              {props.type !== 3 && <FontAwesomeIcon className={`${styles.svgs}`} icon={faPen} onClick={function() {setEditing(true)}}/>}
            </>
          )}
        </div>
    </div>
  )
}
