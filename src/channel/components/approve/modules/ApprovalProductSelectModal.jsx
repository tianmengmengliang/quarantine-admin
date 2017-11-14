import React, { Component, PropTypes } from 'react';
import {Form, Icon, Upload} from 'antd'
import {ModalA, ButtonContainer, UploadButton} from '../../../../components/'
import {ProductSelectPage} from '../../product/modules/'

function noop(){}

class ApprovalProductSelectModal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false,
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    /*
     * @interface 表单提交给上层组件
     * @param {object} 事件对象
     * */
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) {
                console.log('form has err', err)
                return ;
            }

            console.log('form has values', values)
        });
    };

    onOk = ()=> {
        return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
    };

    onCancel = ()=> {

    };

    /*
     * @interface 规范化受控上传组件的值
     * @param {object} e 事件对象
     * @return {array} 文件列表数组
     * */
    normFile =(e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    /*
     * @interface 文件上传之前的hook
     * @param {object} file 当前上传的文件
     * @return {boolean | promise} 返回时候上传的结果
     * */
    beforeUpload = (file)=> {
        const isJPG = file.type === 'image/jpeg';
        if (!isJPG) {
            message.error('You can only upload JPG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJPG && isLt2M;
    };

    /*
     * @interface 上传文件列表发生变化时的hook
     * @param {object} info 上传文件列表的信息
     * */
    fileUploadChange = (info) => {
        if (info.file.status === 'done') {

        }
    };

    render(){
        const {title, visible, confirmLoading, ...props} = this.props;
        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                {...props}
                >
                <ProductSelectPage />
            </ModalA>
        )
    }
}

ApprovalProductSelectModal.propTypes = {
    data: PropTypes.any,
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

ApprovalProductSelectModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

ApprovalProductSelectModal = Form.create()(ApprovalProductSelectModal);

export default ApprovalProductSelectModal;