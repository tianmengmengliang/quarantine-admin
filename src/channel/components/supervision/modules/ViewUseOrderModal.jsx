import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import faker from 'faker'
import { connect } from 'dva'
import moment from 'moment'
import cx from 'classnames'
import {Form, Spin, Table, Button, Badge, Popconfirm, Input, Modal, DatePicker, message} from 'antd'
import {Permission} from 'antd/../../src/channel/components/helpers/'
import {GridTable, Block, Inline,
  ButtonContainer, AddButton,
  DelButton, UploadButton, EditButton, SearchButton, ModalA, InputUpload, } from 'antd/../../src/components/'
import {WriteWasteResolveModal, ViewWasteResolveModal} from 'antd/../../src/channel/components/supervision/modules/'
import {fetch, CONFIG} from 'antd/../../src/services/'
const {lsNames: {platform: {USER_ROLE}}} = CONFIG;
/*
function createRows(numberOfRows) {
  let rows = [];
  for (let i = 0; i < numberOfRows; i++) {
    rows[i] = createFakeRowObjectData(i);
  }
  return rows;
}

function createFakeRowObjectData(index) {
  return {
    id: undefined,
    useDate: null,
    amount: null,
    amountUnit: null,
    purpose: '',
    result: '',
    restAmount: null,
    opPeople: '',
    remark: '',
    wasteDealTime: null,
    wasteDealWay: '',
    wasteDealPeople: '',

  };
} */

function createUserLogRow(){
  return {
    id: undefined,
    path: '',
    useDate: null,
    amount: null,
    amountUnit: null,
    purpose: ' ',
    result: ' ',
    restAmount: null,
    opPeople: ' ',
    remark: ' ',
    wasteDealTime: null,
    wasteDealWay: ' ',
    wasteDealPeople: ' '
  }
}

function noop(){}

const fieldNames = {
  "path": 'path',
  "useDate": 'useDate',
  "countUnit": 'countUnit',
  "amount": 'amount',
  "amountUnit": 'amountUnit',
  "purpose": 'purpose',
  "result": 'result',
  "restAmount": 'restAmount',
  "opPeople": 'opPeople',
  "remark": 'remark'
}

/**
 *  可编辑，表格单元格组件。
 *
 * */
class EditableCell extends React.Component {
  state = {
    value: this.props.value,
    editable: this.props.editable || false,

  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    if (nextProps.editable !== this.state.editable) {
      this.setState({ editable: nextProps.editable });
      if (nextProps.editable) {
         this.cacheValue = this.state.value;
      }
    }
    /*if (nextProps.status && nextProps.status !== this.props.status) {
     if (nextProps.status === 'save') {
     this.props.onChange(this.state.value);
     } else if (nextProps.status === 'cancel') {
     this.setState({ value: this.cacheValue });
     this.props.onChange(this.cacheValue);
     }
     }*/
  }
  /*shouldComponentUpdate(nextProps, nextState) {
   return nextProps.editable !== this.state.editable ||
   nextState.value !== this.state.value;
   }*/
  /**-------------------**/
  handleChange(e) {
    const value = e.target.value;
    this.setState({ value });
    this.triggerChange(value)
  }

  /**---------- 触发监听-------------- **/
  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, {value: this.state.value}, changedValue));
    }
  }

  render() {
    const {value, record, index, _pRecord, _index, fieldName,  component, notEditableComponent,  ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const { editable } = this.state;
    // console.log(editable);

    const notEditableComponentEle = typeof notEditableComponent === 'function' ?
                                            <notEditableComponent {...this.props}/> :
                                            (notEditableComponent && notEditableComponent.type) ? notEditableComponent :
                                            typeof value !== 'object' ?
                                              value && component.type === DatePicker.prototype.constructor ? moment(value).format("YYYY-MM-DD HH:mm:SS") : value
                                              : undefined
    return (
      <div>
        { editable ?
            <div>
              {
                typeof component === 'function' ?
                  getFieldDecorator(`${fieldName}`, {
                    initialValue: value,
                    rules: false
                  })(
                    <component />
                  ) :
                  component && typeof component.type === 'function' ?
                    getFieldDecorator(`${fieldName}`, {
                      initialValue: value && component.type === DatePicker.prototype.constructor ? moment(value) : value,
                      rules: false
                    })(
                      component
                    ) :
                    ''
              }
            </div>
            :
            <div className="editable-row-text">
              {notEditableComponentEle}
            </div>
        }
      </div>
    );
  }
}

EditableCell = Form.create()(EditableCell)

class EditTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    }
  }

  render() {
    return (
      <div>
        < Table
          rowKey={(record, i)=>{return i}}
          {...this.props}
        />
      </div>
    );
  }
}

/**
 *  作者：贾鹏涛
 *  时间：2017/8/8
 *  功能：使用登记对话框；完成二级表( 货物信息表、使用等级表)。
 * **/
class ViewUseOrderModal  extends Component{

  _retInitialState = ()=>{
    return {
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                            // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      selectedRowKeys: [],
      expandedRowKeys: [],
      tableLoading: false,
      editTableListPage: {
        pageIndex: 1,
        pageSize: 999,
        rows: [],
        total: 0
      },
      listPage: {
        pageIndex: 1,
        pageSize: 5,
        rows: [],
        total: 0
      },
      writeWasteResolveModal: {
        title: '',
        visible: false,
        data: {}
      },
      viewWasteResolveModal: {
        title: '',
        visible: false,
        data: {}
      },
      hexiaodanCode: '',                                              //核销单号。
      /* [`data-${record[this.props.rowKey]}`]: {
       status: 'loading',
       listPage: {
       pageIndex: 1,
       pageSize: 10,
       rows: [],
       total: 0
       }
       }*/
      /*  [`data-record${record[this.props[this.props.rowKey]]}-r${record.id}-${fieldName}`]: {}*/
    }

  };

  constructor(props){
    super(props);
    this.state = this._retInitialState();
  }

  componentDidMount(){

  }

  componentWillReceiveProps(nextProps){
    const {visible, data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData && newData){
      const {hexiaodanCode} = newData;
      const {listPage: {pageIndex, pageSize}} = this.state;
      this.getEntryStoreList({pageIndex, pageSize, ...newData}, (err, res)=>{
        if(err){
          message.error(err.message || `核销单：${hexiaodanCode}       获取物品失败`)
          return;
        }

        const {responseObject} = res;
        this.setState({
          listPage: responseObject
        })
      })
    }
  }

  handleChange(key, index, value) {
    const { data } = this.state;
    data[index][key].value = value;
    this.setState({ data });
  }

  renderColumns({record, index, fieldName, value, _pRecord, _index, component, notEditableComponent, ...props}) {
    const { editable, status } = record;
    /* if(typeof editable === 'undefined') {return value;}*/
    const pId = _pRecord[this.props.rowKey];
    const childId = record["id"];

    return (
      <EditableCell  // 可编辑单元格
          editable={editable}
          record={record}
          form={this.props.form}
          index={index}
          fieldName={`${pId}-${childId}-${fieldName}`}
          value={value}
          _pRecord={_pRecord}
          _index={_index}
          component={component}
          notEditableComponent={notEditableComponent}
          {...props}
          status={status}
       />
     );
  }
  /*
   * @interface 可编辑单元格。
   * */
  edit = ({index, record, value, _pRecord, _pIndex})=> {
    const data = this.state[`data-recordId${_pRecord[this.props.rowKey]}`];
    console.log("可编辑单元格", data );
    const {listPage: {rows = []}} = data;
      rows.forEach((row, i)=>{
        if(index === i) {
          row.editable = true
        }else{
          row.editable = false
        }
      });

    this.setState({
      [`data-recordId${_pRecord[this.props.rowKey]}`]: data
    });
  };

//-------------------------------------------  第三级表的：新增使用记录 start -----------------------------------------
  addProductDetails = (data, callback)=>{ //新增使用登记数据接口。
    fetch('ciq.uselog.save', {
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
        let listPage = this.state.editTableListPage;
        const _data = this.state[`data-recordId${data.entryStoreDetailId}`];
        this.setState({
          [`data-recordId${data.id}`]: {
            status: 'loading',
            listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
          }
        })
      },
      complete: ()=>{
        let listPage = this.state.editTableListPage;
        const _data = this.state[`data-recordId${data.entryStoreDetailId}`];
        this.setState({
          [`data-recordId${data.id}`]: {
            status: 'loading',
            listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
          }
        })
      }
    })
  }
  /*
   * @interface 点击“新增按钮”。
   * */
  addProductDetailsClick = (record)=>{
    console.log("新增按钮:", record );
    const row = createUserLogRow(); //1.创建一行使用记录情况。
    this.addProductDetails({entryStoreDetailId: record.id, ...row}, (err, res)=>{ //2.新增使用记录数据。
      if(err){
        message.error(err.message || '新增记录失败，请重试');
        return;
      }

      this.getUserLogList(record, (err, res)=>{ //3.获取到，使用登记列表的某一条记录。
            if(err){
              message.error(err.message || '获取产品使用记录列表失败');
              let listPage = this.state.editTableListPage;
              const data = this.state[`data-recordId${record.id}`];
              this.setState({
                [`data-recordId${record.id}`]: {
                  status: 'error',
                  listPage: data && data['listPage'] ? data['listPage'] : listPage
                }
              });
              return;
            }

            const {responseObject} = res;
            let listPage = this.state.editTableListPage;
            const data = this.state[`data-recordId${record.id}`];
            this.setState({
              [`data-recordId${record.id}`]: {
                status: 'success',
                listPage: responseObject || listPage,
              }
            })
      })
    })
  };
//------------------------------------------ end -----------------------------------------------------

//------------------------------------------ 提交start ----------------------------------------------
  submitUseLog = (data, callback)=>{
    fetch('ciq.uselog.submit', {
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
          [`tableLoading${data.entryDetailId}`]: true
        })
      },
      complete: ()=>{
        this.setState({
          [`tableLoading${data.entryDetailId}`]: false
        })
      }
    })
  }
  /*
   * @interface 提交使用记录。
   * */
  submitUseLogClick = (_pRecord = {}, editTableDataSource = [])=>{
    console.log('editTableDataSource数组:',editTableDataSource );
    Modal.confirm({
      width: 416,
      title: '你确定要提交本次修改吗',
      content: '',
      okText: "确定",
      cancelText: "取消",
      maskClosable: false,
      onOk: ()=>{
        return new Promise((resolve, reject)=>{
          this.submitUseLog({useLogIds: editTableDataSource.map((row)=>(row.id)).join(",") || ''}, (err, res)=>{ //1.提交。
            resolve && resolve();
            if(err){
              message.error(err.message || '提交失败');
              return;
            }

            this.getUserLogList({id: _pRecord.id, pageIndex: 1, pageSize: 999}, (err, res)=>{ // 2.查询。
              if(err){
                let listPage = this.state.editTableListPage;
                const data = this.state[`data-recordId${_pRecord.id}`];
                this.setState({
                  [`data-recordId${_pRecord.id}`]: {
                    status: 'error',
                    listPage: data && data['listPage'] ? data['listPage'] : listPage
                  }
                });
                return;
              }

              const {responseObject = {}} = res;
              let listPage = this.state.editTableListPage;
              const data = this.state[`data-recordId${_pRecord.id}`];
              this.setState({
                [`data-recordId${_pRecord.id}`]: {
                  status: 'success',
                  listPage: responseObject
                }
              });
            })
          })
        })
      },
      onCancel: ()=>{
      }
    });
  }
//------------------------------------------ end ----------------------------------------------------

  deleteProductDetails = ({record, _pRecord}, callback)=>{
    fetch('ciq.uselog.remove', {
      // method: 'post',
      // headers: {},
      data: {id: record.id},
      success: (res)=>{
        callback && callback(null, res)
      },
      error: (err)=>{
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        let listPage = this.state.editTableListPage;
        const data = this.state[`data-recordId${_pRecord.id}`];
        this.setState({
          [`data-recordId${_pRecord.id}`]: {
            status: 'loading',
            listPage: data && data['listPage'] ? data['listPage'] : listPage
          }
        })
      },
      complete: ()=>{
        let listPage = this.state.editTableListPage;
        const data = this.state[`data-recordId${_pRecord.id}`];
        this.setState({
          [`data-recordId${_pRecord.id}`]: {
            status: '',
            listPage: data && data['listPage'] ? data['listPage'] : listPage
          }
        })
      }
    })
  };
  deleteClick = ({record, _pRecord})=>{
    const pId = _pRecord[this.props.rowKey];
    const childId = record["id"];
    this.deleteProductDetails({record, _pRecord}, (err, res)=>{
      if(err){
        message.error(err.message || '删除使用记录是失败，请稍后重试')
        return
      }

      this.getUserLogList({id: _pRecord.id, pageIndex: 1, pageSize: 999}, (err, res)=>{
        if(err){
          let listPage = this.state.editTableListPage;
          const data = this.state[`data-recordId${_pRecord.id}`];
          this.setState({
            [`data-recordId${_pRecord.id}`]: {
              status: 'error',
              listPage: data && data['listPage'] ? data['listPage'] : listPage
            }
          });
          return;
        }

        const {responseObject = {}} = res;
        let listPage = this.state.editTableListPage;
        const data = this.state[`data-recordId${_pRecord.id}`];
        this.setState({
          [`data-recordId${_pRecord.id}`]: {
            status: 'success',
            listPage: responseObject
          }
        });
      })
    })
  };

//-----------------------------------------“保存”使用登记记录start ----------------------------------------------------
  savehexiaodanCode = (data, callback)=>{ //传给后台，核销单号。
    fetch('ciq.uselog.saveusedate', {
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
        let listPage = this.state.editTableListPage;
        const _data = this.state[`data-recordId${data.entryStoreDetailId}`];
        this.setState({
          [`data-recordId${data.id}`]: {
            status: 'loading',
            listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
          }
        })
      },
      complete: ()=>{
        let listPage = this.state.editTableListPage;
        const _data = this.state[`data-recordId${data.entryStoreDetailId}`];
        this.setState({
          [`data-recordId${data.id}`]: {
            status: 'loading',
            listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
          }
        })
      }
    })
  }
  saveProductDetails = (data, callback)=>{ //新增使用登记接口。
    fetch('ciq.uselog.save', {
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
        let listPage = this.state.editTableListPage;
        const _data = this.state[`data-recordId${data.entryStoreDetailId}`];
        this.setState({
          [`data-recordId${data.id}`]: {
            status: 'loading',
            listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
          }
        })
      },
      complete: ()=>{
        let listPage = this.state.editTableListPage;
        const _data = this.state[`data-recordId${data.entryStoreDetailId}`];
        this.setState({
          [`data-recordId${data.id}`]: {
            status: 'loading',
            listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
          }
        })
      }
    })
  }
  /*
   * @interface  保存
   * */
  saveClick = ({record, _pRecord, fieldNames = []})=>{
    console.log('record',record, ' _pRecord',_pRecord,' fieldNames',fieldNames);
    const pId = _pRecord[this.props.rowKey];
    const childId = record["id"];
    const _fieldNames = fieldNames.map((fieldName)=>{
      return `${pId}-${childId}-${fieldName}`
    });

    this.props.form.validateFields((err, values)=>{
      if(err){
        return
      }
      console.log('values',values);
      const fieldNames = _fieldNames.map((_fieldName)=>{
        return _fieldName.split("-").splice(2)
      });
      const params = {};
      fieldNames.map((fieldName)=>{
        // console.log(values, values[`${pId}-${childId}-${fieldName}`])
        params[fieldName] = values[`${pId}-${childId}-${fieldName}`]
      });
      params["useDate"] = params["useDate"] && params["useDate"].unix() * 1000; //

      //1.上传是对象。
      if(typeof  params["path"] == "object"){
          params["path"] =  params["path"] && params["path"]['filePath'];
      }//2.上传文件是字符串路径时。
      else if(typeof params["path"] == "string"){
          params["path"] =  params["path"] && params["path"];
      }

      console.log('path',params);
      const {hexiaodanCode} = _pRecord;
      //console.log('hexiaodanCode',hexiaodanCode);
      this.savehexiaodanCode({hexiaodanCode: hexiaodanCode}, (err, res)=>{
        if(err){
          message.error(err.message ||`保存核销单号错误`);
          return
        }
      })
      this.saveProductDetails({entryStoreDetailId: pId, id: childId, ...params}, (err, res)=>{
        if(err){
          message.error(err.message)
          return
        }
        this.getUserLogList(_pRecord, (err, res)=>{
          if(err){
            let listPage = this.state.editTableListPage;
            const data = this.state[`data-recordId${pId}`];
            this.setState({
              [`data-recordId${pId}`]: {
                status: 'error',
                listPage: data && data['listPage'] ? data['listPage'] : listPage
              }
            });
            return;
          }

          const {responseObject} = res;
          let listPage = this.state.editTableListPage;
          const data = this.state[`data-recordId${pId}`];
          this.setState({
            [`data-recordId${pId}`]: {
              status: 'success',
              listPage: responseObject
            }
          });
        })
      })
    })
  };
//----------------------------------------------- end ---------------------------------------------------------

  cancelClick = ({_pRecord, index})=>{
    const {status, listPage} = this.state[`data-recordId${_pRecord.id}`];
    if(listPage) {
      const {rows = []} = listPage
      try{ rows[index]["editable"] = false}catch(e){}
      this.setState({
        [`data-recordId${_pRecord.id}`]: {
          status: status,
          listPage: {
            ...listPage,
            rows: rows
          }
        }
      })
    }
  };

  editDone = (index, type) => {
    const { data } = this.state;
    Object.keys(data[index]).forEach((item) => {
      if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
        data[index][item].editable = false;
        data[index][item].status = type;
      }
    });
  };

  expandedRowRender = (_pRecord, index) => {
    let status, listPage = this.state.editTableListPage;
    const editTableData = this.state[`data-recordId${_pRecord[this.props.rowKey]}`];
    if(editTableData){
        status = editTableData['status'];
        listPage = editTableData['listPage'];
    }
    const formProps = {size: 'small' };
    const borderStyle= {border:"1px solid #B8CCE2",padding:2, cursor:'pointer'};
    const userRole = localStorage.getItem(USER_ROLE);
    const columns = [
        {title: '序号', dataIndex: 'sn', key: 'sn', render: (value, record, i)=>{ return i + 1}},
        {title: '附件', dataIndex: 'path', key: 'path', width: 80,
              render: (value, record, i)=>{
                 return this.renderColumns({
                       record, index: i, fieldName: fieldNames["path"], value: InputUpload.valueToObj(value), _pRecord, _index: index, notEditableComponent: value ? <InputUpload status="success" value={value} hasRemoveIcon={false}></InputUpload> : null , component: <InputUpload style={borderStyle}>上传</InputUpload>
                 })
              }
        },
        {title: '状态', dataIndex: 'status', key: 'statues', width: 80, render: (value, record, i)=>{
          if (value === 0) {
            return (
              <span style={{color:'#f00'}}>未提交</span>
            )
          } else if (value === 1) {
            return (
              <span style={{color:'#0066ff'}}>已提交</span>
            )
          }else {
            return (
              <span></span>
            )}
        }},
        {title: '日期', dataIndex: 'useDate', key: 'useDate', render: (value, record, i)=>{ return this.renderColumns({record, index: i, fieldName: fieldNames["useDate"], value, _pRecord, _index: index, notEditableComponent: value ?  moment(value).format('YYYY-MM-DD HH:mm:SS') : value , component: <DatePicker {...formProps} showTime format={`YYYY-MM-DD HH:mm:SS`}/>})}},
        {title: '用量', dataIndex: 'amount', key: 'amount', render: (value, record, i)=>{ return this.renderColumns({record, index: i, fieldName: fieldNames["amount"], value, _pRecord, _index: index, component: <Input {...formProps}/>})}},
        {title: '用量单位', dataIndex: 'amountUnit', key: 'amountUnit', render: (value, record, i)=>{ return this.renderColumns({record, index: i, fieldName: fieldNames["amountUnit"], value, _pRecord, _index: index, component: <Input {...formProps}/>})}},
        {title: '用途', key: 'purpose', dataIndex: 'purpose', render: (value, record, i)=>{ return this.renderColumns({record, index: i, fieldName: fieldNames["purpose"], value, _pRecord, _index: index, component: <Input {...formProps}/>})}},
        {title: '结果', dataIndex: 'result', key: 'result', render: (value, record, i)=>{ return this.renderColumns({record, index: i, fieldName: fieldNames["result"], value, _pRecord, _index: index, component: <Input {...formProps}/>})}},
        {title: '剩余量', dataIndex: 'restAmount', key: 'restAmount', render: (value, record, i)=>{ return this.renderColumns({record, index: i, fieldName: fieldNames["restAmount"], value, _pRecord, _index: index ,component: <Input {...formProps}/>})}},
        {title: '废液处理情况', dataIndex: 'name3', key: 'name3', width: 100, render: (value, record, i)=>{
          return <div>
            <Permission resId={'/hxjg/use/writeWasteResolve'}>
              <a
                style={{marginRight: 8}}
                onClick={this.writeWasteResolveClick.bind(this, {record, index: i, _pRecord, _index: index})}>填写</a>
            </Permission>
            <a onClick={this.viewWasteResolveClick.bind(this, {record, index: i, _pRecord, _index: index})}>查看</a>
          </div> }  },
        {title: '使用人', dataIndex: 'opPeople', key: 'opPeople', render: (value, record, i)=>{ return this.renderColumns({record, index: i, fieldName: fieldNames["opPeople"], value, _pRecord, _index: index, component: <Input {...formProps}/>})}},
        // {title: '负责人审核', dataIndex: 'name5', key: 'name5', render: (value, record, i)=>{ return this.renderColumns({record, index: i, fieldName: fieldNames["date"], value, _pRecord, _index: index, component: <Input {...formProps}/>})}},
        {title: '备注', dataIndex: 'remark', key: 'remark', render: (value, record, i)=>{ return this.renderColumns({record, index: i, fieldName: fieldNames["remark"], value, _pRecord, _index: index, component: <Input {...formProps}/>})}},
        {title: '操作',dataIndex: 'operation',key: 'operation',width: 100,
            render: (value, record, i) => {
                  const {editable, status} = record ;
                  const isStatus0 = status === 0;
              return (
                <Permission
                  resId={'/hxjg/use/userLogOperation'}
                  resType={`btn`}
                  resRole={[`ciq_kehu`]}>
                  <ButtonContainer style={{margin: 0}}>
                    {
                      !editable ?
                        isStatus0 ?
                          <span>
                              <Button
                                onClick={this.edit.bind(this, {index: i, record, _pRecord, _index: index})}
                                title="修改"
                                shape="circle"
                                type="primary"
                                icon="edit"/>
                               <Popconfirm
                                 title="你确定要删除该条记录吗？"
                                 onConfirm={this.deleteClick.bind(this, {record, _pRecord})}>
                                 <Button
                                   title="删除"
                                   shape="circle"
                                   type="danger"
                                   icon="delete"/>
                               </Popconfirm>
                          </span>
                          :  undefined
                        :
                        <span>
                             <Button
                               onClick={this.saveClick.bind(this, {record, _pRecord,  fieldNames:Object.keys(fieldNames).map((key)=>{return fieldNames[key]})}   )}
                               title="保存"
                               shape="circle"
                               type="primary"
                               icon="check-circle"/>
                             <Button
                               onClick={this.cancelClick.bind(this, {_pRecord, index: i, record, _index: index})}
                               title="取消"
                               shape="circle"
                               type="primary"
                               icon="close-circle"/>
                       </span>
                    }
                  </ButtonContainer>
                </Permission>
              )
            }
        },
    ];
    const {rows: dataSource} = listPage;
    const isSubmitBtnDisabled = dataSource.some((row)=>{ return row["status"] == 0});//some如果有一个元素满足条件，则表达式返回true。

    return (
      <Spin
        spinning={false}
        tip={`请求数据中`}>
        {status === 'error' ?
            <div className="ant-table-placeholder"><span><i className="anticon anticon-frown-o"></i>获取数据失败</span>
              <div style={{fontSize: 16, fontWeight: 500}}><a onClick={this.getUserLogList.bind(this, _pRecord)}>重新获取数据</a></div>
            </div> :

            <div>
              <ButtonContainer style={{display: 'inline-block', margin: 0}}>
                    <Permission resId={'/hxjg/use/addUserLog'}>
                      <Button
                        onClick={this.addProductDetailsClick.bind(this, _pRecord)}
                        size={'small'}
                        type="primary"
                        icon="plus-circle">新增使用记录</Button>
                    </Permission>
                    <Permission
                      resId={'/hxjg/use/submitUseLogBtn'}
                      resType={`btn`}
                      resRole={[`ciq_kehu`]}>
                      <Button
                        onClick={this.submitUseLogClick.bind(this, _pRecord, dataSource)}
                        disabled={!isSubmitBtnDisabled}
                        size={'small'}
                        type="primary"
                        icon="upload">提交</Button>
                    </Permission>
              </ButtonContainer>

              {/**----------- 使用登记情况的第三级表。---------------*/}
              <EditTable
                style={{maxWidth: 1150, backgroundColor: '#ffffff'}}
                bordered
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                scroll={{x: 1150}}/>
            </div>
        }
      </Spin>
    );
  };

  _resetSelectedRows = ()=>{ //清空。
    this.setState({
      selectedIds: [],
      selectedRows: [],
      selectedRowKeys: []
    })
  };

  /*
   * 获取订单列表的所有查询条件
   * @param {object} pageQuery 分页查询对象
   * @return {object} 列表所有查询条件参数对象
   * */
  _getAllListQuery = (pageQuery = {})=>{
    // step1 获取所有查询参数
    let _f = {};
    this.props.form.validateFields((err, values)=>{
      _f = values
    });
    return {
      ..._f,
      ...pageQuery
    }
  };

  /*
   * @interface 获取使用登记产品列表
   * */
  getEntryStoreList = (query)=>{
    // step1. 获取查询阐参数
    const _q = this._getAllListQuery(query);

    this._resetSelectedRows();
    // console.log(_q);
    // step2. 请求列表数据
    fetch('ciq.entrystore.listdetail', {
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
   * @param {string}  sortColumn   排序的列名
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



/*  onSelectChange = (selectedRowKeys, selectedRows) => {//selectedRowKeys指定选中项的 key 数组，
    console.log(selectedRowKeys)
    const hasSelected =  selectedRowKeys.some((key)=>{//执行顺序：由内向外；内部先出个结果，在来执行外部。
      return this.state.selectedRowKeys.some((_key)=>{
        return key == _key
      })
    });
    if(hasSelected){
      this.setState({selectedIds: [], selectedRows: [], selectedRowKeys: [] });
    }else{
      this.setState({selectedIds: selectedRows.map((row)=>{ return row[this.props.rowKey]}), selectedRows: selectedRows,  selectedRowKeys: selectedRowKeys});
    }
  };
  */

//----------------------------------------------- onExpand展示登记情况列表( 三级表 ) -------------------------------------------------------------
  /*
   * @interface 获取使用登记列表的某一条记录，的使用登记情况列表。
   * */
  getUserLogList = (data, callback)=>{
    fetch('ciq.uselog.list', {
      // method: 'post',
      // headers: {},
      data: {entryStoreDetailId: data.id, pageIndex: 1, pageSize: 999},
      success: (res)=>{
        callback && callback(null, res)
      },
      error: (err)=>{
        callback && callback(err, null)
      },
      beforeSend: ()=>{
        let listPage = this.state.editTableListPage;
        const _data = this.state[`data-recordId${data[this.props.rowKey]}`];
        this.setState({
          [`data-recordId${data[this.props.rowKey]}`]: {
            status: 'loading',
            listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
          }
        })
      },
      complete: (err, res)=>{
        let listPage = this.state.editTableListPage;
        const _data = this.state[`data-recordId${data[this.props.rowKey]}`];
        this.setState({
          [`data-recordId${data[this.props.rowKey]}`]: {
            status: '',
            listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
          }
        })
      }
    })
  }

  onExpand = (expanded, record)=>{
    if(expanded){
      this.getUserLogList({...record, pageIndex: 1, pageSize: 999}, (err, res)=>{
        if(err){
          let listPage = this.state.editTableListPage;
          const _data = this.state[`data-recordId${record[this.props.rowKey]}`];
          this.setState({
            [`data-recordId${record[this.props.rowKey]}`]: {
              status: 'error',
              listPage: _data && _data['listPage'] ? _data['listPage'] : listPage
            }
          });
          return
        }

        const {responseObject = {}} = res;
        //let listPage = this.state.editTableListPage;
        //const _data = this.state[`data-recordId${record[this.props.rowKey]}`];
        this.setState({
          [`data-recordId${record[this.props.rowKey]}`]: {
            status: 'success',
            listPage: responseObject
          },
        })
      })
    }
  };
//-----------------------------------------------------------------------------------------------------------------------------


  onExpandedRowsChange = (expandedRowKeys)=>{
    this.setState({
      expandedRowKeys: expandedRowKeys
    })
  };

  onSelection = (record, selected, selectedRows)=>{
    console.log(record, selected ,selectedRows)
  };

  onTableRowClick = (record, index)=>{
    const hasSelected =  this.state.selectedRowKeys.some((key)=>{
      return key === index
    });
    if(hasSelected){
      this.setState({selectedIds: [], selectedRows: [], selectedRowKeys: [] });
    }else{
      this.setState({selectedIds: [record.id], selectedRows: [record], selectedRowKeys: [index]});
    }

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
   * @interface 获取查验通知明细
   * @param {object} props 参数
   * */
  getCheckNotificationDetails = ({data}, callback)=>{
    fetch('ciq.checktask.detail', {
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

  /*
   * @interface 判断是否只选中一行数据
   * @param {array} selectedIds 选中的行数组
   * return {boolean} 只选中一行数据返回true否则返回false
   * */
  _hasSelectedOnlyOneIdx = (selectedIds = [], nullText = undefined, moreText = undefined)=>{
    if(selectedIds.length === 0){
      // s1-case1. 没有选中任何行数据提示
      message.warn(`${nullText || '你未选中任何查验通知'}`);
      return false
    }else if(selectedIds.length > 1 ){
      // s1-case2. 选中超过2行数据提示
      message.warn(`${moreText || '你只能选择一条查验通知'}`);
      return false;
    }
    return true
  };

  getWasteResolveDetails = (data, callback = ()=>{})=>{
    fetch('ciq.checktask.detail', {
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
  }

  /*
   * @interface 显示添加订单对话框
   * @param {string} type 操作类型
   * @param {array} 选中的行数据
   * */
  writeWasteResolveClick= ({record, index, _pRecord, _index})=>{
    this.showWasteResolveModal({record, index, _pRecord, _index, info: record})
  };

  showWasteResolveModal = ({record, index, _pRecord, _index, info})=>{
    this.setState(({writeWasteResolveModal})=>{
      return {
        writeWasteResolveModal: {
          ...writeWasteResolveModal,
          visible: true,
          data: {
            record,
            index,
            _pRecord,
            _index,
            info
          }
        }
      }
    })
  };

  /*
   * @interface 隐藏订单对话框
   * */
  hiddenWasteResolve = ()=>{
    this.setState(({writeWasteResolveModal})=>{
      return {
        writeWasteResolveModal: {
          ...writeWasteResolveModal,
          visible: false,
          data: {}
        }
      }
    })
  };

  /*
   * @interface 添加查验通知单对话框的回调
   * @param {object} info 返回的信息对象
   * */
  writeWasteResolveCallback= (info)=>{
    const {click, data: {record = {}, _pRecord = {}}, callback} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenWasteResolve();
      callback && callback()
      return;
    }

    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      // console.log(info);
      this.getUserLogList(_pRecord, (err, res)=>{
        if(err){
          let listPage = this.state.editTableListPage;
          const data = this.state[`data-recordId${_pRecord[this.props.rowKey]}`];
          this.setState({
            [`data-recordId${_pRecord[this.props.rowKey]}`]: {
              status: 'error',
            }
          });
          return;
        }

        const {responseObject ={}} = res;
        this.setState({
          [`data-recordId${_pRecord[this.props.rowKey]}`]: {
            status: 'success',
            listPage: responseObject
          }
        });
      });
      this.hiddenWasteResolve();
      callback && callback();
      return;
    }
  };

  /*
   * @interface 显示添加订单对话框
   * @param {string} type 操作类型
   * @param {array} 选中的行数据
   * */
  viewWasteResolveClick= ({record, index, _pRecord, _index})=>{
    this.showViewWasteResolveModal({record, index, _pRecord, _index, info: record})
  };

  showViewWasteResolveModal = ({record, index, _pRecord, _index, info})=>{
    this.setState(({viewWasteResolveModal})=>{
      return {
        viewWasteResolveModal: {
          ...viewWasteResolveModal,
          visible: true,
          data: {
            record,
            index,
            _pRecord,
            _index,
            info
          }
        }
      }
    })
  };

  /*
   * @interface 隐藏订单对话框
   * */
  hiddenViewWasteResolve = ()=>{
    this.setState(({viewWasteResolveModal})=>{
      return {
        viewWasteResolveModal: {
          ...viewWasteResolveModal,
          visible: false,
          data: {}
        }
      }
    })
  };

  /*
   * @interface 添加查验通知单对话框的回调
   * @param {object} info 返回的信息对象
   * */
  viewWasteResolveCallback= (info)=>{
    const {click, data: {record = {}, _pRecord = {}}, callback} = info;
    // 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenViewWasteResolve();
      callback && callback()
      return;
    }

    // 如果点击确定按钮，则提交表单
    if(click === 'ok'){
      // console.log(info);
      this.hiddenViewWasteResolve();
      callback && callback();
      return;
    }
  };
//------------------------------------------------------------------------------------------------------

  /*
   * @interface 判断期望值与实际值是否相等
   * @param {any} exceptValue 期望值
   * @param {any} realValue 实际值
   * @return {boolean} 如果两个值相等则返回true否则返回false
   * */
  _isExpectStatusValue = (exceptValue, realValue)=>{
    return exceptValue === realValue
  };

  onOk = ()=> {
    this.props.callback && this.props.callback({
        click: 'ok',
        data: this.props.data || {}
    });
    /* return new Promise((resolve, reject) => {
     setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
     }).catch(() => console.log('Oops errors!'));*/
  };

  onCancel = ()=> {
    this.props.callback && this.props.callback({
        click: 'cancel',
        data: this.props.data
    });
  };

  render() {
    const {prefix, title, visible, style, data, ...props} =this.props;
    const { getFieldDecorator } = this.props.form;
    const {selectedIds, selectedRows, selectedRowKeys, spinning, tip, expandedRowKeys,
      listPage: {pageIndex, pageSize, rows: dataSource, total}, writeWasteResolveModal, viewWasteResolveModal} = this.state;
    // console.log(selectedIds, selectedRows)

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
        this.getEntryStoreList({pageIndex: current, pageSize})
      }
    };

    const _columns = [
      {
        title: '序号',
        dataIndex: 'sn',
        key: 'sn' ,
        width: 50,
        // fixed: 'left',
        render: (value, record, i)=>{
          return (pageIndex - 1) * pageSize + i +1
        }
      },
      {
        title: '核销单号',
        dataIndex: 'hexiaodanCode',
        key: 'hexiaodanCode' ,
        width: 200,
        // fixed: true,
        render: (value, record, i)=>{
          return value
        }
      },
      {
        title: '中文名',
        dataIndex: 'name',
        key: 'name' ,
        width: 200,
        // fixed: true,
        render: (value, record, i)=>{
          return value
        }
      },
      {
        title: '英文名',
        dataIndex: 'nameEn',
        key: 'nameEn' ,
        width: 200,
        // fixed: true,
        render: (value, record, i)=>{
          return value
        }
      },
      {
        title: '规格',
        dataIndex: 'spec',
        key: 'spec' ,
        width: 100,
        // fixed: 'left',
        render: (value, record, i)=>{
          return value
        }
      },
      {
        title: '批号',
        dataIndex: 'batch',
        key: 'batch' ,
        width: 200,
        render: (value, record, i)=>{
          return value
        }
      },
      {
        title: '厂家',
        dataIndex: 'manufacturer',
        key: 'manufacturer' ,
        width: 200,
        render: (value, record, i)=>{
          return value
        }
      },
      {
        title: '数量',
        dataIndex: 'productCount',
        key: 'productCount' ,
        render: (value, record, i)=>{
          return value
        }
      },
      {
        title: '单位',
        dataIndex: 'countUnit',
        key: 'countUnit' ,
        render: (value, record, i)=>{
          return value
        }
      },
      {
        title: '状态',
        dataIndex: 'name5',
        key: 'name5' ,
        render: (value, record, i)=>{

        }
      },
      {
        title: '有效期',
        dataIndex: 'name11',
        key: 'name11' ,
        render: (value, record, i)=>{
          return value
        }
      },
      {
        title: '入库日期',
        dataIndex: 'name6',
        key: 'name6' ,
        render: (value, record, i)=>{

        }
      },
      {
        title: '保存状态',
        dataIndex: 'name3',
        key: 'name3' ,
        render: (value, record, i)=>{
          return value
        }
      },
      {
        title: '负责人',
        dataIndex: 'name7',
        key: 'name7' ,
        render: (value, record, i)=>{
          return value
        }
      },
      {
        title: '申购单号',
        dataIndex: 'name8',
        key: 'name8' ,
        width: 100,
        render: (value, record, i)=>{
          return value
        }
      }
    ];

    const rowSelection = {
        type: 'radio',
        selectedRowKeys: selectedRowKeys,   //指定选中项的 key 数组，需要和 onChange 进行配合
        onChange: this.onSelectChange,      //选中项发生变化的时的回调。
        /*   selections: [{
         key: 'odd',
         text: 'Select Odd Row',
         onSelect: (changableRowKeys) => {
         let newSelectedRowKeys = [];
         newSelectedRowKeys = changableRowKeys.filter((key, index) => {
         if (index % 2 !== 0) {
         return false;
         }
         return true;
         });
         this.setState({ selectedRowKeys: newSelectedRowKeys });
         },
         }, {
         key: 'even',
         text: 'Select Even Row',
         onSelect: (changableRowKeys) => {
         let newSelectedRowKeys = [];
         newSelectedRowKeys = changableRowKeys.filter((key, index) => {
         if (index % 2 !== 0) {
         return true;
         }
         return false;
         });
         this.setState({ selectedRowKeys: newSelectedRowKeys });
         },
         }],*/
        // onSelect: this.onSelection,
    };

    return (
       <ModalA
        width={1300}
        // confirmLoading={confirmLoading}
        title={<div><div style={{marginRight: 8}}>核销单号：{data.hexiaodanCode}</div></div>}
        visible={visible}
        //okText="保存"
        //cancelText="取消"
        //onOk={this.onOk}
        onCancel={this.onCancel}
        footer={[<Button key="submit" type="primary" size="large" onClick={this.onCancel}>关闭</Button>, ]}
        maskClosable={false}
        bodyStyle={{margin: 0}}
        bodyMinHeight={'auto'}
        //footer={null}
        //maskClosable={true}
        bodyMinHeight={500}
        {...props}
       >
          <div>
            {getFieldDecorator(`hexiaodanCode`, {
              initialValue: data.hexiaodanCode,
              rules: null
            })(
              <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
              />
            )}
          </div>
          <div {...props}>
            <div className="hidden">
              {<WriteWasteResolveModal
                {...writeWasteResolveModal}
                callback={this.writeWasteResolveCallback}/>}
              <ViewWasteResolveModal
                {...viewWasteResolveModal}
                callback={this.viewWasteResolveCallback}/>
            </div>
            <Spin
              spinning={spinning}
              tip={tip}>

              <Table
                  loading={spinning}
                  size="small"
                  bordered
                  columns={_columns}
                  rowKey={(record, i)=>{return `${record.id}`}}
                  rowClassName={(record, i)=>{ return this.state.selectedRows.some((row) => {return record[this.props.rowKey] === row[this.props.rowKey]} ) ? 'ant-table-row-hover': ''}}
                  expandedRowKeys={expandedRowKeys}
                  expandedRowRender={this.expandedRowRender}//展开某条样品记录，的使用记录列表。
                  onExpand={this.onExpand}   //点击“+”展开
                  onExpandedRowsChange={this.onExpandedRowsChange}
                  dataSource={dataSource}
                  // rowSelection={rowSelection}  //选择功能的配置
                  pagination={_pagination}
                  height={400}     // ??? 没起作用。
                  scroll={{x: 1650}}
              />
            </Spin>
          </div>
       </ModalA>
    )
  }
}

ViewUseOrderModal.propTypes = {
  data: PropTypes.any,
  rowKey: PropTypes.string,

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

ViewUseOrderModal.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

export default Form.create()(ViewUseOrderModal);
