import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import createG2 from 'antd/../../src/lib/g2-react';
import G2 from 'g2'
import faker from 'faker'
import { connect } from 'dva'
import moment from 'moment'
import cx from 'classnames'
import {Form, DatePicker, Input, Radio, Button, Spin, Table, Icon} from 'antd'
import {GridTable, Block, Inline,
    ButtonContainer, AddButton,
    DelButton, UploadButton, EditButton, SearchButton} from '../../../components/'
import {dimsMap} from '../helpers/'
import {fetch, CONFIG} from 'antd/../../src/services/'

/*
*   报表查询页面
* */
const Interval = createG2((chart, {data}) => {
    var Stat = G2.Stat;
    var Frame = G2.Frame;
    var frame = new Frame(data);
    frame = Frame.combinColumns(frame, ['pass', 'notPass', 'notResolve'], 'newTotal', 'type', ['month', 'total', 'pass', 'notPass', 'notResolve']);
    chart.source(frame, {
        type: {
            type: 'cat', // 声明 type 字段为分类类型
            alias: '类型' // 设置属性的别名
        },
        month: {
            type: 'cat', // 声明 type 字段为分类类型
            alias: '月份' // 设置属性的别名
        },
        pass: {
            type: 'linear', // 声明 type 字段为分类类型
            alias: '通过' // 设置属性的别名
        },
        notPass: {
            type: 'linear', // 声明 type 字段为分类类型
            alias: '不通过' // 设置属性的别名
        },
        notResolve: {
            type: 'linear', // 声明 type 字段为分类类型
            alias: '未处理' // 设置属性的别名
        }
    });
    chart.legend({
        position: 'right', // 图例的显示位置，有 'top','left','right','bottom'四种位置，默认是'right'。
        leaveChecked: false, // 是否保留一项不能取消勾选，默认为 false，即不能取消勾选。
        selectedMode: 'multiple' || 'single' || false, // 设置图例筛选模式，默认为 'multiple' 多选，'single' 表示单选，false 表示禁用筛选
        title: '类别', // 是否展示图例的标题，null 为不展示，默认 top bottom 两个位置的图例不展示标题。
        // spacingX: 10, // 用于 position 为 top 或者 bottom 时调整子项之间的水平距离
        //spacingY: 12, // 用于 position 为 left 或者 right 时调整子项之间的垂直距离
        unChecked: '#CCC', // 未选中时 marker 的颜色
        // wordSpaceing: 2,  // marker 和文本之间的距离
        // dx: 5, // 整个图例的水平偏移距离
        // dy: 10, // 整个图例的垂直偏移距离
        itemWrap: true, // 是否自动换行，默认为 false，true 为自动换行
        word: {
            // fill: 'red',
            fontSize: 14
        }, // 图例各个子项文本的颜色
        back: {
            // fill: 'red'
        }, // 图例外边框和背景的配置信息
        formatter:  function(val) {
            if(val === 'pass'){ return '通过'}
            if(val === 'notPass'){return '不通过'}
            if(val === 'notResolve'){return '未处理'}
            return val;
        }, // 格式化图例项的文本显示
        // marker: ['circle', 'square', 'bowtie', 'diamond', 'hexagon', 'triangle', 'triangle-down', 'hollowCircle', 'hollowSquare', 'hollowBowtie', 'hollowDiamond', 'hollowHexagon', 'hollowTriangle', 'hollowTriangle-down', 'cross', 'tick', 'plus', 'hyphen', 'line'] // 配置 marker 的显示形状
    });
    chart.axis('month', {
        title: '月份'
    });
    chart.axis('newTotal', {
        title: '数量',
        titleOffset: 75
    });
    chart.intervalStack().position('month*newTotal').color('type');
    chart.render();

    chart.on('tooltipchange', function(ev) {
        var items = ev.items; // tooltip显示的项
        var origin = items[0]; // 将一条数据改成多条数据
        var pass = origin.point._origin.pass;
        var notPass = origin.point._origin.notPass;
        var notResolve = origin.point._origin.notResolve;
        items.splice(0); // 清空
        items.push({
            name: '通过',
            title: origin.title,
            marker: true,
            color: origin.color,
            value: pass
        });
        items.push({
            name: '不通过',
            marker: true,
            title: origin.title,
            color: origin.color,
            value: notPass
        });
        items.push({
            name: '未处理',
            title: origin.title,
            marker: true,
            color: origin.color,
            value: notResolve
        });
    });
});

function createRows(numberOfRows) {
    let rows = [];
    for (let i = 0; i < numberOfRows; i++) {
        rows[i] = createFakeRowObjectData(i);
    }
    return rows;
}
function createFakeRowObjectData(index) {
    const total = faker.random.number();
    const pass = Math.floor(total * 0.8);
    const notPass = Math.floor(total * 0.1);
    const notResolve = total - pass - notPass;
    return {
        id: index,
        month: moment().subtract(index, 'months').format("YYYY-MM"),
        total: total,
        pass: pass,
        notPass: notPass,
        notResolve: notResolve
    };
}

function noop(){}

class ReportQuery extends Component{

    _retInitialState = ()=>{
        return {
            spinning: false,                                    // 页面加载数据loading状态
            tip: '',                                            // 页面加载数据loading状态文字
            selectedIds: [],                                    // 已选定的行数据ids
            selectedRows: [],                                   // 选中的行数据
            tableLoading: false,
            charts: null,
            radioValue: '表',
            listPage: {
                pageIndex: 1,
                pageSize: 10,
                rows: createRows(12),
                total: 0
            }
        }

    };

    constructor(props){
        super(props);
        this.state = this._retInitialState();
    }

    componentDidMount(){

    }

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
     * 获取订单列表的所有查询条件
     * @param {object} pageQuery 分页查询对象
     * @return {object} 列表所有查询条件参数对象
     * */
    _getAllListQuery = (pageQuery = {})=>{
        // step1 获取所有查询参数
        let _f = {};
        /*this.OrderQueryForm.validateFields((err, values)=>{
         _f = values
         });*/
        return {
            ..._f,
            ...pageQuery
        }
    };

    /*
     * @interface 获取订单列表
     * */
    getCheckNotificationList = (query)=>{
        // step1. 获取查询阐参数
        const _q = this._getAllListQuery(query);
        // console.log(_q);
        // step2. 请求列表数据
        fetch('ciq.checktask.list', {
            // method: 'post',
            // headers: {},
            data: _q,
            success: (res)=>{
                const {responseObject: listPage} = res;
                this.setState({
                    listPage
                })
            },
            error: (err)=>{
                // step1.
                message.error(err.message);
            },
            beforeSend: ()=>{
                this.setState({
                    tableLoading: true
                })
            },
            complete: (err, data)=>{
                this.setState({
                    tableLoading: false
                })
            }
        })
    };

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

    /*/!*
     * @interface Grid行更新
     * *!/
     handleGridRowsUpdated = ({ fromRow, toRow, updated })=> {
     console.log('handleGridRowsUpdated',arguments)
     let rows = this.state.rows;

     for (let i = fromRow; i <= toRow; i++) {
     let rowToUpdate = rows[i];
     let updatedRow = React.addons.update(rowToUpdate, {$merge: updated});
     rows[i] = updatedRow;
     }

     this.setState({ rows });
     };*/

    /*
     * @interface 选中行接口
     * @param {Array} 选中的行
     * */
    onRowsSelected = (rows /*新增选择的行*/) =>{
        /* this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))});
         this.setState({selectedRows: this.state.selectedRows.concat(rows.map(r => r.row))});*/
        this.setState({selectedIds: rows.map(r => r.row[this.props.rowKey])});
        this.setState({selectedRows: rows.map(r => r.row)});
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
            // case2-case1. 采用赋值，如果是只能选中一行采用赋值，如果是合并选中行，采用concat方法来合并操作
            this.setState({selectedIds: [clickedRow[this.props.rowKey]]});
            this.setState({selectedRows: [clickedRow]});
        }
    };

    onRadioChange = (e)=>{
        this.setState({
            radioValue: e.target.value
        })
    }

    render() {
        const {...props} =this.props;
        const { getFieldDecorator } = this.props.form;
        const {spinning, tip, radioValue, listPage: {pageIndex, pageSize, rows: dataSource, total}} = this.state;

        const size = 'small';
        const columns = [
            {
                title: <span>{'月份'}<Icon type="calendar"/></span>,
                dataIndex: 'month',
                key: 'month',
                width: 200
            },
            {
                title: <span>{'申请总数'}<Icon type="pie-chart"/></span>,
                dataIndex: 'total',
                key: 'total',
                width: 200
            },
            {
                title: <span>{'通过'}<Icon type="smile-o"/></span>,
                dataIndex: 'pass',
                key: 'pass',
                width: 100
            },
            {
                title: <span>{'未通过'}<Icon type="frown-o"/></span>,
                dataIndex: 'notPass',
                key: 'notPass',
                width: 100
            },
            {
                title: <span>{'未处理'}<Icon type="meh-o"/></span>,
                dataIndex: 'notResolve',
                key: 'notResolve',
            }
        ];
        const formEle = (
            <Form
                style={{marginBottom: 16}}
                inline>
                <Form.Item label="时间">
                    {getFieldDecorator('time', {
                        initialValue: [moment(), moment()],
                        rules: false
                    })(
                        <DatePicker.RangePicker
                            size={size}
                            allowClear
                            placeholder={[`开始时间`, `结束时间`]}
                            format={'YYYY-MM-DD'}
                        />
                    )}
                </Form.Item>
                <Form.Item label="单位">
                    {getFieldDecorator('unit', {
                        initialValue: '',
                        rules: false
                    })(
                        <Input
                            size={size}
                            placeholder={`请输入单位名称`}/>
                    )}
                </Form.Item>
                <Form.Item label="评估物品">
                    {getFieldDecorator('unit', {
                        initialValue: '',
                        rules: false
                    })(
                        <Input
                            size={size}
                            placeholder={`请输入评估的物品`}/>
                    )}
                </Form.Item>
                <ButtonContainer style={{margin: 0, display: 'block', textAlign: 'right'}}>
                    <Button
                        onClick={this.queryClick}
                        type="primary"
                        icon="search">查询</Button>
                    <Button
                        onClick={this.resetClick}
                        icon="reload">重置</Button>
                </ButtonContainer>
            </Form>
        );
        return (
            <div {...props} >
                <div className="hidden">
                </div>
                {formEle}
                <div style={{fontSize: 16, textAlign: 'right', paddingRight: 0}}>
                    <Radio.Group
                        size={`large`}
                        value={radioValue}
                        onChange={this.onRadioChange}>
                        <Radio.Button value={'表'}>
                            <Icon type="bars"/>表布局
                        </Radio.Button>
                        <Radio.Button value={'图'}>
                            <Icon type="dot-chart"/>图布局
                        </Radio.Button>
                    </Radio.Group>
                </div>
                {radioValue === '表' ?
                    < Spin
                        spinning={spinning}
                        tip={tip}>
                        <Table
                            title={(currentPageData)=> {
                                    return (
                                        <div style={{textAlign: 'center', fontSize: 16, fontWeight: 600}}>一年内月份与风险评估申请数量的关系</div>
                                    )
                                }}
                            size={`small`}
                            showHeader
                            bordered
                            scroll={{y: 300}}
                            columns={columns}
                            dataSource={dataSource}
                            rowKey={(record, i)=> {
                                    return i
                                }}
                            pagination={false}/>
                    </Spin> :
                    <Spin
                    spinning={spinning}
                    tip={tip}>
                        <div>
                            <div style={{textAlign: 'center', fontSize: 16, fontWeight: 600}}>一年内月份与风险评估申请数量的关系</div>
                                <Interval
                                    data={dataSource}
                                    forceFit
                                    width={500}
                                    height={400}
                                    // plotCfg={this.state.plotCfg}
                                    ref="myChart"
                                />
                        </div>
                    </Spin>
                }
            </div>
        )
    }
}

ReportQuery.propTypes = {
    prefix: PropTypes.string,
    rowKey: PropTypes.string
};

ReportQuery.defaultProps = {
    prefix: 'yzh',
    rowKey: 'id'
};

ReportQuery = Form.create()(ReportQuery);

const mapStateToProps=({nav})=>{
    return {
        nav
    }
};

export default connect(mapStateToProps)(ReportQuery);
