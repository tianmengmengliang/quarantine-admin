import React, { Component, PropTypes } from 'react';
import {Form, Input, Row, Icon, Select} from 'antd'
import {SearchButton, ResetButton, ButtonContainer} from '../../../../components/'

class VerificationCertQueryForm extends Component{

    _retInitialState = ()=>{
        return {
            expand: false
        }
    };

    constructor(props){
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
        const {expand} = this.state;
        const formItemLayout = {
            style: {display: 'inline-block'}
        };
        const formEle = (
            <Form
                inline>
                <Form.Item
                    {...formItemLayout}
                    label="X检卫特殊准字"
                    colon={false}>
                    {getFieldDecorator('input1', {
                        rules: false
                    })(
                        <Input style={{width: 50}}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="]第"
                    colon={false}
                    hasFeedback
                    >
                    {getFieldDecorator('input2', {
                        rules: false
                    })(
                        <Input style={{width: 50}}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="号——"
                    colon={false}
                    hasFeedback
                    >
                    {getFieldDecorator('input3', {
                        rules: false
                    })(
                        <Input style={{width: 50}}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    labelCol={{span: 6}}
                    wrapperCol={{span: 18}}
                    label="核销状态"
                    colon={false}
                    hasFeedback
                    >
                    {getFieldDecorator('input4', {
                        rules: false
                    })(
                        <Select style={{width: 200}} placeholder="Please select a country">
                            <Select.Option value="china">China</Select.Option>
                            <Select.Option value="use">U.S.A</Select.Option>
                        </Select>
                    )}
                </Form.Item>
            </Form>
        );
        const shownCount = expand ? formEle.props.children.length : 12;
        return (
            <Row {...props}>
                {formEle}
                <Row>
                    <ButtonContainer span={24} style={{ textAlign: 'right', margin: 0}}>
                        <SearchButton onClick={this.handleSubmit}/>
                        <ResetButton onClick={this.resetFields}/>
                    </ButtonContainer>
                </Row>
            </Row>
        )
    }
}

VerificationCertQueryForm.propTypes = {
    callback: PropTypes.func
};

VerificationCertQueryForm.defaultProps = {

};

VerificationCertQueryForm = Form.create()(VerificationCertQueryForm);

export default VerificationCertQueryForm