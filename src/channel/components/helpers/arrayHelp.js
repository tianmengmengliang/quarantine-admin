
/*
* @interface 获取数组长度
* @param {any} 数组或者其他类型数据
* @return {number} 数组长度或者0
* */
function getAccountOfArray(array){
    if(array instanceof Array) {
        return array.length
    }else{
        throw new TypeError({
            msg: 'the param is not a array, you convert a '+typeof array+'',
            errorObject: array
        })
    }
}

/*
* @interface 返回一个数组的长度信息
* @param {array} 需要判断的数组
* @return {object} 返回该数组的长度信息
* */
export function getArraySelectedInfo(selectedArray){
    const len = getAccountOfArray(selectedArray);
    if(len === 1){
        return {length: len, msg: 'you select 1 element', selectedArray}
    }else if( len === 0){
        return {length: len, msg: 'you select 0 element', selectedArray}
    }else if(len > 1){
        return {length: len, msg: 'you select '+len+'elements', selectedArray}
    }
}


/*
 * @interface 判断两个数组的长度是否相等
 * @param {array} arr1 数组1
 * @param {array} arr2 数组2
 * @return {boolean} 如果两个数组的长度相等则返回true否则返回false
 * */
export function isEqualOfLength(arr1, arr2){
    if(!(arr1 instanceof Array) || !(arr2 instanceof Array)){
        return false
    }else{
        return arr1.length === arr2.length
    }
}