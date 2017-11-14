
/*
* @interface 将数组指定区域的值都替换成指定值
* */
export  function fill(value) {

    // Steps 1-2.
    if (this == null) {
        throw new TypeError('this is null or not defined');
    }

    var O = Object(this);

    // Steps 3-5.
    var len = O.length >>> 0; // parseInt(O.length)

    // Steps 6-7.
    var start = arguments[1];
    var relativeStart = start >> 0;

    // Step 8.
    var k = relativeStart < 0 ?
        Math.max(len + relativeStart, 0) :
        Math.min(relativeStart, len);

    // Steps 9-10.
    var end = arguments[2];
    var relativeEnd = end === undefined ?
        len :
    end >> 0;

    // Step 11.
    var final = relativeEnd < 0 ?
        Math.max(len + relativeEnd, 0) :
        Math.min(relativeEnd, len);

    // Step 12.
    while(k < final) {
        O[k] = value;
        k++;
    }

    // Step 13.
    return O;
}

/*
* @interface 删除数组制定位置的一个元素
* @param {array} arr 待删除数组元素的数组
* @param {number} dx 制定元素的位置
* @return {boolean} 删除成功返回true否则返回false
* */
export function remove(arr, dx){
    if(!(arr instanceof Array) || isNaN(dx) || (dx -1) > arr.length){
        return false
    }else{
        arr.splice(dx, 1);
        return true
    }
}