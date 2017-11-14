import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Card, Form, Input, Button, Checkbox, message, Alert, Icon } from 'antd';
import { Link, hashHistory } from 'react-router';
import LoginMainLayout from '../components/layouts/SimpleLayout/LoginMainLayout.jsx'
import config from '../../services/config';
import styles from './login2.less';
import {fetch, CONFIG} from '../../services/'

class Login2 extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading:false,
            loginMsg: '',
            contentMinHeight: '100%'
        };
    }

    componentDidMount() {
       /* this.setState({
            contentMinHeight: $(window).height()-50-34
        });
        $(window).on("resize",(e)=>{
            this.setState({
                contentMinHeight: $(window).height()-50-34
            });
        })*/
    }

    // 提交登录
    handleSubmit(e) {
        e.preventDefault();
        const self = this;

        //表单校验
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                //message.success('登录失败', 1);
                return;
            }
            // console.log(values);
            fetch('platform.user.login',{
                data: values,
                success: (res = {})=>{
                    // console.log(res, CONFIG);
                    const {responseObject} = res;
                    //console.log('登陆', responseObject );
                    localStorage.setItem(CONFIG.token, responseObject.token);
                    localStorage.setItem(CONFIG.user, JSON.stringify(responseObject.user));

                    const user = responseObject.user;
                    this.getUserRoles({id: user['id']}, (err, res)=> {
                      if (err) {
                        // s2-ss1-case1. 查询角色失败
                        message.error(`获取角色失败`);
                        return;
                      }else{
                        let {responseObject = []} = res;

                         hashHistory.push('/home');
                        //if(responseObject[0].nameEn === 'ciq_zhuanjia'){
                        //  hashHistory.push('/home2');
                        //}else{
                        //  hashHistory.push('/home');
                        //}
                      }
                    })
                },
                error: (err = {})=>{
                    this.setState({
                        loginMsg: err.message
                    })
                },
                beforeSend: ()=>{
                    // 设置登入按钮为loading状态
                    this.setState({
                        loading: true
                    });
                },
                complete: (err, res)=>{
                    // 设置登入按钮为unloading状态
                    this.setState({
                        loading: false
                    });
                }
            })
        });
    }

    /*
     * @interface 获取用户角色身份信息
     * @param {object} _props 参数对象
     * @param {func} callback 回调函数
     * */
    getUserRoles = (selectedId = {}, callback= ()=>{})=>{
      fetch('platform.user.roles', {
        data: selectedId,
        success: (res)=>{
          callback && callback(null, res);
        },
        error: (err)=>{
          callback && callback(err, null);
        },
        beforeSend: ()=>{
        },
        complete: (err, res)=>{
        }
      })
    };

    onChange = (props)=>{
        console.log(props)
    };

    render(){
        const { getFieldDecorator } = this.props.form;
        return (
            <LoginMainLayout>
                <div className={styles.wrap} style={{minHeight:this.state.contentMinHeight}}>
                    <Row className={styles["login-card"]}>
                        <Row className="card-wrap">
                            <Card title="帐号密码登录" style={{backgroundColor: '#ffffff'}}>
                                <Form horizontal form={this.props.form} onSubmit={this.handleSubmit.bind(this)}>
                                    <div style={{height:"24px"}}></div>
                                    <Form.Item label="">
                                        {getFieldDecorator('username', {
                                            validate: [{
                                                rules: [
                                                    {required: true, message: '账号不能为空'}
                                                ],
                                                trigger: ['onChange', 'onBlur']
                                            }]
                                        })(
                                            <Input
                                                addonBefore={<Icon type="user"/>}
                                                placeholder="请输入手机号或者单位名称"/>
                                        )}
                                    </Form.Item>
                                    <Form.Item label="">
                                        {getFieldDecorator('password', {
                                            rules: [
                                                { required: true, message: '请输入密码' },
                                                { min: 6, message: '密码长度最小6位' }
                                            ],
                                            trigger: ['onChange', 'onBlur']
                                        })(
                                            <Input
                                                addonBefore={<Icon type="lock" />}
                                                type="password"
                                                placeholder="请输入密码"/>
                                        )}
                                    </Form.Item>
                                    <span style={{color: 'red'}}>{this.state.loginMsg}</span>
                                    {/*<Form.Item>
                                     {/!*<Checkbox {...getFieldProps('agreement')}>下次自动登陆</Checkbox>*!/}
                                     </Form.Item>*/}
                                    {/*<a className={styles.register} style={{height:"34px"}}></a>*/}
                                    {<Link to="/register" className={styles.register} style={{fontSize: 16}}>没账号？注册账号</Link>}
                                    <Button type="primary" loading={this.state.loading} htmlType="submit" className={styles.btn}>登录</Button>
                                </Form>
                            </Card>
                        </Row>
                    </Row>
                </div>
            </LoginMainLayout>
        );
    }
};

Login2 = Form.create()(Login2);

const mapStateToProps=(state,ownProps)=>{
    return {

    }
};
const mapDispatchToProps={};

Login2 = connect(mapStateToProps,mapDispatchToProps)(Login2);

export default Login2;
