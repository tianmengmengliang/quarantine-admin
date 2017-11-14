import React, { Component, PropTypes } from 'react';
import {Form, Input, Row, Icon} from 'antd'
import {SearchButton, ResetButton, ButtonContainer} from '../../../../components/'

class ProductQueryForm extends Component{

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
            labelCol: {span: 10},
            wrapperCol: {span: 14},
            style: {width: '25%', margin:'4px 0 4px 0'}
        };
        const formEle = (
            <Form>
                <Form.Item
                    {...formItemLayout}
                    label="产品名称"
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
                    label="产品等级"
                    hasFeedback
                    >
                    {getFieldDecorator('input2', {
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
                    label="物品类别"
                    hasFeedback
                    >
                    {getFieldDecorator('input3', {
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
                    label="物品种类"
                    hasFeedback
                    >
                    {getFieldDecorator('input4', {
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
                    label="ciq编码"
                    hasFeedback
                    >
                    {getFieldDecorator('input5', {
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
                    label="货号"
                    hasFeedback
                    >
                    {getFieldDecorator('input6', {
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
                    label="批件号"
                    hasFeedback
                    >
                    {getFieldDecorator('input7', {
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
                    label="货号(范围查询)"
                    hasFeedback
                    >
                    {getFieldDecorator('input8', {
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
                    label="原产国"
                    hasFeedback
                    >
                    {getFieldDecorator('input9', {
                        rules: [
                            {required: true, message: 'Please select your country!'},
                        ]
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
            </Form>
        );
        const shownCount = expand ? formEle.props.children.length : 12;
        return (
            <Row {...props}>
                <Form inline>
                    {formEle.props.children.slice(0, shownCount)}
                </Form>
                <Row>
                    <ButtonContainer span={24} style={{ textAlign: 'right', margin:0 }}>
                        <SearchButton onClick={this.handleSubmit}/>
                        <ResetButton onClick={this.resetFields}/>
                        {formEle.props.children.length > 12 ?
                            <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                                Collapse <Icon type={expand ? 'up' : 'down'}/>
                            </a>
                            : undefined}
                    </ButtonContainer>
                </Row>
            </Row>
        )
    }
}

ProductQueryForm.propTypes = {
    callback: PropTypes.func
};

ProductQueryForm.defaultProps = {

};

ProductQueryForm = Form.create()(ProductQueryForm);

export default ProductQueryForm