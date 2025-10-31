import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import persistStore from 'redux-persist/es/persistStore';
import { PersistGate } from 'redux-persist/integration/react';

import App from './App';
import './styles/index.css';
import store from './services/store';
import { Loading } from './components';

const persistedStore = persistStore(store);

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={<Loading />} persistor={persistedStore}>
      <StrictMode>
        <App />
      </StrictMode>
    </PersistGate>
  </Provider>
);
