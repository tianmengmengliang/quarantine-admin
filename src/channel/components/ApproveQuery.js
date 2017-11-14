import React, { Component, PropTypes } from 'react';
import {
    Form, Select, InputNumber, Switch, Radio, Input, Checkbox,
    Slider, Button, Upload, Icon, Row, Col, Tabs, Table
} from 'antd';
import DataGrid from '../../config/DataGrid';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;

class ApproveQuery extends Component {

    constructor(props) {
        super(props);
        this.state = {
            expand: false,
            columns: [{
                caption: '机构名称',
                key: 'name'
            }],
            operates: [
                {
                    type: 'simple',
                    text: '明细'
                }
            ]
        };
    }

    handleSearch = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            console.log('Received values of form: ', values);
        });
    }

    handleReset = () => {
        this.props.form.resetFields();
    }

    toggle = () => {
        const { expand } = this.state;
        this.setState({ expand: !expand });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 19 },
        };

        // To generate mock Form.Item
        const children = [];
        for (let i = 0; i < 10; i++) {
            children.push(
                <Col span={8} key={i}>
                    <FormItem {...formItemLayout} label={`Field ${i}`}>
                        {getFieldDecorator(`field-${i}`)(
                            <Input placeholder="placeholder" />
                        )}
                    </FormItem>
                </Col>
            );
        }

        const expand = this.state.expand;
        const shownCount = expand ? children.length : 6;

        return (
            <Form
                horizontal
                className="ant-advanced-search-form"
                onSubmit={this.handleSearch}
                >
                <Row gutter={40}>
                    {children.slice(0, shownCount)}
                </Row>
                <Row>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Button type="primary" htmlType="submit">查询</Button>
                        <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                            重置
                        </Button>
                        <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                            展开<Icon type={expand ? 'up' : 'down'} />
                        </a>
                    </Col>
                </Row>
                <Row style={{marginTop:20}}>
                    <Col span={24}>
                        <DataGrid columns={this.state.columns} operates={this.state.operates} api='customerlist'></DataGrid>
                    </Col>
                </Row>
            </Form>
        );
    }
};
ApproveQuery = Form.create()(ApproveQuery);
export default ApproveQuery;