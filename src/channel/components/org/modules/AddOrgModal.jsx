import React, { Component, PropTypes } from 'react';
import {ModalA} from 'antd/../../src/components/'
import EditOrgInfoPage from './EditOrgInfoPage.jsx'

class AddOrgModal extends Component{
    _retInitialState = ()=>{
        return {
            itemTypeValue: 1,
        }
    };

    constructor(props){
        super(props);
        super(props);
        this.state = this._retInitialState()
    }

    /*
     * @interface 上传文件钱的hook
     * @param {object} 当前上传文件信息
     * */
    beforeUpload = (file)=> {

    };

    handlePreview = (file) => {
        console.log(file)
    };

    handleRemove = (file)=>{
        console.log(file)
    };

    /*
     * @interface
     * */
    handleUploadChange = (info) => {
        console.log(info);

        let fileList = info.fileList;

        // 1. Limit the number of uploaded files
        //    Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-2);

        // 2. read from response and show file link
        fileList = fileList.map((file) => {
            if (file.response) {
                // Component will show file.url as link
                file.url = file.response.filePath;
            }
            return file;
        });

        // 3. filter successfully uploaded files according to response from server
        fileList = fileList.filter((file) => {
            if (file.response) {
                return file.response.success;
            }
        });


        if (info.file.status === 'done') {
            // Get this url from response in real world.
            // getBase64(info.file.originFileObj, imageUrl => this.setState({ imageUrl }));
        }
    };

    showCiqCodeModal = ()=>{

    };

    hiddenCiqCodeModal = ()=>{

    };

    callbackOfCiqCodeModal = ()=>{

    };

    /*
     * @interface 对话框确定按钮回调
     * @param {object} 事件对象
     * */
    onOk = ()=> {
        return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
    };

    /*
     * @interface 重置表单域
     * @param {array | undefined} fieldsName 表单域的name
     * */
    resetFields = (fieldsName)=>{
        e.preventDefault();
        this.props.form.resetFields(fieldsName)
    };

    /*
     * @interface 对话框取消按钮回调
     * */
    onCancel = ()=> {

    };

    render(){
        const {visible, title, data, ...props} = this.props;

        return (
            <ModalA
                visible={visible}
                title={title}
                width={1120}
                onOk={this.onOk}
                onCancel={this.onCancel}
                {...props}>
                <EditOrgInfoPage />
            </ModalA>
        )
    }
}

AddOrgModal.propTypes = {
    callback: PropTypes.func,
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

AddOrgModal.defaultProps = {
    prefix: 'yzh',
    visible: true
};

export default AddOrgModal;