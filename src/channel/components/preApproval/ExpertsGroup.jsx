import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
// import faker from 'faker'
import { connect } from 'dva'
import moment from 'moment'
import cx from 'classnames'
import {Form, Select, Popconfirm, message, Input, Spin, Modal, notification, Button, Icon, Upload} from 'antd'
import {GridTable, Block, Inline,
  ButtonContainer, AddButton,
  DelButton, UploadButton, EditButton, SearchButton} from '../../../components/'
import {AddExpertsModal } from './Experts/modules/'
import { ViewExpertsGroupModal } from './modules/'

import { DispatchPreApprovalModal} from './modules/'
import {dimsMap} from '../helpers/'
import {fetch, CONFIG} from 'antd/../../src/services/'

function noop(){}

/*
 *  专家页面
 * */
class ExpertsGroup extends Component{

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
      addExpertsModal: {                                // 新建
        title: '',
        visible: false,
        data: {}
      },
      dispatchPreApprovalModal: {                         //新建专家组
        title: '',
        visible: false,
        data: {}
      },
      viewExpertsGroupModal: {                           //查看专家组明细
        title: '',
        visible: false,
        data: {}
      },
      ButtonState: 0 ,                 // 0无效。
    }

  };

  constructor(props){
    super(props);
    this.state = this._retInitialState();
  }


  /* @interface 清空行选择数据
   * * */
  resetSelectedRowsNIds = ()=>{
    this.setState({
      selectedIds: [],
      selectedRows: [],
    })
  };


  //---------------------------------------- start 专家分页列表 ---------------------------------------------------
  componentDidMount(){
    const {listPage: {pageIndex, pageSize, rows:dataSource,} } = this.state;
    this.getExpertsGroupList({pageIndex, pageSize});
  }

  _getAllListQuery = (pageQuery = {})=>{ //分页条件
    let _f = {};
    return {
      ..._f,
      ...pageQuery
    }
  };
  /*
   * @interface 专家组列表
   * */
  getExpertsGroupList = (query)=>{
    const _q = this._getAllListQuery(query); // q是分页参数: Object{pageIndex:1, pageSize:10}
    // step2. 请求列表数据
    fetch('ciq.riskasesmtexpertGroup.pagelist',{
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage} = res;  //res 反馈来的全部申请单。
        //console.log('接口:',res );
        this.setState({
          listPage
        })
        //step3. 判断有效专家组
        /*const {listPage: { rows:dataSource} } = this.state;
          if(dataSource.length >0 ){
            for(let i=0; i<dataSource.length; i++){
              if(dataSource[i]["state"] === 1){
                this.setState({
                  ButtonState: 1,   //1 设为有效
                })
              }
              //如果没有。
              else{
                this.setState({
                  ButtonState: 0,   //0 设为无效
                })
              }
            }
          } */
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
//-------------------------------------------end  分页列表  ---------------------------------------------------


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
  };

  /*
   * @interface 选中行接口
   * @param {Array} 选中的行
   * */
  onRowsSelected = (rows /*新增选择的行*/) =>{
    this.setState( {
      selectedIds: rows.map(r => r.row[this.props.rowKey])
    });
    this.setState({
      selectedRows: rows.map(r => r.row)
    });
  };
  /*
   * @interface 取消选中行接口
   * @param {Array} 取消选中的行
   * */
  onRowsDeselected = (rows /*取消选择的行*/) =>{
    let rowIds = rows.map(r =>  r.row[this.props.rowKey]);
    this.setState({
      selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 )
    });
    this.setState({
      selectedRows: this.state.selectedRows.filter(r => rowIds.indexOf(r[this.props.rowKey]) === -1 )
    });
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
      this.setState({
        selectedIds: this.state.selectedIds.filter(i => rowIds.toString().indexOf(i) === -1 )
      });
      this.setState({
        selectedRows: this.state.selectedRows.filter(r => rowIds.toString().indexOf(r[this.props.rowKey]) === -1 )
      });
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



//---------------------------------------------------- start 新增 ----------------------------------------

  /*
   * @interface 判断是否只选中一行
   * */
  _hasSelectedOnlyOneIdx = (selectedIds = [], nullText = undefined, moreText = undefined)=>{
    if(selectedIds.length === 0){
      // s1-case1. 没有选中任何行数据提示
      message.warn(`${nullText || '你未选中任何'}`);
      return false
    }else if(selectedIds.length > 1 ){
      // s1-case2. 选中超过2行数据提示
      message.warn(`${moreText || '你只能选择一条'}`);
      return false;
    }
    return true
  };
  // 新增or修改
  add = ({type, data: selectedRows = []})=>{
    if(type === 'add') {
      this.showAdd({data: {}});
    }
  };

  showAdd = ({data})=>{  //显示对话框
    this.setState(({addExpertsModal})=>{
      return {
        addExpertsModal: {
          ...addExpertsModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{  //隐藏对话框
    this.setState(({addExpertsModal})=>{
      return {
        addExpertsModal: {
          ...addExpertsModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  addCallback = (info)=>{  //添加专家对话框的回调
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenAdd();
      return;
    }
    // 如果点击确定按钮，则提交专家表单
    if(click === 'ok'){
      console.log(info);
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getExpertsGroupList({pageIndex, pageSize});  // 1.刷新列表
      this.hiddenAdd();   // 2.隐藏对话框。
      return;
    }
  };
//---------------------------------------------------- end 新增or修改 ------------------------------------------
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
          return new Promise((resolve, reject) => {
            this.sendCheckNotification({id: selectedRows[0]['id']}, (err, res)=> {
              resolve();
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

              // s2-ss1-case2. 清空选中行 和重新渲染订单列表
              /* this.setState({
               selectedIds: [],
               selectedRows: []
               });*/
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex, pageSize}} = this.state;
              this.getExpertsGroupList({pageIndex, pageSize});
            })
          }).catch(() => console.log('Oops errors!'));
        },
        onCancel: noop
      });
    }
  };
  /*
   * @param {func} 回调函数
   * */
  sendCheckNotification = (selectedId = {}, callback = ()=>{})=>{
    fetch('ciq.checktask.senddeliverednotice', {
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



//----------------------------------------------------start 查看---------------------------------------
  getExpertsGroupDetails = (selectedId = {} , callback)=>{ //查询专家组详细
    fetch('ciq.riskasesmtexpertGroup.list', {
      // method: 'post',
      // headers: {},
      data: selectedId,
      success: (res)=>{
        console.log("----expertGroup.list:----",res);
        callback && callback(null, res)
      },
      error: (err)=>{
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          tip: '获取数据中...'
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
  viewExpertsGroupDetailsClick = ({data: selectedRows})=>{
    // step1. 如果只选中一行数据。
    if(this._hasSelectedOnlyOneIdx(selectedRows)) {
      this.showViewExpertsGroupModal({data: {}})
      this.getExpertsGroupDetails({groupId: selectedRows[0]['id']}, (err, res)=> {// 查看。
        if (err) {
          // s2-ss1-case1. 查验订单失败
          message.error(`查询专家组失败，请稍后重试`);
          return;
        }
        const {responseObject } = res;
        this.showViewExpertsGroupModal({data: responseObject})
      })
    }
  };
  showViewExpertsGroupModal = ({data})=>{//显示查看对话框
    this.setState(({viewExpertsGroupModal})=>{
      return {
        viewExpertsGroupModal: {
          ...viewExpertsGroupModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenViewNotification = ()=>{ //隐藏查看对话框
    this.setState(({viewExpertsGroupModal})=>{
      return {
        viewExpertsGroupModal: {
          ...viewExpertsGroupModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  viewNotificationCallback = (info)=>{  // 回调隐藏
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenViewNotification();
      return;
    }
  };
//---------------------------------------------------end查看--------------------------------------------


//-------------------------------------------------- start选专家-----------------------------------------
  PromptInformation(){
    message.warn(`已存在有效专家组，不能重复创建`);
  }

  //选专家
  dispatchPreApprovalClick = ({data: selectedRows})=>{
    // step1. 如果只选中一行数据，发送查验通知xhr
    this.showDispatchPreApprovalModal({data:{}});
  };
  showDispatchPreApprovalModal = ({data})=>{ //显示专家对话框
    this.setState(({dispatchPreApprovalModal})=>{
      return {
        dispatchPreApprovalModal: {
          ...dispatchPreApprovalModal,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenDispatchPreApproval = ()=>{  //隐藏专家对话框
    this.setState(({dispatchPreApprovalModal})=>{
      return {
        dispatchPreApprovalModal: {
          ...dispatchPreApprovalModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  /*
   * @interface 派选后的回调
   * */
  dispatchPreApprovalCallback = (info)=>{
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenDispatchPreApproval();
      return;
    }
    if(click === 'ok'){
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getExpertsGroupList({pageIndex, pageSize}); //派选后再查询数据库，刷新列表。
      this.hiddenDispatchPreApproval();
      return;
    }
  };
//---------------------------------------------------------------------------------------------------

  //---------------------------------------------------------------
  /*
   * @interface 创建查验任务
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
  showAddCheckTaskModal = ({data})=>{  //显示对话框
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
  };   //隐藏对话框
  addCheckTaskCallback = (info)=>{
    const {click, data, callback} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenCheckTask();
      callback && callback();
      return;
    }

    if(click === 'ok'){
      this.resetSelectedRowsNIds(); //清空选中行数据
      this.hiddenCheckTask();  //隐藏对话框
      callback && callback();
      const {listPage: {pageIndex, pageSize}} = this.state;  //重新请求列表数据。
      this.getExpertsGroupList({pageIndex, pageSize})
      return;
    }
  };


//-----------------------------------------------start 删除专家组--------------------------------
  /*
   * @interface 删除专家组
   * */
  delExpertGroupClick = ({data: selectedRows = []})=>{
    // step1. 判断是否只选中一行数据
    const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
    if (hasSelectedOnlyOneIdx) {
      // s1-case1. 只选中一条订单
      Modal.confirm({
        width: 416,
        iconType: 'exclamation-circle',
        title: '',
        content: '你确定要删除该专家组吗？',
        okText: '确认删除',
        cancelText: '我再想想',
        maskClosable: false,
        onOk: ()=> {
          this.delExpertGroup({id: selectedRows[0][this.props.rowKey]}, (err, res = {})=> {
            if (err) {
              // case1. 删除失败
              message.error('删除专家组失败');
            } else {
              // case2. 清空selectedIds、 重新渲染订单列表
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex, pageSize}} = this.state;
              this.getExpertsGroupList({pageIndex, pageSize})
            }
          })
        },
        onCancel: ()=> {
        }
      });
    }else{
      message.error('您每次只能删一条专家记录');
    }
  };
  delExpertGroup = (selectedId = {}, callback = ()=>{})=>{ //删除接口
    fetch('ciq.riskasesmtexpertGroup.delete',{
      // method: 'post',
      // headers: {},
      data: selectedId,
      success: (res)=>{
        callback && callback(null, res)
        //this.setState({ButtonState: 0,})
      },
      error: (err)=>{
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        /* this.setState({
         spinning: true,
         title: '删除订单中...'
         })*/
      },
      complete: (err, data)=>{
        /* this.setState({
         spinning: false,
         title: ''
         })*/
      }
    })
  };
//-----------------------------------------------end 删除专家 --------------------------------



//-----------------------------------------------start 提交--------------------------------
  /*
   * @interface 提交
   * */
  commitOrder = ({data: selectedRows = []})=>{
    // step1. 判断是否有只选中一行数据，并且订单状态为未提交状态status 0
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
    isStatus0 = selectedRows[0]['state'] === 0;    //status 改 state
    if(hasSelectedOnlyOneIdx) {
      if (isStatus0) {
        // s1-s1-case1. 订单为未提交状态 state 0
        const {listPage: {pageIndex, pageSize}} = this.state;
        // s1-s2-case1. 如果已经有选中行数据
        Modal.confirm({
          width: 415,
          title: '',
          content: `你确定要提交该申请单？`,
          okText: '确定提交',
          cancelText: '我再想想',
          maskClosable: false,
          onOk: ()=> {
            // s2-ss1. 提交订单
            this.submitOrder({id: selectedRows[0][this.props.rowKey]}, (err, res)=> { //orderId 改 id
              if (err) {
                // case1. 提交订单失败
                const key = `open${Date.now()}`;
                notification.error({
                  message: '提交申请单失败',
                  description: `原因：${err.message || '未知'}`,
                  key,
                  onClose: noop,
                });
                //return;
              }

              // case2. 清空selectedIds，并且重新渲染订单列表。
              /*this.setState({
               selectedIds: [],
               selectedRows: []
               });*/
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex, pageSize}} = this.state;
              this.getExpertsGroupList({pageIndex, pageSize});
            })
          },
          onCancel: noop
        });
      }else{
        // s1-s1-case2. 订单为其他状态提示警告
        message.error('申请单已经提交，不需要再次提交');
      }
    }
  };
  submitOrder = (selectedId = {}, callback = ()=>{})=>{ //----------------提交订单接口------------------------
    fetch('ciq.riskasesmtproject.submit', {
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
//---------------------------------------------- end  提交订单  -------------------------------------


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


  render() {
    const {...props} =this.props;
    const { getFieldDecorator } = this.props.form;
    const {selectedIds, selectedRows, spinning, tip,
      listPage: {pageIndex, pageSize, rows:dataSource, total},
      tableLoading, addExpertsModal, viewExpertsGroupModal, dispatchPreApprovalModal,  } = this.state;

    const _pagination = {
      current: pageIndex,
      pageSize: pageSize,
      total: total,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: undefined,
      onShowSizeChange: (current, pageSize) => {
        console.log('Current: ', current, '; PageSize: ', pageSize);
      },
      onChange: (current) => {
        this.getExpertsGroupList({pageIndex: current, pageSize})
      }
    };
    //console.log('selectedRows选中行的数据:',  selectedRows);
    const _columns = [
      {
        key: 'sn',
        name: '序号',
        width: 50,
        // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
        locked: true,
        formatter: ({dependentValues,rowIdx, value})=> {
          const {listPage: {pageIndex, pageSize}} = this.state;
          return (
            <span>{(pageIndex- 1) * pageSize + rowIdx + 1}</span>
          )
        },
        /*events: {
         onDoubleClick: function () {
         console.log('The user double clicked on title column');
         }
         }*/
      },
      {
        key: 'groupName',  //
        name: '组名称',
        width: 100,
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
      {
        key: 'groupLeader',  //
        name: '组长',
        width: 100,
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
      {
        key: 'userName',
        name: '创建人',
        width: 100,
        // locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column:{key}})=>{
          return (
            <span>{value}</span>
          )
        }

      },
      {
        key: 'date',
        name: '创建时间',
        width: 150,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
        return (
          <span>{value ? moment(value).format('YYYY-MM-DD') : undefined}</span>
        )
      }

    },
      {/* {
        key: 'dateStart',
        name: '开始时间',
        width: 100,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD') : undefined}</span>
          )
        }

      },
      {
        key: 'dateEnd',
        name: '结束时间',
        width: 100,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD') : undefined}</span>
          )
        }
         events: {
         onDoubleClick: function () {
         console.log('The user double clicked on title column');
         }
         }
      },
      {
        key: 'state',
        name: '是否有效',
        width: 100,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column:{key}})=>{
          if( value=== 0 ){
            return (
              <span >失效</span>
            )
          } else if( value=== 1){
            return (
              <span style={{color:'#00EA00'}}>有效专家组</span>
            )
          } else {
            return (
              <span>有效组异常</span>
            )
          }
        }
      }, */}
    ];

    return (
      <div {...props} className="yzh-remained-submit-approval has-no-check-box-all">
        <div className="hidden">
          <AddExpertsModal
            {...addExpertsModal}
            callback={this.addCallback}/>
          <ViewExpertsGroupModal
            {...viewExpertsGroupModal}
            callback={this.viewNotificationCallback}/>
          <DispatchPreApprovalModal
            {...dispatchPreApprovalModal}
            callback={this.dispatchPreApprovalCallback}/>
        </div>
        <Spin
          spinning={spinning}
          tip={tip}>
          <ButtonContainer>
             <Button type="primary" icon="contacts"  onClick={this.dispatchPreApprovalClick.bind(this, {data:{}})}>选专家</Button>
             {/*<EditButton onClick={this.add.bind(this, {type: 'edit', data: selectedRows})}>修改</EditButton>*/}
             <SearchButton onClick={this.viewExpertsGroupDetailsClick.bind(this, {data: selectedRows})}>查看</SearchButton>
             <DelButton onClick={this.delExpertGroupClick.bind(this, {data: selectedRows})}>删除</DelButton>
          </ButtonContainer>

          <GridTable
            tableLoading={tableLoading}
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
                                      keys: {rowKey:'id', values:this.state.selectedIds}
                                  }
                              }
                        }
            rowHeight={36}
            minHeight={360}
            rowScrollTimeout={0}
            onGridSort={this.handleGridSort}
            pagination={_pagination}         //分页器。
          />
        </Spin>
      </div>
    )
  }
}

ExpertsGroup.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};

ExpertsGroup.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id'
};

ExpertsGroup = Form.create()(ExpertsGroup);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};

export default connect(mapStateToProps)(ExpertsGroup);
