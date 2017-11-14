

const dataDictionary = {
    typeDictionary: {
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
        menuClickIdMap:[
            {
                0: "yzj-unit/input",
                1: "yzj-unit/change",
                2: "yzj-unit/associated-unit",
                3: "yzj-product/input",
                4: "yzj-product/liscense",
                5: "yzj-particular/approval",
                6: "yzj-particular/verification",
                7: "yzj-order/list",
                8: "yzj-regulation/usage",
            },
            {
                0: "customer-unit/msg-manger",
                1: "customer-unit/change-manger",
                2: "customer-unit/associated-unit-manger",
                3: "customer-product/msg-manger",
                4: "customer-particular/approval",
                5: "customer-particular/verification",
                6: "customer-order/query",
                7: "customer-transport/task"
            },
            {
                0: "eciq-unit/unitMsg",
                1: "eciq-unit/change",
                2: "eciq-unit/assUnit",
                3: "eciq-product/msg",
                4: "eciq-particular/approval-manger",
                5: "eciq-particular/verification-manger",
                6: "eciq-particular/inspection-manger",
                7: "eciq-trace/transport-trace",
                8: "eciq-trace/regular-manger",
                9: "eciq-regulation/after-regular"
            }
        ]
    }
};

