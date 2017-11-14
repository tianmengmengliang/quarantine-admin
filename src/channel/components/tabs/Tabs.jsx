import React, { Component, PropTypes } from 'react';
import { connect } from 'dva'
import { Tabs, message, Icon } from 'antd'
import getCurrentTabsEvent from './tabsEvents.js'
/*----------- Authority ----------*/

// import Organization from '../Organization.js'
import {getSpecificActionIds} from '../menuSlider/'
import {fetch, CONFIG} from '../../../services/'
import {Org, AssOrg, EditOrgInfo} from '../org/'
import {Product} from '../product/'
import {ApprovalCertificate, VerificationCert, FillVerificationCertPage} from '../approve/'
import {Js3000DllFileUpdate,} from '../dllFileUpdate/'
import {TMSOrder} from '../tms/'
import {Order} from '../order/'
import {UsersManaging, RoleManaging, ParameterManaging } from '../manager/'
import {RemainedSubmitApproval, RemainedAuditApproval, CompletedApproval,
    RemainedAuditApprovalC,ExpertsGroup, SiteUnAssessC, SiteInAssessC,
    SiteCompletedAssessC, ReportQuery, CountApproval, } from '../preApproval/'
import  Experts  from '../preApproval/Experts/Experts.jsx'

import {Use,UseOrder, FollowUpSupervisionList} from '../supervision/'
import {CheckNotification, CheckTask, CheckResult, CheckResultCount,} from '../inspection/'
import {Audit} from '../user/'
import {Order as YZJOrder, TMSOrder as YZJTMSOrder, CheckNotification as YZJCheckNotification,
    CheckTask as YZJCheckTask, ReceiptAndSend as YZJReceiptAndSend, Send as YZJSend} from '../../yizhijie/'
import {Order as COrder, TMSOrder as CTMSOrder} from '../../customer/'
import {TMSOrder as ETMSOrder, CheckNotification as ECheckNotification, CheckTask as ECheckTask,
    //CheckResult
} from '../../eciq/'
import {UnConfirmedCheckTask as ECVUnConfirmedCheckTask, ConfirmedCheckTask as ECVConfirmedCheckTask} from '../../eciq-checkViewer/'
import {ViewNoteModel} from  './../layouts/'
/*----------- Authority ----------*/

/*----------- ECIQ ------------*/


/*----------- ECIQ ------------*/

/*----------- YZJ -----------*/


/*----------- YZJ -----------*/

/*----------- Customer ----------*/


/*----------- Customer ----------*/

let paneKey = 0;
function _generatorPaneKey(){
    return `paneKey${paneKey++}`
}
class EditableTabs extends Component{
    constructor(props){
        super(props);
        [
            'onChange',
            'add',
            'onEdit',
            'remove'
        ].map((method)=>{
            this[method]=this[method].bind(this)
        });
        this.state={
            existPanes:[],
            activeKey: undefined
        }
    }

    /*
     * @interface 获取用户角色身份信息
     * @param {object} _props 参数对象
     * @param {func} callback 回调函数
     * */
    getUserRoles = (data, callback)=>{
        fetch('platform.user.roles', {
            data: {...data},
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

    componentDidMount(){
        // step1. 获取用户身份信息
        this.getUserRoles({}, (err, res)=>{
            if(err){
                return;
            }

            // step2. 添加第一个tabs
            try{
                const {responseObject} = res;
                const _firstAction = getSpecificActionIds(responseObject[0]['nameEn'])[0];
                const {iconType, title} = _firstAction;
                console.log({
                    ..._firstAction,
                    cName: <span><Icon type={iconType}/>{title}</span>
                })
                this.appendTabPane({
                    ..._firstAction,
                    cName: <span><Icon type={iconType}/>{title}</span>
                })
            }catch(e){
                 message.error(e.message)
            }
        })
    }

    /*
    * @interface 添加tabPane
    * @param {string} id 动作唯一标识符
    * */
    appendTabPane = (nav = {})=>{
        const ids = {
            "customer-unit/msg-manger": Org,
            "yzj-unit/msg-manger": Org,
            "eciq-unit/unitMsg": Org,

            'yzj-unit/change-manger': EditOrgInfo,

            "customer-unit/associated-unit-manger": AssOrg,
            "yzj-unit/associated-unit-manger": AssOrg,
            "eciq-unit/assUnit": AssOrg,

            "customer-product/msg-manger": Product,
            "yzj-product/msg-manger": Product,
            "eciq-product/msg": Product,

            "customer-particular/approval": ApprovalCertificate,
            "yzj-particular/approval": ApprovalCertificate,
            "eciq-particular/approval-manger": ApprovalCertificate,

            "customer-particular/verification": VerificationCert,
            "yzj-particular/verification": VerificationCert,
            "eciq-particular/verification-manger": VerificationCert,
            'Org/viewOrgInfo': EditOrgInfo,

//-------------------------------------------------- 风评-------------------------------------------------------------
            'yzj-submit/submit': RemainedSubmitApproval,       //未提交申请单
            'yzj-submit/audit' : RemainedAuditApproval,        //审核中的申请单。
            'yzj-submit/complete': CompletedApproval,          //已完成的申请单。

            'customer-submit/submit': RemainedSubmitApproval,   // 风评申请单。
            'customer-submit/audit':  RemainedAuditApproval,    // 审核中的申请单。
            'customer-submit/complete': CompletedApproval,      // 已完成的申请单。

            'chushenyuan-fengping/audit2': RemainedAuditApprovalC, //待审核的申请单
            'chushenyuan-fengping/complete2':CompletedApproval,   //已完成的申请单
            'chushenyuan-fengping/count2': CountApproval,         //统计
            'chushenyuan-submit/experts': Experts,                //专家库,
            'chushenyuan-fengping/expertgroup': ExpertsGroup,    //分派专家组
             //-----------------------------------------------------------------------------
            'eciqManager-fengping/count2': CountApproval,         //统计
            'eciqManager-submit/experts': Experts,                //专家库,
            'eciqManager-fengping/expertgroup': ExpertsGroup,    //分派专家组
            //-------------------------------------------------------------------------------

            'zhuanjia-fengping/audit2':  RemainedAuditApprovalC,  //待处理的申请单
            'zhuanjia-fengping/complete2':CompletedApproval,     //已完成的申请单

            'zhuren-submit/audit4':RemainedAuditApprovalC,      //待处理的申请单
            'zhuren-submit/complete4':CompletedApproval,       //已完成的申请单

            'fushenyuan-fengping/audit2': RemainedAuditApprovalC,
            'fushenyuan-fengping/complete2':CompletedApproval,
//------------------------------------------------------------------------------------------------------------------
            'preA-preApproval&c/submit': RemainedSubmitApproval,
            'preA-preApproval&c/audit':  RemainedAuditApprovalC,
            'preA-preApproval&c2/audit2': RemainedAuditApproval,
            'preA-preApproval&c3/audit3': RemainedAuditApprovalC,
            'preA-preApproval&c4/audit4': RemainedAuditApprovalC,

            'preA-preApproval&c2/assess1': SiteUnAssessC,
            'preA-preApproval&c2/assess2': SiteInAssessC,
            'preA-preApproval&c2/assess3': SiteCompletedAssessC,

            'preA-preApproval&c/complete':  CompletedApproval,
            'preA-preApproval&c2/complete2': CompletedApproval,
            'preA-preApproval&c3/complete3': CompletedApproval,
            'preA-preApproval&c4/complete4': CompletedApproval,

            'preA-preApproval&c/reportQuery&c': ReportQuery,
            'preA-preApproval&c2/reportQuery&c2': ReportQuery,
            'preA-preApproval&c3/reportQuery&c3': ReportQuery,
            'preA-preApproval&c4/reportQuery&c4': ReportQuery,

            'customer-order/list': COrder,
            'yzj-order/query': YZJOrder,

            'customer-transport/task': CTMSOrder,
            'yzj-transport/transport-task': YZJTMSOrder,
            'eciq-trace/transport-trace': ETMSOrder,
            'eciqManager-trace/transport-trace': ETMSOrder,

            'yzj-receiptAndSend/receipt': YZJReceiptAndSend,
            'yzj-receiptAndSend/send': YZJSend,

            'yzj-check/notification': CheckNotification,
            'eciq-check/distribute': ECheckNotification,
            'eciqManager-check/distribute': ECheckNotification,
          /*  'eciq-check/undistributedTask': ECheckNotification,
            'eciq-check/unconfirmedTask': ECVUnConfirmedCheckTask,*/


            'yzj-check/task': CheckTask,
            'eciq-check/resolve': CheckTask,
            'eciqManager-check/resolve': CheckTask,
            /*'eciq-check/distributedTask': ECheckTask,
            'eciq-check/confirmedTask': ECVConfirmedCheckTask,*/

            'customer-check/result': CheckResult,
            'yzj-check/result': CheckResult,
            'eciq-check/result': CheckResult,
            'eciqManager-check/result': CheckResult,
            'eciq-check/count': CheckResultCount,
            'eciqManager-check/count': CheckResultCount,

            'customer-hxjg/hxjgList': FollowUpSupervisionList,
            'yzj-hxjg/hxjgList': FollowUpSupervisionList,
            'eciq-hxjg/hxjgList': FollowUpSupervisionList,
            'eciqManager-hxjg/hxjgList': FollowUpSupervisionList,

            /*'customer-hxjg/useLog': Use,*/
            'customer-hxjg/useLog2': UseOrder,
            'yzj-hxjg/useLog': Use,
            'eciq-hxjg/useLog': UseOrder,
            'eciqManager-hxjg/useLog': UseOrder,
            'yzj-user/audit': Audit,
            'eciqManager-user/audit': Audit,
            'eciq-fxpg/count2': CountApproval,
            'eciqManager-fxpg/count2': CountApproval,

            'yzj-note/list': ViewNoteModel,
            'eciq-note/list': ViewNoteModel,
            'eciqManager-note/list': ViewNoteModel,
            'chushenyuan-note/list': ViewNoteModel,
            'zhuren-note/list': ViewNoteModel,

            'eciq-SM/managerUser': UsersManaging,
            'eciqManager-SM/managerUser': UsersManaging,
            'eciq-SM/managerRole': RoleManaging,
            'eciq-SM/managerParmar': ParameterManaging,
            'eciqManager-SM/managerParmar': ParameterManaging,

            'js3000-check/distribute': Js3000DllFileUpdate,

        };

        let Component = undefined, comElement;
        Component = ids[nav.id];

        // console.log(Component);

        comElement = Component ? <Component /> : <div>{nav.cName}</div>

        let c = React.cloneElement(comElement, {nav});

        // step1. 创建TabPane和相应的组件
        this.add({
            nav: nav,
            component: c
        })
    };

    componentWillReceiveProps(nextProps){

        // console.log( this.props.children );
        const { nav:nextNav }=nextProps;
        const { nav:currentNav }=this.props;
        const { existPanes }=this.state;
        const isExisted=existPanes.some((pane)=>{
           return nextNav.id === pane.key
        });

        // console.log(nextNav, isExisted);

        if( isExisted ){
            // console.log('nextNav', nextNav, nextNav.id);
            this.onChange(nextNav.id)
        }else if( !nextNav.id ){

        }else if( nextNav.id ){
            console.log('nextNav', nextNav, nextNav.id);
            this.appendTabPane(nextNav)
        }
    }
/*    componentWillReceiveProps(nextProps) {
        const {nav: action, route} = nextProps;

        const tabEvent = getCurrentTabsEvent({action, route});
        switch(tabEvent.eventType){
            case 'actionEvent': this,renderTabPanes(tabEvent);break;
            case 'routeEvent': this,renderTabPanes(tabEvent);break;
            case 'invalidEvent': ;
            default: ;
        }
    }

    _getTabEventKey = ({eventType, eventOrigin})=>{
        if(eventType === 'actionEvent'){
            return eventOrigin.id
        }else{
            return eventOrigin.location.pathname
        }
    };

    renderTabPanes = (tabEvent)=>{
        const tabEventKey = this._getTabEventKey(tabEvent);
        const { existPanes }=this.state;
        const isExisted=existPanes.some((pane)=>{
            return tabEventKey === pane.key
        });

        console.log(tabEvent, isExisted);

        if( isExisted ){
            this.onChange(tabEventKey)
        }else if( !tabEventKey ){

        }else if( tabEventKey ){
            const ids = [
                {
                    "yzj-unit/input": Org,
                    // 1: "yzj-unit/change",
                    "yzj-unit/associated-unit": AssOrg,
                    3: "yzj-product/input",
                    4: "yzj-product/liscense",
                    5: "yzj-particular/approval",
                    6: "yzj-particular/verification",
                    7: "yzj-order/list",
                    8: "yzj-regulation/usage",
                },
                {
                    0: "customer-unit/msg-manger",
                    1: "customer-unit/change-manger",
                    2: "customer-unit/associated-unit-manger",
                    3: "customer-product/msg-manger",
                    4: "customer-particular/approval",
                    5: "customer-particular/verification",
                    6: "customer-order/query",
                    7: "customer-transport/task"
                },
                {
                    0: "eciq-unit/unitMsg",
                    1: "eciq-unit/change",
                    2: "eciq-unit/assUnit",
                    3: "eciq-product/msg",
                    4: "eciq-particular/approval-manger",
                    5: "eciq-particular/verification-manger",
                    6: "eciq-particular/inspection-manger",
                    7: "eciq-trace/transport-trace",
                    8: "eciq-trace/regular-manger",
                    9: "eciq-regulation/after-regular"
                }
            ];
            const {eventOrigin} = this.props;
            let Component = undefined, comElement;
            ids.some((menuIds)=>{
                Component = menuIds[nextNav.id];
                return !!Component;
            });

            comElement = Component ? <Component /> : <div>{nextNav.cName}</div>

            let c = React.cloneElement(comElement, nextProps);

            // 创建TabPane和相应的组件
            this.add({
                nav:nextNav,
                component:c
            })
        }
    };*/

    onChange(activeKey) {
        const {  existPanes }=this.state;
        const _p = existPanes.filter((pane)=>{
            return pane.key !== activeKey
        });
        this.setState({ activeKey, existPanes: _p }, ()=>{
            this.setState({
                activeKey,
                existPanes
            })
        });
    }

    onEdit(targetKey, action) {
        this[action](targetKey);
    }

    add({ nav,component}) {
        console.log("add")
        const {  existPanes }=this.state;
        const activeKey = `${nav.id}`;
        existPanes.push({ title:nav.cName , content: component , key: activeKey });
        this.setState({
            activeKey,
            existPanes
        })
    }

    remove(targetKey) {
        console.log("del", targetKey);
        const { activeKey, existPanes }=this.state;

        // 判断删除是否是激活的TabPane
        if( activeKey !== targetKey ){
            const panes=existPanes.filter((pane)=>{
                return pane.key !== targetKey
            });

            this.setState({
                existPanes:panes
            })
        }else {

            let lastKey,nextKey, nextActiveKey;
            existPanes.some((pane, i) => {
                if (pane.key === targetKey) {
                    lastKey = existPanes[i-1]? existPanes[i-1].key : undefined;
                    nextKey = existPanes[i+1]? existPanes[i+1].key : undefined;
                    return true;
                }
            });
            const panes = existPanes.filter(pane => pane.key !== targetKey);
            if( lastKey !==undefined ){
                nextActiveKey=lastKey;
            }else if( nextKey !==undefined ){
                nextActiveKey=nextKey
            }
            this.setState({existPanes: panes, activeKey : nextActiveKey});
        }
    }

    render(){
        return (
            <Tabs
                onChange={this.onChange}
                activeKey={this.state.activeKey}
                type="editable-card"
                hideAdd
                onEdit={this.onEdit}
                >
                {this.state.existPanes.map(pane => <Tabs.TabPane tab={pane.title} key={pane.key}>{pane.content}</Tabs.TabPane>)}
            </Tabs>
        )
    }
}


EditableTabs.propTypes = {
    AUTH: PropTypes.any
};

function mapStateToProps({nav},ownProps){
    return {
        nav
    }
}

export default connect(mapStateToProps)(EditableTabs);
