import React, { Component, PropTypes } from 'react';
import moment from 'moment'
import {Alert, Tabs, Icon, Spin} from 'antd'
import {ModalA, Map, TempChart, ButtonContainer, ExportButton } from '../../../../components/'
import {fetch, CONFIG} from '../../../../services/'

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class TMSOrderDetailModal extends Component{
    _retInitialState = ()=>{
        return {
            data: [
                {
                    at: "2009/6/12 2:00:00",
                    t: 2
                },
                {
                    at: "2009/6/12 3:00:00",
                    t: 5
                },
                {
                    at: "2009/6/12 4:00:00",
                    t: 6
                },
                {
                    at: "2009/6/12 5:00:00",
                    t: 9
                },
                {
                    at: "2009/6/12 6:00:00",
                    t: 5
                },
                {
                    at: "2009/6/12 7:00:00",
                    t: 6
                },
                {
                    at: "2009/6/12 8:00:00",
                    t: 7
                },
                {
                    at: "2009/6/12 9:00:00",
                    t: 10
                },
                {
                    at: "2009/6/12 10:00:00",
                    t: 3
                },
                {
                    at: "2009/6/12 11:00:00",
                    t: 5
                },
                {
                    at: "2009/6/12 12:00:00",
                    t: 2
                },
                {
                    at: "2009/6/12 13:00:00",
                    t: 6
                },
                {
                    at: "2009/6/12 14:00:00",
                    t: 9
                },
                {
                    at: "2009/6/12 15:00:00",
                    t: 20
                },
                {
                    at: "2009/6/12 16:00:00",
                    t: 2
                }
            ]                            // 温度数据
        }
    };
    constructor(props){
        super(props);
        this.state = this._retInitialState()
    }

    componentWillReceiveProps(nextProps){

    }

    componentDidMount(){
     /*   setTimeout(()=>{
            this.setState({
                data:[
                    {
                        at: "2009/6/12 2:00:00",
                        t: 2
                    },
                    {
                        at: "2009/6/12 3:00:00",
                        t: 5
                    },
                    {
                        at: "2009/6/12 4:00:00",
                        t: 6
                    },
                    {
                        at: "2009/6/12 5:00:00",
                        t: 9
                    },
                    {
                        at: "2009/6/12 6:00:00",
                        t: 5
                    },
                    {
                        at: "2009/6/12 7:00:00",
                        t: 6
                    },
                    {
                        at: "2009/6/12 8:00:00",
                        t: 7
                    },
                    {
                        at: "2009/6/12 9:00:00",
                        t: 10
                    },
                    {
                        at: "2009/6/12 10:00:00",
                        t: 3
                    },
                    {
                        at: "2009/6/12 11:00:00",
                        t: 5
                    },
                    {
                        at: "2009/6/12 12:00:00",
                        t: 2
                    },
                    {
                        at: "2009/6/12 13:00:00",
                        t: 6
                    },
                    {
                        at: "2009/6/12 14:00:00",
                        t: 9
                    },
                    {
                        at: "2009/6/12 15:00:00",
                        t: 20
                    },
                    {
                        at: "2009/6/12 16:00:00",
                        t: 2
                    }
                ]
            })
        }, 5000)*/
    }

    onCancel = ()=> {
        this.props.callback && this.props.callback({
            click: 'cancel',
            data: null
        })
    };

    render(){
        const {title, visible, confirmLoading, tempData = [], tempStatus, geoData = {}, geoStatus, ...props} = this.props;
        const {data} = this.state;

        const _t = tempData.map((item)=>{
            item.at = moment(item.at*1000).format('YYYY/MM/DD HH:mm:SS')
            return item;
        });

        const bodyHeight = 500;

         console.log("tempData", _t)

        return (
            <ModalA
                confirmLoading={confirmLoading}
                title={title}
                visible={visible}
                okText="确定"
                cancelText="取消"
                onOk={this.onOk}
                onCancel={this.onCancel}
                bodyHeight={'auto'}
                footer={null}
                width={1200}
                {...props}
                >
                <ButtonContainer span={24}>
                    {/*<ExportButton
                        onClick={this.handleSubmit}
                        type="primary">打印报告</ExportButton>
                    <ExportButton
                        onClick={this.resetFields}
                        type="primary">导出报告</ExportButton>*/}
                </ButtonContainer>
                <Tabs
                    defaultActiveKey="1"
                    type="card">
                    <Tabs.TabPane
                        tab={<span><Icon type="environment-o"/>运输轨迹回溯</span>}
                        key="1">
                        <Spin
                            spinning={geoStatus === 'loading'}
                            tip="Loading...">
                            <Map
                                src={`/public/assets/html/map.html`}
                                domain={CONFIG.url}
                                method={`tms.devicedata.listlocation`}
                                query={geoData}
                                height={bodyHeight}/>
                        </Spin>
                    </Tabs.TabPane>
                    <Tabs.TabPane
                        tab={<span><Icon type="area-chart"/>温度曲线</span>}
                        key="2">
                        <Spin
                            spinning={tempStatus === 'loading'}
                            tip="Loading...">
                            {
                                tempStatus === 'loading' ?
                                    <div style={{position: 'relative', height: bodyHeight}}></div>:
                                tempStatus === 'error' ? undefined:
                                <TempChart
                                    data={_t}
                                    width={900}
                                    height={600}
                                    />
                            }
                        </Spin>
                    </Tabs.TabPane>
                </Tabs>
            </ModalA>
        )
    }
}

TMSOrderDetailModal.propTypes = {
    data: PropTypes.any,
    tempData: PropTypes.arrayOf(PropTypes.object).isRequired,
    tempStatus: PropTypes.string,
    geoData: PropTypes.object.isRequired,
    geoStatus: PropTypes.string,

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

TMSOrderDetailModal.defaultProps = {
    prefix: 'yzh',
    visible: false,
    callback: noop,
};


export default TMSOrderDetailModal;