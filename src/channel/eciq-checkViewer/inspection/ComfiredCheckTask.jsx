import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import faker from 'faker'
import { connect } from 'dva'
import moment from 'moment'
import cx from 'classnames'
import {Form, Select, Popconfirm, message, Input, Spin, Modal, notification, Button, Icon, Upload} from 'antd'
import {GridTable, Block, Inline,
    ButtonContainer, AddButton,
    DelButton, UploadButton, EditButton, SearchButton} from '../../../components/'
import {ViewCheckTaskForECIQModal, WriteCheckResultModal} from '../../components/inspection/modules/'
import {authPropTypesWrapper, getArraySelectedInfo, isQueryChanged} from '../../components/helpers/'
import {dimsMap} from '../../components/helpers/'
import {fetch, CONFIG} from 'antd/../../src/services/'
const {custom: {level}, inspection: {ciqCheckViewer: {unConfirmedTask: taskDimMap}}} = dimsMap;

function createRows(numberOfRows) {
    let rows = [];
    for (let i = 0; i < numberOfRows; i++) {
        rows[i] = createFakeRowObjectData(i);
    }
    return rows;
}
function createFakeRowObjectData(index) {
    return {
        id: index,
        createTime: faker.image.avatar(),
        exitWay: faker.address.county(),
        companyName2: faker.internet.email(),
        contact: faker.name.prefix(),
        mobile: faker.name.firstName(),
        applyBillCode: faker.name.lastName(),
        applyBillFile: faker.address.streetName(),
        status: faker.address.zipCode(),
        date: faker.date.past().toLocaleDateString(),
        bs: faker.company.bs(),
        catchPhrase: faker.company.catchPhrase(),
        companyName: faker.company.companyName(),
        words: faker.lorem.words(),
        sentence: faker.lorem.sentence()
    };
}

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class CheckTask extends Component{

    _retInitialState = ()=>{
        return {
            spinning: false,                                    // 页面加载数据loading状态
            tip: '',                                            // 页面加载数据loading状态文字
            selectedIds: [],                                    // 已选定的行数据ids
            selectedRows: [],                                   // 选中的行数据
            tableLoading: false,
            listPage: {
                pageIndex: 1,
                pageSize: 10,
                rows: [],
                total: 0
            },
            viewCheckTask: {                                    // 查看通知明细详情对话框
                title: '',
                visible: false,
                data: {}
            },
            writeCheckResultModal: {                           // 填写查验结果对话框
                title: '',
                visible: false,
                details: [],
                data: {}
            },
        }

    };

    constructor(props){
        super(props);
        this.state = this._retInitialState();
    }

    componentDidMount(){
        const {listPage: {pageIndex, pageSize}} = this.state;
        this.getCheckTaskList({pageIndex, pageSize});
    }

    /*
     * @interface 重置行选择数据
     * */
    resetSelectedRowsNIds = ()=>{
        this.setState({
            selectedIds: [],
            selectedRows: []
        })
    };

    /*
     * 获取订单列表的所有查询条件
     * @param {object} pageQuery 分页查询对象
     * @return {object} 列表所有查询条件参数对象
     * */
    _getAllListQuery = (pageQuery = {})=>{
        // step1 获取所有查询参数
        let _f = {
            status: '3,4',
            userId: JSON.parse(localStorage.getItem(CONFIG.lsNames.platform.User_Roles)).id
        };
        /*this.OrderQueryForm.validateFields((err, values)=>{
         _f = values
         });*/
        return {
            ..._f,
            ...pageQuery
        }
    };

    /*
     * @interface 获取订单列表
     * */
    getCheckTaskList = (query)=>{
        // step1. 获取查询阐参数
        const _q = this._getAllListQuery(query);
        // console.log(_q);
        // step2. 请求列表数据
        fetch('ciq.checktask.list', {
            // method: 'post',
            // headers: {},
            data: _q,
            success: (res)=>{
                const {responseObject: listPage} = res;
                this.setState({
                    listPage
                })
            },
            error: (err)=>{
                // step1.
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

    /*/!*
     * @interface Grid行更新
     * *!/
     handleGridRowsUpdated = ({ fromRow, toRow, updated })=> {
     console.log('handleGridRowsUpdated',arguments)
     let rows = this.state.rows;

     for (let i = fromRow; i <= toRow; i++) {
     let rowToUpdate = rows[i];
     let updatedRow = React.addons.update(rowToUpdate, {$merge: updated});
     rows[i] = updatedRow;
     }

     this.setState({ rows });
     };*/

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
            // case2-case1. 采用赋值，如果是只能选中一行采用赋值，如果是合并选中行，采用concat方法来合并操作
            this.setState({selectedIds: [clickedRow[this.props.rowKey]]});
            this.setState({selectedRows: [clickedRow]});
        }
    };

    /*
     * @interface 表单查询回调
     * @param {object} values 返回的表单查询对象
     * */
    queryCallback = ()=>{
        const {listPage: {pageSize}} = this.state;
        this.getOrderList({pageIndex: 1, pageSize})
    };

    /*
     * @interface 判断是否只选中一行数据
     * @param {array} selectedIds 选中的行数组
     * return {boolean} 只选中一行数据返回true否则返回false
     * */
    _hasSelectedOnlyOneIdx = (selectedIds = [], nullText = undefined, moreText = undefined)=>{
        if(selectedIds.length === 0){
            // s1-case1. 没有选中任何行数据提示
            message.warn(`${nullText || '请你选择一条查验任务，再进行操作'}`);
            return false
        }else if(selectedIds.length > 1 ){
            // s1-case2. 选中超过2行数据提示
            message.warn(`${moreText || '你只能选择一条查验任务'}`);
            return false;
        }
        return true
    };

    /*
     * @interface 获取查验任务的货物列表
     * @param {object} _props 参数对象
     * @param {func} 回调函数
     * */
    getCheckTaskDetails = ({data}, callback)=>{
        fetch('ciq.checktask.taskdetail', {
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
                this.setState({
                    spinning: true,
                    tip: '获取查验任务产品列表中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    tip: ''
                })
            }
        })
    }

    /*
     * @interface 显示添加订单对话框
     * @param {string} type 操作类型
     * @param {array} 选中的行数据
     * */
    writeCheckResultClick = ({ data: selectedRows = []})=>{
        const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
        if (hasSelectedOnlyOneIdx) {
            // s1-case1. 只选中一行并且订单状态为未提交
            let isStatusLess5 = selectedRows[0]['status'] < 5;
            if (isStatusLess5) {
                this.getCheckTaskDetails({data: selectedRows[0]}, (err, res = {})=> {
                    if (err) {
                        // case1. 请求通知明细失败
                        message.error('获取通知明细失败');
                    } else {
                        // case2. 请求通知明细成功，显示对话框
                        const {responseObject} = res;
                        this.showWriteCheckResultModal({
                            data: responseObject,
                            details: (responseObject && responseObject.details) || []
                        })
                    }
                })
            }else{
                // s1-case2. 只选中一行并且订单状态为其他状态
                message.error('该查验任务已经完结，无法填写查验结果');
            }
        }else{
            return;
        }
    };

    showWriteCheckResultModal = ({data, details})=>{
        this.setState(({writeCheckResultModal})=>{
            return {
                writeCheckResultModal: {
                    ...writeCheckResultModal,
                    visible: true,
                    details: details,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏填写查验结果对话框
     * */
    hiddenWriteCheckResult = ()=>{
        this.setState(({writeCheckResultModal})=>{
            return {
                writeCheckResultModal: {
                    ...writeCheckResultModal,
                    visible: false,
                    details: [],
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 填写查验结果对话框的回调
     * @param {object} info 返回的信息对象
     * */
    writeResultCallback = (info)=>{
        const {click, data, callback} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.resetSelectedRowsNIds();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getCheckTaskList({pageIndex, pageSize});
            this.hiddenWriteCheckResult();
            callback && callback();
            return;
        }

        // 如果点击确定按钮，则提交表单
        if(click === 'ok'){
            this.resetSelectedRowsNIds();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getCheckTaskList({pageIndex, pageSize})
            this.hiddenWriteCheckResult();
            callback && callback();
            return;
        }
    };

    /*
     * @interface 发送查验通知
     * @param {object} _props 订单对象参数
     * */
    sendCheckNotificationClick = ({data: selectedRows})=>{
        // step1. 如果只选中一行数据，发送查验通知xhr
        const nullText = `请先选择一条查验通知`
        if(this._hasSelectedOnlyOneIdx(selectedRows, nullText)) {
            let isStatus0 = selectedRows[0]['status'] === 0;
            Modal.confirm({
                width: 415,
                title: <span>{isStatus0 ? `你确定要发送该通知吗？` :
                    <span>
                                该通知已经发送过，你确定再次发送吗？
                            </span>}
                        </span>,
                content: '',
                okText: `${isStatus0 ? '确定' : '再次'}发送`,
                cancelText: '稍后发送',
                iconType: 'exclamation-circle',
                maskClosable: false,
                onOk: ()=> {
                    this.sendCheckNotification({id: selectedRows[0]['id']}, (err, res)=> {
                        if (err) {
                            // s2-ss1-case1. 提交订单失败
                            const key = `open${Date.now()}`;
                            notification.error({
                                message: '发送通知失败',
                                description: `原因：${err.message || '未知'}`,
                                key,
                                onClose: noop,
                            });
                            return;
                        }

                        // s2-ss1-case2. 重置selectedIds和重新渲染订单列表
                        /* this.setState({
                         selectedIds: [],
                         selectedRows: []
                         });*/
                        this.resetSelectedRowsNIds()
                        const {listPage: {pageIndex, pageSize}} = this.state;
                        this.getCheckNotificationList({pageIndex, pageSize})
                    })
                },
                onCancel: noop
            });
        }
    };

    /*
     * @interface 发送查验通知
     * @param {object} 选中的行对象参数
     * @param {func} 回调函数
     * */
    sendCheckNotification = (selectedId = {}, callback = ()=>{})=>{
        fetch('ciq.checktask.sendnotice', {
            // method: 'post',
            // headers: {},
            data: selectedId,
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    title: '发送通知中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    title: ''
                })
            }
        })
    };

    /*
     * @interface 查验任务明细xhr
     * @param {object} 选中的行对象参数
     * @param {func} 回调函数
     * */
    viewCheckTask = (selectedId = {}, callback = ()=>{})=>{
        fetch('ciq.checktask.detail', {
            // method: 'post',
            // headers: {},
            data: selectedId,
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    title: '获取数据中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    title: ''
                })
            }
        })
    };

    /*
     * @interface 查看查验任务明细
     * @param {object} _props 订单对象参数
     * */
    viewCheckTaskClick = ({data: selectedRows})=>{
        // step1. 如果只选中一行数据，发送查验通知xhr
        if(this._hasSelectedOnlyOneIdx(selectedRows)) {
            this.viewCheckTask({id: selectedRows[0]['id']}, (err, res)=> {
                if (err) {
                    // s2-ss1-case1. 提交订单失败
                    message.error(`获取查验任务信息失败，请稍后重试`);
                    return;
                }
                const {responseObject = {}} = res;
                this.showViewCheckTaskModal({data: responseObject})
            })
        }
    };

    /*
     * @interface 显示查看任务信息对话框
     * @param {_props} _props 信息对象
     * */
    showViewCheckTaskModal = ({data})=>{
        this.setState(({viewCheckTask})=>{
            return {
                viewCheckTask: {
                    ...viewCheckTask,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏查看任务明细信息对话框
     * */
    hiddenViewCheckTask = ()=>{
        this.setState(({viewCheckTask})=>{
            return {
                viewCheckTask: {
                    ...viewCheckTask,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 查看查验任务信息的回调
     * @param {object} info 返回的信息对象
     * */
    viewCheckTaskCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenViewCheckTask();
            return;
        }
    };

    /*
     * @interface 创建查验任务
     * @param {object} _props 订单对象参数
     * */
    addCheckTaskClick = ({data: selectedRows})=>{
        // step1. 如果只选中一行数据，发送查验通知xhr
        if(this._hasSelectedOnlyOneIdx(selectedRows)) {
            this.getCheckNotificationDetails({data : {id: selectedRows[0]['id']}}, (err, res)=> {
                if (err) {
                    // s2-ss1-case1. 提交订单失败
                    message.error(`获取查验通知信息失败，请稍后重试`);
                    return;
                }
                const {responseObject = {}} = res;
                this.showAddCheckTaskModal({data: responseObject})
            })
        }
    };

    /*
     * @interface 显示查看通知信息对话框
     * @param {_props} _props 信息对象
     * */
    showAddCheckTaskModal = ({data})=>{
        this.setState(({addCheckTaskModal})=>{
            return {
                addCheckTaskModal: {
                    ...addCheckTaskModal,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏查看通知明细信息对话框
     * */
    hiddenCheckTask = ()=>{
        this.setState(({addCheckTaskModal})=>{
            return {
                addCheckTaskModal: {
                    ...addCheckTaskModal,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 查验查验通知明细信息的回调
     * @param {object} info 返回的信息对象
     * */
    addCheckTaskCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenCheckTask();
            return;
        }

        if(click === 'ok'){
            this.hiddenCheckTask();
            return;
        }
    };

    /*
     * @interface 删除一条通知记录
     * @param {object} 删除的订单记录对象
     * */
    delOrderClick = ({data: selectedRows = []})=>{
        // step1. 判断是否只选中一行数据
        const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
        if (hasSelectedOnlyOneIdx) {
            // s1-case1. 只选中一条订单并且订单的状态为未提交status 0
            let isStatus0 = selectedRows[0]['status'] === 0;
            if (isStatus0) {
                Modal.confirm({
                    width: 416,
                    iconType: 'exclamation-circle',
                    title: '',
                    content: '你确定要删除该通知吗？',
                    okText: '确认删除',
                    cancelText: '我再想想',
                    maskClosable: false,
                    onOk: ()=> {
                        return new Promise((resolve, reject) => {
                            this.delOrder({data: selectedRows[0]}, (err, res = {})=> {
                                resolve();
                                if (err) {
                                    // case1. 请求订单明细失败
                                    message.error('删除通知失败');
                                } else {
                                    // s2-ss1-case2. 重置selectedIds和重新渲染订单列表
                                    this.resetSelectedRowsNIds();
                                    const {listPage: {pageIndex, pageSize}} = this.state;
                                    this.getCheckNotificationList({pageIndex, pageSize})
                                }
                            })
                        }).catch(() => console.log('Oops errors!'));
                    },
                    onCancel: ()=> {
                    }
                });
            }else{
                // s1-case2. 只选中一条订单并且订单的状态为其他状态
                message.error('通知已经发送，不能删除该通知');
            }
        }
    };

    /*
     * @interface 删除订单
     * @param {object} 选中的行对象参数
     * @param {func} 回调函数
     * */
    delOrder = ({data: {id}}, callback = ()=>{})=>{
        fetch('ciq.checktask.remove', {
            // method: 'post',
            // headers: {},
            data: {id},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    title: '删除订单中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    title: ''
                })
            }
        })
    };

    /*
     * @interface 完成查验
     * @param {object} props 参数
     * */
    cptCheckTask = ({id}, callback)=>{
        fetch('ciq.checktask.completetask', {
            // method: 'post',
            // headers: {},
            data: {id},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    tip: '提交数据中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    tip: ''
                })
            }
        })
    };

    /*
     * @interface 完成查验
     * @param {object} _props 订单对象参数
     * */
    cptCheckTaskClick = ({data: selectedRows})=>{
        // step1. 如果只选中一行数据，发送查验通知xhr
        if(this._hasSelectedOnlyOneIdx(selectedRows)) {
            Modal.confirm({
                width: 416,
                title: '你确定该查验任务已经完结？',
                content: '完成查验任务指的是该次查验任务已经正常完结，已经填写完查验结果，一旦确认完结，该次查验任务所有相关结果都不能再次做修改',
                iconType: 'exclamation-circle',
                okText: '是的',
                cancelText: '还没有',
                onOk: ()=>{
                    return new Promise((resolve, reject) => {
                        this.cptCheckTask({id: selectedRows[0]['id']}, (err, res)=> {
                            resolve();
                            if (err) {
                                // s2-ss1-case1. 提交订单失败
                                message.error(`提交请求失败，请稍后重试`);
                                return;
                            }

                            // s2-case2. 隐藏对话框，重新渲染列表
                            this.resetSelectedRowsNIds();
                            const {listPage: {pageIndex, pageSize}} = this.state;
                            this.getCheckTaskList({pageIndex, pageSize})
                        })
                    }).catch((err) => console.log(err));
                },
                onCancel: ()=>{},
            });
        }
    };

    /*
     * @interface 关闭查验任务
     * @param {object} props 参数
     * */
    closeCheckTask = ({id}, callback)=>{
        fetch('ciq.checktask.closetask', {
            // method: 'post',
            // headers: {},
            data: {id},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    tip: '提交数据中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    tip: ''
                })
            }
        })
    };

    /*
     * @interface 关闭查验任务
     * @param {object} _props 订单对象参数
     * */
    closeCheckTaskClick = ({data: selectedRows})=>{
        // step1. 如果只选中一行数据，发送查验通知xhr
        if(this._hasSelectedOnlyOneIdx(selectedRows)) {
            Modal.confirm({
                width: 416,
                title: '你确定要关闭该查验任务吗？',
                // content: '关闭查验任务：意味着废弃该查验任务，你确定还要继续？',
                iconType: 'exclamation-circle',
                okText: '确定',
                cancelText: '取消',
                onOk: ()=>{
                    return new Promise((resolve, reject) => {
                        resolve();
                        this.closeCheckTask({id: selectedRows[0]['id']}, (err, res)=> {
                            resolve();
                            if (err) {
                                // s2-ss1-case1. 提交订单失败
                                message.error(`提交请求失败，请稍后重试`);
                                return;
                            }

                            // s2-case2. 隐藏对话框，重新渲染列表
                            this.resetSelectedRowsNIds()
                            const {listPage: {pageIndex, pageSize}} = this.state;
                            this.getCheckTaskList({pageIndex, pageSize})
                        })
                    }).catch((err) => console.log(err));
                },
                onCancel: ()=>{},
            });
        }
    };

    /*
     * @interface 完成查验准备
     * @param {object} props 参数
     * */
    cptCheckPreparation = ({id}, callback)=>{
        fetch('ciq.checktask.readytask', {
            // method: 'post',
            // headers: {},
            data: {id},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    tip: '提交数据中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    tip: ''
                })
            }
        })
    };

    /*
     * @interface 完成查验准备
     * @param {object} _props 订单对象参数
     * */
    cptCheckPreparationClick = ({data: selectedRows})=>{
        // step1. 如果只选中一行数据，发送查验通知xhr
        if(this._hasSelectedOnlyOneIdx(selectedRows)) {
            Modal.confirm({
                width: 416,
                title: '你确定该查验任务已经做好准备？',
                content: '一旦确认查验准备已经完成，商检将会获知该次查验任务可以开启，确定继续？',
                iconType: 'exclamation-circle',
                okText: '是的',
                cancelText: '还没有',
                onOk: ()=>{
                    return new Promise((resolve, reject) => {
                        this.cptCheckPreparation({id: selectedRows[0]['id']}, (err, res)=> {
                            resolve();
                            if (err) {
                                // s2-ss1-case1. 提交订单失败
                                message.error(`提交请求失败，请稍后重试`);
                                return;
                            }

                            // s2-case2. 隐藏对话框，重新渲染列表
                            this.resetSelectedRowsNIds();
                            const {listPage: {pageIndex, pageSize}} = this.state;
                            this.getCheckTaskList({pageIndex, pageSize})
                        })
                    }).catch((err) => console.log(err));
                },
                onCancel: ()=>{},
            });
        }
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
        });
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
     * @interface 判断期望值与实际值是否相等
     * @param {any} exceptValue 期望值
     * @param {any} realValue 实际值
     * @return {boolean} 如果两个值相等则返回true否则返回false
     * */
    _isExpectStatusValue = (exceptValue, realValue)=>{
        return exceptValue === realValue
    };

    render() {
        const {...props} =this.props;
        const { getFieldDecorator } = this.props.form;
        const {selectedIds, selectedRows, spinning, tip,
            listPage: {pageIndex, pageSize, rows: dataSource, total},
            tableLoading, viewCheckTask, writeCheckResultModal} = this.state;

        // console.log(selectedIds, selectedRows)

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
                this.getCheckTaskList({pageIndex: current, pageSize})
            }
        };
        // console.log(this.state.listPage, pageIndex, _pagination)


        const _columns = [
            /* {
             key: 'sn',
             name: '序号',
             width: 100,
             // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
             locked: true,
             formatter: ({dependentValues,rowIdx, value})=> {
             const {listPage: {pageIndex, pageSize}} = this.state;
             return (
             <span>{(pageIndex- 1) * pageSize + rowIdx + 1}</span>
             )
             },
             /!*events: {
             onDoubleClick: function () {
             console.log('The user double clicked on title column');
             }
             }*!/
             },*/
            {
                key: 'eciqCode',
                name: '报检单号',
                width: 150,
                locked: true,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            /*{
                key: 'orderCode',
                name: '订单编号',
                width: 150,
                locked: true,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /!* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },*/
            {
                key: 'createTime',
                name: '创建时间 ',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
                    )
                }
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'orgName',
                name: '申请单位',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'exitEntryType',
                name: '出入境类型',
                width: 100,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{dimsMap.custom.entryExit[`${value}`]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'country',
                name: '贸易国家',
                width: 100,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'level',
                name: '特殊物品级别',
                width: 100,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{level[value]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'planTime',
                name: '计划查验时间 ',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
                    )
                }
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'checkPersonel',
                name: '查验人员',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'status',
                name: '状态',
                width: 200,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    const cls = cx({
                        [`status`]: true,
                        [`status${value}`]: true
                    });
                    return (
                        <span className={cls}>{taskDimMap["status"][value]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            }
        ];
        return (
            <div {...props} className="yzh-check-task has-no-check-box-all">
                <div className="hidden">
                    {/*<AddCheckNotificationModal
                     {...addCheckNotificationModal}
                     callback={this.addCallback}/>*/}
                    <ViewCheckTaskForECIQModal
                        {...viewCheckTask}
                        callback={this.viewCheckTaskCallback}/>
                    <WriteCheckResultModal
                        {...writeCheckResultModal}
                        callback={this.writeResultCallback}/>
                </div>
                <Spin
                    spinning={spinning}
                    tip={tip}>
                    <ButtonContainer>
                        <SearchButton  onClick={this.viewCheckTaskClick.bind(this, {data: selectedRows})}>查看</SearchButton>
                        <EditButton onClick={this.writeCheckResultClick.bind(this, {data: selectedRows})}>填写查验结果</EditButton>
                        {/*<Button
                            onClick={this.cptCheckTaskClick.bind(this, {data: selectedRows})}
                            type="primary"
                            icon="lock">完成查验</Button>*/}
                        <Button
                            onClick={this.closeCheckTaskClick.bind(this, {data: selectedRows})}
                            type="danger"
                            icon="close-square-o">关闭查验</Button>
                        {/*<SearchButton  onClick={this.viewCheckNotificationClick.bind(this, {data: selectedRows})}>查看</SearchButton>
                         <DelButton onClick={this.delOrderClick.bind(this, {data: selectedRows})}>删除</DelButton>
                         <AddButton onClick={this.addCheckTaskClick.bind(this, {data: selectedRows})}>创建任务</AddButton>*/}
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
                </Spin>
            </div>
        )
    }
}

CheckTask.propTypes = {
    prefix: PropTypes.string,
    rowKey: PropTypes.string
};

CheckTask.defaultProps = {
    prefix: 'yzh',
    rowKey: 'id'
};

CheckTask = Form.create()(CheckTask);

const mapStateToProps=({nav})=>{
    return {
        nav
    }
};

export default connect(mapStateToProps)(CheckTask);