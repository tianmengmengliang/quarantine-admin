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

class Organization extends Component {

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
                            label="单位名称"
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
                            label="机构代码"
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
                            label="单位英文名称"
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
                            label="经营范围"
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
                            label="生物安全负责人"
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
                            label="法人代表"
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
                            labelCol={{ span: 3 }}
                            wrapperCol={{ span: 21 }}
                            label="法人代表"
                            >
                            {getFieldDecorator('字段名', {
                                rules: [
                                    { required: true, message: '出错信息' },
                                ],
                            })(
                                <CheckboxGroup options={options} />
                                )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label="单位营业执照/事业单位法人证书"
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
                            label="实验室生物安全登记证明"
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
                            label="组织机构证"
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
                            label="单位基本情况资料"
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
                            label="生物安全体系文件"
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
                            label="其他特殊说明资质"
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
                            label="拟出入境物品清单"
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
                            label="其他材料"
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
                    <Col span={24}>
                        <FormItem
                            {...lineFormItemLayout}
                            label="特殊物品类别"
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
                            label="联系人"
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
                            label="手机号码"
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
                            label="联系人QQ"
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
                            label="电子邮件"
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
                            label="监管辖区机构"
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
                            label="固定电话"
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
                            label="邮政编码"
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
                            label="传真"
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
                            label="注册地址"
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
                            label="经营地址"
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
                            label="仓储地址"
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
                            label="注册资金"
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
                            label="生产总值（万美元）"
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
                            label="经营范围"
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
                </Row>
            </Form>
        );
    }
};

Organization = Form.create()(Organization);
export default Organization;