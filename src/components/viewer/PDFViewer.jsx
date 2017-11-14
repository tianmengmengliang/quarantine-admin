import React, { Component, PropTypes } from 'react';
import {Modal} from 'antd'
import cx from 'classnames'
import {ModalBody} from '../modalBody'
import './pdfViewer.less'

let uniqueId = 0;
function _generateUniquePDFFrameId(){
    return `pdf-viewer-iframe-${uniqueId++}`
}

function PDFViewer({prefix, children, className,
    hasDefaultStyle, style,fixHeight,
    bodyStyle, bodyHeight, bodyMinHeight,
    fileUrl, ...props}){
    let iframe = undefined;



    const cls = cx({
        [`${prefix}-pdf-viewer`]: true
    });
    let resolvedStyle;
    if(hasDefaultStyle){
        resolvedStyle = style
    }else{
        delete style.top;
        resolvedStyle = Object.assign({}, style)
    }

    const closeIframe = ()=>{
        iframe = undefined;
    };

    const createIframe = (filrUrl)=>{
        if(!filrUrl){
            closeIframe();
            return undefined;
        }
        const _f = (<iframe id={_generateUniquePDFFrameId()} src={`/public/assets/html/pdfViewer.html?path=${fileUrl}`}/>)
        iframe = _f;
        return _f;
    };

    const content = (
        <div className={`content-container`}>
            {createIframe(fileUrl)}
            {children}
        </div>
    );

    return (
        <Modal
            className={`${cls} ${className ? className : ''}`}
            style={Object.assign({}, resolvedStyle, style)}
            footer={null}
            {...props}>
            <ModalBody
                height={bodyHeight}
                minHeight={bodyMinHeight}
                fixHeight={fixHeight}
                style={bodyStyle}>
                {content}
            </ModalBody>
        </Modal>
    )
}

PDFViewer.propTypes = {
    fileUrl: PropTypes.string,

    prefix: PropTypes.string.isRequired,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    visible: PropTypes.bool,
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

PDFViewer.defaultProps = {
    prefix: 'yzh',
    title: '',
    visible: false,
    confirmLoading: false,
    okText: '确定',
    cancelText: '取消',
    style: {top: '20px'},
    bodyStyle: {},
    hasDefaultStyle: true,
    width: 1000,
    fixHeight: false,
    bodyHeight: 'auto',
    bodyMinHeight: 500
};

export default PDFViewer;
