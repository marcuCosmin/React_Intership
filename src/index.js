import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Authentication} from './Contexts/Authentication';
import {DeviceWidth} from './Contexts/DeviceWidth'

ReactDOM.render(
  <React.StrictMode>
    <Authentication>
      <DeviceWidth>
        <App />
      </DeviceWidth>
    </Authentication>
  </React.StrictMode>,
  document.getElementById('root')
);