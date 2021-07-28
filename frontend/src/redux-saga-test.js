const {createStore, applyMiddleware} = require('redux');
const {default: createSagaMiddleware} = require('redux-saga');

function reducer(state, action){
    return {value: action.value}
}

function* helloWorldSaga(){
    console.log('HelloWorld');
}

const sagaMiddleware = createSagaMiddleware();
const store = createStore( 
    reducer,
    applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(helloWorldSaga);

const action = (type, value) => store.dispatch({type, value});