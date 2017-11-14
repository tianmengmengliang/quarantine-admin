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

class Product extends Component {

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
                            label="产品等级"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Select multiple placeholder="V/W非特殊物品">
                                    <Option value="red">A</Option>
                                    <Option value="green">B</Option>
                                    <Option value="blue">C</Option>
                                    <Option value="blue">D</Option>
                                </Select>
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="ciq编码"
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
                            label="批件号"
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
                            label="产品名称"
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
                            label="产品英文名称"
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
                            label="生产厂家"
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
                            label="生产地址"
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
                            label="产品成分"
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
                            label="含有的微生物危险等级"
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
                            label="物品类别"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Select multiple placeholder="请选择">
                                    <Option value="red">A</Option>
                                    <Option value="green">B</Option>
                                    <Option value="blue">C</Option>
                                    <Option value="blue">D</Option>
                                </Select>
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="物品种类"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Select multiple placeholder="请选择">
                                    <Option value="red">A</Option>
                                    <Option value="green">B</Option>
                                    <Option value="blue">C</Option>
                                    <Option value="blue">D</Option>
                                </Select>
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="原产国"
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
                            label="用途"
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
                            label="规格"
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
                            label="产品货号"
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
                            label="备注"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Input type="textarea" placeholder="" autosize={{ minRows: 5, maxRows: 5 }} />
                                )}
                        </FormItem>
                    </Col>
                    
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="其它补充文件"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Upload name="logo" action="/upload.do" listType="picture" onChange={this.handleUpload}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> 单击上传
                                    </Button>
                                </Upload>
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="情况说明"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Upload name="logo" action="/upload.do" listType="picture" onChange={this.handleUpload}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> 单击上传
                                    </Button>
                                </Upload>
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="卫计委批文"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Upload name="logo" action="/upload.do" listType="picture" onChange={this.handleUpload}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> 单击上传
                                    </Button>
                                </Upload>
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="人类遗传资源准出境证明"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Upload name="logo" action="/upload.do" listType="picture" onChange={this.handleUpload}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> 单击上传
                                    </Button>
                                </Upload>
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="风险评估报告"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Upload name="logo" action="/upload.do" listType="picture" onChange={this.handleUpload}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> 单击上传
                                    </Button>
                                </Upload>
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="环保用微生物菌剂卫生证书"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <Upload name="logo" action="/upload.do" listType="picture" onChange={this.handleUpload}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> 单击上传
                                    </Button>
                                </Upload>
                                )}
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        );
    }
};

Product = Form.create()(Product);
export default Product;