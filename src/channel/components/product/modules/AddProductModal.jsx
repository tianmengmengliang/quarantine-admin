import React, { Component, PropTypes } from 'react';
import {Form, Input, Checkbox, Radio, Upload, Select, Button, Icon} from 'antd'
import CiqCodeModal from './CiqCodeModal.jsx'
import {ButtonContainer, SearchButton, ResetButton, GridForm, ModalA} from '../../../../components/'
import metaData from '../metaData.js'
const FormInlineItem = GridForm.InlineItem;
const itemTypes = metaData.itemTypes;

class AddProductModal extends Component{

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

    /*
    * @interface select选择项发生改变的回调
    * @param {any} value 当前选中项的值
    * */
    selectChange =(value)=> {
        // console.log(value);
        this.setState(()=>{
           return {type: value}
        })
    };

    render(){
        const {visible, title, data, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {itemTypeValue} = this.state;
        const blockFromItemLayout = {
            labelCol: { span:4 },
            wrapperCol: { span: 20 },
        };
        const formItemLayout = {
            labelCol: { span:8 },
            wrapperCol: { span: 16 },
        };

        const uploadProps = {
            action: 'http://192.168.1.101:8080/upload',
            data: {orgId: 1},
            headers: {},
            // accept: '',
            multiple: false,
            onChange: this.handleUploadChange,
            /* customRequest:{
             action: '',
             headers: {},
             onProgress: ,
             onError: ,
             data: {},
             filename: '',
             file: {},
             withCredentials: false,

             },*/
            showUploadList: false

        };
        return (
            <ModalA
                visible={visible}
                title={title}
                width={1120}
                onOk={this.onOk}
                onCancel={this.onCancel}
                {...props}>
                <GridForm
                    horizontal>
                    <FormInlineItem
                        {...formItemLayout}
                        label="产品等级"
                        hasFeedback
                        >
                        {getFieldDecorator('input1', {
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
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        span={8}
                        label="ciq编码"
                        hasFeedback
                        >
                        {getFieldDecorator('input2', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem span={4}>
                        <ButtonContainer
                            type="form"
                            style={{margin: '0 0 0 16px'}}>
                            <SearchButton onClick={this.showCiqCodeModal}>选择</SearchButton>
                            <ResetButton onClick={this.resetFields.bind(this, ['input2'])} />
                        </ButtonContainer>
                        <CiqCodeModal
                            visible={false}
                            hasDefaultStyle={false}
                            />
                    </FormInlineItem>

                    <FormInlineItem
                        span={24}
                        {...formItemLayout}
                        labelCol={{span: 4}}
                        wrapperCol={{span: 20}}
                        label="批件号"
                        hasFeedback
                        >
                        {getFieldDecorator('input3', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="产品名称"
                        hasFeedback
                        >
                        {getFieldDecorator('input4', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="产品英文名称"
                        hasFeedback
                        >
                        {getFieldDecorator('input5', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="生产厂家"
                        hasFeedback
                        >
                        {getFieldDecorator('input6', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="生产地址"
                        hasFeedback
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
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="产品成分"
                        hasFeedback
                        >
                        {getFieldDecorator('input8', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                        <Upload
                            {...uploadProps}
                            >
                            <Button>
                                <Icon type="upload" /> Click to upload
                            </Button>
                        </Upload>
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="含有的微生物危险等级"
                        hasFeedback
                        >
                        {getFieldDecorator('input9', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="物品类别"
                        hasFeedback
                        >
                        {getFieldDecorator('input10-1', {
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
                              {this._renderSelectOption(itemTypes)}
                            </Select>
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="物品种类"
                        hasFeedback
                        >
                        {getFieldDecorator('input10-2', {
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
                              {this._renderSelectOption(this._getSelectOptionsMetaData(itemTypeValue, 'value', itemTypes)['itemTypes'])}
                            </Select>
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="原产国"
                        hasFeedback
                        >
                        {getFieldDecorator('input11', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="用途"
                        hasFeedback
                        >
                        {getFieldDecorator('input12', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="规格"
                        hasFeedback
                        >
                        {getFieldDecorator('input13', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="产品货号"
                        hasFeedback
                        >
                        {getFieldDecorator('input14', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        span={24}
                        labelCol={{span: 4}}
                        wrapperCol={{span: 20}}
                        label="备注"
                        hasFeedback
                        >
                        {getFieldDecorator('input15', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="其它补充文件"
                        hasFeedback
                        >
                        {getFieldDecorator('input8', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                        <Upload
                            {...uploadProps}
                            >
                            <Button>
                                <Icon type="upload" /> Click to upload
                            </Button>
                        </Upload>
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="情况说明"
                        hasFeedback
                        >
                        {getFieldDecorator('input8', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                        <Upload
                            {...uploadProps}
                            >
                            <Button>
                                <Icon type="upload" /> Click to upload
                            </Button>
                        </Upload>
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="卫计委批文"
                        hasFeedback
                        >
                        {getFieldDecorator('input8', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                        <Upload
                            {...uploadProps}
                            >
                            <Button>
                                <Icon type="upload" /> Click to upload
                            </Button>
                        </Upload>
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="人类遗传资源准出境证明"
                        hasFeedback
                        >
                        {getFieldDecorator('input8', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                        <Upload
                            {...uploadProps}
                            >
                            <Button>
                                <Icon type="upload" /> Click to upload
                            </Button>
                        </Upload>
                    </FormInlineItem>

                    <FormInlineItem
                        {...formItemLayout}
                        label="风险评估报告"
                        hasFeedback
                        >
                        {getFieldDecorator('input8', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                        <Upload
                            {...uploadProps}
                            >
                            <Button>
                                <Icon type="upload" /> Click to upload
                            </Button>
                        </Upload>
                    </FormInlineItem>
                    <FormInlineItem
                        {...formItemLayout}
                        label="环保用微生物菌剂卫生证书"
                        hasFeedback
                        >
                        {getFieldDecorator('input8', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ]
                        })(
                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                        <Upload
                            {...uploadProps}
                            >
                            <Button>
                                <Icon type="upload" /> Click to upload
                            </Button>
                        </Upload>
                    </FormInlineItem>
                </GridForm>
            </ModalA>
        )
    }
}

AddProductModal.propTypes = {
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

AddProductModal.defaultProps = {
    prefix: 'yzh',
    visible: true
};

AddProductModal = GridForm.create()(AddProductModal);

export default AddProductModal;