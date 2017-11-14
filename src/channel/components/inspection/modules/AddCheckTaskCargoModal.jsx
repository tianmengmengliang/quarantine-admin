import React, { Component, PropTypes } from 'react';
import {Form, Select, Icon, Input, InputNumber, Alert} from 'antd'
import cx from 'classnames'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable} from '../../../../components/'
import {metaData as cargoTypes} from '../../product/'
const itemTypes = cargoTypes.itemTypes;
const weightUnit = cargoTypes.weightUnit;
const countUnit = cargoTypes.countUnit;
const valueUnit = cargoTypes.valueUnit;
import './addCheckTaskCargoModal.less'

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class AddCheckTaskCargoModal extends Component{
    _retInitialState = ()=>{
        return {
            isCopyData: false,                          // 指定props数据是否copy到state
            data: {                                     // 从props中copy来的数据
                type: undefined,
                subType: undefined
            }
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    componentWillReceiveProps(nextProps){
        const {visible, data} = nextProps;
        const {isCopyData} = this.state;
        if(visible){
            // 可见
            if(!isCopyData){
                this.setState({
                    data: {
                        ...data
                    },
                    isCopyData: true
                })
            }
        }else{
            // 重置state
            this._retInitialState()
        }
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

    onOk = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        });
        return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
    };

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        })
    };

    /*
     * @interface 物品类别select选择项发生改变的回调
     * @param {any} value 当前选中项的值
     * */
    selectChange =(value)=> {
        // console.log(value);
        this.setState(({data})=>{
            return {
                data: {
                    ...data,
                    type: value,
                    subType: undefined
                }
            }
        });
        this.props.form.setFieldsValue({type: value, subType: undefined})
    };

    /*
     * @interface 物品种类select选择项发生改变的回调
     * @param {any} value 当前选中项的值
     * */
    selectChange2 =(value)=> {
        // console.log(value);
        this.setState(({data})=>{
            return {
                data: {
                    ...data,
                    subtype: value
                }
            }
        });
        this.props.form.setFieldsValue({subType: value})
    };

    /*
     * @interface 获取当前Select option选中项的元数据
     * @param {number | string} value 当前选中项的值
     * @param {string} valueKey 当前Select Option 的valuePropName
     * @param {array} optionsMetaData 当前Select Option的元数据
     * @return 返回当前选中项或者undefined
     * */
    _getSelectOptionsMetaData = (value, valueKey = 'value', optionsMetaData = [])=>{
        let metaData;
        optionsMetaData.some((option)=>{
            const hasFind = option[valueKey] === value;
            if(hasFind){
                metaData = option
            }

            return hasFind
        });

        return metaData || {}
    };

    /*
     * @interface 渲染Select Option组件
     * @return 返回生成的Select Option组件
     * */
    _renderSelectOption = (options)=>{
        if(options instanceof Array){
            return options.map((option, i)=>{
                return <Select.Option value={option.value} key={`${option.value}-${i}`}>{option.title}</Select.Option>
            })
        }

        return []
    };

    render(){
        const {prefix, title, visible, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {data: {type}, data} = this.state;

        const cls = cx({
            [`${prefix}-add-order-cargo-modal`]: true
        });

        const rows2 = [
            [
                {
                    key: '1-1',
                    title: '货物名称(中/外文)',
                    span: 6
                },
                {
                    key: '1-2',
                    title: '货物名称(中/外文)',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('name', {
                                    initialValue: data.name,
                                    rules: false
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    key: '2-1',
                    title: 'H.S.编码',
                    span: 6
                },
                {
                    key: '2-2',
                    title: '原产国',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('country', {
                                    initialValue: data.country,
                                    rules: false
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    key: '2-3',
                    title: '原产国',
                    span: 6
                },
                {
                    key: '2-4',
                    title: '原产国',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('countUnit', {
                                    initialValue: data.countUnit,
                                    rules: false
                                })(
                                    <Select
                                        combobox={false}
                                        placeholder=""
                                        notFoundContent=""
                                        style={{}}
                                        defaultActiveFirstOption={false}
                                        showArrow={true}
                                        filterOption={false}
                                        // onChange={this.selectChange}
                                        >
                                        {this._renderSelectOption(countUnit)}
                                    </Select>
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    key: '3-1',
                    title: '数量',
                    span: 6
                },
                {
                    key: '3-2',
                    title: '数量',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('productCount', {
                                    initialValue: data.productCount,
                                    rules: false
                                })(
                                    <InputNumber min={1} style={wrapperColStyle}/>
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    key: '3-3',
                    title: '数量单位',
                    span: 6
                },
                {
                    key: '3-4',
                    title: '数量单位',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('countUnit', {
                                    initialValue: data.countUnit,
                                    rules: false
                                })(
                                    <Select
                                        combobox={false}
                                        placeholder=""
                                        notFoundContent=""
                                        style={{}}
                                        defaultActiveFirstOption={false}
                                        showArrow={true}
                                        filterOption={false}
                                        // onChange={this.selectChange}
                                        >
                                        {this._renderSelectOption(countUnit)}
                                    </Select>
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    key: '4-1',
                    title: '重量',
                    span: 6
                },
                {
                    key: '4-2',
                    title: '重量',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('productWeight', {
                                    initialValue: data.productWeight,
                                    rules: false
                                })(
                                    <InputNumber min={1} style={wrapperColStyle}/>
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    key: '4-3',
                    title: '重量单位',
                    span: 6
                },
                {
                    key: '4-4',
                    title: '重量单位',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('weightUnit', {
                                    initialValue: data.weightUnit,
                                    rules: false
                                })(
                                    <Select
                                        combobox={false}
                                        placeholder=""
                                        notFoundContent=""
                                        style={{}}
                                        defaultActiveFirstOption={false}
                                        showArrow={true}
                                        filterOption={false}
                                        // onChange={this.selectChange}
                                        >
                                        {this._renderSelectOption(weightUnit)}
                                    </Select>
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    key: '5-1',
                    title: '货值',
                    span: 6
                },
                {
                    key: '5-2',
                    title: '货值',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('productValue', {
                                    initialValue: data.productValue,
                                    rules: false
                                })(
                                    <InputNumber min={1} style={wrapperColStyle}/>
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    key: '5-3',
                    title: '货值单位',
                    span: 6
                },
                {
                    key: '5-4',
                    title: '货值单位',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('valueUnit', {
                                    initialValue: data.valueUnit,
                                    rules: false
                                })(
                                    <Select
                                        combobox={false}
                                        placeholder=""
                                        notFoundContent=""
                                        style={{}}
                                        defaultActiveFirstOption={false}
                                        showArrow={true}
                                        filterOption={false}
                                        // onChange={this.selectChange}
                                        >
                                        {this._renderSelectOption(valueUnit)}
                                    </Select>
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    key: '6-1',
                    title: '包装数量',
                    span: 6
                },
                {
                    key: '6-2',
                    title: '数量',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('productCount', {
                                    initialValue: data.productCount,
                                    rules: false
                                })(
                                    <InputNumber min={1} style={wrapperColStyle}/>
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    key: '6-3',
                    title: '包装种类',
                    span: 6
                },
                {
                    key: '6-4',
                    title: '包装种类',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('countUnit', {
                                    initialValue: data.countUnit,
                                    rules: false
                                })(
                                    <Select
                                        combobox={false}
                                        placeholder=""
                                        notFoundContent=""
                                        style={{}}
                                        defaultActiveFirstOption={false}
                                        showArrow={true}
                                        filterOption={false}
                                        // onChange={this.selectChange}
                                        >
                                        {this._renderSelectOption(countUnit)}
                                    </Select>
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
        ];

        const wrapperColStyle = {
            width: 200
        };
        return (
            <ModalA
                // confirmLoading={confirmLoading}
                title={title}
                visible={true}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                width={900}
                bodyHeight={500}
                {...props}
                >
                <div className={cls}>
                    <Alert message="订单货物填写" type="success" style={{margin:'16px 0 0 0'}}/>
                    <Form honrizontal>
                        <BodyGridTable rows={rows2}/>
                    </Form>
                </div>
            </ModalA>
        )
    }
}

AddCheckTaskCargoModal.propTypes = {
    data: PropTypes.any,
    visible: PropTypes.bool.isRequired,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    confirmLoading: PropTypes.bool,

    footer: PropTypes.any,
    maskClosable: PropTypes.bool,
    closable: PropTypes.bool,
    afterClose: PropTypes.func,
    style: PropTypes.object,
    width: PropTypes.any,
    prefix: PropTypes.string.isRequired
};

AddCheckTaskCargoModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

AddCheckTaskCargoModal = Form.create()(AddCheckTaskCargoModal);

export default AddCheckTaskCargoModal;