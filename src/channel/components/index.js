import CompositeFrame from './frame/'                                       // 复合的框架组件
import WrapTopFrame from './global/'                                        // 顶层处理的拦截器
import helpers from './helpers/'                                            // 帮助工具
import MenuSlider from './menuSlider/'                                      // 左侧menu导航组件
import {SampleMainLayout, MainLayout} from './layouts/'                     // 页面主要布局
import PageTabs from './tabs/'                                              // 页面的tabs

import {Org, AssOrg} from './org/'                                          // 单位组件
import {Product} from './product-2/'                                        // 产品组件
import {ApprovalCertificate, VerificationCert,
    FillVerificationCertPage} from './approve/'                              // 审批单核销单组件
import {Audit, Management} from './user/'                                                // 用户管理
import {RemainedSubmitApproval, RemainedAuditApproval,
    CompletedApproval, SiteUnAssessC, SiteInAssessC,
    SiteCompletedAssessC, ReportQuery} from './preApproval'                                  // 前置审批组件
import {Order} from './order/'                                               // 订单组件
import {TMSOrder} from './tms/'                                              // 运输单组件
import {CheckNotification, CheckTask, CheckResult,
    ProcessedCheckTask} from './inspection/'      // 查验组件
import {ReceiptAndSend, Send} from './receiptAndSend'                        // 收发货组件
import {Use, FollowUpSupervisionList} from './supervision/'                                           // 后续监管组件

export {
    WrapTopFrame,
    helpers,
    MenuSlider,
    MainLayout,
    SampleMainLayout,
    PageTabs,
    Org,
    AssOrg,
    Product,
    ApprovalCertificate,
    VerificationCert,
    FillVerificationCertPage,
    RemainedSubmitApproval,
    RemainedAuditApproval,
    CompletedApproval,
    SiteUnAssessC,
    SiteInAssessC,
    SiteCompletedAssessC,
    ReportQuery,
    Audit,
    Management,
    Order,
    TMSOrder,
    CheckNotification,
    CheckTask,
    CheckResult,
    ProcessedCheckTask,
    ReceiptAndSend,
    Send,
    Use,
    FollowUpSupervisionList
}


