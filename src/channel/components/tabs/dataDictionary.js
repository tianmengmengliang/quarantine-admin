
const dataDictionary = {
    def: {
        menuClick:[
            id,                                     // 点击动作标识符
            parentId,                               // 父组件标识符
            data,                                   // 携带数据
            actionType,                             // 动作类型
            actionEvent,                            // 事件对象
            instance,                               // 当前触发实例
            parentInstance,                         // 父元素实例
            cName,                                  // 事件cName
            tag,                                    // 事件标签
        ],
        btnClick: {
            id,                                     // 点击动作标识符
            form,                                   // 父组件标识符或者父组件
            data,                                   // 携带数据
            actionType,                             // 动作类型
            actionEvent,                            // 事件对象
            instance,                               // 当前触发实例
            cName,                                  // 事件cName
            tag,                                    // 事件标签
        }
    },
    list:{
        menuClick:[

        ],
        btnClick: [
            'Org/viewOrgInfo'                       // 查看单位信息
        ]
    }
};