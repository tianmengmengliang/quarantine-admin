import React, { Component, PropTypes } from 'react';
import cx from 'classnames'
import './map.less'

let uniqueId = 0;
function _generatorUniqueMapId(){
    return `react-map-id${uniqueId}`
}

class Map extends Component{
    constructor(props){
        super(props);
        this.container = null;
        this.iframe = null;
        this.mapId = _generatorUniqueMapId();
    }

    componentDidMount() {
        this.initMap(this.props);
    }

    componentWillReceiveProps(newProps) {
        const { query: newQuery, width: newWidth, height: newHeight, src: newSrc, domain: newDomain, method: newMethod } = newProps;
        const { query: oldQuery, width: oldWidth, height: oldHeight, src: oldSrc, domain: oldDomain, method: oldMethod } = this.props;

        if (newSrc !== oldSrc) {
            console.warn('iframe src 不支持修改');
        }

        if (newQuery !== oldQuery || newDomain !== oldDomain || newMethod !== oldMethod) {
            this.changeMap(newSrc, newDomain, newMethod, newQuery)
        }
        if (newWidth !== oldWidth || newHeight !== oldHeight) {
            this.changeSize(newWidth, newHeight)
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillUnmount() {
        this.container = null;
        this.iframe = null;
        this.mapId = null;
    }

    /*
     * @interface 将对象转换成url的seacher
     * @param {object} seacherObj seracher对象
     * */

    objToSeacher=(seacherObj)=>{
        const queryKeys=Object.keys(seacherObj);
        let len=queryKeys.length,queryStr='';
        queryKeys.map((key,index)=>{
            if( seacherObj.hasOwnProperty(key) && seacherObj[key] !== undefined && seacherObj[key] !== null) {
                queryStr += `${key}=${seacherObj[key]}`;
                if (index !== len - 1) queryStr += "&"
            }
        });

        return queryStr
    };

    /*
    * @interface 创建一个map的html的iframe
    * @param {string} iframeSrc map的html的url
    * @param {object | string} query map的url的参数
    * */
    createIframe = (iframeSrc, domain, method, query)=>{
        const {width, height, minHeight} = this.props;
        let queryStr, resolvedWidth, resolvedHeight;
        resolvedWidth = typeof width ==='string' ? width : `${width}px`;
        resolvedHeight = typeof height === 'string' ? height : `${height}px`;
        if(typeof query === 'object'){
            queryStr = this.objToSeacher(query)
        }else if(typeof query === 'string'){
            queryStr = query;
        }

        const iframe=document.createElement('iframe');
        iframe.setAttribute("src",`${iframeSrc}?domain=${domain}&method=${method}${queryStr ? `&${queryStr}` : ''}`);
        iframe.setAttribute("class",`yzh-map-iframe`);
        iframe.setAttribute("style",`width: ${resolvedWidth};height: ${resolvedHeight};min-height: ${height === 'auto' ? `${minHeight}px` : resolvedHeight }`);
        this.container.appendChild(iframe);
        this.iframe = iframe;
    };

    initMap = (props)=> {
        const {src, domain, method, query} = props;
        this.createIframe(src, domain, method, query);
    };

    changeMap = (src, domain, method, query)=>{
        let queryStr;
        if(typeof query === 'object'){
            queryStr = this.objToSeacher(query)
        }else if(typeof query === 'string'){
            queryStr = query;
        }
        this.iframe.src = `${src}?domain=${domain}&method=${method}${queryStr ? `&${queryStr}` : ''}`;
    };

    changeSize = (props)=>{
        const {width, height, minHeight} = props;
        let resolvedWidth, resolvedHeight;
        resolvedWidth = typeof width ==='string' ? width : `${width}px`;
        resolvedHeight = typeof height === 'string' ? height : `${height}px`;
        iframe.setAttribute("style",`width: ${resolvedWidth};height: ${resolvedHeight};min-height: ${height === 'auto' ? `${minHeight}px` : resolvedHeight }`);
    };



    render(){
        const {prefix, className, ...props} = this.props;
        const cls = cx({
            [`${prefix}-map-container`]: true
        });
        return (
            <div
                className={`${cls} ${className ? className: ''}`}
                ref={(container)=>{this.container = container}}
                mapContainerId={this.mapId}
                {...props}></div>
        )
    }
}

Map.propTypes = {
    prefix: PropTypes.string,
    width: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    height: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),
    minHeight: PropTypes.number,
    src: PropTypes.string.isRequired,
    domain: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    query: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            deviceSn: PropTypes.string.isRequired,
            begin: PropTypes.number.isRequired,
            end: PropTypes.number.isRequired
        })
    ])
};

Map.defaultProps = {
    prefix: 'yzh',
    width: '100%',
    height: 'auto',
    minHeight: 600
};

export default Map;