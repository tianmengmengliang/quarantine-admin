import React, { Component, PropTypes } from 'react';
import {Form, Select, Upload, Icon, Input, DatePicker,
    Popconfirm, Row, Col, Button, InputNumber} from 'antd'
import moment from 'moment'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA} from '../../../../components/'
import {dimsMap} from '../../helpers/'
import './addCheckPersonModal.less'

function noop(){}

let uuid = 0;

const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class AddCheckPersonModal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false,
            spinning: false,
            tip: '',
            checkPersons: []                            // 查验人员
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    componentWillReceiveProps(nextProps){
        // console.log(nextProps)
        const {visible} = nextProps;
        const {checkPersons: newCheckPersons} = nextProps;
        const {checkPersons: oldCheckPersons} = this.props;
        if(visible && newCheckPersons !== oldCheckPersons) {
           this.setState({
               checkPersons: newCheckPersons || []
           })
        }
    }

    /*
    * @interface 获取查验人员列表
    * */
    getCheckPersonList = (data, callback)=>{
        fetch('platform.user.listbyrolename', {
            // method: 'post',
            // headers: {},
            data: {'roleName': 'ciq_chayanyuan'},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    tip: '获取人员列表中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    tip: ''
                })
            }
        })
    }

    onOk = ()=> {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }

            let checkPersons = [];
            const keys = Object.keys(values);
            keys.forEach((key)=>{
                checkPersons.push(values[key])
            });
            this.props.callback && this.props.callback({
                click: 'ok',
                data: {
                    ...values,
                    checkPersons: checkPersons
                }
            });
            this.setState(this._retInitialState());
            this.props.form.resetFields()
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
        this.props.form.resetFields()
    };

    add = () => {
        const {checkPersons} = this.state;
        // can use data-binding to get
        const nextCheckPersons = checkPersons.concat('');

        this.setState({
            checkPersons: nextCheckPersons
        })
    }

    remove = (k) => {
        const {checkPersons = []} = this.state;
        // can use data-binding to get
        // We need at least one passenger
     /*   if (checkPersons.length === 1) {
            return;
        }*/

        checkPersons.splice(k, 1);

        // can use data-binding to set
        this.setState({
            checkPersons: [...checkPersons]
        })
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
    }

    render(){
        const {prefix, title, visible, ...props} = this.props;
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const {confirmLoading, checkPersons} = this.state;

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: { span: 20, offset: 4 },
        };

        const formItems = checkPersons.map((name, index) => {
            return (
                <Form.Item
                    {...formItemLayout}
                    label={`查验人员${index+1}`}
                    key={index}
                    >
                    {getFieldDecorator(`names-${index}`, {
                        initialValue: name,
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [
                            {
                                required: true,
                                message: `查验人员${index+1}不能为空或者你可以删除该新增项`,
                            }
                        ],
                    })(
                        <Input placeholder="请输入查验人员姓名" style={{ width: '60%', marginRight: 8 }} />
                    )}
                    <Icon
                        className="dynamic-delete-button"
                        type="minus-circle-o"
                        // disabled={checkPersons.length === 1}
                        onClick={() => this.remove(index)}
                        />
                </Form.Item>
            );
        });

        return (
            <ModalA
                className={`${prefix}-add-check-person-modal`}
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="确定添加"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                width={500}
                bodyHeight={500}
                {...props}
                >
                <Form>
                    {formItems}
                    <Form.Item {...formItemLayoutWithOutLabel}>
                        <Button
                            type="dashed"
                            onClick={this.add}
                            style={{ width: '60%' }}>
                            <Icon type="plus" /> 添加查验人员
                        </Button>
                    </Form.Item>
                </Form>
            </ModalA>
        )
    }
}

AddCheckPersonModal.propTypes = {
    checkPersons: PropTypes.Array,

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

AddCheckPersonModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

AddCheckPersonModal = Form.create()(AddCheckPersonModal);

export default AddCheckPersonModal;