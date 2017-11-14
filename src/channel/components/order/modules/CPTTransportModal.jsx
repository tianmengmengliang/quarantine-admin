import React, { Component, PropTypes } from 'react';
import {Form, Select, Icon, Input, InputNumber, Alert, Upload} from 'antd'
import cx from 'classnames'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable} from '../../../../components/'
import pdfUrl from 'antd/../../public/assets/img/pdf.png'
import {CONFIG, fetch} from '../../../../services/'

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class CPTTransportModal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false,                              // 对话框loading状态
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
    cptTransport = (data = {}, callback = ()=>{})=>{
        fetch('ciq.crossorderstep.completewaybillone', {
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

            this.cptTransport(values, (err, res)=> {
                // case1. 表单验证不通过
                if(err){
                    // s2-ss1-case1. 提交订单失败
                    const key = `open${Date.now()}`;
                    notification.error({
                        message: '运输单提交失败',
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

    render(){
        const {prefix, title, visible, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;

        const {confirmLoading} = this.state;

        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={`请完善运输单单号`}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                width={500}
                bodyHeight={200}
                {...props}
                >
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
                        label="运输单单号"
                        >
                        {getFieldDecorator('billCode', {
                            initialValue: data.billCode,
                            rules: [
                                {required: true, message: '运输单单号为必填项'}
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Form.Item>
                </Form>
            </ModalA>
        )
    }
}

CPTTransportModal.propTypes = {
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

CPTTransportModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

CPTTransportModal = Form.create()(CPTTransportModal);

export default CPTTransportModal;