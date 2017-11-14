import React, { PropTypes } from 'react';
import { Router, Route, IndexRoute } from 'react-router';

/*-----------General 通用开始---------*/
import {
    RL,                                                                     // 左右布局组件
} from '../components/'

import {
    MainLayout,                                                             // 页面主要布局
    WrapTopFrame,                                                           // 顶层处理的拦截器
    MenuSlider,                                                             // 具有权限的menu
    PageTabs,                                                               // 右侧tabs
} from '../channel/components/'

import {NoteModel,} from '../channel/components/layouts'          // 右侧tabs



/*-----------General 通用结束---------*/

/*----------- User 用户开始 ------------*/

import {
    Login2 as Login,                                                         // 登入页面
    Register,
    PhoneVerifycode,
    ResetPassword,
} from '../channel/platform/'

/*----------- User 用户结束 ------------*/

/*----------- 医智捷运营func 开始 ------------*/

/*----------- 医智捷运营func 结束 ------------*/

/*----------- eciq运营func 开始 -------------*/


/*----------- eciq运营func 结束 -------------*/

/*----------- 企业用户func 开始 ------------*/


/*----------- 企业用户func 结束 ------------*/

/*----------- Test 测试开始 ------------*/

import {AddAssOrg, BodyGridTable} from '../test/'
import {AssOrg, Org, Product, ApprovalCertificate, VerificationCert,
    FillVerificationCertPage,
    RemainedSubmitApproval, RemainedAuditApproval, CompletedApproval,
    SiteUnAssessC, SiteInAssessC, SiteCompletedAssessC,
    ReportQuery,
    Audit, Management,
    Order,
    TMSOrder,
    CheckNotification, CheckTask, CheckResult,
    ProcessedCheckTask,
    ReceiptAndSend, Send,
    Use, FollowUpSupervisionList} from '../channel/components/'
import {CiqCodeModal, ProductDetailModal,ProductSelectPage,
    SetProductAccountModal} from '../channel/components/product/modules/'
import {AddProductModal} from '../channel/components/product-2/modules/'
import {OrgDetailModal, EditOrgInfoPage, OrgBasicInfoForm} from '../channel/components/org/modules/'
import {AddApprovalCertModal, UploadCertificateModal, ApprovalProductSelectModal,
    AddVerificationCertModal} from '../channel/components/approve/modules/'
import {AddPreApprovalT3Modal, ViewPreApprovalT3Modal, DispatchPreApprovalModal} from '../channel/components/preApproval/modules/'
import {AddCheckOrderModal, AddOrderCargoModal, DisplayOrderStatusModal,
    ViewCheckOrderModal, ViewCheckOrderModalForY} from '../channel/components/order/modules/'
import {AddTMSOrderModal, ViewTMSOrderModal, AddTMSOrderProductModal,
    TMSOrderDetailModal, DispatchTMSOrderModal, SelectOrderModal} from '../channel/components/tms/moduels/'
import {AddReceiptAndSendModal, AddSendModal} from '../channel/components/receiptAndSend/modules/'
import {AddCheckTaskModal, AddCheckPersonModal, AddCheckTaskCargoModal,
    AddCheckNotificationModal, AddCheckNotificationCargoModal, ViewCheckNotification,
    ViewCheckTask, ViewCheckTaskForECIQModal, WriteCheckResultModal,
    WriteCheckResultNotPassModal, ViewCheckResultModal, ViewCheckResultForECIQModal,
    DispatchCheckTaskModal} from '../channel/components/inspection/modules/'

import {Order as YZJOrder, TMSOrder as YZJTMSOrder, CheckNotification as YZJCheckNotification,
    CheckTask as YZJCheckTask} from '../channel/yizhijie/'

import {Order as COrder, TMSOrder as CTMSOrder, CheckNotification as CCheckNotification,
    CheckResult as CCheckResult} from '../channel/customer/'

import {CheckNotification as ECheckNotification, CheckTask as ECheckTask} from '../channel/eciq/'

import {UnConfirmedCheckTask as ECVUnConfirmedCheckTask, ConfirmedCheckTask as ECVConfirmedCheckTask} from '../channel/eciq-checkViewer/'

/*----------- Test 测t试结束 ------------*/


/*----------- func调试开始 ------------*/

import Home from '../channel/home/index.jsx'                                // func调试页面

/*----------- func调试结束 ------------*/

//console.log()
export default function({ history }) {
  return (
    <Router history={history} createElement={createElement}>
        <Route path="/" component={WrapTopFrame}>
            <IndexRoute component={Login} />
            <Route path="register" component={Register} />
            <Route component={MainLayout.CompositeFrame}>
                <Route path="home" component={RL}>
                </Route>
                <Route path="note" component={NoteModel} />
            </Route>
            <Route path="home2"   component={PhoneVerifycode} />
            <Route path="user/reset"  component={ResetPassword} />
        </Route>


        <Route path="/" component={WrapTopFrame}>
            <Route path="index" component={Home} />
            <Route path="test">
                <Route path="Org" component={Org} />
                <Route path="AddApprovalCertModal" component={AddApprovalCertModal} />
                <Route path="AssOrg" component={AssOrg} />
                <Route path="AddAssOrg" component={AddAssOrg} />
                <Route path="OrgDetailModal" component={OrgDetailModal} />
                <Route path="EditOrgInfoPage" component={EditOrgInfoPage} />
                <Route path="OrgBasicInfoForm" component={OrgBasicInfoForm} />
                <Route path="CiqCodeModal" component={CiqCodeModal} />

                <Route path="Product" component={Product} />
                <Route path="AddProductModal" component={AddProductModal} />
                <Route path="ProductDetailModal" component={ProductDetailModal} />
                <Route path="ProductSelectPage" component={ProductSelectPage} />
                <Route path="SetProductAccountModal" component={SetProductAccountModal} />

                <Route path="ApprovalCertificate" component={ApprovalCertificate} />
                <Route path="AddApprovalCertModal" component={AddApprovalCertModal} />
                <Route path="ApprovalProductSelectModal" component={ApprovalProductSelectModal} />
                <Route path="UploadCertificateModal" component={UploadCertificateModal} />
                <Route path="VerificationCert" component={VerificationCert} />
                <Route path="FillVerificationCertPage" component={FillVerificationCertPage} />
                <Route path="AddVerificationCertModal" component={AddVerificationCertModal} />

                <Route path="RemainedSubmitApproval" component={RemainedSubmitApproval} />
                <Route path="AddPreApprovalT3Modal" component={AddPreApprovalT3Modal} />
                <Route path="ViewPreApprovalT3Modal" component={ViewPreApprovalT3Modal} />
                <Route path="DispatchPreApprovalModal" component={DispatchPreApprovalModal} />

                <Route path="ReportQuery" component={ReportQuery} />

                <Route path="RemainedAuditApproval" component={RemainedAuditApproval} />

                <Route path="CompletedApproval" component={CompletedApproval} />

                <Route path="SiteUnAssessC" component={SiteUnAssessC} />

                <Route path="SiteInAssessC" component={SiteInAssessC} />

                <Route path="SiteCompletedAssessC" component={SiteCompletedAssessC} />

                <Route path="Order" component={Order} />
                <Route path="AddCheckOrderModal" component={AddCheckOrderModal} />
                <Route path="AddOrderCargoModal" component={AddOrderCargoModal} />
                <Route path="DisplayOrderStatusModal" component={DisplayOrderStatusModal} />
                <Route path="ViewCheckOrderModal" component={ViewCheckOrderModal} />
                <Route path="ViewCheckOrderModalForY" component={ViewCheckOrderModalForY} />

                <Route path="TMSOrder" component={TMSOrder} />
                <Route path="AddTMSOrderModal" component={AddTMSOrderModal} />
                <Route path="ViewTMSOrderModal" component={ViewTMSOrderModal} />
                <Route path="AddTMSOrderProductModal" component={AddTMSOrderProductModal} />
                <Route path="TMSOrderDetailModal" component={TMSOrderDetailModal} />
                <Route path="DispatchTMSOrderModal" component={DispatchTMSOrderModal} />
                <Route path="SelectOrderModal" component={SelectOrderModal} />

                <Route path="ReceiptAndSend" component={ReceiptAndSend} />
                <Route path="AddReceiptAndSendModal" component={AddReceiptAndSendModal} />

                <Route path="Send" component={Send} />
                <Route path="AddSendModal" component={AddSendModal} />

                <Route path="CheckNotification" component={CheckNotification} />
                <Route path="AddCheckNotificationModal" component={AddCheckNotificationModal} />
                <Route path="AddCheckNotificationCargoModal" component={AddCheckNotificationCargoModal} />
                <Route path="ViewCheckNotification" component={ViewCheckNotification} />
                <Route path="AddCheckTaskModal" component={AddCheckTaskModal} />
                <Route path="AddCheckPersonModal" component={AddCheckPersonModal} />
                <Route path="DispatchCheckTaskModal" component={DispatchCheckTaskModal} />

                <Route path="CheckTask" component={CheckTask} />
                <Route path="ViewCheckTask" component={ViewCheckTask} />
                <Route path="ViewCheckTaskForECIQModal" component={ViewCheckTaskForECIQModal} />
                <Route path="WriteCheckResultModal" component={WriteCheckResultModal} />
                <Route path="WriteCheckResultNotPassModal" component={WriteCheckResultNotPassModal} />
                <Route path="AddCheckTaskCargoModal" component={AddCheckTaskCargoModal} />

                <Route path="CheckResult" component={CheckResult} />
                <Route path="ViewCheckResultModal" component={ViewCheckResultModal} />
                <Route path="ViewCheckResultForECIQModal" component={ViewCheckResultForECIQModal} />

                <Route path="ProcessedCheckTask" component={ProcessedCheckTask} />

                <Route path="YZJOrder" component={YZJOrder} />
                <Route path="YZJTMSOrder" component={YZJTMSOrder} />
                <Route path="YZJCheckNotification" component={YZJCheckNotification} />
                <Route path="YZJCheckTask" component={YZJCheckTask} />

                <Route path="COrder" component={COrder} />
                <Route path="CTMSOrder" component={CTMSOrder} />
                <Route path="CCheckResult" component={CCheckResult} />

                <Route path="ECheckNotification" component={ECheckNotification} />
                <Route path="ECheckTask" component={ECheckTask} />

                <Route path="Use" component={Use} />
                <Route path="FollowUpSupervisionList" component={FollowUpSupervisionList} />

               /* <Route path="ECVUnConfirmedCheckTask" component={ECVUnConfirmedCheckTask} />
                <Route path="ECVConfirmedCheckTask" component={ECVConfirmedCheckTask} />*/

                <Route path="Audit" component={Audit} />
                <Route path="Management" component={Management} />

                <Route path="Register" component={Register} />

                <Route path="BodyGridTable" component={BodyGridTable} />
            </Route>
        </Route>
    </Router>
  );

};

function getName(func){
    return func.name || func.toString().match(/function\s*([^(]*)\(/)[1]
}

function createElement(Component, props) {
    let _props;
    // console.log(componentName, props)
    if(props.route.path === 'home'){
        _props = Object.assign({}, {
            leftContent: <MenuSlider {...props} />,
            rightContent: <PageTabs {...props} />
        });
    }
    return <Component {...props} {..._props}/>
}
