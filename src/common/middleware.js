import thunkMiddleware from 'redux-thunk';
import {applyMiddleware} from 'redux'

let loggerMiddleware=(dispatch,getState)=>next=>action=>{
    let returnNextValue=next(action);
    console.log("loggerMiddleware current action:",action);
};

let toDosMiddleware=applyMiddleware(...[
    thunkMiddleware
]);

export default toDosMiddleware;

