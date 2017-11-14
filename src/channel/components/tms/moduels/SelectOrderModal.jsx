import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva'
import {Form, Spin, Button, message} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {ModalA, GridTable} from '../../../../components/'
import './selectOrderModal.less'
import {fetch, CONFIG} from 'antd/../../src/services/'
import {dimsMap} from '../../helpers/'
const {order, custom: {entryExit}} = dimsMap;

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class SelectOrderModal extends Component{

    _retInitialState = ()=>{
        return {
            tableLoading: false,                                    // 页面加载数据loading状态
            tip: '',                                                // 页面加载数据loading状态文字
            selectedIds: [],                                        // 已选定的行数据ids
            selectedRows: [],                                       // 选中的行数据
            listPage: {
                pageIndex: 1,
                pageSize: 10,
                rows: [],
                total: 0
            }
        }

    };

    constructor(props){
        super(props);
        this.state = this._retInitialState();
    }

    componentDidMount(){
       /* const {listPage: {pageIndex, pageSize}} = this.state;
        this.getOrderList({pageIndex, pageSize});*/
    }

    componentWillReceiveProps(nextProps){
        const {visible, status} = nextProps;
        if(visible && status === 'loading'){
            const {listPage: {pageIndex, pageSize}} = this.state
            this.getOrderList({pageIndex, pageSize})
        }
    }

    /*
     * 获取订单列表的所有查询条件
     * @param {object} pageQuery 分页查询对象
     * @return {object} 列表所有查询条件参数对象
     * */
    _getAllListQuery = (pageQuery = {})=>{
        // step1 获取所有查询参数
        let _f = {};
        return {
            ..._f,
            ...pageQuery
        }
    };

    /*
     * @interface 获取订单列表
     * */
    getOrderList = (query)=>{
        // step1. 获取查询阐参数
        const _q = this._getAllListQuery(query);
        // console.log(_q);
        // step2. 请求列表数据
        fetch('ciq.crossorder.list', {
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

    onOk = ()=> {
        // case1. 未选择任何行数据
        if(this.state.selectedRows.length === 0){
            message.error('你未选择任何订单，请先选择一条订单')
        }else{
            // case2. 已选择订单
            this.props.callback && this.props.callback({
                click: 'ok',
                data: this.state.selectedRows[0]
            });
            this.setState(this._retInitialState());
        }
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
        this.setState({selectedIds: [clickedRow[this.props.rowKey]]});
        this.setState({selectedRows: [clickedRow]});
    };


    render() {
        const {prefix, confirmLoading, title, visible, ...props} =this.props;
        const {tableLoading, tip, listPage: {pageIndex, pageSize, rows, total}} = this.state;

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
                this.getOrderList({pageIndex: current, pageSize})
            }
        };

        const _columns = [
            {
                key: 'sn',
                name: '序号',
                width: 50,
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
                key: 'code',
                name: '订单编号',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'createTime',
                name: '创建时间 ',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{moment(value).format('YYYY-MM-DD HH:mm:SS')}</span>
                    )
                }
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'exitWay',
                name: '出入境类型',
                width: 100,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{entryExit[`${value}`]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'status',
                name: '状态',
                width: 150,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues: {id},rowIdx, value, column: {key}})=>{
                    const styles = value === 0 ? {color: 'red'} : {};
                    return (
                        <div>
                            <span style={{marginLeft: 8}}><span style={styles}>{order[key][value]}</span></span>
                        </div>
                    )
                }
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'orderFile',
                name: '附件',
                width: 150,
                sortable: true,
                formatter: ({dependentValues: {applyBillCode},rowIdx, value, column: {key}})=>{
                    return (
                        <span>
                            <span style={{marginRight: 8}}>{applyBillCode}</span>
                            <a href={`${CONFIG.ossFileUrl}${value}`}>
                                <Button
                                    title="附件下载"
                                    type="primary"
                                    shape="circle"
                                    icon="download" />
                            </a>
                        </span>
                    )
                }
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                // formatter: IndexFormatter,
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'contact',
                name: '联系人',
                width: 100,
                sortable: false,
                // formatter: IndexFormatter,
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'mobile',
                name: '手机号 ',
                width: 200,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                // formatter: IndexFormatter,
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
        ];
        const cls = cx({
            [`${prefix}-select-order-modal`]: true
        });
        return (
        <ModalA
            className={cls}
            confirmLoading={confirmLoading}
            title={`请选择订单`}
            visible={visible}
            okText="确定"
            cancelText="取消"
            onOk={this.onOk}
            onCancel={this.onCancel}
            bodyHeight={450}
            {...props}
            >
            <Spin
                spinning={tableLoading}
                tip={tip}>
                <GridTable
                    tableLoading={false}
                    // enableCellSelect={true}
                    dataSource={rows}
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
                    rowHeight={36}
                    minHeight={360}
                    // rowRenderer={RowRenderer}
                    rowScrollTimeout={0}
                    onGridSort={this.handleGridSort}
                    pagination={_pagination}
                    />
            </Spin>
        </ModalA>
        )
    }
}

SelectOrderModal.propTypes = {
    prefix: PropTypes.string,
    rowKey: PropTypes.string,
    status: PropTypes.string.isRequired,

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
};

SelectOrderModal.defaultProps = {
    prefix: 'yzh',
    rowKey: 'id',
    visible: false,
    callback: noop,
};

const mapStateToProps=({nav})=>{
    return {
        nav
    }
};

export default connect(mapStateToProps)(SelectOrderModal);