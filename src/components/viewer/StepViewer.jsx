import React, { Component, PropTypes } from 'react';
import {Modal, Timeline} from 'antd'
import cx from 'classnames'
import {ModalBody} from '../modalBody'

function _generateTimeLine(data, formatter){
    if(!data || !(data instanceof Array)){
        return undefined;
    }

    return data.map((item, i)=>{
       if(formatter && typeof formatter === 'function'){
            const _fProps = formatter(item, i, data)
            const {color, dot, content} = _fProps;
            return (
                <Timeline.Item
                    key={`timeline-item-${i}`}
                    color={color || 'blue'}
                    dot={dot}>{content}</Timeline.Item>
            )
       }
    })
}
function StepViewer({prefix, className, pending, formatter, children, timelineData, hasDefaultStyle, style,fixHeight, bodyStyle, bodyHeight, bodyMinHeight,  ...props}){
    const cls = cx({
        [`${prefix}-step-viewer`]: true
    });
    let resolvedStyle;
    if(hasDefaultStyle){
        resolvedStyle = style
    }else{
        delete style.top;
        resolvedStyle = Object.assign({}, style)
    }

    return (
        <Modal
            className={`${cls} ${className ? className : ''}`}
            style={Object.assign({}, resolvedStyle, style)}
            {...props}>
            <ModalBody
                height={bodyHeight}
                minHeight={bodyMinHeight}
                fixHeight={fixHeight}
                style={bodyStyle}>
                {children ? children :
                    <Timeline pending={pending}>
                        {_generateTimeLine(timelineData, formatter)}
                    </Timeline>
                }
            </ModalBody>
        </Modal>
    )
}

StepViewer.propTypes = {
    prefix: PropTypes.string.isRequired,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    visible: PropTypes.bool,

    pending: PropTypes.boolean,
    timelineData: PropTypes.array.isRequired,
    formatter: PropTypes.func.isRequired,

    bodyHeight: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    bodyMinHeight: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    fixHeight: PropTypes.bool,
    minHeight: PropTypes.number,
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    confirmLoading: PropTypes.bool,

    style: PropTypes.object,
    bodyStyle: PropTypes.object,
    hasDefaultStyle: PropTypes.bool.isRequired,
    width: PropTypes.any,
    footer: PropTypes.any,
    maskClosable: PropTypes.bool,
    closable: PropTypes.bool,
    afterClose: PropTypes.func
};

StepViewer.defaultProps = {
    prefix: 'yzh',
    title: '',
    visible: false,

    timeLineData: [],
    pending: false,

    confirmLoading: false,
    okText: '确定',
    cancelText: '取消',
    style: {top: '20px'},
    bodyStyle: {},
    hasDefaultStyle: true,
    width: 500,
    fixHeight: false,
    bodyHeight: 'auto',
    bodyMinHeight: 500
};

export default StepViewer;
