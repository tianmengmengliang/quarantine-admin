import fetch from 'dva/fetch';
import config from './config2.js'
import {formTrim} from '../utils/stringUtils.js'

function _createHeaderAndData(data = {}, headers = {}){
    const cntType = headers[ 'Content-Type'];
    const _d = formTrim(data);
    let _h = {
        ...headers
    };
     // 如果是formData
    if(headers['Content-Type'].indexOf('multipart\/form-data') > -1){
        delete _h[ 'Content-Type'];
        return {
            data: _formData(_d),
            headers: _h
        };
      // 如果Content-type为application/json
    }else if(headers['Content-Type'].indexOf('application\/json') > -1){
        return {
            data: JSON.stringify(_d), // json对象转 json字符串。
            headers: _h
        }
    }
}

function _formData(options){
    let formData=new FormData();

    if(!options || options instanceof Array || typeof options !== 'object'){
        return options
    }
    const keys=Object.keys(options);
    keys.map((key)=>{
        if(options[key]===undefined||options[key]===null) return;
        formData.append(key,options[key])
    });

    return formData
}

/*
* 需要一个responseD对象
* @param {object} response 返回的响应体
* */
function BusinessError(response){
    this.name = 'BusinessError';
    this.message = response.msg;
    this.response = response
}

function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/*
* @interface 用于去除参数对象的 undefined和 null值
* @param {any} 参数对象
* @return {any} 去除参数对象的undefined和null的新的对象
* */
function dislodge(options){
    if(typeof options === 'object'){
        let _newOptions = options instanceof Array ? [] : {};
        const keys = Object.keys(options);
        keys.forEach((key)=>{
            if(options[key] !== undefined || options[key] !== null){
                _newOptions[key] = options[key]
            }
        });
        return _newOptions
    }
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, _options) {
  // console.log(config, url);
    const options = dislodge(_options);
    const {url:hostName, api, token} = config; //这些参数来自于config2.js 中默认输出的变量。
    const {t, cntType} = api[url];
    const {beforeSend, complete, success, error, data, headers = {}, ...option} = options;
    const absolutePath = `${hostName}?method=${url}`;

    const _h = {
        ...headers,
        'Content-Type': cntType,
        'Authorization': t ? localStorage.getItem(token) : ''
    };
    const {headers: resolvedHeaders, data: resolvedData} =  _createHeaderAndData(data, _h);

    // 发送xhr之前invoke
    beforeSend && beforeSend();
    fetch(absolutePath, {
          ...option,
          method: options['method'] ? options['method'] : 'POST',
          headers: resolvedHeaders,
          body: resolvedData
         // credentials
    }).then(checkStatus)
      .then(parseJSON)
      .then((data)=>{
         if(data.success){
             complete && complete(null, data);
             success && success(data)
         }else{
             throw new BusinessError(data)
         }
      }).catch((err) =>{
            if(err.message === 'Failed to fetch'){
                err.message = '服务器内部异常，请检查网络后重试'
            }
            complete && complete(err, null);
            console.log(err)
         error && error(err)
      })
}
