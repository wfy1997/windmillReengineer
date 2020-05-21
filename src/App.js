import React from 'react';
import './App.css';
import { Provider } from 'react-redux';
import ReduxDataDictionary from './DataDictionary';
import reducers from './reducers'
import { createStore } from 'redux'
import dict from './dict';

const version = {"commit":"913161064b02bcef024d072873e77c8c79cc1a68","dictionary":{"commit":"520a25999fd183f6c5b7ddef2980f3e839517da5","version":"0.2.1-9-g520a259"},"version":"4.0.0-44-g9131610"};

class App extends React.Component {
  componentDidMount() {

    // Just need to setup state here...
    // state.ddgraph
    // state.submission

  }
  render() {
    const store = createStore(reducers);

    Promise.all(
      [
        store.dispatch({
          type: 'RECEIVE_DICTIONARY',
          data: dict
        }),
        store.dispatch({
          type: 'RECEIVE_VERSION_INFO',
          data: version
        })
      ],
    ).then(() => {
      const latestState = Object.assign({}, store);
      //console.log(latestState)
      //this.setState(latestState);
    });

    return (
      <Provider store={store}>
        <ReduxDataDictionary />
      </Provider>
    );
  }
}

export default App;
