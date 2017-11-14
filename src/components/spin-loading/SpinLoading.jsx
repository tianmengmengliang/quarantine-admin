import React, { Component, PropTypes } from 'react';
import cx from 'classnames'
import {Spin} from 'antd'
import './spinLoading.less'

class SpinLoading extends Component{
    constructor(props){
        super(props);
    }

    render(){
        const {prefix, className, style, width, minHeight, size, spinning, tip, delay, wrapperClassName, children, ...props} = this.props;
        return (
            <Spin
                className={`${cx({[`${prefix}-spin-loading`]: true})} ${className ? className : ''}`}
                spinning={spinning}
                tip={tip}
                delay={delay}
                size={size}
                wrapperClassName={wrapperClassName}>
                {spinning ?
                <div style={Object.assign({}, style, {width, minHeight})}>
                    {children}
                </div> :
                    children
                }
            </Spin>
        )
    }
}

SpinLoading.propTypes = {
    prefix: PropTypes.string,
    width: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    height: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    size: PropTypes.oneOf([
        'small', 'default', 'large'
    ]),
    spinning: PropTypes.bool,
    tip: PropTypes.string,
    delay: PropTypes.number,
    wrapperClassName: PropTypes.string
};

SpinLoading.defaultProps = {
    prefix: 'yzh',
    width: "100%",
    minHeight: 450,
    size: "default",
    spinning: false,
    delay: 0
};

export {
    SpinLoading
}

export default SpinLoading