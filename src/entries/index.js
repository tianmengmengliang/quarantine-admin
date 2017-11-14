import './index.html';
import './index.less';
import ReactDOM from 'react-dom';
// import { Provider } from 'react-redux'
// import { createStore } from 'redux'
import React from 'react';
import { Router, Route, routerRedux, hashHistory } from 'dva/router.js'
import Routes from '../routes/index';
// import toDosMiddleware from '../common/middleware.js'
// import {syncHistoryWithStore } from 'react-router-redux';
// const store = createStore(function(){},toDosMiddleware);

import dva from 'dva'
// import {useRouterHistory} from 'dva/router'
///  import { createHashHistory } from 'history'
import { injectModels } from '../models/'


// import createLogger from 'redux-logger'
// const history = syncHistoryWithStore(hashHistory, store);

// history.listen((location)=>console.log("history listen: ",location));

// 1. Initialize
const app = dva({
  history: hashHistory,
  initialState: {},
 /* onError: (arg1, arg2)=>{console.log("onError", 'arg1', arg1, 'arg2', arg2)},
  onAction: ({getState, dispatch})=>{console.log("onAction", 'arg1')},
  onStateChange: ()=>{},
  onReducer: (arg1)=>{console.log("onReducer", 'arg1', arg1); return arg1},
  onEffect: (arg1, arg2)=>{console.log("onEffect", 'arg1', arg1, 'arg2', arg2)}*/
});

// 2. Model

injectModels(app);

app.use({

});

app.router(Routes);

// 5. Start
app.start('#root');



/*ReactDOM.render(
  <Provider store={store}>
    <Routes history={hashHistory} />
  </Provider>,
document.getElementById('root'));*/
