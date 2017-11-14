import React, { Component, PropTypes } from 'react';
import cx from 'classnames'


export default function({children,...others}){
    const cls=cx({
        'yzh-inline':true
    });
    return (
        <span className={cls} {...others}>{ children }</span>
    )
}