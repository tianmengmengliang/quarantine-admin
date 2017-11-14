import React, { Component, PropTypes } from 'react';
import {Form, Select, Upload, Icon, Input, DatePicker,
  Popconfirm, Row, Col, Button, InputNumber, message, Radio, Checkbox } from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {remove} from 'antd/../../src/utils/arrayUtils.js'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable, InputUpload} from '../../../../components/'
import {dimsMap} from '../../helpers/'



const {custom: {entryExit}} = dimsMap;
function noop(){}

class AddUserModal extends Component{

  _retInitialState= ()=>{ //设置初始状态。
    return {
      confirmLoading: false,
      username:'',
      password:'',
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
      const {id,username } = newData;
      this.setState({
        id: id,
        username: username,
      });
    }
  }


  //保存
  onOk = ( )=> {
    this.props.form.validateFieldsAndScroll((err, data) => { //数据检验。
      const {id, ClickValue, } = this.state;
      let username12, password123 ='';
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

      let _info = {};
      ['realName','mobile','phone','email','name','orgCode','contact','role'].map((key)=>{
         _info[`${key}`] = data[`${key}`];
      });
      let value={
          username:username12,
          password:password123,
          ..._info,
      }
      console.log('value:',value); //json数据
      fetch('yizhijie.user.adduser',{
        // method: 'post',
        // headers: {},
        data: value ,
        success: (res)=> {
            this.props.callback && this.props.callback({
              click: 'ok',
              data: null
            });
            /*将组件重置到初始状态。*/
            this.setState(this._retInitialState());
            this.props.form.resetFields()
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
  /** 密码验证 **/
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

  /** 1.设置下拉列表固定 **/
  getPopup =( triggerNode )=>{
    return  triggerNode
  }


  render(){
    const {prefix, title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const {confirmLoading, username, id, ClickValue,} = this.state;
    const {AllRole=[],} = data;
    console.log('AllRole', AllRole);

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


    /*--------- 遍历所有角色 ---------*/
    const _Select = AllRole.map( (k)=>{
      return ( <Select.Option value={k.name}>{k.name }</Select.Option>  );
    });

    const _table = (
      <div>
        <table className={tableCls}>
          <tBody>
          <tr>
            <td style={titleStyle1}>真实姓名：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('realName', {
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
            <td style={titleStyle1}>联系电话：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('mobile', {initialValue: data.mobile,
                    rules:  [
                      { required: true, message:'请填写电话号码'},
                    ]
                  })(
                    <Input// style={{ width: '65%', marginRight: '3%' }}
                    />
                  )}
                </Form.Item>
              </div></td>
          </tr>
          <tr>
            <td style={titleStyle1}>手机：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('phone', {
                    initialValue: data.phone,
                    rules:  [
                      {required: true, message:'请填写手机号'},
                      { min: 11, max: 11, message: '手机号码只能11位'}
                    ],
                    trigger: 'onBlur'
                  })(
                    <Input// style={{ width: '65%', marginRight: '3%' }}
                    />
                  )}
                </Form.Item>
              </div></td>
          </tr>
          <tr>
              <td style={titleStyle1}>E-mail：</td>
              <td style={nameStyle}>
                <div className={`${inlineTrCls}`}>
                  <Form.Item>
                    {getFieldDecorator('email', {
                      initialValue: data.email,
                      rules:  [
                        {required: true, message:'请填写' },
                      ]
                    })(
                      <Input
                      />
                    )}</Form.Item>
                </div>
              </td>
          </tr>

          <tr>
            <td style={titleStyle1}>单位名称：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('name', {
                    initialValue: data.name,
                    rules:  [
                      {required: true, message:'请填写' },
                    ]
                  })(
                    <Input
                    />
                  )}</Form.Item>
              </div>
            </td>
          </tr>
          <tr>
            <td style={titleStyle1}>单位证编号：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('orgCode', {
                    initialValue: data.orgCode,
                    rules:  [
                      {required: true, message:'请填写' },
                    ]
                  })(
                    <Input
                    />
                  )}</Form.Item>
              </div>
            </td>
          </tr>
          <tr>
            <td style={titleStyle1}>联系人姓名：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('contact', {
                    initialValue: data.contact,
                    rules:  [
                      {required: true, message:'请填写' },
                    ]
                  })(
                    <Input
                    />
                  )}</Form.Item>
              </div>
            </td>
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
              <td style={titleStyle1}>登录账号：</td>
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
                <div className={`${inlineTrCls}`}>{ username }
                  <Form.Item>
                    {getFieldDecorator('username2', {
                      initialValue: data.username,
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
                      <Input  />
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
                      initialValue: data.password,
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

          <tr>
            <td style={titleStyle1}>指定角色：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
              <Form.Item>
                {getFieldDecorator('role', {
                  initialValue: data.name,
                  rules: [{required:false },]
                })(
                  <Select
                    style={{width: 300}}
                    placeholder="请选择组"
                    //allowClear={true}
                    //multiple={false}
                    combobox={false}
                    tags={false}
                    showSearch={false}
                    filterOption={false}
                    optionFilterProp={`children`}
                    labelInValue={false}
                    tokenSeparators={null}
                    getPopupContainer={this.getPopup} //菜单定位问题
                   >
                    {_Select }
                  </Select>
                )}
              </Form.Item>
              </div></td>
          </tr>
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
        bodyMinHeight={300}
        width={600}
        {...props}
      >
        <h2 style={{textAlign: 'center'}} >添加用户</h2>
        <Form>
              <Form.Item
                {...formItemLayout}
                style={{display: 'none'}}
              >
                {getFieldDecorator('id', {  //id（表id）
                  initialValue: data.id,
                  rules: false
                })(
                  <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                  />
                )}
              </Form.Item>
              {_table}
              <h2 style={{textAlign: 'center'}}>设置账号</h2>
              {_userinfo}
        </Form>
      </ModalA>
    )
  }
}

AddUserModal.propTypes = {
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

AddUserModal.defaultProps = {
  prefix: 'yzh',
  visible: false,
  callback: noop,
};

AddUserModal = Form.create()(AddUserModal);

export default AddUserModal;
