import React, { Component, PropTypes } from 'react';
import { connect } from 'dva'
// import faker from 'faker'
import moment from 'moment'
import cx from 'classnames'
import {Form, Select, Popconfirm, message, Button} from 'antd'
import {GridTable, Block, Inline,
    ButtonContainer, AddButton, EditButton,
    DelButton, SearchButton} from '../../../components/'
import {AddReceiptAndSendModal} from '../../components/receiptAndSend/modules/'
import {dimsMap} from '../../components/helpers/'
import {fetch} from 'antd/../../src/services/'
const {rns: {type, coldChainType}} = dimsMap;

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class ReceiptAndSend extends Component{

    _retInitialState = ()=>{
        return {
            spinning: false,                            // 数据加载loading状态
            tip: '',                                    // 数据加提示文本
            selectedIds: [],                            // 已选定的行数据ids
            selectedRows: [],                           // 选中的行数据
            listQuery:{
                pageIndex: 1,
                pageSize: 10
            },
            tableLoading: false,
            listPage: {
                pageIndex: 1,
                pageSize: 10,
                rows: [],
                total: 0
            },
            addReceiptAndSendModal: {                         // 添加运输单
                visible: false,
                title: '',
                data: {}
            },
            viewTMSOrderModal: {                       // 查看运输单
                visible: false,
                title: '',
                data: {}
            },
            dispatchTMSOrderModal: {                       // 查看运输单
                visible: false,
                title: '',
                data: {}
            },
            tMSOrderDetailModal: {                      // 冷链报告
                visible: false,
                title: '',
                tempData: [],
                tempStatus: 'loading',
                geoData: {},
                geoStatus: 'loading'
            }
        }
    };

    constructor(props){
        super(props);
        this.state = this._retInitialState();
    }

    componentDidMount(){
        const {listQuery} = this.state;
        this.getReceiptAndSendList(listQuery)
    }

    /*
     * @interface 获取运输单列表
     * @param {object} oldQuery 原来的查询条件对象
     * @param {object} newQuery 新的查询条件对象
     * @return {object} 返回当前的查询条件对象
     * */
    retCurrentQuery = (oldQuery, newQuery)=>{
       return {
           ...oldQuery,
           newQuery
       }
    };

    /*
     * @interface 获取运输单列表
     * */
    getReceiptAndSendList = (query)=>{
        const {listQuery} = this.state;
        const _q = this.retCurrentQuery(listQuery, query);
        fetch('ciq.receiveandsend.list', {
            // method: 'post',
            // headers: {},
            data: Object.assign({}, _q, {type: '1'}),
            success: (res)=>{
                const {responseObject} = res;
                this.setState({
                    listPage: responseObject
                })
            },
            error: (err)=>{
                message.error(err.message);
            },
            beforeSend: ()=>{
                this.setState({
                    tableLoading: true
                })
            },
            complete: (err, data)=>{
                this.setState({
                    tableLoading: false
                })
            }
        })
    };

    /*
     * @interface 表格排序
     * @param {string} sortColumn 排序的列的key
     * @param {string} sortDirection 排序的方向
     * */
    handleGridSort(sortColumn, sortDirection) {
        const comparer = (a, b) => {
            if (sortDirection === 'ASC') {
                return (a[sortColumn] > b[sortColumn]) ? 1 : -1;
            } else if (sortDirection === 'DESC') {
                return (a[sortColumn] < b[sortColumn]) ? 1 : -1;
            }
        };

        // const rows = sortDirection === 'NONE' ? this.state.originalRows.slice(0) : this.state.rows.sort(comparer);

        // this.setState({ rows });
    };

    /*
     * @interface Grid行更新
     * */
    handleGridRowsUpdated = ({ fromRow, toRow, updated })=> {
        console.log('handleGridRowsUpdated',arguments)
        let rows = this.state.rows;

        for (let i = fromRow; i <= toRow; i++) {
            let rowToUpdate = rows[i];
            let updatedRow = React.addons.update(rowToUpdate, {$merge: updated});
            rows[i] = updatedRow;
        }

        this.setState({ rows });
    };

    /*
     * @interface 选中行接口
     * @param {Array} 选中的行
     * */
    onRowsSelected = (rows /*新增选择的行*/) =>{
        /* this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))});
         this.setState({selectedRows: this.state.selectedRows.concat(rows.map(r => r.row))});*/
        this.setState({selectedIds: rows.map(r => r.row[this.props.rowKey])});
        this.setState({selectedRows: rows.map(r => r.row)});
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
        // case1. 如果是全选操作
        if(rowIdx === -1){
            return;
        }
        // case2. 不是全选操作
        const hasSelected =  this.state.selectedRows.some((item)=>{
            return item[this.props.rowKey] === clickedRow[this.props.rowKey]
        });
        if(hasSelected){
            let rowIds = clickedRow[this.props.rowKey];
            this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.toString().indexOf(i) === -1 )});
            this.setState({selectedRows: this.state.selectedRows.filter(r => rowIds.toString().indexOf(r[this.props.rowKey]) === -1 )});
        }else{
            this.setState({selectedIds: [clickedRow[this.props.rowKey]]});
            this.setState({selectedRows: [clickedRow]});
        }
    };


    /*
     * @interface 表单查询回调
     * @param {object} values 返回的表单查询对象
     * */
    queryCallback = ({values})=>{
        // 提交表单
        const {listPage: {pageSize}} = this.state;
        this.getTMSOrderList({
            pageIndex: 1,
            pageSize,
            ...values
        })
    };

    /*
     * @interface 获取新建运输单编码
     * */
    getWayBillCode = ()=>{
        fetch('tms.waybill.buildcode', {
            // method: 'post',
            // headers: {},
            // data: {},
            success: (res)=>{
                const {responseObject} = res;
                this.showAdd({data: {code: responseObject}})
            },
            error: (err)=>{
                message.error(err.message);
            },
            beforeSend: ()=>{

            },
            complete: (err, data)=>{

            }
        })
    };

    /*
     * @interface 获取运输单货物清单
     * @param {object} props 参数
     * */
     getReceiptAndSendDetails = ({data}, callback)=>{
        fetch('ciq.receiveandsend.detail', {
            // method: 'post',
            // headers: {},
            data: {id: data.id},
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
     * @interface 判断是否只选中一行数据
     * @param {array} selectedIds 选中的行数组
     * return {boolean} 只选中一行数据返回true否则返回false
     * */
    _hasSelectedOnlyOneIdx = (selectedIds = [], nullText = undefined, moreText = undefined)=>{
        if(selectedIds.length === 0){
            // s1-case1. 没有选中任何行数据提示
            message.warn(`${nullText || '请你选择一条收出货记录'}`);
            return false
        }else if(selectedIds.length > 1 ){
            // s1-case2. 选中超过2行数据提示
            message.warn(`${moreText || '你只能选择一条收出货记录'}`);
            return false;
        }
        return true
    };

    /*
     * @interface 显示添加运输单对话框
     * */
    add = ({type, data: selectedRows = []})=>{
        if(type === 'add') {
            this.showAdd({data: {}});
        }
        if(type === 'edit'){
            if(this._hasSelectedOnlyOneIdx(selectedRows)) {
                console.log(selectedRows[0])
                this.getReceiptAndSendDetails({data: selectedRows[0]}, (err, res)=>{
                    if(err){
                        message.error(err.message);
                        return;
                    }

                    const {responseObject} = res;
                    this.showAdd({data: responseObject})
                })
            }
        }
    };

    showAdd = ({data})=>{
        this.setState(({addReceiptAndSendModal})=>{
            return {
                addReceiptAndSendModal: {
                    ...addReceiptAndSendModal,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏添加运输单对话框
     * */
    hiddenAdd = ()=>{
        this.setState(({addReceiptAndSendModal})=>{
            return {
                addReceiptAndSendModal: {
                    ...addReceiptAndSendModal,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 添加运输单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    addCallback = (info)=>{
        const {click, data, callback} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenAdd();
            callback && callback();
            return;
        }

        // 如果点击确定按钮，则提交表单
        if(click === 'ok'){
            this.hiddenAdd();
            callback && callback();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getReceiptAndSendList({pageIndex, pageSize});
            return;
        }
    };

    /*
     * @interface 显示查看运输单对话框
     * */
    viewTMSOrderClick = ({data: selectedRows})=>{
        // step1. 如果只选中一行数据，发送查验通知xhr
        if(this._hasSelectedOnlyOneIdx(selectedRows)) {
            this.getTMSOrderDetails({data: selectedRows[0]}, (err, res)=>{
                if(err){
                    message.error(`获取运输单信息失败，请稍后重试`);
                    return;
                }

                const {responseObject} = res;
                this.showViewTMSOrderModal({data: responseObject})
            })
        }
    };

    showViewTMSOrderModal = ({data})=>{
        this.setState(({viewTMSOrderModal})=>{
            return {
                viewTMSOrderModal: {
                    ...viewTMSOrderModal,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏查看运输单对话框
     * */
    hiddenViewTMSOrder = ()=>{
        this.setState(({viewTMSOrderModal})=>{
            return {
                viewTMSOrderModal: {
                    ...viewTMSOrderModal,
                    visible: false,
                    confirmLoading: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 查看运输单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    viewTMSOrderCallback = (info)=>{
        const {click, data, callback} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenViewTMSOrder()
            return;
        }
    };

    /*
     * @interface 获取用户的司机列表
     * @param {object} _props 参数对象
     * */
    getDriverListByUserRoleName = ({roleName}, callback)=>{
        fetch('platform.user.listbyrolename', {
            data: {roleName: 'ciq_driver'},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{

            },
            complete: (err, res)=>{

            }
        })
    };

    /*
     * @interface 显示派发运输单对话框
     * */
    displayDispatchTMSOrderModal = ({id})=>{
        // step1. 显示冷链报告对话框
        this.setState(({dispatchTMSOrderModal})=>{
            return {
                dispatchTMSOrderModal: {
                    ...dispatchTMSOrderModal,
                    visible: true,
                }
            }
        });
        // step2. 请求运输单设备编号和时间
        this.getDriverListByUserRoleName({}, (err, res)=>{
            // s2-case1. 请求司机列表失败
            if(err){
                message.error('请求司机列表失败');
                return;
            }
            // s2-case2. 请求司机列表成功，展现司机列表
            const {responseObject = []} = res;
            this.setState(({dispatchTMSOrderModal})=>{
                return {
                    dispatchTMSOrderModal: {
                        ...dispatchTMSOrderModal,
                        data: {id},
                        driverList: responseObject
                    }
                }
            });
        })
    };


    /*
     * @interface 隐藏派发运输单对话框
     * */
    hiddenDispatchTMSOrderModal = ()=>{
        this.setState(({dispatchTMSOrderModal})=>{
            return {
                dispatchTMSOrderModal: {
                    ...dispatchTMSOrderModal,
                    data: {},
                    driverList: [],
                    visible: false,
                }
            }
        })
    };

    /*
     * @interface 派发运输单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    dispatchTMSOrderCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenDispatchTMSOrderModal()
        }

        // 如果点击确定按钮，刷新运输单列表
        if(click === 'ok'){
            this.hiddenDispatchTMSOrderModal();
            const {listQuery} = this.state;
            this.getTMSOrderList(listQuery)
        }
    };

    /*
     * @interface 获取温度数据
     * @param {object} _props 参数对象
     * */
    getTemperature = ({deviceSn, begin, end, interval} = {}, callback = ()=>{})=>{
        fetch('tms.devicedata.listvalue', {
            data: {deviceSn, begin, end, interval},
            success: (res)=>{
                callback && callback(null, res);
            },
            error: (err)=>{
                callback && callback(err, null);
            },
            beforeSend: ()=>{
                this.setState(({tMSOrderDetailModal})=>{
                    return {
                        tMSOrderDetailModal: {
                            ...tMSOrderDetailModal,
                            tempData: [],
                            tempStatus: 'loading'
                        }
                    }
                })
            },
            complete: (err, res)=>{

            }
        })
    };

    /*
     * @interface 获取地理位置数据
     * @param {object} _props 参数对象
     * */
    getGeographic = ({deviceSn, begin, end} = {}, callback = ()=>{} )=>{
        fetch('', {
            data: {deviceSn, begin, end},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState(({tMSOrderDetailModal})=>{
                    return {
                        tMSOrderDetailModal: {
                            ...tMSOrderDetailModal,
                            geoData: [],
                            geoStatus: 'loading'
                        }
                    }
                })
            },
            complete: (err, res)=>{

            }
        })
    };

    /*
     * @interface 获取设备号开始时间结束时间
     * @param {object} _props 参数对象
     * */
    getTMSOrderDeviceSnAndTime = ({waybillId} = {}, callback = ()=>{})=>{
        fetch('tms.waybilldevice.list', {
            data: {waybillId},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{

            },
            complete: (err, res)=>{

            }
        })
    };

    /*
     * @interface 显示冷链报告对话框
     * */
    showReportModal = ({id})=>{
        // step1. 显示冷链报告对话框
        /* this.setState(({tMSOrderDetailModal})=>{
         return {
         tMSOrderDetailModal: {
         ...tMSOrderDetailModal,
         visible: true
         }
         }
         });*/
        // step2. 请求运输单设备编号和时间
        this.getTMSOrderDeviceSnAndTime({waybillId: id}, (err, res)=>{
            // s2-ss1-case1. 请求失败，设置冷链报告状态和数据
            if(err){
                this.setState(({tMSOrderDetailModal})=>{
                    return {
                        tMSOrderDetailModal: {
                            ...tMSOrderDetailModal,
                            tempData: [],
                            tempStatus: 'error',
                            geoData: [],
                            geoStatus: 'error'
                        }
                    }
                });
                return;
            }

            // s2-ss1-case2. 请求设备号和数据成功，请求温度数据和地理位置数据
            const {deviceSn, lockTime, unlockTime} = res.responseObject[0] || {};
            if(!deviceSn){
                message.error('还未绑定设备，无法查看运输单报告')
                return;
            }else if(!lockTime){
                message.error('还未开始运输，无法查看运输单报告')
                return;
            }
            this.setState(({tMSOrderDetailModal})=>{
                return {
                    tMSOrderDetailModal: {
                        ...tMSOrderDetailModal,
                        visible: true,
                        tempData: [],
                        tempStatus: 'loading',
                        geoData: [],
                        geoStatus: 'loading'
                    }
                }
            });
            this.getTemperature({deviceSn, begin: lockTime/1000, end: unlockTime ? unlockTime/1000 : undefined, interval: 1}, (err, res)=>{
                if(err){
                    this.setState(({tMSOrderDetailModal})=>{
                        return {
                            tMSOrderDetailModal: {
                                ...tMSOrderDetailModal,
                                tempData: [],
                                tempStatus: 'error'
                            }
                        }
                    });
                    return;
                }
                const {responseObject} = res;
                // console.log(responseObject);
                this.setState(({tMSOrderDetailModal})=>{
                    return {
                        tMSOrderDetailModal: {
                            ...tMSOrderDetailModal,
                            tempData: responseObject,
                            tempStatus: 'success'
                        }
                    }
                })
            });
            this.setState(({tMSOrderDetailModal})=>{
                return {
                    tMSOrderDetailModal: {
                        ...tMSOrderDetailModal,
                        geoData: {deviceSn, begin: lockTime/1000,  end: unlockTime ? unlockTime/1000 : 0},
                        geoStatus: 'success'
                    }
                }
            })
        })
    };

    /*
     * @interface 隐藏冷链报告对话框
     * */
    hiddenReportModal = ()=>{
        this.setState(({tMSOrderDetailModal})=>{
            return {
                tMSOrderDetailModal: {
                    ...tMSOrderDetailModal,
                    visible: false
                }
            }
        })
    };

    /*
     * @interface 冷链报告对话框的回调
     * @param {object} info 返回的信息对象
     * */
    reportCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenReportModal()
        }

        // 如果点击确定按钮，则提交表单
    };

    search = (r)=>{
        const {dispatch} = this.props;
        const {length, msg, selectedArray} = getArraySelectedInfo(this.state.selectedIds);
        dispatch({
            type: 'nav/changeNav',
            payload: {
                id: 'Org/viewOrgInfo',                                      // 点击动作标识符
                form: 'Org',                                                // 父组件标识符或者父组件
                data: r,                                                    // 携带数据
                actionType: 'click',                                        // 动作类型
                actionEvent: null,                                          // 事件对象
                instance: null,                                             // 当前触发实例
                cName: '查看',                                              // 事件cName
                tag: undefined,                                             // 事件标签
            }
        })
        if(length === 1){
            // 正常的查看操作操作
            console.log('search正常')
        }else if(length === 0){
            // 弹出错误提示，内容为没有选择任何项
            console.log('search0')
        }else if(length > 1){
            // 弹出错误提示，内容为选择太多项
            console.log('search2')
        }
        console.log('search', r)
    };

    /*
     * @interface 删除运输单
     * @param {object} _props 参数对象
     * */
    delTMSOrderClick = ({data: {id}})=> {
        // step1. 删除运输单
        this.delTMSOrder({id}, (err, res)=>{
            // s1-case1. 删除失败
            if(err){
                message.error(err.message);
                return;
            }

            // s1-case2. 运输单删除成功，重新渲染运输单列表
            const {listQuery} = this.state;
            this.getTMSOrderList(listQuery);
        })
    };

    /*
     * @interface 删除运输单
     * @param {object} _props 参数对象
     * */
    delTMSOrder = ({id}, callback)=>{
        fetch('tms.waybill.remove', {
            data: {id },
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    tip: '删除中...'
                })
            },
            complete: (err, res)=>{
                this.setState({
                    spinning: false,
                    tip: ''
                })
            }
        })
    };

    /*
     * @interface 显示元素
     * @param {any} expectValue 期望值
     * @param {any} realValue 实际值
     * @return {boolean} 如果期望值和实际值不相等相等则返回true否则则返回false
     * */
    hiddenEleByStatus = (expectValue, realValue)=>{
        return expectValue !== realValue
    };



    render() {
        const {prefix, ...props} =this.props;
        const {selectedIds, selectedRows, listPage: {pageIndex, pageSize, rows: dataSource, total},
            tableLoading, addReceiptAndSendModal, viewTMSOrderModal,
            tMSOrderDetailModal, dispatchTMSOrderModal} = this.state;

        const cls = cx({
            [`${prefix}-tms-order`]: true
        });

        const _pagination = {
            current: pageIndex,
            pageSize: pageSize,
            total: total,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: undefined,
            onShowSizeChange: (current, pageSize) => {
                console.log('Current: ', current, '; PageSize: ', pageSize);
            },
            onChange: (current) => {
                   const {listPage: {pageSize}} = this.state;
                this.getReceiptAndSendList({pageIndex: current, pageSize});
            }
        };

        const _columns = [
            {
                key: 'sn',
                name: '序号',
                width: 50,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                locked: true,
                formatter: ({dependentValues,rowIdx, value})=> {
                    return (
                        <span>{(pageIndex - 1) * pageSize + rowIdx + 1}</span>
                    )
                },
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'createTime',
                name: '创建时间 ',
                width: 150,
                sortable: true,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
                    )
                }
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                // formatter: IndexFormatter,
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'opTime',
                name: '收货时间 ',
                width: 150,
                sortable: true,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
                    )
                }
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                // formatter: IndexFormatter,
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'opUsers',
                name: '收货人员 ',
                width: 100,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'type',
                name: '收发货类型',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{type[value]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'waybillCode',
                name: '运单编号',
                width: 150,
                sortable: false,
                // formatter: IndexFormatter,
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'coldchainType',
                name: '冷链类型',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{coldChainType[value]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'storeLocation',
                name: '存储地点',
                width: 150,
                sortable: false,
                // formatter: IndexFormatter,
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'remark',
                name: '备注',
                width: 200,
                sortable: false,
                // formatter: IndexFormatter,
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
        ];
        return (
            <div className = {`${cls} has-no-check-box-all`} {...props}>
                <div className="hidden">
                    <AddReceiptAndSendModal
                        {...addReceiptAndSendModal}
                        callback={this.addCallback}/>
                </div>
                <ButtonContainer>
                    <AddButton onClick={this.add.bind(this, {type: 'add', data: {}})}>新建</AddButton>
                    <EditButton onClick={this.add.bind(this, {type: 'edit', data: selectedRows})}>修改</EditButton>
                    {/*<SearchButton onClick={this.viewTMSOrderClick.bind(this, {data: selectedRows})}>查看</SearchButton>*/}
                    {/*<DelButton onClick={this.batchDel}>批量删除</DelButton>*/}
                </ButtonContainer>
                <GridTable
                    tableLoading={tableLoading}
                    // enableCellSelect={true}
                    dataSource={dataSource}
                    columns={_columns}
                    onGridRowsUpdated={this.handleGridRowsUpdated}
                    enableRowSelect={true}
                    onRowClick = {this.onRowClick}
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
                        }
                    rowHeight={36}
                    minHeight={360}
                    // rowRenderer={RowRenderer}
                    rowScrollTimeout={0}
                    onGridSort={this.handleGridSort}
                    pagination={_pagination}
                    />
            </div>
        )
    }
}

ReceiptAndSend = Form.create()(ReceiptAndSend);

ReceiptAndSend.propTypes = {
    prefix: PropTypes.string,
    rowKey: Popconfirm.string,
};

ReceiptAndSend.defaultProps = {
    prefix: 'yzh',
    rowKey: 'id'
};


const mapStateToProps=({})=>{
    return {

    }
};

export default connect(mapStateToProps)(ReceiptAndSend);