import React, { Component, PropTypes } from 'react';
import {Spin, Icon} from 'antd'
import cx from 'classnames'
import moment from 'moment'
import {StepViewer} from '../../../../components/'
import DisplayPDFModal from './DisplayPDFModal.jsx'
import {CONFIG} from '../../../../services/'
import './displayOrderStatusModal.less'
function noop(){}

class DisplayOrderStatusModal extends Component{

    _retInitialState = ()=>{
        return {
            displayPDFModal: {                          // pdf对话框
                visible: false,
                title: '',
                fileUrl: undefined,
                data: {}
            }
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

    reload = ({values ={}})=> {
        this.props.callback && this.props.callback({
            click: 'reload',
            data: values
        });
    };

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        });
        this.setState(this._retInitialState())
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

    downLoadFile = (fileUrl)=>{
        window.open(`${CONFIG.ossFileUrl}/${fileUrl}`)
    };

    render(){
        const {prefix, title, status, visible, data = [], orderId, code, pageIndex, pageSize, ...props} = this.props;
        const {displayPDFModal} = this.state;

        const bodyHeight = 500;

        const cls = cx({
            [`${prefix}-display-order-status-modal`]: true
        });
        const loadingEle = (
            <Spin
                spinning={true}
                tip={`数据加载中...`}>
                <div style={{height: bodyHeight}}></div>
            </Spin>
        );

        const errorEle = (
            <div className="status-container">
                <div className="status-content">
                    <Icon type="exclamation-circle" />
                    <div>
                        <a className="text" onClick={this.reload.bind(this, {values:{orderId, pageIndex, pageSize}})}>重新请求</a>
                    </div>
                </div>
            </div>
        );
        return (
            <div>
                <div className="hidden">
                    <DisplayPDFModal
                        {...displayPDFModal}
                        callback={this.displayPDFModalCallback}/>
                </div>
                <StepViewer
                    className={cls}
                    timelineData={data}
                    formatter={
                        (item, i)=>{
                            const {createTime, stepName, billCode, billFile, billName, notify} = item;
                            let isPDF = false;
                            const patternPDF = /\.pdf$/;
                            if(patternPDF.test(billFile)){
                                isPDF = true;
                            }
                            return {
                                content: <div>
                                  <p>{moment(createTime).format('YYYY-MM-DD HH:mm:SS')}<span style={{marginLeft: 8, color: 'red', fontSize: 14, fontWeight: 500}}>{stepName}</span></p>
                                  <p>{billName ? <span>{billName}编号：
                                              <span>{
                                                billFile ?
                                                    (isPDF ? <a onClick={this.displayPDFModal.bind(this, {fileUrl: `${CONFIG.ossFileUrl}/${billFile}`, data: {}})}>{billCode}<span style={{marginLeft: 8, position: 'relative', top: 2}}><Icon type="eye-o"/></span></a> :
                                                    <a onClick={this.downLoadFile.bind(this, billFile)}>{billCode}<span style={{marginLeft: 8, position: 'relative', top: 2}}><Icon type="download"/></span><Icon type="download"/></a>) :
                                                undefined}
                                                </span>
                                        </span> : undefined}
                                    </p>

                                </div>
                            }
                        }
                    }
                    // confirmLoading={confirmLoading}
                    title={`订单编号：${code}`}
                    visible={visible}
                    footer={null}
                    okText="确定"
                    cancelText="取消"
                    onOk={this.onOk}
                    onCancel={this.onCancel}
                    width={400}
                    bodyHeight={bodyHeight}
                    bodyStyle={{marginTop: 16}}
                    {...props}
                    >
                    {status === 'loading' ?
                        loadingEle : status === 'error' ?
                        errorEle : undefined}
                </StepViewer>
            </div>
        )
    }
}

DisplayOrderStatusModal.propTypes = {
    data: PropTypes.array,
    status: PropTypes.string,
    orderId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    code: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,

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

DisplayOrderStatusModal.defaultProps = {
    prefix: 'yzh',
    status: 'error',
    visible: false,
    callback: noop,
};

export default DisplayOrderStatusModal;