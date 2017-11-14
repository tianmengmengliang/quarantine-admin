
export default {
    namespace:'nav',
    state:{
        id:undefined,
        parentId:undefined,
        actionType:undefined,
        actionEvent:null,
        instance:null,
        parentInstance:null,
        cName:undefined,
        tag:undefined
    },
    subscriptions:{

    },
    reducers:{
        changeNav( state, action){
            return {
                ...state,
                ...action.payload
            }
        }
    }
}