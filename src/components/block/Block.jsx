import React, { Component, PropTypes } from 'react';
import cx from 'classnames'

export default function({ children, ...others}){
    const cls=cx({
       'yzh-block':true
    });
   return (
       <div className={cls} {...others}>{ children}</div>
   )
}