import React, { Component, PropTypes } from 'react';
import {Form, Input, Row, Col, Icon} from 'antd'
import {SearchButton, ResetButton, ButtonContainer} from '../../../../components/'

/*
* @constructor 产品查询表单
* @extends Component
* @exports
* */
class ProductQueryForm extends Component {

    _retInitialState = ()=> {
        return {
            expand: false
        }
    };

    constructor(props) {
        super(props);
        this.state = this._retInitialState()
    }

    toggle = () => {
        const { expand } = this.state;
        this.setState({ expand: !expand });
    }


    /*
     * @interface 表单提交给上层组件
     * @param {object} 事件对象
     * */
    handleSubmit = (e)=> {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) {
                console.log('form has err', err)
                return;
            }

            console.log('form has values', values)
        });
    };

    /*
     * @interface 重置表单域
     * @param {array | undefined} fieldsName 表单域的name
     * */
    resetFields = (fieldsName)=> {
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

        const formItemItemColProps = {
            span: 24
        };

        const formEle = (
            <Form inline>
                <Form.Item
                    {...formItemLayout}
                    label="审核状态"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input1', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="ciq编码状态"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input2', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ]
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="是否冻结"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input3', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="产品等级"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input4', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="ciq编码"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input5', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="单位"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input6', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="真实姓名"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input7', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="产品名称"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input8', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="产品英文名称"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input9', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="物品类别"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input10', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="物品种类"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input11', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="药监局批文证号"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input12', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="药监局批文证号"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input13', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="产品货号(范围查询)"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input14', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="产品货号"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input15', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="生产厂家"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input16', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="录入时间"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="签发时间"
                    hasFeedback
                    >
                    <Col {...formItemItemColProps}>
                        {getFieldDecorator('input17', {
                            rules: [
                                {required: true, message: 'Please select your country!'},
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Col>

                </Form.Item>
            </Form>);
        const shownCount = expand ? formEle.props.children.length : 12;
        return (
            <Row {...props}>
                <Form inline>
                    {formEle.props.children.slice(0, shownCount)}
                </Form>
                <Row>
                    <ButtonContainer span={24} style={{ textAlign: 'right' }}>
                        <SearchButton onClick={this.handleSubmit}/>
                        <ResetButton onClick={this.resetFields}/>
                        <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                            Collapse <Icon type={expand ? 'up' : 'down'}/>
                        </a>
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