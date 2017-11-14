import React, { Component, PropTypes } from 'react';
import {Form, Select, Input, Switch} from 'antd'
import {ModalA} from '../../../../components/'

function noop(){}

class SetProductAccountModal extends Component{

    _retInitialState = ()=>{
        return {
            confirmLoading: false,
        }
    };

    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    onOk = ()=> {
        return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
    };

    onCancel = ()=> {

    };

    render(){
        const {title, visible, confirmLoading, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
            style: {width: 230}
        };
        const formEle = (
            <Form inline>
                <Form.Item
                    {...formItemLayout}
                    label="使用单位/生产商"
                    hasFeedback
                    >
                    {getFieldDecorator('select', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ],
                    })(
                        <Select placeholder="Please select a country">
                            <Option value="china">China</Option>
                            <Option value="use">U.S.A</Option>
                        </Select>
                    )}
                </Form.Item>
                <div className="gutter-vertical"></div>
                <Form.Item
                    {...formItemLayout}
                    label="数量"
                    hasFeedback
                    >
                    {getFieldDecorator('input1', {
                        rules: [
                            {required: true, message: 'Please select your country!'},
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="净重"
                    hasFeedback
                    >
                    {getFieldDecorator('input1', {
                        rules: [
                            {required: true, message: 'Please select your country!'},
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="货值"
                    hasFeedback
                    >
                    {getFieldDecorator('input1', {
                        rules: [
                            {required: true, message: 'Please select your country!'},
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    style={{width: 200}}
                    label=""
                    hasFeedback
                    >
                    <span>是否无限量:</span><Switch checkedChildren={'无限量'} unCheckedChildren={'否'} />
                </Form.Item>
                <div className="gutter-vertical"></div>
                <Form.Item
                    {...formItemLayout}
                    label="数量单位"
                    hasFeedback
                    >
                    {getFieldDecorator('select', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ],
                    })(
                        <Select placeholder="Please select a country">
                            <Option value="china">China</Option>
                            <Option value="use">U.S.A</Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="重量单位"
                    hasFeedback
                    >
                    {getFieldDecorator('select', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ],
                    })(
                        <Select placeholder="Please select a country">
                            <Option value="china">China</Option>
                            <Option value="use">U.S.A</Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="货值单位"
                    hasFeedback
                    >
                    {getFieldDecorator('select', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ],
                    })(
                        <Select placeholder="Please select a country">
                            <Option value="china">China</Option>
                            <Option value="use">U.S.A</Option>
                        </Select>
                    )}
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
                hasDefaultStyle={false}
                bodyHeight={200}
                {...props}>
                {formEle}
            </ModalA>
        )
    }
}

SetProductAccountModal.propTypes = {
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

SetProductAccountModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

export default Form.create()(SetProductAccountModal);
