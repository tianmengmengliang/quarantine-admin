import React, { Component, PropTypes } from 'react';
// import faker from 'faker'
import {Form, Select, Input, Radio, Alert, Popconfirm, message, Spin, Icon, Modal, Collapse, DatePicker, InputNumber} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {ModalA, BodyGridTable, GridTable} from '../../../../components/'
import {fetch, CONFIG} from 'antd/../../src/services/'

function noop(){}

class PutInStorageRegisterModal extends Component{

    _retInitialState = ()=>{
        return {
            confirmLoading: false,
        }
    };

    /*
     * @interface 重置state和UI
     * */
    _resetAction = ()=>{
        // step1、重置state
        this.setState(this._retInitialState());
        // step2、重置表单
        this.props.form.resetFields();
    };

    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    componentWillReceiveProps(nextProps){
        const {data: newData, visible} = nextProps;
        const {data: oldData} = this.props;

    }

    /*
    * @interface 保存入库登记
    * */
    savePutInStorage = (data,callback)=>{
        fetch('ciq.entrystore.add', {
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
            complete: ()=>{
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

            const {entryDate} = values;
            this.savePutInStorage({...values, entryDate: entryDate ? entryDate.unix() * 1000 : entryDate}, (err, res)=>{
                if(err){
                    message.error(err.message || '保存入库操作失败')
                    return;
                }

                this.props.callback && this.props.callback({
                    click: 'ok',
                    data: {},
                    callback: ()=>{
                        this._resetAction()
                    }
                });
            })
        });
        /* return new Promise((resolve, reject) => {
         setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
         }).catch(() => console.log('Oops errors!'));*/
    };

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null,
            callback: ()=>{
                this._resetAction()
            }
        });
    };

    render(){
        const {prefix, title, visible, style, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {confirmLoading} = this.state;


        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 16},
        };

        const inputItem = {
            style: {margin: '0 0 16px 0', width: 300}
        };
        const formEle = (
            <Form horizontal>
                {   getFieldDecorator(`id`, {
                    initialValue: data.id,
                    rules: null
                })(
                    <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                        />
                )}
                {   getFieldDecorator(`hexiaodanCode`, {
                    initialValue: data.hexiaodanCode,
                    rules: null
                })(
                    <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                        />
                )}
                <Form.Item
                    {...formItemLayout}
                    label="到货日期"
                    >
                    {getFieldDecorator('entryDate', {
                        initialValue: data.entryDate ? moment(data.entryDate) : undefined,
                        rules: [
                            { required: true, message: '请选择到货日期' },
                        ]
                    })(
                        <DatePicker
                            {...inputItem}
                            placeholder="请选择到货日期" // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="存储类型"
                    >
                    {getFieldDecorator('storeType', {
                        initialValue: data.storeType,
                        rules: [
                            { required: false, message: '请选择存储类型' },
                        ]
                    })(
                        <Select
                            {...inputItem}
                            placeholder="请选择存储类型"
                            allowClear={true}
                            multiple={false}
                            combobox={false}
                            tags={false}
                            showSearch={false}
                            filterOption={false}
                            optionFilterProp={`children`}
                            // notFoundContent={`没有相关的司机`}
                            labelInValue={false}
                            tokenSeparators={null}>
                            <Select.Option value={1}>常温</Select.Option>
                            <Select.Option value={2}>冷藏</Select.Option>
                            <Select.Option value={3}>冷冻</Select.Option>
                            <Select.Option value={'0'}>其他</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="最高温"
                    >
                    {getFieldDecorator('maxTemp', {
                        initialValue: data.maxTemp,
                        rules: [
                            { required: false, message: '请输入存储最高温' },
                        ]
                    })(
                        <InputNumber
                            {...inputItem}
                            placeholder="请输入存储最高温"/>
                    )}℃
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="最低温"
                    >
                    {getFieldDecorator('minTemp', {
                        initialValue: data.minTemp,
                        rules: [
                            { required: false, message: '请输入存储最低温' },
                        ]
                    })(
                        <InputNumber
                            {...inputItem}
                            placeholder="请输入存储最低温"/>
                    )}℃
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="备注"
                    >
                    {getFieldDecorator('remark', {
                        initialValue: data.remark,
                        rules: [
                            { required: false, message: '请输入备注' },
                        ]
                    })(
                        <Input
                            {...inputItem}
                            type="textarea"
                            autosize={{ minRows: 2, maxRows: 6 }}
                            placeholder="请输入备注" // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
            </Form>
        )

        return (
            <ModalA
                width={650}
                confirmLoading={confirmLoading}
                title={`核销单号：${data.hexiaodanCode} 查验日期：${data.chayanDate ? moment(data.chayanDate).format("YYYY-MM-DD") : undefined}   组织机构代码：${data.corpCode}`}
                visible={visible}
                okText="保存"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                maskClosable={false}
                bodyStyle={{margin: 0}}
                bodyMinHeight={'auto'}
                {...props}
                >
                {formEle}
            </ModalA>
        )
    }
}

PutInStorageRegisterModal.propTypes = {
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

PutInStorageRegisterModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

export default Form.create()(PutInStorageRegisterModal);
