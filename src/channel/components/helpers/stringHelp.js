
/*
* @interface 根据文件路径名或者文件名获取文件后缀
* @return {string} 返回文件后缀名
* */
function getFileSuffix(filePath){
    if(typeof filePath !== 'string'){
        return ''
    }else{
        const _position = filePath.toLowerCase().lastIndexOf('.');
        const suffix = filePath.substring(_position + 1);
        return suffix
    }
}

export {
    getFileSuffix
}