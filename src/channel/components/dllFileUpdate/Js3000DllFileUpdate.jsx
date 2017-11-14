/**
 * Created by jpt on 2017/10/18.
 */
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
// import faker from 'faker'
import { connect } from 'dva'
import moment from 'moment'
import cx from 'classnames'
import {Form, Select,Table, Popconfirm, message, Input, DatePicker, Spin, Modal,Tabs, notification, Button, Icon, Upload} from 'antd'
import {Permission} from 'antd/../../src/channel/components/helpers/'
import {GridTable, Block, Inline,
  ButtonContainer, AddButton,DelButton, UploadButton, EditButton, SearchButton,InputUpload} from '../../../components/'
import {dimsMap} from '../helpers/'
import {fetch, CONFIG} from 'antd/../../src/services/'
import config2    from  '../../../services/config2'
//import  styles from  './Js3000DllFileUpdate.less'

function noop(){}

/*
 * js3000应用程序更新dll文件
 * */
class Js3000DllFileUpdate extends Component{

  _retInitialState = ()=>{
    return {
      spinning: false,                         // 页面加载数据loading状态
      tip: '',
      activeKey: '1',                          // 激活的tabPane的key，
      Msg: '',                                  //文件上传信息成功 /失败。
    }
  };

  constructor(props){
    super(props);
    this.state = this._retInitialState();
  }

//------------------------------------------- start 列表展示 ----------------------------------------
  componentWillReceiveProps(nextProps){
    console.log("nextProps",nextProps);

  }

    /*
     * @interface 点击tabPane的回调
     * @param {string} 点击的tabPane 的key属性
     * */
  onTabClick = (tabPaneKey)=>{
    //activeKey的初始值1，
    this.setState({
      activeKey: tabPaneKey
    })
  };

  render() {
    const {...props} =this.props;
    const { getFieldDecorator } = this.props.form;
    const {spinning, tip, activeKey, } = this.state;

    return (
      <div {...props} className="yzh-remained-submit-approval has-no-check-box-all">
        <Spin spinning={spinning} tip={tip}>

          <Tabs  activeKey={activeKey}  onTabClick={this.onTabClick}>
            <Tabs.TabPane tab={<span><Icon type="tag" />区域1</span>}  key="1">
               <div style={{height:100, textAlign:'center', background:'#E3F4FF'}}>
                 <h3  style={{marginBottom:10,}}> dll文件上传更新</h3>
                 <div>
                     {getFieldDecorator('filePath', {
                       //initialValue: data.Path,
                       rules: [{required:true, message:'请上传文件'},]
                     })(
                       <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>文件上传</a></InputUpload>
                     )}
                 </div>
                 <span style={{color:'red',marginTop:2,}}>{this.state.Msg}</span>
               </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span><Icon type="tag" />区域2</span>} key="2">
               <div>//区域2</div>
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </div>
    )
  }
}

Js3000DllFileUpdate.propTypes = {
  prefix: PropTypes.string,
  rowKey: PropTypes.string
};

Js3000DllFileUpdate.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id'
};

Js3000DllFileUpdate = Form.create()(Js3000DllFileUpdate);

export default Js3000DllFileUpdate;

