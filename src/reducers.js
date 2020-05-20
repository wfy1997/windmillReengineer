//import { reducer as formReducer } from 'redux-form';
import { combineReducers } from 'redux';
// import userProfile from './UserProfile/reducers';
// import coreMetadata from './CoreMetadata/reducers';
// import certificate from './UserAgreement/reducers';
// import submission from './Submission/reducers';
// import analysis from './Analysis/reducers';
// import homepage from './Homepage/reducers';
// import index from './Index/reducers';
//import queryNodes from './QueryNode/reducers';
// import popups from './Popup/reducers';
// import graphiql from './GraphQLEditor/reducers';
// import explorer from './Explorer/reducers';
// import login from './Login/reducers';
// import bar from './Layout/reducers';
import ddgraph from './DataDictionary/reducers';
// import privacyPolicy from './PrivacyPolicy/reducers';
// import { logoutListener } from './Login/ProtectedContent';

export const removeDeletedNode = (state, id) => {
  const searchResult = state.search_result;
  const nodeType = Object.keys(searchResult.data)[0];
  const entities = searchResult.data[nodeType];
  searchResult.data[nodeType] = entities.filter(entity => entity.id !== id);
  return searchResult;
};

const reducers = combineReducers({ 
//   privacyPolicy,
//   bar,
//   homepage,
//   index,
//   popups,
//   user,
//   status,
//   versionInfo,
// //   submission,
// //   //analysis,
// //   queryNodes,
// //   userProfile,
// //   coreMetadata,
// //   certificate,
//   graphiql,
//   login,
//   form: formReducer,
//   auth: logoutListener,
   ddgraph,
//   userAccess,
//   userAuthMapping,
});

export default reducers;
