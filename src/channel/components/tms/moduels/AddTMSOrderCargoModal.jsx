import React, { Component, PropTypes } from 'react';
import {Form, Select, Icon, Input, InputNumber} from 'antd'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable} from '../../../../components/'
import AddTMSOrderProductModal from './AddTMSOrderProductModal.jsx'

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class AddTMSOrderCargoModal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false,
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    onOk = ()=> {
        this.props.form.validateFields((err, values) => {
            if (err) {
                console.log('form has err', err)
                return ;
            }

            console.log('form has values', values)
            this.props.callback && this.props.callback({
                click: 'ok',
                data: values
            });
            this.props.form.resetFields()
        });
        /*return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));*/
    };

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        })
        this.props.form.resetFields()
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
        const {title, visible, data, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;

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

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 16},
        };
        const wrapperColStyle = {
            width: 200
        };
        const formEle = (
            <Form
                vertical>
                {getFieldDecorator('_rowIdx', {
                    initialValue: data._rowIdx,
                    rules: false
                })(
                    <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                        />
                )}
                <Form.Item
                    {...formItemLayout}
                    label="货物名称"
                    >
                    {getFieldDecorator('name', {
                        initialValue: data.name,
                        rules: false
                    })(
                        <Input // style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="包装方式"
                    >
                    {getFieldDecorator('packagesType', {
                        initialValue: data.packagesType || '纸箱',
                        rules: false
                    })(
                        <Select placeholder="请选择包装方式">
                            <Select.Option value="纸箱">纸箱</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="件数"
                    >
                    {getFieldDecorator('packagesCount', {
                        initialValue: data.packagesCount,
                        rules: false
                    })(
                        <InputNumber min={1} style={wrapperColStyle}/>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="净重"
                    >
                    {getFieldDecorator('weight', {
                        initialValue: data.weight,
                        rules: false
                    })(
                        <InputNumber min={0}  style={wrapperColStyle}/>
                    )}
                    <span style={{marginLeft: 8}}>千克</span>
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="毛重"
                    >
                    {getFieldDecorator('grossWeight', {
                        initialValue: data.grossWeight,
                        rules: false
                    })(
                        <InputNumber min={0}  style={wrapperColStyle}/>
                    )}
                    <span style={{marginLeft: 8}}>千克</span>
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="备注"
                    >
                    {getFieldDecorator('remark', {
                        initialValue: data.remark,
                        rules: false
                    })(
                        <Input
                            type="textarea"
                            autosize={{ minRows: 2, maxRows: 6 }}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
            </Form>
        );
        return (
            <ModalA
                // confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                width={600}
                bodyHeight={500}
                {...props}
                >
                {formEle}
            </ModalA>
        )
    }
}

AddTMSOrderCargoModal.propTypes = {
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

AddTMSOrderCargoModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

AddTMSOrderCargoModal = Form.create()(AddTMSOrderCargoModal);

export default AddTMSOrderCargoModal;