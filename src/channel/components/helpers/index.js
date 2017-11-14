import {authPropTypesWrapper} from './authWrap.js'
import {getArraySelectedInfo, isEqualOfLength} from './arrayHelp.js'
import {isQueryChanged} from './dataHandle.js'
import dimsMap from './globalDImsMap.jsx'
import dataDictionary from './dataDictionary.js'
import * as stringHelp from './stringHelp.js'
import * as AuthIdentity from './authIdentity.js'
import Permission from './Permission.jsx'

export {
    dimsMap,                                                            // 全局的字段映射
    AuthIdentity,                                                       // 用户身份权限
    dataDictionary,                                                     // 全局名称意义映射
    authPropTypesWrapper,
    getArraySelectedInfo,
    isEqualOfLength,                                                    // 判断两个数组的长度是否相等

    isQueryChanged,                                                     // 判断对象前后是否发生改变
    stringHelp,                                                         // 字符窜操作相关help
    Permission
}

export default {
    authPropTypesWrapper,
    getArraySelectedInfo
}