import { initializeApp } from 'firebase/app';
import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {useContext} from 'react';
import Header from './Components/Header/Header';
import { user } from './Contexts/Authentication';
import Sign from './Components/Sign/Sign';
import Dashboard from './Components/Dashboard/Dashboard';
import Calendar from './Components/Dashboard/Calendar/Calendar';
import Team from './Components/Dashboard/Team/Team';
import Work from './Components/Dashboard/Work/Work';
import Loader from './Components/Loader/Loader';
import Settings from './Components/Settings/Settings';
import { getStorage } from "firebase/storage";

const app = initializeApp({
  apiKey: "AIzaSyDQE01TMc74eoeHEmQjglYVN137SEXaqV4",
  authDomain: "alexandru-matei.firebaseapp.com",
  projectId: "alexandru-matei",
  storageBucket: "alexandru-matei.appspot.com",
  messagingSenderId: "884673360520",
  appId: "1:884673360520:web:f27a157cb6412fb64b653d",
});

getStorage(app);

function App() {

  const u = useContext(user);

  return (
      <div>
        {u.completed ? (
          <Router>
            {u.isSignedIn && (
                <>
                  <Header/>
                  <Dashboard/>
                </>
            )}
            <Routes>

              {u.isSignedIn ?
                <>
                <Route exact path='/teams' element={<Team/>}/>
                <Route exact path='/' element={<Calendar/>}/>
                <Route exact path='/work' element={<Work/>}/>
                <Route exact path='/settings/:id' element={<Settings/>}/>
                </>
              :
                <Route path='/' element={<Sign/>}/>
              }

            </Routes>
          </Router>
        ) : <Loader text='Loading' absolute={true} size='250%'/>}
      </div>
  );
}

export default App;
