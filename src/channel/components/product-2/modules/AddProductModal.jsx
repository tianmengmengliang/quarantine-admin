import React, { Component, PropTypes } from 'react';
import {Form, Select, Upload, Icon, Input, DatePicker,Row, Col, Button, InputNumber, message, Modal} from 'antd'
import moment from 'moment'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, SearchButton, BodyGridTable, ResetButton} from '../../../../components/'
import DisplayPDFModal from './DisplayPDFModal.jsx'
import pdfUrl from 'antd/../../public/assets/img/pdf.png'
import rarUrl from 'antd/../../public/assets/img/rar.png'
import zipUrl from 'antd/../../public/assets/img/zip.png'
import unKnowUrl from 'antd/../../public/assets/img/unknow.png'
import {dimsMap} from '../../helpers/'
const {custom: {entryExit}, product: {itemTypes, countUnit, weightUnit, valueUnit}, _product: {itemTypes: optionArr}} = dimsMap;

function noop(){}

let _uniqueFileId = -1;
function _normalizeFileList(file){
    let thumbUrl = unKnowUrl;
    return {
        uid: _uniqueFileId--,
        name: file.name,
        status: 'done',
        filePath: file.filePath,
        url: '',
        thumbUrl: thumbUrl
    }
}

class AddProductModal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false,
            fileList: [],
            type: undefined,
            subType: undefined,
            attFile: {                                          // 其他不从文件对象
                _origin: {},
                fileList: []
            },
            situationFile: {                                    // 情况说明文件对象
                _origin: {},
                fileList: []
            },
            weijwpwFile: {                                      // 卫计委批文文件对象
                _origin: {},
                fileList: []
            },
            rlyczmFile: {                                      // 人类遗传证明文件对象
                _origin: {},
                fileList: []
            },
            fengxianpgFile: {                                  // 风险评估文件对象
                _origin: {},
                fileList: []
            },
            healthcerFile: {                                   // 环保用文生物菌剂卫生证明文件对象
                _origin: {},
                fileList: []
            },
            displayPDFModal: {                                  // pdf对话框
                visible: false,
                title: '',
                fileUrl: undefined,
                data: {}
            },
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    _updateState = (nextProps)=>{
        const {visible, data: newData} = nextProps;
        const {data: oldData} = nextProps;
        if(visible && newData && oldData && newData !== oldData){
            const {attFile, attFileName,
                situationFile, situationFileName,
                weijwpwFile, weijwpwFileName,
                rlyczmFile, rlyczmFileName,
                fengxianpgFile, fengxianpgFileName,
                healthcerFile, healthcerFileName} = newData;
            this.setState({
                attFile: {
                    _origin: {name: attFileName, filePath: attFile},
                    fileList: _normalizeFileList({name: attFileName, filePath: attFile})
                },
                situationFile: {
                    _origin: {name: situationFileName, filePath: situationFile},
                    fileList: _normalizeFileList({name: situationFileName, filePath: situationFile})
                },
                weijwpwFile: {
                    _origin: {name: weijwpwFileName, filePath: weijwpwFile},
                    fileList: _normalizeFileList({name: weijwpwFileName, filePath: weijwpwFileName})
                },
                rlyczmFile: {
                    _origin: {name: rlyczmFileName, filePath: rlyczmFile},
                    fileList: _normalizeFileList({name: rlyczmFileName, filePath: rlyczmFile})
                },
                fengxianpgFile: {
                    _origin: {name: fengxianpgFileName, filePath: fengxianpgFile},
                    fileList: _normalizeFileList({name: fengxianpgFileName, filePath: fengxianpgFile})
                },
                healthcerFile: {
                    _origin: {name: healthcerFileName, filePath: healthcerFile},
                    fileList: _normalizeFileList({name: healthcerFileName, filePath: healthcerFile})
                }
            })
        }
    };

    componentWillReceiveProps(nextProps){
        // console.log(nextProps)
        this._updateState(nextProps)
    }


    handleRowUpdated = ({ rowIdx, updated })=> {

    };

    /*
     * @interface 保存产品
     * @param {object} _props 参数对象
     * */
    saveProduct = ({data}, callback)=>{
        fetch('', {
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

    onOk = ()=> {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }

            const {receivedDate} = values;
            this.saveProduct({
                data: {
                    ...values,
                    receivedDate: receivedDate && receivedDate.unix() * 1000,
                    details: this.state.listPage.rows
                }
            }, (err, res)=>{
                // case1. 保存查验通知失败
                if(err){
                    message.error('保存产品失败')
                    return;
                }

                // case2. 保存查验通知成功
                this.props.callback && this.props.callback({
                    click: 'ok',
                    data: {
                        ...values,
                        receivedDate: receivedDate && receivedDate.unix() * 1000,
                        details: this.state.listPage.rows
                    },
                    callback: undefined,
                });
                this.setState(this._retInitialState());
                this.props.form.resetFields()
            });
        });
    };

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        });
        this.setState(this._retInitialState());
        this.props.form.resetFields()
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

    /*
     * @interface 物品类别select选择项发生改变的回调
     * @param {any} value 当前选中项的值
     * */
    selectCategoryChange =(value)=> {
        this.state.type = value;
        this.state.subType = undefined;
    };

    /*
     * @interface 物品种类select选择项发生改变的回调
     * @param {any} value 当前选中项的值
     * */
    selectKindChange =(value)=> {
        this.state.subType = value;
    };

    onFocusTip = ()=>{
        Modal.warning({
            width: 416,
            maskClosable: true,
            title: 'Want to delete these items?',
            content: 'When clicked the OK button, this dialog will be closed after 1 second',
            okText: '',
            cancelText: '',
            onOk : ()=>{

            },
            onCancel: ()=>{},
        })
    }

    onFocus = (focusValue, callback)=>{
        console.log(focusValue)
        if(!focusValue){
            callback && callback(focusValue)
        }
    };

    /*
     * @interface 获取当前Select option选中项的元数据
     * @param {number | string} value 当前选中项的值
     * @param {string} valueKey 当前Select Option 的valuePropName
     * @param {array} optionsMetaData 当前Select Option的元数据
     * @return 返回当前选中项或者undefined
     * */
    _getSelectOptionsMetaData = (value, valueKey = 'value', optionsMetaData = [])=>{
        let metaData;
        optionsMetaData.some((option)=>{
            const hasFind = option[valueKey] === value;
            if(hasFind){
                metaData = option
            }

            return hasFind
        });

        return metaData || {}
    };

    /*
     * @interface 渲染Select Option组件
     * @return 返回生成的Select Option组件
     * */
    _renderSelectOption = (options)=>{
        if(options instanceof Array){
            return options.map((option, i)=>{
                return <Select.Option value={option.value} key={`${option.value}-${i}`}>{option.title}</Select.Option>
            })
        }

        return []
    };

    render(){
        const {title, visible, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {confirmLoading, attFile = {}, situationFile = {}, weijwpwFile = {}, rlyczmFile = {},
            fengxianpgFile = {}, healthcerFile = {},  fileList, displayPDFModal, type} = this.state;

        // console.log(this.state.listPage)

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
            style: {width: 400}
        };

        const formItemLayout2 = {
            labelCol: {span: 3},
            wrapperCol: {span: 15},
            style: {margin: '0 0 16px 0', width: 800}
        };

        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">上传附件</div>
            </div>
        );
        const baseFileUploadProps = {
            name: 'file',
            action: CONFIG.uploadUrl,
            headers: {
                authorization: localStorage.getItem(CONFIG.token),
            },
            showUploadList: true,
            accept: null,
            listType: 'picture-card',
            fileList: []
        };

        const attFileUploadProps = {
            ...baseFileUploadProps,
            fileList: attFile.fileList,
            beforeUpload: (file)=> {
                return true;
            },
            onRemove: (file)=>{
                // console.log(file)
                this.props.form.setFields({
                    [`attFile`]: {
                        value: undefined,
                        errors: null
                    }
                });
            },
            onPreview: (file)=>{
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
                        file.name = file.response.responseObject.name;
                        file.filePath = file.response.responseObject.filePath;
                        file.url = '';
                        file.thumbUrl = unKnowUrl;
                        // step2. 设置文件隐藏域值和审批单号域的值
                        this.props.form.setFields({
                            [`attFile`]: {
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

                this.setState(({attFile})=>{
                    return {
                        attFile: {
                            ...attFile,
                            fileList
                        }
                    }
                });
            }
        };

        const situationFileUploadProps = {
            ...baseFileUploadProps,
            fileList: situationFile.fileList,
            beforeUpload: (file)=> {
                return true;
            },
            onRemove: (file)=>{
                // console.log(file)
                this.props.form.setFields({
                    [`situationFile`]: {
                        value: undefined,
                        errors: null
                    }
                });
            },
            onPreview: (file)=>{
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
                        file.name = file.response.responseObject.name;
                        file.filePath = file.response.responseObject.filePath;
                        file.url = '';
                        file.thumbUrl = unKnowUrl;
                        // step2. 设置文件隐藏域值和审批单号域的值
                        this.props.form.setFields({
                            [`situationFile`]: {
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

                this.setState(({situationFile})=>{
                    return {
                        situationFile: {
                            ...situationFile,
                            fileList
                        }
                    }
                });
            }
        };

        const weijwpwFileUploadProps = {
            ...baseFileUploadProps,
            fileList: weijwpwFile.fileList,
            beforeUpload: (file)=> {
                return true;
            },
            onRemove: (file)=>{
                // console.log(file)
                this.props.form.setFields({
                    [`weijwpwFile`]: {
                        value: undefined,
                        errors: null
                    }
                });
            },
            onPreview: (file)=>{
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
                        file.name = file.response.responseObject.name;
                        file.filePath = file.response.responseObject.filePath;
                        file.url = '';
                        file.thumbUrl = unKnowUrl;
                        // step2. 设置文件隐藏域值和审批单号域的值
                        this.props.form.setFields({
                            [`weijwpwFile`]: {
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

                this.setState(({weijwpwFile})=>{
                    return {
                        weijwpwFile: {
                            ...weijwpwFile,
                            fileList
                        }
                    }
                });
            }
        };

        const rlyczmUploadProps = {
            ...baseFileUploadProps,
            fileList: rlyczmFile.fileList,
            beforeUpload: (file)=> {
                return true;
            },
            onRemove: (file)=>{
                // console.log(file)
                this.props.form.setFields({
                    [`rlyczmFile`]: {
                        value: undefined,
                        errors: null
                    }
                });
            },
            onPreview: (file)=>{
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
                        file.name = file.response.responseObject.name;
                        file.filePath = file.response.responseObject.filePath;
                        file.url = '';
                        file.thumbUrl = unKnowUrl;
                        // step2. 设置文件隐藏域值和审批单号域的值
                        this.props.form.setFields({
                            [`rlyczmFile`]: {
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

                this.setState(({rlyczmFile})=>{
                    return {
                        rlyczmFile: {
                            ...rlyczmFile,
                            fileList
                        }
                    }
                });
            }
        };

        const fengxianpgUploadProps = {
            ...baseFileUploadProps,
            fileList: fengxianpgFile.fileList,
            beforeUpload: (file)=> {
                return true;
            },
            onRemove: (file)=>{
                // console.log(file)
                this.props.form.setFields({
                    [`fengxianpgFile`]: {
                        value: undefined,
                        errors: null
                    }
                });
            },
            onPreview: (file)=>{
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
                        file.name = file.response.responseObject.name;
                        file.filePath = file.response.responseObject.filePath;
                        file.url = '';
                        file.thumbUrl = unKnowUrl;
                        // step2. 设置文件隐藏域值和审批单号域的值
                        this.props.form.setFields({
                            [`fengxianpgFile`]: {
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

                this.setState(({fengxianpgFile})=>{
                    return {
                        fengxianpgFile: {
                            ...fengxianpgFile,
                            fileList
                        }
                    }
                });
            }
        };

        const healthcerFileUploadProps = {
            ...baseFileUploadProps,
            fileList: healthcerFile.fileList,
            beforeUpload: (file)=> {
                return true;
            },
            onRemove: (file)=>{
                // console.log(file)
                this.props.form.setFields({
                    [`healthcerFile`]: {
                        value: undefined,
                        errors: null
                    }
                });
            },
            onPreview: (file)=>{
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
                        file.name = file.response.responseObject.name;
                        file.filePath = file.response.responseObject.filePath;
                        file.url = '';
                        file.thumbUrl = unKnowUrl;
                        // step2. 设置文件隐藏域值和审批单号域的值
                        this.props.form.setFields({
                            [`healthcerFile`]: {
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

                this.setState(({healthcerFile})=>{
                    return {
                        healthcerFile: {
                            ...healthcerFile,
                            fileList
                        }
                    }
                });
            }
        };

        const _rowSpan = {
            labelSpan: 4,
            wrapperSpan: 8
        };
        const _rows = [
            [
                {
                    title: '产品等级',
                    span: _rowSpan.labelSpan
                },
                {
                    title: '产品等级',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('productRank', {
                                    initialValue: data.productRank,
                                    rules: [
                                        { required: false, message: '' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    title: 'ciq编码',
                    span: _rowSpan.labelSpan
                },
                {
                    title: 'ciq编码',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('ciqCode', {
                                    initialValue: data.ciqCode,
                                    rules: [
                                        { required: false, message: '' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    title: '批件号',
                    span: _rowSpan.labelSpan
                },
                {
                    title: '批件号',
                    span: 16,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('batch', {
                                    initialValue: data.batch,
                                    rules: [
                                        { required: false, message: '' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    title: '产品名称',
                    required: true,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '产品名称',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('productName', {
                                    initialValue: data.productName,
                                    rules: [
                                        { required: true, message: '请输入产品名称' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    title: '产品英文名称',
                    required: true,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '产品英文名称',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('productNameEn', {
                                    initialValue: data.productNameEn,
                                    rules: [
                                        { required: true, message: '请输入产品的英文名称' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    title: '生产厂家:',
                    required: true,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '生产厂家:',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('corp', {
                                    initialValue: data.corp,
                                    rules: [
                                        { required: true, message: '请输入生产厂家' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    title: '生产地址',
                    required: true,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '生产地址',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('address', {
                                    initialValue: data.address,
                                    rules: [
                                        { required: true, message: '请输入生产地址' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    title: '产品成分:',
                    required: true,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '产品成分:',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('component', {
                                    initialValue: data.component,
                                    rules: [
                                        { required: true, message: '请输入产品成分' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    title: '含有的微生物危险等级',
                    span: _rowSpan.labelSpan
                },
                {
                    title: '含有的微生物危险等级',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('microbeRisk', {
                                    initialValue: data.microbeRisk,
                                    rules: [
                                        { required: true, message: '请输入含有的微生物危险等级' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    title: '物品类别:',
                    required: true,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '物品类别:',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('pcategory', {
                                initialValue: data.pcategory,
                                rules: [
                                    { required: true, message: '请选择物品类别' },
                                ]
                            })(
                                <Select
                                    combobox={false}
                                    placeholder=""
                                    notFoundContent=""
                                    style={{}}
                                    defaultActiveFirstOption={false}
                                    showArrow={true}
                                    filterOption={false}
                                    onChange={this.selectCategoryChange}>
                                    {this._renderSelectOption(optionArr)}
                                </Select>
                            )
                        )
                    }
                },
                {
                    title: '物品种类',
                    required: true,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '物品种类',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('ccategory', {
                                initialValue: data.ccategory,
                                rules: [
                                    { required: true, message: '请选择物品种类' },
                                ]
                            })(
                                <Select
                                    combobox={false}
                                    placeholder=""
                                    notFoundContent=""
                                    style={{}}
                                    defaultActiveFirstOption={false}
                                    showArrow={true}
                                    filterOption={false}
                                    // onClick={this.onFocus.bind(this, type, this.onFocusTip)}
                                    >
                                    {this._renderSelectOption(this._getSelectOptionsMetaData(type, 'value', optionArr)['itemTypes'])}
                                </Select>
                            )
                        )
                    }
                }
            ],
            [
                {
                    title: '原产国',
                    required: true,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '原产国',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('originCountry', {
                                    initialValue: data.originCountry,
                                    rules: [
                                        { required: true, message: '请输入原产国' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    title: '用途',
                    required: true,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '用途',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('purpose', {
                                    initialValue: data.purpose,
                                    rules: [
                                        { required: true, message: '请输入用途' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    title: '规格',
                    required: true,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '规格',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('specifications', {
                                    initialValue: data.specifications,
                                    rules: [
                                        { required: true, message: '请输入规格' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    title: '产品货号',
                    span: _rowSpan.labelSpan
                },
                {
                    title: '产品货号',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('productno', {
                                    initialValue: data.productno,
                                    rules: [
                                        { required: false, message: '' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    title: '备注',
                    span: _rowSpan.labelSpan
                },
                {
                    title: '备注',
                    span: 16,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('remark', {
                                    initialValue: data.remark,
                                    rules: [
                                        { required: false, message: '' },
                                    ]
                                })(
                                    <Input type="textarea" autosize={{ minRows: 2, maxRows: 6 }}// style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    title: '其它补充文件',
                    rowHeight: 130,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '其它补充文件',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                <div className="file-upload-container-inline">
                                    <Upload {...attFileUploadProps}>
                                        {/*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*/}
                                        {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                    {getFieldDecorator(`attFile`, {
                                        initialValue: data.attFile,
                                        rules: [
                                            { required: false}
                                        ],
                                        valuePropName: 'value',
                                    })(
                                        <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                            />
                                    )}
                                </div>
                            </Form.Item>
                        )
                    }
                },
                {
                    title: '情况说明',
                    span: _rowSpan.labelSpan
                },
                {
                    title: '情况说明',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                <div className="file-upload-container-inline">
                                    <Upload {...situationFileUploadProps}>
                                        {/*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*/}
                                        {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                    {getFieldDecorator(`situationFile`, {
                                        initialValue: data.situationFile,
                                        rules: [
                                            { required: false}
                                        ],
                                        valuePropName: 'value',
                                    })(
                                        <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                            />
                                    )}
                                </div>
                            </Form.Item>
                        )
                    }
                },
            ],
            [
                {
                    title: '卫计委批文',
                    rowHeight: 130,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '卫计委批文',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                <div className="file-upload-container-inline">
                                    <Upload {...weijwpwFileUploadProps}>
                                        {/*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*/}
                                        {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                    {getFieldDecorator(`weijwpwFile`, {
                                        initialValue: data.weijwpwFile,
                                        rules: [
                                            { required: false}
                                        ],
                                        valuePropName: 'value',
                                    })(
                                        <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                            />
                                    )}
                                </div>
                            </Form.Item>
                        )
                    }
                },
                {
                    title: '人类遗传资源准出境证明',
                    span: _rowSpan.labelSpan
                },
                {
                    title: '人类遗传资源准出境证明',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                <div className="file-upload-container-inline">
                                    <Upload {...rlyczmUploadProps}>
                                        {/*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*/}
                                        {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                    {getFieldDecorator(`rlyczmFile`, {
                                        initialValue: data.rlyczmFile,
                                        rules: [
                                            { required: false}
                                        ],
                                        valuePropName: 'value',
                                    })(
                                        <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                            />
                                    )}
                                </div>
                            </Form.Item>
                        )
                    }
                },
            ],
            [
                {
                    title: '风险评估报告',
                    rowHeight: 130,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '风险评估报告',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                <div className="file-upload-container-inline">
                                    <Upload {...fengxianpgUploadProps}>
                                        {/*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*/}
                                        {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                    {getFieldDecorator(`fengxianpgFile`, {
                                        initialValue: data.fengxianpgFile,
                                        rules: [
                                            { required: false}
                                        ],
                                        valuePropName: 'value',
                                    })(
                                        <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                            />
                                    )}
                                </div>
                            </Form.Item>
                        )
                    }
                },
                {
                    title: '环保用微生物菌剂卫生证书',
                    rowHeight: 130,
                    span: _rowSpan.labelSpan
                },
                {
                    title: '环保用微生物菌剂卫生证书',
                    span: _rowSpan.wrapperSpan,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                <div className="file-upload-container-inline">
                                    <Upload {...healthcerFileUploadProps}>
                                        {/*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*/}
                                        {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                    {getFieldDecorator(`healthcerFile`, {
                                        initialValue: data.healthcerFile,
                                        rules: [
                                            { required: false}
                                        ],
                                        valuePropName: 'value',
                                    })(
                                        <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                            />
                                    )}
                                </div>
                            </Form.Item>
                        )
                    }
                },
            ]
        ];

       /* const formEle = (
            <Form
                inline>
                {getFieldDecorator('id', {
                    initialValue: data.id,
                    rules: false
                })(
                    <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                        />
                )}
                <Form.Item
                    {...formItemLayout}
                    label="产品等级"
                    >
                    {getFieldDecorator('input1', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Select
                            combobox={false}
                            placeholder=""
                            notFoundContent=""
                            style={{}}
                            defaultActiveFirstOption={false}
                            showArrow={true}
                            filterOption={false}
                            onChange={this.selectChange}>
                            <Select.Option value="1">v/w非特殊物品</Select.Option>
                            <Select.Option value="2">A</Select.Option>
                            <Select.Option value="3">B</Select.Option>
                            <Select.Option value="4">C</Select.Option>
                            <Select.Option value="5">D</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="ciq编码"
                    >
                    {getFieldDecorator('input2', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>

                <Form.Item
                    style={{display: 'block'}}
                    label="批件号"
                    >
                    {getFieldDecorator('input3', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="产品名称"
                    >
                    {getFieldDecorator('input4', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="产品英文名称"
                    >
                    {getFieldDecorator('input5', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="生产厂家"
                    >
                    {getFieldDecorator('input6', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="生产地址"
                    >
                    {getFieldDecorator('input7', {
                        valuePropName: 'value',
                        initialValue: ['Apple'],
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="产品成分"
                    >
                    {getFieldDecorator('input8', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                    <Input // style={{ width: '65%', marginRight: '3%' }}
                        />
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="含有的微生物危险等级"
                    >
                    {getFieldDecorator('input9', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="物品类别"
                    >
                    {getFieldDecorator('input10-1', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Select
                            combobox={false}
                            placeholder=""
                            notFoundContent=""
                            style={{}}
                            defaultActiveFirstOption={false}
                            showArrow={true}
                            filterOption={false}
                            onChange={this.selectCategoryChange}>
                            {this._renderSelectOption(optionArr)}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="物品种类"
                    >
                    {getFieldDecorator('input10-2', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Select
                            combobox={false}
                            placeholder=""
                            notFoundContent=""
                            style={{}}
                            defaultActiveFirstOption={false}
                            showArrow={true}
                            filterOption={false}
                            // onChange={this.selectChange}
                            >
                            {this._renderSelectOption(this._getSelectOptionsMetaData(type, 'value', optionArr)['itemTypes'])}
                        </Select>
                    )}
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="原产国"
                    >
                    {getFieldDecorator('input11', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="用途"
                    >
                    {getFieldDecorator('input12', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="规格"
                    >
                    {getFieldDecorator('input13', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="产品货号"
                    >
                    {getFieldDecorator('input14', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="备注"
                    >
                    {getFieldDecorator('input15', {
                        initialValue: '',
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    >
                    <div className="file-upload-container-inline">
                        <Upload {...fileUploadProps}>
                            {/!*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*!/}
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        {getFieldDecorator(`orderFile`, {
                            initialValue: data.orderFile,
                            rules: [
                                { required: false}
                            ],
                            valuePropName: 'value',
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </div>
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    >
                    <div className="file-upload-container-inline">
                        <Upload {...fileUploadProps}>
                            {/!*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*!/}
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        {getFieldDecorator(`orderFile`, {
                            initialValue: data.orderFile,
                            rules: [
                                { required: false}
                            ],
                            valuePropName: 'value',
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </div>
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    >
                    <div className="file-upload-container-inline">
                        <Upload {...fileUploadProps}>
                            {/!*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*!/}
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        {getFieldDecorator(`orderFile`, {
                            initialValue: data.orderFile,
                            rules: [
                                { required: false}
                            ],
                            valuePropName: 'value',
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </div>
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    >
                    <div className="file-upload-container-inline">
                        <Upload {...fileUploadProps}>
                            {/!*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*!/}
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        {getFieldDecorator(`orderFile`, {
                            initialValue: data.orderFile,
                            rules: [
                                { required: false}
                            ],
                            valuePropName: 'value',
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </div>
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    >
                    <div className="file-upload-container-inline">
                        <Upload {...fileUploadProps}>
                            {/!*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*!/}
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        {getFieldDecorator(`orderFile`, {
                            initialValue: data.orderFile,
                            rules: [
                                { required: false}
                            ],
                            valuePropName: 'value',
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </div>
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    >
                    <div className="file-upload-container-inline">
                        <Upload {...fileUploadProps}>
                            {/!*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*!/}
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        {getFieldDecorator(`orderFile`, {
                            initialValue: data.orderFile,
                            rules: [
                                { required: false}
                            ],
                            valuePropName: 'value',
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </div>
                </Form.Item>
            </Form>
        );*/
        return (
            <ModalA
                width={980}
                confirmLoading={confirmLoading}
                title={title}
                visible={true}
                okText="保存"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                // bodyHeight={500}
                {...props}
                >
                <div className="hidden">
                    <DisplayPDFModal
                        {...displayPDFModal}
                        callback={this.displayPDFModalCallback}/>
                </div>
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
                    <BodyGridTable rows={_rows}/>
                </Form>
            </ModalA>
        )
    }
}

AddProductModal.propTypes = {
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

AddProductModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

AddProductModal = Form.create()(AddProductModal);

export default AddProductModal;