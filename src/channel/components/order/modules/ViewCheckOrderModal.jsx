import React, { Component, PropTypes } from 'react';
// import faker from 'faker'
import {Form, Select, Input, Upload, Alert, Popconfirm, message, Spin, Icon, Modal, Button} from 'antd'
import cx from 'classnames'
import moment from 'moment'
import {ModalA, BodyGridTable, GridTable, ButtonContainer, AddButton, UploadButton, PDFViewer2} from '../../../../components/'
import AddOrderCargoModal from './AddOrderCargoModal.jsx'
import DisplayPDFModal from './DisplayPDFModal.jsx'
import {fetch, CONFIG} from 'antd/../../src/services/'
import './viewCheckOrderModal.less'
import {dimsMap} from '../../helpers/'
const {custom: {entryExit}, order: {takeType: TAKE_TYPE, orderType : ORDER_TYPES}, tms: {tempType: TEMP_TYPE}, product: {itemTypes, countUnit, weightUnit, valueUnit}} = dimsMap;

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

class ViewCheckOrderModal extends Component{

    _retInitialState = ()=>{
        return {
            confirmLoading: false,                      // 对话框确认按钮loading状态
            hexioandaLoading: false,                    // 货物列表加载状态
            orderType: undefined,                       // 订单类型
            takeType: undefined,                        // 提货方式
            listPage: {                                 // 货物列表
                pageIndex: 1,
                pageSize: 999,
                rows: [],
                total: 0
            },
            // selectedIds: [1, 2],
            hexiaodanFile: {                            // 核销单文件
                _origin: {},
                fileList: []
            },
            baojiandanFile: {                           // 报检单文件
                _origin: {},
                fileList: []
            },
            tidanFile: {                                // 提单文件
                _origin: {},
                fileList: []
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
                orderType, takeType, noticeItem,
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
     * @interface 设置货物列表
     * @param {string} hexiadanCode 核销单号
     * */
    setProducts = (hexiaodanCode)=>{
        this.getHeixaodanInfo({hexiaodanCode}, (err, res)=>{
            if(err){
                message.error(err.message)
                return;
            }

            const {responseObject = {}} = res;
            const {hexiaodan = {}, shenpidan = {}} = responseObject;
            const {products = []} = hexiaodan;
            const productsInfo = products.map((product)=>{
                const {productlist = []} = product;
                const _p = productlist[0] || {};
                return {
                    ...product,
                    ..._p
                }
            });
            const rows = productsInfo.map((product)=>{
                const _p = responseObject[`productInfo_${product['productId']}`]
                return {...product, ..._p} || {}
            });
            this.setState(({listPage})=>{
                return {
                    listPage: {
                        ...listPage,
                        rows,
                        total: rows.length || 0
                    }
                }
            })
        })
    };

    onOk = ()=> {
        // step1. 重置组件
        this.props.callback && this.props.callback({
            click: 'ok',
            data: {}
        });
        this._resetAction()
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
            hexioandaLoading, listPage: {pageIndex, pageSize, rows: dataSource, total},
            hexiaodanFile, baojiandanFile, tidanFile,
            displayPDFModal} = this.state;

        // console.log(detail);

        const formItemLayout = {
            style: {margin: 0}
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

/*        const _columns = [
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
                /!*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },
            {
                key: 'productName',
                name: '产品名称 ',
                width: 200,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /!*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },
            {
                key: 'productEnName',
                name: '产品英文名称 ',
                width: 150,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /!* formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },
            {
                key: 'pcategoryname',
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
                /!* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },
            {
                key: 'ccategoryname',
                name: '物品种类 ',
                width: 150,
                sortable: false,
                formatter: ({dependentValues: {pcategoryname},rowIdx, value, column})=> {
                    let _t;
                    try{_t = itemTypes[`${pcategoryname}`]['itemTypes'][value]}catch(e){}
                    return (
                        <span>{_t}</span>
                    )
                },
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /!*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },
            {
                key: 'writeCont',
                name: '数量',
                width: 50,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /!* formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
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
                /!*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },
            {
                key: 'writeIght',
                name: '重量',
                sortable: false,
                /!* formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
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
                /!* formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },
            {
                key: 'writeVal',
                name: '货值 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /!* formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
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
                /!*  formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },
            {
                key: 'corp',
                name: '生产厂家 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /!*  formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },
            {
                key: 'address',
                name: '原产国 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /!* formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },
            {
                key: 'specifications',
                name: '规格 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /!* formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            },
            /!*{
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
             },*!/
            {
                key: 'purpose',
                name: '用途 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /!*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*!/
            }
        ];*/
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
                            <span>{data.hexiaodanCode}</span>
                        )
                    }
                },
                {
                    title: '核销单附件',
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
                        return (
                            (/(\.jpg| \.jpeg)+$/i).test(filePath) ?
                                <a
                                    className={`${cx({hidden: !filePath})} filename`}
                                    //  href={`${CONFIG.ossFileUrl}${filePath}`}
                                    onClick={this.onPreviewImage.bind(this, `${CONFIG.ossFileUrl}${filePath}`)}
                                    target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
                                :
                            <a
                                className={`${cx({hidden: !filePath})} filename`}
                                // href={`${CONFIG.ossFileUrl}${filePath}`}
                                onClick={()=>{PDFViewer2.open(`${CONFIG.ossFileUrl}${filePath}`)}}
                                target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
                        )
                    }
                }
            ],
            [
                {
                    title: '报检单号',
                    rowHeight: 68,
                    required: true,
                    span: 6
                },
                {
                    title: '报检单号',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.baojiandanCode}</span>
                        )
                    }
                },
                {
                    title: '报检单附件',
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
                        return (
                            (/(\.jpg| \.jpeg)+$/i).test(filePath) ?
                                <a
                                    className={`${cx({hidden: !filePath})} filename`}
                                    //  href={`${CONFIG.ossFileUrl}${filePath}`}
                                    onClick={this.onPreviewImage.bind(this, `${CONFIG.ossFileUrl}${filePath}`)}
                                    target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
                                :
                            <a
                                className={`${cx({hidden: !filePath})} filename`}
                                // href={`${CONFIG.ossFileUrl}${filePath}`}
                                onClick={()=>{PDFViewer2.open(`${CONFIG.ossFileUrl}${filePath}`)}}
                                target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
                        )
                    }
                }
            ],
            /*[
                {
                    title: '提单号',
                    rowHeight: 68,
                    span: 6
                },
                {
                    title: '提单号',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.tidanCode}</span>
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
                        return (
                            <a
                                className={`${cx({hidden: !filePath})} filename`}
                                href={`${CONFIG.ossFileUrl}${filePath}`}
                                target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
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
                            <span>{data.companyName}</span>
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
                            <span>{data.contact}</span>
                        )
                    }
                },
                {
                    key: '3-1',
                    title: '联系人手机号',
                    required: true,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '联系人手机号',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.mobile}</span>
                        )
                    }
                },
            ],
            [
                {
                    key: '3-1',
                    title: '输入输出国(地区)',
                    required: true,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '输入输出国(地区)',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.country}</span>
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
                            <span>{entryExit[data.exitWay]}</span>
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
                           <span>{TAKE_TYPE[data.takeType]}</span>
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
                           <span>{data.estimatedReceiveDate ?
                           moment(data.estimatedReceiveDate).format("YYYY-MM-DD") :
                           ''}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '3-1',
                    title: '温度要求',
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
                                    <span>{TEMP_TYPE[data.tempType]}</span>
                                </span>
                                 <span style={{marginRight: 8}}>
                                    <span style={{marginRight: 4}}>最高温度：</span>
                                    <span>{data.maxTemp ? `${data.maxTemp}℃` : ''}</span>
                                </span>
                                 <span style={{marginRight: 8}}>
                                    <span style={{marginRight: 4}}>最低温度：</span>
                                    <span>{data.minTemp ? `${data.minTemp}℃` : ''}</span>
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
                    required: false,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '货物件数',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.packageCount}</span>
                        )
                    }
                },
                {
                    key: '3-1',
                    title: '备注',
                    rowHeight: 60,
                    required: false,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '备注',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <div style={{height: "100%", width: '100%', overflow: 'auto', whiteSpace: 'normal', lineHeight: '1.2em'}}>
                                {data.remark}
                            </div>
                        )
                    }
                }
            ],
            [
                {
                    key: '3-1',
                    title: '货物尺寸',
                    required: false,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '货物尺寸',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>
                               <span style={{marginRight: 8}}>
                                   <span style={{marginRight: 4}}>长：</span>
                                   <span >{`${!data.length ? '未填' : `${data.length}厘米(cm)`}`}</span>
                               </span>
                                 <span style={{marginRight: 8}}>
                                   <span style={{marginRight: 4}}>宽：</span>
                                   <span >{`${!data.width ? '未填' : `${data.width}厘米(cm)`}`}</span>
                               </span>
                                 <span style={{marginRight: 8}}>
                                   <span style={{marginRight: 4}}>高：</span>
                                   <span >{`${!data.height ? '未填' : `${data.height}厘米(cm)`}`}</span>
                               </span>
                            </span>
                        )
                    }
                },
            ],
            [
                {
                    key: '3-1',
                    title: '拆解事项',
                    required: false,
                    rowHeight: 60,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '拆解事项',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <div style={{height: "100%", width: "100%", overflow: "auto", whiteSpace: 'normal', lineHeight: '1.2em'}}>
                                {data.noticeItem}
                            </div>
                        )
                    }
                }
            ]
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
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.takeAddress}</span>
                        )
                    }
                }
            ];
        const spliceItems = takeType == 2 ? rows.splice(5, 0, takeAddress) : []

        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={`订单编号：${data.code}   核销单号：${data.hexiaodanCode} 报检单号：${data.baojiandanCode}`}
                visible={visible}
                okText="保存订单"
                cancelText="关闭"
                onOk={this.onOk}
                onCancel={this.onCancel}
                footer={null}
                maskClosable={false}
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
                <div className={`${prefix}-view-check-order-modal`}>
                    <div className="hidden">
                        <DisplayPDFModal
                            {...displayPDFModal}
                            callback={this.displayPDFModalCallback}/>
                    </div>
                    <Alert message="申请单位基本信息" type="success" style={{margin:'10px 0 0 0'}}/>
                    <Form>
                        <BodyGridTable
                            rowHeight={36}
                            rows={rows}/>
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

ViewCheckOrderModal.propTypes = {
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

ViewCheckOrderModal.defaultProps = {
    prefix: 'yzh',
    lsName: 'AddOrderModalForm',
    visible: false,
    callback: noop,
};

export default Form.create()(ViewCheckOrderModal);
