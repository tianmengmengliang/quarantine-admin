/*
* @author LH
* 常用的一些函数
* */

/*
* @interface {...arg=>object} assign 拷贝对象，可以深度拷贝也可以浅度拷贝，默认为深度拷贝
* @return 返回合并后的对象
* */
export function assign(){

    function objectAssign(s,target){
        var key,source=s;

        //当源对象为数组时，直接替换为目标对象
        if(s instanceof Array){source=target;return source}
        for(key in target){
            if (Object.prototype.hasOwnProperty.call(target, key)){
                if(typeof target[key]!=="object"||!target[key]||target[key] instanceof Array) {source[key]=target[key];console.log("source",source);continue;}
                source[key]=objectAssign(s[key],target[key]);
            }
        }
        console.log(s,target);
        console.log(source);
        return source;
    }

    var key,i=0,s={},len=arguments.length,isDeep=true;
    if(typeof arguments[len-1]==="boolean") {isDeep=arguments[len-1];len=len-1}
    for(;i<len;i++){
        if(!(arguments[i] instanceof Object)) throw new TypeError("assign process has a error,the param index "+(i+1)+" is not a object,it is a"+arguments[i]);
        for(key in arguments[i]){
            if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
                if(isDeep){
                    console.log("arguments["+i+"]"+"["+key+"]:",arguments[i][key]);
                    //只有plain object只有纯对象才能合并,null,array其他非对象类型直接合并
                    if(typeof arguments[i][key]!=="object"||!arguments[i][key]||arguments[i][key] instanceof Array) {s[key]=arguments[i][key];console.log("s=",s);continue;}
                    s[key]=s[key]||{};
                    s[key]=objectAssign(s[key],arguments[i][key]);
                    console.log("s",s,"key",key,s[key])
                }else{
                    s[key]=arguments[i][key];
                }
            }
        }
        console.log(s);
    }
    return s;
}