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
}].map((s, i) => <Steps.Step key={i} title={s.title} description={s.description} />);

const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 13 },
};

class PhoneVerifycode extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentStep: 0,
            step1Show: true,
            step2Show: false,
            step3Show: false,
            checkingDisabled: false,
            institution:[],
            phoneNumber: 0,
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

    componentDidMount(){
      this.getPhoneNumber();
    }
    /*------查询登陆用户的手机号码----*/
    getPhoneNumber = ()=>{
        fetch('ciq.riskasesmtproject.selectpthon', {
          // method: 'post',
          // headers: {},
          data: {},
          success: (res)=>{
            //console.log('查询登陆用户的手机号码:', res);
            const {phone} = res.responseObject;
            this.setState({
              phoneNumber: phone
            })
          },
          error: (err)=>{
            message.error(err.message);
          },
          beforeSend: ()=>{
          },
          complete: (err, data)=>{
          }
        })
    }

    /*
     * 1. 点击“下一步”
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
            //手机验证码有效，页面跳转：
            hashHistory.push('/home');
        }

        // 表单验证
        this.props.form.validateFields(['phone', 'verifycode'], (errors, values) => {
            if (!!errors) {
                message.error('填写手机号验证失败');
                return;
            }
            //console.log('手机验证校验',values);
            // 手机验证码校验
            fetch('ciq.riskasesmtproject.phoneVerifycode', { //
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
            })



        });
    }

    /*
     * 2.发送手机短信验证码
     */
    sendVerifycode(){
        var self = this;
        var phone = this.props.form.getFieldValue('phone');
        if (!phone) return;

        var successCallback = function(d){
            self.setState({
                checkingDisabled: true
            });
        }
        // 发送手机号码
        xFetch('getverifycode', {phone: phone}, successCallback, null, 'post');
    }


    render(){
        const { currentStep, step1Show, step2Show, step3Show,checkingDisabled,phoneNumber } = this.state;
        const { getFieldProps } = this.props.form;

        let institution=this.state.institution.map(function(option,i){
            return (
                <Option value={option.id}>{option.name}</Option>
            )
        });
        return (
            <SampleMainLayout>
                <div className={styles.wrap}>
                    <div>
                        <h2 style={{textAlign:"center",}}>手机号码验证登录</h2>
                    </div>
                    <Form layout="horizontal" form={this.props.form}  //onSubmit={this.step2.bind(this)}
                    >
                        <div className={styles.form} style={{display: step1Show?'':'none'}}>
                            <Form.Item label="手机号码" required {...formItemLayout}>
                                <Input
                                    disabled="true"
                                    className={styles.input}
                                    {...getFieldProps('phone', {
                                        initialValue: phoneNumber,
                                        validate: [{
                                            //rules: [{ required: true, message: '必须填写手机号码' }, ],
                                            //trigger: 'onBlur'
                                        }]
                                    })} />
                            </Form.Item>

                            <Form.Item label="短信验证码" required {...formItemLayout}>
                                <Input
                                    className={styles.input}
                                    placeholder="请输入短信验证码"
                                    {...getFieldProps('verifycode', {
                                        validate: [{
                                            rules: [
                                                { required: true, message: '请输入短信验证码' },
                                                { min: 6, max: 6, message: '短信验证码只能6位' }
                                            ],
                                        }]
                                    })}  />
                                <Button type="primary" size="small" disabled={this.state.checkingDisabled} onClick={this.sendVerifycode.bind(this)}>发送短信验证码</Button>
                            </Form.Item>
                            <Form.Item wrapperCol={{ span: 12, offset: 7 }}>
                                <Button type="primary" onClick={this.step1.bind(this)}>下一步</Button>
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </SampleMainLayout>
        );
    }
};

PhoneVerifycode = Form.create()(PhoneVerifycode);

export default PhoneVerifycode;
