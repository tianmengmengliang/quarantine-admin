import React, { Component, PropTypes } from 'react';
import cx from 'classnames'
import {Upload, Input, Icon, Modal} from 'antd'
import {PDFViewer2} from '../index'
import {CONFIG} from 'antd/../../src/services/'
import './inputUpload.less'

/**------------- 1.生成值----------------**/
function generateValue(value){
    //console.log("上传",value );
    if(!value){
        return {}
    }
    if(typeof value === 'string'){
        const _file = generateFile(value)  //
        return {
            status: 'success',
            file: _file,
            fileList: [_file],
            filePath: value
        }
    }
    if(typeof value === 'object'){
        return value
    }
    return {}
}
/**------------- 2.生成文件 ---------------**/
function generateFile(filePath){
    const _index = filePath.lastIndexOf('\/') === -1 ? 0 : filePath.lastIndexOf('\/');
    const _type = filePath.lastIndexOf('\.') === -1 ? '' : filePath.substring(filePath.lastIndexOf('\.'));
    return {
        name: filePath.substring(_index),
        type: _type,
        status: 'done',
        uid: `rc-upload-${Date.now()}`
    }
}

/**
 *   功能：文件上传组件。
 *   作者：刘豪  2017/7
 **/
class InputUpload extends Component{
    constructor(props){
        super(props);

        let value = this.props.value;
        value = generateValue(value); //1.
        this.state = {
            status: value.status,
            previewVisible: false,
            previewImage: undefined,
            fileList: value.fileList,
            file: value.file,
            filePath: value.filePath
        }
    }

    componentDidMount(){
        let value = this.props.value;
        if(!value){
        }else{
            value = generateValue(value);
            const onChange = this.props.onChange;
            if (onChange) {
               onChange(value)
            }
        }
    }

    componentWillReceiveProps(nextProps){
        if('value' in nextProps){
            const {value, propsName} = nextProps;
            const _value = generateValue(value);
            this.setState({
                status: _value.status,
                fileList: _value.fileList,
                file: _value.file,
                filePath: _value.filePath
            });
        }
    }

    /*
    * @interface  1.提供一个传递值的事件。
    * @param changedValue
    **/
    triggerChange = (changedValue) => {
        // Should provide an event to pass value to Form.
        const {status, file, fileList, filePath} = this.state;
        const onChange = this.props.onChange;
        if (onChange) {
            if(!changedValue){
                onChange(changedValue)
            }else {
                onChange(Object.assign({}, {status, file, fileList, filePath}, changedValue)); //深拷贝.
            }
        }
    };

    /*
    * @interface  2.根据url预览文件。
    * */
    pdfViewerClick = (pdfUrl)=>{
        PDFViewer2.open(pdfUrl)
    };

    /*
    * @interface  3.预览图片
    * @param {string} imgSrc 图片的src
    * */
    onPreviewImage = (imgSrc)=>{
        this.setState({
            previewVisible: true,
            previewImage: imgSrc
        })
    };

    /*
    * @interface  4.关闭图片对话框
    * */
    onPreviewImageCancel = ()=>{
        this.setState({ previewVisible: false })
    };

    /*
     * @interface  5.删除文件。
     * */
    onRemove = ()=>{
        if (!('value' in this.props)) {
            this.setState({
                status: '',
                fileList: undefined,
                file: undefined,
                filePath: undefined
            })
        }
        this.triggerChange(undefined);
    };

    /*
    * @interface  6.根据文件上传路径+状态，返回上传结果。
    **/
    returnStatusElementByTypeNStatus = (type, status, filePath)=>{
        const size = this.props.size || 36;
        const { hasRemoveIcon } = this.props;
        const _style ={ fontSize: size };
        if(filePath && status){
           if(type === 'icon'){
               if(status === 'success'){
                   return (

                       (/(\.jpg| \.jpeg)+$/i).test(filePath) ?
                             <span className="file-view">
                                  <a  style={_style}
                                      className={`${cx({hidden:!filePath})} filename`}
                                      //  href={`${CONFIG.ossFileUrl}${filePath}`}
                                      onClick={this.onPreviewImage.bind(this, `${CONFIG.ossFileUrl}${filePath}`)}
                                      target="_blank">{ filePath ? <Icon type="file"/> : ''}</a>
                                  {hasRemoveIcon ?
                                     <Icon
                                       type="close"
                                       onClick={this.onRemove}
                                       className="file-upload-remove-icon"/> :
                                       undefined
                                  }
                              </span>
                             :
                             (/\.pdf$/i).test(filePath) ?
                                  <span className="file-view">
                                    <a  style={_style}
                                        className={`${cx({hidden: !filePath})} filename`}
                                        //  href={`${CONFIG.ossFileUrl}${filePath}`}
                                        onClick={this.pdfViewerClick.bind(this, `${CONFIG.ossFileUrl}${filePath}`)}
                                        target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
                                    {hasRemoveIcon ?
                                       <Icon
                                         type="close"
                                         onClick={this.onRemove}
                                         className="file-upload-remove-icon"/> :
                                       undefined
                                    }
                                  </span>
                                  :
                                  <span className="file-view">
                                    <a style={{fontSize: size}}
                                        className={`${cx({hidden: !filePath})} filename`}
                                        href={`${CONFIG.ossFileUrl}${filePath}`}
                                        target="_blank">{filePath ? <Icon type="file"/> : ''}</a>
                                    {hasRemoveIcon ?
                                       <Icon
                                         type="close"
                                         onClick={this.onRemove}
                                         className="file-upload-remove-icon"/> :
                                       undefined
                                    }
                                  </span>
                   )
               }
               if(status === 'loading'){
                   return (
                       <span className="file-view">
                            <Icon  className="status-icon status-loading-icon"  type="loading" />
                            <a className="status-text status-loading-text">上传中...</a>
                       </span>
                   )
               }
               if(status === 'error'){
                   return (
                       <span className="file-view">
                            <div>
                                <Icon className="status-icon status-error-icon"  type="close-square-o" />
                            </div>
                            <span className="status-text status-text-error">上传失败！请重新上传</span>
                       </span>
                   )
               }
           }
        }else{
            return undefined
        }
    };

    render(){
        const {prefix, style, className, children, type, beforeUpload, onChange, ...props} = this.props;
        const {status, filePath, fileList=[], } = this.state;

        let fileProps = {
            name: 'file',
            action: CONFIG.uploadUrl,
            headers: {authorization: localStorage.getItem(CONFIG.token),},
            showUploadList: false,
            listType: 'text',
            fileList: fileList,
            beforeUpload: (file)=> { //beforeUpload 上传文件之前的钩子，参数为上传的文件，若返回 false 则停止上传。
                if(beforeUpload && typeof beforeUpload === 'function'){
                    return beforeUpload(file)
                }
                return true
            },
            onChange: (info)=> {   //onChange 上传文件改变时的状态，
                const {form} = this.props;
                const dataMeta = this.props[`data-__meta`];
                let filePath = undefined;
                let fileList = info.fileList;

                // 1.限制上传文件的数量，只显示两个最近上传的文件，旧的文件将被新的文件替换。
                fileList = fileList.slice(-1);

                // 2.过滤保留成功上传的文件(服务器会响应的)。
                fileList = fileList.filter((file) => {
                    if (file.response) {
                        if(file.response.success) {
                            filePath = file.response.responseObject.filePath
                        }
                    }
                    return true;
                });

                const _file = {
                    status: fileList[fileList.length - 1].response ?
                        fileList[fileList.length - 1].response.success ? 'success' : 'error' : 'loading',
                    fileList: fileList,
                    file: fileList[fileList.length -1],
                    filePath: filePath
                };
                this.setState(_file);//设置值。
                this.triggerChange(_file);//
            }
        };
        const _fileProps = Object.assign({}, fileProps, {...props}); //深拷贝

        return (
            <div  className={`${prefix}-input-upload ${className ? className : ''}`} style={style}>
                <Modal
                    width={1000}
                    visible={this.state.previewVisible}
                    footer={null}
                    onCancel={this.onPreviewImageCancel}>
                    <img alt="图片" style={{ width:'100%' }}  src={this.state.previewImage} />
                </Modal>
                <Upload {..._fileProps}>
                   {children}
                </Upload>

                {this.returnStatusElementByTypeNStatus(type, status, filePath)}
                <Input
                    type="hidden"
                    value={filePath}
                 />
            </div>
        )
    }
}

/**------------定义组件的默认属性。 -----------**/
InputUpload.propTypes = {
    prefix: PropTypes.string,
    type: PropTypes.oneOf([
        'text',
        'icon',
        'picture'
    ]),
    size: PropTypes.number,
    hasRemoveIcon: PropTypes.bool,
    propsName: PropTypes.string,
};

InputUpload.defaultProps = {
    prefix: 'yzh',
    type: 'icon',
    hasRemoveIcon: true,
    propsName: 'value',
    size: 24
};

InputUpload.valueToObj = function valueToObj(value){
  const _value = generateValue(value);
  return {
      status: _value.status,
      fileList: _value.fileList,
      file: _value.file,
      filePath: _value.filePath
  }
};

/**------------- 组件输出 ---------------**/
export default InputUpload;
