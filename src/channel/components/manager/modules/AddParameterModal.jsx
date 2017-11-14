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

//-------------------------- 动态表的字段名 -------------------------------------------------------------------------
const ROW_DIMS = ["content"];

function generateRowOject(){ //1.产生行对象。
  let rowObject = {};
  ROW_DIMS.forEach((key)=>{
    rowObject[key] = undefined
  })
  return rowObject
}

function generateRows(rowNumber){ //2.存储行。
  const _rows = [];
  for(let i=0; i<rowNumber; i++){
    _rows.push(generateRowOject())
  }
  return _rows
}

class AddParameterModal extends Component{

  _retInitialState= ()=>{ //设置初始状态。
    return {
      samples: [ generateRows(1) ],   //默认一行参数。
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
        const {id, content } = newData;
        if(!!content){
            let arrContent = [], jsoncontent= {};
            let ct = content.split(" "); // 按空格分割字符串。
            for (let i = 0; i<ct.length; i++) {
                jsoncontent['content']= ct[i];
                arrContent.push( jsoncontent);
                jsoncontent = {};  //清空
            }
            console.log('arrContent',arrContent);
            this.setState({
                samples: arrContent,
                id: id,
            });
        }
    }
  }


  //保存
  onOk = ( )=> {
    this.props.form.validateFieldsAndScroll((err, data) => { //数据检验。
      if(err) {
        message.error(err.message || '填写未完整，请完善后再提交')
        return;
      }

      let strContent = '';
      const arrContent = this.generateSamplesArray(data);
      for(let i=0; i<arrContent.length; i++){
         strContent = strContent + arrContent[i]['content'].trim() + " "; //补分隔用的空格
      }

      let _info = {
               id: data.id,
          content: strContent
      };

      console.log('_info:',_info); //json数据
      fetch('ciq.riskasesmtparameter.addparameter',{
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

  //-------------------- 获取动态增加表数据，重组数据结构。-------------------------------
  generateSamplesArray = (values)=>{
    const _values = values || this.props.form.getFieldsValue();
    const {samples = []} = this.state;
    let arrSample = [];
    for (let i=0; i<samples.length; i++){
      let  _row = {};    //每一行的数据对象。
      ROW_DIMS.map((key)=> {
         _row[key]= _values[`${key}${i}`]; //遍历每一行的数据。 key数组中的元素
      })
      arrSample.push(_row);
    }
    return arrSample;
  }
  remove = (k, rowIdnex) => { //k对象， samples数组， rowIdnex选中数组下标，
    const samples = this.generateSamplesArray();
    let _samples =[];
    if(samples.length < 2 ){  _samples = samples;
    }else{  _samples = samples.filter((_row, i)=>{return rowIdnex !== i}); //保留未被选中的行。
    }

    let _values = {};
    _samples.forEach((_row, i)=>{
      ROW_DIMS.forEach((dimsKey)=>{
        _values[`${dimsKey}${i}`] = _row[dimsKey]
      })
    });
    this.state.samples = _samples;
    this.props.form.setFieldsValue(_values);
  }

  addk = () => {
    const {samples = [] } = this.state;
    this.setState({
       samples: [...samples].concat( generateRows(1)) //每点击一次，数组合并。
    })
  }

  render(){
    const {prefix, title, visible, data = {}, ...props} = this.props;
    const {getFieldDecorator, getFieldValue } = this.props.form;
    const {confirmLoading, samples=[], } = this.state;

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
    const nameStyle = {width: 200,background:'#E3F4FF'};
    const titleStyle1 = {width:100, textAlign:'right',marginRight:10,background:'#E3F4FF'};
    const titleStyle2 = {background:'#E3F4FF'};
    const inlineTrCls = cx({
      [`inline-tr`]: true
    });

    const _tr = samples.map((k,index) => { //k数组中的元素  index数组下标。
      return (
        <tr>
            <td style={titleStyle1}>{index+1}:
            </td>
            <td>
              <Form.Item  key={k}>
                {getFieldDecorator(`content${index}`,{
                  initialValue: k['content'],
                  validateTrigger: ['onChange', 'onBlur'],
                  rules: [{
                      required:true,  message:"请输入或删除该行",
                  }],
                })(
                  <Input  style={{width: '90%', marginLeft:2 }} />
                )}
              </Form.Item>
            </td>
            <td>
              <Icon
                className="dynamic-delete-button"
                type="minus-circle-o"
                disabled={samples.length < 2 }
                onClick={() => this.remove(k, index)}
              />
            </td>
        </tr> );
    });

    const _table = (
      <div>
        <table className={tableCls}>
          <tBody>
          <tr>
            <td>
            <table  className={inlineTableCls}>
                  <tr>
                    <td style={titleStyle1}><div className={`${inlineTrCls}`}>参数名称：</div></td>
                    <td style={nameStyle}  ><div className={`${inlineTrCls}`}>{data.name}</div></td>
                    <td style={titleStyle2}><div className={`${inlineTrCls}`}></div></td>
                  </tr>


                  {_tr}
                  <tr>
                    <td><Button onClick={this.addk} style={{ width:'100px', marginLeft:10,marginTop:10, marginBottom:10,}}>
                      <Icon type="plus" />
                    </Button>
                    </td>
                  </tr>
              </table>
            </td>
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
        <h2 style={{textAlign: 'center'}}>修改参数</h2>
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

AddParameterModal.propTypes = {
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

AddParameterModal.defaultProps = {
  prefix: 'yzh',
  visible: false,
  callback: noop,
};

AddParameterModal = Form.create()(AddParameterModal);

export default AddParameterModal;
