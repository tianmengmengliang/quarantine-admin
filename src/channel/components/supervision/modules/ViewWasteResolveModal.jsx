import React, { Component, PropTypes } from 'react';
// import faker from 'faker'
import {Form, Select, Input, Radio, Alert, Popconfirm, message, Spin, Icon, Modal, Collapse, DatePicker} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {ModalA, BodyGridTable, GridTable} from '../../../../components/'
import {fetch, CONFIG} from 'antd/../../src/services/'

function noop(){}

/**
 *    查看废弃液处理的对话框。
 * */
class ViewWasteResolveModal extends Component{

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
     * @interface 保存废弃液处理
     * */
    saveWasteResolve = (data, callback)=>{
        fetch('ciq.uselog.wastedeal', {
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
    }

    onOk = ()=> {
        this.props.callback && this.props.callback({
            click: 'ok',
            data: this.props.data || {}
        });
        /* return new Promise((resolve, reject) => {
         setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
         }).catch(() => console.log('Oops errors!'));*/
    };

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: this.props.data
        });
    };

    render(){
        const {prefix, title, visible, style, data: {record = {}, _pRecord = {}, info = {}}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {confirmLoading} = this.state;


        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 16},
        };
        const formEle = (
            <Form horizontal>
                {   getFieldDecorator(`id`, {
                    initialValue: _pRecord.id,
                    rules: null
                })(
                    <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                        />
                )}
                <Form.Item
                    {...formItemLayout}
                    label="废弃液处理时间"
                    >
                    <span>{info.wasteDealTime ? moment(info.wasteDealTime).format("YYYY-MM-DD HH:mm:SS") : info.wasteDealTime}</span>
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="废液处理人"
                    >
                    <span>{info.wasteDealPeople}</span>
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="废液处理方式"
                    >
                    <span>{info.wasteDealWay}</span>
                </Form.Item>
            </Form>
        )

        return (
            <ModalA
                width={600}
                confirmLoading={confirmLoading}
                title={<div><div style={{marginRight: 8}}>核销单号：{_pRecord.hexiaodanCode}</div> <div style={{marginRight: 8}}>品名：{_pRecord.name}</div>  <div>批次：{_pRecord.batch}</div></div>}
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

ViewWasteResolveModal.propTypes = {
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

ViewWasteResolveModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

export default Form.create()(ViewWasteResolveModal);
