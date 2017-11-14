import React, { Component, PropTypes } from 'react';
import { connect } from 'dva'
// import faker from 'faker'
import moment from 'moment'
import cx from 'classnames'
import {Form, Select, Popconfirm, message, Button, Spin, Input} from 'antd'
import {Permission} from 'antd/../../src/channel/components/helpers/'
import {GridTable, Block, Inline,
    ButtonContainer, AddButton, EditButton,
    DelButton, SearchButton} from '../../../components/'
import {PutInStorageRegisterModal, UseModal} from 'antd/../../src/channel/components/supervision/modules/'
import {dimsMap} from 'antd/../../src/channel/components/helpers/'
import {fetch, CONFIG} from 'antd/../../src/services/'
const {supervision: {entryStatus, chayanStatus, jgStatus, jgResult}} = dimsMap;

function noop(){}

class FollowUpSupervisionList extends Component{

    _retInitialState = ()=>{
        return {
            spinning: false,                            // 数据加载loading状态
            tip: '',                                    // 数据加提示文本
            selectedIds: [],                            // 已选定的行数据ids
            selectedRows: [],                           // 选中的行数据
            tableLoading: false,
            listPage: {
                pageIndex: 1,
                pageSize: 10,
                rows: [],
                total: 0
            },
            putInStorageRegisterModal: {
                title: '',
                visible: false,
                data: {}
            },
            useModal: {
                title: '',
                visible: false,
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
        this.getFollowUpSupervisionList({pageIndex, pageSize})
    }


    _resetSelectedRows = ()=>{
        this.setState({
            selectedIds: [],
            selectedRows: [],
        })
    };

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
     * @interface 获取使用登记产品列表
     * */
    getFollowUpSupervisionList = (query)=>{
        // step1. 获取查询阐参数
        const _q = this._getAllListQuery(query);

        this._resetSelectedRows();
        // console.log(_q);
        // step2. 请求列表数据
        fetch('ciq.houxujianguan.list', {
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
    handleGridRowsUpdated = ({ fromRow, toRow, updated })=> {
        console.log('handleGridRowsUpdated',arguments)
        let rows = this.state.rows;

        for (let i = fromRow; i <= toRow; i++) {
            let rowToUpdate = rows[i];
            let updatedRow = React.addons.update(rowToUpdate, {$merge: updated});
            rows[i] = updatedRow;
        }

        this.setState({ rows });
    };

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
        // case1. 如果是全选操作
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
            this.setState({selectedIds: [clickedRow[this.props.rowKey]]});
            this.setState({selectedRows: [clickedRow]});
        }
    };

    /*
     * @interface 判断是否只选中一行数据
     * @param {array} selectedIds 选中的行数组
     * return {boolean} 只选中一行数据返回true否则返回false
     * */
    _hasSelectedOnlyOneIdx = (selectedIds = [], nullText = undefined, moreText = undefined)=>{
        if(selectedIds.length === 0){
            // s1-case1. 没有选中任何行数据提示
            message.warn(`${nullText || '请你选择一条记录'}`);
            return false
        }else if(selectedIds.length > 1 ){
            // s1-case2. 选中超过2行数据提示
            message.warn(`${moreText || '你只能选择一条记录'}`);
            return false;
        }
        return true
    };

    /*
     * @interface 显示添加运输单对话框
     * */
    add = ({data: selectedRows = []})=>{
        if(this._hasSelectedOnlyOneIdx(selectedRows)) {
            const isEntryStatus0 = selectedRows[0]["entryStatus"] == 0;
            const isPass = selectedRows[0]['jgstatus'] == 4;
            if(!isEntryStatus0){
                message.error(`核销单：${selectedRows[0]['hexiaodanCode']}   已做入库操作`, 2)
                return;
            }
            if(!isPass){
                message.error(`核销单：${selectedRows[0]['hexiaodanCode']}   后续监管未结束，不能做入库操作`)
                return;
            }
            this.showAdd({data: selectedRows[0]})
        }
    };

    showAdd = ({data})=>{
        this.setState(({putInStorageRegisterModal})=>{
            return {
                putInStorageRegisterModal: {
                    ...putInStorageRegisterModal,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏添加运输单对话框
     * */
    hiddenAdd = ()=>{
        this.setState(({putInStorageRegisterModal})=>{
            return {
                putInStorageRegisterModal: {
                    ...putInStorageRegisterModal,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 添加运输单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    addCallback = (info)=>{
        const {click, data, callback} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenAdd();
            callback && callback();
            return;
        }

        // 如果点击确定按钮，则提交表单
        if(click === 'ok'){
            this.hiddenAdd();
            callback && callback();
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getFollowUpSupervisionList({pageIndex, pageSize});
            return;
        }
    };

    /*
     * @interface 显示添加运输单对话框
     * */
    viewUseListClick = (record)=>{
        console.log('record数据',record);
        this.showViewUseListModal(record)
    };

    showViewUseListModal= (data)=>{
        this.setState(({useModal})=>{
            return {
                useModal: {
                    ...useModal,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏添加运输单对话框
     * */
    hiddenViewUseList = ()=>{
        this.setState(({useModal})=>{
            return {
                useModal: {
                    ...useModal,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 添加运输单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    viewUseListClickCallback = (info)=>{
        const {click, data, callback} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenViewUseList();
            callback && callback();
            return;
        }

        // 如果点击确定按钮，则提交表单
        if(click === 'ok'){
            this.hiddenViewUseList();
            callback && callback();
            return;
        }
    };

    /*
     * @interface 显示查看运输单对话框
     * */
    viewTMSOrderClick = ({data: selectedRows})=>{
        // step1. 如果只选中一行数据，发送查验通知xhr
        if(this._hasSelectedOnlyOneIdx(selectedRows)) {
            this.getTMSOrderDetails({data: selectedRows[0]}, (err, res)=>{
                if(err){
                    message.error(`获取运输单信息失败，请稍后重试`);
                    return;
                }

                const {responseObject} = res;
                this.showViewTMSOrderModal({data: responseObject})
            })
        }
    };

    showViewTMSOrderModal = ({data})=>{
        this.setState(({viewTMSOrderModal})=>{
            return {
                viewTMSOrderModal: {
                    ...viewTMSOrderModal,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏查看运输单对话框
     * */
    hiddenViewTMSOrder = ()=>{
        this.setState(({viewTMSOrderModal})=>{
            return {
                viewTMSOrderModal: {
                    ...viewTMSOrderModal,
                    visible: false,
                    confirmLoading: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 查看运输单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    viewTMSOrderCallback = (info)=>{
        const {click, data, callback} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenViewTMSOrder()
            return;
        }
    };

    render() {
        const {prefix, ...props} =this.props;
        const { getFieldDecorator } = this.props.form;
        const {spinning, tip, selectedIds, selectedRows, listPage: {pageIndex, pageSize, rows: dataSource, total},
            tableLoading, putInStorageRegisterModal, useModal} = this.state;

        console.log(this.state.listPage, pageIndex , pageSize );

        const cls = cx({
            [`${prefix}-tms-order`]: true
        });

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
                const {listPage: {pageSize}} = this.state;
                this.getFollowUpSupervisionList({pageIndex: current, pageSize});
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
                    //console.log(pageIndex , pageSize,(pageIndex - 1) * pageSize + rowIdx + 1 );
                    const {listPage: {pageIndex, pageSize}} = this.state;
                    return (
                        <span>{(pageIndex - 1) * pageSize + rowIdx + 1}</span>
                    )
                },
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'corpCode',
                name: '组织机构代码 ',
                width: 150,
                sortable: true,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
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
                key: 'hexiaodanCode',
                name: '核销单号 ',
                width: 200,
                sortable: true,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <a onClick={this.viewUseListClick.bind(this, dependentValues)}>{value}</a>
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
                key: 'jgorgName',
                name: '监管机构 ',
                width: 100,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'chayanDate',
                name: '查验日期',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value ? moment(value).format('YYYY-MM-DD') : value}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'entryStatus',
                name: '物品启用确认状态',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    const cls = cx({
                        'text-not-pass': 0 == value
                    });
                    return (
                        <span className={cls}>{entryStatus[value]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'chayanStatus',
                name: '查验状态',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    const cls = cx({
                        'text-default': 0 == value,
                        'text-pass': 2 ==  value,
                        'text-not-pass': 1 == value
                    });
                    return (
                        <span className={cls}>{chayanStatus[value]}</span>
                    )
                }
                // formatter: IndexFormatter,
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'jgstatus',
                name: '监管状态',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    const cls = cx({
                        'text-pass': 4 ==  value,
                        'text-not-pass': 1 == value
                    });
                    return (
                        <span className={cls}>{jgStatus[value]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'jgresult',
                name: '监管结果',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    const cls = cx({
                        'text-pass': 1 ==  value,
                        'text-not-pass': 2 == value
                    });
                    return (
                        <span className={cls}>{jgResult[value]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            }
        ];
        return (
            <div className = {`${cls} has-no-check-box-all`} {...props}>
                <div className="hidden">
                    {<PutInStorageRegisterModal
                        {...putInStorageRegisterModal}
                        callback={this.addCallback}/>}
                    <UseModal
                        {...useModal}
                        callback={this.viewUseListClickCallback}/>
                </div>
                {/*<Form layout="inline">
                    <Permission resId={'/hxjg/hxjgList/nameInput'}>
                        <Form.Item
                            label="单位名称"
                            >
                            {getFieldDecorator('name', {
                                initialValue: undefined,
                                rules: [
                                    { required: false, message: '' },
                                ]
                            })(
                                <Input />
                            )}
                        </Form.Item>
                    </Permission>
                    <Form.Item
                        label="核销单号"
                        >
                        {getFieldDecorator('hexiaodanCode', {
                            initialValue: undefined,
                            rules: [
                                { required: false, message: '' },
                            ]
                        })(
                            <Input />
                        )}
                    </Form.Item>
                    <Form.Item
                        label="品名"
                        >
                        {getFieldDecorator('productName', {
                            initialValue: undefined,
                            rules: [
                                { required: false, message: '' },
                            ]
                        })(
                            <Input />
                        )}
                    </Form.Item>
                    <ButtonContainer style={{display: 'inline-block', margin: 0}}>
                        <Button type="primary">查询</Button>
                        <Button>重置</Button>
                    </ButtonContainer>
                </Form>*/}
                <ButtonContainer>
                    <Permission resId={'/hxjg/hxjgList/punInBtn'}>
                        <AddButton onClick={this.add.bind(this, {data: selectedRows})}>物品启用确认</AddButton>
                    </Permission>
                    {/*<EditButton onClick={this.add.bind(this, {type: 'edit', data: selectedRows})}>修改</EditButton>*/}
                </ButtonContainer>
                <Spin
                    spinning={spinning}
                    tip={tip}>
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
                    rowHeight={36}
                    minHeight={360}
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

FollowUpSupervisionList = Form.create()(FollowUpSupervisionList);

FollowUpSupervisionList.propTypes = {
    prefix: PropTypes.string,
    rowKey: PropTypes.string,
};

FollowUpSupervisionList.defaultProps = {
    prefix: 'yzh',
    rowKey: 'id'
};


const mapStateToProps=({})=>{
    return {

    }
};

export default connect(mapStateToProps)(FollowUpSupervisionList);
