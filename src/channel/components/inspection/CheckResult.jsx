import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
// import faker from 'faker'
import { connect } from 'dva'
import moment from 'moment'
import cx from 'classnames'
import {Form, Select, Popconfirm, message, Input,DatePicker, Spin, Modal, notification, Button, Icon, Upload} from 'antd'
import {GridTable, Block, Inline,
    ButtonContainer, AddButton,
    DelButton, UploadButton, EditButton, SearchButton} from '../../../components/'
import {ViewCheckResultModal} from './modules/'
import {authPropTypesWrapper, getArraySelectedInfo, isQueryChanged} from '../helpers/'
import {AuthIdentity, dimsMap} from '../helpers/'
import {fetch, CONFIG} from 'antd/../../src/services/'
const {isSameUser, getUserRole, getUser} = AuthIdentity;
const {custom: {level}} = dimsMap;

function createRows(numberOfRows) {
    let rows = [];
    for (let i = 0; i < numberOfRows; i++) {
        rows[i] = createFakeRowObjectData(i);
    }
    return rows;
}
function createFakeRowObjectData(index) {
    return {
        id: index,
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
}

function noop(){}
const IndexFormatter = function (props /*column, dependentValues: rowData, isExpanded, rowIdx: 行索引, value: 当前cell的值*/){
    // console.log(props);
    return (
        <span>{ props.column.key === 'id'? 1 : props.value}</span>
    )
};

class CheckResult extends Component{

    _retInitialState = ()=>{
        return {
            spinning: false,                                    // 页面加载数据loading状态
            tip: '',                                            // 页面加载数据loading状态文字
            selectedIds: [],                                    // 已选定的行数据ids
            selectedRows: [],                                   // 选中的行数据
            tableLoading: false,
            checkPersonnelList: [],                             // 查验员列表
            listPage: {
                pageIndex: 1,
                pageSize: 10,
                rows: [],
                total: 0
            },
            viewCheckResultModal: {                                    // 查看通知明细详情对话框
                title: '',
                visible: false,
                data: {}
            },
        }

    };

    constructor(props){
        super(props);
        this.state = this._retInitialState();
    }

    componentDidMount(){
        const {listPage: {pageIndex, pageSize}} = this.state;
        this.getCheckResultList({pageIndex, pageSize});
        this.getCheckPersonnelList({roleName: 'ciq_chayanyuan'}, (err, res)=>{
            if(err){
                message.error('获取查验员列表失败');
                return;
            }

            const {responseObject = []} = res;
            this.setState({
                checkPersonnelList: responseObject
            })
        })
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
        let _values = {};
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
           // _values = values;
           ["userId","eciqCode","writeOffBillCode","orderCode","orgName","createTime","finishTime"].map((key)=>{
                if(key === "createTime" ){
                   _values[`${key}`]=  values[`${key}`]=== undefined ? undefined : values[`${key}`].unix()*1000;
                }else if( key === "finishTime" ){
                   _values[`${key}`]=  values[`${key}`]=== undefined ? undefined : values[`${key}`].unix()*1000;
                }else {
                   _values[`${key}`]=  values[`${key}`]=== undefined ? undefined : values[`${key}`];
                }
           })
        });
        let _f = {
            // status: '2,3,4',
            ..._values
        };

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
    getCheckResultList = (query)=>{
        // step1. 获取查询阐参数
        const _q = this._getAllListQuery(query);
        console.log(_q);
        // step2. 请求列表数据
        fetch('ciq.checktask.listtaskresult', {
            // method: 'post',
            // headers: {},
            data: _q,
            success: (res)=>{
                const {responseObject: listPage} = res;
                this.setState({
                    listPage: listPage ? listPage : this.state.listPage
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
     * @interface 获取订单列表
     * */
    getCheckPersonnelList = (query, callback)=>{
        fetch('platform.user.listbyrolename', {
            // method: 'post',
            // headers: {},
            data: query,
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
     * @interface 表格排序
     * @param {string} sortColumn  排序的列的key
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
        // case1. 如果是全选操作
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

    /*
     * @interface 表单查询回调
     * @param {object} values 返回的表单查询对象
     * */
    queryCallback = ()=>{
        const {listPage: {pageSize}} = this.state;
        this.getCheckResultList({pageIndex: 1, pageSize})
    };

    /*
     * @interface 判断是否只选中一行数据
     * @param {array} selectedIds 选中的行数组
     * return {boolean} 只选中一行数据返回true否则返回false
     * */
    _hasSelectedOnlyOneIdx = (selectedIds = [], nullText = undefined, moreText = undefined)=>{
        if(selectedIds.length === 0){
            // s1-case1. 没有选中任何行数据提示
            message.warn(`${nullText || '请你选择一条查验任务，再进行操作'}`);
            return false
        }else if(selectedIds.length > 1 ){
            // s1-case2. 选中超过2行数据提示
            message.warn(`${moreText || '你只能选择一条查验任务'}`);
            return false;
        }
        return true
    };

    /*
     * @interface 查验任务明细xhr
     * @param {object} 选中的行对象参数
     * @param {func} 回调函数
     * */
    viewCheckResultDetails = (selectedId = {}, callback = ()=>{})=>{
        fetch('ciq.checktask.taskdetail', {
            // method: 'post',
            // headers: {},
            data: selectedId,
            success: (res)=>{
                callback && callback(null, res)
            },
            error: (err)=>{
                callback && callback(err, null)
            },
            beforeSend: ()=>{
                this.setState({
                    spinning: true,
                    title: '获取数据中...'
                })
            },
            complete: (err, data)=>{
                this.setState({
                    spinning: false,
                    title: ''
                })
            }
        })
    };

    /*
     * @interface 查看查验任务明细
     * @param {object} _props 订单对象参数
     * */
    viewCheckResultClick = ({data: selectedRows})=>{
        // step1. 如果只选中一行数据，发送查验结果xhr
        if(this._hasSelectedOnlyOneIdx(selectedRows)) {
            this.viewCheckResultDetails({id: selectedRows[0]['id']}, (err, res)=> {
                if (err) {
                    // s2-ss1-case1. 提交订单失败
                    message.error(`获取查验结果信息失败，请稍后重试`);
                    return;
                }
                const {responseObject = {}} = res;
                this.showViewCheckResultModal({data: responseObject})
            })
        }
    };

    /*
     * @interface 显示查看任务信息对话框
     * @param {_props} _props 信息对象
     * */
    showViewCheckResultModal = ({data})=>{
        this.setState(({viewCheckResultModal})=>{
            return {
                viewCheckResultModal: {
                    ...viewCheckResultModal,
                    visible: true,
                    data: data
                }
            }
        })
    };

    /*
     * @interface 隐藏查看任务明细信息对话框
     * */
    hiddenViewCheckResult = ()=>{
        this.setState(({viewCheckResultModal})=>{
            return {
                viewCheckResultModal: {
                    ...viewCheckResultModal,
                    visible: false,
                    data: {}
                }
            }
        })
    };

    /*
     * @interface 查看查验任务信息的回调
     * @param {object} info 返回的信息对象
     * */
    viewCheckResultCallback = (info)=>{
        const {click, data} = info;
        // 如果点击取消按钮，则隐藏对话框
        if(click === 'cancel'){
            this.hiddenViewCheckResult();
            return;
        }
    };

    search = (r)=>{
        const {dispatch} = this.props;
        const {length, msg, selectedArray} = getArraySelectedInfo(this.state.selectedIds);
        dispatch({
            type: 'nav/changeNav',
            payload: {
                id: 'Org/viewOrgInfo',                                      // 点击动作标识符
                form: 'Org',                                                // 父组件标识符或者父组件
                data: r,                                                    // 携带数据
                actionType: 'click',                                        // 动作类型
                actionEvent: null,                                          // 事件对象
                instance: null,                                             // 当前触发实例
                cName: '查看',                                              // 事件cName
                tag: undefined,                                             // 事件标签
            }
        });
        if(length === 1){
            // 正常的查看操作操作
            console.log('search正常')
        }else if(length === 0){
            // 弹出错误提示，内容为没有选择任何项
            console.log('search0')
        }else if(length > 1){
            // 弹出错误提示，内容为选择太多项
            console.log('search2')
        }
        console.log('search', r)
    };

    /*
     * @interface 判断期望值与实际值是否相等
     * @param {any} exceptValue 期望值
     * @param {any} realValue 实际值
     * @return {boolean} 如果两个值相等则返回true否则返回false
     * */
    _isExpectStatusValue = (exceptValue, realValue)=>{
        return exceptValue === realValue
    };

    /*
     * @interface 点击查询按钮
     * */
    queryClick = ()=>{
        const {listPage: {pageSize}} = this.state;
        this.getCheckResultList({pageIndex: 1, pageSize})
    };

    /*
     * @interface 重置查询条件
     * */
    resetClick = ()=>{
        this.props.form.resetFields();
        const {listPage: {pageSize}} = this.state;
        this.getCheckResultList({pageIndex: 1, pageSize})
    };

    render() {
        const {...props} =this.props;
        const { getFieldDecorator } = this.props.form;
        const {selectedIds, selectedRows, spinning, tip,
            checkPersonnelList,
            listPage: {pageIndex, pageSize, rows: dataSource, total},
            tableLoading, viewCheckResultModal} = this.state;

        // console.log(selectedIds, selectedRows)

        const _pagination = {
            current: pageIndex,
            pageSize: pageSize,
            total: total,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: undefined,
            onShowSizeChange: (current, pageSize) => {
                console.log('Current: ', current, '; PageSize: ', pageSize);
            },
            onChange: (current) => {
                this.getCheckResultList({pageIndex: current, pageSize})
            }
        };
        // console.log(this.state.listPage, pageIndex, _pagination)


        const _columns = [
            {
                key: 'eciqCode',
                name: '报检单号',
                width: 150,
                locked: true,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'orderCode',
                name: '订单编号',
                width: 150,
                locked: true,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'createTime',
                name: '创建时间 ',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
                    )
                }
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'orgName',
                name: '申请单位',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'level',
                name: '特殊物品级别',
                width: 100,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{level[value]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'result',
                name: '查验结果',
                width: 100,
                sortable: false,
                formatter: ({dependentValues: {countTotal, countChecked, countPassed, countRefused},rowIdx, value, column: {key}})=>{
                    let result = '', style={};
                    if(countChecked === countTotal){
                        if(countPassed  && countRefused === 0){
                            result = '查验全部通过'
                            style = {color: '#00ea00'}
                        }else if(countPassed && countRefused){
                            result = '有部分产品未通过查验'
                            style = {color: '#ff8428'}
                        }else if(!countPassed && countRefused){
                            result = '查验全部通过'
                            style = {color: '#00ea00'}
                        }else if(!countPassed && !countRefused){
                            result = '未查验，查验结果等待通知'
                        }
                    }else{
                        result = '无需查验'
                        style = {color: '#47c5ff'}
                    }
                    return (
                        <span style={style}>{result}</span>
                    )
                }

            },
            {
                key: 'exitEntryType',
                name: '出入境类型',
                width: 100,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{dimsMap.custom.entryExit[`${value}`]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'country',
                name: '贸易国家',
                width: 100,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'planTime',
                name: '计划查验时间 ',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
                    )
                }
                /*events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'checkPersonel',
                name: '查验人员',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    return (
                        <span>{value}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
                key: 'status',
                name: '状态',
                width: 150,
                sortable: false,
                formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
                    const cls = cx({
                        [`status`]: true,
                        [`status${value}`]: true
                    });
                    return (
                        <span className={cls}>{dimsMap.inspection['status'][value]}</span>
                    )
                }
                /* events: {
                 onDoubleClick: function () {
                 console.log('The user double clicked on title column');
                 }
                 }*/
            },
            {
            key: 'finishTime',
            name: '完成时间',
            width: 150,
            sortable: false,
            formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
              return (
                <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:SS') : undefined}</span>
              )
            }
            /*events: {
             onDoubleClick: function () {
             console.log('The user double clicked on title column');
             }
             }*/
          },
        ];

        const formEle = (
            <Form inline>
                <Form.Item label="查验员">
                    {getFieldDecorator('userId', {
                        initialValue: getUserRole().some((identity)=>{
                            return identity.nameEn === 'ciq_jianyiju' || identity.nameEn === 'ciq_yunying'
                        }) ? '' : getUser().id,
                        rules: false
                    })(
                        <Select
                            style={{width: 100}}
                            placeholder="请选择查验员"
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
                            <Select.Option value={''}>全部</Select.Option>
                            {checkPersonnelList.map((person)=>{
                                return (
                                    <Select.Option value={person.id}>{person.realName}</Select.Option>
                                )
                            })}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item label="报检单号">
                  {getFieldDecorator('eciqCode', {
                    rules: false
                  })(
                    <Input  placeholder="不限" />
                  )}
                </Form.Item>
                <Form.Item label="核销单号">
                  {getFieldDecorator('writeOffBillCode', {
                    rules: false
                  })(
                    <Input  placeholder="不限" />
                  )}
                </Form.Item>
                <Form.Item label="订单编号">
                  {getFieldDecorator('orderCode', {
                    rules: false
                  })(
                    <Input  placeholder="不限" />
                  )}
                </Form.Item>
                <Form.Item label="申请单位">
                  {getFieldDecorator('orgName', {
                    rules: false
                  })(
                    <Input  placeholder="不限" />
                  )}
                </Form.Item>

                <Form.Item label="创建时间">
                  {getFieldDecorator('createTime', {
                    //initialValue: data.estimatedReceiveDate ? moment(data.estimatedReceiveDate): undefined,
                    rules: false
                  })(
                    <DatePicker
                      allowClear
                      showTime={false}
                      format="YYYY-MM-DD"
                      placeholder="请选择提交时间"/>
                  )}
                </Form.Item>
                <Form.Item label="完成时间">
                  {getFieldDecorator('finishTime', {
                    //initialValue: data.estimatedReceiveDate ? moment(data.estimatedReceiveDate): undefined,
                    rules: false
                  })(
                    <DatePicker
                      allowClear
                      showTime={false}
                      format="YYYY-MM-DD"
                      placeholder="请选择处理时间"/>
                  )}
                </Form.Item>
                <ButtonContainer style={{margin: 0, display: 'inline-block'}}>
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
            <div {...props} className="yzh-check-result has-no-check-box-all">
                <div className="hidden">
                    <ViewCheckResultModal
                        {...viewCheckResultModal}
                        callback={this.viewCheckResultCallback}/>
                </div>

                {getUserRole().some((identity)=>{ //如果有一个元素满足条件，则表达式返回true; 没有满足条件的元素，则返回false。
                    return identity.nameEn === 'ciq_jianyiju' || identity.nameEn === 'ciq_yunying'
                }) ? formEle : ''}

                <Spin
                    spinning={spinning}
                    tip={tip}>
                    <ButtonContainer>
                        <SearchButton  onClick={this.viewCheckResultClick.bind(this, {data: selectedRows})}>查看</SearchButton>
                        {/*<SearchButton  onClick={this.viewCheckNotificationClick.bind(this, {data: selectedRows})}>查看</SearchButton>
                         <DelButton onClick={this.delOrderClick.bind(this, {data: selectedRows})}>删除</DelButton>
                         <AddButton onClick={this.addCheckTaskClick.bind(this, {data: selectedRows})}>创建任务</AddButton>*/}
                    </ButtonContainer>
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
                        minHeight={360}
                        // rowRenderer={RowRenderer}
                        rowScrollTimeout={0}
                        onGridSort={this.handleGridSort}
                        pagination={_pagination}
                        //scroll={{x: 1650}}
                        />
                </Spin>
            </div>
        )
    }
}

CheckResult.propTypes = {
    prefix: PropTypes.string,
    rowKey: PropTypes.string
};

CheckResult.defaultProps = {
    prefix: 'yzh',
    rowKey: 'id'
};

CheckResult = Form.create()(CheckResult);

const mapStateToProps=({nav})=>{
    return {
        nav
    }
};

export default connect(mapStateToProps)(CheckResult);
