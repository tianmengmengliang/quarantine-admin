import React, { Component, PropTypes } from 'react';
import faker from 'faker'
import {Form, Select, Input, Upload, Alert, Popconfirm, message, Spin, Icon, Modal} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {ModalA, BodyGridTable, GridTable, PDFViewer2, InputUpload } from '../../../../components/'
import {fetch, CONFIG} from 'antd/../../src/services/'
import {dimsMap} from '../../helpers/'
const {custom: {level}, order: {orderType}, tms: {tempType, transportType}, product: {itemTypes, countUnit, weightUnit, valueUnit}, custom: {entryExit}} = dimsMap;

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

function noop(){}

class ViewCheckNotification extends Component{

    _retInitialState = ()=>{
        return {
            detail: [],                                // 产品明细列表
            listPage: {                                 // 产品列表
                pageIndex: 1,
                pageSize: 99999
            },
            /**
             *  2017/8/4  贾鹏涛
             * */
            hexiaodanFile: {                            // 核销单文件
              _origin: {},
              fileList: []
            },
            baojiandanFile: {                           // 报检单文件
              _origin: {},
              fileList: []
            },
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
            const {details = [], hexiaodanFile, baojiandanFile,} = newData;
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

            this.setState({
                detail: [...details],
                hexiaodanFile: stateHexiaodanFile,
                baojiandanFile: stateBaojiandanFile,
            })
        }
    }

    onOk = ()=> {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }

            this.props.callback && this.props.callback({
                click: 'ok',
                data: {},
                callback: ()=>{
                   this._resetAction()
                }
            });
        });
        /* return new Promise((resolve, reject) => {
         setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
         }).catch(() => console.log('Oops errors!'));*/
    };

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        });
        this._resetAction()
    };

    render(){
        const {prefix, title, visible, style, data = {}, ...props} = this.props;
        const {confirmLoading,
            detail = [], listPage:{pageIndex, pageSize}, hexiaodanFile, baojiandanFile,} = this.state;

        // console.log(detail);

        const rows = [
            [
                {
                    key: '1-1',
                    title: '订单编号',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '订单编号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.orderCode}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '报检单号',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '报检单号',
                    span: 4,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.eciqCode}</span>
                        )
                    }
                },
                { /**---------------------报检单附件---------------------*/
                title: '报检单附件',
                  span: 1,
                  formatter: (gridMetaData)=>{
                    const {fileList} = baojiandanFile;
                    const len = fileList.length || 0;
                    const response = fileList[len - 1] && fileList[len - 1].response || {};
                    const filePath = response && response.responseObject && response.responseObject.filePath;
                    return (
                      <InputUpload status="success" value={`${filePath}`} hasRemoveIcon={false}></InputUpload>
                    /* (/(\.jpg| \.jpeg)+$/i).test(filePath) ?
                      <a
                          className={`${cx({hidden: !filePath})} filename`}
                          //  href={}
                          onClick={this.onPreviewImage.bind(this, `${CONFIG.ossFileUrl}${filePath}`)}
                          target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
                        :
                        <a
                          className={`${cx({hidden: !filePath})} filename`}
                          // href={`${CONFIG.ossFileUrl}${filePath}`}
                          onClick={()=>{PDFViewer2.open(`${CONFIG.ossFileUrl}${filePath}`)}}
                          target="_blank">{filePath ? <Icon type="file"/> : ''}</a>  */
                    )
                  }
                },
                {
                    key: '1-5',
                    title: '核销单号',
                    span: 3
                },
                {
                    key: '1-6',
                    title: '核销单号',
                    span: 4,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.writeOffBillCode}</span>
                        )
                    }
                },

                { /*--------------------------添加核销单附件-------------------------*/
                  title: '核销单附件',
                  span: 1,
                  formatter: (gridMetaData)=>{
                    const {fileList} = hexiaodanFile;
                    const len = fileList.length || 0;
                    const response = fileList[len - 1] && fileList[len - 1].response || {};
                    const filePath = response && response.responseObject && response.responseObject.filePath;
                    return (
                       <InputUpload status="success" value={`${filePath}`} hasRemoveIcon={false}></InputUpload>

                      /*
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
                          target="_blank">{filePath ? <Icon type="file"/> : ''}</a>*/
                    )
                  }
                },
            ],
            [
                {
                    key: '1-1',
                    title: '申请单位',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '申请单位',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.orgName}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '发货单位',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '发货单位',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.sender}</span>
                        )
                    }
                },
                {
                    key: '2-1',
                    title: '收货单位',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '收货单位',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.receiver}</span>
                        )
                    }
                },
            ],
            [
                {
                    key: '1-1',
                    title: '出/入境类型',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '出/入境类型',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{entryExit[data['exitEntryType']]}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '贸易国家',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '贸易国家',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.country}</span>
                        )
                    }
                },
                {
                    key: '2-1',
                    title: '出/入境口岸',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '出/入境口岸',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.entryPort}</span>
                        )
                    }
                },
            ],
            [
               /* {
                    key: '1-1',
                    title: '起运口岸',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '起运口岸',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.exitPort}</span>
                        )
                    }
                },*/
             /*   {
                    key: '1-3',
                    title: '停经口岸',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '停经口岸',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.viaPort}</span>
                        )
                    }
                },*/
                {
                    key: '2-1',
                    title: '报检口岸',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '报检口岸',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.checkPort}</span>
                        )
                    }
                },
            ],
            [
                {
                    key: '1-1',
                    title: '运输方式',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '运输方式',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{transportType[data.transportType]}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '温度要求',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '温度要求',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{tempType[data.tempType]}</span>
                        )
                    }
                },
                {
                    key: '2-1',
                    title: '特殊物品级别',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '特殊物品级别',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{level[data.level]}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-1',
                    title: '到货日期',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '到货日期',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.receivedDate ? moment(data.receivedDate).format('YYYY:MM:DD HH:mm:SS') : ''}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '合同号',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '合同号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.contractNo}</span>
                        )
                    }
                },
                {
                    key: '2-1',
                    title: '提单号',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '提单号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.ladingBillCode}</span>
                        )
                    }
                },
            ],
            [
                {
                    key: '1-1',
                    title: '存放、使用地点',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '存放、使用地点',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.address}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '3-1',
                    title: '拆解事项',
                    required: false,
                    span: 3
                },
                {
                    key: '3-2',
                    title: '拆解事项',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.noticeItem}</span>
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
                formatter: ({dependentValues,rowIdx, column})=> {
                    return (
                        <span>{(pageIndex - 1) * pageSize + rowIdx + 1}</span>
                    )
                }
            },
            {
                key: 'name',
                name: '中文名称 ',
                width: 200,
                sortable: false,
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
                name: '英文名称 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                // editable: true,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'type',
                name: '物品类别 ',
                width: 200,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{itemTypes[value] && itemTypes[value]['title']}</span>
                    )
                },
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                // editable: true,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'subType',
                name: '物品种类 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues: {type},rowIdx, value, column})=> {
                    return (
                        <span>{ itemTypes[type] &&
                        itemTypes[type]['itemTypes'][value]}</span>
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
                key: 'productCount',
                name: '数量 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'countUnit',
                name: '数量单位 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{countUnit[value]}</span>
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
                name: '重量 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'weightUnit',
                name: '重量单位 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{weightUnit[value]}</span>
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
                key: 'productValue',
                name: '货值 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
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
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{valueUnit[value]}</span>
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
                key: 'manufacturer',
                name: '生产厂家 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
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
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'spec',
                name: '规则 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
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
                /*formatter: IndexFormatter,
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
                width={1200}
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                onOk={this.onOk}
                onCancel={this.onCancel}
                maskClosable={false}
                footer={null}
                {...props}
                >
                <div className={`${prefix}-view-check-notification-modal`}>
                    <Alert message="查验通知单基本信息" type="success" style={{margin:'10px 0 0 0'}}/>
                    <BodyGridTable
                        rows={rows}
                        rowHeight={36}/>
                    <Alert message={'查验货物列表'} type="success" style={{margin:'16px 0 0 0'}}/>
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

ViewCheckNotification.propTypes = {
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
    prefix: PropTypes.string
};

ViewCheckNotification.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

export default Form.create()(ViewCheckNotification);
