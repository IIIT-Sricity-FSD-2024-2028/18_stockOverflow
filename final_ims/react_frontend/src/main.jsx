import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/index';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { DataSyncProvider } from './context/DataSyncContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <DataSyncProvider>
          <App />
        </DataSyncProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
