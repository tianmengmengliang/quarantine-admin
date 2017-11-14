import React, { Component, PropTypes } from 'react';
import {Form, Select, Upload, Icon, Input, DatePicker,
  Popconfirm, Row, Col, Button, InputNumber, message, Radio, Checkbox } from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {remove} from 'antd/../../src/utils/arrayUtils.js'
import {fetch, CONFIG} from '../../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable, InputUpload} from '../../../../../components/'
import {dimsMap} from '../../../helpers/'
import './customTable.less'


const {custom: {entryExit}} = dimsMap;
function noop(){}

class AddExpertsModal extends Component{

  _retInitialState= ()=>{ //设置初始状态。
    return {
      confirmLoading: false,
      userInfo: {},
      id: 0,
      ClickValue: false, //不修改密码。

    }
  };

  constructor(props){
    super(props);
    this.state = this._retInitialState()
  }

  componentWillReceiveProps(nextProps){ //当组件传入的 props发生变化时调用，更新state。
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData){
      const { userId, userInfo, id, } = newData;
      this.setState({
         userInfo: {...userInfo},
         id:id,
      });
    }
  }


  //保存
  onOk = ( )=> {
    this.props.form.validateFieldsAndScroll((err, data) => { //数据检验。
      const {id, ClickValue, } = this.state;
      let username12, password123 ='';
      //1. 填写未完整
      if(err) {
        message.error(err.message || '填写未完整，请完善后再提交')
        return;
      }
      // 2.增加
      else if( id === undefined ){
             username12 = data.username1;
            password123 = data.password1;
      }
      // 3.修改
      else{
           username12 = data.username2;
           //一.修改密码
          if(ClickValue){ password123 = data.password3;
          //二.不修改密码
          }else{ password123 = data.password2; }
      }

      //去除登陆账号两头空格:
      username12  =  username12.replace(/^\s+|\s+$/g,"");
      password123  =  password123.replace(/^\s+|\s+$/g,"");
      var arr ={ username:username12,  password:password123 };
      let  zjdata={
                 id: data.id,
             userId: data.userId,
        expertsName:data.expertsName,
            gender: data.gender,
               tel: data.tel,
         specialty: data.specialty,
        position: data.position,
        workUnits: data.workUnits,
        recommendedUnits: data.recommendedUnits,
           userInfo: arr,
      };

      console.log('专家表单:',zjdata); //表单数据
      fetch('ciq.riskasesmtexperts.save',{
        // method: 'post',
        // headers: {},
        data: zjdata,
        success: (res)=> {
          /*回调父组件的callback函数。*/
          this.props.callback && this.props.callback({
            click: 'ok',
            data: null
          });
        },
        error: (err)=> {
          console.log('保存数据失败');
          alert( err.message);
        },
        beforeSend: ()=> {
          this.setState({
            confirmLoading: true
          })
        },
        complete: (err, data)=> {
          this.setState({
            confirmLoading: false
          })
          /*将组件重置到初始状态。*/
          this.setState(this._retInitialState());
          this.props.form.resetFields()
        }
      })
    });
  };

  onCancel = ()=> {
    this.props.callback && this.props.callback({
      click: 'cancel',
      data: null
    });
    this.setState(this._retInitialState());
    this.props.form.resetFields()
  };

  /** 手机号码验证 **/
  checkTel = (rule, value, callback) => {
      var re1 = /^1\d{10}$/;
      var re2 = /^0\d{2,3}-?\d{7,8}$/;
      if(re1.test(value) ){
        callback();
        return ;
      }else if(re2.test(value) ){
        callback();
        return ;
      }else{
        callback('格式不对!');
      }
  }
  /** 专家密码验证 **/
  checkPassword =(rule, value, callback)=>{
     //校验密码：只能输入6-16个字母、数字、下划线.
      var re3 = /^(\w){6,16}$/;
      if(re3.test(value) ){
        callback();
        return ;
      }else{
        callback('只能输入6-16个字母、数字、下划线!');
      }
  }

  /** 是否修改密码 **/
  handleClick =( )=>{
    const { ClickValue} = this.state;
    console.log('---e--',ClickValue);

    if(ClickValue ){
      this.setState({
          ClickValue: false,
      });
    }else{
      this.setState({
          ClickValue: true,
      });
    }
  }

  render(){
    const {prefix, title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const {confirmLoading, userInfo, id, ClickValue,} = this.state;
    console.log('---专家表--',id);

    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16}
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

    const nameStyle = {width: 200, };
    const titleStyle1 = {width:100, textAlign:'right',marginRight:10,};
    const inlineTrCls = cx({
      [`inline-tr`]: true
    });
    const titleStyle2 = {margin:'auto 0', };


    //修改操作：存数据的容器。
    //console.log("专家数据:", data);

    const _table = (
      <div>
        <table className={tableCls}>
          <tBody>
          <tr>
            <td style={titleStyle1}>专家真实姓名：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                {getFieldDecorator('expertsName', {
                  initialValue: data.expertsName,
                  rules: [
                    { required: true, message:'请填写专家姓名' },
                  ]
                })(
                  <Input// style={{ width: '65%', marginRight: '3%' }}
                  />
                )}</Form.Item>
              </div></td>
          </tr>
          <tr>
            <td style={titleStyle1}>性别：</td>
            <td style={nameStyle}><div className={`${inlineTrCls}`}>
              <Form.Item>
                {getFieldDecorator('gender', {
                  initialValue: data.gender,
                  rules: [
                    { required: true, message:'请选择' },
                  ]
                })(
                  <Radio.Group>
                    <Radio value='男'>男</Radio>
                    <Radio value='女'>女</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
            </div></td>
          </tr>
          <tr>
            <td style={titleStyle1}>联系方式：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                {getFieldDecorator('tel', {initialValue: data.tel,
                  rules:  [
                    { required: true, message:'请填写电话号码'},
                    {validator: this.checkTel }
                  ]
                })(
                  <Input// style={{ width: '65%', marginRight: '3%' }}
                  />
                )}</Form.Item>
              </div></td>
          </tr>
          <tr>
            <td style={titleStyle1}>专业领域：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                {getFieldDecorator('specialty', {
                  initialValue: data.specialty,
                  rules:  [
                    { required: true, message:'请填写' },
                  ]
                })(
                  <Input
                    type="textarea"
                    autosize={{ minRows: 2, maxRows: 6 }}
                  />
                )}</Form.Item>
              </div></td>
          </tr>
          {/**---------------------------------------------------------------------*/}
          <tr>
            <td style={titleStyle1}>职务/职称：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('position', {
                    initialValue: data.position,
                    rules:  [
                      {required: true, message:'请填写' },
                    ]
                  })(
                    <Input
                    />
                  )}</Form.Item>
              </div></td>
          </tr>
          <tr>
            <td style={titleStyle1}>工作单位：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('workUnits', {
                    initialValue: data.workUnits,
                    rules:  [
                      {required: true, message:'请填写'},
                    ]
                  })(
                    <Input
                    />
                  )}</Form.Item>
              </div></td>
          </tr>
          <tr>
            <td style={titleStyle1}>推荐单位 ：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('recommendedUnits', {
                    initialValue: data.recommendedUnits,
                    rules:  [
                      { required: true, message:'请填写' },
                    ]
                  })(
                    <Input
                    />
                  )}</Form.Item>
              </div></td>
          </tr>
          </tBody>
        </table>
      </div>
    );

    const _userinfo =(
      <div>
        <table className={tableCls}>
          <tBody>
          { id === undefined ?  //如果id不存在。
           <tr>
            <td style={titleStyle1}>账户名：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('username1', {//initialValue: userInfo.username,
                    rules:  [
                      { required: true, message:'请设置用户名'}
                    ]
                  })(
                    <Input />
                  )}</Form.Item>
              </div></td>
          </tr>
          :
           <tr>
            <td style={titleStyle1}>账户名：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>{userInfo.username }
                  <Form.Item>
                    {getFieldDecorator('username2', {
                      initialValue: userInfo.username,
                      rules: false
                    })(
                      <Input  type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                      />
                    )}
                  </Form.Item>
              </div></td>
           </tr>
          }

          { id === undefined ?  //如果id不存在。
            <tr>
            <td style={titleStyle1}>账户密码：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('password1', {//initialValue: userInfo.password,
                    rules:  [
                      { required: true,  message:'请设置密码'},
                      {validator: this.checkPassword }
                    ]
                  })(
                    <Input />
                  )}
                </Form.Item>
              </div>
              </td>
            </tr>
           :
            <tr>
             <td style={titleStyle1}>账户密码：<br/>
                  <Button type="primary"  onClick={this.handleClick}>修改密码</Button>
             </td>

              {ClickValue === false ?  //1.默认不修改密码
                <td style={nameStyle}> ************
                  <Form.Item>
                    {getFieldDecorator('password2', {
                      initialValue: userInfo.password,
                      rules: false
                    })(
                      <Input  type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                      />
                    )}
                  </Form.Item></td>
                :
                <td style={nameStyle}>
                  <div className={`${inlineTrCls}`}>
                    <Form.Item>
                      {getFieldDecorator('password3',{ //initialValue: userInfo.password,
                        rules:  [
                          {required:true,  message:'请设置密码'},
                          {validator: this.checkPassword }
                        ]
                      })(
                        <Input />
                      )}
                    </Form.Item>
                  </div>
                </td>
              }
          </tr>
           }
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
        onOk={this.onOk}           //保存按钮。
        onCancel={this.onCancel}
        // bodyHeight={500}
        width={600}
        {...props}
      >
        <h2 style={{textAlign: 'center'}} >添加专家基本信息</h2>
        <Form>
            <Form.Item
            {...formItemLayout}
            style={{display: 'none'}}
          >
            {getFieldDecorator('id', {  //专家id（表id）
              initialValue: data.id,
              rules: false
            })(
              <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
              />
            )}
          </Form.Item>
            <Form.Item
            {...formItemLayout}
            style={{display: 'none'}}
          >
            {getFieldDecorator('userId', {  //专家id
              initialValue: data.userId,
              rules: false
            })(
              <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
              />
            )}
          </Form.Item>
          {_table}
          <h2 style={{textAlign: 'center'}}>设置专家登陆账号</h2>
          {_userinfo}
        </Form>
      </ModalA>
    )
  }
}

AddExpertsModal.propTypes = {
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

AddExpertsModal.defaultProps = {
  prefix: 'yzh',
  visible: false,
  callback: noop,
};

AddExpertsModal = Form.create()(AddExpertsModal);

export default AddExpertsModal;
