import React, { Component, PropTypes } from 'react';
import {Popconfirm} from 'antd'
import faker from 'faker'
import {GridTable, Block, Inline} from '../../components/'
import {ButtonContainer, AddButton, SearchButton, DelButton} from '../../components/'
import {Collapse} from 'antd'

const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class Org extends Component{
    constructor(props){
        super(props);
        this.state = {
            selectedIds: [0, 1],
            dataSource: this.createRows(10)
        }
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

        const _columns2 = [
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
                key: 'avartar',
                name: '单位名称 ',
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
                name: '机构代码',
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
                name: '法人代表 ',
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
                name: '联系人',
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
                name: '手机号码',
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
                name: '公司邮箱 ',
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
                name: '固定电话 ',
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
                name: '邮编 ',
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
                name: '传真',
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
            <div>
                <GridTable
                    enableCellSelect={true}
                    dataSource={dataSource}
                    columns={_columns2}
                    onGridRowsUpdated={this.handleGridRowsUpdated}
                    enableRowSelect={true}
                    rowHeight={30}
                    minHeight={400}
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
                    pagination={_pagination}/>
            </div>
        )
    }
}

export default Org;