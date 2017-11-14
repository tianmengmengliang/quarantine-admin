import React, { Component, PropTypes } from 'react';
import cx from 'classnames'
import './drawer.less'

class Drawer extends Component{
    constructor(props){
        super(props)
    }

    generateTrigger = (trigger, triggerWidth)=>{
        if(typeof trigger === 'object' && (typeof trigger.type === 'function' || typeof trigger.type === 'string')){
            const {style = {} } = trigger.props ? trigger.props : {};
            return React.cloneElement(trigger, {style: {...style, width: triggerWidth}})
        }
        if(typeof trigger === 'number' || typeof trigger === 'string'){
            return <span style={{width: triggerWidth}}></span>
        }
    };

    render(){
        const {prefix, className, style = {},
            contentClassName, contentStyle = {}, triggerWidth, contentWidth,
            trigger, fold, content} = this.props;
        const _cCls = cx({
            [`${prefix}-drawer`]: true,
            [`${prefix}-drawer-fold`]: fold,
            [`${prefix}-drawer-unfold`]: !fold
        });
        const triggerContainerCls = cx({
            [`${prefix}-drawer-trigger-container`]: true
        });
        const triggerCls = cx({
           [`${prefix}-drawer-trigger`]: true
        });
        const contentCls = cx({
            [`${prefix}-drawer-content`]: true
        });
        const _style = fold ? {transform: `translate(-${triggerWidth}px, -50%)`} : {transform: `translate(-100%, -50%)`}
        const _trigger = this.generateTrigger(trigger, triggerWidth);
        return (
            <div
                className={`${_cCls} ${className ? className : ''}`}
                style={Object.assign({}, _style, style)}>
                <div className={triggerContainerCls}>
                    <span className={triggerCls} style={{width: triggerWidth}}>{_trigger}</span>
                </div>
                <div
                    className={`${contentCls} ${contentClassName ? contentClassName : ''}`}
                    style={Object.assign({}, {width: contentWidth, marginLeft: triggerWidth}, contentStyle)}>
                    {content}
                </div>
            </div>
        )
    }
}

Drawer.propType = {
    prefix: PropTypes.string,
    className: PropTypes.string,
    contentClassName: PropTypes.string,
    contentStyle: PropTypes.object,
    style: PropTypes.object,
    triggerWidth: PropTypes.number,
    contentWidth: PropTypes.number,
    fold: PropTypes.bool,
    direction: PropTypes.string,
    trigger: PropTypes.node,
    content: PropTypes.node
};

Drawer.defaultProps = {
    prefix: 'yzh',
    triggerWidth: 32,
    contentWidth: 600,
    fold: true,
    direction: 'toLeft'
};

export default Drawer;