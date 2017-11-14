import React, { Component, PropTypes } from 'react';
import {Form, Select, Upload, Icon, Input, DatePicker,
    Popconfirm, Row, Col, Button, InputNumber, message} from 'antd'
import moment from 'moment'
import {remove} from 'antd/../../src/utils/arrayUtils.js'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable} from '../../../../components/'
import AddCheckNotificationCargoModal from './AddCheckNotificationCargoModal.jsx'
import SelectOrderModal from './SelectOrderModal.jsx'
import DisplayPDFModal from './DisplayPDFModal.jsx'
import pdfUrl from 'antd/../../public/assets/img/pdf.png'
import rarUrl from 'antd/../../public/assets/img/rar.png'
import zipUrl from 'antd/../../public/assets/img/zip.png'
import unKnowUrl from 'antd/../../public/assets/img/unknow.png'
import {dimsMap} from '../../helpers/'
const {custom: {entryExit, level}, tms: {transportType}, product: {itemTypes, countUnit, weightUnit, valueUnit}} = dimsMap;

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class AddCheckNotificationModal extends Component{
    _retInitialState = ()=>{
        return {
            confirmLoading: false,
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
            addCheckNotificationCargoModal: {                    // 添加货物对话框
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

    /*
    * @interface 保存查验任务/通知
    * @param {object} _props 参数对象
    * */
    saveCheckNotification = ({data}, callback)=>{
        fetch('ciq.checktask.createnotice', {
            // method: 'post',
            // headers: {},
            data: data,
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    confirmLoading: true
                })
            },
            complete: (err, data)=>{
                this.setState({
                    confirmLoading: false
                })
            }
        })
    };

    onOk = ()=> {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }

            const {receivedDate} = values;
            this.saveCheckNotification({
                data: {
                    ...values,
                    receivedDate: receivedDate && receivedDate.unix() * 1000,
                    details: this.state.listPage.rows
                }
            }, (err, res)=>{
                // case1. 保存查验通知失败
                if(err){
                    message.error('保存查验通知单失败')
                    return;
                }

                // case2. 保存查验通知成功
                this.props.callback && this.props.callback({
                    click: 'ok',
                    data: {
                        ...values,
                        receivedDate: receivedDate && receivedDate.unix() * 1000,
                        details: this.state.listPage.rows
                    }
                });
                this.setState(this._retInitialState());
                this.props.form.resetFields()
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
    add = ({type, rowIdx, data})=>{
        if(type === 'add') {
            this.setState(({addCheckNotificationCargoModal})=> {
                return {
                    addCheckNotificationCargoModal: {
                        ...addCheckNotificationCargoModal,
                        visible: true,
                        data: {}
                    }
                }
            });
        }
        if(type === 'edit') {
            this.setState(({addCheckNotificationCargoModal})=> {
                return {
                    addCheckNotificationCargoModal: {
                        ...addCheckNotificationCargoModal,
                        visible: true,
                        data: {
                            ...data,
                            _rowIdx: rowIdx,
                        }
                    }
                }
            });
        }
    };

    /*
     * @interface 隐藏添加货物对话框
     * */
    hiddenAdd = ()=>{
        this.setState(({addCheckNotificationCargoModal})=>{
            return {
                addCheckNotificationCargoModal: {
                    ...addCheckNotificationCargoModal,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 添加货物对话框的回调
     * @param {object} info 返回的信息对象
     * */
    addCallback = (info)=>{
        const {click, data = {}} = info;
        // case1. 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenAdd()
        }

        // case2. 如果点击确定按钮，则刷新货物列表
        if(click === 'ok'){
            const {listPage: {rows}} = this.state;
            const {_rowIdx} = data;
            // case2-case1. 如果是修改操作，修改对应的行数据
            if(_rowIdx !== undefined) {
               const _rs = rows.map((row, i)=>{
                   if(i === _rowIdx){
                       return data;
                   }else{
                       return row;
                   }
               });
                this.setState(({listPage})=> {
                    return {
                        listPage: {
                            ...listPage,
                            rows: _rs
                        }
                    }
                });
            }else {
                rows.push(data);
                console.log(rows);
                this.setState(({listPage})=> {
                    return {
                        listPage: {
                            ...listPage,
                            rows
                        }
                    }
                });
            }
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
    * @interface 获取订单相关的报检单号和核销单号
    * @param {object} _props 参数对象
    * */
     getEciqCodeNWriteBillOffCode = ({orderId}, callback)=>{
        fetch('ciq.crossorderstep.list', {
            // method: 'post',
            // headers: {},
            data: orderId,
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{

            },
            complete: (err, data)=>{

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
            // step1. 获取订单相关报检单号和核销单号
            this.getEciqCodeNWriteBillOffCode({orderId: {id: data['id']}}, (err, res)=>{
                // s1-case1. 获取报检单号和核销单号
                if(err){
                    this.props.form.setFields({
                        'eciqCode': {
                            value: undefined,
                            error: [new Error('获取订单相关报检单号失败，请重新选择订单')]
                        },
                        'writeBillOfCode': {
                            value: undefined,
                            error: [new Error('获取订单相关核销单号失败，请重新选择订单号')]
                        }
                    });
                    return
                }
                // s1-case2. 获取报检单号和核销单号成功
                let eciqCode, writeOffBillCode;
                const {responseObject: {rows = []}} = res;
                rows.map((step)=>{
                    if(step.billName === '报检单'){
                        eciqCode = step.billCode
                    }
                    if(step.billName === '核销单'){
                        writeOffBillCode = step.billCode;
                    }
                });
                this.props.form.setFields({
                    'eciqCode': {
                        value: eciqCode,
                        error: (!eciqCode || eciqCode === '') ?
                            [new Error('该订单的报检单号为空，请先完成订单报检或者请选择其他订单')] :
                            null
                    },
                    'writeOffBillCode': {
                        value: writeOffBillCode,
                        error: (!writeOffBillCode || writeOffBillCode) === '' ?
                            [new Error('该订单的核销单号为空，请先完成订单核销或者请选择其他订单')] :
                            null
                    }
                });
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
        const {title, visible, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {listPage: {pageIndex, pageSize, rows, total}, tableLoading,
            addCheckNotificationCargoModal, fileList, displayPDFModal,
            selectOrderModal, minTemp, maxTemp, confirmLoading} = this.state;

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
                                    onClick={this.add.bind(this, {type: 'edit', rowIdx, data: dependentValues})}
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
                name: '中文名称 ',
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
                key: 'nameEn',
                name: '英文名称 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                // editable: true,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'type',
                name: '物品类别 ',
                width: 200,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{itemTypes[value] && itemTypes[value]['title']}</span>
                    )
                },
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                // editable: true,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'subType',
                name: '物品种类 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues: {type},rowIdx, value, column})=> {
                    return (
                        <span>{ itemTypes[type] &&
                        itemTypes[type]['itemTypes'][value]}</span>
                    )
                },
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'productCount',
                name: '数量 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'countUnit',
                name: '数量单位 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{countUnit[value]}</span>
                    )
                },
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'productWeight',
                name: '重量 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'weightUnit',
                name: '重量单位 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{weightUnit[value]}</span>
                    )
                },
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'productValue',
                name: '货值 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'valueUnit',
                name: '货值单位 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const style = {marginRight: 8}
                    return (
                        <span>{valueUnit[value]}</span>
                    )
                },
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'manufacturer',
                name: '生产厂家 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'country',
                name: '原产国 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'spec',
                name: '规则 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'compositions',
                name: '成分列表 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/

            },
            {
                key: 'purpose',
                name: '用途 ',
                width: 200,
                sortable: false,
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
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
                    label="报检单号"
                    >
                    {getFieldDecorator('eciqCode', {
                        initialValue: data.eciqCode,
                        rules: [
                            { required: true, message: '请选择订单号，自动填入报检单号' },
                        ]
                    })(
                        <Input
                            disabled
                            placeholder="请选择订单号，自动填入报检单号"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="核销单号"
                    >
                    {getFieldDecorator('writeOffBillCode', {
                        initialValue: data.writeOffBillCode,
                        rules: [
                            { required: true, message: '请选择订单号，自动填入核销单号' },
                        ]
                    })(
                        <Input
                            disabled
                            placeholder="请选择订单号，自动填入核销单号"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                {/*<Form.Item
                    {...formItemLayout}
                    label="申请单位"
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
                </Form.Item>*/}
                <Form.Item
                    {...formItemLayout}
                    label="发货单位"
                    >
                    {getFieldDecorator('sender', {
                        initialValue: data.sender,
                        rules: [
                            { required: true, message: '请输入发货单位' },
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
                    label="收货单位"
                    >
                    {getFieldDecorator('receiver', {
                        initialValue: data.receiver,
                        rules: [
                            { required: true, message: '请输入收货单位' },
                        ]
                    })(
                        <Input
                            placeholder="请输入收货单位"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                 {...formItemLayout}
                 label="出/入境类型"
                 >
                     {getFieldDecorator('exitEntryType', {
                         initialValue: data.exitEntryType,
                         rules: [
                             { required: true, message: '请选择出/入境类型' },
                         ]
                     })(
                         <Select
                             placeholder="请选择出入境类型"
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
                                 <Select.Option value={1}>{entryExit[1]}</Select.Option>
                                 <Select.Option value={2}>{entryExit[2]}</Select.Option>
                         </Select>
                     )}
                 </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="贸易国家"
                    >
                    {getFieldDecorator('country', {
                        initialValue: data.country,
                        rules: [
                            { required: true, message: '请输入贸易国家' },
                        ]
                    })(
                        <Input
                            placeholder="请输入贸易国家"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="出/入境口岸"
                    >
                    {getFieldDecorator('entryPort', {
                        initialValue: data.entryPort,
                        rules: [
                            { required: true, message: '请输入出/入境口岸' },
                        ]
                    })(
                        <Input
                            placeholder="请输入出/入境口岸"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                {/*<Form.Item
                    {...formItemLayout}
                    label="起运口岸"
                    >
                    {getFieldDecorator('exitPort', {
                        initialValue: data.exitPort,
                        rules: [
                            { required: true, message: '请输入起运口岸' },
                        ]
                    })(
                        <Input
                            placeholder="请输入起运口岸"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="停经口岸"
                    >
                    {getFieldDecorator('viaPort', {
                        initialValue: data.viaPort,
                        rules: [
                            { required: false, message: '请输入停经口岸' },
                        ]
                    })(
                        <Input
                            placeholder="请输入停经口岸"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>*/}
                <Form.Item
                    {...formItemLayout}
                    label="报检口岸"
                    >
                    {getFieldDecorator('checkPort', {
                        initialValue: data.checkPort,
                        rules: [
                            { required: true, message: '请输入报检口岸' },
                        ]
                    })(
                        <Input
                            placeholder="请输入报检口岸"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="运输方式"
                    >
                    {getFieldDecorator('transportType', {
                        initialValue: data.transportType,
                        rules: false
                    })(
                        <Select
                            placeholder="请选择运输方式"
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
                            <Select.Option value="1">{transportType[1]}</Select.Option>
                            <Select.Option value="2">{transportType[2]}</Select.Option>
                            <Select.Option value="3">{transportType[3]}</Select.Option>
                        </Select>
                    )}
                </Form.Item>
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
                            <Select.Option value="1">常温</Select.Option>
                            <Select.Option value="2">冷链(2℃~8℃)</Select.Option>
                            <Select.Option value="3">冷冻</Select.Option>
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
                    label="特殊物品级别"
                    >
                    {getFieldDecorator('level', {
                        initialValue: data.level,
                        rules: [
                            { required: true, message: '请选择特殊物品级别' },
                        ]
                    })(
                        <Select
                            placeholder="请选择特殊物品级别"
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
                            <Select.Option value="1">{level[1]}</Select.Option>
                            <Select.Option value="2">{level[2]}</Select.Option>
                            <Select.Option value="3">{level[3]}</Select.Option>
                            <Select.Option value="4">{level[4]}</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="到货日期"
                    >
                    {getFieldDecorator('receivedDate', {
                        initialValue: !data.receivedDate ? data.receivedDate: moment(data.receivedDate),
                        rules: false
                    })(
                        <DatePicker style={{width: 200}}/>
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="合同号"
                    >
                    {getFieldDecorator('contractNo', {
                        initialValue: data.contractNo,
                        rules: [
                            { required: false, message: '请输入合同号' },
                        ]
                    })(
                        <Input
                            placeholder="请输入合同号"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    {...formItemLayout}
                    label="提单号"
                    >
                    {getFieldDecorator('ladingBillCode', {
                        initialValue: data.ladingBillCode,
                        rules: [
                            { required: false, message: '请输入提单号' },
                        ]
                    })(
                        <Input
                            placeholder="请输入提单号"
                            style={wrapperColStyle}// style={{ width: '65%', marginRight: '3%' }}
                            />
                    )}
                </Form.Item>
                <Row>
                    <Col span={16}>
                        <Form.Item
                            {...formItemLayout2}
                            label="存放、使用地点"
                            >
                            {getFieldDecorator('address', {
                                initialValue: data.address,
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
                </Row>
            </Form>
        );
        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="保存"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                // bodyHeight={500}
                {...props}
                >
                <div className="hidden">
                    <AddCheckNotificationCargoModal
                        {...addCheckNotificationCargoModal}
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
                    <AddButton onClick={this.add.bind(this, {type: 'add', data: {}})}>添加产品</AddButton>
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

AddCheckNotificationModal.propTypes = {
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

AddCheckNotificationModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};

AddCheckNotificationModal = Form.create()(AddCheckNotificationModal);

export default AddCheckNotificationModal;