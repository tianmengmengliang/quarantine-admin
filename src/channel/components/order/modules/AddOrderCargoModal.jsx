import React, { Component, PropTypes } from 'react';
import {Form, Select, Icon, Input, InputNumber, Alert} from 'antd'
import cx from 'classnames'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable} from '../../../../components/'
import {metaData as cargoTypes} from '../../product/'
const itemTypes = cargoTypes.itemTypes;
const weightUnit = cargoTypes.weightUnit;
const countUnit = cargoTypes.countUnit;
const valueUnit = cargoTypes.valueUnit;
import './addOrderCargoModal.less'

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class AddOrderCargoModal extends Component{
    _retInitialState = ()=>{
        return {
            tempData: {                                     // 从props中copy来的数据
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
        const {data: newData = {}, visible} = nextProps;
        const {data: oldData = {}} = this.props;
        if(visible && newData !== oldData){
            // step1. state初始化
            const {type, subType} = newData;
            this.setState({
                tempData: {
                    type,
                    subType
                }
            })
        }
    }

    /*
     * @interface 表单提交给上层组件
     * @param {object} 事件对象
     * */

    onOk = ()=> {
        this.props.form.validateFields((err, values) => {
            if (err) {
                console.log('form has err', err)
                return ;
            }

            // step1. 将数据提交给上层子组件
            this.props.callback && this.props.callback({
                click: 'ok',
                data: values
            });
            // step2. 重置state
            this.setState(this._retInitialState());
            // step3. 重置表单
            this.props.form.resetFields();
        });
       /* return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));*/
    };

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        });
        this.props.form.resetFields();
    };

    /*
     * @interface 物品类别select选择项发生改变的回调
     * @param {any} value 当前选中项的值
     * */
    selectCategoryChange =(value)=> {
        const {tempData} = this.state;
        this.state.tempData = {
            ...tempData,
            type: value,
            subType: undefined
        };
    };

    /*
     * @interface 物品种类select选择项发生改变的回调
     * @param {any} value 当前选中项的值
     * */
    selectKindChange =(value)=> {
        const {tempData} = this.state;
        this.state.tempData = {
            ...tempData,
            subType: value
        }
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
        const {prefix, title, visible, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {tempData: {type}} = this.state;

        const cls = cx({
            [`${prefix}-add-order-cargo-modal`]: true
        });

        const rows2 = [
            [
                {
                    key: '1-1',
                    title: '产品名称',
                    span: 6
                },
                {
                    key: '1-2',
                    title: '产品名称',
                    span: 6,
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
                },
                {
                    key: '1-3',
                    title: '产品英文名称',
                    span: 6
                },
                {
                    key: '1-4',
                    title: '产品英文名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('nameEn', {
                                    initialValue: data.nameEn,
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
                    title: '物品类别',
                    span: 6
                },
                {
                    key: '2-2',
                    title: '物品类别',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('type', {
                                    initialValue: data.type,
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
                                        onChange={this.selectCategoryChange}>
                                        {this._renderSelectOption(itemTypes)}
                                    </Select>
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    key: '2-3',
                    title: '物品种类',
                    span: 6
                },
                {
                    key: '2-4',
                    title: '物品种类',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('subType', {
                                    initialValue: data.subType,
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
                                        onChange={this.selectKindChange}
                                        >
                                        {this._renderSelectOption(this._getSelectOptionsMetaData(type, 'value', itemTypes)['itemTypes'])}
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
                    title: '原产国',
                    span: 6
                },
                {
                    key: '6-2',
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
                    key: '6-3',
                    title: '规格',
                    span: 6
                },
                {
                    key: '6-4',
                    title: '规格',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('spec', {
                                    initialValue: data.spec,
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
                    key: '7-1',
                    title: '成分列表',
                    span: 6
                },
                {
                    key: '7-2',
                    title: '成分列表',
                    span: 6,
                    formatter: (gridMetaData)=> {
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('compositions', {
                                    initialValue: data.compositions,
                                    rules: false
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    },
                },
                {
                    key: '7-3',
                    title: '用途',
                    span: 6
                },
                {
                    key: '7-4',
                    title: '用途',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('purpose', {
                                    initialValue: data.purpose,
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
                    key: '8-1',
                    title: '生产厂家',
                    span: 6
                },
                {
                    key: '2-4',
                    title: '生产厂家',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                >
                                {getFieldDecorator('manufacturer', {
                                    initialValue: data.manufacturer,
                                    rules: false
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ]
        ];

        const wrapperColStyle = {
            width: 200
        };
        return (
            <ModalA
                // confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                width={900}
                {...props}
                >
                <div className={cls}>
                    <Alert message="订单货物填写" type="success" style={{margin:'16px 0 0 0'}}/>
                    <Form honrizontal>
                        <Form.Item
                            >
                            {getFieldDecorator('_rowIdx', {
                                initialValue: data._rowIdx,
                                rules: false
                            })(
                                <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )}
                        </Form.Item>
                        <Form.Item
                            >
                            {getFieldDecorator('crossOrderId', {
                                initialValue: data.crossOrderId,
                                rules: false
                            })(
                                <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )}
                        </Form.Item>
                        <BodyGridTable rows={rows2}/>
                    </Form>
                </div>
            </ModalA>
        )
    }
}

AddOrderCargoModal.propTypes = {
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

AddOrderCargoModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

AddOrderCargoModal = Form.create()(AddOrderCargoModal);

export default AddOrderCargoModal;