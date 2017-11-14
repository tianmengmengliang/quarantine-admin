import React, { Component, PropTypes } from 'react';
import cx from 'classnames'
import {Form} from 'antd'
import './gridForm.less'

const InlineItem = function({children, prefix, className, span, ...props}){
    // console.log(props);
    const cls = cx({
        [`${prefix}-form-inline-item`]: true,
        [`ant-col-${span}`]: true
    });
    return (
        <Form.Item
            className={`${cls} ${className === undefined ? '' : className}`}
            style={{display: 'inline-block', margin:'0 0 16px 0'}}
            {...props}>
            {children}
        </Form.Item>
    )
};

InlineItem.propType = {
    prefix: PropTypes.string.isRequired,
    span: PropTypes.number.isRequired
};

InlineItem.defaultProps={
    prefix: 'yzh',
    span: 12
};

function GridForm({children, prefix, className, ...props}){

    const cls = cx({
       [`${prefix}-form`]: true
    });
    return (
        <Form
            className={`${cls} ${className === undefined ? '' : className}`}
            {...props}>
            {children}
        </Form>
    )
}

GridForm.propType = {
  prefix: PropTypes.string.isRquired
};

GridForm.defaultProps = {
    prefix: 'yzh'
};

GridForm.InlineItem = InlineItem;
GridForm.create = Form.create;

export default GridForm