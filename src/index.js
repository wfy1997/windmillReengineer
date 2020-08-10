import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import ReduxDataDictionary from './DataDictionary';
import reducers from './reducers'
import $RefParser from "@apidevtools/json-schema-ref-parser";
import jsonData from './schema.json';
import axios from 'axios';
import yaml from 'js-yaml';
// you can change to use bento data in here
//import icdcModel from './bento_model_file.yaml';
//import icdcModelProps from './bento_model_properties.yaml'; 
//import icdc data
import icdcModel from './icdc-model.yml';
import icdcModelProps from './icdc-model-props.yml'; 
//import ctdc data
//import icdcModel from './ctdc_model_file.yaml';
//import icdcModelProps from './ctdc_model_properties_file.yaml';
import mdfSchema from './mdf-schema.yaml';





const version = {"commit":"913161064b02bcef024d072873e77c8c79cc1a68","dictionary":{"commit":"520a25999fd183f6c5b7ddef2980f3e839517da5","version":"0.2.1-9-g520a259"},"version":"4.0.0-44-g9131610"};

const findObjectWithRef = (obj, updateFn, root_key = '', level = 0) => {
  // iterate over the properties
  for (var propertyName in obj) {

    if ( level === 0 ) root_key = propertyName;

    if ( propertyName === '$ref' ) {
      obj['$ref'] = updateFn(obj['$ref'], root_key);
    }

    // any object that is not a simple value
    if (obj[propertyName] !== null && typeof obj[propertyName] === 'object') {
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

  let url = 'https://wfy1997.s3.amazonaws.com/schema.json';

  if ( window.location.hash ) url = window.location.hash.slice(1);

  const icdcM = await axios(icdcModel);
  const icdcMData = yaml.safeLoad(icdcM.data);
  const icdcMP = await axios(icdcModelProps);
  const icdcMPData = yaml.safeLoad(icdcMP.data);
 



  //console.log(icdcMData.Relationships);
  console.log(icdcMData.Nodes);
  console.log(icdcMPData);
  
  //translate the json file here

  const dataList={};
  for (let [key, value] of Object.entries(icdcMData.Relationships)) {
     // console.log(value);
      
  }

  
  



  
  


//using the following code the convert MDF to Gen3 format
  for (let [key, value] of Object.entries(icdcMData.Nodes)) {
    //console.log(key);
    //console.log(value.Category);
    const item = {}
    item["$schema"] = "http://json-schema.org/draft-06/schema#";
    item["id"] = key;
    item["title"]=key;
    if("Category" in value){
      item["category"]=value.Category;
  }else{
    item["category"]="Undefined";
    }
     
    
    item["program"]="*";
    item["project"]="*";
    item["additionalProperties"]=false;
    item["submittable"]=true;
    item["constraints"]=null;
    //item["links"]=[];
    
    item["type"]="object";
    const link=[];
    const properties={};
    const pRequired=[];
    
    if (icdcMData.Nodes[key].Props != null ) {
     
      for(var i=0;i<icdcMData.Nodes[key].Props.length;i++){
        //console.log(icdcMData.Nodes[key].Props[i]);
        const nodeP=icdcMData.Nodes[key].Props[i];
        const propertiesItem={};
        for(var propertyName in icdcMPData.PropDefinitions){
          
          if(propertyName==nodeP){
            
            propertiesItem["description"]=icdcMPData.PropDefinitions[propertyName].Desc;
            propertiesItem["type"]=icdcMPData.PropDefinitions[propertyName].Type;
            propertiesItem["src"]=icdcMPData.PropDefinitions[propertyName].Src;
            
            if(icdcMPData.PropDefinitions[propertyName].Req==true){
              pRequired.push(nodeP);
            }


          }
        }
        properties[nodeP]=propertiesItem;

      
      }

      item["properties"]=properties;
      item["required"]=pRequired;

    }else{
      item["properties"]={};
    }
    
    
    for (var propertyName in icdcMData.Relationships) {
      const linkItem={};
      //console.log(propertyName);
      //console.log(icdcMData.Relationships[propertyName]);
      //console.log(icdcMData.Relationships[propertyName].Ends);
      const label=propertyName;
      const multiplicity=icdcMData.Relationships[propertyName].Mul;
      const required=false;
      for(var i=0;i<icdcMData.Relationships[propertyName].Ends.length;i++){
        
        if(icdcMData.Relationships[propertyName].Ends[i].Src==key){
          const backref=icdcMData.Relationships[propertyName].Ends[i].Src;
          const name=icdcMData.Relationships[propertyName].Ends[i].Dst;
          const target=icdcMData.Relationships[propertyName].Ends[i].Dst;

          linkItem["name"]=name;
          linkItem["backref"]=backref;
          linkItem["label"]=label;
          linkItem["target_type"]=target;
          linkItem["required"]=required;
          
          link.push(linkItem);
        }
      }
      
    }



    //console.log(link);
    item["links"]=link;


    dataList[key]=item;

    
    
  }
  const term={};
  

  console.log(dataList);
  





  // Fetch S3 schema.json
  //let response = await fetch(url);
  //let schema = await response.json();
  let schema =jsonData;
  //let schema =dataList;

  // Remove .yaml extension from keys 
  let dict = {};  
  for (let [key, value] of Object.entries(schema)) {
    dict[key.slice(0, -5)] = value;
    
  }
  
  /*for (let [key, value] of Object.entries(schema)) {
    dict[key] = value;
    
  }*/

  
 

  // Recursivly fix references
  dict = findObjectWithRef(dict, (refObj, rootKey)=> { // This halts for sub objects./...

    if ( refObj.includes('.yaml') ) {

      // ABS_FIX
      // "$ref": "_definitions.yaml#/ubiquitous_properties",
      // ->
      // "$ref": "#/_definitions/ubiquitous_properties",

      refObj = "#/" + refObj.replace('.yaml#', '');
     // console.log("ABS FIX -- " + rootKey + ": " + refObj);

    } else {

      // REL FIX
      // "$ref": "#/state"
      // ->
      // "$ref": "#/{_definitions aka root key}/state"

      refObj = '#/' + rootKey + '/' + refObj.replace('#/', '');
      //console.log("REL FIX -- " + rootKey + ": " + refObj);
    }


    return refObj;
  });

  // Append metaschema TODO?? Doesn't seem to matter anymore

  // This is a HACK FIX ME!!@!!!
  
  dict['_terms']['file_format'] = {description: 'wut'};


  let newDict = await $RefParser.dereference(dict, {
    continueOnError: false,            // Don't throw on the first error
    dereference: {
      circular: true                 // Don't allow circular $refs
    }
  });

  //console.log(newDict);
  const newDataList=dataList;
  //newDataList['_terms']=newDict['_terms'];
  //newDataList['_definitions']=newDict['_definitions'];
  //newDataList['_settings']=newDict['_settings'];
  //console.log(newDataList);
  await Promise.all(
    [
      store.dispatch({
        type: 'RECEIVE_DICTIONARY',
        //data: newDict
        data: newDataList
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
