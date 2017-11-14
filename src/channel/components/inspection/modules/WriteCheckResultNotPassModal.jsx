import React, { Component, PropTypes } from 'react';
import faker from 'faker'
import {Form, Select, Input, Upload, Alert, Popconfirm, message, Spin, Icon, Modal, Button} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {ModalA, BodyGridTable, GridTable, ButtonContainer} from '../../../../components/'
import {fetch, CONFIG} from 'antd/../../src/services/'

/*createRows(numberOfRows) {
 let rows = [];
 for (let i = 0; i < numberOfRows; i++) {
 rows[i] = this.createFakeRowObjectData(i);
 }
 return rows;
 }

 createFakeRowObjectData(index) {
 return {
 id: index,
 name: faker.image.avatar(),
 nameEn: faker.address.county(),
 type: faker.internet.email(),
 subType: faker.name.prefix(),
 productCount: faker.name.firstName(),
 countUnit: faker.name.lastName(),
 productWeight: faker.address.streetName(),
 weightUnit: faker.address.zipCode(),
 productValue: faker.date.past().toLocaleDateString(),
 valueUnit: faker.company.bs(),
 manufacturer: faker.company.catchPhrase(),
 country: faker.company.companyName(),
 spec: faker.lorem.words(),
 compositions: faker.lorem.sentence(),
 purpose: faker.lorem.sentence(),
 };
 }*/

function noop(){}

class WriteCheckResultNotPassModal extends Component{

    _retInitialState = ()=>{
        return {

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

    }

    /*
    * @interface 保存查验结果
    * @param {object} _props 参数对象
    * */
    saveCheckTaskResult = ({data: result}, callback)=>{
        fetch('ciq.checktask.savecheckresult', {
            // method: 'post',
            // headers: {},
            data: result,
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

            // step1. 保存查验结果
            this.saveCheckTaskResult({
                data: {
                    ...values
                }
            }, (err, res)=>{
                if(err){
                    message.error('保存查验结果失败，请稍后重试')
                    return;
                }
                this.props.callback && this.props.callback({
                    click: 'ok',
                    data: {}
                });
                this._resetAction()
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
        this._resetAction()
    };

    render(){
        const {prefix, title, visible, style, data = {}, details = [], ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {confirmLoading} = this.state;

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16}
        };

        const names = details.map((item)=>{
            return item.name
        });

        const detailIds = details.map((item)=>{
            return item.id
        });

        return (
            <ModalA
                width={500}
                confirmLoading={confirmLoading}
                title={`请输入查验不通过的原因`}
                visible={visible}
                okText={`保存`}
                cancelText={`取消`}
                onOk={this.onOk}
                onCancel={this.onCancel}
                maskClosable={false}
                bodyMinHeight={300}
                {...props}
                >
                <Form horizontal>
                    {   getFieldDecorator(`detailIds`, {
                        initialValue: detailIds.join(','),
                        rules: null
                    })(
                        <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                    {   getFieldDecorator(`checkResult`, {
                        initialValue: '2',
                        rules: null
                    })(
                        <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                    <Form.Item
                        {...formItemLayout}
                        label="产品名称"
                        >
                        {names.map((name, i)=>{
                            return (
                                <div key={i}>{name}</div>
                            )
                        })}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="查验结果"
                        >
                       <span>{names && names.length <= 1 ? '不通过' : '全部不通过'}</span>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="原因"
                        >
                        {getFieldDecorator('checkResultProblem', {
                            initialValue: data.checkResultProblem,
                            rules: false
                        })(
                            <Input
                                placeholder="请输入原因，例如：货损，疑似泄露"
                                type="textarea"
                                autosize={{ minRows: 2, maxRows: 6 }}// style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Form.Item>
                    {/*<Form.Item
                        {...formItemLayout}
                        label="建议处理方式"
                        >
                        {getFieldDecorator('transportType', {
                            initialValue: data.transportType,
                            rules: false
                        })(
                            <Select
                                placeholder="请选择运输方式"
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
                                <Select.Option value="海运">海运</Select.Option>
                                <Select.Option value="空运">空运</Select.Option>
                            </Select>
                        )}
                    </Form.Item>*/}
                    <Form.Item
                        {...formItemLayout}
                        label="建议处理方式"
                        >
                        {getFieldDecorator('address', {
                            initialValue: data.address,
                            rules: false
                        })(
                            <Input
                                placeholder="请输入建议处理方式，例如：销毁"
                                type="textarea"
                                autosize={{ minRows: 2, maxRows: 6 }}// style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Form.Item>
                </Form>
            </ModalA>
        )
    }
}

WriteCheckResultNotPassModal.propTypes = {
    data: PropTypes.any,
    details: PropTypes.array,
    rowKey: PropTypes.string,

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
    prefix: PropTypes.string
};

WriteCheckResultNotPassModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    rowKey: 'id',
    callback: noop,
};

export default Form.create()(WriteCheckResultNotPassModal);
