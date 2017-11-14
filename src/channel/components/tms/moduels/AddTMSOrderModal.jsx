import React, { Component, PropTypes } from 'react';
import {Form, Select, Upload, Icon, Input, DatePicker,
    Popconfirm, Row, Col, Button, InputNumber} from 'antd'
import moment from 'moment'
import {dimsMap} from '../../helpers/'
import {remove} from 'antd/../../src/utils/arrayUtils.js'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable} from '../../../../components/'
import AddTMSOrderCargoModal from './AddTMSOrderCargoModal.jsx'
import SelectOrderModal from './SelectOrderModal.jsx'
import {DisplayPDFModal} from '../../order/modules/'
import pdfUrl from 'antd/../../public/assets/img/pdf.png'
import rarUrl from 'antd/../../public/assets/img/rar.png'
import zipUrl from 'antd/../../public/assets/img/zip.png'
import unKnowUrl from 'antd/../../public/assets/img/unknow.png'
const {tms: {tempType: TEMP_TYPE}} = dimsMap;
const { Editors, Formatters } = require('react-data-grid-addons');

const { AutoComplete: AutoCompleteEditor, DropDownEditor } = Editors;
const { DropDownFormatter } = Formatters;

const packagesType = [
    { id: '纸箱', value: '纸箱', text: '纸箱', title: '纸箱' },
];
const packagesTypeEditor = <DropDownEditor options={packagesType}/>;

const packagesTypeFormatter = <DropDownFormatter options={packagesType}/>;

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class AddTMSOrderModal extends Component{
    _retInitialState = ()=>{
        return {
            tableLoading: false,
            fileList: [],
            tempType: undefined,                        // 温度要求类型
            minTemp: undefined,                         // 最低温度
            maxTemp: undefined,                         // 最高温度
            listPage: {
                pageIndex: 1,
                pageSize: 1000,
                rows: [],
                total: 0
            },
            addTMSOrderCargoModal: {                    // 添加货物对话框
                visible: false,
                title: '',
                data: {}
            },
            displayPDFModal: {                          // pdf对话框
                visible: false,
                title: '',
                fileUrl: undefined,
                data: {}
            },
            selectOrderModal: {                         // 选择订单对话框
                visible: false,
                title: '',
                data: {}
            }
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    componentWillReceiveProps(nextProps){
        // console.log(nextProps)
        const {visible, data: {details = [], tempType}} = nextProps;
        const {data: newData} = nextProps;
        const {data: oldData} = this.props;
        if(visible && newData !== oldData) {
            let minTemp, maxTemp;
            if(tempType == 2){
                minTemp = 2;
                maxTemp = 8;
            }
            this.setState(({listPage})=> {
                return {
                    minTemp,
                    maxTemp,
                    tempType,
                    listPage: {
                        ...listPage,
                        total: details.length,
                        rows: details
                    }
                }
            })
        }
    }


    handleRowUpdated = ({ rowIdx, updated })=> {
        // merge updated row with current row and rerender by setting state
        const {listPage} = this.state;
        const {rows} = listPage;
        Object.assign(rows[rowIdx], updated);
        this.setState({
            listPage
        });
    };

    createRows = (numberOfRows)=> {
        const {listPage: {rows}} = this.state;
        for (let i = 0; i < numberOfRows; i++) {
            rows.push(createFakeRowObjectData());
        }
        return rows;
    };

    createFakeRowObjectData = () => {
        return {
            createTime: faker.image.avatar(),
            exitWay: faker.address.county(),
            companyName2: faker.internet.email(),
            contact: faker.name.prefix(),
            mobile: faker.name.firstName(),
            applyBillCode: faker.name.lastName(),
            applyBillFile: faker.address.streetName(),
            status: faker.address.zipCode(),
            date: faker.date.past().toLocaleDateString(),
            bs: faker.company.bs(),
            catchPhrase: faker.company.catchPhrase(),
            companyName: faker.company.companyName(),
            words: faker.lorem.words(),
            sentence: faker.lorem.sentence()
        };
    };

    onOk = ()=> {
    this.props.form.validateFieldsAndScroll((err, values) => {
        if (err) {
            return;
        }

        const {takeDeliveryTime} = values;
        this.props.callback && this.props.callback({
            click: 'ok',
            data: {
                ...values,
                takeDeliveryTime: takeDeliveryTime && takeDeliveryTime.unix()*1000,
                details: this.state.listPage.rows
            },
            callback: ()=>{
                this.setState(this._retInitialState());
                this.props.form.resetFields()
            }
        });
    });
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
        this.props.form.resetFields()
    };

    /*
     * @interface 显示添加货物对话框
     * */
    add = ({type, data})=>{
        if(type === 'add') {
            this.setState(({addTMSOrderCargoModal})=> {
                return {
                    addTMSOrderCargoModal: {
                        ...addTMSOrderCargoModal,
                        visible: true,
                        data: {}
                    }
                }
            });
        }
        if(type === 'edit') {
            this.setState(({addTMSOrderCargoModal})=> {
                return {
                    addTMSOrderCargoModal: {
                        ...addTMSOrderCargoModal,
                        visible: true,
                        data: data
                    }
                }
            });
        }
    };

    /*
     * @interface 隐藏添加货物对话框
     * */
    hiddenAdd = ()=>{
        this.setState(({addTMSOrderCargoModal})=>{
            return {
                addTMSOrderCargoModal: {
                    ...addTMSOrderCargoModal,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 更新产品明细列表
     * @param {object} _props 对话框返回信息对象
     * */
    updateProductDetails = ({data: {_rowIdx}, data})=>{
        const {listPage: {rows}} = this.state;
        // 是否添加产品还是编辑产品
        const _pItem = _rowIdx === undefined || _rowIdx === null;
        delete data['_rowIdx'];
        if(_pItem){
            // case1. 添加产品
            rows.push(data);
            this.setState(({listPage})=>{
                return {
                    listPage: {
                        ...listPage,
                        rows
                    }
                }
            });
        }else{
            // case2. 修改产品
            const _d = rows.map((item, i)=>{
                if(_rowIdx === i){
                    return data
                }else{
                    return item
                }
            });
            this.setState(({listPage})=>{
                return {
                    listPage: {
                        ...listPage,
                        rows: _d
                    }
                }
            });
        }
    };

    /*
     * @interface 添加货物对话框的回调
     * @param {object} info 返回的信息对象
     * */
    addCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenAdd()
        }

        // 如果点击确定按钮，则刷新货物列表
        if(click === 'ok'){
            this.updateProductDetails({data})
            this.hiddenAdd()
        }
    };


    /*
     * @interface 选择订单
     * */
    selectOrderClick = ()=>{
        this.showSelectOrder();
    };

    /*
     * @interface 显示选择订单对话框
     * */
    showSelectOrder = ()=>{
        this.setState(({selectOrderModal})=>{
            return {
                selectOrderModal: {
                    ...selectOrderModal,
                    status: 'loading',
                    visible: true,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 隐藏选择订单对话框
     * */
    hiddenSelectOrder = ()=>{
        this.setState(({selectOrderModal})=>{
            return {
                selectOrderModal: {
                    ...selectOrderModal,
                    visible: false,
                    status: 'done',
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 选择订单对话框的回调
     * @param {object} info 返回的信息对象
     * */
    selectOrderCallback = (info)=>{
        const {click, data} = info;
        console.log(data);
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenSelectOrder()
        }
        if(click === 'ok'){
            this.props.form.setFieldsValue({
                'orderId': data['id'],
                'orderCode': data['code']
            });
            this.hiddenSelectOrder()
        }


        // 如果点击确定按钮，则提交表单
    };

    /*
    * @interface 删除一条货物记录
    * @param {object} props 删除的行对象
    * */
    del = ({rowIdx})=>{
        const {listPage} = this.state;
        const {rows} = listPage;
        const _s = remove(rows, rowIdx);
        this.setState({
            listPage
        })
    };

    /*
     * @interface 显示pdf对话框
     * @param {object} 参数对象
     * */
    displayPDFModal = ({fileUrl, data})=>{
        this.setState(({displayPDFModal})=>{
            return {
                displayPDFModal: {
                    ...displayPDFModal,
                    visible: true,
                    fileUrl,
                    data: {
                        ...data
                    }
                }
            }
        })
    };

    /*
     * @interface 隐藏添加产品对话框
     * */
    hiddenDisplayPDFModal = ()=>{
        this.setState(({displayPDFModal})=>{
            return {
                displayPDFModal: {
                    ...displayPDFModal,
                    visible: false,
                    fileUrl: undefined,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 添加产品对话框的回调
     * @param {object} info 对话框返回的信息对象
     * */
    displayPDFModalCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenDisplayPDFModal();
            return;
        }
    };

    /*
    * @interface 根据温度要求类型设置最低最高温度
    * */
    setMinDMaxTemp = (rule, value, callback)=>{
        if(value == 2){
            this.props.form.setFieldsValue({
                'minTemp': 2,
                'maxTemp': 8
            })
        }else{
            this.props.form.setFieldsValue({
                'minTemp': undefined,
                'maxTemp': undefined
            })
        }
        callback()
    };

    render(){
        const {title, visible, confirmLoading, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {listPage: {pageIndex, pageSize, rows, total}, tableLoading,
            addTMSOrderCargoModal, fileList, displayPDFModal,
            selectOrderModal, minTemp, maxTemp} = this.state;

        // console.log(this.state.listPage)

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
                console.log('Current: ', current);
            }
        };

        const _columns = [
            {
                key: 'sn',
                name: '序号',
                width: 100,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                locked: true,
                formatter: ({dependentValues,rowIdx, column})=> {
                    return (
                        <span>{(pageIndex - 1) * pageSize + rowIdx + 1}</span>
                    )
                }
            },
            {
                key: 'operation',
                name: '操作',
                width: 200,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                locked: true,
                formatter: ({dependentValues,rowIdx, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>
                            <a style={style}>
                                <Button
                                    onClick={this.add.bind(this, {type: 'edit', data: {...dependentValues, _rowIdx: rowIdx}})}
                                    title={`修改`}
                                    type="primary"
                                    shape="circle"
                                    icon="edit" />
                            </a>
                            <Popconfirm
                                placement="topLeft"
                                title={`你确定要删除这条货物记录吗？`}
                                onConfirm={this.del.bind(this, {rowIdx, data: dependentValues})}
                                okText="确定"
                                cancelText="取消">
                                <a style={style}>
                                    <Button
                                        title={`删除`}
                                        type="danger"
                                        shape="circle"
                                        icon="delete" />
                                </a>
                            </Popconfirm>
                        </span>
                    )
                },
               /* events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'name',
                name: '产品名称 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                editable: true,
                /*formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/

            },
            {
                key: 'packagesType',
                name: '包装类型',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                editor: packagesTypeEditor,
                formatter: packagesTypeFormatter
            },
            {
                key: 'packagesCount',
                name: '包装数量',
                width: 200,
                sortable: false,
                editable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
               // formatter: IndexFormatter,
               /* events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'weight',
                name: '净重',
                width: 200,
                sortable: false,
                editable: true,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    return (
                        <span>{value}</span>
                    )
                },
              /*  events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'grossWeight',
                name: '毛重 ',
                width: 200,
                sortable: false,
                editable: true,
               /* events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            },
            {
                key: 'remark',
                name: '备注 ',
                sortable: false,
                editable: true,
                width: 200,
               /* formatter: IndexFormatter,
                events: {
                    onDoubleClick: function () {
                        console.log('The user double clicked on title column');
                    }
                }*/
            }
        ];

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
            style: {margin: '0 0 16px 0', width: 300}
        };

        const formItemLayout2 = {
            labelCol: {span: 3},
            wrapperCol: {span: 15},
            style: {margin: '0 0 16px 0', width: 800}
        };

        const wrapperColStyle = {
            width: 200
        };

        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        const fileUploadProps = {
            name: 'file',
            action: CONFIG.uploadUrl,
            headers: {
                authorization: localStorage.getItem(CONFIG.token),
            },
            showUploadList: true,
            accept: 'application/pdf',
            listType: 'picture-card',
            fileList: fileList,
            beforeUpload: (file)=> {
                const isPDF = file.type === 'application/pdf';
                if (!isPDF) {
                    this.props.form.setFields({
                        billFile: {
                            value: '',
                            errors: [new Error('请上传PDF类型的提货单')],
                        }
                    });
                }
                return isPDF;
            },
            onRemove: (file)=>{
                // console.log(file)
                this.props.form.setFields({
                    [`billFile`]: {
                        value: undefined,
                        errors: null
                    }
                });
            },
            onPreview: (file)=>{
                // console.log(file)
                this.displayPDFModal({fileUrl: `${CONFIG.ossFileUrl}${file.filePath}`});
                //window.open(`${CONFIG.ossFileUrl}/${file.filePath}`)
            },
            onChange: (info)=> {
                let fileList = info.fileList;

                // 1. Limit the number of uploaded files
                //    Only to show two recent uploaded files, and old ones will be replaced by the new
                fileList = fileList.slice(-1);

                // 2. read from response and show file link
                fileList = fileList.map((file, i) => {
                    if (file.response) {
                        // Component will show file.url as link
                        // step1. 设置文件对象属性
                        file.name = '';
                        file.filePath = file.response.responseObject.filePath;
                        file.url = '';
                        file.thumbUrl = pdfUrl;
                        // step2. 设置文件隐藏域值和审批单号域的值
                        this.props.form.setFields({
                            [`billFile`]: {
                                value: file.response.responseObject.filePath,
                                errors: null
                            }
                        });
                    }
                    return file;
                });

                // 3. filter successfully uploaded files according to response from server
                fileList = fileList.filter((file) => {
                    if (file.response) {
                        return file.response.success
                    }
                    return true;
                });

                this.setState({ fileList });
            }
        };
        const formEle = (
            <Form inline>
                {   getFieldDecorator(`id`, {
                    initialValue: data.id,
                    rules: null
                })(
                    <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                        />
                )}
                <Form.Item
                    {...formItemLayout}
                    label="运单编号"
                  >
                    {getFieldDecorator('code', {
                        initialValue: data.code,
                        rules: [
                            { required: true, message: '运单编号为必填项' },
                        ]
                    })(
                        <Input
                            placeholder="请输入运单编号"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="订单编号"
                    >
                    {getFieldDecorator('orderCode', {
                        initialValue: data.orderCode,
                        rules: [
                            { required: true, message: '请选择订单编号' },
                        ]
                    })(
                        <Input
                            placeholder="请选择订单编号"
                            disabled
                            style={{width: wrapperColStyle.width - 40, marginRight: 8}}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                    {getFieldDecorator('orderId', {
                        initialValue: data.orderId,
                        rules: false
                    })(
                        <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                    {getFieldDecorator('orderTable', {
                        initialValue: 'cross_order',
                        rules: false
                    })(
                        <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                    <Button
                        onClick={this.selectOrderClick}
                        type="primary"
                        shape="circle"
                        icon="search">
                    </Button>
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="计划提货日期"
                    >
                    {getFieldDecorator('takeDeliveryTime', {
                        initialValue: !data.takeDeliveryTime ? data.takeDeliveryTime: moment(data.takeDeliveryTime),
                        rules: [
                            { required: true, type: 'object', message: '计划提货日期为必填项' },
                        ]
                    })(
                        <DatePicker style={{width: 200}}/>
                    )}
                </Form.Item>
                {/*<Form.Item
                    {...formItemLayout}
                    label="车辆类型"
                    >
                    {getFieldDecorator('typeOfCar', {
                        initialValue: data.typeOfCar,
                        rules: false
                    })(
                        <Select
                            placeholder="请选择车辆类型"
                            allowClear={true}
                            multiple={false}
                            combobox={false}
                            tags={false}
                            showSearch={false}
                            filterOption={false}
                            optionFilterProp={`children`}
                            // notFoundContent={`没有相关的司机`}
                            labelInValue={false}
                            tokenSeparators={null}>
                            <Select.Option value="1">普通车</Select.Option>
                            <Select.Option value="2">冷链车</Select.Option>
                        </Select>
                    )}
                </Form.Item>*/}
                <Form.Item
                    {...formItemLayout}
                    label="温度要求"
                    >
                    {getFieldDecorator('tempType', {
                        initialValue: data.tempType,
                        rules: [
                            { required: true, message: '请选择温度要求' },
                            {validator: this.setMinDMaxTemp}
                        ]
                    })(
                        <Select
                            placeholder="请选择温度要求"
                            allowClear={true}
                            multiple={false}
                            combobox={false}
                            tags={false}
                            showSearch={false}
                            filterOption={false}
                            optionFilterProp={`children`}
                            // notFoundContent={`没有相关的司机`}
                            labelInValue={false}
                            tokenSeparators={null}>
                            <Select.Option value="1">{TEMP_TYPE[1]}</Select.Option>
                            <Select.Option value="2">{TEMP_TYPE[2]}</Select.Option>
                            <Select.Option value="3">{TEMP_TYPE[3]}</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="最低温(℃)"
                    >
                    {getFieldDecorator('minTemp', {
                        initialValue: data.minTemp || minTemp,
                        rules: false
                    })(
                        <InputNumber
                            placeholder="请输入最低温度要求"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="最高温(℃)"
                    >
                    {getFieldDecorator('maxTemp', {
                        initialValue: data.maxTemp || maxTemp,
                        rules: false
                    })(
                        <InputNumber
                            placeholder="请输入最高温度要求"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                          />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="总件数"
                    >
                    {getFieldDecorator('packageCount', {
                        initialValue: data.packageCount,
                        rules: [
                            { required: false, message: '请输入总件数' },
                        ]
                    })(
                        <InputNumber
                            placeholder="请输入总件数"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="收货单位"
                    >
                    {getFieldDecorator('receiver', {
                        initialValue: data.receiver,
                        rules: [
                            { required: true, message: '收货单位为必填项' },
                        ]
                    })(
                        <Input
                            placeholder="请输入收单位"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="收货单位电话"
                    >
                    {getFieldDecorator('receiverPhone', {
                        initialValue: data.receiverPhone,
                        rules: false
                    })(
                        <Input
                            placeholder="请输入收货单位电话"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout2}
                    label="收货地址"
                    >
                    {getFieldDecorator('receiverAddress', {
                        initialValue: data.receiverAddress,
                        rules: [
                            { required: true, message: '收货地址为必填项' },
                        ]
                    })(
                        <Input placeholder="请输入收货地址"// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="发货单位"
                    >
                    {getFieldDecorator('sender', {
                        initialValue: data.sender,
                        rules: [
                            { required: true, message: '发货单位为必填项' },
                        ]
                    })(
                        <Input
                            placeholder="请输入发货单位"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="发货单位电话"
                    >
                    {getFieldDecorator('senderPhone', {
                        initialValue: data.senderPhone,
                        rules: false
                    })(
                        <Input
                            placeholder="请输入发货单位电话"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <div></div>
                <Row>
                    <Col span={16}>
                        <Form.Item
                            {...formItemLayout2}
                            label="发货单位地址"
                            >
                            {getFieldDecorator('senderAddress', {
                                initialValue: data.senderAddress,
                                rules: [
                                    { required: true, message: '发货单位地址为必填项' },
                                ]
                            })(
                                <Input placeholder="请输入发货单位地址"// style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )}
                        </Form.Item>
                        <div></div>
                        <Form.Item
                            {...formItemLayout2}
                            label="备注"
                            >
                            {getFieldDecorator('remark', {
                                initialValue: data.remark,
                                rules: false
                            })(
                                <Input
                                    placeholder="请输入备注"
                                    type="textarea"
                                    autosize={{ minRows: 2, maxRows: 6 }}// style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )}
                        </Form.Item>
                    </Col>
                    {/*<Col span={8}>
                        <Form.Item
                            {...formItemLayout}
                            label="提货单附件"
                            >
                            <div className="file-upload-container-inline">
                                <Upload {...fileUploadProps}>
                                    {/!*<UploadButton style={{marginRight: 16}}>Click to upload</UploadButton>*!/}
                                    {fileList.length >= 1 ? null : uploadButton}
                                </Upload>
                                {getFieldDecorator(`billFile`, {
                                    initialValue: data.billFile,
                                    rules: [
                                        { required: false},
                                    ],
                                    valuePropName: 'value',
                                })(
                                    <Input type="hidden" // style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </div>
                        </Form.Item>
                    </Col>*/}
                </Row>
            </Form>
        );
        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                {...props}
                >
                <div className="hidden">
                    <AddTMSOrderCargoModal
                        {...addTMSOrderCargoModal}
                        callback={this.addCallback}/>
                    <DisplayPDFModal
                        {...displayPDFModal}
                        callback={this.displayPDFModalCallback}/>
                    <SelectOrderModal
                        {...selectOrderModal}
                        callback={this.selectOrderCallback}/>
                </div>
                {formEle}
                <ButtonContainer span={24} style={{ textAlign: 'left', marginBottom: 0}}>
                    <AddButton onClick={this.add.bind(this, {type: 'add', data: {}})}>添加货物</AddButton>
                </ButtonContainer>
                <GridTable
                    tableLoading={tableLoading}
                    enableCellSelect={true}
                    dataSource={rows}
                    columns={_columns}
                    onRowUpdated={this.handleRowUpdated}
                    onGridRowsUpdated={this.handleGridRowsUpdated}
                    rowHeight={36}
                    minHeight={360}
                    // rowRenderer={RowRenderer}
                    rowScrollTimeout={0}
                    onGridSort={this.handleGridSort}
                    pagination={_pagination}
                    />
            </ModalA>
        )
    }
}

AddTMSOrderModal.propTypes = {
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

AddTMSOrderModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

AddTMSOrderModal = Form.create()(AddTMSOrderModal);

export default AddTMSOrderModal;