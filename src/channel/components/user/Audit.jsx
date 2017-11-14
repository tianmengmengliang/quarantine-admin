import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import faker from 'faker'
import { connect } from 'dva'
import moment from 'moment'
import cx from 'classnames'
import {Form, Select, Popconfirm, message, Input, Spin, Modal, notification, Button, Icon, Upload} from 'antd'
import {GridTable, Block, Inline,
    ButtonContainer, AddButton,
    DelButton, UploadButton, EditButton, SearchButton, ImagePreview, SpinLoading, PDFViewer2} from '../../../components/'
import {ViewAudit, } from './module/'
import './audit.less'
import {fetch, CONFIG} from 'antd/../../src/services/'
import {dimsMap} from '../helpers/'
const {platform: {user}} = dimsMap;

function createRows(numberOfRows) {
    let rows = [];
    for (let i = 0; i < numberOfRows; i++) {
        rows[i] = createFakeRowObjectData(i);
    }
    return rows;
}
function createFakeRowObjectData(index) {
    const typeRandNumber = faker.random.number({min: 1, max: 3});
    return {
        id: index,
        type: typeRandNumber === 1 ? '单位用户' : typeRandNumber === 2 ? '个人用户' : '其他机构',
        status: '1',
        mobile: faker.phone.phoneNumber('15#########'),
        orgName: faker.company.companyName(),
        orgCode: faker.phone.phoneNumber('####-####-####-########'),
        idCardNumber: faker.phone.phoneNumber('###############'),
        contact: faker.name.findName(),
        phone: faker.phone.phoneNumber('####-########'),
        idCard: faker.image.people(),
        businessLicenseCode: faker.phone.phoneNumber('####-####-####-######'),
        businessLicenseFile: faker.image.business(),
        orgCodeCertificate: faker.image.image(),
        authFile: faker.image.imageUrl(),
        realName: faker.name.findName()
    };
}

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

const CompanyInformation = function({onPreview, userType, mobile, orgName, businessLicenseCode, contact, phone, businessLicenseFile, authFile }){
    return (
        <div className="company-information">
            <div>
                <span>类型：</span>
                <span>{userType}</span>
                <span className="mobile">注册手机号：</span>
                <span>{mobile}</span>
            </div>
            <div>
                <table>
                    <tr>
                        <td>单位名称</td>
                        <td>{orgName}</td>
                        <td>营业执照编号</td>
                        <td>{businessLicenseCode}</td>
                    </tr>
                    <tr>
                        <td>联系人</td>
                        <td>{contact}</td>
                        <td>联系电话</td>
                        <td>{phone}</td>
                    </tr>
                    <tr>
                        <td>营业执照附件</td>
                        <td>
                            {
                                businessLicenseFile ?
                                    (/\.pdf$/i).test(businessLicenseFile.toString().toLowerCase()) ?
                                    <a
                                        className={`filename`}
                                        // href={`${CONFIG.ossFileUrl}${filePath}`}
                                        onClick={()=>{PDFViewer2.open(`${CONFIG.ossFileUrl}${businessLicenseFile}`)}}
                                        target="_blank">{businessLicenseFile ? <Icon type="file"/> : ''}</a>
                                        :
                                        ( /(\.jpg| \.jpeg)+$/i).test(businessLicenseFile.toString().toLowerCase()) ?
                                        <ImagePreview
                                            onPreview={onPreview}
                                            src={`${CONFIG.ossFileUrl}${businessLicenseFile}`}/> :
                                            '缺少'
                                    :
                                '异常文件'
                            }
                        </td>
                        {/*<td>盖章授权书</td>
                        <td>
                            {/!*<ImagePreview
                                onPreview={onPreview}
                                src={authFile}/>*!/}
                            { authFile ? <a target="_blank" className="file-icon" href={`${CONFIG.ossFileUrl}${authFile}`}><Icon type="file"/></a> : '缺少'}
                        </td>*/}
                    </tr>
                </table>
            </div>
    </div>
    )
};

const PersonalInformation = function({onPreview, userType, mobile, realName, phone, idCardNumber, idCard }){
    return (
        <div className="personal-information">
            <div>
                <span>类型：</span>
                <span>{userType}</span>
                <span className="mobile">注册手机号：</span>
                <span>{mobile}</span>
            </div>
            <div
                style={{display: 'inline-block', width: '50%'}}>
                <table>
                    <tr>
                        <td>姓名</td>
                        <td>{realName}</td>
                    </tr>
                    <tr>
                        <td>联系电话</td>
                        <td>{phone}</td>
                    </tr>
                </table>
            </div>
            <div
                style={{display: 'inline-block', width: '50%'}}>
                <table>
                    <tr>
                        <td>身份证号</td>
                        <td>{idCardNumber}</td>
                    </tr>
                    <tr>
                        <td>身份证附件</td>
                        <td>
                            <ImagePreview
                                title="营业执照"
                                onPreview={onPreview}
                                src={idCard}/>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    )
};

const OtherOrgInformation = function({onPreview, userType, mobile, orgName, orgCode, contact, phone, orgCodeCertificate, authFile }){
    return (
        <div className="other-org-information">
            <div>
                <span>类型：</span>
                <span>{userType}</span>
                <span className="mobile">注册手机号：</span>
                <span>{mobile}</span>
            </div>
            <div>
                <table>
                    <tr>
                        <td>机构名称</td>
                        <td>{orgName}</td>
                        <td>机构代码</td>
                        <td>{orgCode}</td>
                    </tr>
                    <tr>
                        <td>联系人</td>
                        <td>{contact}</td>
                        <td>联系电话</td>
                        <td>{phone}</td>
                    </tr>
                    <tr>
                        <td>组织机构代码证附件</td>
                        <td>
                            <ImagePreview
                                onPreview={onPreview}
                                src={`orgCodeCertificate`}/>
                        </td>
                        <td>盖章授权书</td>
                        <td>
                            <ImagePreview
                                onPreview={onPreview}
                                src={authFile}/>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    )
};

const Information = function(props){
    const {userType} = props;
    // console.log(userType)
    return (
        <div style={{maxHeight: props.height}}>
            {userType === 1 ?
            <CompanyInformation {...props}/> :
                userType === '个人用户' ?
            <PersonalInformation {...props}/> :
                    userType === '其他机构' ?
            <OtherOrgInformation {...props}/> :
            ''}
        </div>
    )
}

class Audit extends Component{

    _retInitialState = ()=>{
        return {
            spinning: false,                                    // 页面加载数据loading状态
            title: '',                                          // 页面加载数据loading状态文字
            selectedIds: [],                                    // 已选定的行数据ids
            selectedRows: [],                                   // 选中的行数据
            tableLoading: false,
            previewLoading: false,
            previewVisible: false,                              // 预览图片对话框
            previewImage: '',
            listPage: {
                pageIndex: 1,
                pageSize: 6,
                rows: [],
                total: 0
            },
            addOrderModal: {                                    // 新增订单
                visible: false,
                title: '',
                data: {}
            },
            viewAudit: {                                    // 拒绝原因填写对话框。
                visible: false,
                title: '',
                data: {}
            }
        }

    };

    constructor(props){
        super(props);
        this.state = this._retInitialState();
    }

    componentDidMount(){
        const {listPage: {pageIndex, pageSize}} = this.state;
        this.getUserList({pageIndex, pageSize});
    }

    /*
     * 获取订单列表的所有查询条件
     * @param {object} pageQuery 分页查询对象
     * @return {object} 列表所有查询条件参数对象
     * */
    _getAllListQuery = (pageQuery = {})=>{
        // step1 获取所有查询参数
        let _f = {};
        /*this.OrderQueryForm.validateFields((err, values)=>{
         _f = values
         });*/
        return {
            ..._f,
            ...pageQuery
        }
    };

    /*
     * @interface 获取订单列表
     * */
    getUserList = (query)=>{
        // step1. 获取查询阐参数
        const _q = this._getAllListQuery(query);
        // console.log(_q);
        // step2. 请求列表数据
        fetch('platform.user.listforregcheck', {
            // method: 'post',
            // headers: {},
            data: _q,
            success: (res)=>{
                const {responseObject: listPage} = res;
                this.setState({
                    listPage
                })
            },
            error: (err)=>{
                // step1.
                message.error(err.message);
            },
            beforeSend: ()=>{
                this.setState({
                    tableLoading: true
                })
            },
            complete: (err, data)=>{
                this.setState({
                    tableLoading: false
                })
            }
        })
    };

    /*
     * @interface 重置state的selectedRows，重置state的selectedIds
     * */
    resetSelectedRowsNIds = ()=>{
        this.setState({
            selectedIds: [],
            selectedRows: []
        })
    }

    /*
     * @interface 表格排序
     * @param {string} sortColumn 排序的列的key
     * @param {string} sortDirection 排序的方向
     * */
    handleGridSort(sortColumn, sortDirection) {
        const comparer = (a, b) => {
            if (sortDirection === 'ASC') {
                return (a[sortColumn] > b[sortColumn]) ? 1 : -1;
            } else if (sortDirection === 'DESC') {
                return (a[sortColumn] < b[sortColumn]) ? 1 : -1;
            }
        };

        // const rows = sortDirection === 'NONE' ? this.state.originalRows.slice(0) : this.state.rows.sort(comparer);

        // this.setState({ rows });
    };

    /*/!*
     * @interface Grid行更新
     * *!/
     handleGridRowsUpdated = ({ fromRow, toRow, updated })=> {
     console.log('handleGridRowsUpdated',arguments)
     let rows = this.state.rows;

     for (let i = fromRow; i <= toRow; i++) {
     let rowToUpdate = rows[i];
     let updatedRow = React.addons.update(rowToUpdate, {$merge: updated});
     rows[i] = updatedRow;
     }

     this.setState({ rows });
     };*/

    /*
     * @interface 选中行接口
     * @param {Array} 选中的行
     * */
    onRowsSelected = (rows /*新增选择的行*/) =>{
        /* this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))});
         this.setState({selectedRows: this.state.selectedRows.concat(rows.map(r => r.row))});*/
        this.setState({selectedIds: rows.map(r => r.row[this.props.rowKey])});
        this.setState({selectedRows: rows.map(r => r.row)});
    };

    /*
     * @interface 取消选中行接口
     * @param {Array} 取消选中的行
     * */
    onRowsDeselected = (rows /*取消选择的行*/) =>{
        let rowIds = rows.map(r =>  r.row[this.props.rowKey]);
        this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 )});
        this.setState({selectedRows: this.state.selectedRows.filter(r => rowIds.indexOf(r[this.props.rowKey]) === -1 )});
    };

    onRowClick = (rowIdx, clickedRow)=>{
        // case1. 如果是全选操作，跳过会自动调用onRowsSelected方法，如果是单选操作请隐藏全选checkbox视图操作
        if(rowIdx === -1){
            return;
        }
        // case2. 不是全选操作
        const hasSelected =  this.state.selectedRows.some((item)=>{
            return item[this.props.rowKey] === clickedRow[this.props.rowKey]
        });
        if(hasSelected){
            let rowIds = clickedRow[this.props.rowKey];
            this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.toString().indexOf(i) === -1 )});
            this.setState({selectedRows: this.state.selectedRows.filter(r => rowIds.toString().indexOf(r[this.props.rowKey]) === -1 )});
        }else{
            // case2-case1. 采用赋值，如果是只能选中一行采用赋值，如果是合并选中行，采用concat方法来合并操作
            this.setState({selectedIds: [clickedRow[this.props.rowKey]]});
            this.setState({selectedRows: [clickedRow]});
        }
    };

    /*
     * @interface 表单查询回调
     * @param {object} values 返回的表单查询对象
     * */
    queryCallback = ()=>{
        const {listPage: {pageSize}} = this.state;
        this.getUserList({pageIndex: 1, pageSize})
    };

    /*
     * @interface 判断是否只选中一行数据
     * @param {array} selectedIds 选中的行数组
     * return {boolean} 只选中一行数据返回true否则返回false
     * */
    _hasSelectedOnlyOneIdx = (selectedIds = [], nullText = undefined, moreText = undefined)=>{
        if(selectedIds.length === 0){
            // s1-case1. 没有选中任何行数据提示
            message.warn(`${nullText || '你未选中任何订单'}`);
            return false
        }else if(selectedIds.length > 1 ){
            // s1-case2. 选中超过2行数据提示
            message.warn(`${moreText || '你只能选择一条订单'}`);
            return false;
        }
        return true
    };

    handleCancel = () => this.setState({
        previewLoading: false,
        previewVisible: false,
        previewImage: ''
    });


    /*
     * @interface 确认订单
     * @param {object} _props 订单对象参数
     * */
    confirmOrderClick = ({dependentValues = {}})=>{
        // step1. 如果只选中一行数据，确认订单xhr
        this.confirmOrder({orderId: dependentValues['id']}, (err, res)=>{
            if(err){
                // s2-ss1-case1. 提交订单失败
                const key = `open${Date.now()}`;
                notification.error({
                    message: '确认订单失败',
                    description: `原因：${err.message || '未知'}`,
                    key,
                    onClose: noop,
                });
                return;
            }

            // s2-ss1-case2. 重置selectedIds和重新渲染订单列表
            /* this.setState({
             selectedIds: [],
             selectedRows: []
             });*/
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getUserList({pageIndex, pageSize})
        })
    };

    /*
     * @interface 确认订单
     * @param {object} 选中的行对象参数
     * @param {func} 回调函数
     * */
    confirmOrder = (orderId = {}, callback = ()=>{})=>{
        fetch('ciq.crossorderstep.confirm', {
            // method: 'post',
            // headers: {},
            data: orderId,
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    title: '确认订单中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    title: ''
                })
            }
        })
    };

 //---------------------------------------------- start 拒绝原因对话框。------------------------------------------------
    auditUser = (data, callback)=>{
        fetch('platform.user.checkuserinfo', {
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
                    spinning: true,
                    title: '提交数据中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    title: ''
                })
            }
        })
    };

    auditUserClick = ({status, data})=>{
      if(status === '2'){
          this.auditUser({id: data.id, status}, (err, res)=>{
              if(err){
                  message.error(err.message)
                  return;
              }
              const {listPage: {pageIndex, pageSize}} = this.state;
              this.getUserList({pageIndex, pageSize})
          })
      }
      if(status === '-1'){
          let value= {};
          value['id'] = data.id;
          value['status']= status;
          console.log('value',value );
          this.showViewAudit({data: value});
      }
    };
    showViewAudit = ({data})=>{//显示查看对话框
      this.setState(({viewAudit})=>{
        return {
          viewAudit: {
            ...viewAudit,
            visible: true,
            data: data
          }
        }
      })
    };
    hiddenViewAudit = ()=>{ //隐藏查看对话框
      this.setState(({viewAudit})=>{
        return {
          viewAudit: {
            ...viewAudit,
            visible: false,
            data: {}
          }
        }
      })
    };
    ViewAuditCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenViewAudit();
            return;
        }
        if(click === 'ok'){
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getUserList({pageIndex, pageSize});
            this.hiddenViewAudit();
            return;
        }
    }
//---------------------------------------------------- end ---------------------------------------------------------
    /*
     * @interface 显示添加订单对话框
     * @param {string} type 操作类型
     * @param {array} 选中的行数据
     * */
    add = ({type, orderType, data: selectedRows = []})=>{
        if(type === 'add') {
            if(orderType == 3) {
                this.showAdd({data: {}});
            }
            if(orderType == 2) {

            }
            if(orderType == 1) {

            }
        }
        if(type === 'edit') {
            const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
            if (hasSelectedOnlyOneIdx) {
                // s1-case1. 只选中一行并且订单状态为未提交
                let isStatus0 = selectedRows[0]['status'] === 0;
                if (isStatus0) {
                    this.getOrderDetail({data: selectedRows[0]}, (err, res = {})=> {
                        if (err) {
                            // case1. 请求订单明细失败
                            message.error('获取订单明细失败');
                        } else {
                            // case2. 请求订单明细成功，显示对话框
                            if(orderType == 3) {
                                this.showAdd({
                                    data: res.responseObject
                                })
                            }
                            if(orderType == 2) {

                            }
                            if(orderType == 1) {

                            }
                        }
                    })
                }else{
                    // s1-case2. 只选中一行并且订单状态为其他状态
                    message.error('订单已经提交，不能修改该订单');
                }
            }else{
                return;
            }
        }
    };

    showAdd = ({data})=>{
        this.setState(({addOrderModal})=>{
            return {
                addOrderModal: {
                    ...addOrderModal,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏订单对话框
     * */
    hiddenAdd = ()=>{
        this.setState(({addOrderModal})=>{
            return {
                addOrderModal: {
                    ...addOrderModal,
                    visible: false,
                    confirmLoading: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 添加订单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    addCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenAdd();
            return;
        }

        // 如果点击确定按钮，则提交表单
        if(click === 'ok'){
            // console.log(info);
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getUserList({pageIndex, pageSize})
            this.hiddenAdd();
            return;
        }
    };

    /*
     * @interface 删除一条订单记录
     * @param {object} 删除的订单记录对象
     * */
    delOrderClick = ({data: selectedRows = []})=>{
        // step1. 判断是否只选中一行数据
        const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
        if (hasSelectedOnlyOneIdx) {
            // s1-case1. 只选中一条订单并且订单的状态为未提交status 0
            let isStatus0 = selectedRows[0]['status'] === 0;
            if (isStatus0) {
                Modal.confirm({
                    width: 416,
                    iconType: 'exclamation-circle',
                    title: '',
                    content: '你确定要删除该订单吗？',
                    okText: '确认删除',
                    cancelText: '我再想想',
                    maskClosable: false,
                    onOk: ()=> {
                        this.delOrder({data: selectedRows[0]}, (err, res = {})=> {
                            if (err) {
                                // case1. 请求订单明细失败
                                message.error('删除订单失败');
                            } else {
                                // s2-ss1-case2. 重置selectedIds和重新渲染订单列表
                                this.setState({
                                    selectedIds: [],
                                    selectedRows: []
                                });
                                const {listPage: {pageIndex, pageSize}} = this.state;
                                this.getUserList({pageIndex, pageSize})
                            }
                        })
                    },
                    onCancel: ()=> {
                    }
                });
            }else{
                // s1-case2. 只选中一条订单并且订单的状态为其他状态
                message.error('订单已经提交，不能删除该订单');
            }
        }
    };

    /*
     * @interface 删除订单
     * @param {object} 选中的行对象参数
     * @param {func} 回调函数
     * */
    delOrder = ({data: {id}}, callback = ()=>{})=>{
        fetch('ciq.crossorder.remove', {
            // method: 'post',
            // headers: {},
            data: {id},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    title: '删除订单中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    title: ''
                })
            }
        })
    };

    search = (r)=>{
        const {dispatch} = this.props;
        const {length, msg, selectedArray} = getArraySelectedInfo(this.state.selectedIds);
        dispatch({
            type: 'nav/changeNav',
            payload: {
                id: 'Org/viewOrgInfo',                                      // 点击动作标识符
                form: 'Org',                                                // 父组件标识符或者父组件
                data: r,                                                    // 携带数据
                actionType: 'click',                                        // 动作类型
                actionEvent: null,                                          // 事件对象
                instance: null,                                             // 当前触发实例
                cName: '查看',                                              // 事件cName
                tag: undefined,                                             // 事件标签
            }
        });
        if(length === 1){
            // 正常的查看操作操作
            console.log('search正常')
        }else if(length === 0){
            // 弹出错误提示，内容为没有选择任何项
            console.log('search0')
        }else if(length > 1){
            // 弹出错误提示，内容为选择太多项
            console.log('search2')
        }
        console.log('search', r)
    };

    confirm = ()=> {
        message.info('Click on Yes.');
    };

    onPreview = ({src})=>{
        console.log(src)
        this.setState({
            previewLoading: true,
            previewVisible: true,
            previewImage: src
        })
    };

    onImageLoad = ()=>{
        this.setState({
            previewLoading: false,
        })
    };

    onImageError= ()=>{
        this.setState({
            previewLoading: false,
        })
    };

    onImageAbort = ()=>{
        this.setState({
            previewLoading: false,
        })
    };

    /*
     * @interface 判断期望值与实际值是否相等
     * @param {any} exceptValue 期望值
     * @param {any} realValue 实际值
     * @return {boolean} 如果两个值相等则返回true否则返回false
     * */
    _isExpectStatusValue = (exceptValue, realValue)=>{
        return exceptValue === realValue
    };

    render() {
        const {prefix, ...props} =this.props;
        const { getFieldDecorator } = this.props.form;
        const {selectedIds, selectedRows, spinning, title,
            listPage: {pageIndex, pageSize, rows: dataSource, total}, previewVisible, previewImage, previewLoading,
            tableLoading,viewAudit} = this.state;

        // console.log(selectedIds, selectedRows)

        const formItemLayout = {
            labelCol: {span: 10},
            wrapperCol: {span: 14},
            style: {width: '25%', margin:'4px 0 4px 0'}
        };

        const _pagination = {
            current: pageIndex,
            pageSize: pageSize,
            total: total,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: undefined,
            onShowSizeChange: (current, pageSize) => {
                console.log('Current: ', current, '; PageSize: ', pageSize);
            },
            onChange: (current) => {
                this.getUserList({pageIndex: current, pageSize}) //分页查询。
            }
        };
        // console.log(this.state.listPage, pageIndex, _pagination)


        const _columns = [
            {
                key: 'sn',
                name: '序号',
                width: 100,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                locked: true,
                formatter: ({dependentValues,rowIdx, value})=> {
                    const {listPage: {pageIndex, pageSize}} = this.state;
                    return (
                        <span>{(pageIndex- 1) * pageSize + rowIdx + 1}</span>
                    )
                },
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'operation',
                name: '操作',
                width: 200,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                locked: true,
                formatter: ({dependentValues,rowIdx, column})=> {
                    const {status, orderType} = dependentValues;
                    return (
                        <ButtonContainer>
                            <Popconfirm
                                title={<div>你确定<span style={{color: 'green', fontSize: 16, fontWeight: 500, margin: '0 8px'}}>通过</span>该单位的审核？<div><span>单位名称：</span>{dependentValues.orgName}</div></div>}
                                onConfirm={this.auditUserClick.bind(this, {status: '2', data: dependentValues})}
                                okText="通过"
                                cancelText="取消">
                                <Button
                                    className={`${cx({"hidden": !this._isExpectStatusValue(1, status) })}`}
                                    type="primary"><Icon type="check-circle"/>通过</Button>
                            </Popconfirm>
                            <Popconfirm
                                title={<div>你确定<span style={{color: 'red', fontSize: 16, fontWeight: 500, margin: '0 8px'}}>拒绝</span>该单位的审核？<div><span>单位名称：</span>{dependentValues.orgName}</div></div>}
                                onConfirm={this.auditUserClick.bind(this, {status: '-1', data: dependentValues})}
                                okText="不通过"
                                cancelText="取消">
                                < Button
                                    className = {`${cx({"hidden": !this._isExpectStatusValue(1, status)})}`}
                                    type="danger"><Icon type="close-circle"/>拒绝</Button>
                            </Popconfirm>
                        </ButtonContainer>
                    )
                },
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'details',
                name: '资料',
                width: 750,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues, rowIdx, value, column: {key}})=>{
                   // console.log(dependentValues)
                    return (
                        <Information onPreview={this.onPreview} height={124} {...dependentValues}/>
                    )
                }
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'status',
                name: '状态',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues: {id, code},rowIdx, value, column: {key}})=>{
                    const cls = cx({
                        [`status`]: true,
                        [`status${value}`]: true
                    })
                    return (
                        <div className={cls}>
                            {user[value]}
                        </div>
                    )
                }
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            }
        ];
        return (
            <div {...props} className={`${prefix}-user-audit-wrap`}>
                <div className="hidden">
                    <Modal
                        width={1000}
                        className="image-preview-modal"
                        visible={previewVisible}
                        footer={null}
                        onCancel={this.handleCancel}>
                        <SpinLoading
                            spinning={previewLoading}
                            tip={`图片加载中`}
                            size="large">
                            <img
                                alt="预览大图"
                                onLoad={this.onImageLoad}
                                onError={this.onImageError}
                                onAbort={this.onImageAbort}
                                style={{ width: '100%', minHeight: 450, maxHeight: 760, overflow: 'auto' }}
                                src={previewImage} />
                        </SpinLoading>
                    </Modal>
                    <ViewAudit    //拒绝原因填写对话框。
                      {...viewAudit}
                       callback={this.ViewAuditCallback}/>
                </div>
                <Spin
                    spinning={spinning}
                    tip={title}>
                    <ButtonContainer>
                        {/*<AddButton onClick={this.add.bind(this, {type: 'add', orderType: 3, data: []})}>创建查验订单</AddButton>
                        <UploadButton onClick={this.commitOrder.bind(this, {data: selectedRows})}>提交订单</UploadButton>
                        <EditButton onClick={this.add.bind(this, {type: 'edit', orderType: selectedRows[0] && selectedRows[0]['orderType'], data: selectedRows})}>修改订单</EditButton>
                        <SearchButton onClick={this.viewClick.bind(this, {type: 'search', orderType: selectedRows[0] && selectedRows[0]['orderType'], data: selectedRows})}>查看订单</SearchButton>
                        <SearchButton onClick={this.viewClickForY.bind(this, {type: 'search', orderType: selectedRows[0] && selectedRows[0]['orderType'], data: selectedRows})}>查看订单For YZJ</SearchButton>
                        <DelButton onClick={this.delOrderClick.bind(this, {data: selectedRows})}>删除订单</DelButton>*/}
                    </ButtonContainer>
                    <GridTable
                        tableLoading={tableLoading}
                        // enableCellSelect={true}
                        dataSource={dataSource}
                        columns={_columns}
                        onGridRowsUpdated={this.handleGridRowsUpdated}
                        enableRowSelect={true}
                        onRowClick = {this.onRowClick}
                        rowSelection={
                              {
                                  showCheckbox: true,
                                  enableShiftSelect: false,
                                  onRowsSelected: this.onRowsSelected,
                                  onRowsDeselected: this.onRowsDeselected,
                                  selectBy: {
                                      keys: {rowKey: 'id', values: this.state.selectedIds}
                                  }
                              }
                        }
                        headerRowHeight={36}
                        rowHeight={124}
                        minHeight={pageSize * 124 + 60}
                        // rowRenderer={RowRenderer}
                        rowScrollTimeout={0}
                        onGridSort={this.handleGridSort}
                        pagination={_pagination}
                        />
                </Spin>
            </div>
        )
    }
}

Audit.propTypes = {
    prefix: PropTypes.string,
    rowKey: PropTypes.string
};

Audit.defaultProps = {
    prefix: 'yzh',
    rowKey: 'id'
};

Audit = Form.create()(Audit);

const mapStateToProps=({})=>{
    return {

    }
};

export default connect(mapStateToProps)(Audit);
