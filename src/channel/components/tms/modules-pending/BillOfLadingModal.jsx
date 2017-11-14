import React, { Component, PropTypes } from 'react';
import {Form, Upload, Input, Button, Icon} from 'antd'
import {ModalA} from '../../../../components/'
import {CONFIG} from '../../../../services/'
import './billOfLoadingModal.less'

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class BillOfLadingModal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false,
            fileList: [],
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    onOk = ()=> {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            // console.log(values);
        });
        /*return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));*/
    };

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        });
        this.props.form.resetFields();
        this.setState(this._retInitialState())
    };

    render(){
        const {title, visible, data, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;

        const {fileList, confirmLoading} = this.state;

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        };

        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        const fileUploadProps = {
            name: 'file',
            action: CONFIG.uploadUrl,
            headers: {
                authorization: localStorage.getItem(CONFIG.token),
            },
            showUploadList: true,
            accept: 'application/pdf',
            listType: 'picture-card',
            fileList: fileList,
            beforeUpload: (file)=> {
                const isPDF = file.type === 'application/pdf';
                if (!isPDF) {
                    this.props.form.setFields({
                        billFile: {
                            value: '',
                            errors: [new Error('请上传PDF类型的提货单')],
                        }
                    });
                }
                return isPDF;
            },
            onRemove: (file)=>{
                // console.log(file)
                this.props.form.setFields({
                    [`billFile`]: {
                        value: undefined,
                        errors: null
                    }
                });
            },
            onPreview: (file)=>{
                // console.log(file)
                this.displayPDFModal({fileUrl: `${CONFIG.ossFileUrl}${file.filePath}`});
                //window.open(`${CONFIG.ossFileUrl}/${file.filePath}`)
            },
            onChange: (info)=> {
                let fileList = info.fileList;

                // 1. Limit the number of uploaded files
                //    Only to show two recent uploaded files, and old ones will be replaced by the new
                fileList = fileList.slice(-1);

                // 2. read from response and show file link
                fileList = fileList.map((file, i) => {
                    if (file.response) {
                        // Component will show file.url as link
                        // step1. 设置文件对象属性
                        file.name = '';
                        file.filePath = file.response.responseObject.filePath;
                        file.url = '';
                        file.thumbUrl = pdfUrl;
                        // step2. 设置文件隐藏域值和审批单号域的值
                        this.props.form.setFields({
                            [`billFile`]: {
                                value: file.response.responseObject.filePath,
                                errors: null
                            }
                        });
                    }
                    return file;
                });

                // 3. filter successfully uploaded files according to response from server
                fileList = fileList.filter((file) => {
                    if (file.response) {
                        return file.response.success
                    }
                    return true;
                });

                this.setState({ fileList });
            }
        };
        const formEle = (
            <Form>
                <Form.Item
                    {...formItemLayout}
                    style={{display: 'none'}}
                    >
                    {getFieldDecorator('id', {
                        initialValue: data.id,
                        rules: false
                    })(
                        <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="提货单附件"
                    >
                    <div className="file-upload-container-inline">
                        <Upload {...fileUploadProps}>
                            {/*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*/}
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        {getFieldDecorator(`billFile`, {
                            initialValue: data.billFile,
                            rules: [
                                { required: true, message: '请上传提货单附件'},
                            ],
                            valuePropName: 'value',
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </div>
                </Form.Item>
            </Form>
        );
        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                bodyHeight={200}
                width={600}
                footer={null}
                {...props}
                >
                {formEle}
            </ModalA>
        )
    }
}

BillOfLadingModal.propTypes = {
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

BillOfLadingModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

BillOfLadingModal = Form.create()(BillOfLadingModal);

export default BillOfLadingModal;