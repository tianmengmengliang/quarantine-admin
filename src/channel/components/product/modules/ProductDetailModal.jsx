import React, { Component, PropTypes } from 'react';
import {Table, Icon} from 'antd'
import faker from 'faker'
import {GridTable, ModalA} from '../../../../components/'

const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class ProductDetailModal extends Component{

    _retInitialState = ()=>{
        return {
            dataSource:this.createRows(1)
        }
    };

    constructor(props){
        super(props);
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
     * @interface 对话框确定按钮回调
     * @param {object} 事件对象
     * */
    onOk = ()=> {
        return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
    };

    /*
     * @interface 对话框取消按钮回调
     * */
    onCancel = ()=> {

    };

    render(){
        const {visible, title, data, ...props} = this.props;
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
                key: 'avartar',
                name: '审核人 ',
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
                name: '审核时间',
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
                name: '状态',
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
                name: '备注',
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function() {
                        console.log('The user double clicked on title column');
                    }
                }
            }
        ];

        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: text => <a href="#">{text}</a>,
        }, {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
        }, {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
      <a href="#">Action 一 {record.name}</a>
      <span className="ant-divider" />
      <a href="#">Delete</a>
      <span className="ant-divider" />
      <a href="#" className="ant-dropdown-link">
          More actions <Icon type="down" />
      </a>
    </span>
            ),
        }];

        const data2 = [{
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
        }, {
            key: '2',
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park',
        }, {
            key: '3',
            name: 'Joe Black',
            age: 32,
            address: 'Sidney No. 1 Lake Park',
        }];

        return (
            <ModalA
                visible={visible}
                title={title}
                bodyMinHeight={300}
                onOk={this.onOk}
                onCancel={this.onCancel}
                {...props}>
                <GridTable
                    enableCellSelect={true}
                    dataSource={dataSource}
                    columns={_columns}
                    // enableRowSelect={true}
                    rowHeight={50}
                    minHeight={'auto'}
                    // rowRenderer={RowRenderer}
                    rowScrollTimeout={0}
                    pagination={_pagination}
                    />
                <Table  columns={columns} dataSource={data2} />
            </ModalA>
        )
    }
}

ProductDetailModal.propTypes = {
    callback: PropTypes.func,
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

ProductDetailModal.defaultProps = {
    prefix: 'yzh',
    visible: true
};

export default ProductDetailModal;