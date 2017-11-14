import React, { Component, PropTypes } from 'react';
import ReactDataGrid from 'react-data-grid';
import cx from 'classnames'
import {Pagination, Spin} from 'antd'
import './gridTable.less'

const EmptyRowsView = React.createClass({
    render() {
        return (<div className="ant-table-placeholder"><span><i className="anticon anticon-frown-o"></i>暂无数据</span></div>);
    }
});

class GridTable extends Component{
    constructor(props){
        super(props);
        this.state = {}
    }

    rowGetter = (index)=> {
        // console.log(this.getRowCount());
        if (index < 0 || index > this.getRowCount()) {
            return undefined;
        }
        return this.props.dataSource[index]
    };

    getRowCount = ()=> {
        const {dataSource} = this.props;
        return (dataSource && dataSource.length) || 0
    };

    render(){
        const {style, minWidth, minHeight, headerRowHeight, rowHeight, rowRenderer, columns,
            enableRowSelect, enableCellSelect, rowKey, rowScrollTimeout,rowSelection,
            emptyRowsView,
            onRowUpdated, onRowClick,
            onGridSort,onAddFilter,onClearFilters,onGridRowsUpdated,
            width, maxWidth, className, pagination, tableLoading, delay,
            ...props} = this.props;
        const resolvedColumns = columns.map((column)=>{
            let _F, Formatter = column.formatter;
            if(typeof Formatter === 'function'){
                _F = <Formatter />;
            }
            else if(_F && typeof _F.type !== 'function'){
                _F = undefined
            }
            return Object.assign({}, {resizable: true}, column, {getRowMetaData:(rowData, column)=>{ return rowData}, formatter: _F})
        });

        const cls = `${cx({
            'yzh-data-grid-container': true
        })} ${typeof className === 'string' ? className : ''}`;
        const styles = {
            width: typeof width === 'number' ? `${width}px` : typeof width === 'string' ? width : 'auto',
            maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : typeof maxWidth === 'string' ? maxWidth : 'auto'
        };
        const resolvedMinHeight = minHeight === 'auto' ? 52+this.getRowCount()*rowHeight : minHeight;
        // console.log(resolvedColumns, this.getRowCount());
        return (
            <div className={cls} style={Object.assign({}, style, styles)} size={'large'}>
                <Spin spinning={ !!tableLoading } delay={delay} >
                    <ReactDataGrid
                        width={width}
                        maxWidth={maxWidth}
                        minWidth={minWidth}
                        minHeight={resolvedMinHeight}
                        headerRowHeight={headerRowHeight}
                        rowScrollTimeout={rowScrollTimeout}
                        enableCellSelect={enableCellSelect}
                        enableRowSelect={enableRowSelect}
                        rowKey={rowKey}
                        columns={resolvedColumns}
                        rowGetter={this.rowGetter}
                        rowsCount={this.getRowCount()}
                        rowHeight={rowHeight}
                        rowRenderer={rowRenderer}
                        rowSelection={rowSelection}
                        onRowUpdated={onRowUpdated}
                        onRowClick={onRowClick}
                        emptyRowsView={emptyRowsView || EmptyRowsView}
                        onGridRowsUpdated={onGridRowsUpdated}
                        onAddFilter={onAddFilter}
                        onClearFilters={onClearFilters}
                        onGridSort={onGridSort}
                       />
                </Spin>
                <div className={'yzh-data-grid-pagination'}>
                    <Pagination {...pagination}/>
                </div>
            </div>
        )
    }
}

GridTable.propTypes = {
    width: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),                                                                                 // DataGrid宽度
    maxWidth: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),                                                                                 // DataGrid最大宽度
    className: PropTypes.string,
    dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,                         // 数据源
    pagination: PropTypes.shape({
        current: PropTypes.number.isRequired,
        defaultCurrent: PropTypes.number,
        total: PropTypes.number.isRequired,
        defaultPageSize: PropTypes.number,
        pageSize: PropTypes.number,
        onChange: PropTypes.func,
        showSizeChanger: PropTypes.bool,
        onShowSizeChange: PropTypes.func,
        size: PropTypes.string,
        simple: PropTypes.object,
        pageSizeOptions: PropTypes.array,
        showTotal: PropTypes.func
    }).isRequired,
    tableLoading: PropTypes.bool,                                                       // table加载loading状态
    delay: PropTypes.number.isRequired,                                                 // table加载loading状态延迟时间

   /* totalWidth: PropTypes.oneOfType([
     PropTypes.number,
     PropTypes.string
     ]).isRequired,   */                                                                // DataGrid宽度
    minHeight: React.PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.oneOf(['auto'])
    ]).isRequired,
    minWidth: React.PropTypes.number,
    headerRowHeight: React.PropTypes.number,
    rowHeight: React.PropTypes.number.isRequired,
    rowGetter: React.PropTypes.func,
    // rowGetter: React.PropTypes.func.isRequired,
    rowsCount: React.PropTypes.number,
    // rowsCount: React.PropTypes.number.isRequired,
    rowRenderer: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.func
    ]),
    columns: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]).isRequired,

    enableRowSelect: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),
    enableCellSelect: React.PropTypes.bool,
    onCellSelected: React.PropTypes.func,
    onCellDeSelected: React.PropTypes.func,

    rowKey: React.PropTypes.string,
    rowScrollTimeout: React.PropTypes.number,
    rowGroupRenderer: React.PropTypes.func,
    rowActionsCell: React.PropTypes.func,
    onRowUpdated: React.PropTypes.func,
    onRowClick: React.PropTypes.func,
    onRowSelect: React.PropTypes.func,
    onRowExpandToggle: React.PropTypes.func,

    toolbar: React.PropTypes.element,
    /*onFilter: React.PropTypes.func,*/
    onCellCopyPaste: React.PropTypes.func,
    onCellsDragged: React.PropTypes.func,
    onCellExpand: React.PropTypes.func,
    onAddFilter: React.PropTypes.func,
    onGridSort: React.PropTypes.func,
    onDragHandleDoubleClick: React.PropTypes.func,
    onGridRowsUpdated: React.PropTypes.func,

    onClearFilters: React.PropTypes.func,
    contextMenu: React.PropTypes.element,
    cellNavigationMode: React.PropTypes.oneOf(['none', 'loopOverRow', 'changeRow']),

    /*enableDragAndDrop: React.PropTypes.bool,*/

    rowSelection: React.PropTypes.shape({
        enableShiftSelect: React.PropTypes.bool,
        onRowsSelected: React.PropTypes.func,
        onRowsDeselected: React.PropTypes.func,
        showCheckbox: React.PropTypes.bool,
        selectBy: React.PropTypes.oneOfType([
            React.PropTypes.shape({
                indexes: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
            }),
            React.PropTypes.shape({
                isSelectedKey: React.PropTypes.string.isRequired
            }),
            React.PropTypes.shape({
                keys: React.PropTypes.shape({
                    values: React.PropTypes.array.isRequired,
                    rowKey: React.PropTypes.string.isRequired
                }).isRequired
            })
        ]).isRequired
    }),

    onCheckCellIsEditable: React.PropTypes.func,

    /* called before cell is set active, returns a boolean to determine whether cell is editable */
    overScan: React.PropTypes.object

};

GridTable.defaultProps = {
    pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showSizeChanger: false
    },
    delay: 0,
    enableRowSelect: false,
    enableCellSelect: false,
    rowHeight: 35,
    minHeight: 350,
    // totalWidth: 'auto',
    rowKey: 'id',
    rowScrollTimeout: 0,
    tabIndex: -1,
    cellNavigationMode: 'none',
    overScan: {
        colsStart: 5,
        colsEnd: 5,
        rowsStart: 5,
        rowsEnd: 5
    }
};

export default GridTable;