import React, { Component, PropTypes } from 'react';

/*
* @constructor 顶层处理模块
* @extends Component
* @export
* */
class WrapTopFrame extends Component{
    constructor(props){
        super(props);
        this.state={
        }
    }

    render(){
        return (
            this.props.children
        )
    }
}

export default WrapTopFrame;