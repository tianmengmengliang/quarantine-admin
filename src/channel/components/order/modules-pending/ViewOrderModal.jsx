import React, { Component, PropTypes } from 'react';
import faker from 'faker'
import {Form, Select, Input, Upload, Alert, Popconfirm, message, Spin, Icon, Modal} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {ModalA, BodyGridTable, GridTable} from '../../../../components/'
import DisplayPDFModal from './DisplayPDFModal.jsx'
import {fetch, CONFIG} from 'antd/../../src/services/'
import pdfUrl from 'antd/../../public/assets/img/pdf.png'
import rarUrl from 'antd/../../public/assets/img/rar.png'
import zipUrl from 'antd/../../public/assets/img/zip.png'
import unKnowUrl from 'antd/../../public/assets/img/unknow.png'
import './viewOrderModal.less'
import {dimsMap} from '../../helpers/'
const {order: {orderType}, product: {itemTypes, countUnit, weightUnit, valueUnit}, custom: {entryExit}} = dimsMap;

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

const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};
function noop(){}

class ViewOrderModal extends Component{

    _retInitialState = ()=>{
        return {
            confirmLoading: false,                      // 对话框确认按钮loading状态
            detail: [],                                // 产品明细列表
            // selectedIds: [1, 2],
            listPage: {                                 // 产品列表
                pageIndex: 1,
                pageSize: 99999
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
            const {details = []} = newData;
            this.setState({
                detail: [...details],
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

    onCancel = ()=> {

        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        });
        // s1-case2 ss2. 重置组件
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
                    fileUrl
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

    onPreview = (file)=>{
        window.open(`${CONFIG.ossFileUrl}/${file.filePath}`)
       /* const patternPDF = /\.pdf$/;
        if(patternPDF.test(file.name.toLowerCase())) {
            this.displayPDFModal({fileUrl: `${CONFIG.ossFileUrl}${file.filePath}`});
        }else{
            window.open(`${CONFIG.ossFileUrl}/${file.filePath}`)
        }*/
    };

    render(){
        const {prefix, title, visible, style, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {confirmLoading,
            detail = [],listPage: {pageIndex, pageSize},
            displayPDFModal} = this.state;

        // console.log(detail);

        const formItemLayout = {
            style: {margin: 0}
        };

        const rows = [
            [
                {
                    key: '1-1',
                    title: '单位名称',
                    span: 6
                },
                {
                    key: '1-2',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                       return (
                           <span>{data.companyName}</span>
                       )
                    }
                },
                 {
                     key: '1-3',
                     title: '创建时间',
                     span: 6
                 },
                 {
                     key: '1-4',
                     title: '创建时间',
                     span: 6,
                     formatter: (gridMetaData)=>{
                         return (
                             <span>{data.createTime ? moment(data.createTime).format('YYYY:MM:DD HH:mm:SS') : ''}</span>
                         )
                     }
                 }
            ],
            [
                {
                    key: '2-1',
                    title: '联系人',
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
                    title: '输入输出国',
                    rowHeight: 68,
                    span: 6
                },
                {
                    key: '3-2',
                    title: '输入输出国',
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
                    span: 6
                },
                {
                    key: '3-4',
                    title: '出入境情况',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.exitWay ? entryExit[data.exitWay] : ''}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '4-1',
                    title: '订单类型',
                    span: 6
                },
                {
                    key: '4-2',
                    title: '订单类型',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            <span style={{fontSize: 16, color: 'red'}}>{orderType[data.orderType]}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-1',
                    title: '收货地址',
                    span: 6
                },
                {
                    key: '1-2',
                    title: '收货地址',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.receiveAddress}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '4-3',
                    title: '附件',
                    span: 6,
                    rowHeight: 130
                },
                {
                    key: '4-4',
                    title: '附件',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        const cls = cx({
                            [`picture-card`]: true,
                        });
                        const patternPDF = /\.pdf$/;
                        const patternRAR = /\.rar$/;
                        const patternZIP = /\.zip$/;
                        let imgSrc = '';
                        if(typeof data.orderFile === 'string') {
                            if (patternPDF.test(data.orderFile.toLowerCase())) {
                                imgSrc = pdfUrl
                            } else if (patternRAR.test(data.orderFile.toLowerCase())) {
                                imgSrc = rarUrl
                            } else if (patternZIP.test(data.orderFile.toLowerCase())) {
                                imgSrc = zipUrl;
                            }
                        }
                        return (
                            <div className={cls}>
                                {data.orderFile ?
                                    <div className="picture-list">
                                        <img src={imgSrc}/>
                                        <Icon
                                            type="eye-o"
                                            className="view"
                                            onClick={this.onPreview.bind(this, {name: data.orderFile, filePath: data.orderFile})}/>
                                    </div> :
                                <div className="picture-list">
                                    <Icon
                                        title="无附件"
                                        type="exclamation-circle-o"
                                        className="empty"/>
                                </div>}
                            </div>
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
                name: '重量  ',
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
                onOk={this.onOk}
                onCancel={this.onCancel}
                maskClosable={false}
                footer={null}
                {...props}
                >
                <div className="hidden">
                    <DisplayPDFModal
                        {...displayPDFModal}
                        callback={this.displayPDFModalCallback}/>
                </div>
                <div className={`${prefix}-view-order-modal`}>
                    <Alert message="申请单位基本信息" type="success" style={{margin:'10px 0 0 0'}}/>
                    <BodyGridTable rows={rows}/>
                    <Alert message={'订单货物列表'} type="success" style={{margin:'16px 0 0 0'}}/>
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

ViewOrderModal.propTypes = {
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

ViewOrderModal.defaultProps = {
    prefix: 'yzh',
    lsName: 'AddOrderModalForm',
    visible: false,
    callback: noop,
};

export default Form.create()(ViewOrderModal);
