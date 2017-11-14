import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom'
import {Icon} from 'antd'
import cx from 'classnames'
import './imagePreview.less'

class ImagePreview extends Component{
    constructor(props){
        super(props);
    }

    componentDidMount(){
        const {onImageEvent} = this.props;
        const img = ReactDOM.findDOMNode(this.img);
        img.onLoad = (res)=>{
            onImageEvent && onImageEvent({status: 'success', response: res})
        };

        img.onError = (err)=>{
            onImageEvent && onImageEvent({status: 'error', response: err})
        };

        img.onAbort = (e)=>{
            onImageEvent && onImageEvent({status: 'success', response: e})
        };
    }

    onPreview = (e)=>{
        e.stopPropagation();
        const {onPreview, ...props} = this.props;
        onPreview && onPreview(props)
    };

    onCancel = (e)=>{
        e.stopPropagation()
        const {onCancel, ...props} = this.props;
        onCancel && onCancel(props)
    };

    render(){
        const {prefix, className, style, width, height, src, cancelable, iconSize, ...props} = this.props;
        const iconCls = cx({
            [`icon`]: true,
            [`icon-small`]: iconSize === 'small',
            [`icon-default`]: iconSize === 'default',
            [`icon-large`]: iconSize === 'large'
        });
        return (
            <div
                className={`${cx({[`${prefix}-image-preview`]: true})} ${className ? className : ''}`}
                style={Object.assign({}, style, {width, height})}>
                <img
                    ref={(img)=>{this.img = img}}
                    className="image"
                    src={src}/>
                <div className="mask"  onClick={this.onPreview}>
                    <div className={`mask-content`}>
                        <Icon
                            type="eye-o"
                            className={iconCls}
                           />
                        {
                            cancelable ?
                            <Icon
                                type="delete"
                                className={iconCls}
                                onClick={this.onCancel}/> :
                                undefined
                        }
                    </div>
                </div>
            </div>
        )
    }
}

ImagePreview.propTypes = {
    prefix: PropTypes.string,
    width: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    height: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    src: PropTypes.string.isRequired,
    cancelable: PropTypes.bool,
    onImageEvent: PropTypes.func,
    onPreview: PropTypes.func,
    onCancel: PropTypes.func,
    iconSize: PropTypes.oneOf([
        'small', 'default', 'large'
    ])
};

ImagePreview.defaultProps = {
    prefix: 'yzh',
    width: 60,
    height: 'auto',
    cancelable: false,
    iconSize: 'large'
};

export {
    ImagePreview
}

export default ImagePreview