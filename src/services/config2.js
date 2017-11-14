
//const UPLOAD_URL = 'http://ciqtest.yizhijie.com/rest?method=ciq.attfile.upload'; //.144.  文件上传
//const URL = 'http://ciqtest.yizhijie.com/rest';
//const OSS_FILE_URL = 'http://file.yizhijie.com'; //预览的文件。
//const REP_FILE_URL = 'http://riskreport.yizhijie.com'; //预览打印文件。

//const UPLOAD_URL = 'http://test.yizhijie.com/rest?method=ciq.attfile.upload'; //.33
//const URL = 'http://test.yizhijie.com/rest';
//const OSS_FILE_URL = 'http://filetest.yizhijie.com'; //预览的文件。
//const REP_FILE_URL = 'http://riskreporttest.yizhijie.com'; //预览打印文件。


const UPLOAD_URL = 'http://ciq.yizhijie.com/rest?method=ciq.attfile.upload'; //.10 文件上传
const URL = 'http://ciq.yizhijie.com/rest';
const OSS_FILE_URL = 'http://filetest.yizhijie.com';        //预览上传的文件。
const REP_FILE_URL = 'http://riskreporttest.yizhijie.com'; //打印的文件预览。


//const UPLOAD_URL = 'http://ciq.yizhijie.com/rest?method=ciq.attfile.upload'; //1.正式库。
//const URL = 'http://ciq.yizhijie.com/rest';
//const OSS_FILE_URL = 'http://file.yizhijie.com';
//const REP_FILE_URL = 'http://riskreport.yizhijie.com'; //预览打印文件。

//const UPLOAD_URL = 'http://ciqtest.yizhijie.com/rest?method=ciq.attfile.upload'; //2.测式库。
//const URL = 'http://ciqtest.yizhijie.com/rest';
//const OSS_FILE_URL = 'http://filetest.yizhijie.com'; //预览的文件。
//const REP_FILE_URL = 'http://riskreporttest.yizhijie.com'; //预览打印文件。

/** http://localhost:8080 **/
//const UPLOAD_URL = "http://ciq.yizhijie.com/rest?method=ciq.attfile.upload"; //3.本地。     rest?method=ciq.attfile.upload'是后台规定的接收方式文件。
//const URL = 'http://localhost:8080/rest';   //
//const OSS_FILE_URL = 'http://filetest.yizhijie.com'; //预览文件。
//const REP_FILE_URL = 'http://riskreporttest.yizhijie.com'; //预览打印文件。

const CNT_TYPE = {
  1: 'application/json',
  2: 'multipart/form-data',
  3: 'application/x-www-form-urlencoded; charset=UTF-8'
};

const API = {
  /*----------- 平台 --------------*/
  'platform.user.login': {t: true, cntType: CNT_TYPE[2] },                             // 用户登入
  'platform.user.roles': {t: true, cntType: CNT_TYPE[2] },                             // 获取用户角色
  'ciq.riskasesmtproject.selectpthon':{t: true, cntType: CNT_TYPE[2] },              // 登入用户手机号
  'ciq.riskasesmtproject.phoneVerifycode':{t: true, cntType: CNT_TYPE[2] },              // 校验手机号 + 验证码

  'yizhijie.user.checkoutmobile':{t: true, cntType: CNT_TYPE[2] },                    // 修改：校验手机号
  'platform.user.checkverifycode':{t: true, cntType: CNT_TYPE[2] },                   // 修改：校核手机号+ 验证码
  'yizhijie.user.getverifycode':{t: true, cntType: CNT_TYPE[2] },                     //
  'platform.user.sendsmsverifycode':{t: true, cntType: CNT_TYPE[2] },                 // 修改：发送手机验证玛
  'ciq.riskasesmtproject.updatePassworld':{t: true, cntType: CNT_TYPE[2] },          // 修改密码
  'platform.user.listbyrolename': {t: true, cntType: CNT_TYPE[2] },                    // 获取用户司机列表

  /*---------- 注册 ----------------*/
  'platform.user.usernameavailable': {t: false, cntType: CNT_TYPE[2] },                // 用户名是否可用
  'platform.user.sendsmsverifycode': {t: false, cntType: CNT_TYPE[2] },                // 获取验证码
  'platform.user.checkverifycode': {t: false, cntType: CNT_TYPE[2] },                  // 验证码是否正确
  'platform.user.reg': {t: false, cntType: CNT_TYPE[2] },                               // 注册用户信息
  'platform.user.listforregcheck': {t: true, cntType: CNT_TYPE[2] },                  // 获取用户列表
  'platform.user.checkuserinfo': {t: true, cntType: CNT_TYPE[2] },                    // 获取用户列表
  'platform.user.sendsmsverifycodesregister': {t: true, cntType: CNT_TYPE[2] },      // 注册：发送手机验证玛

  /*----------- 产品 --------------*/
  'ciq.product.list': {t: true, cntType: CNT_TYPE[2] },                               // 产品列表
  'ciq.product.save': {t: true,  cntType: CNT_TYPE[1] },                              // 保存产品

  /*----------- 订单 --------------*/
  'ciq.crossorder.list': {t: true, cntType: CNT_TYPE[2] },                             // 订单列表
  'ciq.crossorder.save': {t: true,  cntType: CNT_TYPE[1] },                            // 保存订单
  'ciq.crossorder.remove': {t: true,  cntType: CNT_TYPE[2] },                          // 删除订单
  'ciq.crossorder.detail': {t: true, cntType: CNT_TYPE[2] },                           // 获取订单货物清单
  'ciq.crossorderstep.submit': {t: true,  cntType: CNT_TYPE[2] },                      // 提交订单
  'ciq.crossorderstep.confirm': {t: true,  cntType: CNT_TYPE[2] },                     // 确认订单
  'ciq.crossorderstep.refuse': {t: true,  cntType: CNT_TYPE[2] },                      // 拒绝订单
  'ciq.crossorderstep.completeapply': {t: true,  cntType: CNT_TYPE[2] },               // 完成审批
  'ciq.crossorderstep.completewriteoff': {t: true,  cntType: CNT_TYPE[2] },            // 完成核销
  'ciq.crossorderstep.completeinspectionapply': {t: true,  cntType: CNT_TYPE[2] },     // 完成报检
  'ciq.crossorderstep.completewaybillone': {t: true,  cntType: CNT_TYPE[2] },          // 完成运输
  'ciq.crossorderstep.completeinspectioncheck': {t: true,  cntType: CNT_TYPE[2] },     // 完成报检查验
  'ciq.crossorderstep.list': {t: true,  cntType: CNT_TYPE[2] },                        // 订单步骤列表
  'ciq.crossorder.listcompletecheckapply': {t: true, cntType: CNT_TYPE[2] },           // 完成报检和查验之前的订单列表

  'ciq.company.list': {t: true, cntType: CNT_TYPE[1] },

  /*----------- 运输单 ------------*/
  'tms.waybill.list': {t: true, cntType: CNT_TYPE[2] },                               // 运输单列表
  'tms.waybill.save': {t: true,  cntType: CNT_TYPE[1] },                              // 保存运输单
  'tms.waybill.remove': {t: true,  cntType: CNT_TYPE[2] },                            // 删除运输单
  'tms.waybill.buildcode': {t: true,  cntType: CNT_TYPE[1] },                         // 获取运输单编号
  'tms.waybill.detail': {t: true, cntType: CNT_TYPE[2] },                             // 获取运输单货物清单
  'tms.waybill.dispatch': {t: true, cntType: CNT_TYPE[2] },                           // 派发运输单
  'tms.waybilldevice.list': {t: true, cntType: CNT_TYPE[2] },                         // 获取运输单设备号和时间
  'tms.logisticscompany.list': {t: true, cntType: CNT_TYPE[2] },                      // 获取物流公司列表

  /*------------ 收发货 ------------*/
  'ciq.receiveandsend.list': {t: true, cntType: CNT_TYPE[2] },                        // 收发货列表
  'ciq.receiveandsend.save': {t: true,  cntType: CNT_TYPE[1] },                       // 保存收发货记录
  'ciq.receiveandsend.detail': {t: true, cntType: CNT_TYPE[2] },                      // 获取收发货记录明细
  'ciq.receiveandsend.ready': {t: true, cntType: CNT_TYPE[2] },                       // 根据订单id初始化收发货记录

  /*------------ 查验 --------------*/
  'ciq.checktask.listnotice': {t: true, cntType: CNT_TYPE[2] },                       // ECIQ查验通知列表
  'ciq.checktask.createnotice': {t: true,  cntType: CNT_TYPE[1] },                    // 创建查验通知
  'ciq.checktask.remove': {t: true,  cntType: CNT_TYPE[2] },                          // 删除查验任务/通知
  'ciq.checktask.detail': {t: true, cntType: CNT_TYPE[2] },                           // 获取查验通知明细
  'ciq.checktask.senddeliverednotice': {t: true,  cntType: CNT_TYPE[2] },             // 发送到货查验通知
  'ciq.checktask.dispatchtask': {t: true, cntType: CNT_TYPE[2] },                     // 分派查验任务
  'ciq.checktask.confirmtask': {t: true, cntType: CNT_TYPE[2] },                      // 查验员确认查验任务
  'ciq.checktask.readytask': {t: true, cntType: CNT_TYPE[2] },                        // 完成查验准备
  'ciq.checktask.list': {t: true, cntType: CNT_TYPE[2] },                              // 克根据status获取查验任务列表
  'ciq.checktask.modifyplantime': {t: true, cntType: CNT_TYPE[2] },                   // YZJ修改查验时间
  'ciq.checktask.listtask': {t: true, cntType: CNT_TYPE[2] },                         // ECIQ查验任务列表
  'ciq.checktask.completetask': {t: true, cntType: CNT_TYPE[2] },                     // 完成查验
  'ciq.checktask.closetask': {t: true, cntType: CNT_TYPE[2] },                        // 关闭查验任务
  'ciq.checktask.taskdetail': {t: true, cntType: CNT_TYPE[2] },                       // 获取查验任务明细
  'ciq.checktask.savecheckresult': {t: true, cntType: CNT_TYPE[2] },                  // 保存查验结果
  'ciq.checktask.listtaskresult': {t: true, cntType: CNT_TYPE[2] },                   // 获取查验结果列表
  /**---------- 查验任务管理 ----------*/
  /** 作者:贾鹏涛   2017/9/28 **/
  'ciq.crossorder.crossorderpullout':{t: true, cntType: CNT_TYPE[2] },                   //查验任务管理---- '退回'按钮
  /**---------- 查验任务统计 ----------*/
  /** 作者:贾鹏涛   2017/8/7 **/
  'ciq.checktask.statisticallist':{t: true, cntType: CNT_TYPE[2]},                   //统计列表接口
  'ciq.checktask.createcsv': {t: true, cntType: CNT_TYPE[2]},                         //生成Csv文件  导出excel

  /*---------- 后续监管 -------------*/
  'ciq.entrystore.listdetail': {t: true, cntType: CNT_TYPE[2] },                      // 使用登记列表
  'ciq.houxujianguan.list': {t: true, cntType: CNT_TYPE[2] },                         // 后续监管列表
  'ciq.entrystore.add': {t: true, cntType: CNT_TYPE[1] },                             // 后续监管列表入库登记
  'ciq.uselog.list': {t: true, cntType: CNT_TYPE[2] },                                // 后续监管使用登记列表某一个产品的使用登记情况
  'ciq.uselog.save': {t: true, cntType: CNT_TYPE[1] },                                // 后续监管使用登记列表某一个产品的使用登记情况
  'ciq.uselog.remove': {t: true, cntType: CNT_TYPE[2] },                              // 后续监管使用登记列表某一个产品的使用登记情况
  'ciq.uselog.wastedeal': {t: true, cntType: CNT_TYPE[2] },                           // 后续监管使用登记列表某一个产品的使用登记情况
  'ciq.uselog.submit': {t: true, cntType: CNT_TYPE[2] },                              // 后续监管使用登记列表提交使用记录
  /**---------- 使用登记 ----------*/
  /** 作者:贾鹏涛   2017/8/8 **/
  'ciq.houxujianguan.liststatus': {t: true, cntType: CNT_TYPE[2] },                  // 订单表(主表)
  'ciq.uselog.saveusedate': {t: true, cntType: CNT_TYPE[2] },                         // 传递核销单号


  /*----------- 设备数据 -----------*/
  'tms.devicedata.listvalue': {t: true, cntType: CNT_TYPE[2] },                       // 设备温度数据
  'tms.devicedata.listlocation': {t: true, cntType: CNT_TYPE[2] },                    // 设备地理位置数据

  /*----------- ECIQ数据接口 --------*/

  /*----------- ECIQ核销单接口 ------*/
  'ciq.ciqclient.getorghexiaodan': {t: true, cntType: CNT_TYPE[2] },                  // 获取核销单信息(企业)
  'ciq.ciqclient.gethexiaodanandcorpinfo': {t: true, cntType: CNT_TYPE[2] },          // 核销单和机构信息(运营)


   /**
    * 风险评估模块
    * 作者：贾鹏涛
    * 时间：2017/7/5
    * **/
  'ciq.riskasesmtproject.save':{t: true, cntType: CNT_TYPE[1]},                          // 新建风险评估申请单
  'ciq.riskasesmtproject.pagelist':{t: true, cntType: CNT_TYPE[2]},                      // 风险评估列表
  //'ciq.riskasesmtproject.submit':{t: true, cntType: CNT_TYPE[2]},                            //提交
  'ciq.riskasesmtproject.startsubmit':{t: true, cntType: CNT_TYPE[2]},                  //提交（工作流）
  'ciq.riskasesmtproject.selectproject':{t: true, cntType: CNT_TYPE[2]},                //查看详情
  'ciq.riskasesmtparameter.list': {t: true, cntType: CNT_TYPE[2]},                       //查询风险评估动态参数。
  'ciq.riskasesmtproject.delete':{t: true, cntType: CNT_TYPE[2]},                        //删除
  //'ciq.riskasesmtproject.list':{t: true, cntType: CNT_TYPE[2]},                             //
  'ciq.riskasesmtproject.morepagelist':{t: true, cntType: CNT_TYPE[2]},                 //审核中（条件查询列表）
  'ciq.riskasesmtproject.deletetask': {t: true, cntType: CNT_TYPE[2]},                  //撤回
  'ciq.riskasesmtproject.resultlist': {t: true, cntType: CNT_TYPE[2]},                  // 已完成审核列表（企业）
  'ciq.riskasesmtproject.findcomment':{t: true, cntType: CNT_TYPE[2]},                  // 已完成审核（企业）查看详细。

  'ciq.riskasesmtproject.listtask2':{t: true, cntType: CNT_TYPE[2]},                      //初审员 申请单列表（（工作流））
  'ciq.riskasesmtproject.findtaskid':{t: true, cntType: CNT_TYPE[2]},                    //查任务id（工作流）
  'ciq.riskasesmtproject.submitted':{ t: true, cntType: CNT_TYPE[2]},                    //查详情（工作流）
  'ciq.riskasesmtproject.outomelist':{ t: true, cntType: CNT_TYPE[2]},                   //获取审核按钮（工作流）
  'ciq.riskasesmtexpertGroup.listexperts':{ t: true, cntType: CNT_TYPE[2]},             // 查询所有可选的专家组。
  //'ciq.riskasesmtexpertGroup.effectivedate':{t:true, cntType: CNT_TYPE[2]},                  //判断  专家组 是否有默认组。
  'ciq.riskasesmtexpertGroup.findState':{t:true, cntType: CNT_TYPE[2]},                  //判断  专家组 是否有默认组。
  'ciq.riskasesmtexpertGroup.updatestate':{t:true, cntType: CNT_TYPE[2]},                //改变  专家组 状态。
  'ciq.riskasesmtproject.submit33':{t:true, cntType: CNT_TYPE[1]},                       //审核意见提交（工作流）
  'ciq.riskasesmtproject.listtasked':{t:true, cntType: CNT_TYPE[2]},                    // 已完成审核(初审员、专家)


  //'ciq.riskasesmtexperts.list':{t: true, cntType: CNT_TYPE[2]},
  'ciq.riskasesmtexperts.pagelist':{t: true, cntType: CNT_TYPE[2]},                    //专家库列表
  'ciq.riskasesmtexperts.save':{t: true, cntType: CNT_TYPE[1]},                        //新增专家
  'ciq.riskasesmtexperts.list':{t: true, cntType: CNT_TYPE[2]},                        //查看                                                                    //查看
  'ciq.riskasesmtexperts.delete':{t: true, cntType: CNT_TYPE[2]},                      //删除
  'ciq.riskasesmtexpertGroup.save':{t: true, cntType: CNT_TYPE[1]},                    //新增专家组
  'ciq.riskasesmtexpertGroup.pagelist':{t: true, cntType: CNT_TYPE[2]},               //专家组列表
  'ciq.riskasesmtexpertGroup.list': {t: true, cntType: CNT_TYPE[2]},                  //查看
  'ciq.riskasesmtexpertGroup.delete':{t: true, cntType: CNT_TYPE[2]},                 //删除

  'ciq.riskasesmtproject.exportreport': {t: true, cntType: CNT_TYPE[2]},              // 打印。
  'ciq.riskasesmtproject.selectproject': {t: true, cntType: CNT_TYPE[2]},             //统计栏查看详细。
  'ciq.riskasesmtproject.findauditresult':{t: true, cntType: CNT_TYPE[2]},            //统计栏申请单列表
  'ciq.riskasesmtproject.createcsv':{t: true, cntType: CNT_TYPE[2]},                 //生成Csv文件  导出excel
  'ciq.riskasesmtproject.updateauditresult':{t: true, cntType: CNT_TYPE[2]},        //获取最新数据。
  'ciq.riskAsesmtMessage.save': {t: true, cntType: CNT_TYPE[1]},                      //保存留言。
  'ciq.riskAsesmtMessage.list': {t: true, cntType: CNT_TYPE[2]},                      //查询留言。

  /**
   * 平台管理员模块
   * 作者：贾鹏涛
   * 时间：2017/8/21
   * **/
  'ciq.user.pagelist': {t: true, cntType: CNT_TYPE[2]},                    //用户列表
  'yizhijie.user.adduser':{t: true, cntType: CNT_TYPE[2]},                 //添加用户
  'yizhijie.user.disableuser':{t: true, cntType: CNT_TYPE[2]},             //根据id, 停用用户。
  'yizhijie.user.startuser':{t: true, cntType: CNT_TYPE[2]},               //根据id, 启用用户。
  'yizhijie.user.updatepassword':{t: true, cntType: CNT_TYPE[2]},          //根据id, 重置密码。

  'ciq.role.pagelist':{t: true, cntType: CNT_TYPE[2]},                      //角色分页列表
  'ciq.role.addrole':{t: true, cntType: CNT_TYPE[1]},                       //添加角色。
  'ciq.role.selectbyid': {t: true, cntType: CNT_TYPE[2]},                   //根据id, 查询角色。
  'ciq.role.delete':{t: true, cntType: CNT_TYPE[2]},                         //根据id, 删除角色。
  'ciq.role.list':{t: true, cntType: CNT_TYPE[2]},                           //角色列表
  'ciq.role.update':{t: true, cntType: CNT_TYPE[2]},                         //根据id, 更改角色。
  'ciq.riskasesmtpermissions.pagelist': {t: true, cntType: CNT_TYPE[2]},   //根据id, 查询用户权限。

  'ciq.riskasesmtparameter.pagelist': {t: true, cntType: CNT_TYPE[2]},     //根据id, 查询用户权限。
  'ciq.riskasesmtparameter.selectbyid': {t: true, cntType: CNT_TYPE[2]},   //根据id, 查询参数。
  'ciq.riskasesmtparameter.addparameter': {t: true, cntType: CNT_TYPE[1]}, //根据id, 保存参数。

};

const PREFIX = '_YZH_QUARANTINE';  //quarantine 检疫
//项目token前缀：
/* 保存用户信息，到localStore。 */
const TOKEN = `${PREFIX}_Token`;

const USER = `${PREFIX}_User`

const lsNames = {
    /*------- platform -------*/
    platform: {
      USER: USER,
      USER_ROLE: `${PREFIX}_User_Roles`                                         // 用户角色
    },
    /*--------- order ---------*/
    order: {
      AddOrderModalForm: `${PREFIX}_AddOrderModalForm`                       // 保存订单
    },
    /*--------- tms -----------*/
    tms: {

    }
};

export default {
  prefix: PREFIX,
  cntType: CNT_TYPE,
  url: URL,
  uploadUrl: UPLOAD_URL,
  ossFileUrl: OSS_FILE_URL,
  repFileUrl: REP_FILE_URL,
  lsNames,
  api: API,
  token: TOKEN,
  user: USER
}
