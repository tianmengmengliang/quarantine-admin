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

class AddRoleModal extends Component{

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
      if(err) {
        message.error(err.message || '填写未完整，请完善后再提交')
        return;
      }

      let _info = {};
      ['id','name','nameEn'].map((key)=>{
         _info[`${key}`] = data[`${key}`];
      });

        console.log('value:',_info); //json数据
        fetch('ciq.role.addrole',{
          // method: 'post',
          // headers: {},
          data: _info ,
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


  render(){
    const {prefix, title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const {confirmLoading, } = this.state;

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

    const _table = (
      <div>
        <table className={tableCls}>
          <tBody>
          <tr>
            <td style={titleStyle1}>角色名称：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('name', {
                    initialValue: data.name,
                    rules: [
                      { required: true, message:'请填写名称'},
                    ]
                  })(
                    <Input// style={{ width: '65%', marginRight: '3%' }}
                    />
                  )}</Form.Item>
              </div></td>
          </tr>

          <tr>
            <td style={titleStyle1}>角色英文名：</td>
            <td style={nameStyle}>
              <div className={`${inlineTrCls}`}>
                <Form.Item>
                  {getFieldDecorator('nameEn', {
                    initialValue: data.nameEn,
                    rules:  [
                      { required: true, message:'请填写英文名'},
                    ]
                  })(
                    <Input// style={{ width: '65%', marginRight: '3%' }}
                    />
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
        <h2 style={{textAlign: 'center'}}>新增角色</h2>
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
        </Form>
      </ModalA>
    )
  }
}

AddRoleModal.propTypes = {
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

AddRoleModal.defaultProps = {
  prefix: 'yzh',
  visible: false,
  callback: noop,
};

AddRoleModal = Form.create()(AddRoleModal);

export default AddRoleModal;
