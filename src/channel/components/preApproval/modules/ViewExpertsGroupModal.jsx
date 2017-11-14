import React, { Component, PropTypes } from 'react';
import {Form, Select, Upload, Icon, Input, DatePicker,
  Popconfirm, Row, Col, Button, InputNumber, message, Radio, Tabs, Alert, Table} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {remove} from 'antd/../../src/utils/arrayUtils.js'
import {fetch, CONFIG} from './../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable, InputUpload} from './../../../../components/'
import {dimsMap} from './../../helpers/'
import './customTable.less'
const {custom: {entryExit}} = dimsMap;

function noop(){}


class ViewExpertsGroupModal extends Component{
  _retInitialState = ()=>{
    return {
      confirmLoading: false,
      //activeKey: '1',                 // 激活的tabPane的key，

    }
  };
  constructor(props){
    super(props);
    this.state = this._retInitialState()

  }

  componentWillReceiveProps(nextProps){
    //console.log("nextProps:",nextProps)
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData) {
    }
  }

  handleRowUpdated = ({ rowIdx, updated })=> {
    // merge updated row with current row and rerender by setting state
    const {listPage} = this.state;
    const {rows} = listPage;
    Object.assign(rows[rowIdx], updated);
    this.setState({
      listPage
    });
  };

  onOk = ()=> {};
  onCancel = ()=> {
    this.props.callback && this.props.callback({
      click: 'cancel',
      data: null
    });
    this.setState(this._retInitialState());
    this.props.form.resetFields()
  };
  /*
   * @interface 显示添加货物对话框
   * */
  add = ({type, rowIdx, data})=>{
    if(type === 'add') {
      this.setState(({addCheckNotificationCargoModal})=> {
        return {
          addCheckNotificationCargoModal: {
            ...addCheckNotificationCargoModal,
            visible: true,
            data: {}
          }
        }
      });
    }
    if(type === 'edit') {
      this.setState(({addCheckNotificationCargoModal})=> {
        return {
          addCheckNotificationCargoModal: {
            ...addCheckNotificationCargoModal,
            visible: true,
            data: {
              ...data,
              _rowIdx: rowIdx,
            }
          }
        }
      });
    }
  };
  /*
   * @interface 隐藏添加货物对话框
   * */
  hiddenAdd = ()=>{
    this.setState(({addCheckNotificationCargoModal})=>{
      return {
        addCheckNotificationCargoModal: {
          ...addCheckNotificationCargoModal,
          visible: false,
          data: {}
        }
      }
    })
  };
  /*
   * @interface 添加货物对话框的回调
   * */
  addCallback = (info)=>{
    const {click, data = {}} = info;
    // case1. 如果点击取消按钮，则隐藏对话框
    if(click === 'cancel'){
      this.hiddenAdd()
    }
    // case2. 如果点击确定按钮，则刷新货物列表
    if(click === 'ok'){
      const {listPage: {rows}} = this.state;
      const {_rowIdx} = data;
      // case2-case1. 如果是修改操作，修改对应的行数据
      if(_rowIdx !== undefined) {
        const _rs = rows.map((row, i)=>{
          if(i === _rowIdx){
            return data;
          }else{
            return row;
          }
        });
        this.setState(({listPage})=> {
          return {
            listPage: {
              ...listPage,
              rows: _rs
            }
          }
        });
      }else {
        rows.push(data);
        console.log(rows);
        this.setState(({listPage})=> {
          return {
            listPage: {
              ...listPage,
              rows
            }
          }
        });
      }
      this.hiddenAdd()
    }
  };



  /*
   * @interface 点击tabPane的回调
   * @param {string} 点击的tabPane的key
   *
   onTabClick = (tabPaneKey)=>{
    this.setState({
      activeKey: tabPaneKey
    })
    console.log('tabPaneKey',tabPaneKey);
    if(tabPaneKey === 2){
      fetch('ciq.riskasesmtproject.listtask',{
        // method: 'post',
        // headers: {},
        data: {},
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
      });
    }
  }; */



  render(){
    const {prefix, title, visible, data=[], ...props} = this.props; //通过属性将--将数据传入。
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, } = this.state;

    const formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 20}
    };
    const _rowSpan = {
      labelSpan: 4,
      wrapperSpan: 6
    };
    const tableCls = cx({
      [`${prefix}-custom-table`]: true
    });
    const inlineTableCls = cx({
      [`inline-table`]: true
    });

    const radioProps = {
      disabled: true
    }
    const creatGroup ={ fontSize:14,marginRight:20,}
    const titleStyle1 = {width:100,height:30, background:'#E3F4FF', };
    const inlineTrCls = cx({
      [`inline-tr`]: true
    });

    //console.log('专家组信息:', data );
     let _tr=[], _tr2={};
     const number = data.length;
     if(number >0 ){
         let j=number-1;
         for(let i=0; i<j; i++){
            _tr.push( <tr>
              <td>专家{i+1}</td>
              <td>{data[i]["expertsName"] }</td>
              <td>{data[i]["gender"] }    </td>
              <td>{data[i]["tel"] }       </td>
              <td>{data[i]["specialty"] }</td>
              <td>{data[i]["position"] }</td>
            </tr> );
         }

         ["date","userName","dateStart","dateEnd","groupLeader"].map((key)=>{
           _tr2[`${key}`] = data[j][`${key}`] ;
         });
     }

    const _ExpertsGroupTable = (
       <div>
         <div>
           <font style={creatGroup}>创建日期:{ _tr2 !== null? moment.unix( _tr2.date/1000 ).format("YYYY/MM/DD") : null} </font>
           <font style={creatGroup}>创建人:  { _tr2.userName  } </font>
           <font style={creatGroup}>专家组组长:{ _tr2.groupLeader} </font>
           <font style={creatGroup}>起止时间:
              { _tr2 !== null? moment.unix( _tr2.dateStart/1000 ).format("YYYY/MM/DD") : null }～
              { _tr2 !== null? moment.unix( _tr2.dateEnd/1000 ).format("YYYY/MM/DD") : null }
           </font>
         </div>
          <table className={tableCls}>
              <tBody style={creatGroup}>
                <tr>
                  <td style={titleStyle1}>序号</td>
                  <td style={titleStyle1}>专家姓名</td>
                  <td style={titleStyle1}>性别</td>
                  <td style={titleStyle1}>联系电话</td>
                  <td style={titleStyle1}>擅长领域</td>
                  <td style={titleStyle1}>职称</td>
                 </tr>
                { _tr }
            </tBody>
        </table>
      </div>
    );


    return (
      <ModalA
        confirmLoading={confirmLoading}
        title={title}
        visible={visible}
        okText="保存"
        cancelText="取消"
        onOk={this.onOk}
        onCancel={this.onCancel}
        footer={null}
        // bodyHeight={500}
        {...props}
      >
        <h2 style={{textAlign: 'center'}}>专家组</h2>
        <Tabs ></Tabs>
        { _ExpertsGroupTable }
      </ModalA>
    )
  }
}

ViewExpertsGroupModal.propTypes = {
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

ViewExpertsGroupModal.defaultProps = {
  prefix: 'yzh',
  visible: false,
  callback: noop,
};

ViewExpertsGroupModal = Form.create()(ViewExpertsGroupModal);

export default ViewExpertsGroupModal;
