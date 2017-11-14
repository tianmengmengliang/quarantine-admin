import React, { Component, PropTypes } from 'react';
import {Form, Select, Upload, Icon, Input, DatePicker,
    Popconfirm, Row, Col, Button, InputNumber, message, Radio, Checkbox } from 'antd'
const CheckboxGroup = Checkbox.Group;
import moment from 'moment'
import cx from 'classnames'
import {remove} from 'antd/../../src/utils/arrayUtils.js'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable,  InputUpload} from    '../../../../components/'
//import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable, InputUpload} from 'antd/../../src/components/'
import {dimsMap} from '../../helpers/'
import './customTable.less'


const {custom: {entryExit}} = dimsMap;
function noop(){}


//-------------------------- 动态表的字段名 -------------------------------------------------------------------------
const ROW_DIMS = ["sampleName", "englishName","sampleQuantity", "pack", "capacity"];

function generateRowOject(){ //1.产生行对象。
  let rowObject = {};
  ROW_DIMS.forEach((key)=>{
    rowObject[key] = undefined
  })
  return rowObject
}

function generateRows(rowNumber){ //2.存储行。
  const _rows = []
  for(let i=0; i<rowNumber; i++){
    _rows.push(generateRowOject())
  }
  return _rows
}


class AddPreApprovalT3Modal extends Component{
    _retInitialState= ()=>{ //用于状态的重置。
        return {
            samples: [ generateRows(1) ],
            shippingDate: [],
            source:[],
            users: [],
            port: [],
            confirmLoading: false,
            item2: 1,
            item3: 1,
            item4: 0,
            item5: 0,
            item6: 0,
            item7: 0,
            item8: 0,
            item9: 0,
            item10:0,
            item11:0,
            item12:0,
            item13:0,
            item14:0,
            item15: [],
        }
    };

    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    componentWillReceiveProps(nextProps){ //当组件传入的 props变化时调用，更新state。
        const {visible} = nextProps;
        const {data: newData} = nextProps;
        const {data: oldData} = this.props;
        if(visible && newData !== oldData){
          const { userId, samples= [],sourceCollection, users, port, urgent} = newData;
          if( userId ){
              let arrshippingDate=[], arrsource=[], arrusers= [], arrport= [],arrurgent=[];
              ['shippingDateStart', 'shippingDateEnd'].forEach( (key)=>{
                    arrshippingDate.push(  moment.unix(newData[key]/1000)  );
              });
              let source = sourceCollection.split(" ");
              for(let i=0; i<source.length;  i++){
                   arrsource.push(`${source[i]}`);
              }
              let us = users.split(" ");
              for(let i=0; i<us.length;  i++){
                   arrusers.push(`${us[i]}`);
              }
              let pt = port.split(" ");
              for(let i=0; i<pt.length;  i++){
                   arrport.push(`${pt[i]}`);
              }
              /**----------------------------------------------**/
              let itemsValue = {};
              ["path2", 'path3',"path4", 'path5', 'path6', 'path7', 'path8', 'path9', 'path10', 'path11', 'path12', 'path13', 'path14'].forEach((key)=>{
                 const itemVal= newData[key]!== null ? 1 : 2
                 itemsValue[`item${key.substring(4)}`] =  itemVal;
              });
             /**-------------------加急 -----------------------**/

             if( urgent !== null ){  arrurgent.push('加急') }else{  }
              //console.log("newData内容:",newData );
              //console.log("item的状态:",itemsValue );

              this.setState({
                 samples: [...samples],
                 shippingDate: arrshippingDate,
                 source: arrsource,
                 users: arrusers,
                 port: arrport,
                 ...itemsValue,
                item15: arrurgent
              });
          }


        }
    }

    handleRowUpdated = ({ rowIdx, updated })=> {
        const {listPage} = this.state;
        const {rows} = listPage;
        Object.assign(rows[rowIdx], updated);
        this.setState({
            listPage
        });
    };

    //保存
    onOk = ( )=> {
      this.props.form.validateFieldsAndScroll((err, data) => { //数据。
        console.log('保存申请单步骤-:', data );
        if (err) {
           message.error(err.message || '订单填写未完整，请完善后再提交')
          return;
        }
        //console.log('新建申请单:', data );
        const arrSample = this.generateSamplesArray(data);
        this.setState({
           samples: arrSample,
        })

        let strSource='', strUsers = '',strport = '';
        const {sourceCollection=[], users=[], port=[]  }= data;
        for(let i=0;i<sourceCollection.length;i++){ //复选框组件。
          strSource = strSource + sourceCollection[i]+" ";
        }
        for(let i=0;i<users.length; i++){//复选框组件。
          strUsers = strUsers + users[i]+" ";
        }
        for(let i=0;i<port.length; i++){//复选框组件。
          strport = strport + port[i]+" ";
        }

        let filePaths = {};
        let files = ["path2", 'path3',"path4", 'path5', 'path6', 'path7', 'path8', 'path9', 'path10', 'path11', 'path12', 'path13', 'path14','urgent'];
        files.forEach((key)=>{
            const fileData = data[key] || {}
             //1.上传文件是对象时，
            if(typeof fileData == "object"){
              filePaths[key] = fileData.filePath; //js语法：塞入新属性，[]和.的作用:对象内的元素。
            }//2.上传文件是字符串路径时，
            else if(typeof fileData == "string"){
              filePaths[key] = fileData;
            }else{
              filePaths[key] = fileData.filePath;
            }
        });

        var fpData = {
                id: data.id,
          category: data.category,    //申请类别1，2，3.
           samples: arrSample,              //样品表
          projectName: data.projectName,  //项目名称
          batch: data.batch,               //批次
          inOut: data.inOut,               //出入境类型
          shippingDateStart: data.shippingDate[0].unix()*1000, //运送日期
          shippingDateEnd: data.shippingDate[1].unix()*1000,

          companyName: data.companyName,        //申请企业
          companyAddress: data.companyAddress,
          companyPic: data.companyPic,
          companyTel: data.companyTel,
          sourceCollection: strSource,    //样品来源
          users: strUsers,                  //样品用途
          port: strport,                   //出入境口岸
          nature: data.nature,              //单位性质
          registered: data.registered,     //注册地
          otherChinaName: data.otherChinaName,              //外企
          otherChinaAddress: data.otherChinaAddress,       //外企地址
          otherEnglishName: data.otherEnglishName,         //英文
          otherEnglishAddress: data.otherEnglishAddress,   //英文地址
          otherPic: data.otherPic,
          otherTel: data.otherTel,
          commentes: data.commentes,      //备注说明
          ...filePaths
        };
         console.log('保存申请单步骤二:', fpData );
         fetch('ciq.riskasesmtproject.save', {
              // method: 'post',
              // headers: {},
              data: fpData,
              success: (res)=> {
                 message.success(`保存成功`);
                /* 步骤一、回调父组件callback函数, 隐藏对话框、再次查询列表。*/
                this.props.callback && this.props.callback({
                  click: 'ok',
                  data: null,
                });
                /* 步骤二、将组件重置到初始状态。*/
                this.setState(this._retInitialState());
                this.props.form.resetFields();
              },
              error: (err)=> {
                message.error('保存数据失败');
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
        this.props.form.resetFields();
    };
//-------------------------------------------------------------------


//------------------------------------------------
    onChange4 = (e) => {
      this.setState({
        item4: e.target.value,
      });
    }
    onChange5 = (e) => {
      this.setState({
        item5: e.target.value,
      });
    }
    onChange6 = (e) => {
      this.setState({
        item6: e.target.value,
      });
    }
    onChange7 = (e) => {
      this.setState({
        item7: e.target.value,
      });
    }
    onChange8 = (e) => {
      this.setState({
        item8: e.target.value,
      });
    }
    onChange9 = (e) => {
      this.setState({
         item9: e.target.value,
      });
    }
    onChange10 = (e) =>{
      this.setState({
        item10:  e.target.value,
      });
    }
    onChange11 = (e) =>{
      this.setState({
          item11:  e.target.value,
      });
    }
    onChange12 = (e) =>{
      this.setState({
         item12: e.target.value,
      });
    }
    onChange13 = (e) =>{
      this.setState({
         item13: e.target.value,
      });
    }
    onChange14 = (e) =>{
      this.setState({
         item14: e.target.value,
      });
    }
    onChange15 = ( checkedValue) =>{
      //console.log('是否加急',checkedValue);
      this.setState({
        item15: checkedValue,
      });
    }


//-------------------- 获取动态表数据，重组数据结构。-------------------------------
    generateSamplesArray = (values)=>{
      const _values = values || this.props.form.getFieldsValue();
      const {samples = []} = this.state;
      let arrSample = [];
      for (let i=0; i<samples.length; i++){
        let  _row = {};    //每一行的数据对象。
        ROW_DIMS.map((key)=> {
          _row[key] = _values[`${key}${i}`]  //遍历每一行的数据。 key数组中的元素
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
    /** 1.动态增加 **/
    addk = () => {
      const {samples = [] } = this.state;
      console.log('---samples--',samples);
      this.setState({
        samples: [...samples].concat(generateRows(1)) //每点击一次，数组合并。
      })
    }

    /** 1.设置下拉列表固定 **/
    getPopup =( triggerNode )=>{
          return  triggerNode
    }
   /** 2.设置已过日期不可选 **/
    disabledDate =( current )=>{
      return current && current.valueOf() < Date.now();
    }
    /** 1.验证整数数值 **/
    disabledNumber =(rule, value, callback)=>{
      const reg= /^[0-9]*[1-9][0-9]*$/;
      if(reg.test(value) ){
          callback();
          return ;
      }else{
          callback('只能输整数!');
        }
    }
    /** 2.验证手机号码 **/
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
    /** 3.验证中方联系人姓名的长度 **/
    disabledNameLength =(rule, value, callback)=>{
      const _reg = /^\s*\S((.){0,20}\S)?\s*$/;
      if(_reg.test(value) ){
        callback();
        return ;
      }else{
        callback(`限制少于20字!`);
      }
    }
    /** 3.1.验证英文联系人姓名的长度 **/
    disabledNameLength2 =(rule, value, callback)=>{
      const _reg = /^\s*\S((.){0,50}\S)?\s*$/;
      if(_reg.test(value) ){
        callback();
        return ;
      }else{
        callback(`限制少于50字!`);
      }
    }
    /** 4.验证文件上传不能为空  **/
    disabledNull =(rule, value, callback)=>{
      if(value === null ||value === ''){
          callback(`请下载样表，填写后转PDF格式上传`);
          return ;
      }else{
        callback();
      }
    }
    /** 5.验证字符串长度 **/
    disabledLength =(rule, value, callback)=>{
      const _reg = /^\s*\S((.){0,400}\S)?\s*$/;
      if(_reg.test(value) ){
        callback();
        return ;
      }else{
        callback(`限制少于400字!`);
      }
    }

  render(){
        const { samples=[], shippingDate=[],source=[], users=[], port=[], item2,item3,item4,item5,item6,item7,item8,item9,item10,item11,item12,item13,item14,item15}=this.state;
        const {prefix, title, visible, data = {}, ...props} = this.props;
        const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;
        const {confirmLoading} = this.state;


        //console.log("data数据",data )
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
        const titleStyle1 = {width:100, background:'#E3F4FF'};
        const titleStyle2 = {background:'#E3F4FF'};
        const titleStyle3 = {width:'80%',background:'#E3F4FF'};
        const inlineTrCls = cx({
            [`inline-tr`]: true,
        });
        const sign = {color:'#f00',fontfamily:'微软雅黑',fontSize:'16px',};

        //---------------------------动态表-------------------------------------------------------------------
        const _tr = samples.map((k,index) => { //k数组中的元素  index数组下标。
          return ( <tr>
            <td>
              <Form.Item  key={k}>
                {getFieldDecorator(`sampleName${index}`,{
                  initialValue: k['sampleName'],
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
              <Form.Item  key={k}>
                {getFieldDecorator(`englishName${index}`,{ initialValue: k['englishName'],
                  validateTrigger: ['onChange', 'onBlur'],
                  rules: [{
                    required: true,
                    message: "请输入或删除该行",
                  }],
                })(
                  <Input style={{width:'90%',marginLeft:2 }} />
                )}
              </Form.Item>
            </td>

            <td>
              <Form.Item key={k}>
                {getFieldDecorator(`sampleQuantity${index}`,{ initialValue: k['sampleQuantity'],//
                  validateTrigger: ['onChange', 'onBlur'],
                  rules: [
                    {required: true, message:"请输数字" },
                    {validator: this.disabledNumber }
                 ],
                })(
                  <Input style={{width: '90%',marginLeft:2 }} />
                )}
              </Form.Item>
            </td>

            <td>
              <Form.Item  key={k}>
                {getFieldDecorator(`pack${index}`,{  initialValue: k['pack'],//
                  validateTrigger: ['onChange', 'onBlur'],
                  rules: [{
                    required: true,
                    message: "请输入或删除该行",
                  }],
                })(
                  <Input style={{width: '90%',marginLeft:2 }} />
                )}
              </Form.Item>
            </td>
            <td>
              <Form.Item  key={k}>
                {getFieldDecorator(`capacity${index}`,{ initialValue: k['capacity'],//
                  validateTrigger: ['onChange', 'onBlur'],
                  rules: [{
                    required: true,
                    message: "请输入或删除该行",

                  }],
                })(
                  <Input style={{width:'90%',marginLeft:2 }} />
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

        //----------------------- 风险评估动态参数 --------------------------------------------------------
        const {Parameters, } = data;
        //console.log('data',data);
        //console.log('Parameters',data.Parameters );
        let arrSource=[],arrUsers=[], arrPort= [];
        if(Parameters!== undefined){
           arrSource =Parameters[0]['content'].split(" "); //根据空格分隔；
           arrUsers = Parameters[1]['content'].split(" "); //根据空格分隔；
           arrPort  = Parameters[2]['content'].split(" "); //根据空格分隔；
        }

        const _table = (
              <div>
                  <table className={tableCls}>
                      <tBody>
                          <tr></tr>
                          <tr>
                            <td style={titleStyle1}>特殊物品</td>
                            <td colSpan={6}>
                              <table  className={inlineTableCls}>
                                <tr>
                                  <td style={nameStyle}><div className={`${inlineTrCls}`}>中文名称</div></td>
                                  <td style={nameStyle}><div className={`${inlineTrCls}`}>英文名称</div></td>
                                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>样品数量 </div></td>
                                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>包装单位 </div></td>
                                  <td style={titleStyle2}><div className={`${inlineTrCls}`}>规格    </div></td>
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
                          <tr>
                            <td style={titleStyle1}>项目名称</td>
                            <td colSpan={6}>
                              <div className={`${inlineTrCls}`}>
                                <Form.Item>
                                {getFieldDecorator('projectName', {
                                  initialValue: data.projectName,
                                  rules: [{ required: true, message:'请填写项目名称' },]
                                })(
                                  <Input //style={{ width: 600, marginRight: '3%' }}
                                  />
                                )}</Form.Item>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style={titleStyle1}>首次/延续(批次)</td>
                            <td colSpan={6}>
                                <table className={inlineTableCls}>
                                  <tr>
                                    <td>
                                      <div>
                                      <Form.Item>
                                        {getFieldDecorator('batch', {
                                          initialValue: data.batch,
                                          rules: [{required: true, message:'请选择'}, ]
                                        })(
                                          <Radio.Group>
                                            <Radio value={1}>首次</Radio>
                                            <Radio value={2}>延续</Radio>
                                          </Radio.Group>
                                        )}
                                      </Form.Item>
                                    </div></td>
                                    <td style={titleStyle2}>出入境类型</td>
                                    <td>
                                      <div className={`${inlineTrCls}`}>
                                        <Form.Item>
                                          {getFieldDecorator('inOut',{
                                            initialValue: data.inOut,
                                            rules: [{required: true, message:'请填写出入境类型' }, ]
                                          })(
                                            <Select
                                              style={{width: 100}}
                                              placeholder="请选择类型"
                                              allowClear={true}
                                              multiple={false}
                                              combobox={false}
                                              tags={false}
                                              showSearch={false}
                                              filterOption={false}
                                              optionFilterProp={`children`}
                                              labelInValue={false}
                                              tokenSeparators={null}
                                              getPopupContainer={this.getPopup} //菜单滚动定位问题
                                             >
                                              <Select.Option value={1}>{'入境'}</Select.Option>
                                              <Select.Option value={2}>{'出境'}</Select.Option>
                                            </Select>
                                          )}
                                        </Form.Item>
                                      </div>
                                    </td>
                                    <td style={titleStyle2}>运送起止日期</td>
                                    <td>
                                      <div className={`${inlineTrCls}`}>
                                        <Form.Item>
                                        {getFieldDecorator('shippingDate', {
                                          initialValue: shippingDate ,
                                          rules: [{required:true, message:'请选择起运日期'}, ]
                                        })(
                                          <DatePicker.RangePicker
                                            allowClear
                                            showTime={false}
                                            format={''}
                                            ranges={{ '1个月': [moment(), moment().add(1, 'M')], '2个月': [moment(), moment().add(2, 'M')], '3个月': [moment(), moment().add(3, 'M')] }}
                                            format="YYYY-MM-DD"
                                            disabledDate={this.disabledDate }  //已过日期不可选。
                                            //getCalendarContainer={this.getPopup} //菜单滚动问题。
                                          />
                                        )}
                                        </Form.Item>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                            </td>
                          </tr>
                          <tr>  {/*-------------------添加外方部分---------------------*/}
                            <td style={titleStyle1}>外方接受(输出机构)</td>
                            <td colSpan={6}>
                               <table className={inlineTableCls}>
                                <tr>
                                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>中文名称  </div></td>
                                  <td><div className={`${inlineTrCls}`}>
                                    <Form.Item>
                                    {getFieldDecorator('otherChinaName', {
                                      initialValue: data.otherChinaName,
                                      rules: [
                                        { required: true, message:'请填写中文名称' },
                                      ]
                                    })(
                                      <Input  //style={{ width: 600, marginRight: '3%' }}
                                      />
                                    )}
                                      </Form.Item>
                                  </div></td>
                                </tr>
                                <tr>
                                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>中文地址 </div></td>
                                  <td><div className={`${inlineTrCls}`}>
                                    <Form.Item>
                                    {getFieldDecorator('otherChinaAddress', {
                                      initialValue: data.otherChinaAddress,
                                      rules: [
                                        { required: true, message:'请填写中文地址' },
                                      ]
                                    })(
                                      <Input //style={{width: 600, marginRight: '3%' }}
                                      />
                                    )}</Form.Item>
                                  </div></td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>  {/*-------------------添加申请企业部分---------------------*/}
                            <td style={titleStyle1}>申请单位</td>
                            <td colSpan={6}>
                                <table className={inlineTableCls}>
                                  <tr>
                                    <td style={titleStyle1}><div className={`${inlineTrCls}`}>名称 </div></td>
                                    <td><div className={`${inlineTrCls}`}>
                                      <Form.Item>
                                      {getFieldDecorator('companyName', {
                                        initialValue: data.companyName,
                                        rules: [
                                          { required: true, message:'请填写企业名称' },
                                        ]
                                      })(
                                        <Input //style={{width: 600, marginRight: '3%' }}
                                        />
                                      )}</Form.Item>
                                    </div></td>
                                  </tr>
                                  <tr>
                                    <td style={titleStyle1}><div className={`${inlineTrCls}`}>地址 </div></td>
                                    <td><div className={`${inlineTrCls}`}>
                                      <Form.Item>
                                      {getFieldDecorator('companyAddress', {
                                        initialValue: data.companyAddress,
                                        rules: [
                                          { required: true, message:'请填写企业地址' },
                                        ]
                                      })(
                                        <Input //style={{width: 600, marginRight: '3%' }}
                                        />
                                      )}</Form.Item>
                                    </div></td>
                                  </tr>
                                  <tr>
                                    <td style={titleStyle1}><div className={`${inlineTrCls}`}>联系人 </div></td>
                                    <td><table className={inlineTableCls}>
                                      <tr>
                                        <td><div className={`${inlineTrCls}`}>
                                          <Form.Item>
                                          {getFieldDecorator('companyPic', {
                                            initialValue: data.companyPic,
                                            rules:[
                                                {required:true, message:'请填写联系人姓名'},
                                                {validator:this.disabledNameLength  }
                                            ]
                                          })(
                                            <Input// style={{ width: '65%', marginRight: '3%' }}
                                            />
                                          )}</Form.Item>
                                        </div></td>
                                        <td style={titleStyle1}><div className={`${inlineTrCls}`}>电话</div></td>
                                        <td><div className={`${inlineTrCls}`}>
                                          <Form.Item>
                                          {getFieldDecorator('companyTel', {
                                            initialValue: data.companyTel,
                                            rules: [{required: true, message:'请填写电话' }]
                                          })(
                                            <Input// style={{ width: '65%', marginRight: '3%' }}
                                            />
                                          )}</Form.Item>
                                        </div></td>
                                      </tr>
                                    </table> </td>
                                  </tr>
                                </table>
                            </td>
                          </tr>
                          <tr>
                              <td style={titleStyle2}>项目简况</td>
                              <td colSpan={6}>
                                  <table className={inlineTableCls}>
                                      <tr>
                                          <td style={titleStyle1}><div className={`${inlineTrCls}`}>特殊物品来源</div></td>
                                          <td><div className={`${inlineTrCls}`}>
                                            <Form.Item>
                                            {getFieldDecorator('sourceCollection', {
                                              initialValue: source,
                                              rules:[
                                                { required: true, message:'请选择来源' },
                                              ]
                                            })(
                                              <CheckboxGroup options={arrSource}  />
                                            )}</Form.Item>
                                          </div></td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle1}><div className={`${inlineTrCls}`}>特殊物品用途 </div></td>
                                          <td><div className={`${inlineTrCls}`}>
                                            <Form.Item>
                                            {getFieldDecorator('users', {
                                              initialValue: users,
                                              rules:[
                                                { required:true, message:'请选择用途' },
                                              ]
                                            })(
                                              <CheckboxGroup options={arrUsers}  />
                                            )}</Form.Item>
                                          </div></td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle1}><div className={`${inlineTrCls}`}>出入境口岸</div></td>
                                          <td><div className={`${inlineTrCls}`} >
                                            <Form.Item>
                                              {getFieldDecorator('port', {
                                                initialValue: port,
                                                rules: [
                                                  { required: true, message:'请填写出入境口岸' },
                                                ]
                                              })(
                                                <CheckboxGroup options={arrPort} />
                                              )}
                                            </Form.Item>
                                          </div></td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle1}><div className={`${inlineTrCls}`}>单位性质 </div></td>
                                          <td><table className={inlineTableCls}>
                                            <tr>
                                              <td>
                                                <div className={`${inlineTrCls}`} style={{margin:"0 auto",}}>
                                                  <Form.Item>
                                                  {getFieldDecorator('nature', {
                                                    initialValue: data.nature,
                                                    rules:[
                                                      { required: true, message:'请填写企业性质' },
                                                    ]
                                                  })(
                                                    <Radio.Group>
                                                      <Radio value={1}>民营</Radio>
                                                      <Radio value={2}>国有</Radio>
                                                      <Radio value={3}>外商独资</Radio>
                                                      <Radio value={4}>中外合资</Radio>
                                                      <Radio value={5}>其他</Radio>
                                                    </Radio.Group>
                                                  )}</Form.Item>
                                                </div>
                                              </td>
                                              <td style={titleStyle1}>
                                                <div className={`${inlineTrCls}`}>注册地</div>
                                              </td>
                                              <td>

                                                <div className={`${inlineTrCls}`} style={{margin:"0 auto",}}>
                                                  <Form.Item>
                                                  {getFieldDecorator('registered', {
                                                    initialValue: data.registered,
                                                    rules: [
                                                      { required: true, message:'请选择' },
                                                    ]
                                                  })(
                                                    <Radio.Group>
                                                      <Radio value={1}>省内</Radio>
                                                      <Radio value={2}>国内</Radio>
                                                      <Radio value={3}>国外</Radio>
                                                    </Radio.Group>
                                                  )} </Form.Item>
                                                </div>
                                              </td>
                                            </tr>
                                          </table></td>
                                      </tr>
                                      <tr>
                                        <td style={titleStyle1}><div className={`${inlineTrCls}`}>外方接受(输出)单位或中心实验室</div></td>
                                        <td><table className={inlineTableCls}>
                                          <tr>
                                            <td style={titleStyle1}><div className={`${inlineTrCls}`}>名称（英文）</div></td>
                                            <td> <div className={`${inlineTrCls}`}>
                                              <Form.Item>
                                              {getFieldDecorator('otherEnglishName', {
                                                initialValue: data.otherEnglishName,
                                                rules: [
                                                  { required: true, message:'请填写英文名称' },
                                                ]
                                              })(
                                                <Input// style={{ width: '65%', marginRight: '3%' }}
                                                />
                                              )}</Form.Item>
                                            </div></td>
                                          </tr>
                                          <tr>
                                            <td style={titleStyle1}><div className={`${inlineTrCls}`}>地址（英文）</div></td>
                                            <td><div className={`${inlineTrCls}`}>
                                              <Form.Item>
                                              {getFieldDecorator('otherEnglishAddress', {
                                                initialValue: data.otherEnglishAddress,
                                                rules:[
                                                  { required: true, message:'请填写英文地址' },
                                                ]
                                              })(
                                                <Input// style={{ width: '65%', marginRight: '3%' }}
                                                />
                                              )}</Form.Item>
                                            </div></td>
                                          </tr>
                                          <tr>
                                            <td style={titleStyle1}><div className={`${inlineTrCls}`}>负责人姓名  </div></td>
                                            <td>
                                              <table className={inlineTableCls}>
                                                <tr>
                                                  <td><div className={`${inlineTrCls}`}>
                                                    <Form.Item>
                                                    {getFieldDecorator('otherPic', {
                                                      initialValue: data.otherPic,
                                                      rules: [
                                                        {required:true, message:'请填写负责人姓名' },
                                                        {validator: this.disabledNameLength2 }
                                                      ]
                                                    })(
                                                      <Input// style={{ width: '65%', marginRight: '3%' }}
                                                      />
                                                    )}</Form.Item>
                                                  </div></td>
                                                  <td style={titleStyle1}><div className={`${inlineTrCls}`}>电话</div></td>
                                                  <td><div className={`${inlineTrCls}`}>
                                                    <Form.Item>
                                                    {getFieldDecorator('otherTel', {
                                                      initialValue: data.otherTel,
                                                      rules: [
                                                        { required:true, message:'请填写电话' },
                                                      ]
                                                    })(
                                                      <Input// style={{ width: '65%', marginRight: '3%' }}
                                                      />
                                                    )}</Form.Item>
                                                  </div></td>
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                        </table>
                                        </td>
                                      </tr>
                                  </table></td>
                          </tr>
                          <tr>
                              <td style={titleStyle1}>提交材料 <br/>(只支持PDF、JPG格式的文件)</td>
                              <td colSpan={6}>
                                  <table className={inlineTableCls}>
                                      <tr>
                                          <td style={titleStyle3}>
                                              <div className={`${inlineTrCls}`}>（一）医用特殊物品出入境风险评估申请表</div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  <Form.Item>
                                                  {getFieldDecorator('item1',{
                                                      initialValue: 1,
                                                      rules: false
                                                  })(
                                                      <Radio.Group>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2} disabled="true">无</Radio>
                                                      </Radio.Group>
                                                  )}
                                                  </Form.Item>
                                              </div>
                                          </td>
                                      </tr>

                                      <tr>
                                          <td style={titleStyle3}>
                                              <div style={{float:"left",}}>（二）出入境特殊物品信息表
                                                <a href="http://ciq.yizhijie.com/fileDownload/2.doc">（样表下载）</a>
                                              </div>
                                              <div style={{float:"left",}}>
                                                  <Form.Item>
                                                 { getFieldDecorator('path2', {
                                                    initialValue: data.path2,
                                                    rules: [
                                                         {required:true, message:'请上传文件'},
                                                    ]
                                                  })(
                                                    <InputUpload ><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                  )}
                                                </Form.Item>
                                              </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                {getFieldDecorator('item2', {
                                                  initialValue: item2,
                                                  rules: false
                                                })(
                                                  <Radio.Group>
                                                    <Radio value={1}>有</Radio>
                                                    <Radio value={2} disabled="true">无</Radio>
                                                  </Radio.Group>
                                                )}
                                              </div>
                                        </td>
                                      </tr>

                                      <tr>
                                          <td style={titleStyle3}>
                                              <div style={{float:"left",}}>（三）《承诺书》
                                                  <a href="http://ciq.yizhijie.com/fileDownload/3.doc">（样表下载）</a>
                                              </div>
                                              <div style={{float:"left",}}>
                                                 <Form.Item>
                                                 {getFieldDecorator('path3', {
                                                    initialValue: data.path3,
                                                    rules: [
                                                      {required:true, message:'请上传文件'},
                                                    ]
                                                  })(
                                                    <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                  )}
                                                 </Form.Item>
                                              </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                {getFieldDecorator('item3', {
                                                  initialValue: item3,
                                                  rules: false
                                                })(
                                                  <Radio.Group>
                                                    <Radio value={1}>有</Radio>
                                                    <Radio value={2} disabled="true">无</Radio>
                                                  </Radio.Group>
                                                )}
                                              </div>
                                          </td>
                                      </tr>

                                      <tr>
                                          <td style={titleStyle3}>
                                              <div style={{float:"left",}}>（四）项目批准文件复印件
                                              </div>
                                              <div style={{float:"left",}}>
                                                {item4 ===1 ?
                                                    <Form.Item>
                                                      {getFieldDecorator('path4', {
                                                      initialValue: data.path4,
                                                      rules: [ {required:true, message:'请上传文件'},]
                                                    })(
                                                      <InputUpload ><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                      )}
                                                    </Form.Item> : null }
                                              </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  {getFieldDecorator('item4', {
                                                      initialValue: item4,
                                                      rules: false
                                                  })(
                                                      <Radio.Group  onChange={this.onChange4}>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2}>无</Radio>
                                                      </Radio.Group>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>

                                      <tr>
                                          <td style={titleStyle3}>
                                            <div style={{float:"left",}}>（五）项目申请人与国外合作机构或国外中心实验室协议复印件(中、英文对照)
                                            </div>
                                            <div style={{float:"left",}}>
                                              { item5===1 ?
                                                <Form.Item>
                                                  {getFieldDecorator('path5', {
                                                    initialValue: data.path5,
                                                    rules: [ {required:true, message:'请上传文件'},]
                                                })(
                                                  <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                )}
                                                </Form.Item> : null }
                                            </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  {getFieldDecorator('item5', {
                                                      initialValue: item5,
                                                      rules: false
                                                  })(
                                                      <Radio.Group onChange={this.onChange5}>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2}>无</Radio>
                                                      </Radio.Group>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle3}>
                                            <div style={{float:"left",}}>（六）项目申请人与国内各研究机构协议复印件
                                            </div>
                                            <div style={{float:"left",}}>
                                              {item6===1 ?
                                                  <Form.Item>
                                                    { getFieldDecorator('path6', {
                                                      initialValue: data.path6,
                                                      rules: [ {required:true, message:'请上传文件'},]
                                                  })(
                                                    <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                  )}</Form.Item>
                                                  : null }
                                            </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  {getFieldDecorator('item6', {
                                                      initialValue: this.state.item6,
                                                      rules: false
                                                  })(
                                                      <Radio.Group onChange={this.onChange6}>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2}>无</Radio>
                                                      </Radio.Group>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle3}>
                                            <div style={{float:"left",}}>（七）参与研究的国内各研究机构伦理委员会批件复印件
                                            </div>
                                            <div style={{float:"left",}}>
                                              {item7===1 ?
                                                <Form.Item>
                                                  {getFieldDecorator('path7', {
                                                    initialValue: data.path7,
                                                    rules: [ {required:true, message:'请上传文件'},]
                                                  })(
                                                    <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                  )}</Form.Item>
                                                  : null }
                                            </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  {getFieldDecorator('item7', {
                                                      initialValue: this.state.item7,
                                                      rules: false
                                                  })(
                                                      <Radio.Group onChange={this.onChange7}>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2}>无</Radio>
                                                      </Radio.Group>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle3}>
                                            <div style={{float:"left",}}>（八）正式研究方案
                                              </div>
                                              <div style={{float:"left",}}>
                                                {item8===1 ?
                                                <Form.Item>
                                                  {getFieldDecorator('path8', {
                                                    initialValue: data.path8,
                                                     rules: [ {required:true, message:'请上传文件'},]
                                                  })(
                                                    <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                  )}</Form.Item>
                                                  : null }
                                              </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  {getFieldDecorator('item8', {
                                                      initialValue: this.state.item8,
                                                      rules: false
                                                  })(
                                                      <Radio.Group onChange={this.onChange8}>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2}>无</Radio>
                                                      </Radio.Group>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle3}>
                                            <div style={{float:"left",}}>（九）知情同意书及受试者签名件复印件
                                            </div>
                                            <div style={{float:"left",}}>
                                              {item9===1 ?
                                                <Form.Item>
                                                  {getFieldDecorator('path9', {
                                                    initialValue: data.path9,
                                                    rules: [ {required:true, message:'请上传文件'},]
                                                  })(
                                                    <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                  )}</Form.Item>
                                              : null }
                                            </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  {getFieldDecorator('item9', {
                                                      initialValue: this.state.item9,
                                                      rules: false
                                                  })(
                                                      <Radio.Group onChange={this.onChange9}>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2}>无</Radio>
                                                      </Radio.Group>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle3}>
                                            <div style={{float:"left",}}>（十）实验室安全等级证明
                                            </div>
                                            <div style={{float:"left",}}>
                                              { item10 ===1 ?
                                                <Form.Item>
                                                  {getFieldDecorator('path10', {
                                                    initialValue: data.path10,
                                                    rules: [ {required:true, message:'请上传文件'},]
                                                  })(
                                                    <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                  )}</Form.Item>
                                              : null }
                                            </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  {getFieldDecorator('item10', {
                                                      initialValue: this.state.item10,
                                                      rules: false
                                                  })(
                                                      <Radio.Group onChange={this.onChange10}>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2}>无</Radio>
                                                      </Radio.Group>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle3}>
                                            <div style={{float:"left",}}>（十一）国家食品药品监督管理局相关批件，如：精麻类药物进口准许证，新药临床实验批件(涉及新药临床研究是提供)等

                                            </div>
                                            <div style={{float:"left",}}>
                                              { item11===1 ?
                                                <Form.Item>
                                                  {getFieldDecorator('path11', {
                                                    initialValue: data.path11,
                                                    rules: [ {required:true, message:'请上传文件'},]
                                                  })(
                                                    <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                  )}</Form.Item>
                                                : null }
                                            </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  {getFieldDecorator('item11', {
                                                      initialValue: this.state.item11,
                                                      rules:false
                                                  })(
                                                      <Radio.Group onChange={this.onChange11}>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2}>无</Radio>
                                                      </Radio.Group>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle3}>
                                             <div style={{float:"left",}}>（十二）审批机关要求的其他文件
                                             </div>
                                             <div style={{float:"left",}}>
                                               { item12===1 ?
                                                 <Form.Item>
                                                   {getFieldDecorator('path12', {
                                                    initialValue: data.path12,
                                                     rules: [ {required:true, message:'请上传文件'},]
                                                  })(
                                                    <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                  )}</Form.Item>
                                                 : null }
                                             </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  {getFieldDecorator('item12', {
                                                      initialValue: this.state.item12,
                                                      rules: false
                                                  })(
                                                      <Radio.Group onChange={this.onChange12}>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2}>无</Radio>
                                                      </Radio.Group>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle3}>
                                            <div style={{float:"left",}}>（十三）运输计划
                                            </div>
                                            <div style={{float:"left",}}>
                                             { item13===1 ?
                                                <Form.Item>
                                                  {getFieldDecorator('path13', {
                                                    initialValue: data.path13,
                                                    rules: [ {required:true, message:'请上传文件'},]
                                                  })(
                                                    <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                  )}</Form.Item>
                                               : null }
                                            </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  {getFieldDecorator('item13', {
                                                      initialValue: this.state.item13,
                                                      rules: false
                                                  })(
                                                      <Radio.Group onChange={this.onChange13}>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2}>无</Radio>
                                                      </Radio.Group>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle3}>
                                            <div style={{float:"left",}}>（十四）样品主要操作流程
                                            </div>
                                            <div style={{float:"left",}}>
                                              { item14===1 ?
                                                <Form.Item>
                                                  { getFieldDecorator('path14',{
                                                    initialValue: data.path14,
                                                    rules: [ {required:true, message:'请上传文件'},]
                                                  })(
                                                    <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                                  )}</Form.Item>
                                                : null }
                                            </div>
                                          </td>
                                          <td style={titleStyle2}>
                                              <div className={`${inlineTrCls}`}>
                                                  {getFieldDecorator('item14', {
                                                      initialValue:this.state.item14,
                                                      rules: false
                                                  })(
                                                      <Radio.Group onChange={this.onChange14}>
                                                          <Radio value={1}>有</Radio>
                                                          <Radio value={2}>无</Radio>
                                                      </Radio.Group>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style={titleStyle3}>
                                              <div className={`${inlineTrCls}`}> 备注说明：
                                                <Form.Item>
                                                {getFieldDecorator('commentes', {
                                                  initialValue: data.commentes,
                                                  rules:[
                                                    {required: true,  message:'请填写备注说明'},
                                                    {validator:this.disabledLength }
                                                  ]
                                                })(
                                                  <Input
                                                    type="textarea"
                                                    autosize={{ minRows: 2, maxRows: 6 }}
                                                  />
                                                )}</Form.Item>
                                              </div>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                            <td style={titleStyle1}>
                                <div className={`${inlineTrCls}`}>
                                  <Form.Item>
                                    {getFieldDecorator('item15', {
                                      initialValue: item15,
                                      rules:[
                                        { required: false },
                                      ]
                                    })(
                                      <CheckboxGroup options={["加急"]}  onChange={this.onChange15} />
                                    )}</Form.Item>
                                </div>
                            </td>
                            <td colSpan={6} style={titleStyle2}>
                                <div style={{float:"left",}}>
                                     <a href="http://ciq.yizhijie.com/fileDownload/rgentDocument.doc">（情况说明表下载）</a>
                                </div>
                                <div style={{float:"left",}}>
                                  { item15.length >0 ?
                                    <Form.Item>
                                      {getFieldDecorator('urgent', {
                                        initialValue: data.urgent,
                                        rules: [ {required:true, message:'请上传文件'},]
                                      })(
                                        <InputUpload><a style={{border:"1px solid #B8CCE2",padding:2,}}>上传</a></InputUpload>
                                      )}</Form.Item>
                                    : null }
                                </div>
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
                {...props}
                >
                <h2 style={{textAlign: 'center'}}>医用特殊物品出入境申请表</h2>

                <Form  layout="inline" >
                    <Form.Item
                        {...formItemLayout}
                        style={{display: 'none'}}
                        >
                        {getFieldDecorator('category', {  //申请类别(1,2,3)
                            initialValue: 3,
                            rules: false
                        })(
                            <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Form.Item>
                    {/*<BodyGridTable rows={_rows}/>*/}
                    <Form.Item
                        {...formItemLayout}
                        style={{display: 'none'}}
                        >
                        {getFieldDecorator('id', {  //申请类别(1,2,3)
                          initialValue: data.id,
                          rules: false
                        })(
                          <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                          />
                        )}
                    </Form.Item>
                </Form>
                {_table}
            </ModalA>
        )
    }
}

AddPreApprovalT3Modal.propTypes = {
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

AddPreApprovalT3Modal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

AddPreApprovalT3Modal = Form.create()(AddPreApprovalT3Modal);

export default AddPreApprovalT3Modal;
