import React from 'react';
import ReactDOM from 'react-dom';

import App from './component/App';

require('./app.css');

var obj = document.createElement('div');
document.body.appendChild(obj);
ReactDOM.render(<App />, obj);
