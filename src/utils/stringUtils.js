import validator from 'validator'

/*
* @interface 去除字符窜左右的空格
* @param {string} s 需要处理的字符窜
* @return {string} 处理后的字符窜
* @export
* */
function trim(s){
    return validator.trim(s)
}

/*
* @interface 去除字符窜左边的空格
* @param {string} s 需要处理的字符窜
* @return 去除左侧空白字符后的字符串
* */
function trimLeft(s){
    if(s == null) {
        return "";
    }
    var whitespace = new String(" \t\n\r");
    var str = new String(s);
    if (whitespace.indexOf(str.charAt(0)) != -1) {
        var j=0, i = str.length;
        while (j < i && whitespace.indexOf(str.charAt(j)) != -1){
            j++;
        }
        str = str.substring(j, i);
    }
    return str;
}

/*
* @interface 去除字符窜右边的字符窜
* @param {string} s 需要处理的字符窜
* @return 处理右侧空白字符窜后的字符窜
* */
function trimRight(s){
    if(s == null) return "";
    var whitespace = new String(" \t\n\r");
    var str = new String(s);
    if (whitespace.indexOf(str.charAt(str.length-1)) != -1){
        var i = str.length - 1;
        while (i >= 0 && whitespace.indexOf(str.charAt(i)) != -1){
            i--;
        }
        str = str.substring(0, i+1);
    }
    return str;
}

function _retTrimValue(value){
    if(!value || typeof value === 'number') return value;
    if(value instanceof Array){
        return value.map((_v)=>{
            return _retTrimValue(_v)
        })
    }
    if(typeof value === 'object'){
        return formTrim(value)
    }
    if(typeof value === 'string'){
        return trim(value)
    }
};

function formTrim(data){
    let _d;
    if(!data || typeof data === 'function' || typeof data !== 'object' ) return data;
    if(data instanceof Array){
        return data.map(value => _retTrimValue(value))
    }
    const keys = Object.keys(data);
    const d = {};
    keys.map((_k)=>{
        d[_k] = _retTrimValue(data[_k])
    });

    return d;
}

export  default {
    trim,
    formTrim
};