import React, { Component, PropTypes } from 'react';

/*
* @interface 为组件绑定额外的propTypes
* @param {func} Component 组件
* @newPropTypes {object} 新的属性类型对象
* @return 返回原组件
* */
function propTypesWrapper(Component, newPropTypes){
    if(typeof Component === 'function'){
        const propTypes = Object.assign({}, Component.propTypes, newPropTypes);
        Component.propTypes = propTypes;
        return Component
    }else{
        throw new TypeError('the Component you convert is not a function, you convert a '+typeof Component+'')
    }
}

/*
* @interface 为组建添加权限属性类型声明,
* @param {func} 组件
* @return 返回原组件
* */
function authPropTypesWrapper(Component){
    const AUTHPropTypes = {
        AUTH: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]).isRequired
    };
    return propTypesWrapper(Component, AUTHPropTypes);
}

export {
    authPropTypesWrapper
}