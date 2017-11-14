import React, { Component, PropTypes } from 'react';
import faker from 'faker'
import {Form, Select, Input, Radio, Alert, Popconfirm, message, Spin, Icon, Modal, Collapse, DatePicker} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {ModalA, BodyGridTable, GridTable} from '../../../../components/'
import AddCheckPersonModal from './AddCheckPersonModal.jsx'
import {fetch, CONFIG} from 'antd/../../src/services/'
import {dimsMap} from '../../helpers/'
import './addCheckTaskModal.less'
const {custom: {level}, order: {orderType}, tms: {tempType}, product: {itemTypes, countUnit, weightUnit, valueUnit}, custom: {entryExit}} = dimsMap;

/*createRows(numberOfRows) {
 let rows = [];
 for (let i = 0; i < numberOfRows; i++) {
 rows[i] = this.createFakeRowObjectData(i);
 }
 return rows;
 }

 createFakeRowObjectData(index) {
 return {
 id: index,
 name: faker.image.avatar(),
 nameEn: faker.address.county(),
 type: faker.internet.email(),
 subType: faker.name.prefix(),
 productCount: faker.name.firstName(),
 countUnit: faker.name.lastName(),
 productWeight: faker.address.streetName(),
 weightUnit: faker.address.zipCode(),
 productValue: faker.date.past().toLocaleDateString(),
 valueUnit: faker.company.bs(),
 manufacturer: faker.company.catchPhrase(),
 country: faker.company.companyName(),
 spec: faker.lorem.words(),
 compositions: faker.lorem.sentence(),
 purpose: faker.lorem.sentence(),
 };
 }*/

function noop(){}

class AddCheckTaskModal extends Component{

    _retInitialState = ()=>{
        return {
            activePane: {
                '1': true,
                '2': true
            },                                          // 当前激活的tab面板
            checkType: undefined,                       // 当前查验类型
            checkPersons: [],                           // 查验人员列表
            tableHeight: 360,                           // 当前table的高度
            showCheckbox: true,                        // 是否显示checkbox
            detail: [],                                 // 产品明细列表
            selectedIds: [],                            // 选中的行id
            selectedRows: [],                           // 选中的行数据
            listPage: {                                 // 产品列表
                pageIndex: 1,
                pageSize: 99999
            },
            addCheckPersonModal: {                      // 添加查验人员对话框
                visible: false,
                title: '',
                checkPersons: []
            }
        }
    };

    /*
     * @interface 重置state和UI
     * */
    _resetAction = ()=>{
        // step1、重置state
        this.setState(this._retInitialState());
        // step2、重置表单
        this.props.form.resetFields();
    };

    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    componentWillReceiveProps(nextProps){
        const {data: newData, visible} = nextProps;
        const {data: oldData} = this.props;
        if(visible && newData !== oldData){
            // case1.. 规则化数据
            const {details = []} = newData;
            this.setState({
                detail: [...details],
            })

            // step1. 获取查验人员列表
            this.getCheckPersons({}, (err, res)=>{
                if(err){
                    return;
                }

                const {responseObject = []} = res;
                this.setState({
                    checkPersons: responseObject
                })
            })
        }
    }

    /*
     * @interface 获取订单相关的报检单号和核销单号
     * @param {object} _props 参数对象
     * */
    getCheckPersons = ({}, callback)=>{
        fetch('platform.user.listbyrolename', {
            // method: 'post',
            // headers: {},
            data: {'roleName': 'ciq_chayanyuan'},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{

            },
            complete: (err, data)=>{

            }
        })
    };

    /*
     * @interface 选中行接口
     * @param {Array} 选中的行
     * */
    onRowsSelected = (rows /*新增选择的行*/) =>{
         this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))});
         this.setState({selectedRows: this.state.selectedRows.concat(rows.map(r => r.row))});
    /*    this.setState({selectedIds: rows.map(r => r.row[this.props.rowKey])});
        this.setState({selectedRows: rows.map(r => r.row)});*/
    };

    /*
     * @interface 取消选中行接口
     * @param {Array} 取消选中的行
     * */
    onRowsDeselected = (rows /*取消选择的行*/) =>{
        let rowIds = rows.map(r =>  r.row[this.props.rowKey]);
        this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 )});
        this.setState({selectedRows: this.state.selectedRows.filter(r => rowIds.indexOf(r[this.props.rowKey]) === -1 )});
    };

    onRowClick = (rowIdx, clickedRow)=>{
        if(rowIdx === -1){
            return;
        }else{
            const hasSelected = this.state.selectedRows.some((item)=> {
                return item[this.props.rowKey] === clickedRow[this.props.rowKey]
            });
            if (hasSelected) {
                let rowIds = clickedRow[this.props.rowKey];
                this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.toString().indexOf(i) === -1)});
                this.setState({selectedRows: this.state.selectedRows.filter(r => rowIds.toString().indexOf(r[this.props.rowKey]) === -1)});
            } else {
                this.setState({selectedIds: this.state.selectedIds.concat(clickedRow[this.props.rowKey])});
                this.setState({selectedRows: this.state.selectedRows.concat([clickedRow])});
            }
        }
    };

    /*
     * @interface 保存查验任务/通知
     * @param {object} _props 参数对象
     * */
    confirmCheckTask = ({data}, callback)=>{
        fetch('ciq.checktask.confirmtask', {
            // method: 'post',
            // headers: {},
            data: data,
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    confirmLoading: true
                })
            },
            complete: (err, data)=>{
                this.setState({
                    confirmLoading: false
                })
            }
        })
    };

    onOk = ()=> {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }

            const {id, checkType, planTime} = values;
            const {selectedIds} = this.state;
            let params = {};
            if(checkType === '1' || checkType === '2'){
                params = {
                    ...values,
                    id,
                    checkType,
                    planTime: planTime ? planTime.unix() * 1000 : undefined,
                    checkDetailIds: selectedIds.join(',')
                }
            }
            if(checkType === '3'){
                params = {
                    ...values,
                    id,
                    checkType,
                    planTime: undefined,
                    checkDetailIds: '',
                }
            }

            console.log(params);
            this.confirmCheckTask({data: params}, (err, res)=>{
                if(err){
                    message.error('创建查验任务失败');
                    return;
                }

                this.props.callback && this.props.callback({
                    click: 'ok',
                    data: {},
                    callback: ()=>{
                        this._resetAction();
                    }
                });
            });
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
        this._resetAction()
    };

    /*
    * @interface collapse1显示状态
    * @param {array} key 当前collapse1展开的pane的key
    * */
    onChange1 = (key = [])=>{
        if(key && key.length === 0){
            this.setState(({activePane})=>{
                return {
                    activePane: {
                        ...activePane,
                        "1": false
                    },
                    tableHeight: 540
                }
            })
        }else{
            this.setState(({activePane})=>{
                return {
                    activePane: {
                        ...activePane,
                        "1": true
                    },
                    tableHeight: 360
                }
            })
        }
    };

    /*
     * @interface collapse2显示状态
     * @param {array} key 当前collapse2展开的pane的key
     * */
    onChange2 = (key = [])=>{
        if(key && key.length === 0){
            this.setState(({activePane})=>{
                return {
                    activePane: {
                        ...activePane,
                        "1": true
                    },
                    tableHeight: 360
                }
            })
        }else{
            this.setState(({activePane})=>{
                return {
                    activePane: {
                        ...activePane,
                        "1": false
                    },
                    tableHeight: 540
                }
            })
        }
    };

    /*
    * @interface radioButton单选按钮改变时的回调
    * @param {object} e 事件对象
    * */
    changeRadioButton = (e)=>{
        this.setState({
            checkType: e.target.value
        })
    };

    /*
     * @interface 显示添加货物对话框
     * */
     addCheckPersonClick = (checkPersons = [])=>{
         this.showAddCheckPersonModal(checkPersons)
    };

    /*
     * @interface 隐藏添加货物对话框
     * */
    showAddCheckPersonModal = (checkPersons = [])=>{
        this.setState(({addCheckPersonModal})=>{
            return {
                addCheckPersonModal: {
                    ...addCheckPersonModal,
                    visible: true,
                    checkPersons: checkPersons
                }
            }
        })
    };

    hiddenAddCheckPerson = ()=>{
        this.setState(({addCheckPersonModal})=>{
            return {
                addCheckPersonModal: {
                    ...addCheckPersonModal,
                    visible: false,
                    checkPersons: []
                }
            }
        })
    };

    /*
     * @interface 添加货物对话框的回调
     * @param {object} info 返回的信息对象
     * */
    addCheckPersonCallback = (info)=>{
        const {click, data = {checkPersons: []}} = info;
        // case1. 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenAddCheckPerson()
        }

        // case2. 如果点击确定按钮，则刷新货物列表
        if(click === 'ok'){
            this.hiddenAddCheckPerson();
            this.setState({
                checkPersons: data.checkPersons
            })
        }
    };

    /*
     * @interface 渲染Select Option组件
     * @return 返回生成的Select Option组件
     * */
    _renderSelectOption = (options)=>{
        if(options instanceof Array){
            return options.map((option, i)=>{
                return <Select.Option value={option.id} key={`${option.id}`}>{option.realName}</Select.Option>
            })
        }

        return []
    };

    render(){
        const {prefix, title, visible, style, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {confirmLoading, activePane, tableHeight, showCheckbox,
            checkType, checkPersons, selectedIds, selectedRows,
            detail = [],listPage: {pageIndex, pageSize},
            addCheckPersonModal} = this.state;

        // console.log(detail);
        const customPaneStyle = {
            border: '1px solid #cfefdf',
            marginBottom: 16
        };

        const rows = [
            [
                {
                    key: '1-1',
                    title: '订单编号',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '订单编号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.orderCode}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '报检单号',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '报检单号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.eciqCode}</span>
                        )
                    }
                },
                {
                    key: '1-5',
                    title: '核销单号',
                    span: 3
                },
                {
                    key: '1-6',
                    title: '核销单号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.writeOffBillCode}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-1',
                    title: '申请单位',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '申请单位',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.applyOrgName}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '发货单位',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '发货单位',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.sender}</span>
                        )
                    }
                },
                {
                    key: '2-1',
                    title: '收货单位',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '收货单位',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.receiver}</span>
                        )
                    }
                },
            ],
            [
                {
                    key: '1-1',
                    title: '出/入境类型',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '出/入境类型',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{entryExit[data['exitEntryType']]}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '贸易国家',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '贸易国家',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.country}</span>
                        )
                    }
                },
                {
                    key: '2-1',
                    title: '出/入境口岸',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '出/入境口岸',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.entryPort}</span>
                        )
                    }
                },
            ],
            [
               /* {
                    key: '1-1',
                    title: '起运口岸',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '起运口岸',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.exitPort}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '停经口岸',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '停经口岸',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.viaPort}</span>
                        )
                    }
                },*/
                {
                    key: '2-1',
                    title: '报检口岸',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '报检口岸',
                    span: 13,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.checkPort}</span>
                        )
                    }
                },
            ],
            [
                {
                    key: '1-1',
                    title: '运输方式',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '运输方式',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.transportType}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '温度要求',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '温度要求',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{tempType[data.tempType]}</span>
                        )
                    }
                },
                {
                    key: '2-1',
                    title: '特殊物品级别',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '特殊物品级别',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{level[data.level]}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-1',
                    title: '到货日期',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '到货日期',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.receivedDate ? moment(data.receivedDate).format('YYYY:MM:DD HH:MM:SS') : ''}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '合同号',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '合同号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.contractNo}</span>
                        )
                    }
                },
                {
                    key: '2-1',
                    title: '提单号',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '提单号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.ladingBillCode}</span>
                        )
                    }
                },
            ],
            [
                {
                    key: '1-1',
                    title: '存放、使用地点',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '存放、使用地点',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.address}</span>
                        )
                    }
                }
            ]
        ];

        const _pagination = {
            current: pageIndex,
            pageSize: pageSize,
            total: detail.length,
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

        const _columns = [
            {
                key: 'sn',
                name: '序号',
                width: 100,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                locked: true,
                formatter: ({dependentValues,rowIdx, column})=> {
                    return (
                        <span>{(pageIndex - 1) * pageSize + rowIdx + 1}</span>
                    )
                }
            },
            {
                key: 'name',
                name: '中文名称 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                editable: true,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'nameEn',
                name: '英文名称 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                // editable: true,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'type',
                name: '物品类别 ',
                width: 200,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{itemTypes[value] && itemTypes[value]['title']}</span>
                    )
                },
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                // editable: true,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'subType',
                name: '物品种类 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues: {type},rowIdx, value, column})=> {
                    return (
                        <span>{ itemTypes[type] &&
                        itemTypes[type]['itemTypes'][value] &&
                        itemTypes[type]['itemTypes'][value]}</span>
                    )
                },
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'productCount',
                name: '数量 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'countUnit',
                name: '数量单位 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{countUnit[value]}</span>
                    )
                },
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'productWeight',
                name: '重量 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'weightUnit',
                name: '重量单位 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{weightUnit[value]}</span>
                    )
                },
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'productValue',
                name: '货值 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'valueUnit',
                name: '货值单位 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{valueUnit[value]}</span>
                    )
                },
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'manufacturer',
                name: '生产厂家 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'country',
                name: '原产国 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'spec',
                name: '规则 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'compositions',
                name: '成分列表 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'purpose',
                name: '用途 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            }
        ];

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 },
        };

        const formEle = (
            <Form horizontal>
                {   getFieldDecorator(`id`, {
                    initialValue: data.id,
                    rules: null
                })(
                    <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                        />
                )}
                <Form.Item
                    {...formItemLayout}
                    label={<span>请选择查验方式</span>}
                    >
                    {getFieldDecorator('checkType', {
                        initialValue: data.checkType,
                        rules: [
                            {required: true, message: '请选择查验类型'}
                        ]
                    })(
                        <Radio.Group onChange={this.changeRadioButton}>
                            <Radio.Button value="1">远程查验</Radio.Button>
                            <Radio.Button value="2">现场查验</Radio.Button>
                            {/*<Radio.Button value="3">不查验</Radio.Button>*/}
                        </Radio.Group>
                    )}
                    {checkType === undefined ?
                        <span style={{marginLeft: 8}}>
                         (<Icon
                             style={{color: '#ffa832', marginRight: 8, fontSize: 14}}
                             type="info-circle"/>
                    请先选择查验方式，在进行后续的操作)
                    </span> :
                        (checkType === "1" || checkType === '2') && selectedRows.length === 0 ?
                        <span style={{marginLeft: 8, color: 'red'}}>
                         (<Icon
                            style={{marginRight: 8, fontSize: 14}}
                            type="info-circle"/>
                    请选择需要查验的货物)
                    </span> : ''}
                </Form.Item>
                {
                    (checkType === '1' || checkType === '2') ?
                    <Form.Item
                        {...formItemLayout}
                        label="计划查验时间"
                        >
                        {getFieldDecorator('planTime', {
                            initialValue: !data.planTime ? data.planTime : moment(data.planTime),
                            rules: [
                                {required: true, message: '请选择计划查验时间'}
                            ]
                        })(
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                style={{width: 200}}/>
                        )}
                    </Form.Item> :
                    undefined
                }
                {
                   /* (checkType === '1' || checkType === '2') ?
                        <Form.Item
                            {...formItemLayout}
                            label="查验人员列表"
                            >
                            {getFieldDecorator('checkPersonelUserId', {
                                initialValue: data.checkPersonelUserId,
                                rules: [
                                    {required: true, message: '请选择查验人员'}
                                ]
                            })(
                                <Select
                                    combobox={false}
                                    placeholder=""
                                    notFoundContent=""
                                    style={{width: 200}}
                                    defaultActiveFirstOption={false}
                                    showArrow={true}
                                    filterOption={false}
                                    // onChange={this.selectChange}
                                    >
                                    {this._renderSelectOption(checkPersons)}
                                </Select>
                            )}
                            {/!* @deprecated 填写查验人员列表*!/}
                           {/!*<span>
                               <span style={{marginRight: 8}}>{(checkPersons && checkPersons.length > 0) ? checkPersons.join(',') : '无'}</span>
                                <Icon
                                    onClick={this.addCheckPersonClick.bind(this, checkPersons)}
                                    title="添加查验人员"
                                    style={{marginRight: 8}}
                                    className="dynamic-button dynamic-add-button"
                                    type="edit"
                                    />
                           </span>*!/}
                        </Form.Item> :
                        undefined*/
                }
            </Form>
        )

        return (
            <ModalA
                width={1200}
                confirmLoading={confirmLoading}
                title={`创建查验任务`}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                maskClosable={false}
                bodyStyle={{margin: 0}}
                {...props}
                >
                <div className="hidden">
                    <AddCheckPersonModal
                        {...addCheckPersonModal}
                        callback={this.addCheckPersonCallback}/>
                </div>
                <div className={`${prefix}-add-check-task-modal`}>
                    <Collapse
                        bordered={false}
                        activeKey={activePane['1'] ? ['1'] : []}
                        onChange={this.onChange1}
                        >
                        <Collapse.Panel
                            header={
                                <span>
                                    <Icon
                                    type="info-circle"
                                    style={{marginRight: 8, fontSize: 16, color: '#f8bd35'}}/>
                                    查验通知单基本信息
                                </span>
                            }
                            style={customPaneStyle}
                            key="1">
                            <BodyGridTable
                                rows={rows}
                                rowHeight={36}/>
                        </Collapse.Panel>
                    </Collapse>
                    {formEle}
                    {checkType && (checkType === '1' || checkType === '2') ?
                    <Collapse
                        bordered={false}
                        activeKey={activePane['2'] ? ['2'] : []}
                        onChange={this.onChange2}
                        >
                        <Collapse.Panel
                            header={
                            <span>
                                        <Icon
                                            type="file-text"
                                            style={{marginRight: 8,  fontSize: 16, color: '#f8bd35'}}/>
                                        查验货物列表
                                    </span>
                            }
                            style={customPaneStyle}
                            key="2" >
                            <GridTable
                            enableCellSelect={true}
                            dataSource={detail}
                            columns={_columns}
                            // onGridRowsUpdated={this.handleGridRowsUpdated}
                            enableRowSelect={showCheckbox}
                            onRowClick = {this.onRowClick}
                            rowSelection={
                            showCheckbox ?
                            {
                                showCheckbox: {true},
                                enableShiftSelect: false,
                                onRowsSelected: this.onRowsSelected,
                                onRowsDeselected: this.onRowsDeselected,
                                selectBy: {
                                    keys: {rowKey: 'id', values: this.state.selectedIds}
                                }
                            }
                                :
                                undefined
                            }
                            rowHeight={36}
                            minHeight={tableHeight}
                            // rowRenderer={RowRenderer}
                            rowScrollTimeout={0}
                            onGridSort={this.handleGridSort}
                            pagination={_pagination}
                            />
                        </Collapse.Panel>
                    </Collapse> :
                        undefined
                    }
                </div>
            </ModalA>
        )
    }
}

AddCheckTaskModal.propTypes = {
    data: PropTypes.any,
    checkPersons: PropTypes.array,
    rowKey: Popconfirm.string,


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

AddCheckTaskModal.defaultProps = {
    prefix: 'yzh',
    rowKey: 'id',
    checkPersons: [],
    visible: false,
    callback: noop,
};

export default Form.create()(AddCheckTaskModal);
