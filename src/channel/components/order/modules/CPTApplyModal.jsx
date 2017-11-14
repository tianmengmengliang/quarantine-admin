import React, { Component, PropTypes } from 'react';
import {Form, Select, Icon, Input, InputNumber, Alert, Upload} from 'antd'
import cx from 'classnames'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable} from '../../../../components/'
import pdfUrl from 'antd/../../public/assets/img/pdf.png'
import {CONFIG, fetch} from '../../../../services/'
import DisplayPDFModal from './DisplayPDFModal.jsx'

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class CPTApplyModal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false,                              // 对话框loading状态
            fileList: [],                                       // 上传审批单文件列表
            displayPDFModal: {                                  // pdf对话框
                visible: false,
                title: '',
                fileUrl: undefined,
                data: {}
            }
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    componentWillReceiveProps(nextProps){

    }

    /*
     * @interface 完成审批
     * @param {object} 选中的行对象参数
     * @param {func} 回调函数
     * */
    cptApply = (data = {}, callback = ()=>{})=>{
        fetch('ciq.crossorderstep.completeapply', {
            // method: 'post',
            // headers: {},
            data: data,
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    confirmLoading: true
                })
            },
            complete: (err, data)=>{
                this.setState({
                    confirmLoading: false
                })
            }
        })
    };

    /*
     * @interface 表单提交给上层组件
     * @param {object} 事件对象
     * */
    onOk = ()=> {
        this.props.form.validateFields((err, values) => {
            if (err) {
                console.log('form has err', err)
                return ;
            }

            this.cptApply(values, (err, res)=> {
                // case1. 表单验证不通过
                if(err){
                    // s2-ss1-case1. 提交订单失败
                    const key = `open${Date.now()}`;
                    notification.error({
                        message: '审批提交失败',
                        description: `原因：${err.message || '未知'}`,
                        key,
                        onClose: noop,
                    });
                    return;
                }
                // case2-s1. 将数据提交给上层子组件
                this.props.callback && this.props.callback({
                    click: 'ok',
                    data: values
                });
                // ase2-s2. 重置state
                this.setState(this._retInitialState());
                // ase2-s3. 重置表单
                this.props.form.resetFields();
            });
        });
        /* return new Promise((resolve, reject) => {
         setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
         }).catch(() => console.log('Oops errors!'));*/
    };

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        });
        this.setState(this._retInitialState());
        this.props.form.resetFields();
    };

    /*
     * @interface 显示pdf对话框
     * @param {object} 参数对象
     * */
    displayPDFModal = ({fileUrl, data})=>{
        this.setState(({displayPDFModal})=>{
            return {
                displayPDFModal: {
                    ...displayPDFModal,
                    visible: true,
                    fileUrl,
                    data: {
                        ...data
                    }
                }
            }
        })
    };

    /*
     * @interface 隐藏添加产品对话框
     * */
    hiddenDisplayPDFModal = ()=>{
        this.setState(({displayPDFModal})=>{
            return {
                displayPDFModal: {
                    ...displayPDFModal,
                    visible: false,
                    fileUrl: undefined,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 添加产品对话框的回调
     * @param {object} info 对话框返回的信息对象
     * */
    displayPDFModalCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenDisplayPDFModal();
            return;
        }
    };


    render(){
        const {prefix, title, visible, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;

        const {fileList = [], confirmLoading, displayPDFModal} = this.state;

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
                             errors: [new Error('请上传PDF类型的审批单')],
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
                        errors: [new Error('请上传审批单附件')]
                    }
                });
            },
            onPreview: (file)=>{
                // console.log(file)
                this.displayPDFModal({fileUrl: `${CONFIG.ossFileUrl}${file.filePath}`});
                // window.open(`${CONFIG.ossFileUrl}/${file.filePath}`)
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

        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={`请完善审批单单号和审批单附件`}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                width={500}
                bodyHeight={400}
                {...props}
                >
                <div className="hidden">
                    <DisplayPDFModal
                        {...displayPDFModal}
                        callback={this.displayPDFModalCallback}/>
                </div>
                <Form honrizontal>
                    <Form.Item
                        >
                        {getFieldDecorator('orderId', {
                            initialValue: data.id,
                            rules: false
                        })(
                            <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Form.Item>
                    <Form.Item
                        label="审批单单号"
                        >
                        {getFieldDecorator('billCode', {
                            initialValue: data.billCode,
                            rules: [
                                {required: true, message: '审批单单号为必填项'}
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Form.Item>
                    <Form.Item
                        label='审批单附件'
                        >
                        <div className="file-upload-container-inline">
                            <Upload {...fileUploadProps}>
                                {/*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*/}
                                {fileList.length >= 1 ? null : uploadButton}
                            </Upload>
                            {getFieldDecorator(`billFile`, {
                                initialValue: data.billFile,
                                rules: [
                                    { required: true, message: '请上传审批单附件'},
                                ],
                                valuePropName: 'value',
                            })(
                                <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )}
                        </div>
                    </Form.Item>
                </Form>
            </ModalA>
        )
    }
}

CPTApplyModal.propTypes = {
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

CPTApplyModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

CPTApplyModal = Form.create()(CPTApplyModal);

export default CPTApplyModal;