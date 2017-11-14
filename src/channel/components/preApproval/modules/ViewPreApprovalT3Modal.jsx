import React, { Component, PropTypes } from 'react';
import {Form, Select, Upload, Icon, Input, DatePicker,
    Popconfirm, Row, Col, Button, InputNumber, message, Radio, Tabs, Alert, Table} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {remove} from 'antd/../../src/utils/arrayUtils.js'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable, InputUpload} from '../../../../components/'
import {dimsMap} from '../../helpers/'
import './customTable.less'
const {custom: {entryExit}} = dimsMap;

function noop(){}

/**
 *   查看未处理风险评估申请单
 *
 * */
class ViewPreApprovalT3Modal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false,
            activeKey: '1',                       // 激活的tabPane的key，
            radioValue: '',                // 评估结论radio的value
            radiospotCheck: '',           //  评估抽检radio的value
            selectValue: 1,                // 默认选中的专家组id,
          GroupDetail2: [],               // 从下拉框中选择的专家组，的详细
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()

    }

    componentWillReceiveProps(nextProps){
        //console.log("nextProps:",nextProps)
        const {visible} = nextProps;
        const {data: newData} = nextProps;
        const {data: oldData} = this.props;
        if(visible && newData !== oldData) {
        }
    }

    handleRowUpdated = ({ rowIdx, updated })=> {
        // merge updated row with current row and rerender by setting state
        const {listPage} = this.state;
        const {rows} = listPage;
        Object.assign(rows[rowIdx], updated);
        this.setState({
            listPage
        });
    };

//----------------------------------- 提交审核结果 ---------------------------------------
    saveCheckMessage  = ({data}, callback)=>{ //审核结果提交接口
        fetch('ciq.riskasesmtproject.submit33', {
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
                    confirmLoading: true
                })
            },
            complete: (err, data)=>{
                this.setState({
                    confirmLoading: false
                })
            }
        })
    };
    /*
    *  审核结果提交
    * */
    handleSubmit  = (e)=> {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err){
                message.error('请填写审核意见')
                return;
            }else{
                console.log('专家评估决策', values.outcome );
                let outmessage,spotCheck, CheckProgress;
                if( values.outcome=== '通过'){
                      if( values.message0 === undefined ){
                         outmessage= `通过:无`;
                      }else{
                         outmessage= `通过:${values.message0}`;
                      }
                }else if( values.outcome=== '补正材料'){
                    outmessage= `补正材料:${values.message1}`;
                }else if( values.outcome==='驳回'){
                    outmessage= `驳回:${values.message2}` ;
                }
                else if( values.outcome === '驳回:补正材料'){
                  outmessage= `驳回:补正材料:${values.message1}`;
                }else if( values.outcome ==='驳回:不通过'){
                   outmessage= `驳回:不通过:${values.message2}` ;
                }else{
                  outmessage = '';
                }

              const {radiospotCheck} = this.state;
              CheckProgress = values.CheckProgress;
              if(values.spotCheck !== undefined ){
                 if(radiospotCheck === '抽检'){
                   spotCheck = values.spotCheck +':'+ CheckProgress ; //抽检: 抽检项目。
                 }else{
                   spotCheck = values.spotCheck; //否
                 }
              }else{
                 spotCheck = undefined;
              }


                let commient ={
                    id:values.id,
                    taskId: values.taskId,
                    outcome:values.outcome,
                    message: outmessage,
                    groupId: values.groupId,
                    takeMessage: values.takeMessage,
                    spotCheck: spotCheck, //是否抽检
                    CheckProgress: CheckProgress, //抽检项目。
                    evaluate: values.evaluate,  //是否现场评估
                }
                //console.log('审批结果:', commient );
                this.saveCheckMessage({data: commient}, (err, res)=>{
                    // case1. 保存审核结果失败
                    if(err){
                        message.error('保存审核结果失败，请稍后再试');
                        return;
                    }
                    // case2. 保存审核结果成功，刷新一次列表。
                    this.props.callback && this.props.callback({
                        click: 'ok',
                        data: null
                    });
                    this.setState(this._retInitialState());
                    this.props.form.resetFields()
                });
            }
        });
    };

    onOk = ()=> {};
    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        });
        this.setState(this._retInitialState());
        this.props.form.resetFields()
    };
    /*
     * @interface 显示添加货物对话框
     * */
    add = ({type, rowIdx, data})=>{
        if(type === 'add') {
            this.setState(({addCheckNotificationCargoModal})=> {
                return {
                    addCheckNotificationCargoModal: {
                        ...addCheckNotificationCargoModal,
                        visible: true,
                        data: {}
                    }
                }
            });
        }
        if(type === 'edit') {
            this.setState(({addCheckNotificationCargoModal})=> {
                return {
                    addCheckNotificationCargoModal: {
                        ...addCheckNotificationCargoModal,
                        visible: true,
                        data: {
                            ...data,
                            _rowIdx: rowIdx,
                        }
                    }
                }
            });
        }
    };
    /*
     * @interface 隐藏添加货物对话框
     * */
    hiddenAdd = ()=>{
        this.setState(({addCheckNotificationCargoModal})=>{
            return {
                addCheckNotificationCargoModal: {
                    ...addCheckNotificationCargoModal,
                    visible: false,
                    data: {}
                }
            }
        })
    };
    /*
     * @interface 添加货物对话框的回调
     * */
    addCallback = (info)=>{
        const {click, data = {}} = info;
        // case1. 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenAdd()
        }
        // case2. 如果点击确定按钮，则刷新货物列表
        if(click === 'ok'){
            const {listPage: {rows}} = this.state;
            const {_rowIdx} = data;
            // case2-case1. 如果是修改操作，修改对应的行数据
            if(_rowIdx !== undefined) {
                const _rs = rows.map((row, i)=>{
                    if(i === _rowIdx){
                        return data;
                    }else{
                        return row;
                    }
                });
                this.setState(({listPage})=> {
                    return {
                        listPage: {
                            ...listPage,
                            rows: _rs
                        }
                    }
                });
            }else {
                rows.push(data);
                console.log(rows);
                this.setState(({listPage})=> {
                    return {
                        listPage: {
                            ...listPage,
                            rows
                        }
                    }
                });
            }
            this.hiddenAdd()
        }
    };



    /*
    * @interface 点击tabPane的回调
    * @param {string} 点击的tabPane 的key属性
    * */
    onTabClick = (tabPaneKey)=>{
        //activeKey的初始值1，
        this.setState({
            activeKey: tabPaneKey
        })
    };

    /** 1.审核动态单选按钮，监听事件。**/
    onRadioChange = (e)=>{
        this.setState({
            radioValue:  e.target.value,
        });
    };
    /** 1.设置下拉列表固定 **/
    getPopup =( triggerNode )=>{
      return  triggerNode
    }
    /** 2.所有专家组下拉框触发 **/
    onSelectChange= (values)=>{
       console.log('values', values);
       this.getExpertsGroupDetails2 ({groupId: values}, (err, res)=> {
          if (err) {
            message.error(`获取专家组失败，请稍后重试`);
            return;
          }
          const {responseObject } = res;
          this.setState({ GroupDetail2: responseObject});
       });
        this.updateExpertsGroupState ({groupId: values}, (err, res)=> {
          if (err) {
            message.error(err.message|| `更改专家组状态失败`);
            return;
          }
        });
    };
    /** 3. 是否抽检 onChange监听函数 **/
    onRadioChangeCheck = (e)=>{
      this.setState({
        radiospotCheck :  e.target.value,
      });
    };

    getExpertsGroupDetails2 = (selectedId = {} , callback)=>{ //1.查询专家组详细
       fetch('ciq.riskasesmtexpertGroup.list', {
        // method: 'post',
        // headers: {},
        data: selectedId,
        success: (res)=>{
          //console.log("----expertGroup.list:----",res);
          callback && callback(null, res)
        },
        error: (err)=>{
          callback && callback(err, null)
        },
        beforeSend: ()=>{
          this.setState({
            spinning: true,
            tip: '获取数据中...'
          })
        },
        complete: (err, data)=>{
          this.setState({
            spinning: false,
            tip: ''
          })
        }
      })
    };
    updateExpertsGroupState = (selectedId = {} , callback)=>{ //1..查询专家组详细
      fetch('ciq.riskasesmtexpertGroup.updatestate', {
        // method: 'post',
        // headers: {},
        data: selectedId,
        success: (res)=>{
          //console.log("----expertGroup.list:----",res);
          callback && callback(null, res)
        },
        error: (err)=>{
          callback && callback(err, null)
        },
        beforeSend: ()=>{
          this.setState({
            spinning: true,
            tip: '获取数据中...'
          })
        },
        complete: (err, data)=>{
          this.setState({
            spinning: false,
            tip: ''
          })
        }
      })
    };



    render(){
        const {prefix, title, visible, data = {}, ...props,} = this.props; //通过属性将--将数据传入。
        const { getFieldDecorator } = this.props.form;
        const {confirmLoading, activeKey, radioValue,radiospotCheck, selectValue, GroupDetail2 } = this.state;

        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20}
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

        const radioProps = {
            disabled: true
        }
     ;

        const nameStyle= {width: 200,background:'#E3F4FF'}
        const titleStyle1 = {width: 100,background:'#E3F4FF'};
        const titleStyle2 = { background:'#E3F4FF'};
        const titleStyle3 = {width: '80%',background:'#E3F4FF'};
        const inlineTrCls = cx({
            [`inline-tr`]: true
        });
        const creatGroup ={ fontSize:14,marginRight:20,}
        const trStyle1 = {width:100,height:30, background:'#E3F4FF', }

        //查看操作：数据的容器。
        const{ samples=[], shippingDateStart,shippingDateEnd, nature, registered,
         checkButton=[], dataSource=[], allExpertsGroup=[], groupId, ExpertsGroupDetails=[], }= data ;
        console.log('data',data);
        console.log('checkButton:', checkButton );
        console.log('ExpertsGroupDetails:', ExpertsGroupDetails ); //默认的专家组。

        var arrsampleName= [];
        for(var i=0; i<samples.length; i++){
          if(samples[i].sampleName!== null ){
              arrsampleName.push(
                <tr>
                  <td><div className={`${inlineTrCls}`} > {samples[i].sampleName } </div></td>
                  <td><div className={`${inlineTrCls}`}> {samples[i].englishName}  </div></td>
                  <td><div className={`${inlineTrCls}`}> {samples[i].sampleQuantity}</div></td>
                  <td><div className={`${inlineTrCls}`}> {samples[i].pack }        </div></td>
                  <td><div className={`${inlineTrCls}`}> {samples[i].capacity }    </div></td>
                </tr>   );
          }
        }
        var DateStart = moment.unix( shippingDateStart/1000).format("YYYY-MM-DD");
        var DateEnd  =  moment.unix( shippingDateEnd/1000).format("YYYY-MM-DD");
        var companyNature, conpanyRegistered;
        if( nature === 1){ companyNature="民营";}else if( nature === 2){ companyNature="国有";}else if( nature === 3){ companyNature="外商独资";}
        else if( nature === 4){ companyNature="中外合资";}else if( nature === 5){ companyNature="其他"; }else{ companyNature="数据库异常"; }
        if(registered ===1){ conpanyRegistered="省内"}else if(registered ===2){ conpanyRegistered="国内"}
        else if(registered ===3){ conpanyRegistered="国外"}else{ conpanyRegistered="数据库异常"; }

        const _table = (
          <div>
            <table className={tableCls}>
              <tBody>
              <tr>
                <td style={titleStyle1}>特殊物品</td>
                <td colSpan={6}>
                  <table  className={inlineTableCls}>
                    <tr>
                      <td style={nameStyle}><div className={`${inlineTrCls}`}>中文名称</div></td>
                      <td style={nameStyle}><div className={`${inlineTrCls}`}>英文名称</div></td>
                      <td style={titleStyle2}><div className={`${inlineTrCls}`}>样品数量</div></td>
                      <td style={titleStyle2}><div className={`${inlineTrCls}`}>包装单位</div></td>
                      <td style={titleStyle2}><div className={`${inlineTrCls}`}>规格    </div></td>
                    </tr>
                    {arrsampleName }
                  </table>
                </td>
              </tr>
              <tr>
                <td style={titleStyle1}>项目名称</td>
                <td colSpan={6}>
                  <div className={`${inlineTrCls}`}>
                    {data.projectName}
                  </div>
                </td>
              </tr>
              <tr>
                <td style={titleStyle1}>首次/延续(批次)</td>
                <td colSpan={6}>
                  <table className={inlineTableCls}>
                    <tr>
                      <td colSpan={2} >
                        <div className={`${inlineTrCls}`}>
                          { data.batch=== 1 ? `首次`: `延续`}
                        </div></td>
                      <td style={titleStyle2}>出入境类型</td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          { data.inOut=== 1 ? `入境`: `出境`}
                        </div>
                      </td>
                      <td style={titleStyle2}>运送日期</td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {DateStart}～ {DateEnd}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style={titleStyle1}>外方接受(输出机构)</td>
                <td colSpan={6}>
                  <table className={inlineTableCls}>
                    <tr>
                      <td style={titleStyle1}><div className={`${inlineTrCls}`}>中文名称  </div></td>
                      <td><div className={`${inlineTrCls}`}>
                        {  data.otherChinaName}
                      </div></td>
                    </tr>
                    <tr>
                      <td style={titleStyle1}><div className={`${inlineTrCls}`}>中文地址 </div></td>
                      <td><div className={`${inlineTrCls}`}>
                        {  data.otherChinaAddress }
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
                        {  data.companyName }
                      </div></td>
                    </tr>
                    <tr>
                      <td style={titleStyle1}><div className={`${inlineTrCls}`}>地址 </div></td>
                      <td><div className={`${inlineTrCls}`}>
                        {  data.companyAddress }
                      </div></td>
                    </tr>
                    <tr>
                      <td style={titleStyle1}>联系人</td>
                      <td><table className={inlineTableCls}>
                        <tr>
                          <td><div className={`${inlineTrCls}`}>
                            {  data.companyPic }
                          </div></td>
                          <td style={titleStyle1}><div className={`${inlineTrCls}`}>电话</div></td>
                          <td><div className={`${inlineTrCls}`}>
                            {  data.companyTel }
                          </div></td>
                          <td style={titleStyle1}><div className={`${inlineTrCls}`}>企业资质</div></td>
                          <td>
                            <div>
                            {getFieldDecorator('qiyezizhi', {
                                initialValue: data.qualification,
                                rules: false
                              })(
                                <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                              )}
                              </div>
                          </td>
                        </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style={titleStyle1}>项目简况</td>
                <td colSpan={6}>
                  <table className={inlineTableCls}>
                    <tr>
                      <td style={titleStyle1}><div className={`${inlineTrCls}`}>特殊物品来源</div></td>
                      <td><div className={`${inlineTrCls}`}>
                        { data.sourceCollection }
                      </div></td>
                    </tr>
                    <tr>
                      <td style={titleStyle1}><div className={`${inlineTrCls}`}>特殊物品用途 </div></td>
                      <td><div className={`${inlineTrCls}`}>
                        {  data.users }
                      </div></td>
                    </tr>
                    <tr>
                      <td style={titleStyle1}><div className={`${inlineTrCls}`}>出入境口岸</div></td>
                      <td><div className={`${inlineTrCls}`}>
                          {  data.port }
                      </div></td>
                    </tr>
                    <tr>
                      <td style={titleStyle1}><div className={`${inlineTrCls}`}>单位性质 </div></td>
                      <td><table className={inlineTableCls}>
                        <tr>
                          <td>
                            <div className={`${inlineTrCls}`} style={{margin:"0 auto",}}>
                              {/*--------------4个单选按钮 ----------------*/}
                              { companyNature}
                            </div>
                          </td>
                          <td style={titleStyle1}>
                            <div className={`${inlineTrCls}`}>注册地</div>
                          </td>
                          <td>
                            <div className={`${inlineTrCls}`} style={{ }}>
                              { conpanyRegistered}
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
                            { data.otherEnglishName }
                          </div></td>
                        </tr>
                        <tr>
                          <td style={titleStyle1}><div className={`${inlineTrCls}`}>地址（英文）</div></td>
                          <td><div className={`${inlineTrCls}`}>
                            { data.otherEnglishAddress}
                          </div></td>
                        </tr>
                        <tr>
                          <td style={titleStyle1}><div className={`${inlineTrCls}`}>负责人姓名  </div></td>
                          <td>
                            <table className={inlineTableCls}>
                              <tr>
                                <td><div className={`${inlineTrCls}`}>
                                  {data.otherPic }
                                </div></td>
                                <td style={titleStyle1}><div className={`${inlineTrCls}`}>电话</div></td>
                                <td><div className={`${inlineTrCls}`}>
                                  { data.otherTel }
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
                <td style={titleStyle1}>提交材料</td>
                <td colSpan={6}>
                  <table className={inlineTableCls}>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（一）医用特殊物品出入境风险评估申请表 </div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                           有
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（二）出入境特殊物品信息表</div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path2 !==null ? `有` : `无`}
                          {data.path2 !==null ?
                            getFieldDecorator('path2', {
                              initialValue: data.path2,
                              rules: false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（三）《承诺书》</div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path3 !==null ? `有` : `无`}
                          {data.path3 !==null ?
                            getFieldDecorator('path3', {
                              initialValue: data.path3 ,
                              rules: false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（四）项目批准文件复印件 </div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path4 !==null ? `有` : `无`}
                          {data.path4 !==null ?
                            getFieldDecorator('path4', {
                              initialValue: data.path4 ,
                              rules: false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（五）项目申请人与国外合作机构或国外中心实验室协议复印件(中、英文对照)</div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path5 !==null ? `有` : `无`}
                          {data.path5 !==null ?
                            getFieldDecorator('path5', {
                              initialValue: data.path5,
                              rules: false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（六）项目申请人与国内各研究机构协议复印件</div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path6 !==null ? `有` : `无`}
                          {data.path6 !==null ?
                            getFieldDecorator('path6', {
                              initialValue: data.path6,
                              rules:  false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（七）参与研究的国内各研究机构伦理委员会批件复印件</div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path7 !==null ? `有` : `无`}
                          {data.path7 !==null ?
                            getFieldDecorator('path7', {
                              initialValue: data.path7,
                              rules: false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（八）正式研究方案</div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path8 !==null ? `有` : `无`}
                          {data.path8 !==null ?
                            getFieldDecorator('path8', {
                              initialValue: data.path8,
                              rules: false
                            })(
                              <InputUpload style={{border:"2px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（九）知情同意书及受试者签名件复印件</div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path9 !==null ? `有` : `无`}
                          {data.path9 !==null ?
                            getFieldDecorator('path9', {
                              initialValue: data.path9,
                              rules: false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（十）实验室安全等级证明</div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path10 !==null ? `有` : `无`}
                          {data.path10 !==null ?
                            getFieldDecorator('path10', {
                              initialValue: data.path10,
                              rules: false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（十一）国家食品药品监督管理局相关批件，如：精麻类药物进口准许证，新药临床实验批件(涉及新药临床研究是提供)等
                        </div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path11 !==null ? `有` : `无`}
                          {data.path11 !==null ?
                            getFieldDecorator('path11', {
                              initialValue: data.path11,
                              rules: false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（十二）审批机关要求的其他文件</div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path12 !==null ? `有` : `无`}
                          {data.path12 !==null ?
                            getFieldDecorator('path12', {
                              initialValue: data.path12,
                              rules: false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（十三）运输计划</div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path13 !==null ? `有` : `无`}
                          { data.path13 !==null ?
                            getFieldDecorator('path13', {
                              initialValue: data.path13,
                              rules: false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={titleStyle3}>
                        <div className={`${inlineTrCls}`}>（十四）样品主要操作流程</div>
                      </td>
                      <td>
                        <div className={`${inlineTrCls}`}>
                          {data.path14 !==null ? `有` : `无`}
                          {data.path14 !==null ?
                            getFieldDecorator('path14', {
                              initialValue: data.path14,
                              rules: false
                            })(
                              <InputUpload style={{border:"1px solid #B8CCE2"}}></InputUpload>
                            ): null }
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className={`${inlineTrCls}`}> 备注说明：
                          &nbsp;{ data.commentes}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              </tBody>
            </table>
          </div>
         );

        /*------- 审核结果--------*/
        /** 企业查看**/
        const _columns1 = [
          {
            title: '序号',
            width: 50,
            locked: true,
            render: (text, record, index)=>{
              return (
                <span>{index+1}</span>
              )
            }
          },
          {
            title: '审批角色',
            dataIndex: 'roleName',
            width: 100,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '审批决策',
            dataIndex: 'state',
            width: 100,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '审批意见',
            dataIndex: 'fullMessage',
            width: 500,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '是否抽检',
            dataIndex: 'spotCheck',
            width: 100,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '是否现场评估',
            dataIndex: 'evaluate',
            width: 100,
            render: (text, record, index)=>{
              if(text === 0){
                return (
                  <span>否</span>
                )
              }
              else if (text === 1){
                return (
                  <span>现场评估</span>
                )
              }else{
                return (
                  <span>{text}</span>
                )
              }
            }
          },
          {
            title: '审批时间',
            dataIndex: 'time',
            width: 150,
            sorter: (a, b) => a.time - b.time,
            render: (text, record, index)=>{
              return (
                <span>{text ? moment(text).format('YYYY-MM-DD HH:mm:SS') : undefined }</span>
              )
            }
          }
        ];
        /** 初审员查看**/
        const _columns2 = [
          {
            title: '序号',
            width: 50,
            locked: true,
            render: (text, record, index)=>{
              return (
                <span>{ index+1 }</span>
              )
            }
          },
          {
            title: '审批角色',
            dataIndex: 'roleName',
            width: 120,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '审批人',
            dataIndex: 'realName',
            width: 80,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '审批决策',
            dataIndex: 'state',
            width:100,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '审批意见',
            dataIndex: 'fullMessage',
            width:400,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '是否抽检',
            dataIndex: 'spotCheck',
            width: 200,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '是否现场评估',
            dataIndex: 'evaluate',
            width: 100,
            render: (text, record, index)=>{
              if(text === 0){
                return (
                  <span>否</span>
                )
              }
              else if (text === 1){
                return (
                  <span>现场评估</span>
                )
              }else{
                return (
                  <span>{text}</span>
                )
              }
            }
          },
          {
            title: '审批时间',
            dataIndex: 'time',
            width:140,
            sorter: (a, b) => a.time - b.time,
            render: (text, record, index)=>{
              return (
                <span>{text ? moment(text).format('YYYY-MM-DD HH:mm:SS') : undefined }</span>
              )
            }
          }
        ];
        /** 专家查看**/
        const _columns3 = [
          {
            title: '序号',
            width: 50,
            locked: true,
            render: (text, record, index)=>{
              return (
                <span>{ index +1 }</span>
              )
            }
          },
          {
            title: '审批角色',
            dataIndex: 'roleName',
            width:120,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '审批人',
            dataIndex: 'realName',
            width:80,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '审批决策',
            dataIndex: 'state',
            width:100,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '审批意见',
            dataIndex: 'fullMessage',
            width:400,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '是否抽检',
            dataIndex: 'spotCheck',
            width: 200,
            render: (text, record, index)=>{
              return (
                <span>{text}</span>
              )
            }
          },
          {
            title: '是否现场评估',
            dataIndex: 'evaluate',
            width: 100,
            render: (text, record, index)=>{
              if(text === 0){
                return (
                  <span>否</span>
                )
              }
              else if (text === 1){
                return (
                  <span>现场评估</span>
                )
              }else{
                return (
                  <span>{text}</span>
                )
              }
            }
          },
          {
            title: '审批时间',
            dataIndex: 'time',
            width:140,
            sorter: (a, b) => a.time - b.time,
            render: (text, record, index)=>{
              return (
                <span>{text ? moment(text).format('YYYY-MM-DD HH:mm:SS') : undefined }</span>
              )
            }
          }
        ];

        /*--------- 遍历审核按钮 ---------*/
        const _radio = checkButton.map( (k)=>{
          return ( <Radio value={`${k}`}>{k}</Radio> )
        });
        /*--------- 遍历所有专家组 ---------*/
        const _Select = allExpertsGroup.map( (k)=>{
          return ( <Select.Option value={k.id}>{k.groupName }</Select.Option>  );
        });

        //角色
        const Roles1 = localStorage.getItem("_YZH_QUARANTINE_User_Roles");
        const Roles2 = JSON.parse( Roles1); //转json
        const userType =  Roles2[0].nameEn; //角色
        //真实审批人
        const realName1 = localStorage.getItem("_YZH_QUARANTINE_User");
        const realName2 = JSON.parse( realName1); //转json
        const realName =  realName2.realName; //真实专家姓名


        let dataSource1 = dataSource.sort( function(a,b){ return  a.time -b.time; }); //排序
        //console.log('排序dataSource1:', dataSource1);
        let dataSource2=[], dataSource3=[];
        if(dataSource.length > 0){
            //1.先保存自己记录。
            dataSource2 = dataSource.filter((_row,i )=>{return  dataSource[i].realName === realName });
            //2.删除所有专家记录。
            dataSource3 = dataSource.filter((_row,i )=>{return  dataSource[i].roleName !== '风险评估专家' });
            //3.合并。
            dataSource2 = dataSource2.concat( dataSource3  );
            //4.排序。（从小到大。返回一个负值）
            dataSource2 = dataSource2.sort( function(a,b){ return  a.time -b.time; });
        }

        /**-------- 专家组详细 table -----------**/
        //console.log('专家组信息:', ExpertsGroupDetails );
        let _tr=[], _tr2={};
        const number1 = ExpertsGroupDetails.length; //首次获取默认的专家组详细
        const number2 = GroupDetail2.length;        //选择后查出专家组详细

        if(number2 >1 ){ //选择的专家组。
              let j= number2 -1;
              for(let i=0; i<j; i++){
                _tr.push( <tr>
                  <td>专家{i+1}</td>
                  <td>{GroupDetail2[i]["expertsName"]}</td>
                  <td>{GroupDetail2[i]["gender"]     }</td>
                  <td>{GroupDetail2[i]["tel"]        }</td>
                  <td>{GroupDetail2[i]["specialty"] }</td>
                  <td>{GroupDetail2[i]["position"]  }</td>
                </tr> );
              }
              ["date","userName","groupLeader"].map((key)=>{
                _tr2[`${key}`] = GroupDetail2[j][`${key}`] ;
              });
        }else {  //默认的专家组。
            if(number1 >1 ) {
              let j = number1 - 1;
              for (let i =0; i< j; i++){
                _tr.push(<tr>
                  <td>专家{i + 1}</td>
                  <td>{ExpertsGroupDetails[i]["expertsName"] }</td>
                  <td>{ExpertsGroupDetails[i]["gender"]     }</td>
                  <td>{ExpertsGroupDetails[i]["tel"]        }</td>
                  <td>{ExpertsGroupDetails[i]["specialty"] }</td>
                  <td>{ExpertsGroupDetails[i]["position"]  }</td>
                </tr>);
              }
              ["date", "userName", "groupLeader"].map((key)=> {
                _tr2[`${key}`] = ExpertsGroupDetails[j][`${key}`];
              });
            }else{
               _tr.push(<tr>没有选专家组 </tr> );
            }
        }

        const  _ExpertsGroupTable = (
          <div>
            <div>
              <font style={creatGroup}>创建日期:{ _tr2 !== null ? moment.unix( _tr2.date/1000 ).format("YYYY/MM/DD") : null}</font>
              <font style={creatGroup}>创建人:  { _tr2.userName}</font>
              <font style={creatGroup}>专家组组长:{ _tr2.groupLeader}</font>
            </div>
            <table className={tableCls}>
              <tBody style={creatGroup}>
              <tr>
                <td style={trStyle1}>序号</td>
                <td style={trStyle1}>专家姓名</td>
                <td style={trStyle1}>性别</td>
                <td style={trStyle1}>联系电话</td>
                <td style={trStyle1}>擅长领域</td>
                <td style={trStyle1}>职称</td>
              </tr>
              { _tr }
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
                onOk={this.onOk}
                onCancel={this.onCancel}
                footer={null}
                // bodyHeight={500}
                width={1100}
                {...props}
                >
                <Tabs
                    activeKey={activeKey}
                    onTabClick={this.onTabClick}>
                    <Tabs.TabPane tab={<span><Icon type="apple"/>出入境证明</span>}  key="1">
                        <h2 style={{textAlign: 'center'}}>医用特殊物品出入境申请表</h2>
                        <h3 style={{textAlign: 'right'}}>（浙）检卫特评 第【{data.serialNumber}】号</h3>
                        <Form>
                          {_table}
                        </Form>
                        <br/>

                        <Alert message="已评估意见列表" type="info" />
                        { (userType ==='ciq_kehu'|| userType ==='ciq_yunying')?
                           <Table
                             rowKey={record => record.id }
                             columns={_columns1}
                          dataSource={dataSource1}
                          bordered
                        /> :  ''}

                      {userType ==='ciq_chushenyuan'|| userType ==='ciq_fushenyuan'|| userType ==='ciq_zhuren'?
                        <Table
                          rowKey={record => record.id }
                          columns={_columns2}
                          dataSource={dataSource1}
                          bordered
                        /> :  ''}

                      { userType ==='ciq_zhuanjia' || userType ==='ciq_manager' ?
                        <Table
                          rowKey={record => record.id }
                          columns={_columns3 }
                          dataSource={dataSource2}
                          bordered
                        /> :  ''}


                        { userType ==='ciq_chushenyuan'?  //根据角色，显示审核按钮。
                          <div>
                                  <Form layout="horizontal" >
                                      <Form.Item
                                          {...formItemLayout}
                                          style={{display: 'none'}}
                                          >
                                          {getFieldDecorator('id', { //表单id
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
                                          {getFieldDecorator('taskId', { //任务id
                                            initialValue: data.taskId,
                                            rules: false
                                          })(
                                            <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                            />
                                          )}
                                      </Form.Item>

                                      <Form.Item  //显示审核按钮控件。
                                          {...formItemLayout}
                                          label={'评估结论'}
                                          >
                                          {getFieldDecorator('outcome', {
                                              initialValue: data.outcome,
                                              rules: [
                                                { required:true, message:'请选择按钮',},
                                              ]
                                          })(
                                              <Radio.Group  onChange={this.onRadioChange}>
                                                { _radio}
                                              </Radio.Group>
                                          )}
                                      </Form.Item>

                                      <Form.Item  //显示所有专家组下拉列表。
                                        {...formItemLayout}
                                        label={'指定评审组'}
                                      >
                                        {getFieldDecorator('groupId', {
                                          initialValue: data.groupId,
                                          rules: [{required:false },]
                                        })(
                                          <Select
                                            style={{width: 150}}
                                            placeholder="请选择组"
                                            //allowClear={true}
                                            multiple={false}
                                            combobox={false}
                                            tags={false}
                                            showSearch={false}
                                            filterOption={false}
                                            optionFilterProp={`children`}
                                            labelInValue={false}
                                            tokenSeparators={null}
                                            getPopupContainer={this.getPopup} //菜单定位问题
                                            onChange={this.onSelectChange}
                                          >
                                            {_Select }
                                          </Select>
                                        )}
                                      </Form.Item>

                                      { radioValue === '通过' ?   //根据审核按钮，显示填写意见控件
                                          <Form.Item
                                          {...formItemLayout}
                                          label={'评估意见'}
                                        >
                                          {getFieldDecorator('message0', {
                                            //initialValue: data.message0,
                                          })(
                                            <Input  />
                                          )}
                                        </Form.Item> :  null
                                      }
                                      { radioValue === '补正材料' ? //根据审核按钮，显示填写意见控件
                                          <Form.Item
                                              {...formItemLayout}
                                              label={'评估意见'}
                                              >
                                              {getFieldDecorator('message1', {
                                                  initialValue: data.message1,
                                                  rules: [
                                                    { required:true, message:'请填写需要补正的材料项',},
                                                  ]
                                              })(
                                                  <Input  />
                                              )}
                                          </Form.Item> :  null
                                      }
                                      { ( radioValue === '驳回') ?
                                          <Form.Item
                                                {...formItemLayout}
                                                label={'评估意见'}
                                                >
                                                {getFieldDecorator('message2', {
                                                  initialValue: data.message2,
                                                  rules: [
                                                    { required:true, message:'请填写驳回原因'},
                                                  ]
                                                })(
                                                  <Input  />
                                                )}
                                          </Form.Item> :  null
                                      }
                                  </Form>


                                  {groupId !== null ?  //默认的专家组
                                        <div> {/*------------- 有-------------------------------*/}
                                          <h3>专家组</h3>
                                          { _ExpertsGroupTable}
                                          <ButtonContainer style={{textAlign: 'center'}}>
                                             <Button type="primary" icon="check-circle-o" onClick={this.handleSubmit } >确认</Button>
                                            <Button icon="check-circle-o">重置表单</Button>
                                          </ButtonContainer>
                                        </div>
                                        :
                                        <div>  {/*------------- 无 -------------------------------*/}
                                        {radioValue === '补正材料' || radioValue === '驳回' ?
                                            <ButtonContainer style={{textAlign: 'center'}}>
                                                <Button type="primary" icon="check-circle-o" onClick={this.handleSubmit } >确认</Button>
                                                <Button icon="check-circle-o">重置表单</Button>
                                            </ButtonContainer>
                                            :
                                            <div style={{textAlign:'center',}}>
                                              <span style={{ color:'#f00',}}> 请先创建专家组</span>
                                              <ButtonContainer style={{textAlign: 'center'}}>
                                                <Button type="dashed" icon="check-circle-o">确认</Button>
                                              </ButtonContainer>
                                            </div>
                                        }
                                        </div>
                                  }
                           </div>
                          :  '' }

                        { userType ==='ciq_zhuanjia' ?  //根据专家角色，显示审核按钮。
                          <div>
                            <Form layout="horizontal" >
                              <Form.Item
                                {...formItemLayout}
                                style={{display: 'none'}}
                              >
                                {getFieldDecorator('id', { //表单id
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
                                {getFieldDecorator('taskId', { //任务id
                                  initialValue: data.taskId,
                                  rules: false
                                })(
                                  <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                  />
                                )}
                              </Form.Item>

                              <Form.Item  //显示专家审核的三个单选按钮。
                                {...formItemLayout}
                                label={'评估结论'}
                              >
                                {getFieldDecorator('outcome', {
                                  initialValue: data.outcome,
                                  rules: [
                                    { required:true, message:'请选择按钮',},
                                  ]
                                })(
                                  <Radio.Group onChange={this.onRadioChange}>
                                    { _radio}
                                  </Radio.Group>
                                )}
                              </Form.Item>
                              {radioValue === '通过' ?   //根据审核按钮，显示填写意见控件
                                      <Form.Item
                                        {...formItemLayout}
                                        label={'通过意见'}
                                      >
                                        {getFieldDecorator('message0', {
                                          //initialValue: data.message0,
                                        })(
                                          <Input  />
                                        )}
                                      </Form.Item> :  null
                              }
                              {radioValue === '驳回:补正材料' ? //根据审核按钮，显示填写意见控件
                                      <Form.Item
                                        {...formItemLayout}
                                        label={'驳回意见'}
                                      >
                                        {getFieldDecorator('message1', {
                                          initialValue: data.message1,
                                          rules: [
                                            { required:true, message:'请填写需要补正的材料项',},
                                          ]
                                        })(
                                          <Input  />
                                        )}
                                      </Form.Item> :  null
                              }
                              {radioValue === '驳回:不通过' ?
                                      <Form.Item
                                        {...formItemLayout}
                                        label={'驳回意见'}
                                      >
                                        {getFieldDecorator('message2', {
                                          initialValue: data.message2,
                                          rules: [
                                            { required:true, message:'请填写驳回原因'},
                                          ]
                                        })(
                                          <Input  />
                                        )}
                                      </Form.Item> :  null
                              }
                             <Form.Item  //抽检按钮
                               {...formItemLayout}
                              label={'（ 是否抽检'}
                              >
                                {getFieldDecorator('spotCheck',{
                                  initialValue: '否',
                                  rules: [
                                    {required:false, message:'请选择抽检按钮',},
                                  ]
                                })(
                                  <Radio.Group  onChange={this.onRadioChangeCheck}>
                                     <Radio value={`否`}>否</Radio>
                                     <Radio value={`抽检`}>抽检</Radio>
                                  </Radio.Group>
                                )}）
                             </Form.Item>
                             { radiospotCheck === '抽检' ?
                                        <Form.Item
                                          {...formItemLayout}
                                          label={'抽检项目'}
                                        >
                                          {getFieldDecorator('CheckProgress', {
                                            rules: [
                                              { required:true, message:'请填写抽检项目'},
                                            ]
                                          })(
                                            <Input  />
                                          )}
                                        </Form.Item> :  null
                             }
                              <Form.Item  //抽检按钮
                                {...formItemLayout}
                                label={'（ 是否现场评估'}
                              >
                                {getFieldDecorator('evaluate',{
                                  initialValue: 0,
                                  rules: [
                                    {required:false, message:'请选择抽检按钮',},
                                  ]
                                })(
                                  <Radio.Group>
                                    <Radio value={0}>否</Radio>
                                    <Radio value={1}>是</Radio>
                                  </Radio.Group>
                                )}）
                              </Form.Item>
                            </Form>
                            <ButtonContainer style={{textAlign: 'center'}}>
                              <Button type="primary" icon="check-circle-o" onClick={this.handleSubmit} >确认</Button>
                              <Button icon="check-circle-o">重置表单</Button>
                            </ButtonContainer>
                          </div>
                          :  '' }

                        {userType ==='ciq_fushenyuan' ?  //根据复审员角色，显示审核按钮。
                          <div>
                            <Form layout="horizontal" >
                              <Form.Item
                                {...formItemLayout}
                                style={{display: 'none'}}
                              >
                                {getFieldDecorator('id', { //表单id
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
                                {getFieldDecorator('taskId', { //任务id
                                  initialValue: data.taskId,
                                  rules: false
                                })(
                                  <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                  />
                                )}
                              </Form.Item>
                              <Form.Item  //显示审核按钮控件。
                                {...formItemLayout}
                                label={'评估结论'}
                              >
                                {getFieldDecorator('outcome', {
                                  initialValue: data.outcome,
                                  rules: [
                                    { required:true, message:'请选择按钮',},
                                  ]
                                })(
                                  <Radio.Group onChange={this.onRadioChange}>
                                    { _radio}
                                  </Radio.Group>
                                )}
                              </Form.Item>
                              { radioValue === '通过' ?   //根据审核按钮，显示填写意见控件
                                        <Form.Item
                                          {...formItemLayout}
                                          label={'评估意见'}
                                        >
                                          {getFieldDecorator('message0', {
                                            //initialValue: data.message0,
                                          })(
                                            <Input  />
                                          )}
                                        </Form.Item> :  null
                              }
                              {radioValue === '补正材料' ? //根据审核按钮，显示填写意见控件
                                        <Form.Item
                                          {...formItemLayout}
                                          label={'补正材料意见'}
                                        >
                                          {getFieldDecorator('message1', {
                                            initialValue: data.message1,
                                            rules: [
                                              { required:true, message:'请填写需要补正的材料项',},
                                            ]
                                          })(
                                            <Input  />
                                          )}
                                        </Form.Item> :  null
                              }
                              {radioValue === '驳回' ?
                                        <Form.Item
                                          {...formItemLayout}
                                          label={'评估意见'}
                                        >
                                          {getFieldDecorator('message2', {
                                            initialValue: data.message2,
                                            rules: [
                                              { required:true, message:'请填写驳回原因'},
                                            ]
                                          })(
                                            <Input  />
                                          )}
                                        </Form.Item> :  null
                              }
                              <Form.Item
                                {...formItemLayout}
                                label={'对监管部门意见'}
                              >
                                {getFieldDecorator('takeMessage', {
                                 initialValue: data.takeMessage,
                                  rules: [
                                    { required:false },
                                  ]
                                })(
                                  <Input  />
                                )}
                              </Form.Item>
                            </Form>
                            <ButtonContainer style={{textAlign: 'center'}}>
                              <Button type="primary" icon="check-circle-o" onClick={this.handleSubmit} >确认</Button>
                              <Button icon="check-circle-o">重置表单</Button>
                            </ButtonContainer>
                          </div>
                          :  '' }

                        {userType ==='ciq_zhuren'  ?  //根据主任角色，显示审核按钮。
                          <div>
                            <Form layout="horizontal" >
                              <Form.Item
                                {...formItemLayout}
                                style={{display: 'none'}}
                              >
                                {getFieldDecorator('id', { //表单id
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
                                {getFieldDecorator('taskId', { //任务id
                                  initialValue: data.taskId,
                                  rules: false
                                })(
                                  <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                  />
                                )}
                              </Form.Item>

                              <Form.Item  //显示审核按钮控件。
                                {...formItemLayout}
                                label={'评估结论'}
                              >
                                {getFieldDecorator('outcome', {
                                  initialValue: data.outcome,
                                  rules: [
                                    { required:true, message:'请选择按钮',},
                                  ]
                                })(
                                  <Radio.Group onChange={this.onRadioChange}>
                                    { _radio}
                                  </Radio.Group>
                                )}

                              </Form.Item>
                              {radioValue === '通过' ?   //根据审核按钮，显示填写意见控件
                                      <Form.Item
                                        {...formItemLayout}
                                        label={'评估意见'}
                                      >
                                        {getFieldDecorator('message0', {
                                          //initialValue: data.message0,
                                        })(
                                          <Input  />
                                        )}
                                      </Form.Item> :  null
                              }
                              {radioValue === '补正材料' ? //根据审核按钮，显示填写意见控件
                                      <Form.Item
                                        {...formItemLayout}
                                        label={'评估意见'}
                                      >
                                        {getFieldDecorator('message1', {
                                          initialValue: data.message1,
                                          rules: [
                                            { required:true, message:'请填写需要补正的材料项',},
                                          ]
                                        })(
                                          <Input  />
                                        )}
                                      </Form.Item> :  null
                              }
                              { radioValue === '驳回' ?
                                      <Form.Item
                                        {...formItemLayout}
                                        label={'评估意见'}
                                      >
                                        {getFieldDecorator('message2', {
                                          initialValue: data.message2,
                                          rules: [
                                            { required:true, message:'请填写驳回原因'},
                                          ]
                                        })(
                                          <Input  />
                                        )}
                                      </Form.Item> :  null
                              }
                            </Form>
                            <ButtonContainer style={{textAlign: 'center'}}>
                              <Button type="primary" icon="check-circle-o" onClick={this.handleSubmit} >确认</Button>
                              <Button icon="check-circle-o">重置表单</Button>
                            </ButtonContainer>
                          </div>
                          :  '' }
                    </Tabs.TabPane>
                </Tabs>
            </ModalA>
        )
    }
}

ViewPreApprovalT3Modal.propTypes = {
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

ViewPreApprovalT3Modal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

ViewPreApprovalT3Modal = Form.create()(ViewPreApprovalT3Modal);

export default ViewPreApprovalT3Modal;
