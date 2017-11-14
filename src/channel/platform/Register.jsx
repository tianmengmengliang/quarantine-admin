import React, { Component, PropTypes } from 'react';
import { Link, hashHistory } from 'react-router';
import { Form, Input, Button, Radio, Checkbox, Steps, Modal, Row, Col, Table, Card, Icon, Select, message, Upload, Cascader, Tooltip, Alert } from 'antd';
import cx from 'classnames'
import {PDFViewer2} from 'antd/../../src/components/'
import {SampleMainLayout} from '../components/';
import {fetch, CONFIG} from 'antd/../../src/services/'
import './register.less'
import * as styles from './register.less'
import area from '../../common/area.js';

const steps = [{
  title: '填写手机号', description: '',
}, {
  title: '完善资料', description: '',
}, {
  title: '注册完成', description: '',
}].map((s, i) => <Steps.Step key={i} title={s.title} description={s.description} />);

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

class Register extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      step1Show: true,
      step2Show: false,
      step3Show: false,
      checkingDisabled: false,
      previewVisible: false,                // 图片预览对话框
      previewImage: undefined,
      mobileInput: {
        validateStatus: '',
        mobileHelp: null
      },
      yingyeFile: {
        status: '',
        file: null,
        fileList: [],
        response: null
      },
      authFile: {
        status: '',
        file: null,
        fileList: [],
        response: null
      },
      idCardFile: {
        status: '',
        file: null,
        fileList: [],
        response: null
      },
      nextBtnLoading: false,              // 下一步按钮加载loading状态
      registerLoading: false,             // 注册按钮加载loading状态
      registerBtnLoading: false,          // 注册按钮加载loading状态
      radioValue: '单位用户',             // radioValue的值
      agreement: false,                   // checkbox协议是否同意的值
      remainedTime:0,
      time: 3,
    };
  }

  verifyPhoneNVerifyCode = (data, callback)=>{
    fetch('platform.user.checkverifycode', {
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
          nextBtnLoading: true
        })
      },
      complete: (err, data)=>{
        this.setState({
          nextBtnLoading: false
        })
      }
    })
  };

  /*
   * 完成注册第一步
   */
  step1(){
    var self = this;
    var successCallback = function(d){
      if (!d.success) {
        // message.error('手机验证码校验失败');
        return;
      }

      self.setState({
        currentStep: 1,
        step1Show: false,
        step2Show: true
      });

    }
    // 表单验证
    this.props.form.validateFieldsAndScroll(['username', 'code'], (errors, {username, code}) => {
      if (!!errors) {
        return;
      }
      this.verifyPhoneNVerifyCode({mobile: username, code: code}, (err, res)=>{
        if(err){
          this.setState({
            mobileInput: {
              validateStatus: 'error',
              mobileHelp: err.message
            }
          });
          return;
        }

        this.setState({
          mobileInput: {
            validateStatus: 'success',
            mobileHelp: null
          },
          currentStep: 1,
          step1Show: false,
          step2Show: true
        });
      })

    });
  }

  register = (data, callback)=>{
    fetch('platform.user.reg', {
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
          registerBtnLoading: true
        })
      },
      complete: (err, data)=>{
        this.setState({
          registerBtnLoading: false
        })
      }
    })
  }

  /*
   * 完成注册第二步
   */
  step2(radioValue){

    var self = this;
    var successCallback = ()=>{
      self.setState({
        currentStep: 2,
        step2Show: false,
        step3Show: true
      });

      var interval = setInterval(()=>{
        let {time} = this.state;
        if(time === 0) {
          clearInterval(interval)
          location.href = `${location.protocol}//${location.host}/`
        }else{
          this.setState({
            time: --time
          })
        }
      }, 1000)
    };

    if(radioValue === '单位用户'){
      this.props.form.validateFieldsAndScroll(['username', 'orgName', 'password', 'businessLicenseCode', 'businessLicenseFile', 'contact', 'phone'], (errors, values) => {
        if (!!errors) {
          // console.log(errors)
          return;
        }

        this.register({...values, mobile: values.username, userType: '1'}, (err, res)=>{
          if(err){
            message.error(err.message)
            return;
          }

          successCallback()
       })
      });
    }else if(radioValue === '个人用户'){
      this.props.form.validateFieldsAndScroll(['username', 'realName', 'password', 'idCardNumber', 'idCard', 'contact', 'phone'], (errors, values) => {
        if (!!errors) {
          return;
        }

      });
    }else if(radioValue === '其他机构'){
      this.props.form.validateFieldsAndScroll(['username', 'orgName', 'orgCode', 'password', 'orgCodeCertificate', 'contact', 'phone', 'authFile'], (errors, values) => {
        if (!!errors) {
          return;
        }

      });
    }else{
      this.props.form.setFields({
        type: {
          value: undefined,
          errors: [new Error(`请选择单位性质`)]
        }
      })
    }

  }

  getVerifycode = (data, callback)=>{
    //fetch('platform.user.sendsmsverifycode', {
    fetch('platform.user.sendsmsverifycodesregister',{
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
  }

  /*
   * 发送短信验证码
   */
  sendVerifycode(){
    // 验证码倒计时按钮
    const countDown=(totalTime)=>{
      self.setState({
        remainedTime:totalTime,
        checkingDisabled:true
      });
      time=setInterval(function(){
        if(self.state.remainedTime===0){
          self.setState({
            remainedTime:0,
            checkingDisabled:false
          });
          clearInterval(time);
          return;
        }
        self.setState({
          remainedTime:--self.state.remainedTime
        })
      },1000)
    };
    // console.log("aa");
    var self = this,time;
    this.props.form.validateFields(['username'],(errors, {username}) => {
      if (!!errors) {
       // message.error('手机号未填写',2);
        return;
      }
      countDown(60);

      this.getVerifycode({mobile: username, product: '浙江省出入境特殊物品集中监管信息平台'}, (err, res)=>{
        if(err){
          message.error(err.message)
          return;
        }
      })
    });
  }

  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不一致');
    } else {
      callback();
    }
  }

  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value) {
      form.validateFields(['confirm'], { force: true });
    }
      callback();
  }

  /*
  * @interface 检验手机号是否存存在
  * */
  onMobileInputBlur = ()=>{
    this.props.form.validateFieldsAndScroll(['username'], (err, {username}) => {
      if (err) {
        return;
      }
      this.verifyMobile({username: username}, (err, res)=>{
        if(err){
          this.setState({
            mobileInput: {
              validateStatus: 'error',
              mobileHelp: err.message
            }
          });
          return;
        }
        this.setState({
          mobileInput: {
            validateStatus: 'success',
            mobileHelp: '该手机号可用'
          }
        });
      })
    });
  };

  verifyMobile = (data, callback)=>{
     fetch('platform.user.usernameavailable', {
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
  * @interface radio改变时的事件处理函数
  * @param {object} e 事件对象
  * */
  onRadioChange = (e)=>{
    this.props.form.resetFields();
    this.setState({
      radioValue: e.target.value
    })
  };

  /*
  * @interface checkbox改变时的回调
  * @param {object} e 事件对象
  * */
  onCheckboxChange = (e)=>{
    this.setState({
      agreement: e.target.checked
    })
  };

  onPreviewImage = (imgSrc)=>{
    this.setState({
      previewVisible: true,
      previewImage: imgSrc
    })
  };

  handleCancel = () => this.setState({ previewVisible: false })

  render(){
    const { prefix, className, style, data = {}, ...props } = this.props;
    const { getFieldDecorator, isFieldTouched, getFieldError } = this.props.form;
    const { currentStep, step1Show, step2Show, step3Show,
        nextBtnLoading, registerBtnLoading, previewVisible, previewImage, time,
        radioValue, agreement, mobileInput: {validateStatus, mobileHelp} } = this.state;

    const prefixSelector = (
        <span style={{display: 'inline-block', width: 100}}>+86(中国)</span>
    )

    const {yingyeFile, authFile, idCardFile} = this.state;
    const yingyeDimName = 'businessLicenseFile'
    const yingyeProps = {
      name: 'file',
      action: CONFIG.uploadUrl,
      headers: {
        authorization: localStorage.getItem(CONFIG.token),
      },
      showUploadList: false,
      // accept: 'application/pdf，application/x-rar-compressed, application/zip',
      listType: 'text',
      fileList: yingyeFile.fileList,
      beforeUpload: (file)=> {
        let isValid = false;
        const imgPattern = /(\.jpg| \.jpeg)+$/i;
        const pdfPattern = /\.pdf$/i;
        // console.log(imgPattern.test(file.name))
        if(imgPattern.test(file.name.toLowerCase()) || pdfPattern.test(file.name.toLocaleLowerCase())){
          isValid = true;
        }

        if(!isValid){
          this.props.form.setFields({
            [`${yingyeDimName}`]: {
              value: undefined,
              errors: [new Error('无效的文件格式，只支持JPG或者JPEG格式的图片或者PDF格式的文件')]
            }
          });
        }

        return isValid;
      },
      onChange: (info)=> {
        let fileList = info.fileList;

        // 1. Limit the number of uploaded files
        //    Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1);

        // 2. filter successfully uploaded files according to response from server
        fileList = fileList.filter((file) => {
          if (file.response) {
            if(file.response.success) {
              this.props.form.setFields({
                [`${yingyeDimName}`]: {
                  value: file.response.responseObject.filePath,
                  errors: null
                }
              });
              this.setState({
                yingyeFile: {
                  status: 'success',
                  file: file,
                  fileList: fileList,
                  response: file.response,
                }
              })
            }else{
              this.props.form.setFields({
                [`${yingyeDimName}`]: {
                  value: undefined,
                  errors: null
                }
              });
              this.setState({
                yingyeFile: {
                  status: 'error',
                  file: file,
                  fileList: fileList,
                  response: file.response,
                }
              })
            }
            // return file.response.success
          }else{
            this.setState({
              yingyeFile: {
                status: 'loading',
                file: file,
                fileList: fileList,
                response: null,
              }
            })
          }
          return true;
        });
      }
    };

    const shouquanDimName = 'authFile'
    const shouquanProps = {
      name: 'file',
      action: CONFIG.uploadUrl,
      headers: {
        authorization: localStorage.getItem(CONFIG.token),
      },
      showUploadList: false,
      // accept: 'application/pdf，application/x-rar-compressed, application/zip',
      listType: 'text',
      fileList: authFile.fileList,
      beforeUpload: (file)=> {
        let isValid = true;
        /*const imgPattern = /[\.jpg$ | \.jpeg$]/i;
         if(imgPattern.test(file.name.toLowerCase())){
         isValid = true;
         }*/

        if(!isValid){
          this.props.form.setFields({
            [`${shouquanDimName}`]: {
              value: undefined,
              errors: [new Error('无效的文件格式，只支持JPG或者JPEG格式的图片')]
            }
          });
        }

        return isValid;
      },
      onChange: (info)=> {
        let fileList = info.fileList;

        // 1. Limit the number of uploaded files
        //    Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1);

        // 2. filter successfully uploaded files according to response from server
        fileList = fileList.filter((file) => {
          if (file.response) {
            if(file.response.success) {
              this.props.form.setFields({
                [`${shouquanDimName}`]: {
                  value: file.response.responseObject.filePath,
                  errors: null
                }
              });
              this.setState({
                authFile: {
                  status: 'success',
                  file: file,
                  fileList: fileList,
                  response: file.response,
                }
              })
            }else{
              this.props.form.setFields({
                [`${shouquanDimName}`]: {
                  value: undefined,
                  errors: null
                }
              });
              this.setState({
                authFile: {
                  status: 'error',
                  file: file,
                  fileList: fileList,
                  response: file.response,
                }
              })
            }
            // return file.response.success
          }else{
            this.setState({
              authFile: {
                status: 'loading',
                file: file,
                fileList: fileList,
                response: null,
              }
            })
          }
          return true;
        });
      }
    };

    const shenfenDimName = 'idCard'
    const shenfenProps = {
      name: 'file',
      action: CONFIG.uploadUrl,
      headers: {
        authorization: localStorage.getItem(CONFIG.token),
      },
      showUploadList: false,
      // accept: 'application/pdf，application/x-rar-compressed, application/zip',
      listType: 'text',
      fileList: idCardFile.fileList,
      beforeUpload: (file)=> {
        let isValid = false;
        const imgPattern = /[\.jpg$ | \.jpeg$]/i;
        if(imgPattern.test(file.name.toLowerCase())){
          isValid = true;
        }

        if(!isValid){
          this.props.form.setFields({
            [`${shenfenDimName}`]: {
              value: undefined,
              errors: [new Error('无效的文件格式，只支持JPG或者JPEG格式的图片')]
            }
          });
        }

        return isValid;
      },
      onChange: (info)=> {
        let fileList = info.fileList;

        // 1. Limit the number of uploaded files
        //    Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1);

        // 2. filter successfully uploaded files according to response from server
        fileList = fileList.filter((file) => {
          if (file.response) {
            if(file.response.success) {
              this.props.form.setFields({
                [`${shenfenDimName}`]: {
                  value: file.response.responseObject.filePath,
                  errors: null
                }
              });
              this.setState({
                idCardFile: {
                  status: 'success',
                  file: file,
                  fileList: fileList,
                  response: file.response,
                }
              })
            }else{
              this.props.form.setFields({
                [`${shenfenDimName}`]: {
                  value: undefined,
                  errors: null
                }
              });
              this.setState({
                idCardFile: {
                  status: 'error',
                  file: file,
                  fileList: fileList,
                  response: file.response,
                }
              })
            }
            // return file.response.success
          }else{
            this.setState({
              idCardFile: {
                status: 'loading',
                file: file,
                fileList: fileList,
                response: null,
              }
            })
          }
          return true;
        });
      }
    };

    const jigouDimName = 'orgCodeCertificate'
    const jigouProps = {
      name: 'file',
      action: CONFIG.uploadUrl,
      headers: {
        authorization: localStorage.getItem(CONFIG.token),
      },
      showUploadList: false,
      // accept: 'application/pdf，application/x-rar-compressed, application/zip',
      listType: 'text',
      fileList: yingyeFile.fileList,
      beforeUpload: (file)=> {
        let isValid = false;
        const imgPattern = /[\.jpg$ | \.jpeg$]/i;
        if(imgPattern.test(file.name.toLowerCase())){
          isValid = true;
        }

        if(!isValid){
          this.props.form.setFields({
            [`${jigouDimName}`]: {
              value: undefined,
              errors: [new Error('无效的文件格式，只支持JPG或者JPEG格式的图片')]
            }
          });
        }

        return isValid;
      },
      onChange: (info)=> {
        let fileList = info.fileList;

        // 1. Limit the number of uploaded files
        //    Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1);

        // 2. filter successfully uploaded files according to response from server
        fileList = fileList.filter((file) => {
          if (file.response) {
            if(file.response.success) {
              this.props.form.setFields({
                [`${jigouDimName}`]: {
                  value: file.response.responseObject.filePath,
                  errors: null
                }
              });
              this.setState({
                yingyeFile: {
                  status: 'success',
                  file: file,
                  fileList: fileList,
                  response: file.response,
                }
              })
            }else{
              this.props.form.setFields({
                [`${jigouDimName}`]: {
                  value: undefined,
                  errors: null
                }
              });
              this.setState({
                yingyeFile: {
                  status: 'error',
                  file: file,
                  fileList: fileList,
                  response: file.response,
                }
              })
            }
            // return file.response.success
          }else{
            this.setState({
              yingyeFile: {
                status: 'loading',
                file: file,
                fileList: fileList,
                response: null,
              }
            })
          }
          return true;
        });
      }
    };

    const mobileError = getFieldError('username');
    return (
      <SampleMainLayout>
        <Modal
            width={1000}
            visible={previewVisible}
            footer={null}
            onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
        <div className={cx({ [`${prefix}-register`]:true, [`${prefix}-register-wrap`]: true})}>
          <div>
            <Steps current={currentStep}>{steps}</Steps>
          </div>

          <Form horizontal form={this.props.form} onSubmit={this.step2.bind(this)}>
            <div className={cx({ form: true})} style={{display: step1Show?'':'none'}}>
              <Form.Item
                  {...formItemLayout}
                  label="手机号码"
                  validateStatus={mobileError ? 'error' : validateStatus}
                  help={mobileError ? mobileError : mobileHelp}
                  hasFeedback
                  >
                {getFieldDecorator('username', {
                  initialValue: data.username,
                  rules: [
                    {required: true, message: '请输入你的手机号' },
                    {pattern: /^1[34578]\d{9}$/, message: '请输入正确格式的手机号'}
                  ]
                })(
                    <Input
                        onBlur={this.onMobileInputBlur}
                        style={{width: 300}}
                        placeholder={`请输入手机号`}
                        addonBefore={prefixSelector} />
                )}
                </Form.Item>
                {/*
                <Form.Item label="图片验证码" required {...formItemLayout}>
                  <Input
                    className={styles.input}
                    placeholder="请输入图片验证码"
                    {...getFieldProps('checkingImageCode', {
                      validate: [{
                        rules: [
                          { required: true, message: '请输入图片验证码' },
                          { min: 5, max: 5, message: '图片验证码只能5位' }
                        ],
                        trigger: 'onBlur'
                      }]
                    })} />
                  <img src="https://img.alicdn.com/tps/TB1SWA9JpXXXXXSaXXXXXXXXXXX-120-120.jpg_120x120.jpg" width="50" height="20" className={styles.img} />
                </Form.Item>
                */}
                <Form.Item
                    label="短信验证码"
                    required
                    {...formItemLayout}>
                  {getFieldDecorator('code', {
                    initialValue: data.code,
                    rules: [
                      { required: true, message: '请输入短信验证码' },
                      { min: 4, max: 4, message: '短信验证码只能4位' }
                    ],
                    trigger: ["onBlur","onChange"]
                  })(
                      <Input
                          style={{width: 269}}
                          className={'input'}
                          placeholder="请输入短信验证码"/>
                  )}
                  <Button
                      type="primary"
                      // size="small"
                      disabled={this.state.checkingDisabled}
                      onClick={this.sendVerifycode.bind(this)}>
                    {this.state.remainedTime>0?`${this.state.remainedTime}s后重新发送验证码`:'发送短信验证码'}
                  </Button>
                </Form.Item>
                <Form.Item wrapperCol={{ span: 24 }}>
                  <Button
                      style={{display: 'block', width: 300, margin: '0 auto'}}
                      type="primary"
                      loading={nextBtnLoading}
                      onClick={this.step1.bind(this)}>
                    下一步
                  </Button>
                </Form.Item>
            </div>

            <div
                className={'form'}
                style={{display: step2Show?'':'none'}}>
                  <Form.Item
                  label="单位性质"
                  required
                  {...formItemLayout}>
                {getFieldDecorator('type', {
                  initialValue: '单位用户',
                  rules: [
                    { required: true, message: '请选择单位性质' },
                  ],
                  trigger: ["onBlur","onChange"]
                })(
                    <Radio.Group
                        onChange={this.onRadioChange}>
                      <Radio.Button value="单位用户">单位用户</Radio.Button>
                      {/*<Radio.Button value="个人用户">个人用户</Radio.Button>*/}
                      {/*<Radio.Button value="其他机构">
                        <span>
                          <Tooltip title="包括科研机构、学校等机构">
                            其他机构
                            <Icon type="question-circle-o" />
                          </Tooltip>
                        </span>
                      </Radio.Button>*/}
                    </Radio.Group>
                )}
              </Form.Item>

                  <div
                      data-form-role="1"
                      style={{display: `${ radioValue === '单位用户' ? 'block' : 'none' }`}}>
                    <Form.Item
                        {...formItemLayout}
                        label="单位名称"
                        hasFeedback
                        >
                      {getFieldDecorator('orgName', {
                        initialValue: data.orgName,
                        rules: [{
                          required: true, message: '请输入单位名称',
                        }]
                      })(
                          <Input placeholder={`请输入单位名称`}/>
                      )}
                    </Form.Item>
                    {/*<Form.Item
                        {...formItemLayout}
                        label={(
                  <span>
                    用户名
                    <Tooltip title="登入时的账号">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}
                        hasFeedback
                        >
                      {getFieldDecorator('nickname', {
                        initialValue: data.eciqCode,
                        rules: [
                          { required: true, message: '请输入用户名', whitespace: true },
                          {pattern: /[0-9a-zA-Z]{6,36}/, message: '只能使用数字0-9字母a-zA-Z作为用户名，长度在6-36个字符之间'}
                        ]
                      })(
                          <Input />
                      )}
                    </Form.Item>*/}
                    <Form.Item
                        {...formItemLayout}
                        label={(
                    <span>
                      <Tooltip title="登入时的密码">
                      密码
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                )}
                        hasFeedback
                        >
                      {getFieldDecorator('password', {
                        initialValue: data.password,
                        rules: [
                          {required: true, message: '请输入密码'},
                          {whitespace: true, message: '不能输入空格'},
                          {min: 6, message: '密码不能少于6位'},
                          {validator: this.checkConfirm}
                        ],
                      })(
                          <Input
                              type="password"
                              placeholder={`请输入密码`}/>
                      )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="确认密码"
                        hasFeedback
                        >
                      {getFieldDecorator('confirm', {
                        initialValue: data.confirm,
                        rules: [
                          {required: true, message: '请确认密码'},
                          {whitespace: true, message: '不能输入空格'},
                          {validator: this.checkPassword}
                        ],
                      })(
                          <Input
                              type="password"
                              placeholder={`请确认你的密码`}
                              onBlur={this.handleConfirmBlur} />
                      )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={
                        <span>
                      <Tooltip title="单位证照编号(需要公司印章)">
                       单位证照编号
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>}
                        // hasFeedback
                        >
                      {getFieldDecorator('businessLicenseCode', {
                        initialValue: data.businessLicenseCode,
                        rules: [{
                          required: true, message: '请输入单位证照编号',
                        }]
                      })(
                          <Input placehilder={`请输入单位证照编号`}/>
                      )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={
                         <Tooltip title="单位证照(需要公司印章)">
                        单位证照(需公司印章)(jpg、jpeg、pdf)
                        <Icon type="question-circle-o" />
                      </Tooltip>}
                        >
                      <div className="file-upload-container-inline">
                        <Upload {...yingyeProps}>
                          {<Button>上传</Button>}
                          {/*fileList.length >= 1 ? null : uploadButton*/}
                        </Upload>
                        {getFieldDecorator(`${yingyeDimName}`, {
                          initialValue: data[yingyeDimName],
                          rules: [
                            {required: true, message: '请上传附件'}
                          ],
                          valuePropName: 'value',
                        })(
                            <Input type="hidden" style={{ marginLeft: '-78px'}}
                                />
                        )}
                        <span>{yingyeFile.status === 'loading' ?
                            <Icon type="loading"/>
                        : yingyeFile.status === 'success' ?
                            <div style={{display: "inline-block"}}>
                              { (/\.pdf$/i).test(yingyeFile.response.responseObject.filePath) ?
                              <a
                                  style={{fontSize: 26}}
                                  className={`filename`}
                                  // href={`${CONFIG.ossFileUrl}${yingyeFile.response.responseObject.filePath}`}
                                  onClick={()=>{PDFViewer2.open(`${CONFIG.ossFileUrl}${yingyeFile.response.responseObject.filePath}`)}}
                                  target="_blank">{yingyeFile.response.responseObject.filePath ? <Icon type="file"/> : ''}</a>
                                  :
                              <img
                                  title="单位证照"
                                  onClick={this.onPreviewImage.bind(this, `${CONFIG.ossFileUrl}${yingyeFile.response.responseObject.filePath}`)}
                                  src={`${CONFIG.ossFileUrl}${yingyeFile.response.responseObject.filePath}`} className="previewImage"/>
                              }
                            </div>
                        : yingyeFile.status === 'error' ?
                        <span style={{color: 'red'}}><Icon type="lose-circle"/>上传失败</span>
                        : ''}</span>
                      </div>
                    </Form.Item>
                    {/*<Form.Item
                        {...formItemLayout}
                        label={<span>盖章授权书<a href="">(模板下载<Icon type="download"/>)</a></span>}
                        >
                      <div className="file-upload-container-inline">
                        <Upload {...shouquanProps}>
                          {<Button>上传</Button>}
                          {/!*fileList.length >= 1 ? null : uploadButton*!/}
                        </Upload>
                        {getFieldDecorator(`${shouquanDimName}`, {
                          initialValue: data[shouquanDimName],
                          rules: [
                            {required: true, message: '请上传附件'}
                          ],
                          valuePropName: 'value',
                        })(
                            <Input type="hidden" style={{ marginLeft: '-78px'}}
                                />
                        )}
                         <span>{authFile.status === 'loading' ?
                             <Icon type="loading"/>
                             : authFile.status === 'success' ?
                              <a
                                  className="previewFile"
                                  href={`${CONFIG.ossFileUrl}${authFile.response.responseObject.filePath}`}>
                                <Icon type="file"/>
                              </a>
                             : authFile.status === 'error' ?
                             <span style={{color: 'red'}}><Icon type="lose-circle"/>上传失败</span>
                             : ''}</span>
                      </div>
                    </Form.Item>*/}
                    <Form.Item
                        {...formItemLayout}
                        label="联系人"
                        // hasFeedback
                        >
                      {getFieldDecorator('contact', {
                        initialValue: data.contact,
                        rules: [{
                          required: true, message: '请输入联系人姓名',
                        }]
                      })(
                          <Input />
                      )}
                    </Form.Item>
                    <Form.Item
                        label="联系电话"
                        required
                        {...formItemLayout}>
                      {getFieldDecorator('phone', {
                        initialValue: data.phone,
                        rules: [
                          { required: true, message: '请输入联系电话' }
                        ],
                        trigger: ["onBlur","onChange"]
                      })(
                          <Input
                              style={{width: 400}}
                              className={'input'}
                              placeholder="请输入联系电话"
                              hasFeedback
                              />
                      )}
                    </Form.Item>
                  </div>

                  <div
                      style={{display: `${ radioValue === '个人用户' ? 'block' : 'none' }`}}
                      data-form-role="2">
                    {/*<Form.Item
                        {...formItemLayout}
                        label={(
                  <span>
                    用户名
                    <Tooltip title="登入时的账号">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}
                        hasFeedback
                        >
                      {getFieldDecorator('nickname', {
                        initialValue: data.eciqCode,
                        rules: [
                          { required: true, message: '请输入用户名', whitespace: true },
                          {pattern: /[0-9a-zA-Z]{6,36}/, message: '只能使用数字0-9字母a-zA-Z作为用户名，长度在6-36个字符之间'}
                        ]
                      })(
                          <Input />
                      )}
                    </Form.Item>*/}
                    <Form.Item
                        {...formItemLayout}
                        label={(
                    <span>
                      密码
                      <Tooltip title="登入时的密码">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                )}
                        hasFeedback
                        >
                      {getFieldDecorator('password', {
                        initialValue: data.password,
                        rules: [
                          {required: true, message: '请输入密码'},
                          {whitespace: true, message: '不能输入空格'},
                          {min: 6, message: '密码不能少于6位'},
                          {validator: this.checkConfirm}
                        ],
                      })(
                          <Input
                              type="password"
                              placeholder={`请输入密码`}/>
                      )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="确认密码"
                        hasFeedback
                        >
                      {getFieldDecorator('confirm', {
                        initialValue: data.confirm,
                        rules: [
                          {required: true, message: '请确认密码'},
                          {whitespace: true, message: '不能输入空格'},
                          {validator: this.checkPassword}
                        ],
                      })(
                          <Input
                              type="password"
                              placeholder={`请确认你的密码`}
                              onBlur={this.handleConfirmBlur} />
                      )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="姓名"
                        hasFeedback
                        >
                      {getFieldDecorator('realName', {
                        initialValue: data.realName,
                        rules: [{
                          required: true, message: '请输入你的姓名',
                        }]
                      })(
                          <Input />
                      )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="身份证号"
                        hasFeedback
                        >
                      {getFieldDecorator('idCardNumber', {
                        initialValue: data.idCardNumber,
                        rules: [{
                          required: true, message: '请输入你的身份证号',
                        }]
                      })(
                          <Input />
                      )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="身份证附件(jep、jpeg)"
                        >
                      <div className="file-upload-container-inline">
                        <Upload {...shenfenProps}>
                          {<Button>上传</Button>}
                          {/*fileList.length >= 1 ? null : uploadButton*/}
                        </Upload>
                        {getFieldDecorator(`${shenfenDimName}`, {
                          initialValue: data.baojiandanFile,
                          rules: [
                            {required: true, message: '请上传附件'}
                          ],
                          valuePropName: 'value',
                        })(
                            <Input type="hidden" style={{ marginLeft: '-78px'}}
                                />
                        )}
                      </div>
                    </Form.Item>
                    <Form.Item
                        label="联系电话"
                        required
                        {...formItemLayout}>
                      {getFieldDecorator('phone', {
                        initialValue: data.phone,
                        rules: [
                          { required: true, message: '请输入联系电话' }
                        ],
                        trigger: ["onBlur","onChange"]
                      })(
                          <Input
                              style={{width: 400}}
                              className={'input'}
                              placeholder="请输入联系电话"
                              hasFeedback
                              />
                      )}
                    </Form.Item>
                  </div>

                  <div
                      style={{display: `${ radioValue === '其他机构' ? 'block' : 'none' }`}}
                      data-form-role="3">
                    <Form.Item
                        {...formItemLayout}
                        label="机构名称"
                        hasFeedback
                        >
                      {getFieldDecorator('orgName', {
                        initialValue: data.orgName,
                        rules: [{
                          required: true, message: '请输入机构名称',
                        }]
                      })(
                          <Input />
                      )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="组织机构代码"
                        hasFeedback
                        >
                      {getFieldDecorator('orgCode', {
                        initialValue: data.orgCode,
                        rules: [{
                          required: false, message: '请输入组织机构代码',
                        }]
                      })(
                          <Input />
                      )}
                    </Form.Item>
                    {/*<Form.Item
                        {...formItemLayout}
                        label={(
                  <span>
                    用户名
                    <Tooltip title="登入时的账号">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}
                        hasFeedback
                        >
                      {getFieldDecorator('nickname', {
                        initialValue: data.eciqCode,
                        rules: [
                          { required: true, message: '请输入用户名', whitespace: true },
                          {pattern: /[0-9a-zA-Z]{6,36}/, message: '只能使用数字0-9字母a-zA-Z作为用户名，长度在6-36个字符之间'}
                        ]
                      })(
                          <Input />
                      )}
                    </Form.Item>*/}
                    <Form.Item
                        {...formItemLayout}
                        label={(
                    <span>
                      密码
                      <Tooltip title="登入时的密码">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                )}
                        hasFeedback
                        >
                      {getFieldDecorator('password', {
                        initialValue: data.password,
                        rules: [
                          {required: true, message: '请输入密码'},
                          {whitespace: true, message: '不能输入空格'},
                          {min: 6, message: '密码不能少于6位'},
                          {validator: this.checkConfirm}
                        ],
                      })(
                          <Input
                              type="password"
                              placeholder={`请输入密码`}/>
                      )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="确认密码"
                        hasFeedback
                        >
                      {getFieldDecorator('confirm', {
                        initialValue: data.confirm,
                        rules: [
                          {required: true, message: '请确认密码'},
                          {whitespace: true, message: '不能输入空格'},
                          {validator: this.checkPassword}
                        ],
                      })(
                          <Input
                              type="password"
                              placeholder={`请确认你的密码`}
                              onBlur={this.handleConfirmBlur} />
                      )}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="组织机构代码证附件"
                        >
                      <div className="file-upload-container-inline">
                        <Upload {...jigouProps}>
                          {<Button>上传</Button>}
                          {/*fileList.length >= 1 ? null : uploadButton*/}
                        </Upload>
                        {getFieldDecorator(`${jigouDimName}`, {
                          initialValue: data.baojiandanFile,
                          rules: [
                            {required: false, message: '请上传附件'}
                          ],
                          valuePropName: 'value',
                        })(
                            <Input type="hidden" style={{ marginLeft: '-78px'}}
                                />
                        )}
                      </div>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="盖章授权书"
                        >
                      <div className="file-upload-container-inline">
                        <Upload {...shouquanProps}>
                          {<Button>上传</Button>}
                          {/*fileList.length >= 1 ? null : uploadButton*/}
                        </Upload>
                        {getFieldDecorator(`${shouquanDimName}`, {
                          initialValue: data.baojiandanFile,
                          rules: [
                            {required: true, message: '请上传附件'}
                          ],
                          valuePropName: 'value',
                        })(
                            <Input type="hidden" style={{ marginLeft: '-78px'}}
                                />
                        )}
                      </div>
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="联系人"
                        hasFeedback
                        >
                      {getFieldDecorator('name', {
                        initialValue: data.eciqCode,
                        rules: [{
                          required: true, message: '请输入联系人姓名',
                        }]
                      })(
                          <Input />
                      )}
                    </Form.Item>
                    <Form.Item
                        label="联系电话"
                        required
                        {...formItemLayout}>
                      {getFieldDecorator('phone', {
                        initialValue: data.phone,
                        rules: [
                          { required: true, message: '请输入联系电话' }
                        ],
                        trigger: ["onBlur","onChange"]
                      })(
                          <Input
                              style={{width: 400}}
                              className={'input'}
                              placeholder="请输入联系电话"
                              hasFeedback
                              />
                      )}
                    </Form.Item>
                  </div>

              {/*<Form.Item label="所在地"
                           required
                             validateStatus={isFieldValidating('address')?"validating":getFieldError('address')?"error":"success"}
                             help={isFieldValidating('address') ? '校验中...' : (getFieldError('address') || []).join(', ')}
                    {...formItemLayout}>
                  <div className={'input'}>
                    <Cascader
                        {
                          ...getFieldProps('address', {
                            rules: [{ required: true, type: 'array',message:"请选择所在地" }],
                            trigger: ["onBlur","onChange"]
                          })}
                        placeholder=""
                        options={area}
                        />
                  </div>
                </Form.Item>
                <Form.Item label="机构类型" required {...formItemLayout}>
                  <Select showSearch
                    style={{ width: 200 }}
                    placeholder="请选择机构"
                    optionFilterProp="children"
                    notFoundContent="无法找到"
                    className={'input'}
                      {
                          ...getFieldProps('classId', {
                            rules: [
                              { required: true,type:"number",  message: '请选择机构类型' },
                            ],
                            trigger: ["onBlur","onChange"]
                          })
                      }
                  >
                    {institution}
                  </Select>
                </Form.Item>
                <Form.Item label="管理员密码" required {...formItemLayout}>
                  <Input
                    type="password"
                    className={'input'}
                    placeholder=""
                    {...getFieldProps('password', {
                      validate: [{
                        rules: [
                          { required: true, message: '请输入管理员密码' },
                          { min: 6, message: '管理员密码最少6位' }
                        ],
                        trigger: ["onBlur","onChange"]
                      }]
                    })} />
                </Form.Item>
                <Form.Item label="联系人姓名" required {...formItemLayout}>
                  <Input
                    className={'input'}
                    placeholder=""
                    {...getFieldProps('linkman', {
                      validate: [{
                        rules: [
                          { required: true, message: '请输入联系人姓名' },
                          { min: 2, message: '联系人姓名最少6位' }
                        ],
                        trigger: ["onBlur","onChange"]
                      }]
                    })} />
                </Form.Item>
                <Form.Item label="邮箱" required {...formItemLayout}>
                  <Input
                    className={'input'}
                    placeholder=""
                    {...getFieldProps('email', {
                      validate: [{
                        rules: [
                          { required: true, type:"email",message: '请输入邮箱' }
                        ],
                        trigger: ["onBlur","onChange"]
                      }]
                    })} />
                </Form.Item>*/}
              {/*<Form.Item
                  {...formItemLayout}
                  label=" "
                  colon={false}
                  style={{ marginBottom: 8 }}
                  validateStatus={agreement ? 'success' : 'error'}
                  help={agreement ? '' : '请同意该协议，才能注册'}>
                {getFieldDecorator('agreement', {
                  valuePropName: 'checked',
                })(
                    <Checkbox onChange={this.onCheckboxChange}>我同意该 <a href="">协议</a></Checkbox>
                )}
              </Form.Item>*/}
                <Form.Item wrapperCol={{ span: 24}}>
                  <Button
                      style={{display: 'block', width: 300, margin: '0 auto'}}
                      // disabled={!agreement}
                      type="primary"
                      size="large"
                      loading={registerBtnLoading}
                      // htmlType="submit"
                      onClick={this.step2.bind(this, radioValue)}>注册</Button>
                </Form.Item>
            </div>
            <div className={'form'} style={{display: step3Show?'':'none'}}>
              <Alert message="注册成功"
                description={<div>恭喜您完成用户注册！{time}s后将为你跳转到登入页面<div>请等待平台审核人员审核通过，审核结果将以短信的方式通知到您注册的手机号上</div></div>}
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

Register.propTypes = {
  prefix: PropTypes.string
};

Register.defaultProps = {
  prefix: 'yzh'
};

Register = Form.create()(Register);

export default Register;
