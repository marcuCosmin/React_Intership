import React, {useState, useEffect, useRef} from 'react';
import styles from './Team.module.css';
import sstyles from '../../Sign/Sign.module.css';
import cstyles from '../../../Common.module.css';
import { getFirestore, doc, updateDoc, onSnapshot, collection, setDoc, query } from "firebase/firestore";
import Loader from '../../Loader/Loader';
import Dropdown from '../../Dropdown/Dropdown';
import cloneDeep from 'lodash.clonedeep';
import Card from './Card/Card';
import EmployeesList from './EmployeesList/EmployeesList';
import Toggle from '../../Toggle/Toggle';

function getDays(year, month) {
  const toBeReturned = [];

  for (let i = 1; i <= new Date(year, month, 0).getDate(); i++) {
    toBeReturned.push(i)
  }

  return toBeReturned;
}

const createTeamInitial = {
  name: {
    value: '',
    error: {
      value: '',
      visible: false
    }
  },
  speciality: {
    value: 'Speciality',
    error: false,
    visible: false
  },
  addEmployee: {
    employees: [],
    value: '',
    visible: false,
    id: ''
  },
  addManager: {
    value: '',
    visible: false,
    id: ''
  },
  shift: true
};

const registerInitial = {
  age: {
    numberOfDays: new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate(),
    day: 1,
    month: 1,
    year: new Date().getFullYear() - 18,
    days: getDays(new Date().getFullYear(), new Date().getMonth() + 1),
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  name: {
    last: {
      value: '',
      error: {
        visible: false,
        value: ''
      }
    },
    first: {
      value: '',
      error: {
        visible: false,
        value: ''
      }
    }
  },
  email: {
    value: '',
    error: {
      visible: false,
      value: ''
    }
  },
  title: {
    value: 'Job title',
    error: false,
    visible: false
  },
  type: {
    value: 'Manager type',
    error: false,
    visible: false
  },
  supervisor: {
    value: '',
    visible: false
  },
  shift: true,
  loading: false
};

export default function Team() {

  const [thisPage, setThisPage] = useState(false);

  const years = [];
  
  for (let i = new Date().getFullYear() - 18; i >= new Date().getFullYear() - 66; i--) {
    years.push(i);
  }
  
  const [userIds, setUserIds] = useState([]);
  
  function generateUid() {
    const genratedId = Math.random() * 999999999999999999999;
    return userIds.includes(genratedId) ? generateUid() : genratedId;
  }
  
  const addManagerRef = useRef(null);
  const addMemberRef = useRef(null);
  const addSupervisorRef = useRef(null);
  
  const [createTeam, setCreateTeam] = useState(createTeamInitial);

  const [employees, setEmployees] = useState({
    loading: false,
    values: {
      humanresources: [],
      projectmanagers: [],
      qualityassurance: [],
      scriptwriters: [],
      managers: [],
      teamleaders: []
    }
    });
    
  const [teams, setTeams] = useState({
    loading: false,
    values: {
      humanresourcesteams: [],
      projectmanagersteams: [],
      qualityassuranceteams: [],
      scriptwritersteams: []
    }
  });
  
  const [register, setRegister] = useState(registerInitial);

  useEffect(function() {
    setCreateTeam(createTeamInitial);
    setRegister(registerInitial);
  }, [thisPage]);
  
  useEffect(function() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    let currentMonth = register.age.month;
    const days = [...getDays(register.age.year, months.findIndex(month => month === currentMonth) + 1)];
    
    if (register.age.year === years[years.length - 1] || register.age.year === years[0]) {
      if (register.age.year === years[years.length - 1]) {
        months.splice(0, months.findIndex(month => month === new Date().toLocaleString('default', {month: 'long'})));
      } else {
        months.splice(months.findIndex(month => month === new Date().toLocaleString('default', {month: 'long'})) + 1);
      }

      currentMonth = months.includes(currentMonth) ? currentMonth : months[0];

      if (currentMonth === months[0] || currentMonth === months[months.length - 1]) {
        if (currentMonth === months[0] && years[years.length - 1] === register.age.year) {
          days.splice(0, new Date().getDate());
        } else if (currentMonth === months[months.length - 1] && years[0] === register.age.year) {
          days.splice(new Date().getDate());
        }
      }
    }

    setRegister({...register, age: {...register.age, days: days, months: months, month: currentMonth}});
  }, [register.age.year, register.age.month])

  useEffect(function() {
    setTeams({...teams, loading: true});

    const shallowTeams = cloneDeep(teams.values);

    for (const prop in shallowTeams) {
      onSnapshot(query(collection(getFirestore(), prop)), function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          if (!shallowTeams[prop].some(el => el.id === doc.data().id)) {
            shallowTeams[prop].push(doc.data());
          }
        });
      });
    }

    setTeams({values: shallowTeams, loading: false});

    setEmployees({...employees, loading: true});

    const shallowEmployees = cloneDeep(employees.values);

    for (const prop in shallowEmployees) {
      onSnapshot(query(collection(getFirestore(), prop)), function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          if (!shallowEmployees[prop].some(el => el.id === doc.data().id)) {
            shallowEmployees[prop].push(doc.data());
          }
        });
      });
    }

    setEmployees({values: shallowEmployees, loading: false});

    onSnapshot(query(collection(getFirestore(), 'ids')), function(querySnapshot) {
      const shallowIds = cloneDeep(userIds);
      querySnapshot.forEach(function(doc) {
        shallowIds.push(doc._key.path.segments[doc._key.path.segments.length - 1]);
      });
      setUserIds(shallowIds);
    });
  }, []);

  return (

    <>
      <Toggle labels={["Teams", "Employees"]} value={thisPage} updateValue={function() {setThisPage(!thisPage)}}/>

      <div>

        {teams.loading || employees.loading ? (
          <Loader text='Loading teams info' absolute={true} size='250%'/>
        ) : (
          <div className='d-flex justify-content-end p-5'>
              <div className='d-flex flex-column align-items-end w-100 me-4'>

                  {Object.keys(thisPage ? teams.values : employees.values).map(function(key) {
                    const titles = [
                      'Human resources',
                      'Project managers',
                      'Quality assurance',
                      'Scriptwriters',
                      'Managers',
                      'Team leaders'
                    ];

                    return <EmployeesList update={function(id) {
                      thisPage ? 
                        setTeams({...teams, values: {...teams.values, [key]: teams.values[key].filter(el => el.id !== id)}})
                      : 
                        setEmployees({...employees, values: {...employees.values, [key]: employees.values[key].filter(el => el.id !== id)}})
                      }}
                      category={key}
                      key={key}
                      title={titles[titles.findIndex(title => key.includes(title.toLowerCase().replaceAll(' ', '')))]}
                      thisPage={thisPage}
                      array={thisPage ? teams.values[key] : employees.values[key]}
                      employees={employees.values[titles[titles.findIndex(title => key.includes(title.toLowerCase().replaceAll(' ', '')))].toLowerCase().replaceAll(' ', '')]}
                      />
                    })
                  }
                
              </div>

              {thisPage ? (

                <form className={`p-3 bg-white shadow rounded me-3 d-flex flex-column ${styles.form}`} style={{userSelect: 'none'}} onSubmit={function(e) {
                  e.preventDefault();

                  let failed = false;

                  const shallowCreateTeam = cloneDeep(createTeam);

                  if (shallowCreateTeam.name.value.length < 4) {
                    if (shallowCreateTeam.name.value.length > 0) {
                      shallowCreateTeam.name.error.value = 'The password can not be shorter than 3 characters';
                    }

                    shallowCreateTeam.name.error.visible = true;
                    failed = true;
                  }

                  if (shallowCreateTeam.speciality.value === 'Speciality') {
                    shallowCreateTeam.speciality.error = true;
                    failed = true;
                  }

                  if (!failed) {
                    const generatedId = generateUid();
                    setDoc(doc(collection(getFirestore(), shallowCreateTeam.speciality.value.toLowerCase().replace(' ', '') + 'teams'), generatedId.toString()), {
                      displayName: shallowCreateTeam.name.value,
                      created: `${new Date().toLocaleString('default', {month: 'long'})}/${new Date().getDate()}/${new Date().getFullYear()}`,
                      id: generatedId.toString(),
                      shift: `${shallowCreateTeam.shift ? 'Morning' : 'Night'} Shift`,
                      members: createTeam.addEmployee.employees.map(emp => emp.id),
                      speciality: shallowCreateTeam.speciality.value,
                      manager: shallowCreateTeam.addManager.id
                    }).then(setDoc(doc(collection(getFirestore(), `ids`), generatedId.toString()), {value: generatedId.toString()})).then(function() {
                      for (const member of createTeam.addEmployee.employees) {
                        updateDoc(doc(collection(getFirestore(), shallowCreateTeam.speciality.value.toLowerCase()), member.id), {
                          team: shallowCreateTeam.name.value,
                          manager: createTeam.addManager.value
                        })
                      }
                    }).then(() => setCreateTeam(createTeamInitial));
                  }

                }}>
                  <h4 className='text-center mb-3'>Create a team</h4>

                  <div className='d-flex flex-column h-100'>
                    <input maxLength='15' className={`p-2 w-100 me-3 rounded ${sstyles.inputs} ${createTeam.name.error.visible && sstyles.inputs_errors}`} type='text' placeholder='Team name' value={createTeam.name.value} onChange={function(e) {/^[a-zA-Z]+$/.test(e.target.value) && setCreateTeam({...createTeam, name: {...createTeam.name, value: e.target.value}})}}/>

                    <Dropdown
                    error={createTeam.speciality.error}
                    visible={createTeam.speciality.visible}
                    setVisibility={function() {setCreateTeam({...createTeam, speciality: {...createTeam.speciality, visible: !createTeam.speciality.visible, error: false}})}}
                    items={['Scriptwriters', 'Project Managers', 'Quality Assurance', 'Human Resources']}
                    value={createTeam.speciality.value}
                    setValue={function(val) {setCreateTeam({...createTeam, addManager: {...createTeamInitial.addManager}, speciality: {...createTeam.speciality, value: val, error: false}});}}/>

                    <div className='position-relative'>
                      <input
                      onBlur={function(e) {if (!addManagerRef.current.contains(e.relatedTarget)) {setCreateTeam({...createTeam, addManager: {...createTeam.addManager, visible: false}})}}}
                      onFocus={function() {setCreateTeam({...createTeam, addManager: {...createTeam.addManager, visible: true}})}}
                      disabled={employees.values.teamleaders.filter(em => em.shift === (createTeam.shift ? 'Morning Shift' : 'Night Shift') && em.type === (createTeam.speciality.value === 'Quality Assurance' ? createTeam.speciality.value : createTeam.speciality.value.substring(0, createTeam.speciality.value.length - 1))).length === 0} maxLength='15'
                      className={`p-2 w-100 mt-3 me-3 rounded ${sstyles.inputs} ${employees.values.teamleaders.filter(em => em.shift === (createTeam.shift ? 'Morning Shift' : 'Night Shift') && em.type === (createTeam.speciality.value === 'Quality Assurance' ? createTeam.speciality.value : createTeam.speciality.value.substring(0, createTeam.speciality.value.length - 1))).length === 0 && cstyles.disabled_input} ${createTeam.addManager.visible && styles.searchbox_active}`}
                      type='text'
                      placeholder={employees.values.teamleaders.filter(em => em.shift === (createTeam.shift ? 'Morning Shift' : 'Night Shift') && em.type === (createTeam.speciality.value === 'Quality Assurance' ? createTeam.speciality.value : createTeam.speciality.value.substring(0, createTeam.speciality.value.length - 1))).length === 0 ? 'No managers available' : 'Add a manager to the team'}
                      value={createTeam.addManager.value}
                      onChange={function(e) {setCreateTeam({...createTeam, addManager: {...createTeam.addManager, value: e.target.value}})}}/>
                      {(createTeam.addManager.visible && <ul ref={addManagerRef} className={`position-absolute bg-white shadow rounded-bottom p-2 m-0 ${styles.search_dropdown}`}>

                      {employees.values.teamleaders.filter(em => em.shift === (createTeam.shift ? 'Morning Shift' : 'Night Shift') && em.type === (createTeam.speciality.value === 'Quality Assurance' ? createTeam.speciality.value : createTeam.speciality.value.substring(0, createTeam.speciality.value.length - 1))).some(em => em.displayName.toLowerCase().includes(createTeam.addManager.value.toLowerCase())) ? (
                        
                        employees.values.teamleaders.filter(em => em.shift === (createTeam.shift ? 'Morning Shift' : 'Night Shift') && em.type === (createTeam.speciality.value === 'Quality Assurance' ? createTeam.speciality.value : createTeam.speciality.value.substring(0, createTeam.speciality.value.length - 1))).map(function(emp, index) {

                          return emp.displayName.toLowerCase().includes(createTeam.addManager.value.toLowerCase()) && <li onBlur={function(e) {if (!addManagerRef.current.contains(e.relatedTarget)) {setCreateTeam({...createTeam, addManager: {...createTeam.addManager, visible: false, id: emp.id}})}}} tabIndex='0' onClick={function() {setCreateTeam({...createTeam, addManager: {...createTeam.addManager, value: emp.displayName}})}} key={index}>{emp.displayName}</li>

                        })

                      ) : <li>No users match the input</li>}

                      </ul>)}
                    </div>

                    {createTeam.speciality.value !== 'Speciality' && 

                    <div className='position-relative'>
                      {createTeam.addEmployee.employees.length > 0 && (
                        <ul className='p-0 mb-0 mt-3 d-flex'>
                          {createTeam.addEmployee.employees.map((e, index) => <li><Card delete={function() {setCreateTeam({...createTeam, addEmployee: {...createTeam.addEmployee, employees: [...createTeam.addEmployee.employees.filter(em => em.id !== e.id)]}})}} type={3} key={e.id} displayName={e.name}/></li>)}
                        </ul>
                      )}
                      
                      <input
                      onBlur={function(e) {
                        if (!addMemberRef.current.contains(e.relatedTarget)) {
                          setCreateTeam({
                            ...createTeam,
                            addEmployee: {value: '', id: '',
                              visible: false,
                              employees: (createTeam.addEmployee.value.length && createTeam.addEmployee.id.length) ? [...createTeam.addEmployee.employees, {name: createTeam.addEmployee.value, id: createTeam.addEmployee.id}] : [...createTeam.addEmployee.employees]
                            }
                          });
                        }}}
                      onFocus={function() {setCreateTeam({...createTeam, addEmployee: {...createTeam.addEmployee, visible: true}})}}
                      disabled={employees.values[createTeam.speciality.value.toLowerCase().replace(' ', '')].filter(e => e.shift === (createTeam.shift ? 'Morning Shift' : 'Night Shift') && !createTeam.addEmployee.employees.some(employee => employee.id === e.id)).length === 0}
                      maxLength='15'
                      className={`p-2 w-100 mt-3 me-3 rounded ${sstyles.inputs} ${employees.values[createTeam.speciality.value.toLowerCase().replace(' ', '')].filter(e => e.shift === (createTeam.shift ? 'Morning Shift' : 'Night Shift') && !createTeam.addEmployee.employees.some(employee => employee.id === e.id)).length === 0 && cstyles.disabled_input} ${createTeam.addEmployee.visible && styles.searchbox_active}`} type='text'
                      placeholder={employees.values[createTeam.speciality.value.toLowerCase().replace(' ', '')].filter(e => e.shift === (createTeam.shift ? 'Morning Shift' : 'Night Shift') && !createTeam.addEmployee.employees.some(employee => employee.id === e.id)).length === 0 ? 'No employees available' : 'Add a member to the team'}
                      value={createTeam.addEmployee.value}
                      onChange={function(e) {setCreateTeam({...createTeam, addEmployee: {...createTeam.addEmployee, value: e.target.value}})}}/>
                      
                      {(createTeam.addEmployee.visible && <ul ref={addMemberRef} className={`position-absolute bg-white shadow rounded-bottom p-2 m-0 ${styles.search_dropdown}`}>

                      {employees.values[createTeam.speciality.value.toLowerCase().replace(' ', '')].some(em => em.shift === (createTeam.shift ? 'Morning Shift' : 'Night Shift') && !createTeam.addEmployee.employees.some(employee => employee.id === em.id) && em.displayName.toLowerCase().includes(createTeam.addEmployee.value.toLowerCase())) ? (
                        
                        employees.values[createTeam.speciality.value.toLowerCase().replace(' ', '')].filter(e => e.shift === (createTeam.shift ? 'Morning Shift' : 'Night Shift')).map(function(emp, index) {

                          return emp.displayName.toLowerCase().includes(createTeam.addEmployee.value.toLowerCase()) && <li onBlur={function(e) {if (!addMemberRef.current.contains(e.relatedTarget)) {setCreateTeam({...createTeam, addEmployee: {value: '', id: '', visible: false, employees: (createTeam.addEmployee.value.length && createTeam.addEmployee.id.length) ? [...createTeam.addEmployee.employees, {name: createTeam.addEmployee.value, id: createTeam.addEmployee.id}] : [...createTeam.addEmployee.employees]}})}}} tabIndex='0' onClick={function() {setCreateTeam({...createTeam, addEmployee: {...createTeam.addEmployee, value: emp.displayName, id: emp.id}})}} key={index}>{emp.displayName}</li>

                        }) 

                      ) : <li className='fw-normal'>No users found</li>}

                      </ul>)}

                    </div>}

                    <Toggle labels={["Morning", "Night"]} value={createTeam.shift} updateValue={function() {setCreateTeam({...createTeam, addManager: {...createTeamInitial.addManager}, addEmployee: {...createTeamInitial.addEmployee}, shift: !createTeam.shift})}}/>

                    <button className={`p-2 w-100 rounded mt-3 mt-auto ${sstyles.inputs}`}>Submit</button>
                  </div>
                </form>
              ) : (

                <form className={`p-3 bg-white shadow rounded position-relative ${styles.form}`} onSubmit={function(e) {
                  e.preventDefault();
                  const shallowRegister = cloneDeep(register);
                  let failed = false;

                  if (register.name.first.value.length < 3) {
                    failed = true;
                    shallowRegister.name.first.error.visible = true;
                    if (register.name.first.value.length > 0) {
                      shallowRegister.name.first.error.value = 'The first name can not be shorter than 3 characters';
                    }
                  }

                  if (register.name.last.value.length < 3) {
                    failed = true;
                    shallowRegister.name.last.error.visible = true;
                    if (register.name.last.value.length > 0) {
                      shallowRegister.name.last.error.value = 'The last name can not be shorter than 3 characters';
                    }
                  }

                  if (register.title.value === 'Job title') {
                    failed = true;
                    shallowRegister.title.error = true;
                  }

                  if (register.title.value === 'Team Leader' && register.type.value === "Manager type") {
                    failed = true;
                    shallowRegister.type.error = true;
                  }

                  setRegister(shallowRegister);

                  if (!failed) {
                    const generatedId = generateUid();

                    setRegister({...register, loading: true});
                    
                    const dataToBePosted = {
                      displayName: `${register.name.first.value} ${register.name.last.value}`,
                      email: `${register.name.first.value}.${register.name.last.value}@yahoo.com`,
                      created: `${new Date().toLocaleString('default', {month: 'long'})}/${new Date().getDate()}/${new Date().getFullYear()}`,
                      title: register.title.value,
                      dateOfBirth: `${register.age.month}/${register.age.day}/${register.age.year}`,
                      requestsIDs: [],
                      id: generatedId.toString(),
                      shift: `${register.shift ? 'Morning' : 'Night'} Shift`
                    }

                    if (register.title.value === 'Team Leader') {
                      dataToBePosted.type = register.type.value;
                    }

                    setDoc(doc(collection(getFirestore(), `${register.title.value.toLowerCase().replace(' ', '')}${register.title.value === 'Quality Assurance' ? '' : 's'}`), generatedId.toString()), dataToBePosted).then(setDoc(doc(collection(getFirestore(), `ids`), generatedId.toString()), {value: generatedId.toString()})).then(function() {
                      setRegister(registerInitial);
                    });
                  }
                }}>
                  {register.loading && <Loader text='Creating user' absolute={true} size='250%' background={true}/>}
                  <h4 className='text-center mb-3'>Register an employee</h4>

                  <div className='d-flex'>
                    <div className='me-3 w-100'>
                      <input maxLength='15' className={`p-2 w-100 rounded ${sstyles.inputs} ${register.name.first.error.visible && sstyles.inputs_errors}`} type='text' placeholder='First name' value={register.name.first.value} onChange={function(e) {(e.nativeEvent.inputType === 'deleteContentBackward' || /^[a-zA-Z]+$/.test(e.target.value)) && setRegister({...register, name: {...register.name, first: {value: e.target.value.length > 0 ? e.target.value[0].toUpperCase() + e.target.value.substring(1).toLowerCase() : e.target.value, error: {visible: false, value: ''}}}})}}/>
                      <div className={`mt-1 ${sstyles.errors} ${register.name.first.error.value.length ? 'visible' : 'invisible'}`} style={{fontSize: `${register.name.first.error.value.length ? 85 : 0}%`}}>{register.name.first.error.value}</div>
                    </div>

                    <div className='w-100'>
                      <input maxLength='15' className={`p-2 w-100 rounded ${sstyles.inputs} ${register.name.last.error.visible && sstyles.inputs_errors}`} type='text' placeholder='Last name' value={register.name.last.value} onChange={function(e) {(e.nativeEvent.inputType === 'deleteContentBackward' ||/^[a-zA-Z]+$/.test(e.target.value)) && setRegister({...register, name: {...register.name, last: {value: e.target.value.length > 0 ? e.target.value[0].toUpperCase() + e.target.value.substring(1).toLowerCase() : e.target.value, error: {visible: false, value: ''}}}})}}/>
                      <div className={`mt-1 ${sstyles.errors} ${register.name.last.error.value.length ? 'visible' : 'invisible'}`} style={{fontSize: `${register.name.last.error.value.length ? 85 : 0}%`}}>{register.name.last.error.value}</div>
                    </div>

                  </div>

                  <div className={`p-2 rounded mt-3 ${[sstyles.inputs, cstyles.disabled_input].join(' ')}`}>
                    {(register.name.first.value.length && register.name.last.value.length) ? `${register.name.first.value}.${register.name.last.value}@yahoo.com` : 'Email'}
                  </div>

                  <div className={`d-flex justify-content-between w-100 mt-3`}>
                    <ul className={`m-0 p-0 rounded ${styles.age_select}`}>
                      {years.map(year => <li className={`p-2 ${register.age.year === year && styles.age_select_current}`} tabIndex='0' key={year} data-year={year} onKeyUp={function(e) {e.key === 'Enter' && setRegister({...register, age: {...register.age, year: parseInt(e.target.dataset.year)}})}} onClick={function(e) {setRegister({...register, age: {...register.age, year: parseInt(e.target.dataset.year)}})}}>{year}</li>)}
                    </ul>

                    <ul className={`m-0 p-0 rounded  ${styles.age_select}`}>
                      {register.age.months.map((month, index) => <li className={`p-2 ${register.age.month === month && styles.age_select_current}`} key={index} tabIndex={0} data-month={month} onKeyUp={function(e) {e.key === 'Enter' && setRegister({...register, age: {...register.age, month: e.target.dataset.month}})}} onClick={function(e) {setRegister({...register, age: {...register.age, month: e.target.dataset.month}})}}>{month}</li>)}
                    </ul>

                    <ul className={`m-0 p-0 rounded ${styles.age_select}`}>
                      {register.age.days.map(day => <li className={`p-2 ${register.age.day === day && styles.age_select_current}`} tabIndex='0' key={day} data-day={day} onKeyUp={function(e) {e.key === 'Enter' && setRegister({...register, age: {...register.age, day: parseInt(e.target.dataset.day)}})}} onClick={function(e) {setRegister({...register, age: {...register.age, day: parseInt(e.target.dataset.day)}})}}>{day}</li>)}
                    </ul>
                  </div>

                  <Dropdown error={register.title.error} visible={register.title.visible} setVisibility={function() {setRegister({...register, title: {...register.title, visible: !register.title.visible, error: false}})}} items={['Scriptwriter', 'Quality Assurance', 'Project Manager', 'Team Leader', 'Manager', 'Human Resources']} value={register.title.value} setValue={function(val) {setRegister({...register, title: {...register.title, value: val, error: false}, });}}/>

                  {register.title.value === 'Team Leader' && <Dropdown error={register.type.error} visible={register.type.visible} setVisibility={function() {setRegister({...register, type: {...register.type, visible: !register.type.visible, error: false}})}} items={['Scriptwriter', 'Quality Assurance', 'Project Manager', 'Manager', 'Human Resources']} value={register.type.value} setValue={function(val) {setRegister({...register, type: {...register.type, value: val, error: false}, });}}/>}

                  <Toggle labels={["Morning", "Night"]} value={register.shift} updateValue={function() {setRegister({...register, shift: !register.shift})}}/>

                  <button className={`p-2 w-100 rounded mt-3 ${sstyles.inputs}`}>Submit</button>

                </form>
              )}


            </div>
        )}
      </div>
    </>
  )
}
