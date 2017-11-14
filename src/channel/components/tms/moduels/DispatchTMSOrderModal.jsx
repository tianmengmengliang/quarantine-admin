import React, { Component, PropTypes } from 'react';
import {Form, Upload, Input, Button, Icon, Select} from 'antd'
import {ModalA} from '../../../../components/'
import {fetch, CONFIG} from '../../../../services/'

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class DispatchTMSOrderModal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    /*
    * @interface 提交派发单
    * @param {object} _props 参数对象
    * */
    submitDispatchBill = ({values}, callback)=>{
        fetch('tms.waybill.dispatch', {
            data: {...values},
            success: (res)=>{
                callback && callback(null, res);
            },
            error: (err)=>{
                callback && callback(err, null);
            },
            beforeSend: ()=>{
                this.setState({
                    confirmLoading: true
                })
            },
            complete: (err, res)=>{
                this.setState({
                    confirmLoading: false
                })
            }
        })
    };

    onOk = ()=> {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            // console.log(values);
            // step1. 提交派发单
            this.submitDispatchBill({values}, (err, res)=>{
                // s1-case1. 派发失败
                if(err){
                    message.error('派发任务单失败');
                    return
                }

                // s1-case2. 派发成功重置表单
                this.props.callback && this.props.callback({
                    click: 'ok',
                    data: values
                });
                this.props.form.resetFields();
                this.setState(this._retInitialState())
            })
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

    /*
     * @interface 渲染Select Option组件
     * @return 返回生成的Select Option组件
     * */
     generateSelectOptions = (options)=>{
        if(options instanceof Array){
            return options.map((option, i)=>{
                return <Select.Option value={option.id} key={`${option.id}-${i}`}>{option.realName}</Select.Option>
            })
        }

        return []
    };

    render(){
        const {title, visible, data = {}, driverList = [], ...props} = this.props;
        const { getFieldDecorator } = this.props.form;

        const {confirmLoading} = this.state;

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        };

        const formEle = (
            <Form>
                {getFieldDecorator('id', {
                    initialValue: data.id
                })(
                    <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                        />
                )}
                <Form.Item
                    {...formItemLayout}
                    label="车号"
                    >
                    {getFieldDecorator('plateNumber', {
                        initialValue: data.plateNumber,
                        rules: [
                            {required: true, message: '请输入车号'}
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="司机"
                    >
                    {getFieldDecorator('driverUserId', {
                        initialValue: data.driverUserId,
                        rules: [
                            {required: true, message: '请选择司机'}
                        ]
                    })(
                        <Select
                            placeholder="请选择司机"
                            allowClear={true}
                            multiple={false}
                            combobox={false}
                            tags={false}
                            showSearch={true}
                            filterOption={(value, option)=>{
                                return option.props.children.indexOf(value) > -1
                            }}
                            optionFilterProp={`children`}
                            notFoundContent={`没有相关的司机`}
                            labelInValue={false}
                            tokenSeparators={null}>
                           {this.generateSelectOptions(driverList)}
                        </Select>
                    )}
                </Form.Item>
            </Form>
        );
        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={'派发运输单'}
                visible={visible}
                okText="确定派发"
                cancelText="取消派发"
                onOk={this.onOk}
                onCancel={this.onCancel}
                bodyHeight={200}
                width={400}
                {...props}
                >
                {formEle}
            </ModalA>
        )
    }
}

DispatchTMSOrderModal.propTypes = {
    data: PropTypes.any,
    lsName: PropTypes.string,
    driverList: PropTypes.arrayOf(PropTypes.object).isRequired,

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

DispatchTMSOrderModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

DispatchTMSOrderModal = Form.create()(DispatchTMSOrderModal);

export default DispatchTMSOrderModal;