import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import ReduxDataDictionary from './DataDictionary';
import reducers from './reducers'
import $RefParser from "@apidevtools/json-schema-ref-parser";

import hardcoded_schema from './dict';

const version = {"commit":"913161064b02bcef024d072873e77c8c79cc1a68","dictionary":{"commit":"520a25999fd183f6c5b7ddef2980f3e839517da5","version":"0.2.1-9-g520a259"},"version":"4.0.0-44-g9131610"};

const findObjectWithRef = (obj, updateFn, root_key = '', level = 0) => {

  // // have found the object
  // if (obj.hasOwnProperty('$ref')) {
  //   return updateFn(obj, root_key);
  // }
  
  // iterate over the properties
  for (var propertyName in obj) {

    if ( level === 0 ) root_key = propertyName;

    if ( propertyName === '$ref' ) {
      obj['$ref'] = updateFn(obj['$ref'], root_key);
    }

    // any object that is not a simple value
    if (obj[propertyName] !== null && typeof obj[propertyName] === 'object' && propertyName !== "metaschema") {
      // recurse into the object and write back the result to the object graph
      obj[propertyName] = findObjectWithRef(obj[propertyName], updateFn, root_key, (level + 1));
    }
  }
  
  return obj;
};

// unresolveable:
// {$ref: "_terms.yaml#/file_format"}
// {$ref: "#/UUID"}

async function init() {
  const store = createStore(reducers);

  // Fetch S3 schema.jsob
  let response = await fetch('https://bms-gen3-dev.s3.amazonaws.com/datadictionary/master/schema.json');
  let schema = await response.json();

  // Remove .yaml extension from keys 
  let dict = {};  
  for (let [key, value] of Object.entries(schema)) {
    dict[key.slice(0, -5)] = value;
  }
  //console.log(dict)

  // Recursivly fix references
  dict = findObjectWithRef(dict, (refObj, rootKey)=> { // This halts for sub objects./...

    if ( refObj.includes('.yaml') ) {

      // ABS_FIX
      // "$ref": "_definitions.yaml#/ubiquitous_properties",
      // ->
      // "$ref": "#/_definitions/ubiquitous_properties",

      refObj = "#/" + refObj.replace('.yaml#', '');
      console.log("ABS FIX -- " + rootKey + ": " + refObj);

    } else {

      // REL FIX
      // "$ref": "#/state"
      // ->
      // "$ref": "#/{_definitions aka root key}/state"

      refObj = '#/' + rootKey + '/' + refObj.replace('#/', '');
      console.log("REL FIX -- " + rootKey + ": " + refObj);
    }


    return refObj;
  });

  // Append metaschema TODO
  console.log(JSON.stringify(dict, null, 2))

  let newDict = await $RefParser.dereference(dict, {
    continueOnError: false,            // Don't throw on the first error
    dereference: {
      circular: true                 // Don't allow circular $refs
    }
  });

   console.log(newDict)

  await Promise.all(
    [
      store.dispatch({
        type: 'RECEIVE_DICTIONARY',
        data: hardcoded_schema
      }),
      store.dispatch({
        type: 'RECEIVE_VERSION_INFO',
        data: version
      })
    ],
  );

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <ReduxDataDictionary />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}


init();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
