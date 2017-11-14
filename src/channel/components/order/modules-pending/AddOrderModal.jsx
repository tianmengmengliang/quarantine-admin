import React, { Component, PropTypes } from 'react';
import faker from 'faker'
import {Form, Select, Input, Upload, Alert, Popconfirm, message, Spin, Icon, Modal, Button} from 'antd'
import cx from 'classnames'
import {ModalA, BodyGridTable, GridTable, ButtonContainer, AddButton, UploadButton} from '../../../../components/'
import AddOrderCargoModal from './AddOrderCargoModal.jsx'
import DisplayPDFModal from './DisplayPDFModal.jsx'
import {fetch, CONFIG} from 'antd/../../src/services/'
import './addOrderModal.less'
import pdfUrl from 'antd/../../public/assets/img/pdf.png'
import rarUrl from 'antd/../../public/assets/img/rar.png'
import zipUrl from 'antd/../../public/assets/img/zip.png'
import unKnowUrl from 'antd/../../public/assets/img/unknow.png'
import {dimsMap} from '../../helpers/'
const {order: {orderType : ORDER_TYPES}, product: {itemTypes, countUnit, weightUnit, valueUnit}} = dimsMap;

/*createRows(numberOfRows) {
 let rows = [];
 for (let i = 0; i < numberOfRows; i++) {
 rows[i] = this.createFakeRowObjectData(i);
 }
 return rows;
 }

 createFakeRowObjectData(index) {
 return {
 id: index,
 name: faker.image.avatar(),
 nameEn: faker.address.county(),
 type: faker.internet.email(),
 subType: faker.name.prefix(),
 productCount: faker.name.firstName(),
 countUnit: faker.name.lastName(),
 productWeight: faker.address.streetName(),
 weightUnit: faker.address.zipCode(),
 productValue: faker.date.past().toLocaleDateString(),
 valueUnit: faker.company.bs(),
 manufacturer: faker.company.catchPhrase(),
 country: faker.company.companyName(),
 spec: faker.lorem.words(),
 compositions: faker.lorem.sentence(),
 purpose: faker.lorem.sentence(),
 };
 }*/

let _uniqueFileId = -1;
function _normalizeFileList(filePath){
    let thumbUrl = undefined;
    const patternPDF = /\.pdf$/;
    const patternRAR = /\.rar$/;
    const patternZIP = /\.zip$/;
    if(patternPDF.test(filePath.toLowerCase())){
        thumbUrl = pdfUrl
    }else if(patternRAR.test(filePath.toLowerCase())){
        thumbUrl = rarUrl;
    }else if(patternZIP.test(filePath.toLowerCase())){
        thumbUrl = zipUrl;
    }else{
        thumbUrl = unKnowUrl
    }
    return {
        uid: _uniqueFileId--,
        name: filePath,
        status: 'done',
        filePath: filePath,
        url: '',
        thumbUrl: thumbUrl
    }
}

function _normalizeData(data = {}){
    const {orderFile} = data;
    if(typeof orderFile === 'string' && orderFile !== ''){
        data.fileList = [_normalizeFileList(orderFile)]
    }else{
        data.fileList = []
    }
    return {
        ...data
    }
}

const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};
function noop(){}

class AddOrderModal extends Component{

    _retInitialState = ()=>{
        return {
            confirmLoading: false,                      // 对话框确认按钮loading状态
            detail: [],                                 // 产品明细列表
            fileList: [],                               // 文件上传列表
            orderType: 1,                               // 订单类型
            // selectedIds: [1, 2],
            listPage: {                                 // 产品列表
                pageIndex: 1,
                pageSize: 99999
            },
            addOrderCargoModal: {                       // 添加产品对话框
                visible: false,
                title: '',
                data: {}
            },
            displayPDFModal: {                          // pdf对话框
                visible: false,
                title: '',
                fileUrl: undefined,
                data: {}
            }
        }
    };

    /*
    * @interface 重置state和UI
    * */
    _resetAction = ()=>{
        // step1、重置state
        this.setState(this._retInitialState());
        // step2、重置表单
        this.props.form.resetFields();
    };

    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    componentWillReceiveProps(nextProps){
        const {data: newData, visible} = nextProps;
        const {data: oldData} = this.props;
        if(visible && newData !== oldData){
            // case1.. 规则化数据
            const _d = _normalizeData(newData);
            const {details = [], fileList = [], orderType} = _d;
            this.setState({
                orderType: orderType || 1,
                detail: [...details],
                fileList
            })
        }
    }

    /*
    * @interface 处理上传文件事件对象
    * @param {object} 上传事件对象
    * */
    normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    /*
     * @interface 校验审批单号和审批单附件
     * @param {Array.<object>} 校验规则
     * param {string} 审批单号
     * @param {func} callback 回调函数
     * */
    validateApplyBillCode = (rule,value,callback)=>{
        console.log(value)
        const fileValue = this.props.form.getFieldValue(['applyBillFile']);
        if(!!value){
            if(!fileValue){
                this.props.form.setFields({
                    applyBillFile: {
                        value: fileValue,
                        errors: [new Error('你已填写审批单号，请上传审批单附件')]
                    }
                })
            }
        }else{
            this.props.form.setFields({
                applyBillFile: {
                    value: fileValue,
                    errors: null
                }
            })
        }
       callback();
    };

    /*
     * @interface 校验审批单号和审批单附件
     * @param {Array.<object>} 校验规则
     * param {string} 审批单附件
     * @param {func} callback 回调函数
     * */
    validateApplyBillFile = (rule,value,callback)=>{
        const codeValue = this.props.form.getFieldValue(['applyBillCode']);
        if(!!value){
            if(!codeValue){
                this.props.form.setFields({
                    applyBillCode: {
                        value: codeValue,
                        errors: [new error('你已上传审批单附件，请填写审批单号')]
                    }
                })
            }
        }else{
            this.props.form.setFields({
                applyBillCode: {
                    value: codeValue,
                    errors: null
                }
            })
        }
        callback();
    };

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

    /*
     * @interface Grid行更新
     * */
    /*handleGridRowsUpdated = ({ fromRow, toRow, updated })=> {
        console.log('handleGridRowsUpdated',arguments)
        let rows = this.state.rows;

        for (let i = fromRow; i <= toRow; i++) {
            let rowToUpdate = rows[i];
            let updatedRow = React.addons.update(rowToUpdate, {$merge: updated});
            rows[i] = updatedRow;
        }

        this.setState({ rows });
    };*/

   /* /!*
     * @interface 选中行接口
     * @param {Array} 选中的行
     * *!/
    onRowsSelected = (rows /!*新增选择的行*!/) =>{
        this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))});
    };

    /!*
     * @interface 取消选中行接口
     * @param {Array} 取消选中的行
     * *!/
    onRowsDeselected = (rows /!*取消选择的行*!/) =>{
        let rowIds = rows.map(r =>  r.row[this.props.rowKey]);
        this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 )});
    };*/

    /*
     * @interface 保存订单
     * @param {object} 订单记录对象
     * */
    submitOrder = (data, callback)=>{
        // console.log(data)
        fetch('ciq.crossorder.save', {
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

    onOk = ()=> {
        const {detail} = this.state;
        // case1. 有货物，继续提交
        if(detail && detail.length > 0) {
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (err) {
                    return;
                }
                // console.log(values);
                const {detail} = this.state;
                // Step1、保存订单
                this.submitOrder({...values, details: detail}, (err, data)=> {
                    if (!err) {
                        // case1. 保存订单成功
                        // step1. 回调
                        this.props.callback && this.props.callback({
                            click: 'ok',
                            data: {
                                ...values,
                                detail
                            }
                        });
                        // step2. 重置组件
                        this._resetAction()
                    } else {
                        // case2. 保存订单失败
                        message.error(err.message);
                    }
                });
                // Step2、保存当前提交的订单内容到ls中
                const {lsName} = this.props;
                localStorage.setItem(`${CONFIG.prefix}_${lsName}`, JSON.stringify(values))
            });
        }else{
            // case2. 没有货物，提示填写货物
            message.error('请至少添加一条产品信息，货物列表产品记录不能为空')
        }
       /* return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));*/
    };

    onCancel = ()=> {
        // step1. 判断询问是否保存数据
        const {detail} = this.state;
        const _fValue = this.props.form.getFieldsValue();
        const keys = Object.keys(_fValue);
        const hasData = keys.some((key)=>{
            return !!_fValue[key]
        });
       /* this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        });*/
        // s1-case2 ss2. 重置组件
        // this._resetAction()
        if(/*hasData ||*/ detail && detail.length !== 0){
            // s1-case1. 如果有需要保存的数据提示是否保存数据
            let isOk = false;
            Modal.confirm({
                title: '',
                content: '你还有未保存的数据，一旦关闭，本次填写或者修改的数据将不会被保存，你确定继续关闭吗？',
                maskClosable: false,
                okText: '取消关闭',
                cancelText: '继续关闭',
                onOk: ()=> {
                    // 保存点击ok按钮动作提示
                    isOk = true;
                    // s1-ss1判断是否有必填项未填
                  /*  let hasRequiredFields = true;
                    this.props.form.validateFieldsAndScroll((err, values) => {
                        if (!err) {
                            hasRequiredFields = false
                        }
                    });
                    if(!hasRequiredFields) {
                        return new Promise((resolve, reject) => {
                            this.submitOrder({
                                ..._fValue,
                                detail
                            }, (err, res)=> {
                                // s1-ss1-case1. 如果保存失败，则提示保存失败
                                if (err) {
                                    return err
                                } else {
                                    // s1-ss1-case2 保存订单成功
                                    resolve(res)
                                }
                            })
                        }).then((values)=> {
                                this.props.callback && this.props.callback({
                                    click: 'ok',
                                    data: {
                                        ...values,
                                        detail
                                    }
                                });
                                // s1-ss2. 重置组件
                                this._resetAction()
                            }).catch((err) => message.error(err.message));
                    }*/
                },
                onCancel: ()=> {
                    if(!isOk) {
                        // s1-case2 ss1. noop
                        this.props.callback && this.props.callback({
                         click: 'cancel',
                         data: null
                         });
                         // s1-case2 ss2. 重置组件
                         this._resetAction()
                    }
                }
            });
        }else{
            // s1-case2. 关闭对话框
            this.props.callback && this.props.callback({
                click: 'cancel',
                data: null
            });
            this._resetAction()
        }
    };

    /*
     * @interface 显示pdf对话框
     * @param {object} 参数对象
     * */
    displayPDFModal = ({fileUrl, data})=>{
        this.setState(({displayPDFModal})=>{
            return {
                displayPDFModal: {
                    ...displayPDFModal,
                    visible: true,
                    fileUrl,
                    data: {
                        ...data
                    }
                }
            }
        })
    };

    /*
     * @interface 隐藏添加产品对话框
     * */
    hiddenDisplayPDFModal = ()=>{
        this.setState(({displayPDFModal})=>{
            return {
                displayPDFModal: {
                    ...displayPDFModal,
                    visible: false,
                    fileUrl: undefined,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 添加产品对话框的回调
     * @param {object} info 对话框返回的信息对象
     * */
    displayPDFModalCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenDisplayPDFModal();
            return;
        }
    };

    /*
     * @interface 显示添加按钮
     * */
    add = ({type, data = {}})=>{
        if(type === 'add') {
            // case1. 如果是添加产品操作，显示添加产品对话框
            this.showAdd({type, data : {...data}});
        }
        if(type === 'edit'){
            // case2. 如果是编辑操作，显示添加产品对话框
            this.showAdd({type, data : {...data}});
            // this.getTMSOrderCargoDetails({data})
        }
    };

    /*
    * @interface 显示添加产品对话框
    * @param {object} 参数对象
    * */
    showAdd = ({type, data})=>{
        this.setState(({addOrderCargoModal})=>{
            return {
                addOrderCargoModal: {
                    ...addOrderCargoModal,
                    visible: true,
                    data: {
                        ...data
                    }
                }
            }
        })
    };

    /*
     * @interface 隐藏添加产品对话框
     * */
    hiddenAdd = ()=>{
        this.setState(({addOrderCargoModal})=>{
            return {
                addOrderCargoModal: {
                    ...addOrderCargoModal,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 添加产品对话框的回调
     * @param {object} info 对话框返回的信息对象
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
            console.log(info)
            this.updateProductDetails(info);
            this.hiddenAdd();
            return;
        }
    };

    /*
    * @interface 更新产品明细列表
    * @param {object} _props 对话框返回信息对象
    * */
    updateProductDetails = ({data: {_rowIdx}, data = {details: []}})=>{
        const {detail} = this.state;
        // 是否添加产品还是编辑产品
        const _pItem = _rowIdx === undefined || _rowIdx === null;
        delete data['_rowIdx'];
        if(_pItem){
            // case1. 添加产品
            this.setState(({detail})=>{
                return {
                    detail: [
                        ...detail,
                        data
                    ]
                }
            })
        }else{
            // case2. 修改产品
            const _d = detail.map((item, i)=>{
                if(_rowIdx === i){
                    return data
                }else{
                    return item
                }
            });
            this.setState({
                detail: _d
            })
        }
    };

    /*
    * @interface 删除一条产品记录
    * @param {object} _props 当前产品记录对象
    * */
    del = ({dependentValues, rowIdx})=>{
        const {detail = []} = this.state;
        detail.splice(rowIdx, 1);
        this.setState({
            detail: [
                ...detail
            ]
        })
    };

    render(){
        const {prefix, title, visible, style, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {confirmLoading, orderType, fileList = [],
            detail = [],listPage: {pageIndex, pageSize}, addOrderCargoModal,
            displayPDFModal} = this.state;

         // console.log(detail);

        const formItemLayout = {
            style: {margin: 0}
        };

        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );

        const fileUploadProps = {
            name: 'file',
            action: CONFIG.uploadUrl,
            headers: {
                authorization: localStorage.getItem(CONFIG.token),
            },
            showUploadList: true,
            // accept: 'application/pdf，application/x-rar-compressed, application/zip',
            listType: 'picture-card',
            fileList: fileList,
            beforeUpload: (file)=> {
                let isLegal = false;
                const patternPDF = /\.pdf$/;
                const patternRAR = /\.rar$/;
                const patternZIP = /\.zip$/;
                if(patternPDF.test(file.name) || patternRAR.test(file.name) || patternZIP.test(file.name)){
                    isLegal = true;
                }
                if (!isLegal) {
                    this.props.form.setFields({
                        orderFile: {
                            value: '',
                            errors: [new Error('请上传pdf、rar、zip格式的文件')],
                        }
                    });
                }
                return isLegal;
            },
            onRemove: (file)=>{
                // console.log(file)
/*                const codeValue = this.props.form.getFieldValue('applyBillCode');
                const fileErrors = !codeValue ? null : [new Error('你已填写审批单号，请上传审批单附件')];*/
                this.props.form.setFields({
                    [`orderFile`]: {
                        value: undefined,
                        errors: null,
                    }
                });
            },
            onPreview: (file)=>{
                // console.log(file)
                const patternPDF = /\.pdf$/;
                if(patternPDF.test(file.name.toLowerCase())) {
                    this.displayPDFModal({fileUrl: `${CONFIG.ossFileUrl}${file.filePath}`});
                }else{
                    window.open(`${CONFIG.ossFileUrl}/${file.filePath}`)
                }
            },
            onChange: (info)=> {
                let fileList = info.fileList;

                // 1. Limit the number of uploaded files
                //    Only to show two recent uploaded files, and old ones will be replaced by the new
                fileList = fileList.slice(-1);

                // 2. read from response and show file link
                fileList = fileList.map((file, i) => {
                    if (file.response) {
                        const patternPDF = /\.pdf$/;
                        const patternRAR = /\.rar$/;
                        const patternZIP = /\.zip$/;
                        // Component will show file.url as link
                        // step1. 设置文件对象属性
                        file.filePath = file.response.responseObject.filePath;
                        file.url = '';
                        if(patternPDF.test(file.name.toLowerCase())) {
                            file.thumbUrl = pdfUrl;
                        }else if(patternRAR.test(file.name.toLowerCase())){
                            file.thumbUrl = rarUrl;
                        }else if(patternZIP.test(file.name.toLowerCase())){
                            file.thumbUrl = zipUrl;
                        }else{
                            file.thumbUrl = unKnowUrl;
                        }
                        // step2. 设置文件隐藏域值和审批单号域的值
/*                        const codeValue = this.props.form.getFieldValue('applyBillCode');
                        const codeErrors = !!codeValue ? null : [new Error('你已上传审批单附件，请填写审批单号')];*/
                        this.props.form.setFields({
                            [`orderFile`]: {
                                value: file.response.responseObject.filePath,
                                errors: null
                            },
                            /*[`applyBillCode`]: {
                                value: codeValue,
                                errors: codeErrors
                            }*/
                        });
                    }
                    return file;
                });

                // 3. filter successfully uploaded files according to response from server
                fileList = fileList.filter((file) => {
                    if (file.response) {
                        return file.response.success
                    }
                    return true;
                });

                this.setState({ fileList });
            }
        };

        const ls = JSON.parse(localStorage.getItem(`${CONFIG.prefix}_${this.props.lsName}`)) || {};
        const rows = [
            [
                {
                    key: '1-1',
                    title: '单位名称',
                    required: true,
                    span: 6
                },
                {
                    key: '1-2',
                    title: '单位名称',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('companyName', {
                                    initialValue: data.companyName || ls.companyName,
                                    rules: [
                                        { required: true, message: '请输入你的单位名称' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
               /* {
                    key: '1-3',
                    title: '创建时间',
                    span: 6
                },
                {
                    key: '1-4',
                    title: '创建时间',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                }*/
            ],
            [
                {
                    key: '2-1',
                    title: '联系人',
                    required: true,
                    span: 6
                },
                {
                    key: '2-2',
                    title: '联系人',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('contact', {
                                    initialValue: data.contact || ls.contact,
                                    rules: [
                                        { required: true, message: '请输入联系人姓名' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    key: '3-1',
                    title: '联系人手机号',
                    rquired: true,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '联系人手机号',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('mobile', {
                                    initialValue: data.mobile || ls.mobile,
                                    rules: [
                                        { required: true, message: '请输入联系人手机号' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                },
            ],
            [
                {
                    key: '3-1',
                    title: '输入输出国',
                    rowHeight: 68,
                    required: true,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '输入输出国',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('country', {
                                    initialValue: data.country,
                                    rules: [
                                        { required: true, message: '请输入国家名称' },
                                    ]
                                })(
                                    <Input placeholder="请输入国家名称" // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>

                        )
                    }
                },
                {
                    key: '3-3',
                    title: '出入境情况',
                    required: true,
                    span: 6
                },
                {
                    key: '3-4',
                    title: '出入境情况',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('exitWay', {
                                    initialValue: data.exitWay,
                                    rules: [
                                        { required: true, type: 'number', message: '请选择出入境方式' },
                                    ]
                                })(
                                    <Select placeholder="请选择出入境方式">
                                        <Select.Option value={1}>入境</Select.Option>
                                        <Select.Option value={2}>出境</Select.Option>
                                    </Select>
                                )}
                            </Form.Item>

                        )
                    }
                }
            ],
            [
                {
                    key: '4-1',
                    title: '订单类型',
                    required: true,
                    span: 6
                },
                {
                    key: '4-2',
                    title: '订单类型',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('orderType', {
                                    initialValue: data.orderType || orderType,
                                    rules: [
                                        { required: true, message: '请选择订单类型' },
                                        { validator: (rule, value, callback)=>{
                                            this.state.orderType = value;
                                            callback()
                                        }}
                                    ]
                                })(
                                    <Select
                                        style={{width: 200, display: 'block'}}
                                        placeholder="请选择订单类型"
                                        allowClear={true}
                                        multiple={false}
                                        combobox={false}
                                        tags={false}
                                        // showSearch={true}
                                        filterOption={false}
                                        optionFilterProp={`children`}
                                        // notFoundContent={`没有相关的司机`}
                                        labelInValue={false}
                                        tokenSeparators={null}>
                                        <Option value={1}>{ORDER_TYPES[1]}</Option>
                                        <Option value={2}>{ORDER_TYPES[2]}</Option>
                                    </Select>
                                )}
                                <span>
                                   <span className={cx({hidden: orderType != 1})}>
                                      <Icon
                                          type="exclamation-circle"
                                          style={{color: '#ffac43', fontSize: 16, marginRight: 8}}/>
                                       <span className="order-type-text">委托贸易订单</span>: 由医智捷办理前置审批、对外付费、物流环节（国际运输、国内清关、国内配送）
                                   </span>
                                     <span className={cx({hidden: orderType != 2})}>
                                      <Icon
                                          type="exclamation-circle"
                                          style={{color: '#ffac43', fontSize: 16, marginRight: 8}}/>
                                         <span className="order-type-text">委托物流订单</span>: 用户自己办理前置审批及对外付费，医智捷负责物流环节（国际运输、国内清关、国内配送）
                                   </span>
                                </span>
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-1',
                    title: '收货地址',
                    required: true,
                    span: 6
                },
                {
                    key: '1-2',
                    title: '收货地址',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('receiveAddress', {
                                    initialValue: data.receiveAddress,
                                    rules: [
                                        { required: true, message: '请输入收货地址' },
                                    ]
                                })(
                                    <Input // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    key: '4-3',
                    title: <span>
                                附件
                                <span>
                                      <Icon
                                          type="exclamation-circle"
                                          style={{color: '#ffac43', fontSize: 16, marginRight: 8}}/>
                                         只支持上传PDF、RAR、ZIP格式的文件
                                </span>
                            </span>,
                    span: 6,
                    rowHeight: 130
                },
                {
                    key: '4-4',
                    title: '附件',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                <div className="file-upload-container-inline">
                                    <Upload {...fileUploadProps}>
                                        {/*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*/}
                                        {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                    {getFieldDecorator(`orderFile`, {
                                            initialValue: data.orderFile,
                                            rules: [
                                                { required: false}
                                            ],
                                            valuePropName: 'value',
                                        })(
                                            <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                                />
                                        )}
                                </div>
                            </Form.Item>

                        )
                    }
                }
            ]
        ];

        const _pagination = {
            current: pageIndex,
            pageSize: pageSize,
            total: detail.length,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: undefined,
            onShowSizeChange: (current, pageSize) => {
                console.log('Current: ', current, '; PageSize: ', pageSize);
            },
            onChange: (current) => {
                console.log('Current: ', current);
            }
        };

        const _columns = [
            {
                key: 'sn',
                name: '序号',
                width: 100,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                locked: true,
                formatter: ({dependentValues,rowIdx, value})=> {
                    return (
                        <span>{(pageIndex - 1) * pageSize + rowIdx + 1}</span>
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
                    return (
                        <span>
                            <a style={style}>
                                <Button
                                    onClick={this.add.bind(this, {type: 'edit', data: {...dependentValues, _rowIdx: rowIdx}})}
                                    title={`修改`}
                                    type="primary"
                                    shape="circle"
                                    icon="edit" />
                            </a>
                            <Popconfirm
                                placement="topLeft"
                                title={`你确定要删除这条货物记录吗？`}
                                onConfirm={this.del.bind(this, {dependentValues, rowIdx})}
                                okText="确定"
                                cancelText="取消">
                                <a style={style}>
                                    <Button
                                        title={`删除`}
                                        type="danger"
                                        shape="circle"
                                        icon="delete" />
                                </a>
                            </Popconfirm>
                        </span>
                    )
                },
               /* events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'name',
                name: '产品名称 ',
                width: 200,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'nameEn',
                name: '产品英文名称 ',
                width: 150,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
               /* formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'type',
                name: '物品类别',
                width: 150,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    let _t;
                    try{_t = itemTypes[`${value}`]['title']}catch(e){}
                    return (
                        <span>{_t}</span>
                    )
                },
               /* events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'subType',
                name: '物品种类 ',
                width: 150,
                sortable: false,
                formatter: ({dependentValues: {type},rowIdx, value, column})=> {
                    let _t;
                    try{_t = itemTypes[`${type}`]['itemTypes'][value]}catch(e){}
                    return (
                        <span>{_t}</span>
                    )
                },
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'productCount',
                name: '数量',
                width: 50,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
               /* formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'countUnit',
                name: '数量单位',
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    let _t;
                    try{_t = countUnit[`${value}`]}catch(e){}
                    return (
                        <span>{_t}</span>
                    )
                },
                /*formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'productWeight',
                name: '重量',
                sortable: false,
               /* formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'weightUnit',
                name: '重量单位',
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    let _t;
                    try{_t = weightUnit[`${value}`]}catch(e){}
                    return (
                        <span>{_t}</span>
                    )
                },
               /* formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'productValue',
                name: '货值 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
               /* formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'valueUnit',
                name: '货值单位 ',
                width: 200,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    let _t;
                    try{_t = valueUnit[`${value}`]}catch(e){}
                    return (
                        <span>{_t}</span>
                    )
                },
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
              /*  formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'manufacturer',
                name: '生产厂家 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
              /*  formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'country',
                name: '原产国 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
               /* formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'spec',
                name: '规格 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
               /* formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'compositions',
                name: '成分列表 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
               /* formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'purpose',
                name: '用途 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            }
        ];

        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="保存订单"
                cancelText="关闭"
                onOk={this.onOk}
                onCancel={this.onCancel}
                maskClosable={false}
                bodyHeight={500}
                {...props}
                >
                <div className={`${prefix}-add-order-modal`}>
                    <div className="hidden">
                        <AddOrderCargoModal
                            {...addOrderCargoModal}
                            callback={this.addCallback}/>
                        <DisplayPDFModal
                            {...displayPDFModal}
                            callback={this.displayPDFModalCallback}/>
                    </div>
                    <Alert message="申请单位基本信息" type="success" style={{margin:'10px 0 0 0'}}/>
                    <Form>
                        <Form.Item
                            {...formItemLayout}
                            style={{display: 'none'}}
                            >
                            {getFieldDecorator('id', {
                                initialValue: data.id,
                                rules: false
                            })(
                                <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )}
                        </Form.Item>
                        <BodyGridTable rows={rows}/>
                    </Form>
                    <Alert message={
                    <ButtonContainer style={{margin: 0}}>
                        <span style={{marginRight: 16}}>订单货物列表</span>
                        <AddButton onClick={this.add.bind(this, {type: 'add', data: {}})}>添加产品</AddButton>
                    </ButtonContainer>} type="success" style={{margin:'16px 0 0 0'}}/>
                    <GridTable
                        enableCellSelect={true}
                        dataSource={detail}
                        columns={_columns}
                        // onGridRowsUpdated={this.handleGridRowsUpdated}
                       /* enableRowSelect={true}
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
                        }*/
                        rowHeight={36}
                        minHeight={360}
                        // rowRenderer={RowRenderer}
                        rowScrollTimeout={0}
                        onGridSort={this.handleGridSort}
                        pagination={_pagination}
                        />
                </div>
            </ModalA>
        )
    }
}

AddOrderModal.propTypes = {
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

AddOrderModal.defaultProps = {
    prefix: 'yzh',
    lsName: 'AddOrderModalForm',
    visible: false,
    callback: noop,
};

export default Form.create()(AddOrderModal);
