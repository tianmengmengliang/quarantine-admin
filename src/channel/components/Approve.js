import React, { Component, PropTypes } from 'react';
import {
    Form, Select, InputNumber, Switch, Radio, Input, Checkbox,
    Slider, Button, Upload, Icon, Row, Col, Tabs,Table
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;

class Approve extends Component {

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

        const columns = [{
            title: '产品名称',
            dataIndex: 'name',
            key: 'name',
            render: text => <a href="#">{text}</a>,
        }, {
            title: '产品英文名称',
            dataIndex: 'age',
            key: 'age',
        }, {
            title: '产品等级',
            dataIndex: 'address',
            key: 'address',
        }, {
            title: '物品类别',
            dataIndex: 'age',
            key: 'age',
        }, {
            title: '物品种类',
            dataIndex: 'age',
            key: 'age',
        }, {
            title: 'ciq编码',
            dataIndex: 'age',
            key: 'age',
        },{
            title: '规格',
            dataIndex: 'age',
            key: 'age',
        },{
            title: '货号',
            dataIndex: 'age',
            key: 'age',
        },{
            title: '批件号',
            dataIndex: 'age',
            key: 'age',
        },{
            title: '货号',
            dataIndex: 'age',
            key: 'age',
        },{
            title: '原产国',
            dataIndex: 'age',
            key: 'age',
        }, {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <span>
                    <a href="#">删除</a>
                    <span className="ant-divider" />
                    <a href="#">查看</a>
                    <span className="ant-divider" />
                </span>
            ),
        }];

        const data = [];


        return (
            <Form horizontal onSubmit={this.handleSubmit}>
                <Row gutter={40}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="申请单位基本信息" key="1">
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
                                    label="单位性质"
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
                                    label="单位性质"
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
                                    label="单位地址"
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
                                    label="E-mail"
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
                                    label="联系电话"
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
                        </TabPane>
                    </Tabs>
                </Row>
                <Row gutter={40}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="出入境情况" key="1">
                            <Col span={24}>
                                <FormItem
                                    {...lineFormItemLayout}
                                    label="出入境方式"
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
                                    label="存储条件"
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
                                    label="运输方式"
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
                                    label="入境存放,使用地点及其地址"
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
                                    label="相关材料"
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
                                    label="拆检注意事项"
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
                                    label="是否分批核销"
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
                                    label="输入/输出国"
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
                        </TabPane>
                    </Tabs>
                </Row>
                <Row gutter={40}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="特殊物品信息" key="1">
                            <Table columns={columns} dataSource={data} />
                        </TabPane>
                    </Tabs>
                </Row>
            </Form>
        );
    }
};

Approve = Form.create()(Approve);
export default Approve;