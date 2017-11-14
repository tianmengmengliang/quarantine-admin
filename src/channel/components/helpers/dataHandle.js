
/*
 * @interface 判断两个对象的内容是否一样
 * @param {object} source1 对象1
 * @param {object} source2 对象2
 * @return {boolean} 两个对象键值对相同，则返回true否则返回false
* */
function _isSameObject(source1, source2){
    let isSame = false;
    const keys = Object.keys(source1);
    isSame = keys.every((key)=>{
        return source1[key] === source2[key]
    });
    return isSame;
}

/*
* @interface 判断同一个对象前后时间是否改变
* @param {object} oldQuery 原来的对象
* @param {object} newQuery 改变后的对象
* @return {boolean} 对象dims字段数发生改变则返回true否则返回false
* */
export function isQueryChanged(oldQuery = {}, newQuery ={}){
    const oldKeys = Object.keys(oldQuery);
    const newKeys = Object.keys(newQuery);
    const oldL = oldKeys.length;
    const newL = newKeys.length;
    if(oldL !== newL){
        // 长度不一样
        return true
    }else if(!_isSameObject(oldQuery, newQuery)){
        return true
    }else{
        return false;
    }
}