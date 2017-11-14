import React, { Component, PropTypes } from 'react';
import {Form, Input} from 'antd'
import {BodyGridTable} from '../../../../components/'

const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

function noop(){}

class OrgBasicInfoForm extends Component{

    _retInitialState = ()=>{
        return {

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

    render(){
        const {title, visible, confirmLoading} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {dataSource} = this.state;
        const _pagination = {
            current: 1,
            pageSize: 10,
            total: 100,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: undefined,
            onShowSizeChange: (current, pageSize) => {
                console.log('Current: ', current, '; PageSize: ', pageSize);
            },
            onChange: (current) => {
                console.log('Current: ', current);
            }
        };

        const {pageSize, current} = _pagination;

        const rows = [
            [
                {
                    key: '1-1',
                    title: '单位名称',
                    span: 6
                },
                {
                    key: '1-2',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '机构代码',
                    span: 6
                },
                {
                    key: '1-4',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input2', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                }
            ],
            [
                {
                    key: '2-1',
                    title: '单位性质',
                    span: 6
                },
                {
                    key: '2-2',
                    title: '单位地址',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input3', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                }
            ],
            [
                {
                    key: '3-1',
                    title: '单位地址',
                    span: 6
                },
                {
                    key: '3-2',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input4', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                },
                {
                    key: '3-3',
                    title: '联系人',
                    span: 6
                },
                {
                    key: '3-4',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input5', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                }
            ],
            [
                {
                    key: '4-1',
                    title: 'E-mail',
                    span: 6
                },
                {
                    key: '4-2',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input6', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                },
                {
                    key: '4-3',
                    title: '联系电话',
                    span: 6
                },
                {
                    key: '4-4',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input7', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                }
            ]
        ];
        return (
                <BodyGridTable rows={rows}/>
        )
    }
}

OrgBasicInfoForm.propTypes = {
    prefix: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired
};

OrgBasicInfoForm.defaultProps = {
    prefix: 'yzh',
    visible: false
};

export default Form.create()(OrgBasicInfoForm);
