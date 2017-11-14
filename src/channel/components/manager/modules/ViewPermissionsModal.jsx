import React, { Component, PropTypes } from 'react';
import faker from 'faker'
import {Form, Select, Upload, Icon, Input, DatePicker,
  Popconfirm, Row, Col, Button, InputNumber, message,} from 'antd'
import moment from 'moment'
import cx from 'classnames'
import {remove} from 'antd/../../src/utils/arrayUtils.js'
import {fetch, CONFIG} from '../../../../services/'
import {ModalA, GridTable, ButtonContainer, AddButton, BodyGridTable} from '../../../../components/'


function noop(){}

/**
 *  查看用户权限模块
 *  作者：贾鹏涛
 *  日期：2017-8-23
 * **/
class ViewPermissionsModal extends Component{
  _retInitialState = ()=>{
    return {
      confirmLoading: false,
      spinning: false,                                    // 页面加载数据loading状态
      tip: '',                                            // 页面加载数据loading状态文字
      selectedIds: [],                                    // 已选定的行数据ids
      selectedRows: [],                                   // 选中的行数据
      tableLoading: false,
      listPage: {
        pageIndex: 1,                                     // 第几页。
        pageSize: 20,                                     // 每页显示的记录条数。
        rows: [],
        total: 0
      }
    }
  };

  constructor(props){
    super(props);
    this.state = this._retInitialState()
  }

  /* @interface 清空选择行; 行对象数据。
   * */
  resetSelectedRowsNIds = ()=>{
    this.setState({
      selectedIds: [],
      selectedRows: [],
    })
  };

//------------------------------ start专家列表-------------------------------------------
  componentDidMount(){
    const {listPage: {pageIndex, pageSize}} = this.state;
    this.getProfessorsList({pageIndex, pageSize});
  };

  _getAllListQuery = (pageQuery = {})=>{ //分页条件
    let _f = {};
    return {
      ..._f,
      ...pageQuery
    }
  };

  getProfessorsList = (query)=>{
    const _q = this._getAllListQuery(query); //q是分页参数: Object{pageIndex:1, pageSize:20}
    // step1. 请求列表数据
    fetch('ciq.riskasesmtexperts.pagelist',{
      // method: 'post',
      // headers: {},
      data: _q,
      success: (res)=>{
        const {responseObject: listPage} = res;  //res 反馈的全部专家。
        //console.log('查询专家接口:',listPage );
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
//--------------------------------end专家列表-----------------------------------------------


  componentWillReceiveProps(nextProps){
    const {visible} = nextProps;
    const {data: newData} = nextProps;
    const {data: oldData} = this.props;
    if(visible && newData !== oldData) {
      this.getProfessorsList({}, (listPage)=>{
        this.setState({
          listPage
        })
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

  /*
   * @interface 保存选中行接口
   * */
  onRowsSelected = (rows /*新增选择的行*/) =>{
    /* 1.复选操作。*/
    this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))});
    this.setState({selectedRows: this.state.selectedRows.concat(rows.map(r => r.row))});
    /* 2.单选操作。
     this.setState({ selectedIds: rows.map(r => r.row[this.props.rowKey]) });
     this.setState({ selectedRows: rows.map(r => r.row)  }); */
  };

  /*
   * @interface 取消选中行接口
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
      this.setState({selectedIds: this.state.selectedIds.concat([clickedRow[this.props.rowKey]])});
      this.setState({selectedRows: this.state.selectedRows.concat([clickedRow])});
    }
  };

//----------------------------------------------------
  onOk = ( {data:arrSelectId,  selectedRows } )=> {
    this.props.form.validateFieldsAndScroll((err, value) => { //数据。
      if (err) {
        message.error(err.message || '未选择完全')
        return;
      }
      else if (arrSelectId.length >0 ) {
        //console.log('selectedRows:',selectedRows[0]['expertsName']);
        //console.log('arrSelectId:',arrSelectId );
        let arreptgrpIds =[];
        for(let i=0; i<arrSelectId.length; i++){
          let expertId ={};
          expertId['expertId'] = arrSelectId[i];
          arreptgrpIds.push( expertId );
        }
        console.log('专家组id对象:', arreptgrpIds );

        const data = {
          //dateStart: value.dateStart.unix()*1000,
          //dateEnd:  value.dateEnd.unix()*1000,
          groupName: value.groupName,
          groupLeader: selectedRows[0]['expertsName'],
          eptgrpIds:  arreptgrpIds,
        }
        console.log('专家组:', data);

        //保存选的专家组
        fetch('ciq.riskasesmtexpertGroup.save', {
          // method: 'post',
          // headers: {},
          data: data,
          success: (res)=> {
            /* 回调父组件的callback函数 */
            this.props.callback && this.props.callback({
              click: 'ok',
              data: null,
            });
            console.log('保存数据成功');
            /*将组件重置到初始状态*/
            this.setState(this._retInitialState());
            this.props.form.resetFields()
          },
          error: (err)=> {
            message.error('保存数据失败')
          },
          beforeSend: ()=> {
            this.setState({
              confirmLoading: true
            })
          },
          complete: (err, data)=> {
            this.setState({
              confirmLoading: false
            })
          }
        })
      }
      else {
        message.error(`请至少选1个专家，再点击确认`);
        return;
      }

    });
  };
  onCancel = ()=> {
    /* 回调父组件的callback函数*/
    this.props.callback && this.props.callback({
      click: 'cancel',
      data: null
    });
    this.setState(this._retInitialState());
    this.props.form.resetFields()
  };



  render(){
    const {title, visible, data = {}, ...props} = this.props;
    const { getFieldDecorator } = this.props.form;
    const {confirmLoading, listPage: {pageIndex, pageSize, rows:dataSource, total}, tableLoading,
      spinning, tip, selectedIds, selectedRows,} = this.state;
    const { } =  data;

    const _pagination = {
      current: pageIndex,
      pageSize: pageSize,
      total: total,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: undefined,
      onShowSizeChange: (current, pageSize) => {
        console.log('Current: ', current, '; PageSize: ', pageSize); //pageSize 一页中显示的数量。
      },
      onChange: (current) => { //current 鼠标点击的第几页。
        //current === 2
        console.log('Current: ', current);
        this.getProfessorsList({pageIndex: current, pageSize})//分页列表查询。
      }
    };

    const _data = (
      <div>
        <Row gutter={16}>
          <Col span={6}></Col>
        </Row>
      </div>
    );

    const _columns = [
      {
        key: 'sn',
        name: '序号',
        width: 50,
        locked: true,
        formatter: ({dependentValues,rowIdx, value})=> {
          const {listPage: {pageIndex, pageSize}} = this.state;
          return (
            <span>{(pageIndex- 1) * pageSize + rowIdx + 1}</span>
          )
        }
      },
      {
        key: 'name',
        name: '模块',
        width: 100,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
      {
        key: 'state',
        name: '状态',
        width: 60,
        locked: true,
        sortable: false,
        formatter: ({dependentValues,rowIdx, value, column: {key}})=>{
          return (
            <span>{value}</span>
          )
        }
      },
    ];

    return (
      <div>
        <ModalA
          className="has-no-check-box-all"
          confirmLoading={confirmLoading}
          title={`查看权限`}
          visible={visible}
          okText="确定"
          cancelText="取消"
          onOk={this.onOk.bind(this, {data:selectedIds, selectedRows} )}
          onCancel={this.onCancel}
          // bodyHeight={500}
          {...props}
        >

          <GridTable
            tableLoading={tableLoading}
            //enableCellSelect={true}
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
                                  selectBy:{  keys:{rowKey:'id', values: this.state.selectedIds} }
                              }
                            }
            rowHeight={36}
            minHeight={360}
            // rowRenderer={RowRenderer}
            rowScrollTimeout={0}
            onGridSort={this.handleGridSort}
            pagination={_pagination}
          />
        </ModalA>
      </div>
    )
  }
}

ViewPermissionsModal.propTypes = {
  data: PropTypes.any,
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
  prefix: PropTypes.string.isRequired
};

ViewPermissionsModal.defaultProps = {
  prefix: 'yzh',
  rowKey: 'id',
  visible: false,
  callback: noop,
};

ViewPermissionsModal = Form.create()(ViewPermissionsModal);

export default ViewPermissionsModal;
