import React, { Component, PropTypes } from 'react';
import faker from 'faker'
import {Form, Select, Input, Upload, Alert, Popconfirm, message, Spin, Icon, Modal} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {ModalA, BodyGridTable, GridTable} from '../../../../components/'
import DisplayOrderStatusModal from './DisplayOrderStatusModal.jsx'
import {fetch, CONFIG} from 'antd/../../src/services/'
import {dimsMap} from '../../helpers/'
const {custom: {level}, order: {orderType}, tms: {tempType, transportType}, inspection: {checkResult}, product: {itemTypes, countUnit, weightUnit, valueUnit}, custom: {entryExit}} = dimsMap;
import './viewCheckResultModal.less'

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

class ViewCheckResultForECIQModal extends Component{

    _retInitialState = ()=>{
        return {
            detail: [],                                     // 产品明细列表
            listPage: {                                     // 产品列表
                pageIndex: 1,
                pageSize: 99999
            },
            displayOrderStatusModal: {                      // 展示查验任务相关时间节点对话框
                visible: false,
                title: '',
                status: 'loading',
                pageIndex: 1,
                pageSize: 20,
                code: undefined,
                orderId: undefined,
                data: []
            },
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
        }
    }

    onOk = ()=> {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }

            this.props.callback && this.props.callback({
                click: 'ok',
                data: {},
                callback: ()=>{
                    this._resetAction()
                }
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
     * @interface 获取订单status
     * @param {object} 参数对象
     * @param {func} 回调函数
     * */
    getStatusList = (data, callback)=>{
        fetch('ciq.crossorderstep.list', {
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

            },
            complete: (err, data)=>{

            }
        })
    };

    /*
     * @interface 显示状态对话框
     * */
    displayStatusClick = ({data})=>{
        // step1. 展示status对话框
        this.displayStatus({status: 'loading', visible: true, ...data});

        // step2. 请求订单status列表
        this.getStatusList({id: data.orderId}, (err = {}, res = {})=>{
            // s2-case2. 如果请求失败
            if(err){
                this.displayStatus({status: 'error', visible: true ,...data, data: []})
                return;
            }

            // s2-case2. 展示status列表
            const {responseObject: {rows = []}} = res;
            this.displayStatus({status: 'success', visible: true, data: rows, ...data})
        })
    };

    /*
     * @interface 显示status对话框
     * */
    displayStatus = ({status = 'loading', data = [], visible = false, orderId =undefined, code = undefined, pageIndex =1, pageSize = 20})=>{
        this.setState(({displayOrderStatusModal})=>{
            return {
                displayOrderStatusModal: {
                    ...displayOrderStatusModal,
                    visible: visible,
                    status: status || 'loading',
                    data: data,
                    orderId,
                    code,
                    pageIndex,
                    pageSize
                }}

        });
    };

    /*
     * @interface 添加运输单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    displayStatusCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.displayStatus({status: 'loading', visible:false, data: [], ...data});
            return;
        }

        // 如果点击确定按钮，则提交表单
        if(click === 'reload'){
            this.getStatusList(data, (err, res)=>{
                // s2-case2. 如果请求失败
                if(err){
                    this.displayStatus({status: 'error', visible: true, ...data});
                    return;
                }

                // s2-case2. 展示status列表
                const {responseObject: {rows = []}} = res;
                this.displayStatus({status: 'success', visible: true, data: rows, ...data})
            });
            return;
        }
    };

    render(){
        const {prefix, title, visible, style, data = {}, ...props} = this.props;
        const {confirmLoading, displayOrderStatusModal,
            detail = [],listPage: {pageIndex, pageSize}} = this.state;

        // console.log(detail);

        const rows = [
            [
                /* {
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
                 <span onClick={this.displayStatusClick.bind(this, { data: {orderId: data.id, code: data.orderCode, pageIndex: 1, pageSize: 100 }})}>
                 <a>
                 {data.orderCode}
                 <Icon
                 style={{marginLeft: 8}}
                 type="eye-o"/>
                 </a>
                 </span>
                 )
                 }
                 },*/
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
                    title: '申请单位',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '申请单位',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.orgName}</span>
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
                {
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
                },
                {
                    key: '2-1',
                    title: '报检口岸',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '报检口岸',
                    span: 5,
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
                            <span>{transportType[data.transportType]}</span>
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
                            <span>{data.receivedDate ? moment(data.receivedDate).format('YYYY:MM:DD HH:mm:SS') : ''}</span>
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
                /* {
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
                 },*/
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
            ],
            [
                {
                    key: '3-1',
                    title: '拆解事项',
                    required: false,
                    span: 3
                },
                {
                    key: '3-2',
                    title: '拆解事项',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.noticeItem}</span>
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
                key: 'checkResult',
                name: '查验状态 ',
                width: 100,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const cls = cx({
                        [`check-result`]: true,
                        [`check-result${value}`]: true
                    });
                    return (
                        <span className={cls}>{checkResult[value] || '未查验'}</span>
                    )
                }
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
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

        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                onOk={this.onOk}
                onCancel={this.onCancel}
                maskClosable={false}
                footer={null}
                {...props}
                >
                <div className="hidden">
                    <DisplayOrderStatusModal
                        {...displayOrderStatusModal}
                        callback={this.displayStatusCallback}/>
                </div>
                <div className={`${prefix}-view-check-result-modal`}>
                    <Alert message="查验任务基本信息" type="success" style={{margin:'10px 0 0 0'}}/>
                    <BodyGridTable
                        rows={rows}
                        rowHeight={36}/>
                    <Alert message={'查验货物列表'} type="success" style={{margin:'16px 0 0 0'}}/>
                    <GridTable
                        enableCellSelect={true}
                        dataSource={detail}
                        columns={_columns}
                        // onGridRowsUpdated={this.handleGridRowsUpdated}
                        /* enableRowSelect={true}
                         rowSelection={
                                 {
                                         showCheckbox: true,
                                         enableShiftSelect: false,
                                         onRowsSelected: this.onRowsSelected,
                                         onRowsDeselected: this.onRowsDeselected,
                                         selectBy: {
                                             keys: {rowKey: 'id', values: this.state.selectedIds}
                                         }
                                 }
                         }*/
                        rowHeight={36}
                        minHeight={360}
                        // rowRenderer={RowRenderer}
                        rowScrollTimeout={0}
                        onGridSort={this.handleGridSort}
                        pagination={_pagination}
                        />
                </div>
            </ModalA>
        )
    }
}

ViewCheckResultForECIQModal.propTypes = {
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
    prefix: PropTypes.string
};

ViewCheckResultForECIQModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

export default Form.create()(ViewCheckResultForECIQModal);
