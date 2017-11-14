
var events=require('events');
var util=require('util');
var fs=require('fs');
var path=require('path');

var Promise=function(){
    events.EventEmitter.call(this)
};
util.inherits(Promise,events.EventEmitter);

Promise.prototype={
    then:function(successHandle,errorHandle,progressHandle){
        if( typeof successHandle === 'function'){
            this.on('success',function(res){
                successHandle(res)
            })
        }
        if( typeof errorHandle === 'function' ){
            this.on("error",function(error){
                errorHandle(error);
            })
        }
        if( typeof progressHandle === 'function' ){
            this.on('progress',function(data){
                progressHandle(data)
            })
        }
    }
};

var Deferred=function(){
    this.state='pending';
    this.promise=new Promise()
};

Deferred.prototype={
    resolve:function (res){
        this.state='resolved';
        this.promise.once('success',res)
    },
    reject:function (error){
        this.state='rejected';
        this.promise.then('error',error)
    },
    progress:function (data){
        this.state='pending';
        this.promise.then('progress',data)
    }
};

var readConfigFile=function(pathName,encode){
    console.log('开始读取:'+pathName);
    fs.readFile(pathName,encode,function(error,res){
        console.info('读取'+pathName+'成功','\n',"开始修改文件路径");
        var config=JSON.parse(res);
        var patterns=[];
        for( var x in config){
            var str=x.replace(/[\.]/,'\\\.');
            var suffixMapAttribute,suffix=x.substring(x.lastIndexOf('\.'));
            switch( suffix ){
                case '.css': suffixMapAttribute='href'; break;
                case '.js' : suffixMapAttribute='src' ; break;
                default: throw new Error('the suffix is invalid, the suffix convert is ' + suffix)
            }
            patterns.push({ sourceKey:x, targetKey: config[x], patternStr: str, suffixMapAttribute: suffixMapAttribute});
        }
        readHtmlFile(path.join(pathName,'..','index.html'),'utf-8',function(error,res){

            var htmlTemplateStr=res;

            for( var x in patterns ){
                var pattern=new RegExp(patterns[x]['suffixMapAttribute']+'\=([\'\"])\\\.\\\/'+patterns[x]['patternStr']+'\\1');
                // console.log(patterns[x]['suffixMapAttribute']+'\=([\'\"])\\\.\\\/'+patterns[x]['patternStr']+'\\1');
                var hasSourceKey=pattern.test( htmlTemplateStr );
                if( hasSourceKey ) {
                    console.log(patterns[x]["sourceKey"] + "------------>" + patterns[x]["targetKey"] + "         成功")
                }else{
                    console.error('can\'t find '+patterns[x]["sourceKey"]+', ----------->'+ patterns[x]["sourceKey"] + " map " + patterns[x]["targetKey"])
                }
                // console.log(htmlTemplateStr);

                htmlTemplateStr=htmlTemplateStr.replace(  pattern, patterns[x]["suffixMapAttribute"]+"="+"\"\.\/"+patterns[x]["targetKey"]+"\"")
            }

            fs.writeFile(path.join(pathName,'..','index.html'),htmlTemplateStr,'utf-8',function(error,res){
                if( error ){
                    console.error( error );
                }else{
                    console.log(pathName+"修改文件路径成功")
                }
            })
        })
    })
};

var readHtmlFile=function(pathName,encode,callback){
    fs.readFile(pathName,encode,function(error,res){
        callback&&callback(error,res)
    })
};

readConfigFile(path.join(__dirname,'./','dir','map.json'),'utf-8');