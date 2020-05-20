import React from 'react';
import './App.css';
import DataDictionary from './DataDictionary/DataDictionary';
import getReduxStore from './reduxStore';
import { fetchDictionary, fetchSchema, fetchVersionInfo } from './actions';
import { Provider } from 'react-redux';

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <DataDictionary />
     </Provider>
    );
  }
}

export default App;
