import React, { Component, PropTypes } from 'react';
import {Form, Input} from 'antd'
import {SearchButton, ResetButton, ButtonContainer} from '../../../../components/'

class OrgQueryForm extends Component{

    _retInitialState = ()=>{
        return {
            confirmLoading: false,
        }
    };

    constructor(props) {
        super(props);
        this.state = this._retInitialState()
    }


    /*
    * @interface 表单提交给上层组件
    * @param {object} 事件对象
    * */
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) {
                console.log('form has err', err)
                return ;
            }

            console.log('form has values', values)
        });
    };

    /*
    * @interface 重置表单域
    * @param {array | undefined} fieldsName 表单域的name
    * */
    resetFields = (fieldsName)=>{
        e.preventDefault();
        this.props.form.resetFields(fieldsName)
    };

    render(){
        const {...props} =this.props;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };
        return (
            <Form inline>
                <Form.Item
                    label="单位名称"
                    hasFeedback
                    >
                    {getFieldDecorator('input', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                         />
                    )}
                </Form.Item>
                <Form.Item
                    label="机构代码"
                    hasFeedback
                    >
                    {getFieldDecorator('input', {
                        rules: [
                            { required: true, message: 'Please select your country!' },
                        ],
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>

                <Form.Item>
                    <ButtonContainer type="form">
                        <SearchButton onClick={this.handleSubmit} />
                        <ResetButton onClick={this.resetFields} />
                    </ButtonContainer>
                </Form.Item>
            </Form>
        )
    }
}

OrgQueryForm.propTypes = {
    callback: PropTypes.func
};

OrgQueryForm.defaultProps = {

};

OrgQueryForm = Form.create()(OrgQueryForm);

export default OrgQueryForm