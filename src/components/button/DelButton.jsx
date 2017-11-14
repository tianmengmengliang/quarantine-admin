import React, { Component, PropTypes } from 'react';
import {Button, Icon} from 'antd'

function DelButton({prefix, className, style, children, shape, type, icon, loading, ghost, onClick, ...props}){
    return (
        <Button
            className={className}
            type={type}
            shape={shape}
            loading={loading}
            ghost={ghost}
            onClick={onClick}
            icon={icon}
            {...props}>
            {children}
        </Button>
    )
}

DelButton.propTypes = {
    prefix: PropTypes.string,
    children: PropTypes.any,
    type: PropTypes.string,
    shape: PropTypes.string,
    title: PropTypes.string,
    icon: PropTypes.string,
    loading: PropTypes.bool,
    ghost: PropTypes.bool,
    size: PropTypes.string,
    onClick: PropTypes.func,

    className: PropTypes.string,
    style: PropTypes.object,
};

DelButton.defaultProps = {
    prefix: 'yzh',
    type: 'danger',
    shape: false,
    icon: 'delete',
    children: '删除',
    loading: false,
    ghost: false,
};

export default DelButton