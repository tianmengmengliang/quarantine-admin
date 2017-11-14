import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
// import faker from 'faker'
import { connect } from 'dva'
import moment from 'moment'
import cx from 'classnames'
import {Form, Select, Popconfirm, message, Input, DatePicker, Spin, Modal, notification, Button, Icon, Upload} from 'antd'
import {GridTable, Block, Inline,
  ButtonContainer, AddButton,
  DelButton, UploadButton, EditButton, SearchButton,InputUpload} from '../../../components/'
//import {AddPreApprovalT3Modal,  ViewPreApprovalT3Modal2, CopyPreApprovalT3Modal,  DispatchPreApprovalModal, ViewCountPreApproval,} from './modules/'
import {dimsMap} from '../helpers/'
import {fetch, CONFIG} from 'antd/../../src/services/'
//import config2       from  '../../../services/config2'
//import PDFViewer2    from '../../../components/viewer/PDFViewer2'


function noop(){}

/*
 *  留言板列表
 * */
class ViewNoteModel extends Component{

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
      viewCountPreApproval: {                            // 查询条件
        title: '',
        visible: false,
        data: {}
      },
      viewPreApprovalT3Modal2: {                           // 查看已完成审批的意见
        title: '',
        visible: false,
        data: {}
      },
      dispatchPreApprovalModal: {                         // 派发审批单
        title: '',
        visible: false,
        data: {}
      },
      copyPreApprovalT3Modal: {                          // 复制操作对话框。
        title: '',
        visible: false,
        data: {}
      },
      buttonloading1: false,                             // 按钮首先不加载。
      buttonloading2: false,
      sortOrder: 'desc',                                      // 排序升序
    }

  };

  constructor(props){
    super(props);
    this.state = this._retInitialState();
  }

//------------------------------------------- start 列表展示 ----------------------------------------
  componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getCheckNotificationList({pageIndex, pageSize});
  }
  resetSelectedRowsNIds = ()=>{ //@interface 重置行选择数据
    this.setState({
       selectedIds: [],
       selectedRows: []
    })
  };

  /*
   * @param {object} 分页条件对象 + 按条件查询对象
   */
  _getAllListQuery = (pageQuery = {})=>{
      let _values = {};
      this.props.form.validateFieldsAndScroll((err, values) => {
          if (err) {
            return;
          }
          let t1,t2,t3;
          if(values.markingTime === undefined) {
            t1= undefined;
            t2= undefined;
          }else{
            t1= values.markingTime[0].unix()*1000;
            t2= values.markingTime[1].unix()*1000;
          }
          if(values.urgent === undefined || values.urgent ==='全部') {
            t3= undefined;
          }else{
            t3= values.urgent;
          }

          const {sortOrder} = this.state;
          _values = {
            projectName: values.projectName,
            companyName: values.companyName,
            serialNumber: values.serialNumber,
            markingTime1: t1,
            markingTime2: t2,
            urgent: t3,
            state: values.state,
            sortOrder: sortOrder,
          };
      });
      let _f = { ..._values};

      return {
        ..._f,
        ...pageQuery
      }
  };

  /*
   * @interface 获取订单列表
   * */
  getCheckNotificationList = (query)=>{
      //1.获取分页查询条件
      const _q = this._getAllListQuery(query);
      console.log(_q);

      // step2.请求列表数据
      fetch('ciq.riskAsesmtMessage.list', {
        // method: 'post',
        // headers: {},
        data: _q,
        success: (res)=>{
          console.log('留言数据:', res);
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
  handleGridSort = (sortColumn, sortDirection)=> {
      //console.log('sortColumn',sortColumn,' sortDirection',sortDirection);
      let sortOrder;
      if (sortDirection === 'ASC' ) {//1.升序
          sortOrder= 'asc';
      } else if (sortDirection === 'DESC' || sortDirection === 'NONE') { //2.降序
          sortOrder= 'desc';
      }else{
      }
      //解决setState方法延迟。
      this.setState({ sortOrder: sortOrder}, ()=>{
           const {listPage: {pageIndex, pageSize} } = this.state;
           this.getCheckNotificationList({pageIndex, pageSize});
      });
  };
//------------------------------------------- end列表展示------------------------------------------------


//------------------------------------------- start查看-----------------------------------------------
  viewCheckComment = (selectedId = {}, callback = ()=>{})=>{ //查看审核意见 接口
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
  viewCheckNotification = (selectedId = {}, callback = ()=>{})=>{ //查看申请单明细接口
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
  // 查看
  selectByCondition = ({data: selectedRows})=>{
     //1.选中一行
    if(this._hasSelectedOnlyOneIdx(selectedRows)){
      this.showAdd({data: {}});
      this.viewCheckNotification({projectId: selectedRows[0]['projectId']}, (err, res)=>{ // 查看申请单明细接口
          if (err) {
            //case1.查询订单失败
            message.error(`查询数据失败，请稍后重试`);
            return;
          }
          let {responseObject = {}} = res;

          // step2. console.log('查看申请单明细:',responseObject );
          let comments =[];
          this.viewCheckComment({projectId: selectedRows[0]['projectId']}, (err, res)=> {// 二、根据 projectId， 查看审批意见。
            // 1.如果没有审批意见：
            if (err) {
              this.showAdd({data: responseObject})
            }
            // 2.如果有审批意见：
            else if( res){
              comments = res.responseObject;
              console.log('查看审核意见:', comments );
              responseObject['dataSource'] = comments ;
              this.showAdd({data: responseObject})
            }
            else{
              return;
            }
          })
        })
      }
  };
  showAdd = ({data})=>{
    this.setState(({viewPreApprovalT3Modal2})=>{
      return {
        viewPreApprovalT3Modal2: {
          ...viewPreApprovalT3Modal2,
          visible: true,
          data: data
        }
      }
    })
  };
  hiddenAdd = ()=>{
    this.setState(({viewPreApprovalT3Modal2})=>{
      return {
        viewPreApprovalT3Modal2: {
          ...viewPreApprovalT3Modal2,
          visible: false,
          data: {}
        }
      }
    })
  };
  selectCallback = (info)=>{
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
//---------------------------------------------------------------------------------------------------


//--------------------------------------------- start导出excel文件--------------------------------------
  excelReportCilck = (query)=>{
        //1.获取查询条件
        const _q = this._getAllListQuery(query);
        console.log(_q);

        this.submitOrder({..._q}, (err, res)=> { //
            if (err) {
              // case1. 提交失败
              const key = `open${Date.now()}`;
              notification.error({
                message: '打印申请单失败',
                description: `原因：${err.message || '未知'}`,
                key,
                onClose: noop,
              });
            }
            // 打印成功：
            console.log('【文件名】', res);
            const options = res.responseObject;
            const pdfUrl= config2.repFileUrl+ options ;//    http://riskreport.yizhijie.com/ciq-riskreport/123/riskAsesmt/risk.pdf
            console.log('【文件的绝对路径】', pdfUrl);
            //PDFViewer2.open(pdfUrl);
            window.open(pdfUrl);

            // case2.清空selectedIds，并且重新渲染订单列表，下载文件。
            this.resetSelectedRowsNIds();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getCheckNotificationList({pageIndex, pageSize});
        });
  };

  submitOrder = (selectQ = {}, callback = ()=>{})=>{ //---- 根据条件, 找到要打印数据。------------------------
    fetch('ciq.riskasesmtproject.createcsv', {
      // method: 'post',
      // headers: {},
      data: selectQ,
      success: (res)=>{
        callback && callback(null, res)
      },
      error: (err)=>{
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        this.setState({
          spinning: true,
          title: '申请单打印中...',
          buttonloading1: true,
        })
      },
      complete: (err, data)=>{
        this.setState({
          spinning: false,
          title: '',
          buttonloading1: false,
        })
      }
    })
  };
//---------------------------------------------- end -------------------------------------


  //--------------------------------------------- start更新数据 --------------------------------------
  updataClick = ({data:{} })=>{
    this.updataDatabase({id:{}}, (err, res)=> {
      if(err) {
        //case1. 提交失败
        const key = `open${Date.now()}`;
        notification.error({
          message: '更新失败',
          description: `原因：${err.message || '未知'}`,
          key,
          onClose: noop,
        });
      }
      // case2.清空selectedIds，并且重新渲染统计列表，下载文件。
      this.resetSelectedRowsNIds();
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getCheckNotificationList({pageIndex, pageSize});
    })
  };
  updataDatabase = (selectedId = {}, callback = ()=>{})=>{ //----根据条件, 找到要打印的数据。------------------------
    fetch('ciq.riskasesmtproject.updateauditresult', {
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
          title: '列表更新中...',
          buttonloading2: true,
        })
      },
      complete: (err, data)=>{
        this.setState({
          spinning: false,
          title: '',
          buttonloading2: false,
        })
      }
    })
  };
//---------------------------------------------- end -------------------------------------

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



  /*
   * @interface 判断是否只选中一行数据
   * @param {array} selectedIds 选中的行数组
   * return {boolean} 只选中一行数据返回true否则返回false
   * */
  _hasSelectedOnlyOneIdx = (selectedIds = [], nullText = undefined, moreText = undefined)=>{
    if(selectedIds.length === 0){
      // s1-case1. 没有选中任何行数据提示
      message.warn(`${nullText || '你未选中任何审批单'}`);
      return false
    }else if(selectedIds.length > 1 ){
      // s1-case2. 选中超过2行数据提示
      message.warn(`${moreText || '你只能选择一条审批单'}`);
      return false;
    }
    return true
  };

//----------------------------------------------查看详情------------------------------------------------------------

  getCheckNotificationDetails = ({data}, callback)=>{ //根据id, 查看详情接口
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
  };

//----------------------------------------------------------------------------------------------------------
  /*
   * @interface 添加查验通知单对话框的回调
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
      console.log(info);
      const {listPage: {pageIndex, pageSize}} = this.state;
      // this.getCheckNotificationList({pageIndex, pageSize})
      this.hiddenAdd();
      return;
    }
  };
//----------------------------------------------------------------------------------------------------------
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

              // s2-ss1-case2. 重置selectedIds和重新渲染订单列表
              /* this.setState({
               selectedIds: [],
               selectedRows: []
               });*/
              this.resetSelectedRowsNIds();
              const {listPage: {pageIndex, pageSize}} = this.state;
              this.getCheckNotificationList({pageIndex, pageSize})
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


  /*
   * @interface 查验通知明细
   * @param {object} _props 审批单对象
   * */
  dispatchPreApprovalClick = ({data: selectedRows})=>{
    // step1. 如果只选中一行数据，发送查验通知xhr
    this.showDispatchPreApprovalModal({data: {}})
  };

  /*
   * @interface 显示查看通知信息对话框
   * @param {_props} _props 信息对象
   * */
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
  };

  /*
   * @interface 隐藏查看通知明细信息对话框
   * */
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
  };

  /*
   * @interface 查验查验通知明细信息的回调
   * @param {object} info 返回的信息对象
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
    const {click, data, callback} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenCheckTask();
      callback && callback();
      return;
    }
    if(click === 'ok'){
      this.resetSelectedRowsNIds();
      this.hiddenCheckTask();
      callback && callback();
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getCheckNotificationList({pageIndex, pageSize})
      return;
    }
  };

  /*
   * @interface 完成查验准备
   * @param {object} props 参数
   * */
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

  /*
   * @interface 完成查验准备
   * @param {object} _props 订单对象参数
   * */
  cptCheckPreparationClick = ({data: selectedRows})=>{
    // step1. 如果只选中一行数据，发送查验通知xhr
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
          content: '你确定要删除该审批单吗？',
          okText: '确认删除',
          cancelText: '我再想想',
          maskClosable: false,
          onOk: ()=> {
            return new Promise((resolve, reject) => {
              resolve();
              /*   this.delOrder({data: selectedRows[0]}, (err, res = {})=> {
               // 关闭对话框
               resolve();
               if (err) {
               // case1. 请求订单明细失败
               message.error('删除审批单失败');
               } else {
               // s2-ss1-case2. 重置selectedIds和重新渲染订单列表
               this.resetSelectedRowsNIds();
               const {listPage: {pageIndex, pageSize}} = this.state;
               this.getCheckNotificationList({pageIndex, pageSize})
               }
               })*/
            }).catch(() => console.log('Oops errors!'));
          },
          onCancel: ()=> {
          }
        });
      }else{
        // s1-case2. 只选中一条订单并且订单的状态为其他状态
        message.error('审批单已经提交，不能删除该审批单');
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

//--------------------------------------查询条件----------------------------------------
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
      tableLoading, addPreApprovalT3Modal, viewPreApprovalT3Modal2, copyPreApprovalT3Modal,dispatchPreApprovalModal,
      viewCountPreApproval,buttonloading1,buttonloading2,} = this.state;
    // console.log(selectedIds, selectedRows)

    const _pagination = {
      current: pageIndex,
      pageSize: pageSize,
      total: total,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: undefined,
      onShowSizeChange: (current, pageSize) => {
        console.log('Current:', current, '; PageSize: ', pageSize);
      },
      onChange: (current) => {
        this.getCheckNotificationList({pageIndex: current, pageSize})
      }
    };
    // console.log(this.state.listPage, pageIndex, _pagination)

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
        key: 'name',
        name: '名字',
        width: 200,
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
        key: 'email',
        name: '联系Email',
        width: 200,
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
        key: 'region',
        name: '所在地区',
        width: 150,
        // locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column:{key}})=>{
            return (
              <span>{value}</span>
            )
        }
      },
      {
        key: 'submitCreate',
        name: '提交时间 ',
        width: 150,
        sortable:true,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
          )
        }
      },
      {
        key: 'suggest',
        name: '意见 ',
        width: 800,
        sortable:true,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
    ];

    //获取角色
    /*const Roles1 = localStorage.getItem("_YZH_QUARANTINE_User_Roles");
    const Roles2 = JSON.parse( Roles1); //转json
    const Roles3 =  Roles2[0].nameEn; //角色*/


    return (
      <div {...props} className="yzh-remained-submit-approval has-no-check-box-all">
        <div className="hidden">
        </div>
        <Spin
          spinning={spinning}
          tip={tip}>

          <GridTable
            tableLoading={tableLoading}
            //enableCellSelect={true}
            //dataSource={[{"name": "aa"}]}   //name是项目名称
            dataSource={dataSource}
            columns={_columns}
            onGridRowsUpdated={this.handleGridRowsUpdated}
            //enableRowSelect={true}
            //onRowClick = {this.onRowClick}
            //rowSelection={
            //                {
            //                    showCheckbox: true,
            //                    enableShiftSelect: false,
            //                    onRowsSelected: this.onRowsSelected,
            //                    onRowsDeselected: this.onRowsDeselected,
            //                    selectBy: {
            //                        keys: {rowKey: 'id', values: this.state.selectedIds}
            //                    }
            //                }
            //            }
            rowHeight={36}
            minHeight={400}
            // rowRenderer={RowRenderer}
            rowScrollTimeout={0}
            onGridSort={this.handleGridSort} //排序
            pagination={_pagination}         //分页
            scroll={{x: 1650}}               //横向可滚动距离
          />
        </Spin>
      </div>
    )
  }
}

ViewNoteModel.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};

ViewNoteModel.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id'
};

ViewNoteModel = Form.create()(ViewNoteModel);

const mapStateToProps=({nav})=>{
  return {
    nav
  }
};

export default connect(mapStateToProps)(ViewNoteModel);
