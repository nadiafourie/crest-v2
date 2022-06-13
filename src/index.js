import React from 'react';
import ReactDOM from 'react-dom';
import {createRoot} from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import App from './App';
import { store } from './store';
import { saveState } from './localStorage';

// here we subscribe to the store changes
store.subscribe(() => { saveState(store.getState()); });

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
