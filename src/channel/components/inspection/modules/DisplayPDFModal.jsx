import React, { Component, PropTypes } from 'react';
import {Spin, Icon} from 'antd'
import cx from 'classnames'
import moment from 'moment'
import {PDFViewer} from '../../../../components/'
import './displayPDFModal.less'

function noop(){}

class DisplayPDFModal extends Component{
    constructor(props){
        super(props);
    }

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        });
    };

    render(){
        const {prefix, title, visible, data, fileUrl, ...props} = this.props;

        const cls = cx({
            [`${prefix}-display-pdf-modal`]: true
        });
        return (
            <PDFViewer
                className={cls}
                fileUrl={fileUrl}
                // confirmLoading={confirmLoading}
                title={`查看PDF文件`}
                visible={visible}
                footer={null}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                width={700}
                bodyHeight={900}
                bodyStyle={{marginTop: 16}}
                {...props}
                >
                {}
            </PDFViewer>
        )
    }
}

DisplayPDFModal.propTypes = {
    data: PropTypes.object,
    fileUrl: PropTypes.string,

    visible: PropTypes.bool.isRequired,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    confirmLoading: PropTypes.bool,

    footer: PropTypes.any,
    maskClosable: PropTypes.bool,
    closable: PropTypes.bool,
    afterClose: PropTypes.func,
    style: PropTypes.object,
    width: PropTypes.any,
    prefix: PropTypes.string.isRequired
};

DisplayPDFModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

export default DisplayPDFModal;