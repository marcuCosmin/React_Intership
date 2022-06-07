import { initializeApp } from 'firebase/app';

import 'bootstrap/dist/css/bootstrap.css';
import styles from './App.module.css';

import Header from './Components/Header/Header';
import Welcome from './Components/Welcome/Welcome';
import Lobby from './Components/Lobby/Lobby';
import Table from './Components/Table/Table';

import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {useContext} from 'react';

import { deviceWidth } from './Contexts/DeviceWidth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

initializeApp({
  apiKey: 'AIzaSyAVQ63p2lGnzvIa-Ep4R3r8tGkylAZHdeI',
  authDomain: 'poker-b3ddd.firebaseapp.com',
  projectId: 'poker-b3ddd',
  storageBucket: 'poker-b3ddd.appspot.com',
  messagingSenderId: '928225309531',
  appId: '1:928225309531:web:5cd1b1ad595de521eb207e'
});

function App() {

  const dw = useContext(deviceWidth);
  
  return (
      <>
        <div>
          <Router>
            <Header/>
            <Routes>
              <Route exact path='/' element={<Welcome/>}/>
              <Route exact path='/lobby' element={<Lobby/>}/>
              <Route path='/tables/:id' element={<Table/>}/>
            </Routes>
          </Router>
        </div>

        {dw < 320 && (

        
        <div className={`d-flex flex-column justify-content-center align-items-center position-fixed bg-white w-100 h-100 ${styles.unsupported_device_container}`}>

          <div className={`d-flex p-1 flex-column align-items-center position-relative ${styles.unsupported_device}`}>
            <div className={`my-1 ${styles.unsupported_device_header}`}></div>
            <div className={`h-100 w-100 ${styles.unsupported_device_screen}`}></div>
            <div className={`rounded-circle my-1 ${styles.unsupported_device_footer}`}></div>
            <div className='position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center'>
              <div className='w-50'>
                <div className={`d-flex rounded-circle justify-content-center align-items-center text-center text-white ${styles.unsupported_device_forbidden}`}>{dw}</div>
                <div className='d-flex justify-content-between'>
                  <div className={`text-white ${styles.unsupported_device_arrows}`}><FontAwesomeIcon icon={faArrowLeft}/></div>
                  <div className={`text-white ${styles.unsupported_device_arrows}`}><FontAwesomeIcon icon={faArrowRight}/></div>
                </div>
              </div>
            </div>
          </div>

          <div className='text-center fw-bold mt-2'>We are not supporting devices with a width smaller than 320px, please use a larger device</div>  
        </div>

        )}
      </>
  );
}

export default App;
