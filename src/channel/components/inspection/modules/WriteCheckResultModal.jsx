import React, { Component, PropTypes } from 'react';
import faker from 'faker'
import {Form, Select, Input, Upload, Alert, Popconfirm, message, Spin, Icon, Modal, Button, Tabs} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {ModalA, BodyGridTable, GridTable, ButtonContainer, Drawer} from '../../../../components/'
import WriteCheckResultNotPassModal from './WriteCheckResultNotPassModal.jsx'
import {fetch, CONFIG} from 'antd/../../src/services/'
import {dimsMap} from '../../helpers/'
const {order: {orderType}, inspection: {checkResult}, tms: {tempType}, product: {itemTypes, countUnit, weightUnit, valueUnit}, custom: {entryExit}} = dimsMap;
import './writeCheckResultModal.less'

/*createRows(numberOfRows) {
 let rows = [];
 for (let i = 0; i < numberOfRows; i++) {
 rows[i] = this.createFakeRowObjectData(i);
 }
 return rows;
 }

 createFakeRowObjectData(index) {
 return {
 id: index,
 name: faker.image.avatar(),
 nameEn: faker.address.county(),
 type: faker.internet.email(),
 subType: faker.name.prefix(),
 productCount: faker.name.firstName(),
 countUnit: faker.name.lastName(),
 productWeight: faker.address.streetName(),
 weightUnit: faker.address.zipCode(),
 productValue: faker.date.past().toLocaleDateString(),
 valueUnit: faker.company.bs(),
 manufacturer: faker.company.catchPhrase(),
 country: faker.company.companyName(),
 spec: faker.lorem.words(),
 compositions: faker.lorem.sentence(),
 purpose: faker.lorem.sentence(),
 };
 }*/

function noop(){}

class WriteCheckResultModal extends Component{

    _retInitialState = ()=>{
        return {
            spinning: false,                                  // 列表加载loading状态
            tip: '',                                            // 列表加载文本
            // details: [],                                        // 产品明细列表
            orderId: undefined,
            hexiaodanCode: undefined,
            listPage: {                                         // 产品列表
                pageIndex: 1,
                pageSize: 99999,
                rows: [],
                total: 0
            },
            drawerFold: true,
            selectedIds: [],                                    // 已选定的行数据ids
            selectedRows: [],                                   // 选中的行数据
            shenpidanFile: {                                       // 审批单相关信息
                status: 'loading',
                data: {}
            },
            hexiaodanFile: {                                       // 核销单相关信息
                status: 'laoding',
                data: {}
            },
            baojiandanFile: {                                      // 报检单相关信息
                status: 'loading',
                data: {}
            },
            writeCheckResultNotPassModal: {                     // 填写查验结果对话框
                visible: false,
                title: '',
                details: [],
                data: {}
            }
        }
    };

    /*
     * @interface 重置state和UI
     * */
    _resetAction = ()=>{
        // step1、重置state
        this.setState(this._retInitialState());
        // step2、重置表单
        this.props.form.resetFields();
    };

    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    componentWillReceiveProps(nextProps){
        const {details: newdetails, data, visible} = nextProps;
        const {details: oldDetails} = this.props;
        if(visible && newdetails !== oldDetails){
            // case1.. 规则化数据
            this.setState(({listPage})=>{
                return {
                    orderId: data.orderId,
                    listPage: {
                        ...listPage,
                        rows: [...newdetails],
                        total: newdetails && newdetails.length || 0
                    }
                }
            })
        }
    }

    /*
     * @interface 获取查验任务的货物列表
     * @param {object} _props 参数对象
     * @param {func} 回调函数
     * */
    getCheckTaskDetails = ({data}, callback)=>{
        fetch('ciq.checktask.taskdetail', {
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
                    tip: '获取查验任务产品列表中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    tip: ''
                })
            }
        })
    }

    reRenderDetails = ()=>{
        const {data: checkTaskRow} = this.props;
        this.getCheckTaskDetails({data: checkTaskRow}, (err, res)=> {
            if (err) {
                return;
            }

            const {responseObject = {}} = res;
            const {details = []} = responseObject;
            this.setState(({listPage})=>{
                return {
                    listPage: {
                        ...listPage,
                        rows: details
                    }
                }
            })
        })
    }

    onOk = ()=> {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            this.props.callback && this.props.callback({
                click: 'ok',
                data: {},
                callback: ()=>{
                    this._resetAction()
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
        this._resetAction()
    };

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
     * @interface 选中行接口
     * @param {Array} 选中的行
     * */
    onRowsSelected = (rows /*新增选择的行*/) =>{
        /* this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))});
         this.setState({selectedRows: this.state.selectedRows.concat(rows.map(r => r.row))});*/
        this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))});
        this.setState({selectedRows: this.state.selectedRows.concat(rows.map(r => r.row))});
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
            this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.toString().indexOf(i) === -1 )});
            this.setState({selectedRows: this.state.selectedRows.filter(r => rowIds.toString().indexOf(r[this.props.rowKey]) === -1 )});
        }else{
            // case2-case1. 采用合并，如果是只能选中一行采用赋值，如果是合并选中行，采用concat方法来合并操作
            this.setState({selectedIds: this.state.selectedIds.concat([clickedRow[this.props.rowKey]])});
            this.setState({selectedRows: this.state.selectedRows.concat([clickedRow])});
        }
    };

    /*
     * @interface 获取订单明细
     * @param {object} props 参数
     * */
    getOrderDetail = ({data}, callback)=>{
        fetch('ciq.crossorder.detail', {
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

            },
            complete: (err, data)=>{

            }
        })
    };

    /*
     * @interface 获取指定核销单信息
     * */
    getHeixaodanInfo = ({hexiaodanCode, orderId}, callback)=>{
        fetch('ciq.ciqclient.getorghexiaodan', {
            // method: 'post',
            // headers: {},
            data: {hexiaodanCode, orderId},
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState(({hexiaodanFile, shenpidanFile})=>{
                    return {
                        hexiaodanFile: {
                            ...hexiaodanFile,
                            status: 'loading'
                        },
                        shenpidanFile: {
                            ...shenpidanFile,
                            status: 'loading'
                        }
                    }
                })
            },
            complete: (err, data)=>{
                this.setState(({hexiaodanFile, shenpidanFile})=>{
                    return {
                        hexiaodanFile: {
                            ...hexiaodanFile,
                            status: 'success'
                        },
                        shenpidanFile: {
                            ...shenpidanFile,
                            status: 'success'
                        }
                    }
                })
            }
        })
    };

    /*
    * @interface 点击tabs的回调
    * */
    onTabClick = (tabKey)=>{
        const {orderId, hexiaodanCode} = this.state;
        if(tabKey == '1'){
            this.getHeixaodanInfo({hexiaodanCode, orderId}, (err, res)=>{
                if(err){
                    this.setState({
                        shenpidanFile: {
                            status: 'error',
                            data: {}
                        }
                    });
                    message.error(err.message)
                    return;
                }

                const {responseObject = {}} = res;
                const {hexiaodan, shenpidan} = responseObject;
                this.setState({
                    shenpidanFile: {
                        status: 'success',
                        data: shenpidan
                    },
                    hexiaodanFile: {
                        status: 'success',
                        data: hexiaodan
                    }
                })
            })
        }
        if(tabKey == '2'){
            this.getHeixaodanInfo({hexiaodanCode, orderId}, (err, res)=>{
                if(err){
                    this.setState({
                        hexiaodanFile: {
                            status: 'error',
                            data: {}
                        }
                    });
                    message.error(err.message)
                    return;
                }

                const {responseObject = {}} = res;
                const {hexiaodan, shenpidan} = responseObject;
                this.setState({
                    shenpidanFile: {
                        status: 'success',
                        data: shenpidan
                    },
                    hexiaodanFile: {
                        status: 'success',
                        data: hexiaodan
                    }
                })
            })
        }
        if(tabKey == '3'){
            this.getOrderDetail({data: {id: orderId}}, (err, res)=>{
                if(err){
                    this.setState({
                        baojiandanFile: {
                            status: 'error',
                            data: {}
                        }
                    });
                    message.error(err.message)
                    return;
                }

                const {responseObject} = res;
                this.setState({
                    baojiandanFile: {
                        status: 'success',
                        data: responseObject
                    }
                })
            })
        }
    }

    triggerDrawerFold = ()=>{
        // case1. 展开相关附件查看
        const {drawerFold, orderId} = this.state;
        if(drawerFold){
            if(orderId) {
                this.getOrderDetail({data: {id: orderId}}, (err, res)=>{
                    if(err){
                        message.error('获取相关数据失败，请稍后重试');
                        this.setState({
                            shenpidanFile: {
                                status: 'error',
                                data: {}
                            },
                            hexiaodanFile: {
                                status: 'error',
                                data: {}
                            },
                            baojiandanFile: {
                                status: 'error',
                                data: {}
                            }
                        });
                        return;
                    }

                    const {responseObject = {}} = res;
                    const {hexiaodanCode} = responseObject;
                    this.setState({
                        hexiaodanCode
                    });
                    this.getHeixaodanInfo({hexiaodanCode, orderId: orderId}, (err, res)=>{
                        if(err){
                            this.setState({
                                shenpidanFile: {
                                    status: 'error',
                                    data: {}
                                },
                                hexiaodanFile: {
                                    status: 'error',
                                    data: {}
                                }
                            });
                            message.error(err.message)
                            return;
                        }

                        const {responseObject = {}} = res;
                        const {hexiaodan, shenpidan} = responseObject;
                        this.setState({
                            shenpidanFile: {
                                status: 'success',
                                data: shenpidan
                            },
                            hexiaodanFile: {
                                status: 'success',
                                data: hexiaodan
                            }
                        })
                    })
                    this.getOrderDetail({data: {id: orderId}}, (err, res)=>{
                        if(err){
                            this.setState({
                                baojiandanFile: {
                                    status: 'error',
                                    data: {}
                                }
                            });
                            message.error(err.message)
                            return;
                        }

                        const {responseObject} = res;
                        this.setState({
                            baojiandanFile: {
                                status: 'success',
                                data: responseObject
                            }
                        })
                    })
                })
            }else{
                message.error('订单不存在');
                return;
            }
        }
        this.setState({
            drawerFold: !drawerFold
        })
    };

    /*
     * @interface 保存查验结果
     * @param {object} _props 参数对象
     * */
    saveCheckTaskResult = ({data: result}, callback)=>{
        fetch('ciq.checktask.savecheckresult', {
            // method: 'post',
            // headers: {},
            data: result,
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

    /*
    * @interface 查验通过click
    * @param {object} _props 参数对象
    * */
    writeCheckResultPassClick = ({data: selectedRows = []})=>{
        // step1. 确认通过提示对话框
        Modal.confirm({
            width: 416,
            iconType: 'exclamation-circle',
            okText: `${selectedRows && selectedRows.length <= 1 ? '通过' : '全部通过'}`,
            cancelText: '取消',
            title: '你确定以下产品都通过？',
            content:<div>
                    {selectedRows.map((row, i)=>{
                        return (
                            <div key={i}>{row.name}</div>
                        )
                    })}
                </div>,
            onOk: ()=>{
                const detailIds = selectedRows.map((row)=>{
                    return row.id
                });
                // step2. 提交查验通过xhr
                return new Promise((resolve, reject) => {
                    this.props.form.validateFieldsAndScroll((err, values) => {
                        if (err) {
                            return;
                        }
                        console.log('values:', values);
                        // step1. 保存查验结果
                       if(values.detailIds !== ""){
                             this.saveCheckTaskResult({
                               data: {
                                 ...values,
                                 checkResult: '2',
                                 //checkResultProblem: '',
                                 //checkResultOpinion: '',
                               }
                             }, (err, res)=>{
                               // s2-s1关闭对话框
                               resolve();
                               //s2-s1-case1. 提交失败
                               if(err){
                                 message.error('保存查验结果失败，请稍后重试')
                                 return;
                               }
                               // s2-s1-case2. 提交请求成功，重新刷新列表
                               message.success('保存查验结果成功！')
                               this.props.callback && this.props.callback({
                                   click: 'ok',
                                   data: null,
                               });
                               this.props.form.resetFields();
                               this.resetSelectedRowsNIds();
                               this.reRenderDetails();
                             });
                       }else{
                         message.warn('请选择产品名称')
                       }
                    });
                   /* this.saveCheckTaskResult({
                        data: {
                            detailIds: detailIds.join(','),
                            checkResult: '2',
                            checkResultProblem: '',
                            checkResultOpinion: ''
                        }
                    }, (err, res)=>{
                        // s2-s1关闭对话框
                        resolve();
                        //s2-s1-case1. 提交失败
                        if(err){
                            message.error('提交请求失败，请稍后重试');
                            return;
                        }

                        // s2-s1-case2. 提交请求成功，重新刷新列表
                        this.props.form.resetFields();
                        this.resetSelectedRowsNIds();
                        this.reRenderDetails();
                    })*/
                }).catch(() => console.log('Oops errors!'));
            },
            onCancel: ()=> {}
        });
    };

    /*
     * @interface 显示不通过确认对话框
     * */
    writeCheckResultNotPassClick = ({data: selectedRows})=>{
        // step1. 确认通过提示对话框
        Modal.confirm({
            width: 416,
            iconType: 'exclamation-circle',
            okText: `${selectedRows && selectedRows.length <= 1 ? '不通过' : '全部不通过'}`,
            cancelText: '取消',
            title: '你确定以下产品都不通过？',
            content:<div>
                {selectedRows.map((row, i)=>{
                    return (
                        <div key={i}>{row.name}</div>
                    )
                })}
            </div>,
            onOk: ()=>{
                const detailIds = selectedRows.map((row)=>{
                    return row.id
                });
                // step2. 提交查验通过xhr
                return new Promise((resolve, reject) => {
                    this.props.form.validateFieldsAndScroll((err, values) => {
                        if (err) {
                            return;
                        }

                        // step1. 保存查验结果
                        if(values.detailIds !== ""){
                              this.saveCheckTaskResult({
                                data: {
                                  ...values,
                                  checkResult: '1',
                                }
                              }, (err, res)=>{
                                // s2-s1关闭对话框
                                resolve();
                                //s2-s1-case1. 提交失败
                                if(err){
                                  message.error('保存查验结果失败，请稍后重试')
                                  return;
                                }
                                // s2-s1-case2. 提交请求成功，重新刷新列表
                                message.success('保存查验结果成功！')
                                this.props.callback && this.props.callback({
                                  click: 'ok',
                                  data: null,
                                });
                                this.props.form.resetFields();
                                this.resetSelectedRowsNIds();
                                this.reRenderDetails();
                              });
                        }else{
                          message.warn('请选择产品名称')
                        }
                    });
                }).catch(() => console.log('Oops errors!'));
            },
            onCancel: ()=> {}
        });
    };


    /*
     * @interface 显示填写查验不通过对话框
     * */
    /*writeCheckResultNotPassClick = ({data: selectedRows})=>{
        this.showWriteCheckResultNotPass({data: selectedRows})
    };*/

    /*
     * @interface 显示填写查验不通过对话框
     * */
    showWriteCheckResultNotPass = ({data: selectedRows})=>{
        this.setState(({writeCheckResultNotPassModal})=>{
            return {
                writeCheckResultNotPassModal: {
                    ...writeCheckResultNotPassModal,
                    visible: true,
                    details: selectedRows,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 隐藏填写查验不通过对话框
     * */
    hiddenWriteCheckResultNotPassModal = ()=>{
        this.setState(({writeCheckResultNotPassModal})=>{
            return {
                writeCheckResultNotPassModal: {
                    ...writeCheckResultNotPassModal,
                    visible: false,
                    details: [],
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 填写查验不通过对话框的回调
     * @param {object} info 返回的信息对象
     * */
    writeCheckResultNotPassCallback = (info)=>{
        const {click, data = {}} = info;
        // case1. 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenWriteCheckResultNotPassModal()
        }

        // case2. 如果点击确定按钮，则刷新查验产品列表列表
        if(click === 'ok'){
            this.resetSelectedRowsNIds();
            this.hiddenWriteCheckResultNotPassModal();
            this.reRenderDetails();
        }
    };



    render(){
        const {prefix, tableLoading, title, visible, style, data = {}, ...props} = this.props;
        const { getFieldDecorator } = this.props.form;
        const {spinning, tip, confirmLoading, selectedIds, selectedRows,
            shenpidanFile: {status: shenpidanStatus, data: shenpidanData}, hexiaodanFile: {status: hexiaodanStatus, data: hexiaodanData}, baojiandanFile: {status: baojiandanStatus, data: baojiandanData},
            details = [],listPage: {pageIndex, pageSize, rows: dataSource, total},
            drawerFold, writeCheckResultNotPassModal } = this.state;

        // console.log(detail);

        const rows = [
            [
                {
                    key: '1-1',
                    title: '审批单单号',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '审批单单单号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.quasi}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '创建日期',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '创建日期',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.createDate ? moment(shenpidanData.createDate).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
                        )
                    }
                },
                {
                    key: '1-5',
                    title: '前置审批号',
                    span: 3
                },
                {
                    key: '1-6',
                    title: '前置审批号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.shouliNo}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-1',
                    title: '单位名称',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '单位名称',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.corpname}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '机构代码',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '机构代码',
                    span: 13,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.corpCode}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-1',
                    title: '联系人',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '联系人',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.contact}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '联系电话',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '联系电话',
                    span: 13,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.contactTel}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-3',
                    title: '发货人',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '发货人',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.sender}</span>
                        )
                    }
                },
                {
                    key: '1-1',
                    title: '出/入境类型',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '出/入境类型',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{entryExit[shenpidanData['exitWay']]}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '贸易国家',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '贸易国家',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.country}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '5-1',
                    title: '收货人',
                    span: 3
                },
                {
                    key: '5-2',
                    title: '收货人',
                    span: 13,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{data.taker}</span>
                        )
                    }
                },
            ]
        ];

        const rows2 = [
            [
                {
                    key: '1-1',
                    title: '核销单号',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '核销单号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{hexiaodanData.hexiaodanCode}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '创建日期',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '创建日期',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{hexiaodanData.createDate ? moment(hexiaodanData.createDate).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
                        )
                    }
                },
                {
                    key: '1-5',
                    title: '报检号',
                    span: 3
                },
                {
                    key: '1-6',
                    title: '报检号',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{hexiaodanData.baojianhao}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-1',
                    title: '单位名称',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '单位名称',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.corpname}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '组织机构代码',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '组织机构代码',
                    span: 13,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{hexiaodanData.corpCode}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-1',
                    title: '联系人',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '联系人',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{hexiaodanData.hexiaoUserCode}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '联系电话',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '联系电话',
                    span: 13,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.contactTel}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-3',
                    title: '收货人',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '收货人',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{hexiaodanData.takeuser}</span>
                        )
                    }
                },
                {
                    key: '1-3',
                    title: '发货人',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '发货人',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{shenpidanData.taker}</span>
                        )
                    }
                },
                {
                    key: '1-1',
                    title: '出/入境类型',
                    span: 3
                },
                {
                    key: '1-2',
                    title: '出/入境类型',
                    span: 5,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{entryExit[shenpidanData['exitWay']]}</span>
                        )
                    }
                }
            ],
            [
                {
                    key: '1-3',
                    title: '贸易国家',
                    span: 3
                },
                {
                    key: '1-4',
                    title: '贸易国家',
                    span: 21,
                    formatter: (gridMetaData)=>{
                        return (
                            <span>{hexiaodanData.country}</span>
                        )
                    }
                }
            ]
        ];

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 16}
        };


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
                key: 'checkResult',
                name: '查验状态 ',
                width: 100,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column})=> {
                    const cls = cx({
                        [`check-result`]: true,
                        [`check-result${value}`]: true
                    });
                    return (
                        <span className={cls}>{checkResult[value] || '未查验'}</span>
                    )
                }
                // headerRenderer: <ImageFormatter value={faker.image.cats()} />,
                /*formatter: IndexFormatter,
                 events: {
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
                        itemTypes[type]['itemTypes'][value] &&
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

        const content = (
                <Tabs
                    tabPosition={'left'}
                    onTabClick={this.onTabClick}>
                    <Tabs.TabPane tab={<span><Icon type="file"/>审批单</span>} key="1">
                        <Spin
                            spinning={shenpidanStatus === 'loading'}
                            tip='数据加载中...'>
                            <BodyGridTable
                                rowHeight={36}
                                rows={rows}/>
                        </Spin>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<span><Icon type="file"/>核销单</span>} key="2">
                        <Spin
                            spinning={hexiaodanStatus === 'loading'}
                            tip='数据加载中...'>
                            <BodyGridTable
                                rowHeight={36}
                                rows={rows2}/>
                        </Spin>
                    </Tabs.TabPane>
                    {/*<Tabs.TabPane tab={<span><Icon type="file"/>报检单</span>} key="3">
                    </Tabs.TabPane>*/}
                </Tabs>
            );

        return (
            <ModalA
                className={cx({[`${prefix}-write-check-result-modal`]: true})}
                bodyStyle={{overflow: 'hidden'}}
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                onOk={this.onOk}
                onCancel={this.onCancel}
                maskClosable={false}
                footer={null}
                {...props}
                >
                <div className="hidden">
                    <WriteCheckResultNotPassModal
                        {...writeCheckResultNotPassModal}
                        callback={this.writeCheckResultNotPassCallback}/>
                </div>
                <Drawer fold={drawerFold}
                        trigger={
                            <span style={{display: 'inlineBlock', textAlign: 'center'}}>
                                <Button
                                onClick={this.triggerDrawerFold}
                                type="primary"
                                style={{padding: '4px 10px', whiteSpace: 'normal'}}>{drawerFold ? '展开' : '收起'}</Button>
                            </span>
                        }
                        triggerWidth={32}
                        contentWidth={900}
                        contentStyle={{minHeight: 300}}
                        content={content}/>
                <Spin
                    spinning={spinning}
                    tip={tip}>
                    <div className={`${prefix}-view-check-task-modal has-no-check-box-all`}>
                        <GridTable
                            tableLoading={tableLoading}
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
                            minHeight={300}
                            // rowRenderer={RowRenderer}
                            rowScrollTimeout={0}
                            onGridSort={this.handleGridSort}
                            pagination={_pagination}
                            />
                    </div>
                    <div style={{margin: '8px 0 24px 0'}}>
                        <Form  layout="horizontal">
                            {   getFieldDecorator(`checkTaskId`, {
                                initialValue:  data.id,
                                rules: null
                            })(
                                <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )}
                            {   getFieldDecorator(`detailIds`, {
                                initialValue: selectedIds.join(','),
                                rules: null
                            })(
                                <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )}
                            {   getFieldDecorator(`checkResult`, {
                                initialValue: '2',
                                rules: null
                            })(
                                <Input type="hidden"// style={{ width: '65%', marginRight: '3%' }}
                                    />
                            )}
                            <Form.Item
                                {...formItemLayout}
                                label="产品名称"
                                >
                                {selectedRows.map((row, i)=>{
                                    return (
                                        <span key={i} style={{marginRight: 8}}>{row.name}</span>
                                    )
                                })}
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="描述"
                                >
                                {getFieldDecorator('checkResultProblem', {
                                    initialValue: data.checkResultProblem,
                                    rules: false
                                })(
                                    <Input
                                        placeholder="请输入描述，例如：货损，疑似泄露"
                                        type="textarea"
                                        autosize={{ minRows: 2, maxRows: 6 }}// style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="建议处理方式"
                                >
                                {getFieldDecorator('checkResultOpinion', {
                                    initialValue: data.checkResultOpinion,
                                    rules: false
                                })(
                                    <Input
                                        placeholder="请输入建议处理方式，例如：销毁"
                                        type="textarea"
                                        autosize={{ minRows: 2, maxRows: 6 }}// style={{ width: '65%', marginRight: '3%' }}
                                        />
                                )}
                            </Form.Item>
                        </Form>
                        <ButtonContainer style={{textAlign: 'center'}}>
                            <Button
                                onClick={this.writeCheckResultPassClick.bind(this, {data: selectedRows})}
                                type="primary"
                                icon="check-circle">通过</Button>
                            <Button
                                onClick={this.writeCheckResultNotPassClick.bind(this, {data: selectedRows})}
                                type="danger"
                                icon="close-circle">不通过</Button>
                        </ButtonContainer>
                    </div>
                </Spin>
            </ModalA>
        )
    }
}

WriteCheckResultModal.propTypes = {
    data: PropTypes.any,
    details: PropTypes.array,
    rowKey: PropTypes.string,

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
    prefix: PropTypes.string
};

WriteCheckResultModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    rowKey: 'id',
    callback: noop,
};

export default Form.create()(WriteCheckResultModal);
