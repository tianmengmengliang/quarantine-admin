
export default {
    namespace:'userRole',
    state:[

    ],
    subscriptions:{

    },
    reducers:{
        changeUserRole( state, action){
            return [
                ...state,
                ...action.payload
            ]
        }
    }
}