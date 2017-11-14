import config from './config';
import superagent from 'superagent';
import {message } from 'antd';

function formData(options){
  let formData=new FormData();
  const keys=Object.keys(options);
  keys.map((key)=>{
    if(options[key]===undefined||options[key]===null) return;
    formData.append(key,options[key])
  })

  return formData
}


function xFetch(code, options, success, fail, method,complete) {
  if (!code || !config.api[code]) return;

  const url = config.url;
  const api = config.api[code];
  const token = api[1] ? localStorage.getItem(config.token):'';
  const isFormData=api[2];
  const dev=true;

  // if(dev) return;

   superagent
     .post(url+"?method="+api[0])
     .set('Authorization', token)
     .send(isFormData?formData(options):options)
     .end(function(err, res) {
       if (err) {                                                 // 网络原因,业务逻辑错误
         //message.error(err.message);
         console.log(err);
         fail&&fail(err);
         complete&&complete(err,res);
         return;
       }
       if (res.ok && res.body && res.body.success) {              // 请求成功
         success && success(res.body);
         complete&&complete({},res.body);
         return;
       } else if(!res.body) {                                     // 网络通畅，服务端发生错误
         message.error("服务器没有正常返回数据");
         complete&&complete(new Error("服务器没有正常返回数据"),res);
         return;
       } else{                                                    // 请求失败
         // message.error(res.body.msg&&res.body.errorResponse&&res.body.errorResponse.msg);
       }
       fail && fail(res.body);
       complete&&complete({},res.body);
});

}

export default xFetch;
