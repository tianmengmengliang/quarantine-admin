import React, { Component, PropTypes } from 'react';
import {Popconfirm} from 'antd'
// import faker from 'faker'
import {GridTable, Block, Inline} from '../../../components/'
import {ButtonContainer, AddButton, SearchButton, DelButton} from '../../../components/'
import {authPropTypesWrapper, getArraySelectedInfo} from '../helpers/'
import {ProductQueryForm, AddProductModal, ProductDetailModal} from './modules/'

const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class Product extends Component{

    _retInitialState = ()=>{
        return {
            selectedIds: [0, 1],
            dataSource: this.createRows(10)
        }
    };

    constructor(props) {
        super(props);
        this.state = this._retInitialState()
    }


    createRows(numberOfRows) {
        let rows = [];
        for (let i = 0; i < numberOfRows; i++) {
            rows[i] = this.createFakeRowObjectData(i);
        }
        return rows;
    }

    createFakeRowObjectData(index) {
        return {
            id: index,
            avartar: faker.image.avatar(),
            county: faker.address.county(),
            email: faker.internet.email(),
            title: faker.name.prefix(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            street: faker.address.streetName(),
            zipCode: faker.address.zipCode(),
            date: faker.date.past().toLocaleDateString(),
            bs: faker.company.bs(),
            catchPhrase: faker.company.catchPhrase(),
            companyName: faker.company.companyName(),
            words: faker.lorem.words(),
            sentence: faker.lorem.sentence()
        };
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
        this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))});
    };

    /*
     * @interface 取消选中行接口
     * @param {Array} 取消选中的行
     * */
    onRowsDeselected = (rows /*取消选择的行*/) =>{
        let rowIds = rows.map(r =>  r.row[this.props.rowKey]);
        this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 )});
    };

    add = (r)=>{
        console.log('add', r)
    };

    edit = (r)=>{
        const {length, msg, selectedArray} = getArraySelectedInfo(this.state.selectedIds);
        if(length === 1){
            // 正常的编辑操作
            console.log('edit正常')
        }else if(length === 0){
            // 弹出错误提示，内容为没有选择任何项
            console.log('edit0')
        }else if(length > 1){
            // 弹出错误提示，内容为选择太多项
            console.log('edit2')
        }
        console.log('edit', r)
    };

    del = (r)=>{
        const {length, msg, selectedArray} = getArraySelectedInfo(this.state.selectedIds);
        if(length === 1){
            // 正常的删除操作
            console.log('del正常')
        }else if(length === 0){
            // 弹出错误提示，内容为没有选择任何项
            console.log('del0')
        }else if(length > 1){
            // 弹出错误提示，内容为选择太多项
            console.log('del2')
        }
        console.log('del', r)
    };

    batchDel = (r)=>{
        const {length, msg, selectedArray} = getArraySelectedInfo(this.state.selectedIds);
        Modal.warning({
            width: 416,
            title: 'This is a warning message',
            content: 'some messages...some messages...',
            okText: 'ok',
            cancelText: 'cancel',
            maskClosable: false,
            onOk: noop,
            onCancel: noop
        });
        if(length >= 1){
            // 正常的批量删除操作
            console.log('batchDel正常')
        }else if(length === 0){
            // 弹出错误提示，内容为没有选择任何项
            console.log('batchDel0')
        }
        console.log('batchDel', r)
    };

    search = (r)=>{
        const {length, msg, selectedArray} = getArraySelectedInfo(this.state.selectedIds);
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

    addAssOrg = (r)=>{
        const {length, msg, selectedArray} = getArraySelectedInfo(this.state.selectedIds);
        if(length === 1){
            // 正常的添加关联单位操作
            console.log('addAssOrg正常')
        }else if(length === 0){
            // 弹出错误提示，内容为没有选择任何项
            console.log('addAssOrg0')
        }else if(length > 1){
            // 弹出错误提示，内容为选择太多项
            console.log('addAssOrg2')
        }
        console.log('addAssOrg', r)
    };


    render(){
        const {...props} =this.props;
        const _pagination = {
            current: 1,
            pageSize: 10,
            total: 100,
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

        const {pageSize, current} = _pagination;

        const _columns = [
            {
                key: 'sn',
                name: '序号',
                width: 100,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                locked: true,
                formatter: ({dependentValues,rowIdx, value})=>{
                    return (
                        <span>{(current-1)*pageSize+rowIdx+1}</span>
                    )
                },
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'operation',
                name: '操作',
                width: 200,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                locked: true,
                formatter: (props)=>{
                    return (
                        <span>
                          <a onClick={this.edit.bind(this, props)}>查看<span className="ant-divider" /></a>
                             <Popconfirm
                                 placement="topRight"
                                 title={"你确定要删除吗?"}
                                 onConfirm={this.del.bind(this, props)}
                                 okText="确定删除"
                                 cancelText="取消">
                                 <a>删除</a>
                             </Popconfirm>
                    </span>
                    )
                },
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'avartar',
                name: '审核状态 ',
                width: 200,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'county',
                name: 'ciq编码状态 ',
                width: 200,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'email',
                name: '是否冻结',
                width: 200,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'title',
                name: '审核不通过原因 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'firstName',
                name: '产品等级',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'lastName',
                name: 'ciq编码',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'street',
                name: '单位 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode',
                name: '真实姓名 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode2',
                name: '产品名称 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode3',
                name: '产品英文名称 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode4',
                name: '药监局批文证号 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode5',
                name: '批件号 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode6',
                name: '产品货号(范围查询) ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode7',
                name: '产品货号 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode8',
                name: '生产厂家 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode9',
                name: '录入时间 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode10',
                name: '生产地址 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode11',
                name: '签发时间',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode12',
                name: '截止时间 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode13',
                name: '备注 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode14',
                name: '规格 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            }
        ];
        console.log(this.props);
        const {dataSource} = this.state;
        return (
            <div {...props}>
                {/*产品查询表单开始*/}
                <ProductQueryForm />
                {/*产品查询表单结束*/}

                <ButtonContainer>
                    <AddButton onClick={this.add}>单位信息录入</AddButton>
                    <AddProductModal visible={false}/>
                    <DelButton onClick={this.batchDel}>批量删除</DelButton>
                </ButtonContainer>
                <div>
                    <ProductDetailModal visible={false}/>
                </div>
                <GridTable
                    enableCellSelect={true}
                    dataSource={dataSource}
                    columns={_columns}
                    onGridRowsUpdated={this.handleGridRowsUpdated}
                    enableRowSelect={true}
                    rowHeight={50}
                    minHeight={600}
                    // rowRenderer={RowRenderer}
                    rowScrollTimeout={0}
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
                    onGridSort={this.handleGridSort}
                    pagination={_pagination}
                    />
            </div>
        )
    }
}

Product = authPropTypesWrapper(Product);

export default Product;