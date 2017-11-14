import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom'
import {CONFIG} from 'antd/../../src/services/'
const {lsNames: {platform: {USER_ROLE}}} = CONFIG;

const RES_TYPE = {
    "btn": "btn",
    "element": "element",
    "formField": "formField"
};

const resList = {
    '/cygl/checkNotification/sendNotificationBtn': {
        permission: {
            nameEn: ["ciq_yunying"]
        }
    },
    '/cygl/checkNotification/editBtn': {
        permission: {
            nameEn: ["ciq_yunying"]
        }
    },
    '/cygl/checkNotification/deleteBtn': {
        permission: {
            nameEn: ["ciq_yunying"]
        }
    },
    '/cygl/checkNotification/dispatchBtn': {
        permission: {
            nameEn: ["ciq_jianyiju"]
        }
    },
    '/cygl/checkNotification/notNeedCheckBtn': {
        permission: {
            nameEn: ["ciq_jianyiju"]
        }
    },
    '/cygl/checkTask/chayanrenyuanFormField': {
        permission: {
            nameEn: ["ciq_jianyiju", 'ciq_yunying']
        }
    },
    '/cygl/checkTask/confirmTaskBtn': {
        permission: {
            nameEn: ["ciq_jianyiju", "ciq_chayanyuan"]
        }
    },
    '/cygl/checkTask/viewBtn1': {
        permission: {
            nameEn: ["ciq_yunying"]
        }
    },
    '/cygl/checkTask/viewBtn2': {
        permission: {
            nameEn: ["ciq_jianyiju", "ciq_chayanyuan"]
        }
    },
    '/cygl/checkTask/writeCheckResultBtn': {
        permission: {
            nameEn: ["ciq_jianyiju", "ciq_chayanyuan"]
        }
    },
    '/hxjg/use/addUserLog': {
        permission: {
            nameEn: ["ciq_kehu"]
        }
    },
    '/hxjg/use/submitUseLogBtn': {
        permission: {
            nameEn: ["ciq_kehu"]
        }
    },
    '/hxjg/use/writeWasteResolve': {
        permission: {
            nameEn: ["ciq_kehu"]
        }
    },
    '/hxjg/use/userLogOperation': {
        permission: {
            nameEn: ["ciq_kehu"]
        }
    },
    '/hxjg/use/nameInput': {
        permission: {
            nameEn: ["ciq_jianyiju", "ciq_chayanyuan"]
        }
    },
    '/hxjg/hxjgList/nameInput': {
        permission: {
            nameEn: ["ciq_jianyiju", "ciq_chayanyuan"]
        }
    },
    '/hxjg/hxjgList/punInBtn': {
        permission: {
            nameEn: ["ciq_kehu"]
        }
    }
};

function parsePermission(resId, render){
    const UserRole = JSON.parse(localStorage.getItem(USER_ROLE));
    const resConfig = resList[resId];
    if((!resId || !resConfig) && !render){
        throw new TypeError(`resId: ${resId}, resConfig:${resConfig}`)
    }
    if(UserRole && resConfig){
        const has = resConfig["permission"]["nameEn"].some((name)=>{return UserRole.some((userRole)=>{ return name === userRole["nameEn"]})});
        return {
            resId: resId,
            role: UserRole,
            config: resConfig,
            has: has
        }
    }else{
        return {
            resId: resId,
            role: UserRole,
            config: null,
            has: false
        }
    }
};

export default function Permission({children, resId, render, ...props}){

    const parsePermissionResult = parsePermission(resId, render);
    const PermissionEle = render && typeof render === 'function' ? render(parsePermissionResult) : parsePermissionResult.has ? children : <span></span>;
    // console.log(parsePermissionResult, PermissionEle);
   /* const permissionDOM = ReactDOM.findDOMNode(PermissionEle);
    if(permissionDOM){
        console.log(permissionDOM);
        permissionDOM.setAttribute("data-permission-id", resId);
    }*/
    return (
        PermissionEle ?
            typeof PermissionEle === 'object' && (typeof PermissionEle.type === 'string' || typeof PermissionEle.type === 'function') ?
                React.cloneElement(PermissionEle, {...props, _permission: parsePermissionResult}) :
                PermissionEle :
            PermissionEle
    )
}

Permission.propTypes = {
    resId: PropTypes.string,
    resType: PropTypes.string,
    resRole: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
    ])
};

