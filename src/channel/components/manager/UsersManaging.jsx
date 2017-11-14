import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
// import faker from 'faker'
import { connect } from 'dva'
import moment from 'moment'
import cx from 'classnames'
import {Form, Select, Popconfirm, message, Input, Spin, Modal, notification, Button, Icon, Upload} from 'antd'
import {GridTable, Block, Inline,
  ButtonContainer, AddButton,
  DelButton, UploadButton, EditButton, SearchButton, InputUpload} from '../../../components/'
import {AddUserModal, } from './modules/'
import {dimsMap} from '../helpers/'
import {fetch, CONFIG} from 'antd/../../src/services/'

function noop(){}

  /** create by  贾鹏涛
   *  Date   2017/8/21
   * function  管理员之用户管理功能。
   **/
class UsersManaging extends Component{

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
      AddUserModal: {                                      // 新建用户
        title: '',
        visible: false,
        data: {}
      },
      viewPreApprovalT3Modal: {                           // 查看审批单
        title: '',
        visible: false,
        data: {}
      },
      dispatchPreApprovalModal: {                         // 派发审批单
        title: '',
        visible: false,
        data: {}
      },
      copyPreApprovalT3Modal: {
        title: '',
        visible: false,
        data: {}
      },
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
      selectedRows: []
    })
  };


  //---------------------------------------- start 申请单分页列表 ---------------------------------------------------
  componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getCheckNotificationList({pageIndex, pageSize});
  }
  /*
   *  获取订单列表的所有查询条件
   * */
  _getAllListQuery = (pageQuery = {})=>{
    // step1 获取所有查询参数
    let _f = {};
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      ['userName', 'name'].map((key)=>{
        _f[`${key}`] = values[`${key}`] ;
      });
    });

    return {
      ..._f,
      ...pageQuery
    }
  };
  /*
   * @interface 获取订单列表
   * */
  getCheckNotificationList = (query)=>{
    const _q = this._getAllListQuery(query); // q是分页参数: Object{pageIndex:1, pageSize:10}
    //console.log('查询q:',_q);
    // step2. 请求列表数据
    fetch('ciq.user.pagelist',{ //
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        //console.log('接口:',res );
        const {responseObject: listPage} = res;  //res 反馈来的全部申请单。
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
//-------------------------------------------end  申请单分页列表  ---------------------------------------------------

  /*
   * @interface 表格排序
   * @param {string} sortColumn 排序的列的key
   * @param {string} sortDirection 排序的方向
   * */
  handleGridSort(sortColumn, sortDirection) {
    //console.log('sortColumn',sortColumn,' sortDirection',sortDirection);
    const comparer = (a, b) => {
      // 1.从小到大。
      if (sortDirection === 'ASC') {
        return (a[sortColumn] < b[sortColumn]) ? 0 : -1;  //0 升序
      }
      // 2.从大到小。
      else if (sortDirection === 'DESC') {
        return (a[sortColumn] > b[sortColumn]) ? 1 : -1;  //1 降序
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



//---------------------------------------------------- start 新增or修改 ------------------------------------------
  getAllRoleDetails = ({data}, callback)=>{ //获取所有角色
    fetch('ciq.role.list', {
      // method: 'post',
      // headers: {},
      data: {},
      success: (res)=>{
        //console.log("----ciq.list:----",res);
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
  /*getCheckNotificationDetails = ({data}, callback)=>{ //根据id, 查看详情接口
    fetch('ciq.riskasesmtproject.selectproject', {
      // method: 'post',
      // headers: {},
      data: {id: data.id},
      success: (res)=>{
        //console.log("----ciq.list:----",res);
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
  };*/
  /*
   * @interface 判断是否只选中一行
   * @param {array} selectedIds 选中的行数组
   * return {boolean} 只选中一行数据返回true否则返回false
   * */
  _hasSelectedOnlyOneIdx = (selectedIds= [], nullText= undefined, moreText= undefined)=>{
    if(selectedIds.length === 0){
      // s1-case1. 没有选中任何行数据提示
      message.warn(`${nullText || '你未选中任何申请单'}`);
      return false
    }else if(selectedIds.length > 1 ){
      // s1-case2. 选中超过2行数据提示
      message.warn(`${moreText || '你只能选择一条申请单'}`);
      return false;
    }
    return true
  };
  //
  add = ({type,  data: selectedRows = []})=>{
    if(type === 'add') {
      this.getAllRoleDetails({},(err, res={})=>{
        if (err) {
          message.error('查看Role信息失败');
        }
        let arrRole = {};
        arrRole['AllRole'] = res.responseObject;
        console.log('arrRole',arrRole);

        this.showAdd({data: arrRole});
      })

    }
    if(type === 'edit') {
      const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows); //选中一行并且订单状态为未提交
      if (hasSelectedOnlyOneIdx) {
        // s1-case1. 只选中一行并且订单未提交状态
        //let isStatusLess2 = selectedRows[0]['state'];
        this.getCheckNotificationDetails({id: selectedRows[0]['id']}, (err, res={})=> { //根据id, 查看详情
            if (err) {
              // case1. 请求通知明细失败
              message.error('查看用户信息失败');
            } else {
              // case2. 请求通知明细成功，显示对话框
              this.showAdd({
                data: res.responseObject
              })
            }
        });
      }else{
          message.error('只能选中一行');
          return;
      }
    }else{
      return;
    }
  };
  /*
   * @interface 显示订单对话框
   * */
  showAdd = ({data})=>{
    this.setState(({addUserModal})=>{
      return {
        addUserModal: {
          ...addUserModal,
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
    this.setState(({addUserModal})=>{
      return {
        addUserModal: {
          ...addUserModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  /*
   * @interface  对话框的回调
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
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getCheckNotificationList({pageIndex, pageSize});
      this.hiddenAdd();
      return;
    }
  };
//---------------------------------------------------- end新增or修改 ------------------------------------------
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
              this.getCheckNotificationList({pageIndex, pageSize});
            })
          }).catch(() => console.log('Oops errors!'));
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



//----------------------------------------------------start 查看申请单---------------------------------------
  viewCheckComment = (selectedId = {}, callback = ()=>{})=>{ //2.查看审核意见 接口
    fetch('ciq.riskasesmtproject.findcomment', {
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
  viewCheckNotification = (selectedId = {}, callback = ()=>{})=>{ //1.查看申请单 接口
    fetch('ciq.riskasesmtproject.selectproject', {
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
   * @interface 查看
   * */
  viewCheckNotificationClick = ({data: selectedRows})=>{
    // step1. 如果只选中一行数据，发送查验通知xhr
    if(this._hasSelectedOnlyOneIdx(selectedRows)) {
      this.showViewCheckNotificationModal({data: {}})
      this.viewCheckNotification({id: selectedRows[0]['id']}, (err, res)=> {// 根据id， 查看申请单详细。
        if (err) {
          // s2-ss1-case1. 查验订单失败
          message.error(`获取信息失败，请稍后重试`);
          return;
        }
        let {responseObject = {}} = res;

        let comments =[];
        this.viewCheckComment({id: selectedRows[0]['id']}, (err, res)=> {// 二、根据id， 查看审批意见。
          // 1.如果没有意见
          if (err) {
            this.showViewCheckNotificationModal({data: responseObject})
          }
          // 2.如果有意见
          else if(res ){
            comments = res.responseObject;
            //console.log('查看审核意见:', comments);
            responseObject['dataSource'] = comments;
            this.showViewCheckNotificationModal({data: responseObject})
          }
          else{
            message.error(`查询审批意见失败`);
            return;
          }
        });
      });
    }
  };
  showViewCheckNotificationModal = ({data})=>{
    this.setState(({viewPreApprovalT3Modal})=>{
      return {
        viewPreApprovalT3Modal: {
          ...viewPreApprovalT3Modal,
          visible: true,
          data: data
        }
      }
    })
  }; //显示查看对话框
  /*
   * @interface 回调隐藏
   * */
  viewNotificationCallback = (info)=>{
    const {click, data} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenViewNotification();
      return;
    }
  };
  hiddenViewNotification = ()=>{
    this.setState(({viewPreApprovalT3Modal})=>{
      return {
        viewPreApprovalT3Modal: {
          ...viewPreApprovalT3Modal,
          visible: false,
          data: {}
        }
      }
    })
  };   //隐藏查看对话框

//---------------------------------------------------end  查看申请单 ----------------------------------------


  /*
   * @interface 查验通知明细
   * */
  dispatchPreApprovalClick = ({data: selectedRows})=>{
    // step1. 如果只选中一行数据，发送查验通知xhr
    this.showDispatchPreApprovalModal({data: {}})
  };
  showDispatchPreApprovalModal = ({data})=>{
    this.setState(({dispatchPreApprovalModal})=>{
      return {
        dispatchPreApprovalModal: {
          ...dispatchPreApprovalModal,
          visible: true,
          data: data
        }
      }
    })
  }; //显示查看通知信息对话框
  hiddenDispatchPreApproval = ()=>{
    this.setState(({dispatchPreApprovalModal})=>{
      return {
        dispatchPreApprovalModal: {
          ...dispatchPreApprovalModal,
          visible: false,
          data: {}
        }
      }
    })
  }; //隐藏查看通知明细信息对话框
  /*
   * @interface 查验查验通知明细信息的回调
   * */
  dispatchPreApprovalCallback = (info)=>{
    const {click, data, callback} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenDispatchPreApproval();
      callback && callback();
      return;
    }
    if(click === 'ok'){
      this.hiddenDispatchPreApproval();
      callback && callback()
      return;
    }
  };

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
      this.getCheckNotificationList({pageIndex, pageSize})
      return;
    }
  };


  /*
   * @interface 完成查验准备
   * @param {object} props 参数
   * */
  cptCheckPreparationClick = ({data: selectedRows})=>{
    // step1. 如果只选中一行数据
    if(this._hasSelectedOnlyOneIdx(selectedRows)) {
      Modal.confirm({
        width: 416,
        title: '你确定已经做好了查验准备？',
        content: '完成查验准备操作是为了通知商检该次查验已做好准备',
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
              this.getCheckNotificationList({pageIndex, pageSize})
            })
          }).catch(() => console.log('Oops errors!'));
        },
        onCancel: ()=>{},
      });
    }
  };
  cptCheckPreparation = ({id}, callback)=>{
    fetch('ciq.checktask.detail', {
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

//-----------------------------------------------start 停用用户--------------------------------
  /*
   * @interface 停用通知记录
   * */
  stopOrderClick = ({data: selectedRows = []})=>{
    // step1. 判断是否只选中一行数据
    const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
    if (hasSelectedOnlyOneIdx) {
      // s1-case1. 只选中一条订单并且订单的状态为启用status 2
      let isStatus0 = selectedRows[0]['status'] === 2;
      if (isStatus0) {
        Modal.confirm({
          width: 416,
          iconType: 'exclamation-circle',
          title: '',
          content: '你确定要停用该用户吗？',
          okText: '确认停用',
          cancelText: '我再想想',
          maskClosable: false,
          onOk: ()=> {
            this.stopOrder({id: selectedRows[0][this.props.rowKey]}, (err, res = {})=> {
              // 关闭对话框
              //resolve();
              if (err) {
                // case1. 删除失败
                message.error('停用用户失败');
              } else {
                // case2. 重置selectedIds、 重新渲染订单列表
                this.resetSelectedRowsNIds();
                const {listPage: {pageIndex, pageSize}} = this.state;
                this.getCheckNotificationList({pageIndex, pageSize})
              }
            })
          },
          onCancel: ()=> {
          }
        });
      }else{
        // s1-case2. 只选中一条订单并且订单的状态为其他状态
        message.error('用户已被停用');
      }
    }
  };
  stopOrder = (selectedId = {}, callback = ()=>{})=>{ //1.根据id，停用用户。
    fetch('yizhijie.user.disableuser', {
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
//-----------------------------------------------end 停用 --------------------------------------

//-----------------------------------------------start 启动用用户--------------------------------
  startOrderClick = ({data: selectedRows = []})=>{
    // step1. 判断是否只选中一行数据
    const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
    if (hasSelectedOnlyOneIdx) {
      // s1-case1. 只选中一条订单并且订单的状态为启用status 2
      let isStatus0 = selectedRows[0]['status'] === 3;
      if (isStatus0) {
        Modal.confirm({
          width: 416,
          iconType: 'exclamation-circle',
          title: '',
          content: '你确定要启用该用户吗？',
          okText: '确认启用',
          cancelText: '我再想想',
          maskClosable: false,
          onOk: ()=> {
            this.startOrder({id: selectedRows[0][this.props.rowKey]}, (err, res = {})=> {
              // 关闭对话框
              //resolve();
              if (err) {
                // case1. 删除失败
                message.error('启用用户失败');
              } else {
                // case2. 重置selectedIds、 重新渲染订单列表
                this.resetSelectedRowsNIds();
                const {listPage: {pageIndex, pageSize}} = this.state;
                this.getCheckNotificationList({pageIndex, pageSize})
              }
            })
          },
          onCancel: ()=> {
          }
        });
      }else{
        // s1-case2. 只选中一条订单并且订单的状态为其他状态
        message.error('用户已被启用');
      }
    }
  };
  startOrder = (selectedId = {}, callback = ()=>{})=>{ //1.根据id，启用用户。
    fetch('yizhijie.user.startuser', {
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


//--------------------------------------------- start重置密码--------------------------------------
  /*
   * @interface 重置密码
   * */
  resetOrderClick = ({data: selectedRows = []})=>{
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
    if(hasSelectedOnlyOneIdx) {
        // s1-s2-case1. 如果已经有选中行数据
        Modal.confirm({
          width: 415,
          title: '',
          content: `你确定要重置密码？`,
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
                  message: '重置失败',
                  description: `原因：${err.message || '未知'}`,
                  key,
                  onClose: noop,
                });
                //return;
              }
              // case2. 清空selectedIds，并且重新渲染订单列表。
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex, pageSize}} = this.state;
              this.getCheckNotificationList({pageIndex, pageSize});
            })
          },
          onCancel: noop
        });
    }
  };
  submitOrder = (selectedId = {}, callback = ()=>{})=>{ //--------- 重置密码接口------------------------
    fetch('yizhijie.user.updatepassword', {
      // method: 'post',
      // headers: {},
      data: selectedId,
      success: (res)=>{
        callback && callback(null, res)
        message.success(`重置密码`);
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
//---------------------------------------------- end 重置密码  -------------------------------------


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

  //------------------------------------------- 条件查询-------------------------------------
  queryClick = ()=>{ //点击查询按钮。
    const {listPage: {pageSize}} = this.state;
    this.getCheckNotificationList({pageIndex: 1, pageSize})
  };
  resetClick = ()=>{ //重置查询条件。
    this.props.form.resetFields();
    const {listPage: {pageSize}} = this.state;
    this.getCheckNotificationList({pageIndex: 1, pageSize})
  };
  //---------------------------------------------------------------------------------

  render() {
    const {...props} =this.props;
    const { getFieldDecorator } = this.props.form;
    const {selectedIds, selectedRows, spinning, tip,
      listPage: {pageIndex, pageSize, rows: dataSource, total},
      tableLoading, addUserModal, } = this.state;

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
        this.getCheckNotificationList({pageIndex: current, pageSize})
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
        key: 'username',
        name: '用户名',
        width: 200,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'name',
        name: '角色',
        width: 200,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'status',
        name: '用户状态',
        width: 200,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          if( value=== -1){
            return (
              <span>审核未通过</span>
            )
          }else if( value=== 0){
            return (
              <span>待提交</span>
            )
          }else if( value=== 1){
            return (
              <span>审核中</span>
            )
          }else if( value=== 2){
            return (
              <span style={{color:'#00EA00'}}>启用中</span>
            )
          }else if( value=== 3){
            return (
              <span style={{color:'#f00'}}>停用</span>
            )
          }else{
            return (
              <span>未知</span>
            )
          }
        }
      },
    ];

    const formEle = (
      <Form layout="inline">
        <Form.Item label="用户名称">
          {getFieldDecorator('userName', {
            rules: false
          })(
            <Input  placeholder="不限" />
          )}
        </Form.Item>

        <Form.Item label="用户角色">
          {getFieldDecorator('name', {
            rules: false
          })(
            <Input  placeholder="不限" />
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
      <div {...props} className="yzh-remained-submit-approval has-no-check-box-all">
        <div className="hidden">
          <AddUserModal
            {...addUserModal}
            callback={this.addCallback}/>
        </div>

        <h3 style={{textAlign:'left',marginBottom:10,}}>按条件筛选申请单</h3>
        {formEle}

        <Spin
          spinning={spinning}
          tip={tip}>
          <ButtonContainer>
            <AddButton onClick={this.add.bind(this, {type: 'add', data:{}})}>新建</AddButton>
            <DelButton onClick={this.stopOrderClick.bind(this, {data: selectedRows})}>停用用户</DelButton>
            <Button type="primary" icon="unlock" onClick={this.startOrderClick.bind(this, {data:selectedRows})}>启用</Button>
            <EditButton onClick={this.resetOrderClick.bind(this, {data: selectedRows})}>重置密码</EditButton>

            {/*<SearchButton onClick={this.viewCheckNotificationClick.bind(this, {data: selectedRows})}> </SearchButton>
            <UploadButton onClick={this.commitOrder.bind(this, {data: selectedRows})}> </UploadButton>*/}
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
                                  selectBy:{  keys:{rowKey:'id', values:this.state.selectedIds} }
                              }
                        }
            rowHeight={36}
            minHeight={400}
            rowScrollTimeout={0}
            onGridSort={this.handleGridSort}
            pagination={_pagination}
          />
        </Spin>
      </div>
    )
  }
}

UsersManaging.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};

UsersManaging.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id'
};

UsersManaging = Form.create()(UsersManaging);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};



export default connect(mapStateToProps)(UsersManaging);
