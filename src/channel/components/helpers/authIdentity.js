import {CONFIG} from 'antd/../../src/services/'
const {lsNames: {platform: {USER, USER_ROLE}}} = CONFIG;

/*
* @interface 判断是否是同一个用户
* @return {boolean} 如果为同一个用户则返回true，否则返回false
* */
function isSameUser(userId){
    const user = getUser();
    return user.id === userId
};

/*
* @interface 获取用户身份信息
* @return {object} 返回当前用户身份
* */
function getUser(){
    const user = JSON.parse(localStorage.getItem(USER)) || {};
    return user
}
/*
* @interface 获取用户身份
* @return {object} 返回当前用户角色
* */
function getUserRole(){
    const userRole = JSON.parse(localStorage.getItem(USER_ROLE)) || [{}];
    return userRole
}

export {
    isSameUser,
    getUser,
    getUserRole
}