import React, { Component, PropTypes } from 'react';
// import faker from 'faker'
import {Form, Select, Input, Upload, Alert, Popconfirm, message, Spin, Icon, Modal, Button, Radio, InputNumber, DatePicker} from 'antd'
import cx from 'classnames'
import moment from 'moment'
import {ModalA, BodyGridTable, GridTable, ButtonContainer, AddButton, UploadButton, PDFViewer2} from '../../../../components/'
import AddOrderCargoModal from './AddOrderCargoModal.jsx'
import DisplayPDFModal from './DisplayPDFModal.jsx'
import {fetch, CONFIG} from 'antd/../../src/services/'
import './addCheckOrderModal.less'
import {dimsMap} from '../../helpers/'
const {order: {takeType: TAKE_TYPE, orderType : ORDER_TYPES}, tms: {tempType: TEMP_TYPE}, product: {itemTypes, countUnit, weightUnit, valueUnit}} = dimsMap;

let _uniqueFileId = -1;
function _normalizeFileList(filePath){
    return {
        uid: _uniqueFileId--,
        name: '',
        status: 'done',
        filePath: filePath,
        response: _normalizeFileOrigin(filePath)
    }
}
function _normalizeFileOrigin(filePath){
    return {
        responseObject: {
            filePath: filePath,
            fileName: null,
            id: null,
        },
        msg: null,
        success: true
    }
}

const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};
function noop(){}

class AddCheckOrderModal extends Component{

    _retInitialState = ()=>{
        return {
            confirmLoading: false,                      // 对话框确认按钮loading状态
            hexioandaLoading: false,                    // 加载核销单信息时的status标识符
            orderType: undefined,                       // 订单类型
            takeType: undefined,                        // 提货类型
            tempType: undefined,                        // 温度类型
            minTemp: undefined,                         // 最低温度
            maxTemp: undefined,                         // 最高温度
            noticeItem: '',                             // 拆解事项
            previewVisible: false,
            exitWay: undefined,                               // 默认为1，入境，2，出境，用于修改报检单号表单域是否必填的标识符
            previewImage: undefined,
            listPage: {                                 // 货物列表
                pageIndex: 1,
                pageSize: 999,
                rows: [],
                total: 0
            },
            // selectedIds: [1, 2],
            hexiaodanFile: {                            // 核销单文件
                status: 'success',
                _origin: {},
                fileList: []
            },
            baojiandanFile: {                           // 报检单文件
                status: 'success',
                _origin: {},
                fileList: []
            },
            tidanFile: {                                // 提单文件
                status: 'success',
                _origin: {},
                fileList: []
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

    componentWillReceiveProps(nextProps = {}){
        const {data: newData, visible} = nextProps;
        const {data: oldData} = this.props;
        if(visible && newData && newData !== oldData){
            // case1.. 规则化数据
            const {hexiaodanFile, baojiandanFile, tidanFile,
                orderType, takeType, noticeItem, exitWay,
                tempType, minTemp, maxTemp, details = []} = newData;
            const stateHexiaodanFile = {
                status: 'success',
                _oringin: _normalizeFileOrigin(hexiaodanFile),
                fileList: [_normalizeFileList(hexiaodanFile)]
            };
            const stateBaojiandanFile = {
                status: 'success',
                _oringin: _normalizeFileOrigin(baojiandanFile),
                fileList: [_normalizeFileList(baojiandanFile)]
            };
            const stateTidanFile = {
                status: 'success',
                _oringin: _normalizeFileOrigin(hexiaodanFile),
                fileList: [_normalizeFileList(tidanFile)]
            }
            this.setState(({listPage})=>{
                return {
                    hexiaodanFile: stateHexiaodanFile,
                    baojiandanFile: stateBaojiandanFile,
                    tidanFile: stateTidanFile,
                    orderType,
                    exitWay,
                    takeType,
                    tempType,
                    minTemp,
                    maxTemp,
                    noticeItem,
                    listPage: {
                        ...listPage,
                        rows: details,
                        total: details.length || 0
                    }
                }
            });
        }
    }

    /*
    * @interface 设置核销单信息
    * @param {string} hexiaodanCode 核销单code
    * @param {string} dataNoticeItem 数据源noticeItem
    * */
    setHexiaodanInfo = (hexiaodanCode)=>{
        this.getHeixaodanInfo({hexiaodanCode}, (err, res)=>{
            if(err){
                message.error(err.message)
                return;
            }

            const {responseObject} = res;
            const {hexiaodan = {}, shenpidan = {}} = responseObject;
            const {noticeItem} = hexiaodan;
            this.setState({
                noticeItem
            })
            this.setProducts(res);
        })
    };

    /*
     * @interface 设置货物列表
     * @param {object} res response对象
     * */
    setProducts = (hexiaodanCode)=>{
        this.getHeixaodanInfo({hexiaodanCode}, (err, res)=>{
            if(err){
                message.error(err.message)
                return;
            }
            const {responseObject = {}} = res;
            const {details: []} = responseObject;
            this.setState(({listPage})=>{
                return {
                    listPage: {
                        ...listPage,
                        rows: details,
                        total: details.length || 0
                    }
                }
            })
        })
    };

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

    /*
    * @interface 获取指定核销单信息
    * */
    getHeixaodanInfo = ({hexiaodanCode}, callback)=>{
        fetch('ciq.ciqclient.getorghexiaodan', {
            // method: 'post',
            // headers: {},
            data: {hexiaodanCode},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    hexioandaLoading: true
                })
            },
            complete: (err, data)=>{
                this.setState({
                    hexioandaLoading: false
                })
            }
        })
    };

    /*
    * @interface 查询核销单信息
    * */
    getHeixiaoInfoClick = ()=>{
        const {hexioandaLoading} = this.state;
        // case1. 假设处于查询中
        if(hexioandaLoading){
            return
        }

        // case2. 假设不处于查询中
        this.props.form.validateFieldsAndScroll(["hexiaodanCode"], (err, values)=>{
            if (err) {
                return;
            }

            const {hexiaodanCode} = values

            // 去除所有空格
            this.getHeixaodanInfo({hexiaodanCode: hexiaodanCode.replace(/\s*/g, '')}, (err, res)=> {
                if (err) {
                    message.error(err.message)
                    return;
                }

                const {responseObject = {}} = res;
                const {hexiaodan = {}, shenpidan = {}} = responseObject;
                const {hexiaodanCode, baojianhao, country, products = []} = hexiaodan;
                const {exitWay, productPcategory, productCcategory} = shenpidan;
                const productsInfo = products.map((product)=>{
                    const {productlist = []} = product;
                    const _p = productlist[0] || {};
                    const {weightUnit, valueUnit, countUnit} = product;
                    const {writeIght, writeCont, writeVal} = _p;
                     return {
                         ...product,
                         ..._p,
                         productCount: writeCont,
                         countUnit,
                         productWeight: writeIght,
                         weightUnit,
                         productValue: writeVal,
                         valueUnit
                     }
                 });
                 /* const rows = productsInfo.map((product)=>{
                 const _p = responseObject[`productInfo_${product['productId']}`]
                 return {...product, ..._p} || {}
                 });*/
                 const details = productsInfo.map((product)=>{
                     const _p = responseObject[`productInfo_${product['productId']}`];
                     const {productCount, countUnit, productWeight, weightUnit, productValue, valueUnit} = product;
                     const {productName: name, productEnName: nameEn, pcategoryname: type, ccategoryname: subType, address: country,
                     component: compositions, manufacturer: corp, specifications: spec, purpose: purpose} = _p;
                     return {name, nameEn, type,
                     subType, productCount, countUnit,
                     productWeight, weightUnit, productValue,
                     valueUnit, country, compositions,
                     corp, spec, purpose}
                 });
                /*const productsInfo = products.map((product)=> {
                    const {productlist = []} = product;
                    const _p = productlist[0] || {};
                    return {
                        ...product,
                        ..._p
                    }
                });*/
                const rows = productsInfo.map((product)=> {
                    const _p = responseObject[`productInfo_${product['productId']}`]
                    return {...product, ..._p} || {}
                });
                this.props.form.setFields({
                    [`hexiaodanCode`]: {
                        value: hexiaodanCode,
                        error: null
                    },
                    [`country`]: {
                        value: country,
                        error: null
                    },
                    [`baojiandanCode`]: {
                        value: baojianhao,
                        error: null
                    },
                    [`exitWay`]: {
                        value: exitWay,
                        error: null
                    }
                })
                this.setState(({listPage})=> {
                    return {
                        details,
                        exitWay,
                        listPage: {
                            ...listPage,
                            rows: details,
                            total: details.length || 0
                        }
                    }
                })
            });
        })
    };

    onOk = ()=> {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                message.error(err.message || '订单填写未完整，请完善后再提交')
                return;
            }
            // console.log(values);
            // Step1、保存订单
            const {listPage: {rows = []}} = this.state;
            const {hexiaodanCode, estimatedReceiveDate} = values;
            const params = {
                ...values,
                hexiaodanCode: hexiaodanCode.replace(/\s*/g, ''),  // 去除所有空格
                estimatedReceiveDate: estimatedReceiveDate ? moment(estimatedReceiveDate).unix() *1000 : null,
                details: rows
            };
            this.submitOrder(params, (err, data)=> {
                if (!err) {
                    // case1. 保存订单成功
                    // step1. 回调
                    this.props.callback && this.props.callback({
                        click: 'ok',
                        data: params
                    });
                    // step2. 重置组件
                    this._resetAction()
                } else {
                    // case2. 保存订单失败
                    message.error(err.message ||'后台保存订单失败');
                }
            });
            // Step2、保存当前提交的订单内容到ls中
            const {lsName} = this.props;
            localStorage.setItem(`${CONFIG.prefix}_${lsName}`, JSON.stringify(values))
        });
        /* return new Promise((resolve, reject) => {
         setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
         }).catch(() => console.log('Oops errors!'));*/
    };

    onCancel = ()=> {
        // step1. 重置组件
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: {}
        });
        this._resetAction()
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
    * @interface 移除附件
    * */
    onRemove = (fieldName, filedStateName, rules = [])=>{
        let required = false, message = 'required';
        if(rules instanceof Array){
            required = rules.some((r)=>{
                return r.required
            });
            rules.some((r)=>{
                if(r.messgae){
                    message = r.message;
                    return true
                }
            })
        }
        this.props.form.setFields({
            [fieldName]: {
                value: '',
                error: required ? new Error(message) : null
            }
        });
        this.setState({
            [filedStateName]: {
                _origin: {},
                fileList: []
            }
        })
    };

    /*
    * @interface 提货方式选择change的事件处理函数
    * @param {object} e 事件对象
    * */
    onRadioCheckChange = (e)=>{
        this.setState({
            takeType: e.target.value
        })
    };

    /*
     * @interface 根据温度要求类型设置最低最高温度
     * */
    setMinDMaxTemp = (rule, value, callback)=>{
        if(value == 2){
            this.props.form.setFieldsValue({
                'minTemp': 2,
                'maxTemp': 8
            })
        }else{
            this.props.form.setFieldsValue({
                'minTemp': undefined,
                'maxTemp': undefined
            })
        }
        callback()
    };

    pdfViewerClick = (pdfUrl)=>{
        PDFViewer2.open(pdfUrl)
    };

    onPreviewImage = (imgSrc)=>{
        this.setState({
            previewVisible: true,
            previewImage: imgSrc
        })
    };

    render(){
        const {prefix, title, visible, style, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {confirmLoading, orderType, takeType,
            tempType, minTemp, maxTemp,
            hexioandaLoading,
            listPage: {pageIndex, pageSize, rows: dataSource, total},
            hexiaodanFile, baojiandanFile, tidanFile,
            displayPDFModal, exitWay} = this.state;

        // console.log(detail);
        // console.log(data)

        // console.log(this.state.listPage)

        const formItemLayout = {
            style: {margin: 0}
        };

        const hexiaodanFileUploadProps = {
            name: 'file',
            action: CONFIG.uploadUrl,
            headers: {
                authorization: localStorage.getItem(CONFIG.token),
            },
            showUploadList: false,
            // accept: 'application/pdf，application/x-rar-compressed, application/zip',
            listType: 'text',
            fileList: hexiaodanFile['fileList'],
            beforeUpload: (file)=> {
                let isValid = false;
                const pdfPattern = /\.pdf$/i;
                const jpgPattern = /\.jpg$/i;
                if(pdfPattern.test(file.name.toLowerCase()) || jpgPattern.test(file.name.toLowerCase())){
                    isValid = true;
                }
                if(!isValid){
                    this.props.form.setFields({
                        [`hexiaodanFile`]: {
                            value: undefined,
                            errors: [new Error('无效的文件格式，只支持PDF、JPG格式的文件')]
                        }
                    });
                }
                return isValid;
            },
            onChange: (info)=> {
                let fileList = info.fileList;

                // 1. Limit the number of uploaded files
                //    Only to show two recent uploaded files, and old ones will be replaced by the new
                fileList = fileList.slice(-1);

                // 2. filter successfully uploaded files according to response from server
                fileList = fileList.filter((file) => {
                    if (file.response) {
                        console.log(file)
                        if(file.response.success) {
                            this.props.form.setFields({
                                [`hexiaodanFile`]: {
                                    value: file.response.responseObject.filePath,
                                    errors: null
                                }
                            });
                        }else{
                            this.props.form.setFields({
                                [`hexiaodanFile`]: {
                                    value: undefined,
                                    errors: null
                                }
                            });
                        }
                        // return file.response.success
                    }
                    return true;
                });

                this.setState({
                    hexiaodanFile: {
                        status: fileList[fileList.length - 1].response ?
                                fileList[fileList.length - 1].response.success ? 'success' : 'error' :
                                'loading',
                        _origin: fileList[fileList.length - 1].response || {},
                        fileList: fileList
                    }
                });
            }
        };
        const baojiandanFileUploadProps = {
            name: 'file',
            action: CONFIG.uploadUrl,
            headers: {
                authorization: localStorage.getItem(CONFIG.token),
            },
            showUploadList: false,
            // accept: 'application/pdf，application/x-rar-compressed, application/zip',
            listType: 'text',
            fileList: baojiandanFile['fileList'],
            beforeUpload: (file)=> {
                let isValid = false;
                const pdfPattern = /\.pdf$/i;
                const jpgPattern = /\.jpg$/i;
                if(pdfPattern.test(file.name.toLowerCase()) || jpgPattern.test(file.name.toLowerCase())){
                    isValid = true;
                }

                if(!isValid){
                    this.props.form.setFields({
                        [`baojiandanFile`]: {
                            value: undefined,
                            errors: [new Error('无效的文件格式，只支持PDF、JPG格式的文件')]
                        }
                    });
                }

                return isValid;
            },
            onChange: (info)=> {
                let fileList = info.fileList;

                // 1. Limit the number of uploaded files
                //    Only to show two recent uploaded files, and old ones will be replaced by the new
                fileList = fileList.slice(-1);

                // 2. filter successfully uploaded files according to response from server
                fileList = fileList.filter((file) => {
                    if (file.response) {
                        if(file.response.success) {
                            this.props.form.setFields({
                                [`baojiandanFile`]: {
                                    value: file.response.responseObject.filePath,
                                    errors: null
                                }
                            });
                        }else{
                            this.props.form.setFields({
                                [`baojiandanFile`]: {
                                    value: undefined,
                                    errors: null
                                }
                            });
                        }
                        // return file.response.success
                    }
                    return true;
                });

                this.setState({
                    baojiandanFile: {
                        status: fileList[fileList.length - 1].response ?
                            fileList[fileList.length - 1].response.success ? 'success' : 'error' :
                            'loading',
                        _origin: fileList[fileList.length - 1].response || {},
                        fileList: fileList
                    }
                });
            }
        };
        const tidanFileUploadProps = {
            name: 'file',
            action: CONFIG.uploadUrl,
            headers: {
                authorization: localStorage.getItem(CONFIG.token),
            },
            showUploadList: false,
            // accept: 'application/pdf，application/x-rar-compressed, application/zip',
            listType: 'text',
            fileList: tidanFile['fileList'],
            beforeUpload: (file)=> {
                return true;
            },
            onChange: (info)=> {
                let fileList = info.fileList;

                // 1. Limit the number of uploaded files
                //    Only to show two recent uploaded files, and old ones will be replaced by the new
                fileList = fileList.slice(-1);

                // 2. filter successfully uploaded files according to response from server
                fileList = fileList.filter((file) => {
                    if (file.response) {
                        if(file.response.success) {
                            this.props.form.setFields({
                                [`tidanFile`]: {
                                    value: file.response.responseObject.filePath,
                                    errors: null
                                }
                            });
                        }else{
                            this.props.form.setFields({
                                [`tidanFile`]: {
                                    value: undefined,
                                    errors: null
                                }
                            });
                        }
                        // return file.response.success
                    }
                    return true;
                });

                this.setState({
                    tidanFile: {
                        status: fileList[fileList.length - 1].response ?
                            fileList[fileList.length - 1].response.success ? 'success' : 'error' :
                            'loading',
                        _origin: fileList[fileList.length - 1].response || {},
                        fileList: fileList
                    }
                });
            }
        };

        const _pagination = {
            current: pageIndex,
            pageSize: pageSize,
            total: total,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: undefined,
            onShowSizeChange: (current, pageSize) => {
                console.log('Current: ', current, '; PageSize: ', pageSize);
            },
            onChange: (current) => {

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
                key: 'corp',
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
            /*{
                key: 'component',
                name: '成分列表 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /!* formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },*/
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

        // console.log(hexiaodanFile)

        const ls = JSON.parse(localStorage.getItem(`${CONFIG.user}`)) || {};
        const rows = [
            [
                {
                    title: '核销单号',
                    rowHeight: 68,
                    required: true,
                    span: 6
                },
                {
                    title: '核销单号',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                style={{width: 190}}
                                >
                                {getFieldDecorator('hexiaodanCode', {
                                    initialValue: data.hexiaodanCode,
                                    rules: [
                                        { required: true, message: '请输入核销单号' },
                                    ]
                                })(
                                    <Input placeholder="请输入核销单号" // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                                <Button
                                    style={{marginLeft: 8}}
                                    type="primary"
                                    shape="circle"
                                    onClick={this.getHeixiaoInfoClick}
                                    icon={hexioandaLoading ? 'loading' : "search"} />
                            </Form.Item>

                        )
                    }
                },
                {
                    title: '核销单附件(只支持PDF、JPG格式的文件)',
                    required: true,
                    span: 6
                },
                {
                    title: '核销单附件',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        const {fileList} = hexiaodanFile;
                        const len = fileList.length || 0;
                        const response = fileList[len - 1] && fileList[len - 1].response || {};
                        const filePath = response && response.responseObject && response.responseObject.filePath;
                        const rules = [
                            { required: true, message: '请上传核销单附件'}
                        ];
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                <div className="file-upload-container-inline">
                                    <Upload {...hexiaodanFileUploadProps}>
                                        {<UploadButton>上传</UploadButton>}
                                        {/*fileList.length >= 1 ? null : uploadButton*/}
                                    </Upload>
                                    {/*<img
                                        title={`${filePath}`}
                                        onClick={this.onPreviewImage.bind(this, `${CONFIG.ossFileUrl}${filePath}`)}
                                        src={`${CONFIG.ossFileUrl}${filePath}`}
                                        style={{width: 80}}
                                        className="previewImage"/>*/}
                                    {
                                        hexiaodanFile.status === 'success' ?
                                            (/(\.jpg| \.jpeg)+$/i).test(filePath) ?
                                            <span className="file-view">
                                              <a
                                                  className={`${cx({hidden: !filePath})} filename`}
                                                  //  href={`${CONFIG.ossFileUrl}${filePath}`}
                                                  onClick={this.onPreviewImage.bind(this, `${CONFIG.ossFileUrl}${filePath}`)}
                                                  target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
                                            <Icon
                                                type="close"
                                                onClick={this.onRemove.bind(this, 'hexiaodanFile', 'hexiaodanFile', rules)}
                                                className="file-upload-remove-icon"/>
                                        </span>
                                            :
                                        <span className="file-view">
                                              <a
                                                  className={`${cx({hidden: !filePath})} filename`}
                                                  //  href={`${CONFIG.ossFileUrl}${filePath}`}
                                                  onClick={this.pdfViewerClick.bind(this, `${CONFIG.ossFileUrl}${filePath}`)}
                                                  target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
                                            <Icon
                                                type="close"
                                                onClick={this.onRemove.bind(this, 'hexiaodanFile', 'hexiaodanFile', rules)}
                                                className="file-upload-remove-icon"/>
                                        </span>
                                    :
                                        hexiaodanFile.status === 'loading' ?
                                            <span className="file-view">
                                                  <Icon
                                                      className="status-icon status-loading-icon"
                                                      type="loading"
                                                     />
                                                <a className="status-text status-loading-text">上传中...</a>
                                            </span> :
                                        hexiaodanFile.status === 'error' ?
                                            <span className="file-view">
                                                <div>
                                                  <Icon
                                                      className="status-icon status-error-icon"
                                                      type="close-square-o"
                                                      />
                                                </div>
                                                    <span className="status-text status-text-error">上传失败！请重新上传</span>
                                            </span> : ''
                                    }
                                    {getFieldDecorator(`hexiaodanFile`, {
                                        initialValue: data.hexiaodanFile,
                                        rules: rules,
                                        valuePropName: 'value',
                                    })(
                                        <Input type="hidden" style={{ marginLeft: '-78px'}}
                                            />
                                    )}
                                </div>
                            </Form.Item>

                        )
                    }
                }
            ],
            [
                {
                    title: '报检单号',
                    rowHeight: 68,
                    required: exitWay == 2 ? false : true,
                    span: 6
                },
                {
                    title: '报检单号',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('baojiandanCode', {
                                    initialValue: data.baojiandanCode,
                                    rules: [
                                        { required: exitWay == 2 ? false : true, message: '请输入报检单号' },
                                    ]
                                })(
                                    <Input placeholder="请输入报检单号" // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>

                        )
                    }
                },
                {
                    title: '报检单附件(只支持PDF、JPG格式的文件)',
                    required: true,
                    span: 6
                },
                {
                    title: '报检单附件',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        const {fileList} = baojiandanFile;
                        const len = fileList.length || 0;
                        const response = fileList[len - 1] && fileList[len - 1].response || {};
                        const filePath = response && response.responseObject && response.responseObject.filePath;
                        const rules = [
                            { required: true, message: '请上传报检单附件'}
                        ];
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                <div className="file-upload-container-inline">
                                    <Upload {...baojiandanFileUploadProps}>
                                        {<UploadButton>上传</UploadButton>}
                                        {/*fileList.length >= 1 ? null : uploadButton*/}
                                    </Upload>
                                    {
                                        baojiandanFile.status === 'success' ?
                                            <span className="file-view">
                                              <a
                                                  className={`${cx({hidden: !filePath})} filename`}
                                                  // href={`${CONFIG.ossFileUrl}${filePath}`}
                                                  onClick={this.pdfViewerClick.bind(this, `${CONFIG.ossFileUrl}${filePath}`)}
                                                  target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
                                            <Icon
                                                type="close"
                                                onClick={this.onRemove.bind(this, 'baojiandanFile', 'baojiandanFile', rules)}
                                                className="file-upload-remove-icon"/>
                                        </span> :
                                            baojiandanFile.status === 'loading' ?
                                                <span className="file-view">
                                                  <Icon
                                                      className="status-icon"
                                                      type="loading"
                                                      />
                                                <a className="status-text status-loading-text">上传中...</a>
                                            </span> :
                                                baojiandanFile.status === 'error' ?
                                                    <span className="file-view">
                                                        <div>
                                                          <Icon
                                                              className="status-icon"
                                                              type="close-square-o"
                                                              />
                                                        </div>
                                                    <span className="status-text status-text-error">上传失败！请重新上传</span>
                                            </span> : ''
                                    }
                                    {getFieldDecorator(`baojiandanFile`, {
                                        initialValue: data.baojiandanFile,
                                        rules: rules,
                                        valuePropName: 'value',
                                    })(
                                        <Input type="hidden" style={{ marginLeft: '-78px'}}
                                            />
                                    )}
                                </div>
                            </Form.Item>

                        )
                    }
                }
            ],
          /*  [
             {
             title: '提单号',
             rowHeight: 68,
             required: false,
             span: 6
             },
             {
             title: '提单号',
             span: 6,
             formatter: (gridMetaData)=>{
             return (
             <Form.Item
             {...formItemLayout}
             >
             {getFieldDecorator('tidanCode', {
             initialValue: data.tidanCode,
             rules: [
             { required: false, message: '请输入提单号' },
             ]
             })(
             <Input placeholder="请输入提单号" // style={{ width: '65%', marginRight: '3%' }}
             />
             )}
             </Form.Item>

             )
             }
             },
             {
             title: '提单附件',
             span: 6
             },
             {
             title: '提单附件',
             span: 6,
             formatter: (gridMetaData)=>{
             const {fileList} = tidanFile;
             const len = fileList.length || 0;
             const response = fileList[len - 1] && fileList[len - 1].response || {};
             const filePath = response && response.responseObject && response.responseObject.filePath;
             const rules = [
             { required: false, message: ''}
             ];
             return (
             <Form.Item
             {...formItemLayout}
             >
             <div className="file-upload-container-inline">
             <Upload {...tidanFileUploadProps}>
             {<UploadButton>上传</UploadButton>}
             {/!*fileList.length >= 1 ? null : uploadButton*!/}
             </Upload>
             {
             tidanFile.status === 'success' ?
             <span className="file-view">
             <a
             className={`${cx({hidden: !filePath})} filename`}
             href={`${CONFIG.ossFileUrl}${filePath}`}
             target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
             <Icon
             type="close"
             onClick={this.onRemove.bind(this, 'tidanFile', 'tidanFile', rules)}
             className="file-upload-remove-icon"/>
             </span> :
             tidanFile.status === 'loading' ?
             <span className="file-view">
             <Icon
             className="status-icon"
             type="loading"
             />
             <a className="status-text status-loading-text">上传中...</a>
             </span> :
             tidanFile.status === 'error' ?
             <span className="file-view">
             <Icon
             className="status-icon"
             type="close-square-o"
             />
             <span className="status-text status-text-error">上传失败！请重新上传</span>
             </span> : ''
             }
             {getFieldDecorator(`tidanFile`, {
             initialValue: data.tidanFile,
             rules: rules,
             valuePropName: 'value',
             })(
             <Input type="hidden" style={{ marginLeft: '-78px'}}
             />
             )}
             </div>
             </Form.Item>

             )
             }
             }
             ],*/
      /*      [
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
                /!* {
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
                 }*!/
            ],*/
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
                                    initialValue: data.contact || ls.realName,
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
                    title: '联系电话',
                    required: true,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '联系电话',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('mobile', {
                                    initialValue: data.mobile || ls.phone,
                                    rules: [
                                        { required: true, message: '请输入联系电话' },
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
                    title: '输入输出国(地区)',
                    rowHeight: 68,
                    required: true,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '输入输出国(地区)',
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
                    title: '出入境方式',
                    required: true,
                    span: 6
                },
                {
                    key: '3-4',
                    title: '出入境方式',
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
                                    <Select
                                        allowClear
                                        placeholder="请选择出入境方式"
                                        onChange={(value)=>{this.setState({exitWay: value})}}>
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
                    key: '1-1',
                    title: '提货方式',
                    required: true,
                    span: 6
                },
                {
                    key: '1-2',
                    title: '提货方式',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('takeType', {
                                    initialValue: data.takeType,
                                    valuePropName: 'value',
                                    rules: [
                                        { required: true, message: '请选择提货方式' },
                                    ]
                                })(
                                    <Radio.Group onChange={this.onRadioCheckChange}>
                                        <Radio value={1}>{TAKE_TYPE[1]}</Radio>
                                        <Radio value={2}>{TAKE_TYPE[2]}</Radio>
                                    </Radio.Group>
                                )}
                            </Form.Item>
                        )
                    }
                },
                {
                    key: '1-1',
                    title: '预计收货日期',
                    required: false,
                    span: 6
                },
                {
                    key: '1-2',
                    title: '预计收货日期',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('estimatedReceiveDate', {
                                    initialValue: data.estimatedReceiveDate ? moment(data.estimatedReceiveDate): undefined,
                                    rules: [
                                        { required: false, message: '请选择预计收货日期' },
                                    ]
                                })(
                                    <DatePicker
                                        allowClear
                                        showTime={false}
                                        format="YYYY-MM-DD"
                                        placeholder="请选择预计收货日期"/>
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],
            [
                {
                    key: '3-1',
                    title: '温度要求',
                    rowHeight: 68,
                    required: false,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '温度要求',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                <span style={{marginRight: 24}}>
                                    <span style={{marginRight: 4}}>温度类型：</span>
                                    {getFieldDecorator('tempType', {
                                        initialValue: tempType,
                                        rules: [
                                            { required: false, type: 'number', message: '请选择温度要求' },
                                            {validator: this.setMinDMaxTemp}
                                        ]
                                    })(
                                        <Select
                                            style={{width: 150}}
                                            placeholder="请选择温度要求"
                                            allowClear={true}
                                            multiple={false}
                                            combobox={false}
                                            tags={false}
                                            showSearch={false}
                                            filterOption={false}
                                            optionFilterProp={`children`}
                                            // notFoundContent={`没有相关的司机`}
                                            labelInValue={false}
                                            tokenSeparators={null}>
                                            <Select.Option value={1}>{TEMP_TYPE[1]}</Select.Option>
                                            <Select.Option value={2}>{TEMP_TYPE[2]}</Select.Option>
                                            <Select.Option value={3}>{TEMP_TYPE[3]}</Select.Option>
                                        </Select>
                                    )}
                                </span>
                                 <span style={{marginRight: 8}}>
                                    <span style={{marginRight: 4}}>最高温度：</span>
                                     {getFieldDecorator('maxTemp', {
                                         initialValue: maxTemp || undefined,
                                         rules: [
                                             { required: false, type: 'number', message: '请输入数字' },
                                         ]
                                     })(
                                         <InputNumber
                                             placeholder="请输入最高温度"
                                             style={{width: 150}}/>
                                     )}
                                     <span>℃</span>
                                </span>
                                 <span style={{marginRight: 8}}>
                                    <span style={{marginRight: 4}}>最低温度：</span>
                                     {getFieldDecorator('minTemp', {
                                         initialValue: minTemp || undefined,
                                         rules: [
                                             { required: false, type: 'number', message: '请输入最低温度' },
                                         ]
                                     })(
                                         <InputNumber
                                             placeholder="请输入最低温度"
                                             style={{width: 150}}/>
                                     )}
                                     <span>℃</span>
                                </span>
                            </Form.Item>

                        )
                    }
                }
            ],
            [
                {
                    key: '3-1',
                    title: '货物件数',
                    rowHeight: 68,
                    required: false,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '货物件数',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('packageCount', {
                                    initialValue: data.packageCount || undefined,
                                    rules: [
                                        { required: false, type: 'number', message: '请输入数字' },
                                    ]
                                })(
                                    <InputNumber
                                        placeholder="请输入货物件数"
                                        style={{width: 150}}/>
                                )}
                            </Form.Item>

                        )
                    }
                },
                {
                    key: '3-1',
                    title: '备注',
                    rowHeight: 68,
                    required: false,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '备注',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('remark', {
                                    initialValue: data.remark,
                                    rules: [
                                        { required: false, message: '请输入备注' },
                                    ]
                                })(
                                    <Input
                                        type="textarea"
                                        autosize={{ minRows: 2, maxRows: 6 }}
                                        placeholder="请输入备注"
                                       // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>

                        )
                    }
                }
            ],
            [
                {
                    key: '3-1',
                    title: '货物尺寸',
                    rowHeight: 68,
                    required: false,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '货物尺寸',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        const addonAfter = (<span>厘米(cm)</span>);
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                <span style={{marginRight: 8}}>
                                    <span style={{marginRight: 4}}>长：</span>
                                    {getFieldDecorator('length', {
                                        initialValue: data.length,
                                        rules: [
                                            { required: false, message: '请输入货物尺寸的长度' },
                                        ]
                                    })(
                                        <Input
                                            placeholder="请输入货物尺寸的长度"
                                            style={{width: 150}}// style={{ width: '65%', marginRight: '3%' }}
                                            />
                                    )}
                                    <span>{addonAfter}</span>
                                </span>
                                 <span style={{marginRight: 8}}>
                                    <span style={{marginRight: 4}}>宽：</span>
                                     {getFieldDecorator('width', {
                                         initialValue: data.width,
                                         rules: [
                                             { required: false, message: '请输入货物尺寸的宽度' },
                                         ]
                                     })(
                                         <Input
                                             placeholder="请输入货物尺寸的宽度"
                                             style={{width: 150}}// style={{ width: '65%', marginRight: '3%' }}
                                             />
                                     )}
                                     <span>{addonAfter}</span>
                                </span>
                                 <span style={{marginRight: 8}}>
                                    <span style={{marginRight: 4}}>高：</span>
                                     {getFieldDecorator('height', {
                                         initialValue: data.height,
                                         rules: [
                                             { required: false, message: '请输入货物尺寸的高度' },
                                         ]
                                     })(
                                         <Input
                                             placeholder="请输入货物尺寸的高度"
                                             style={{width: 150}}// style={{ width: '65%', marginRight: '3%' }}
                                             />
                                     )}
                                     <span>{addonAfter}</span>
                                </span>
                            </Form.Item>

                        )
                    }
                },
            ],
            [
                {
                    key: '3-1',
                    title: '拆解事项',
                    rowHeight: 68,
                    required: false,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '拆解事项',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('noticeItem', {
                                    initialValue: data.noticeItem,
                                    rules: false
                                })(
                                    <Input
                                        type="textarea"
                                        autosize={{ minRows: 2, maxRows: 6 }}
                                        placeholder="请输入拆解事项"
                                        // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>

                        )
                    }
                }
            ]
           /* [
                {
                    key: '1-1',
                    title: '提货地址',
                    required: true,
                    span: 6
                },
                {
                    key: '1-2',
                    title: '提货地址',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <Form.Item
                                {...formItemLayout}
                                >
                                {getFieldDecorator('takeAddress', {
                                    initialValue: data.takeAddress,
                                    rules: [
                                        { required: true, message: '请输入提货地址' },
                                    ]
                                })(
                                    <Input placeholder="查验前，货物从哪里来"// style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
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
                                    <Input placeholder="查验后，货物往哪里去"// style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        )
                    }
                }
            ],*/
        ];
        const takeAddress = [
            {
                key: '1-1',
                title: '提货地址',
                required: true,
                span: 6
            },
            {
                key: '1-2',
                title: '提货地址',
                span: 18,
                formatter: (gridMetaData)=> {
                    return (
                        <Form.Item
                            >
                            {getFieldDecorator('takeAddress', {
                                initialValue: data.takeAddress,
                                rules: [
                                    {required: true, message: '请输入提货地址'},
                                ]
                            })(
                                <Input
                                    placeholder="请输入提货地址"// style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )}
                        </Form.Item>
                    )
                }
            }
        ];
        const spliceItems = takeType == 2 ? rows.splice(5, 0, takeAddress) : []

        return (
            <ModalA
                width={1080}
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="保存订单"
                cancelText="关闭"
                onOk={this.onOk}
                onCancel={this.onCancel}
                maskClosable={false}
                // bodyHeight={900}
                // bodyHeight={500}
                {...props}
                >
                <Modal
                    width={1000}
                    visible={this.state.previewVisible}
                    footer={null}
                    onCancel={()=>{this.setState({ previewVisible: false })}}>
                    <img alt="图片" style={{ width: '100%' }} src={this.state.previewImage} />
                </Modal>
                <div className={`${prefix}-add-order-modal`}>
                    <div className="hidden">
                        <DisplayPDFModal
                            {...displayPDFModal}
                            callback={this.displayPDFModalCallback}/>
                    </div>
                    <Alert message="订单基本信息" type="success" style={{margin:'10px 0 0 0'}}/>
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
                            {getFieldDecorator('orderType', {
                                initialValue: data.orderType || 3,
                                rules: false
                            })(
                                <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )}
                        </Form.Item>
                        <BodyGridTable rows={rows}/>
                    </Form>
                    <Alert message="货物基本信息" type="success" style={{margin:'10px 0 0 0'}}/>
                    <GridTable
                        tableLoading={hexioandaLoading}
                        // enableCellSelect={true}
                        dataSource={dataSource}
                        columns={_columns}
                        onGridRowsUpdated={this.handleGridRowsUpdated}
                       /* enableRowSelect={true}
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

AddCheckOrderModal.propTypes = {
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

AddCheckOrderModal.defaultProps = {
    prefix: 'yzh',
    lsName: 'AddOrderModalForm',
    visible: false,
    callback: noop,
};

export default Form.create()(AddCheckOrderModal);
