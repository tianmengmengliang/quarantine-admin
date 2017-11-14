import React, { Component, PropTypes } from 'react';
import faker from 'faker'
import {Form, Input} from 'antd'
import {GridTable, ModalA, SearchButton,
    ResetButton, ButtonContainer} from '../../../../components/'
import {authPropTypesWrapper, getArraySelectedInfo} from '../../helpers/'

const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class SelectCiqCodeModal extends Component{

    _retInitialState = ()=>{
        return {
            selectedIds: [0, 1],
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

    onOk = ()=>{
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

    onCancel = ()=>{

    };


    render(){
        const {visible, title, data, form, ...props} = this.props;
        const {getFieldDecorator} = form;
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
                key: 'avartar',
                name: 'ciq编码  ',
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
                name: 'ciq商品名称 ',
                width: 200,
                sortable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
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
            <ModalA
                visible={visible}
                title={title}
                width={800}
                onOk={this.onOk}
                onCancel={this.onCancel}
                {...props}>
                <Form
                    style={{margin: '0 0 16px 0'}}
                    inline>
                    <Form.Item
                        label="ciq编码"
                        >
                        {getFieldDecorator('input', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Form.Item>
                    <Form.Item
                        label="ciq商品名称"
                        >
                        {getFieldDecorator('input2', {
                            rules: [
                                { required: true, message: 'Please select your country!' },
                            ],
                        })(
                            <Input // style={{ width: '65%', marginRight: '3%' }}
                                />
                        )}
                    </Form.Item>

                    <Form.Item>
                        <ButtonContainer type="form">
                            <SearchButton onClick={this.handleSubmit} />
                            <ResetButton onClick={this.resetFields} />
                        </ButtonContainer>
                    </Form.Item>
                </Form>
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
            </ModalA>
        )
    }
}

SelectCiqCodeModal.propTypes = {
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

SelectCiqCodeModal.defaultProps = {
    prefix: 'yzh',
    visible: true
};

CiqCodeModal = Form.create()(SelectCiqCodeModal);

export default SelectCiqCodeModal;