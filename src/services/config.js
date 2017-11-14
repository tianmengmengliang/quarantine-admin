// 接口URL
// const URL = "http://api.yizhihui.com:9596/rest";
//const URL = "http://192.168.253.2:8080/rest";
/*const URL = "http://192.168.1.104:8080/rest";*/
//const URL = "http://127.0.0.1:8080/rest";
//const URL = "http://172.17.8.192:8080/rest";
//const URL = "http://192.168.1.111:8080/rest";
// const URL = "http://192.168.1.109:8080/rest";
const URL = "http://114.215.188.10:18080/rest";



// 下载PDFurl
const DownURL="http://114.215.188.10:18080/rest";

// 接口API
const API = {
    login: ['yizhihui.user.login', false],
    register: ['yizhihui.user.register', false],
    organizationRegister: ["yizhihui.organize.registe", false],
    getverifycode: ['yizhihui.user.getverifycode', false],
    department: ['yizhihui.system.department', true],
    phoneverify: ['yizhihui.user.phoneverify', true],
    adddepartment: ['yizhihui.organize.adddepartment', true],
    addemployee: ['yizhihui.organize.addemployee', true],
    getstructure: ['yizhihui.organize.getstructure', true],
    listemployee: ['yizhihui.organize.listemployee', true],
    listprovince: ['yizhihui.area.listprovince', false],
    listcity: ['yizhihui.organize.listcity', false],
    orgclass: ['yizhihui.organize.listclass', false],
    listapp: ['yizhihui.application.listapp', true],
    listmodule: ['yizhihui.application.listmodule', true],
    curremployee: ['yizhihui.user.curremployee', true],
    liststructure: ['yizhihui.organize.liststructure', true],
    mydevice: ['yizhihui.tms.mydevices', true],
    listrecord: ['yizhihui.tms.listrecord', true],
    tempdetail: ['yizhihui.tms.tempdetail', false],
    savecustomer: ['yizhihui.tms.savecustomer', true],
    customerlist: ['yizhihui.tms.listcustomer', true],
    organsave: ["yizhihui.organ.save", true],
    organlist: ["yizhihui.organ.list", true],
    organremove: ["yizhihui.organ.remove", true],
    binddevice: ["yizhihui.tms.binddevice", true],
    listdevice: ["yizhihui.tms.listdevice", true],
    cusregiste: ["yizhihui.tms.registe", true],
    lastrecord: ["yizhihui.tms.lastrecord", false],
    printdata: ["yizhihui.tms.pringdata", false],
    exportData:["yizhihui.tms.exportData",false],

    // TMS
    listhandover:["yizhihui.tms.pagehandover",true],                            // 获取交接单列表
    addhandover:["yizhihui.tms.addhandover",true],                              // 添加冷链交接单
    getHandoverTemp:["yizhihui.tms.getHandoverTemp",true],                      // 冷链交接单温度明细
    getHandoverRecord:["yizhihui.tms.getHandoverRecord",true],                  // 获取冷链交接单指定设备的温度记录

    listally:["yizhihui.ally.listally",true],                                   // 获取客户管理列表
    saveally:["yizhihui.ally.saveally",true],                                   // 保存客户信息
    removeally:["yizhihui.ally.removeally",true],                               // 删除客户信息

    // 器官订单
    organOrderListForOperation: ["yizhihui.organorder.listForOperation", true], // 获取运营商订单列表
    listPic: ["yizhihui.organattch.list", true],                                // 获取运营商查看订单的文件列表
    organOrderListTemperature: ["yizhihui.organorder.listTemperature", true],   // 获取订单温度列表
    organOrderListLocation: ["yizhihui.organorder.listLocation", true],         // 获取订单位置列表

    // 器官医院库维护
    hospitallist: ["yizhihui.organally.listForOperator", true],                 // 医院库列表

    // 添加好友列表
    organmsglist: ["yizhihui.organallymessage.listByOperator", true],           // 添加好友请求的列表
    msgcheck: ["yizhihui.organallymessage.check", true],                        // 审核好友请求

    // 文件上传获取signature
    getSign: ["yizhihui.organattch.getSign", true],

    // 获取oss图片访问地址
    getReadSign: ["yizhihui.organattch.getReadSign", true],

    /*********************************新接口******************************************/

    /*---------------------GENERAL begin--------------------------------*/
    "tms.devicedata.createreport":["tms.devicedata.createreport",true,true],                 // 创建报告
    "tms.devicedata.exportreport":["tms.devicedata.exportreport",true,true],                 // 导出报告
    "tms.devicedata.pageevent":["tms.devicedata.pageevent",true,true],                       // 设备温度记录


    /*---------------------GENERAL end----------------------------------*/

    /*---------------------TMS begin------------------------------------*/

    // 设备数据
    "tms.devicedata.pagevalue":["tms.devicedata.pagevalue",true,true],                      // 温度明细列表
    "tms.devicedata.lastevent":["tms.devicedata.lastevent",true,true],                      // 获取设备最后一次记录的时间

    // 我的设备
    "tms.deviceinfo.list":["tms.deviceinfo.list",true,true],                                // 设备列表
    "tms.deviceinfo.modify":["tms.deviceinfo.modify",true,true],                            // 修改备注信息
    "tms.deviceinfo.liststatus":["tms.deviceinfo.liststatus",true,true],                    // 设备状态


    // 客户管理
    "tms.ally.list":["tms.ally.list",true,true],                                            // 客户管理
    "tms.ally.save":["tms.ally.save",true],                                                 // 添加客户
    "tms.ally.remove":["tms.ally.remove",true,true],                                        // 删除客户

    // 交接单管理
    "tms.handover.list":["tms.handover.list",true,true],                                    // 查询交接单
    "tms.handover.save":["tms.handover.save",true],                                         // 保存交接单
    "tms.handoverevent.list":["tms.handoverevent.list",true,true],                          // 已绑定温度事件
    "tms.handoverevent.listunbindevent":["tms.handoverevent.listunbindevent",true,true],    // 为绑定温度事件列表
    "tms.handoverevent.bind":["tms.handoverevent.bind",true,true],                          // 绑定温度事件
    "tms.devicedata.listvalue":["tms.devicedata.listvalue",true,true],                      // 温度明细
    "tms.handoverevent.createreport":["tms.handoverevent.createreport",true,true],          // 创建交接单报告
    "tms.handoverevent.exportreport":["tms.handoverevent.exportreport",true,true],          // 导出交接单报告

    /*--------------------TMS end--------------------------------------*/

}

// 项目token前缀
const TOKEN = "yzh-token";
const CONTENT_TYPE=[

]

export default {
    url: URL,
    downUrl:DownURL,
    api: API,
    token: TOKEN
};