import React, { Component, PropTypes } from 'react';
import faker from 'faker'
import {Alert} from 'antd'
import {ModalA, BodyGridTable, GridTable, ButtonContainer, UploadButton} from '../../../../components/'
import ProductQueryForm from './ProductQueryForm.jsx'
import SetProductAccountModal from './../../product/modules/SetProductAccountModal.jsx'
import ApprovalProductTable from './ApprovalProductTable.jsx'

const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

function noop(){}

class AddApprovalCertPage extends Component{

    _retInitialState = ()=>{
        return {
            selectedIds: [1, 2],
            dataSource: this.createRows(10)
        }
    };

    constructor(props){
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

    onOk = ()=> {
        return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
    };

    onCancel = ()=> {

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

    render(){
        const {title, visible, confirmLoading} = this.props;
        const {dataSource} = this.state;
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
                formatter: ({dependentValues,rowIdx, value})=> {
                    return (
                        <span>{(current - 1) * pageSize + rowIdx + 1}</span>
                    )
                },
                events: {
                    onDoubleClick: function () {
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
                formatter: (props)=> {
                    return (
                        <span>
                          <a onClick={this.edit.bind(this, props)}>设置数量货值<span className="ant-divider"/></a>
                        </span>
                    )
                },
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'avartar',
                name: '产品名称 ',
                width: 200,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'county',
                name: '产品英文名称',
                width: 200,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'email',
                name: '产品等级 ',
                width: 200,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'title',
                name: '物品类别',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'firstName',
                name: '物品种类 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'lastName',
                name: 'ciq编码 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'street',
                name: '规格 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode',
                name: '货号 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode2',
                name: '批件号',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode3',
                name: '货号(范围查询)',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            },
            {
                key: 'zipCode4',
                name: '原产国 ',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            }
        ];
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
                        return ''
                    }
                },
                {
                    key: '1-3',
                    title: '机构代码',
                    span: 6
                },
                {
                    key: '1-4',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                }
            ],
            [
                {
                    key: '2-1',
                    title: '单位性质',
                    span: 6
                },
                {
                    key: '2-2',
                    title: '单位地址',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                }
            ],
            [
                {
                    key: '3-1',
                    title: '单位地址',
                    span: 6
                },
                {
                    key: '3-2',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                },
                {
                    key: '3-3',
                    title: '联系人',
                    span: 6
                },
                {
                    key: '3-4',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                }
            ],
            [
                {
                    key: '4-1',
                    title: 'E-mail',
                    span: 6
                },
                {
                    key: '4-2',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                },
                {
                    key: '4-3',
                    title: '联系电话',
                    span: 6
                },
                {
                    key: '4-4',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                }
            ],
        ];
        const rows2 = [
            [
                {
                    key: '1-1',
                    title: '出入境方式',
                    span: 6
                },
                {
                    key: '1-2',
                    title: '单位名称',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                }
            ],
            [
                {
                    key: '2-1',
                    title: '存储条件',
                    span: 6
                },
                {
                    key: '2-2',
                    title: '单位地址',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                },
                {
                    key: '2-3',
                    title: '运输方式',
                    span: 6
                },
                {
                    key: '2-4',
                    title: '单位地址',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                }
            ],
            [
                {
                    key: '3-1',
                    title: '入境存放,使用地点及其地址',
                    span: 6
                },
                {
                    key: '3-2',
                    title: '相关材料',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                },
                {
                    key: '3-3',
                    title: '相关材料',
                    span: 6
                },
                {
                    key: '3-4',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                }
            ],
            [
                {
                    key: '4-1',
                    title: 'E-拆检注意事项',
                    span: 6
                },
                {
                    key: '4-2',
                    title: '单位名称',
                    span: 18,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                }
            ],
            [
                {
                    key: '5-1',
                    title: '发货人',
                    span: 6
                },
                {
                    key: '5-2',
                    title: '单位地址',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                },
                {
                    key: '5-3',
                    title: '是否分批核销',
                    span: 6
                },
                {
                    key: '2-4',
                    title: '单位地址',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                }
            ],
            [
                {
                    key: '6-1',
                    title: '收货人',
                    span: 6
                },
                {
                    key: '6-2',
                    title: '单位地址',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                },
                {
                    key: '6-3',
                    title: '输入/输出国',
                    span: 6
                },
                {
                    key: '6-4',
                    title: '单位地址',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return ''
                    }
                }
            ],
        ];
        return (
            <div>
                <Alert message="申请单位基本信息" type="success" style={{margin:'10px 0 0 0'}}/>
                <BodyGridTable rows={rows}/>
                <Alert message="出入境情况" type="success" style={{margin:'16px 0 0 0'}}/>
                <BodyGridTable rows={rows2}/>
                <Alert message="特殊物品信息" type="success" style={{margin:'16px 0 0 0'}}/>
                <SetProductAccountModal visible={false}/>
                <ProductQueryForm />
                <GridTable
                    enableCellSelect={true}
                    dataSource={dataSource}
                    columns={_columns}
                    onGridRowsUpdated={this.handleGridRowsUpdated}
                    enableRowSelect={true}
                    rowHeight={36}
                    minHeight={360}
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
                <ButtonContainer span={24} style={{ textAlign: 'center', margin: '0 0 32px 0'}}>
                    <UploadButton onClick={this.handleSubmit}/>
                </ButtonContainer>
            </div>

        )
    }
}

AddApprovalCertPage.propTypes = {
    prefix: PropTypes.string.isRequired
};

AddApprovalCertPage.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

export default AddApprovalCertPage;
