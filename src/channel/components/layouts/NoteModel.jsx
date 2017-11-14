/**
 * Created by 贾鹏涛 on 2017/8/9.
 */
import React, { Component, PropTypes } from 'react';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete, message, } from 'antd';
import { Router, Route, Link, Redirect, hashHistory } from 'react-router';
import {fetch, CONFIG} from 'antd/../../src/services/'
//console.log( fetch);
//const FormItem = Form.Item;
import styles from './NoteModel.less'


class NoteModel extends React.Component {

  /*
   * @interface 提交留言
   * @param {object} props 参数
   * */
  saveNoteModel = (data={}, callback)=>{
    fetch('ciq.riskAsesmtMessage.save', {
      // method: 'post',
      // headers: {},
      data: data,
      success: (res)=>{
        callback && callback(null, res)
        message.success(`留言发表成功`);
      },
      error: (err)=>{
        callback && callback(err, null)
      },
      beforeSend: ()=>{
      },
      complete: (err, data)=>{
      }
    })
  };
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        //console.log('values of:', values);
        this.saveNoteModel(values,(err, res)=>{
          if(err){
            message.error(err.message||`留言发表失败`);
            return;
          }else{
            //发表成功，页面跳转。
            let {responseObject = []} = res;
            hashHistory.push('/home');
          }
        });
      }else{
        message.warn(`留言未填写完整`);
      }
    });
  }

  /** 5.限定字符串长度 **/
  disabledLength =(rule, value, callback)=>{
      const _reg = /^\s*\S((.){0,220}\S)?\s*$/;
      if(_reg.test(value) ){
         callback();
         return ;
      }else{
         callback(`限制少于200字!`);
      }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    return (
      <div className={styles.Note}>
          <Link to="/home"><Button size="large" icon="rollback">返回</Button></Link>
          <div className={styles.wrap}>
              <h3>浙江生物医药特殊物品出入境集中监管平台反馈留言板</h3>
              <Form onSubmit={this.handleSubmit} className={styles["Note-form"]}>
                <Form.Item
                  {...formItemLayout}
                  label="你的名字"
                  >
                  {getFieldDecorator('name', {
                    rules: [{required: true, message: '你的名字!'}],
                  })(
                    <Input />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="联系Email"
                  >
                  {getFieldDecorator('email', {
                    rules: [{required: true, message: '请填写联系Email!'}],
                  })(
                    <Input />
                  )}
                </Form.Item>

                <Form.Item
                  {...formItemLayout}
                  label="所在地区"
                >
                  {getFieldDecorator('region', {
                    rules: [{required: true, message: '请填写所在地区!'}],
                  })(
                    <Input  />
                  )}
                </Form.Item>

                <Form.Item
                  {...formItemLayout}
                  label="联系电话"
                >
                  {getFieldDecorator('phone', {
                    rules: [{required: true, message: '请填写联系电话!'}],
                  })(
                    <Input  />
                  )}
                </Form.Item>
                <p style={{color:'#09F',paddingLeft:20,paddingRight:20,}}>&emsp;&emsp;建议您填写Email和电话联系方式信息，将有助于我们
                   尽快解决您提出的问题，并及时与您沟通处理结果。</p>
                <Form.Item
                  {...formItemLayout}
                  label="意见及建议"
                >
                  {getFieldDecorator('suggest', {
                    rules: [
                        {required: true, message: '请填写意见及建议!'},
                        {validator:this.disabledLength }
                    ],
                  })(
                    <Input type="textarea" autosize={{ minRows: 4, maxRows: 6 }}/>
                  )}
                </Form.Item>

                <Form.Item>
                   <Button type="primary" htmlType="submit" className={styles["submit-button"]}>提交 </Button>
                </Form.Item>
              </Form>
          </div>
      </div>
    );
  }
}

NoteModel = Form.create({})(NoteModel);//修改后的文件。

//模块导出
export default NoteModel;
