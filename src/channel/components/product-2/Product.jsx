import React, { Component, PropTypes } from 'react';
import {Spin} from 'antd'
import {GridTable, Block, Inline} from '../../../components/'
import {ButtonContainer, AddButton, EditButton, SearchButton, DelButton} from '../../../components/'
import {fetch} from '../../../services/'
import {dimsMap} from '../helpers/'
const {product: {itemTypes, productRank, filingStatus}} = dimsMap;

const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class Product extends Component{

    _retInitialState = ()=>{
        return {
            spinning: false,                                    // 页面加载数据loading状态
            tip: '',                                            // 页面加载数据loading状态文字
            selectedIds: [],                                    // 已选定的行数据ids
            selectedRows: [],                                   // 选中的行数据
            tableLoading: false,
            listPage: {
                pageIndex: 1,
                pageSize: 10,
                rows: [],
                total: 0
            }
        }
    };

    constructor(props) {
        super(props);
        this.state = this._retInitialState()
    }

    componentDidMount(){
        const {listPage: {pageIndex, pageSize}} = this.state;
        this.getProductList({pageIndex, pageSize})
    }

    /*
     * @interface 重置行选择数据
     * */
    resetSelectedRowsNIds = ()=>{
        this.setState({
            selectedIds: [],
            selectedRows: []
        })
    };

    /*
     * 获取产品列表的所有查询条件
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
     * @interface 获取产品列表
     * */
    getProductList = (query)=>{
        // step1. 获取查询阐参数
        const _q = this._getAllListQuery(query);
        // console.log(_q);
        // step2. 请求列表数据
        fetch('ciq.product.list', {
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
                    spinning: true,
                    tip: '请求数据中。。。'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    tip: ''
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
            this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds !== i )});
            this.setState({selectedRows: this.state.selectedRows.filter(r => rowIds !== r[this.props.rowKey] )});
        }else{
            // case2-case1. 采用赋值，如果是只能选中一行采用赋值，如果是合并选中行，采用concat方法来合并操作
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
            message.warn(`${nullText || '你未选中任何查验通知'}`);
            return false
        }else if(selectedIds.length > 1 ){
            // s1-case2. 选中超过2行数据提示
            message.warn(`${moreText || '你只能选择一条查验通知'}`);
            return false;
        }
        return true
    };

    /*
     * @interface 获取产品明细
     * @param {object} props 参数
     * */
    getProductDetail = ({data}, callback)=>{
        fetch('', {
            // method: 'post',
            // headers: {},
            data: {id: data.id},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    tip: '获取数据中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    tip: ''
                })
            }
        })
    };

    /*
     * @interface 点击添加C、D类产品按钮
     * @param {string} type 操作类型
     * @param {array} 选中的行数据
     * */
    addClick = ({type, data: selectedRows = []})=>{
        if(type === 'add') {
            this.showAdd({data: {}});
        }
        if(type === 'edit') {
            const hasSelectedOnlyOneIdx = this._hasSelectedOnlyOneIdx(selectedRows);
            if (hasSelectedOnlyOneIdx) {
                // s1-case1. 只选中一行并且订单状态为未提交
                let isStatusLess2 = selectedRows[0]['status'] < 2;
                if (isStatusLess2) {
                    this.getProductDetail({data: selectedRows[0], selectedRow: selectedRows[0]}, (err, res = {})=> {
                        if (err) {
                            // case1. 请求产品明细失败
                            message.error('获取通知明细失败');
                        } else {
                            // case2. 请求产品明细成功，显示对话框
                            this.showAdd({
                                data: res.responseObject
                            })
                        }
                    })
                }else{
                    // s1-case2. 只选中一行并且订单状态为其他状态
                    message.error('获取产品明细失败，请稍后重试或者联系相关人员');
                }
            }else{
                return;
            }
        }
    };

    /*
    * @interface 显示添加C、D类产品对话框
    * @param {object} _props 参数对象
    * */
    showAdd = ({data})=>{
        this.setState(({addCheckNotificationModal})=>{
            return {
                addCheckNotificationModal: {
                    ...addCheckNotificationModal,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏添加C、D类产品对话框
     * */
    hiddenAdd = ()=>{
        this.setState(({addCheckNotificationModal})=>{
            return {
                addCheckNotificationModal: {
                    ...addCheckNotificationModal,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 添加C、D类产品对话框的回调
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
            console.log(info);
            const {listPage: {pageIndex, pageSize}} = this.state;
            this.getProductList({pageIndex, pageSize})
            this.hiddenAdd();
            return;
        }
    };

    render(){
        const {...props} =this.props;
        const {selectedIds, selectedRows, spinning, tip,
            listPage: {pageIndex, pageSize, rows: dataSource, total}} = this.state;

        // console.log(selectedIds, selectedRows)

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
                this.getProductList({pageIndex: current, pageSize})
            }
        };

        const _columns = [
            {
                key: 'sn',
                name: '序号',
                width: 100,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                locked: true,
                formatter: ({dependentValues,rowIdx, value})=>{
                    return (
                        <span>{(pageIndex-1)*pageSize+rowIdx+1}</span>
                    )
                },
               /* events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'productName',
                name: '产品名称',
                width: 200,
                locked: true,
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
                key: 'productNameEn',
                name: '产品英文名称',
                width: 200,
                locked: true,
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
                key: 'status',
                name: '备案状态',
                width: 200,
                locked: false,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    const style = value === 0 ? {color: 'red'} : {}
                    return (
                        <span style={style}>{filingStatus[value]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'productRank',
                name: '产品等级',
                width: 100,
                locked: false,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{productRank[value]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'corp',
                name: '生产厂家',
                width: 200,
                locked: false,
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
                key: 'address',
                name: '生产地址',
                width: 200,
                locked: false,
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
                key: 'pcategory',
                name: '物品类别',
                width: 200,
                locked: false,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value && itemTypes[value]['title']}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'ccategory',
                name: '物品种类',
                width: 200,
                locked: false,
                sortable: false,
                formatter: ({dependentValues: {pcategory},rowIdx, value, column: {key}})=>{
                    return (
                        <span>{ (value && pcategory) ? itemTypes[pcategory]['itemTypes'][value] : undefined}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'microbeRisk',
                name: '含有的微生物危险登记',
                width: 100,
                locked: false,
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
                key: 'originCountry',
                name: '原产国',
                width: 100,
                locked: false,
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
                key: 'purpose',
                name: '用途',
                width: 100,
                locked: false,
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
                key: 'batch',
                name: '批件号',
                width: 200,
                locked: false,
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
                key: 'spcifications',
                name: '规格',
                width: 200,
                locked: false,
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
                key: 'productno',
                name: '产品货号',
                width: 200,
                locked: false,
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
                key: 'remark',
                name: '备注',
                width: 200,
                locked: false,
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
            }
        ];

        return (
            <div {...props} className="yzh-check-notification has-no-check-box-all">
                <div className="hidden">

                </div>
                <Spin
                    spinning={spinning}
                    tip={tip}>
                    <ButtonContainer>
                        <AddButton onClick={this.addClick.bind(this, {type: 'add', data: {}})}>添加C、D类产品</AddButton>
                        <EditButton onClick={this.addClick.bind(this, {type: 'edit', data: selectedRows})}>修改</EditButton>
                        <SearchButton  >查看</SearchButton>
                        <DelButton >删除</DelButton>
                    </ButtonContainer>
                    <GridTable
                        tableLoading={false}
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

Product.propTypes = {
    prefix: PropTypes.string,
    rowKey: PropTypes.string
};

Product.defaultProps = {
    prefix: 'yzh',
    rowKey: 'id'
}

export default Product;