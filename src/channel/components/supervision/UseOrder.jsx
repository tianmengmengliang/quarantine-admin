import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import faker from 'faker'
import { connect } from 'dva'
import moment from 'moment'
import cx from 'classnames'
import {Form, Select, Table, Popconfirm, message, Input, Spin, Modal, notification, Button, Icon, Upload} from 'antd'
import {GridTable, Block, Inline,
    ButtonContainer, AddButton,
    DelButton, UploadButton, EditButton, SearchButton} from '../../../components/'
import {authPropTypesWrapper, getArraySelectedInfo, isQueryChanged} from '../../components/helpers/'
import {fetch, CONFIG} from 'antd/../../src/services/'
import {AddCheckOrderModal, OrderQueryForm, CPTApplyModal,
    CPTVerificationModal, CPTInspectionModal, CPTTransportModal,
    CPTCheckModal, DisplayOrderStatusModal, ViewCheckOrderModal,
    ViewCheckOrderModalForY} from '../../components/order/modules/'
import {ViewUseOrderModal,} from  './modules/'
import {dimsMap} from '../../components/helpers/'
//const {order, custom: {entryExit}} = dimsMap;
const {supervision: {entryStatus, chayanStatus, jgStatus, jgResult}} = dimsMap;

function createRows(numberOfRows) {
    let rows = [];
    for(let i = 0; i < numberOfRows; i++) {
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

/**
 *  作者：贾鹏涛
 *  时间：2017/8/8
 *  功能：使用登记模块；完成三级表( 订单表、货物信息表、使用等级表)。
 * **/
class UseOrder extends Component{

    _retInitialState = ()=>{
        return {
            spinning: false,                                    // 页面加载数据loading状态
            title: '',                                          // 页面加载数据loading状态文字
            selectedIds: [],                                    // 已选定的行数据ids
            selectedRows: [],                                   // 选中的行数据
            tableLoading: false,
            listPage: {
                pageIndex: 1,
                pageSize: 10,
                rows: [],
                total: 0
            },
            viewUseOrderModal: {                               // 查看订单对话框
                visible: false,
                title: '货物信息表',
                data: {}
            },
            expandedRowKeys: [],                             //展开的行，控制属性。
            defaultExpandAllRows: false,
            sortField: 'useDate',                            // 倒序排序。
            sortOrder: 'desc',                               // 倒序排序。
        }

    };

    constructor(props){
        super(props);
        this.state = this._retInitialState();
    }

    componentDidMount(){
        const {listPage: {pageIndex, pageSize}} = this.state;
        this.getOrderList({pageIndex, pageSize});
    }

    /*
     * 获取订单列表的所有查询条件
     * @param {object} pageQuery 分页查询对象
     * @return {object} 列表所有查询条件参数对象
     * */
    _getAllListQuery = (pageQuery = {})=>{
      // step1 获取所有查询参数
      let _values = {};
      this.props.form.validateFieldsAndScroll((err, values) => {
        if(err){
          return;
        }
        if(values.corpName === undefined){
          _values['corpName']= undefined; // 根据企业名称查询。
        }else{
          _values['corpName']= values.corpName.trim(); // 根据企业名称查询。
        }
      });

      const {sortField, sortOrder, } = this.state;
      let _f = {
        sortField: sortField,
        sortOrder: sortOrder,
      };

      return {
          ..._values,
          ..._f,
          ...pageQuery
      }
    };

    /*
     * @interface 获取订单列表
     * */
    getOrderList = (query)=>{
        // step1. 获取查询阐参数
        const _q = this._getAllListQuery(query);
        // console.log(_q);
        // step2. 请求列表数据
        fetch('ciq.houxujianguan.liststatus', {
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
     * @interface 重置state的selectedRows，重置state的selectedIds
     * */
    resetSelectedRowsNIds = ()=>{
        this.setState({
            selectedIds: [],
            selectedRows: []
        })
    }

    /*
     * @interface 表格排序
     * @param {string} sortColumn 排序的列的key
     * @param {string} sortDirection 排序的方向
     * */
    handleGridSort = (pagination, filters, sorter) => {
          let sortOrder;
          console.log('sorter',sorter.field,' sorter.order',sorter.order);
          if( sorter.order === 'descend'){
            sortOrder= 'desc';
          }else if( sorter.order === 'ascend'){
            sortOrder= 'asc';
          }
          //解决setState方法延迟。
          this.setState({ sortField: sorter.field, sortOrder: sortOrder,
          }, ()=>{
              const {listPage: {pageIndex, pageSize} } = this.state;
              this.getOrderList({pageIndex, pageSize});
          });
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
        // case1. 如果是全选操作，跳过会自动调用onRowsSelected方法，如果是单选操作请隐藏全选checkbox视图操作
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

  //----------------------------------------------  "+" 的展开 -----------------------------------------------------
    /*
     * @interface 使用登记订单列表"+" 的展开。
     * */
    expandedRowRender = (_pRecord, index) => {
        //console.log('3._pRecord额外的展开行',_pRecord );
    };

  //------------------------------------------ 点击"+"图标打开对话框, 并更改图标。----------------------------------------------------------------
    onExpand = (expanded, record)=>{
        //expanded为true展开，"-"图标
        //expanded为false时， "+"图标
        //console.log('2.打开对话框expanded',expanded,'  record数据',record );
        if(expanded){
            this.showViewCheckNotificationModal(record);
        }
    };
    showViewCheckNotificationModal = (data)=>{
      this.setState(({viewUseOrderModal})=>{
        return {
          viewUseOrderModal: {
            ...viewUseOrderModal,
            visible: true,
            data: data
          }
        }
      })
    };
    hiddenViewNotification = ()=>{
      this.setState(({viewUseOrderModal})=>{
        return {
          viewUseOrderModal: {
            ...viewUseOrderModal,
            visible: false,
            data: {}
          }
        }
      })
      //this.onExpand(false);
    };
    viewUseOrderCallback = (info)=>{ //查看明细信息的回调
        const {click, data} = info;
        //console.log('点击取消按钮的回调函数',data);
        // 如果点击取消按钮，则隐藏对话框 && 刷新列表。
        if(click === 'cancel'){
          //隐藏对话框
          this.hiddenViewNotification();
          this.setState({

          });
          const {listPage: {pageIndex, pageSize}} = this.state;
          this.getOrderList({pageIndex, pageSize});
          return;
        }
      };

   //------------------------------- 1.展开行的id----------------------------------------------
    onExpandedRowsChange = (expandedRowKeys)=>{
        //console.log('1.expandedRowKeys展开时触发，产生行id',expandedRowKeys );// [id];
        this.setState({
           expandedRowKeys: expandedRowKeys
        })
    };

    /*
     * @interface 获取订单明细
     * @param {object} props 参数
     * */
    getOrderDetail = ({data}, callback)=>{
        fetch('ciq.crossorder.detail', {
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
                    spinning: true
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false
                })
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
            message.warn(`${nullText || '你未选中任何订单'}`);
            return false
        }else if(selectedIds.length > 1 ){
            // s1-case2. 选中超过2行数据提示
            message.warn(`${moreText || '你只能选择一条订单'}`);
            return false;
        }
        return true
    };

    /*
     * @interface 确认订单
     * @param {object} _props 订单对象参数
     * */
    confirmOrderClick = ({dependentValues = {}})=>{
        // step1. 如果只选中一行数据，确认订单xhr
        this.confirmOrder({orderId: dependentValues['id']}, (err, res)=>{
            if(err){
                // s2-ss1-case1. 提交订单失败
                const key = `open${Date.now()}`;
                notification.error({
                    message: '确认订单失败',
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
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getOrderList({pageIndex, pageSize})
        })
    };

    /*
     * @interface 确认订单
     * @param {object} 选中的行对象参数
     * @param {func} 回调函数
     * */
    confirmOrder = (orderId = {}, callback = ()=>{})=>{
        fetch('ciq.crossorderstep.confirm', {
            // method: 'post',
            // headers: {},
            data: orderId,
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    title: '确认订单中...'
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
     * @interface 拒绝订单
     * @param {object} _props 订单对象参数
     * */
    rejectOrderClick = ({dependentValues = {}})=>{
        // step1. 如果只选中一行数据，确认订单xhr
        this.rejectOrder({orderId: dependentValues.id}, (err, res)=>{
            if(err){
                // s2-ss1-case1. 提交订单失败
                const key = `open${Date.now()}`;
                notification.error({
                    message: '提交订单失败',
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
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getOrderList({pageIndex, pageSize})
        })
    };

    /*
     * @interface 拒绝订单
     * @param {object} 选中的行对象参数
     * @param {func} 回调函数
     * */
    rejectOrder = (selectedId = {}, callback = ()=>{})=>{
        fetch('ciq.crossorderstep.refuse', {
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
                    title: '确认订单中...'
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
     * @interface 完成审批
     * @param {object} _props 订单对象参数
     * */
    cptApplyClick = ({dependentValues = {}})=>{
        // step1. 显示完成审批对话框
        this.setState(({cPTApplyModal})=>{
            return {
                cPTApplyModal: {
                    ...cPTApplyModal,
                    visible: true,
                    data: dependentValues
                }
            }
        });
    };

    /*
     * @interface 隐藏完成审批对话框
     * */
    hiddenCPTApplyModal = ()=>{
        this.setState(({cPTApplyModal})=>{
            return {
                cPTApplyModal: {
                    ...cPTApplyModal,
                    visible: false,
                    data: {}
                }
            }
        });
    };

    /*
     * @interface 完成审批对话框的回调
     * */
    cptApplyCallback = (info)=>{
        const {click, data} = info;
        if(click === 'ok'){
            // case1. 隐藏完成审批对话框和重新渲染订单列表
            this.hiddenCPTApplyModal();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getOrderList({pageIndex, pageSize})
        }
        if(click === 'cancel'){
            // case2. 隐藏完成审批对话框
            this.hiddenCPTApplyModal()
        }
    };

    /*
     * @interface 完成核销
     * @param {object} _props 订单对象参数
     * */
    cptVerificationClick = ({dependentValues = {}})=>{
        // step1. 显示完成核销对话框
        this.setState(({cPTVerificationModal})=>{
            return {
                cPTVerificationModal: {
                    ...cPTVerificationModal,
                    visible: true,
                    data: dependentValues
                }
            }
        });

    };

    /*
     * @interface 隐藏完成审批对话框
     * */
    hiddenCPTVerificationModal = ()=>{
        this.setState(({cPTVerificationModal})=>{
            return {
                cPTVerificationModal: {
                    ...cPTVerificationModal,
                    visible: false,
                    data: {}
                }
            }
        });
    };

    /*
     * @interface 完成审批对话框的回调
     * */
    cptVerificationCallback = (info)=>{
        const {click, data} = info;
        if(click === 'ok'){
            // case1. 隐藏完成审批对话框和重新渲染订单列表
            this.hiddenCPTVerificationModal();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getOrderList({pageIndex, pageSize})
        }
        if(click === 'cancel'){
            // case2. 隐藏完成审批对话框
            this.hiddenCPTVerificationModal()
        }
    };

    /*
     * @interface 完成报检
     * @param {object} _props 订单对象参数
     * */
    cptInspectionClick = ({dependentValues = {}})=>{
        // step1. 显示完成报检对话框
        this.setState(({cPTInspectionModal})=>{
            return {
                cPTInspectionModal: {
                    ...cPTInspectionModal,
                    visible: true,
                    data: dependentValues
                }
            }
        });
    };

    /*
     * @interface 隐藏完成报检对话框
     * */
    hiddenCPTInspection = ()=>{
        this.setState(({cPTInspectionModal})=>{
            return {
                cPTInspectionModal: {
                    ...cPTInspectionModal,
                    visible: false,
                    data: {}
                }
            }
        });
    };

    /*
     * @interface 完成报检对话框的回调
     * */
    cptInspectionCallback = (info)=>{
        const {click, data} = info;
        if(click === 'ok'){
            // case1. 隐藏完成审批对话框和重新渲染订单列表
            this.hiddenCPTInspection();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getOrderList({pageIndex, pageSize})
        }
        if(click === 'cancel'){
            // case2. 隐藏完成审批对话框
            this.hiddenCPTInspection()
        }
    };


    /*
     * @interface 完成运输
     * @param {object} _props 订单对象参数
     * */
    cptTransportClick = ({dependentValues = {}})=>{
        // step1. 显示完成报检对话框
        this.setState(({cPTTransportModal})=>{
            return {
                cPTTransportModal: {
                    ...cPTTransportModal,
                    visible: true,
                    data: dependentValues
                }
            }
        });
    };

    /*
     * @interface 隐藏完成运输对话框
     * */
    hiddenCPTTransport = ()=>{
        this.setState(({cPTTransportModal})=>{
            return {
                cPTTransportModal: {
                    ...cPTTransportModal,
                    visible: false,
                    data: {}
                }
            }
        });
    };

    /*
     * @interface 完成报检对话框的回调
     * */
    cptTransportCallback = (info)=>{
        const {click, data} = info;
        if(click === 'ok'){
            // case1. 隐藏完成审批对话框和重新渲染订单列表
            this.hiddenCPTTransport();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getOrderList({pageIndex, pageSize})
        }
        if(click === 'cancel'){
            // case2. 隐藏完成审批对话框
            this.hiddenCPTTransport()
        }
    };

    /*
     * @interface 完成查验
     * @param {object} _props 订单对象参数
     * */
    cptCheckClick = ({dependentValues = {}})=>{
        // step1. 显示完成报检查验对话框
        this.setState(({cPTCheckModal})=>{
            return {
                cPTCheckModal: {
                    ...cPTCheckModal,
                    visible: true,
                    data: dependentValues
                }
            }
        });
    };

    /*
     * @interface 隐藏完成报检查验对话框
     * */
    hiddenCPTCheck = ()=>{
        this.setState(({cPTCheckModal})=>{
            return {
                cPTCheckModal: {
                    ...cPTCheckModal,
                    visible: false,
                    data: {}
                }
            }
        });
    };

    /*
     * @interface 完成报检对话框的回调
     * */
    cptCheckCallback = (info)=>{
        const {click, data} = info;
        if(click === 'ok'){
            // case1. 隐藏完成审批对话框和重新渲染订单列表
            this.hiddenCPTCheck();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getOrderList({pageIndex, pageSize})
        }
        if(click === 'cancel'){
            // case2. 隐藏完成审批对话框
            this.hiddenCPTCheck()
        }
    };

    /*
     * @interface 提交订单
     * */
    submitOrder = (selectedId = {}, callback = ()=>{})=>{
        fetch('ciq.crossorderstep.submit', {
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
                    title: '提交订单中...'
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
     * @interface 批量提交订单
     * @param {object} _props 订单对象参数
     * */
    commitOrder = ({data: selectedRows = []})=>{
        // step1. 判断是否有只选中一行数据并且订单状态为未提交状态status 0
        let hasSelectedOnlyOneIdx = false, isStatus0 = false;
        if(selectedRows.length === 0){
            // s1-case1. 没有选中任何行数据提示
            message.warn('你未选中任何订单');
            return;
        }else if(selectedRows.length > 1 ){
            // s1-case2. 选中超过2行数据提示
            message.warn('你只能选择一条订单')
            return;
        }
        hasSelectedOnlyOneIdx = true;
        isStatus0 = selectedRows[0]['status'] === 0;
        if(hasSelectedOnlyOneIdx) {
            if (isStatus0) {
                // s1-s1-case1. 订单为未提交状态 status 0
                const {listPage: {pageIndex, pageSize}} = this.state;
                // s1-s2-case1. 如果已经有选中行数据
                Modal.confirm({
                    width: 415,
                    title: '',
                    content: `你确定要提交该订单吗`,
                    okText: '确定提交',
                    cancelText: '我再想想',
                    maskClosable: false,
                    onOk: ()=> {
                        // s2-ss1. 提交订单
                        this.submitOrder({orderId: selectedRows[0][this.props.rowKey]}, (err, res)=> {
                            if (err) {
                                // s2-ss1-case1. 提交订单失败
                                const key = `open${Date.now()}`;
                                notification.error({
                                    message: '提交订单失败',
                                    description: `原因：${err.message || '未知'}`,
                                    key,
                                    onClose: noop,
                                });
                                return;
                            }

                            // s2-ss1-case2. 重置selectedIds和重新渲染订单列表
                            this.setState({
                                selectedIds: [],
                                selectedRows: []
                            });
                            const {listPage: {pageIndex, pageSize}} = this.state;
                            this.getOrderList({pageIndex, pageSize})
                        })
                    },
                    onCancel: noop
                });
            }else{
                // s1-s1-case2. 订单为其他状态提示警告
                message.error('订单已经提交，不需要再次提交');
            }
        }
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
        this.displayStatus({status:'loading', visible: true, ...data});

        // step2. 请求订单status列表
        this.getStatusList({orderId: data.orderId}, (err = {}, res = {})=>{
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

    /*
     * @interface 显示添加订单对话框
     * @param {string} type 操作类型
     * @param {array} 选中的行数据
     * */
    add = ({type, orderType, data: selectedRows = []})=>{
        if(type === 'add') {
            if(orderType == 3) {
                this.showAdd({data: {}});
            }
            if(orderType == 2) {

            }
            if(orderType == 1) {

            }
        }
        if(type === 'edit') {
            const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
            if (hasSelectedOnlyOneIdx) {
                // s1-case1. 只选中一行并且订单状态为未提交
                let isStatus0 = selectedRows[0]['status'] === 0;
                if (isStatus0) {
                    this.getOrderDetail({data: selectedRows[0]}, (err, res = {})=> {
                        if (err) {
                            // case1. 请求订单明细失败
                            message.error('获取订单明细失败');
                        } else {
                            // case2. 请求订单明细成功，显示对话框
                            if(orderType == 3) {
                                this.showAdd({
                                    data: res.responseObject
                                })
                            }
                            if(orderType == 2) {

                            }
                            if(orderType == 1) {

                            }
                        }
                    })
                }else{
                    // s1-case2. 只选中一行并且订单状态为其他状态
                    message.error('订单已经提交，不能修改该订单');
                }
            }else{
                return;
            }
        }
    };

    showAdd = ({data})=>{
        this.setState(({addOrderModal})=>{
            return {
                addOrderModal: {
                    ...addOrderModal,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏订单对话框
     * */
    hiddenAdd = ()=>{
        this.setState(({addOrderModal})=>{
            return {
                addOrderModal: {
                    ...addOrderModal,
                    visible: false,
                    confirmLoading: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 添加订单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    addCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenAdd();
            return;
        }

        // 如果点击确定按钮，则提交表单
        if(click === 'ok'){
            // console.log(info);
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getOrderList({pageIndex, pageSize})
            this.hiddenAdd();
            return;
        }
    };

    /*
     * @interface 显示查看订单对话框
     * @param {string} type 操作类型
     * @param {array} 选中的行数据
     * */
    viewClick = ({type, orderType, data: selectedRows = []})=>{
        if(type === 'search') {
            const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
            if (hasSelectedOnlyOneIdx) {
                // s1-case1. 只选中一行并且订单状态为未提交
                this.getOrderDetail({data: selectedRows[0]}, (err, res = {})=> {
                    if (err) {
                        // case1. 请求订单明细失败
                        message.error('获取订单明细失败');
                    } else {
                        // case2. 请求订单明细成功，显示对话框
                        // case2. 请求订单明细成功，显示对话框
                        if(orderType == 3) {
                            this.showViewOrder({
                                data: res.responseObject
                            })
                        }else if(orderType == 2) {
                            message.error(`error ordertype: ${orderType}`)
                        }else if(orderType == 1) {
                            message.error(`error ordertype: ${orderType}`)
                        }else{
                            message.error(`error ordertype: ${orderType}`)
                        }
                    }
                })
            }else{
                // message.error("请选择一条订单")
                return;
            }
        }
    };

    showViewOrder = ({data})=>{
        this.setState(({viewOrderModal})=>{
            return {
                viewOrderModal: {
                    ...viewOrderModal,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏查看订单对话框
     * */
    hiddenViewOrder = ()=>{
        this.setState(({viewOrderModal})=>{
            return {
                viewOrderModal: {
                    ...viewOrderModal,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 查看订单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    viewOrderCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenViewOrder();
            return;
        }
    };

    /*
     * @interface 显示查看订单对话框
     * @param {string} type 操作类型
     * @param {array} 选中的行数据
     * */
    viewClickForY = ({type, orderType, data: selectedRows = []})=>{
        if(type === 'search') {
            const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
            if (hasSelectedOnlyOneIdx) {
                // s1-case1. 只选中一行并且订单状态为未提交
                this.getOrderDetail({data: selectedRows[0]}, (err, res = {})=> {
                    if (err) {
                        // case1. 请求订单明细失败
                        message.error('获取订单明细失败');
                    } else {
                        // case2. 请求订单明细成功，显示对话框
                        if(orderType == 3) {
                            this.showViewOrderForY({
                                data: res.responseObject
                            })
                        }else if(orderType == 2) {
                            message.error(`error ordertype: ${orderType}`)
                        }else if(orderType == 1) {
                            message.error(`error ordertype: ${orderType}`)
                        }else{
                            message.error(`error ordertype: ${orderType}`)
                        }
                    }
                })
            }else{
                // message.error("请选择一条订单")
                return;
            }
        }
    };

    showViewOrderForY = ({data})=>{
        this.setState(({viewCheckOrderModalForY})=>{
            return {
                viewCheckOrderModalForY: {
                    ...viewCheckOrderModalForY,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏查看订单对话框
     * */
    hiddenViewOrderForY = ()=>{
        this.setState(({viewCheckOrderModalForY})=>{
            return {
                viewCheckOrderModalForY: {
                    ...viewCheckOrderModalForY,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 查看订单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    viewOrderCallbackForY = (info)=>{
        const {click, data, callback} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenViewOrderForY();
            callback && callback();
            return;
        }

        if(click === 'ok'){
            // step1. 隐藏对话框
            this.hiddenViewOrderForY();
            // step2. 回调
            callback && callback();
            // step3. 重新渲染列表
            this.resetSelectedRowsNIds();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getOrderList({pageIndex, pageSize});
            return;
        }
    };

    /*
     * @interface 删除一条订单记录
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
                    content: '你确定要删除该订单吗？',
                    okText: '确认删除',
                    cancelText: '我再想想',
                    maskClosable: false,
                    onOk: ()=> {
                        this.delOrder({data: selectedRows[0]}, (err, res = {})=> {
                            if (err) {
                                // case1. 请求订单明细失败
                                message.error('删除订单失败');
                            } else {
                                // s2-ss1-case2. 重置selectedIds和重新渲染订单列表
                                this.setState({
                                    selectedIds: [],
                                    selectedRows: []
                                });
                                const {listPage: {pageIndex, pageSize}} = this.state;
                                this.getOrderList({pageIndex, pageSize})
                            }
                        })
                    },
                    onCancel: ()=> {
                    }
                });
            }else{
                // s1-case2. 只选中一条订单并且订单的状态为其他状态
                message.error('订单已经提交，不能删除该订单');
            }
        }
    };

    /*
     * @interface 删除订单
     * @param {object} 选中的行对象参数
     * @param {func} 回调函数
     * */
    delOrder = ({data: {id}}, callback = ()=>{})=>{
        fetch('ciq.crossorder.remove', {
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

    confirm = ()=> {
        message.info('Click on Yes.');
    };

    //-------------------------------------- 条件查询----------------------------------------
    queryClick = ()=>{ //点击查询按钮。
       const {listPage: {pageSize}} = this.state;
       this.getOrderList({pageIndex: 1, pageSize})
    };
    resetClick = ()=>{ //重置查询条件。
       this.props.form.resetFields();
       const {listPage: {pageSize}} = this.state;
       this.getOrderList({pageIndex: 1, pageSize})
    };
    //---------------------------------------------------------------------------------
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
        const {selectedIds, selectedRows, spinning, title,
            listPage: {pageIndex, pageSize, rows: dataSource, total},
            tableLoading, viewUseOrderModal, cPTApplyModal,
            cPTVerificationModal, cPTInspectionModal, cPTTransportModal,
            cPTCheckModal, displayOrderStatusModal, viewOrderModal,
            viewCheckOrderModalForY, expandedRowKeys,defaultExpandAllRows } = this.state;
        //console.log(selectedIds, selectedRows)

        const formItemLayout = {
            labelCol: {span: 10},
            wrapperCol: {span: 14},
            style: {width: '25%', margin:'4px 0 4px 0'}
        };

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
                this.getOrderList({pageIndex: current, pageSize})
            }
        };
        // console.log(this.state.listPage, pageIndex, _pagination)

        const _columns = [
            {
              title: '序号',
              dataIndex: 'sn',
              key: 'sn' ,
              width: 50,
              render: (value, record, i)=>{
                return (pageIndex - 1) * pageSize + i +1
              }
            },
            {
              title: '使用日期',
              dataIndex: 'useDates',
              key: 'useDates',
              width: 150,
              sorter: true,
              render: (value, record, i)=>{
                return (
                  <span>{value ? moment(value).format('YYYY-MM-DD ') : undefined }</span>
                )
              }
            },
            {
              title: '组织机构代码 ',
              dataIndex: 'corpCode',
              key: 'corpCode',
              width: 150,
              sortable: true,
              formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                return (
                  <span>{value}</span>
                )
              }
            },
            {
              title: '单位名称',
              dataIndex: 'corpName',
              key: 'corpName',
              width: 200,
              sortable: false,
              formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                return (
                  <span>{value}</span>
                )
              }
            },
            {
              title: '核销单号 ',
              dataIndex: 'hexiaodanCode',
              key: 'hexiaodanCode',
              width: 200,
              sortable: true,
              formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                return (
                  <a onClick={this.viewUseListClick.bind(this, dependentValues)}>{value}</a>
                )
              }
            },
            {
              title: '报检单号',
              dataIndex: 'baojiandanCode',
              key: 'baojiandanCode',
              width: 200,
              sortable: false,
              formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                return (
                  <span>{value}</span>
                )
              }
            },
            {
              title: '订单编号',
              dataIndex: 'code',
              key: 'code',
              width: 200,
              sortable: false,
              formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                return (
                  <span>{value}</span>
                )
              }
            },
            {
              title: '监管机构 ',
              dataIndex: 'jgorgName',
              key: 'jgorgName',
              width: 100,
              sortable: false,
              formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                return (
                  <span>{value}</span>
                )
              }
            },
            {
              title: '查验日期',
              dataIndex: 'chayanDate',
              key: 'chayanDate',
              width: 150,
              sorter: true,
              render: (value, record, i)=>{
                return (
                  <span>{value ? moment(value).format('YYYY-MM-DD ') : undefinded }</span>
                )
              }
            },
            {
              title: '查验方式',
              dataIndex: 'chayantype',
              key: 'chayantype',
              width: 150,
              sortable: false,
              formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                const cls = cx({
                  'text-default': 0 == value,
                  'text-pass': 2 ==  value,
                  'text-not-pass': 1 == value
                });
                return (
                  <span className={cls}>{chayanStatus[value]}</span>
                )
              }
              // formatter: IndexFormatter,
              /* events: {
               onDoubleClick: function () {
               console.log('The user double clicked on title column');
               }
               }*/
            },
            {
              title: '监管结果',
              dataIndex: 'jgresult',
              key: 'jgresult',
              width: 150,
              sortable: false,
              render: (value, record, i)=>{
                const cls = cx({
                  'text-pass': 1 ==  value,
                  'text-not-pass': 2 == value
                });
                return (
                  <span className={cls}>{jgResult[value]}</span>
                )
              }
            },
        ];

        /**--------根据企业用户名查询---------**/
        const formEle = (
            <Form layout="inline">
                <Form.Item label="单位名称">
                  {getFieldDecorator('corpName', {
                    rules: false
                  })(
                    <Input  placeholder="不限" style={{ width: 300, }}/>
                  )}
                </Form.Item>
                <ButtonContainer style={{margin: 0, display: 'inline-block'}}>
                  <Button
                    onClick={this.queryClick}
                    type="primary"
                    icon="search">查询</Button>
                  <Button
                    onClick={this.resetClick}
                    icon="reload">重置</Button>
                </ButtonContainer>
            </Form>
        );

        return (
            <div {...props} className="yzh-order">
                <div className="hidden">
                    <ViewUseOrderModal    //使用登记对话框。
                        {...viewUseOrderModal}
                        callback={this.viewUseOrderCallback}/>
                    <CPTApplyModal
                        {...cPTApplyModal}
                        callback={this.cptApplyCallback}/>
                    <CPTVerificationModal
                        {...cPTVerificationModal}
                        callback={this.cptVerificationCallback}/>
                    <CPTInspectionModal
                        {...cPTInspectionModal}
                        callback={this.cptInspectionCallback}/>
                    <CPTTransportModal
                        {...cPTTransportModal}
                        callback={this.cptTransportCallback}/>
                    <CPTCheckModal
                        {...cPTCheckModal}
                        callback={this.cptCheckCallback}/>
                    <ViewCheckOrderModal
                        {...viewOrderModal}
                        callback={this.viewOrderCallback}/>
                    <ViewCheckOrderModalForY
                        {...viewCheckOrderModalForY}
                        callback={this.viewOrderCallbackForY}/>
                    <DisplayOrderStatusModal
                        {...displayOrderStatusModal}
                        callback={this.displayStatusCallback}/>
                </div>

                <div style={{marginBottom:10}}>
                    <h3 style={{textAlign:'left', marginBottom:10,}}>按条件筛选申请单</h3>
                    {formEle}
                </div>

                <Spin
                    spinning={spinning} tip={title}>
                    <Table
                      loading={tableLoading}
                      size="small"
                      bordered
                      columns={_columns}
                      rowKey={(record, i)=>{return `${record.id}`}}
                      rowClassName={(record, i)=>{ return this.state.selectedRows.some((row) => {return record[this.props.rowKey] === row[this.props.rowKey]} ) ? 'ant-table-row-hover': ''}}

                      expandedRowKeys={expandedRowKeys}  //根据行id, 展开的行。
                      expandedRowRender={this.expandedRowRender} //
                      onExpand={this.onExpand}          //点击“+”打开对话框。
                      onExpandedRowsChange={this.onExpandedRowsChange}  //获取到行id。

                      defaultExpandAllRows={defaultExpandAllRows}
                      dataSource={dataSource}
                      pagination={_pagination}
                      height={400}
                      scroll={{x: 1650}}
                      onChange={this.handleGridSort} //排序
                    />
                </Spin>
            </div>
        )
    }
}

UseOrder.propTypes = {
    prefix: PropTypes.string,
    rowKey: PropTypes.string
};

UseOrder.defaultProps = {
    prefix: 'yzh',
    rowKey: 'id'
};

UseOrder = Form.create()(authPropTypesWrapper(UseOrder));

const mapStateToProps=({nav})=>{
    return {
        nav
    }
};

export default connect(mapStateToProps)(UseOrder);
