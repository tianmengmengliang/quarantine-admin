import React, { Component, PropTypes } from 'react';
import {Form, Icon, Upload, Input, Alert} from 'antd'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable} from '../../../../components/'
import {OrgBasicInfoForm} from '../../org/modules/'
import {ProductSelectPage} from '../../product/modules/'
import ApprovalProductSelectModal from './ApprovalProductSelectModal.jsx'
import './uploadCertificateModal.less'

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class AddApprovalCertModal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false,
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    /*
     * @interface 表单提交给上层组件
     * @param {object} 事件对象
     * */
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) {
                console.log('form has err', err)
                return ;
            }

            console.log('form has values', values)
        });
    };

    onOk = ()=> {
        return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
    };

    onCancel = ()=> {

    };

    /*
     * @interface 规范化受控上传组件的值
     * @param {object} e 事件对象
     * @return {array} 文件列表数组
     * */
    normFile =(e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    /*
     * @interface 文件上传之前的hook
     * @param {object} file 当前上传的文件
     * @return {boolean | promise} 返回时候上传的结果
     * */
    beforeUpload = (file)=> {
        const isJPG = file.type === 'image/jpeg';
        if (!isJPG) {
            message.error('You can only upload JPG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJPG && isLt2M;
    };

    /*
     * @interface 上传文件列表发生变化时的hook
     * @param {object} info 上传文件列表的信息
     * */
    fileUploadChange = (info) => {
        if (info.file.status === 'done') {

        }
    };

    render(){
        const {title, visible, confirmLoading, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const rows = [
            [
                {
                    key: '1-1',
                    title: '出入境方式',
                    span: 6
                },
                {
                    key: '1-2',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
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
                    title: '运输方式',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input3', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                },
                {
                    key: '2-3',
                    title: '入境存放,使用地点及其地址',
                    span: 6
                },
                {
                    key: '2-4',
                    title: '单位地址',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input3', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                }
            ],
            [
                {
                    key: '3-1',
                    title: '拆检注意事项',
                    span: 6
                },
                {
                    key: '3-2',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input4', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                }
            ],
            [
                {
                    key: '4-1',
                    title: '发货人',
                    span: 6
                },
                {
                    key: '4-2',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input6', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                },
                {
                    key: '4-3',
                    title: '是否分批核销',
                    span: 6
                },
                {
                    key: '4-4',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input7', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                }
            ],
            [
                {
                    key: '4-1',
                    title: '收货人',
                    span: 6
                },
                {
                    key: '4-2',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input6', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                },
                {
                    key: '4-3',
                    title: '输入/输出国',
                    span: 6
                },
                {
                    key: '4-4',
                    title: '单位名称',
                    span: 6,
                    formatter: (gridMetaData)=>{
                        return (
                            getFieldDecorator('input7', {
                                rules: [
                                    { required: true, message: 'Please select your country!' },
                                ]
                            })(
                                <Input // style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )
                        )
                    }
                }
            ]
        ];

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
                            <a onClick={this.edit.bind(this, props)}>删除<span className="ant-divider"/></a>
                            <a onClick={this.edit.bind(this, props)}>修改<span className="ant-divider"/></a>
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
                name: '产品等级',
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
                name: '物品种类',
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
                name: '批件号 ',
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
                name: '原产国',
                sortable: false,
                formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }
            }
        ];
        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={true}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                bodyHeight={500}
                {...props}
                >
                <div className="hidden">
                    <ApprovalProductSelectModal />
                </div>
                <Alert message="申请单位基本信息" type="success" style={{margin: 0}}/>
                <OrgBasicInfoForm form={this.props.form}/>
                <Alert message="出入境情况" type="success" style={{margin: '16px 0 0 0'}}/>
                <BodyGridTable rows={rows}/>
                <ButtonContainer span={24} style={{ textAlign: 'left'}}>
                    <AddButton onClick={this.handleSubmit}>添加产品</AddButton>
                </ButtonContainer>
                <GridTable
                    enableCellSelect={true}
                    dataSource={[]}
                    columns={_columns}
                    onGridRowsUpdated={this.handleGridRowsUpdated}
                    // enableRowSelect={true}
                    rowHeight={36}
                    minHeight={300}
                    // rowRenderer={RowRenderer}
                    rowScrollTimeout={0}
                    pagination={_pagination}
                    />
            </ModalA>
        )
    }
}

AddApprovalCertModal.propTypes = {
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

AddApprovalCertModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

AddApprovalCertModal = Form.create()(AddApprovalCertModal);

export default AddApprovalCertModal;