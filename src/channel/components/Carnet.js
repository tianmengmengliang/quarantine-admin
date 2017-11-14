import React, { Component, PropTypes } from 'react';
import {
    Form, Select, InputNumber, Switch, Radio, Input, Checkbox,
    Slider, Button, Upload, Icon, Row, Col
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

class Carnet extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };
        const lineFormItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 17 },
        };

        const options = [
            { label: '生产', value: 'Apple' },
            { label: '销售', value: 'Pear' },
            { label: '科研', value: 'Orange' },
            { label: '医疗', value: 'Orange2' },
            { label: '检验', value: 'Orange3' },
            { label: '医药研发外包', value: 'Orange4' },
        ];


        return (
            <Form horizontal onSubmit={this.handleSubmit}>
                <Row gutter={40}>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="收货人"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="发货人"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="合同/提(运)单号">
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="输出国家或地区"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={24}>
                        <FormItem
                            {...lineFormItemLayout}
                            label="标记及号码"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="运输工具名称及号码"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="目的地"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="集装箱规格及数量"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="货物名称及规格"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="H.S.编码"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="申报总值"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="数/重量、包装数量及种类"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input />
                                )}
                        </FormItem>
                    </Col>
                    
                </Row>
            </Form>
        );
    }
};

Carnet = Form.create()(Carnet);
export default Carnet;