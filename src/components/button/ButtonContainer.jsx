import React, { Component, PropTypes } from 'react';
import cx from 'classnames'
import './buttonContainer.less'

function _mapTypeToClsStr(type){
    if(type === 'form') return '-form';
    return ''
}
function ButtonContainer({prefix, children, className, type,  ...props}){
    const typeStr = _mapTypeToClsStr(type);
    const cls = cx({
        [`${prefix}${typeStr}-button-container`]: true
    });
    return (
        <div className={`${cls} ${className === undefined ? '' : className}`} {...props}>
            {children}
        </div>
    )
}

ButtonContainer.propTypes = {
    prefix: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    type: PropTypes.string
};

ButtonContainer.defaultProps = {
    prefix: 'yzh',
    type: 'primary'
};

export default ButtonContainer;