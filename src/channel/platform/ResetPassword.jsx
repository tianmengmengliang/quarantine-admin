import React, { Component, PropTypes } from 'react';
import { Row, Col, Table, Card, Icon } from 'antd';
import { Form, Input, Button, Checkbox, Steps, Select, message, Cascader } from 'antd';
import { Alert } from 'antd';
import { Link, hashHistory } from 'react-router';
import {SampleMainLayout} from '../components/';
import {fetch, CONFIG} from '../../services/'
import xFetch from '../../services/xFetch';
import styles from './register.less';
import area from '../../common/area.js';

const steps = [{
  title: '获取验证码', description: '',
}, {
  title: '重置密码', description: '',
}, {
  title: '修改完成', description: '',
}].map((s, i) => <Steps.Step key={i} title={s.title} description={s.description} />);

const formItemLayout = {
  labelCol: { span: 6 },    //栅格占位格数，为 0 时相当于 display: none
  wrapperCol: { span: 7 },
};

class ResetPassword extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      step1Show: true,
      step2Show: false,
      step3Show: false,
      checkingDisabled: false,
      checking: true,
      institution:[],
      mobileInput: {
        validateStatus: '',
        mobileHelp: null
      },
    };

    //请求机构列表
    let self=this;
    function successCallback(d){
      if(!d.success) return;
      self.setState({
        institution:d.responseObject
      })
    }
    xFetch('orgclass', {},successCallback , null, 'post');
  }

  checkPass(rule, value, callback) {
    const { validateFields } = this.props.form;
    if (value) {
      validateFields(['rePassword'], { force: true });
    }
    callback();
  }

  checkPass2(rule, value, callback) {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('password')) {
      callback('两次输入密码不一致！');
    } else {
      callback();
    }
  }
  /*
   * @interface 检验手机号是否存存在
   * */
  onMobileInputBlur = ()=>{
    this.props.form.validateFields(['mobile'], (err, {mobile}) => {
      if (err) {
        return;
      }
      this.verifyMobile({mobile: mobile}, (err, res)=>{
        if(err){
          this.setState({
            mobileInput: {
              validateStatus: 'error',
              mobileHelp: err.message
            },
            checking: false,
          });
          return;
        }
        //ok
        this.setState({
          mobileInput: {
            validateStatus: 'success',
            mobileHelp: '该手机号可用'
          },
          checking: true,
        });


      })
    });
  };
  verifyMobile = (data, callback)=>{ //检验手机号码  接口
    fetch('yizhijie.user.checkoutmobile', {
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
          mobileInput: {
            validateStatus: 'validating',
            mobileHelp: '校验中...'
          }
        })
      },
      complete: (err, data)=>{
        this.setState({
          mobileInput: {
            validateStatus: '',
            mobileHelp: null
          }
        })
      }
    })
  };



  /*
   * 第一步：校验手机验证码
   */
  step1(){
    var self = this;
    var successCallback = function(d){
      if (!d.success) {
        message.error('手机验证码校验失败');
        return;
      }
      self.setState({
        currentStep: 1,
        step1Show: false,
        step2Show: true
      });

    }
    //表单验证
    this.props.form.validateFields(['mobile', 'code'], (errors, values) => {
      if (!!errors) {
        message.error('填写手机号验证失败');
        return;
      }else{
        // 手机号+验证码校验成功
        fetch('platform.user.checkverifycode', {
          // method: 'post',
          // headers: {},
          data: values,
          success: (res)=>{
            //console.log('校验成功:', res);
            //todo:模拟请求成功
            successCallback({success:true});
          },
          error: (err)=>{
            message.error(err.message);
          },
          beforeSend: ()=>{
          },
          complete: (err, data)=>{
          }
        });
      }
    });
  }

  /*
   * 第二步: 重置密码提交。
   */
  step2(e){
    e.preventDefault();
    var self = this;
    var successCallback = function(d){
      self.setState({
        currentStep: 2,
        step2Show: false,
        step3Show: true
      });
    }

    //1.表单验证
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        message.error('完善资料校验失败');
        return;
      }else{
        console.log('修改密码内容:',values);
        fetch('ciq.riskasesmtproject.updatePassworld', {
          // method: 'post',
          // headers: {},
          data: values,
          success: (res)=>{
            //console.log('校验成功:', res);
            // todo:模拟请求成功
            successCallback({success:true});
          },
          error: (err)=>{
            message.error(err.message);
          },
          beforeSend: ()=>{
          },
          complete: (err, data)=>{
          }
        });
      }
      //对所在地的数据处理成provinceid,cityid
      let params={};
      for(let x in values){
        if(x==='address'){
          params.provinceId=values[x][0];
          params.cityId=values[x][1];
          continue;
        }
        params[x]=values[x];
      }
      // 注册账号
      //xFetch('register', params, successCallback, null, 'post');
      // todo:模拟请求成功
      //successCallback({success:true});
    });
  }

  /*
   * 发送手机短信验证码
   */
  sendVerifycode(){
    var self = this;

    var phone = this.props.form.getFieldValue('mobile');
    if (!phone) return;
    var successCallback = function(d){
      self.setState({
          checkingDisabled: true
      });
    }
    let value ={
         mobile: phone
    }
    // 发送手机号码
    //xFetch('getverifycode', {mobile: phone}, successCallback, null, 'post');
     fetch('platform.user.sendsmsverifycode',{
       data: value,
       success: (res)=>{
         successCallback({success:true});
       },
       error: (err)=>{
         message.error(err.message);
       },
       beforeSend: ()=>{
       },
       complete: (err, data)=>{
       }
     });
  }


  render(){
    const { currentStep, step1Show, step2Show, step3Show,checkingDisabled, mobileInput:{validateStatus, mobileHelp},checking } = this.state;
    const { getFieldProps,getFieldError } = this.props.form;

    let institution=this.state.institution.map(function(option,i){
      return (
        <Option value={option.id}>{option.name}</Option>
      )
    });
    const mobileError = getFieldError('mobile');
    return (
      <SampleMainLayout>
        <div className={styles.wrap}>
          <div>
            <Steps current={currentStep}>{steps}</Steps>
          </div>
          <Form layout="horizontal" form={this.props.form} onSubmit={this.step2.bind(this)}>
            <div className={styles.form} style={{display: step1Show?'':'none'}}>

                  <Form.Item label="手机号码"
                     required {...formItemLayout}
                     validateStatus={mobileError ? 'error' : validateStatus}
                     help={mobileError ? mobileError : mobileHelp}
                     hasFeedback
                    >
                    <Input
                      className={styles.input}
                      placeholder="请输入手机号"
                      {...getFieldProps('mobile', {
                        validate: [{
                          rules: [
                            { required: true, message: '必须填写手机号码' },
                            { min: 11, max: 11, message: '手机号码只能11位' }
                          ],
                          trigger: 'onBlur'
                        }]
                      })}
                      onBlur={this.onMobileInputBlur}
                      style={{width: 300}}
                    />
                  </Form.Item>

                  <Form.Item label="短信验证码" required {...formItemLayout}>
                    <Input
                      className={styles.input}
                      placeholder="请输入短信验证码"
                      {...getFieldProps('code', {
                        validate: [{
                          rules: [
                            { required: true, message: '请输入短信验证码' },
                            { min: 6, max: 6, message: '短信验证码只能6位' }
                          ],
                          trigger: 'onBlur'
                        }]
                      })}
                      style={{width: 200}}
                    />
                    {checking ? <Button type="primary" size="small" disabled={this.state.checkingDisabled}
                       onClick={this.sendVerifycode.bind(this)}>发送短信验证码</Button> : null }
                  </Form.Item>
                  <Form.Item wrapperCol={{ span: 12, offset: 7 }}>
                    <Button type="primary" onClick={this.step1.bind(this)}>下一步</Button>
                  </Form.Item>
            </div>

            <div className={styles.form} style={{display: step2Show?'':'none'}}>
              <Form.Item label="新密码" required {...formItemLayout}>
                <Input
                  type="password"
                  className={styles.input}
                  placeholder="请输入新密码"
                  {...getFieldProps('password', {
                    rules: [
                      { required: true, message: '密码不能为空' },
                      { min: 6, message: '密码最少长度不能少于6位' },
                      { validator: this.checkPass.bind(this) }
                    ]
                  })} />
                <span>密码长度不能少于6位</span>
              </Form.Item>
              <Form.Item label="确认密码" required {...formItemLayout}>
                <Input
                  type="password"
                  className={styles.input}
                  placeholder="请再一次输入密码"
                  {...getFieldProps('rePassword', {
                    rules: [
                      { required: true, message: '密码不能为空' },
                      { validator: this.checkPass2.bind(this) }
                    ]
                  })} />
              </Form.Item>
              <Form.Item wrapperCol={{ span: 12, offset: 7 }}>
                <Button type="primary" htmlType="submit" onClick={this.step2.bind(this)}>提交</Button>
              </Form.Item>
            </div>

            <div className={styles.form} style={{display: step3Show?'':'none'}}>
              <Alert message="修改完成"
                     description="密码修改成功，你可以使用新密码进行重新登入！"
                     type="success"
                     showIcon
              >
              </Alert>
              <Link to="/" >点击跳转到登录界面</Link>
            </div>
          </Form>
        </div>
      </SampleMainLayout>
    );
  }
};

ResetPassword = Form.create()(ResetPassword);

export default ResetPassword;
