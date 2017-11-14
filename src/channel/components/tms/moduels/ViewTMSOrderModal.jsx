import React, { Component, PropTypes } from 'react';
import {Form, Select, Upload, Icon, Input, DatePicker,
    Popconfirm, Row, Col, Button, InputNumber} from 'antd'
import moment from 'moment'
import {remove} from 'antd/../../src/utils/arrayUtils.js'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable} from '../../../../components/'
import {dimsMap} from '../../helpers/'
const {tms: {tempType}} = dimsMap

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class ViewTMSOrderModal extends Component{
    _retInitialState = ()=>{
        return {
            tableLoading: false,
            listPage: {
                pageIndex: 1,
                pageSize: 1000,
                rows: [],
                total: 0
            },
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    componentWillReceiveProps(nextProps){
        // console.log(nextProps)
        const {visible, data: {details = []}} = nextProps;
        const {data: newData} = nextProps;
        const {data: oldData} = this.props;
        if(visible && newData !== oldData) {
            this.setState(({listPage})=> {
                return {
                    listPage: {
                        ...listPage,
                        total: details.length,
                        rows: details
                    }
                }
            })
        }
    }


    handleRowUpdated = ({ rowIdx, updated })=> {
        // merge updated row with current row and rerender by setting state
        const {listPage} = this.state;
        const {rows} = listPage;
        Object.assign(rows[rowIdx], updated);
        this.setState({
            listPage
        });
    };

    createRows = (numberOfRows)=> {
        const {listPage: {rows}} = this.state;
        for (let i = 0; i < numberOfRows; i++) {
            rows.push(createFakeRowObjectData());
        }
        return rows;
    };

    createFakeRowObjectData = () => {
        return {
            createTime: faker.image.avatar(),
            exitWay: faker.address.county(),
            companyName2: faker.internet.email(),
            contact: faker.name.prefix(),
            mobile: faker.name.firstName(),
            applyBillCode: faker.name.lastName(),
            applyBillFile: faker.address.streetName(),
            status: faker.address.zipCode(),
            date: faker.date.past().toLocaleDateString(),
            bs: faker.company.bs(),
            catchPhrase: faker.company.catchPhrase(),
            companyName: faker.company.companyName(),
            words: faker.lorem.words(),
            sentence: faker.lorem.sentence()
        };
    };

    onOk = ()=> {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }

            const {takeDeliveryTime} = values;
            this.props.callback && this.props.callback({
                click: 'ok',
                data: {},
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
        this.setState(this._retInitialState());
        this.props.form.resetFields()
    };

    render(){
        const {title, visible, confirmLoading, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {listPage: {pageIndex, pageSize, rows: dataSource, total}, tableLoading,} = this.state;

        // console.log(this.state.listPage)

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
                name: '产品名称 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                editable: true,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'packagesType',
                name: '包装类型',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
            },
            {
                key: 'packagesCount',
                name: '包装数量',
                width: 200,
                sortable: false,
                editable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                // formatter: IndexFormatter,
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'weight',
                name: '净重',
                width: 200,
                sortable: false,
                editable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    return (
                        <span>{value}</span>
                    )
                },
                /*  events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'grossWeight',
                name: '毛重 ',
                width: 200,
                sortable: false,
                editable: true,
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'remark',
                name: '备注 ',
                sortable: false,
                editable: true,
                width: 200,
                /* formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            }
        ];

        const rows = [
            [
                {
                    key: '1-1',
                    title: '运单编号',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '运单编号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.code}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '订单编号',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '订单编号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.orderCode}</span>
                        )
                    }
                },
                {
                    key: '1-5',
                    title: '计划提货日期',
                    span: 3
                },
                {
                    key: '1-6',
                    title: '计划提货日期',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{!data.takeDeliveryTime ? data.takeDeliveryTime: moment(data.takeDeliveryTime).format('YYYY-MM-DD HH:mm:SS')}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-1',
                    title: '温度要求',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '温度要求',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{tempType[data.tempType]}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '最低温(℃)',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '最低温(℃)',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.minTemp}</span>
                        )
                    }
                },
                {
                    key: '2-1',
                    title: '最高温(℃)',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '最高温(℃)',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.maxTemp}</span>
                        )
                    }
                },
            ],
            [
                {
                    key: '1-1',
                    title: '收货单位',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '收货单位',
                    span: 13,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.receiver}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '收货单位电话',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '收货单位电话',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.receiverPhone}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '2-1',
                    title: '收货地址',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '收货地址',
                    span: 21,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.receiverAddress}</span>
                        )
                    }
                },
            ],
            [
                {
                    key: '1-1',
                    title: '发货单位',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '发货单位',
                    span: 13,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.sender}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '发货单位电话',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '发货单位电话',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.senderPhone}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '2-1',
                    title: '发货单位地址',
                    span: 3
                },
                {
                    key: '2-2',
                    title: '发货单位地址',
                    span: 21,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.senderAddress}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-1',
                    title: '备注',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '备注',
                    span: 13,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.remark}</span>
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
                            <span>{data.level}</span>
                        )
                    }
                }
            ]
        ];
        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                footer={null}
                bodyHeight={750}
                {...props}
                >
                <BodyGridTable
                    rows={rows}
                    rowHeight={36}/>
                <GridTable
                    tableLoading={tableLoading}
                    enableCellSelect={true}
                    dataSource={dataSource}
                    columns={_columns}
                    onRowUpdated={this.handleRowUpdated}
                    onGridRowsUpdated={this.handleGridRowsUpdated}
                    rowHeight={36}
                    minHeight={360}
                    // rowRenderer={RowRenderer}
                    rowScrollTimeout={0}
                    onGridSort={this.handleGridSort}
                    pagination={_pagination}
                    />
            </ModalA>
        )
    }
}

ViewTMSOrderModal.propTypes = {
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

ViewTMSOrderModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

ViewTMSOrderModal = Form.create()(ViewTMSOrderModal);

export default ViewTMSOrderModal;