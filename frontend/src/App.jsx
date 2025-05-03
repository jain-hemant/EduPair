import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import ApplicationContainer from '##/src/Components/layout/ApplicationContainer.jsx';
import AppRoutes from '##/src/Routes/AppRoutes.jsx';
import { persistor, store } from '##/src/store/store.js';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <ApplicationContainer>
            <AppRoutes />
          </ApplicationContainer>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
