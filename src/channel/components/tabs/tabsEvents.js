
function _retTabsEventResult({eventType, eventOrigin}){
    return {
        eventType,
        eventOrigin
    }
}

export function getCurrentTabsEvent(info){
    /*
    * nextNav{}
    * currentNav{}
    * action{}
    * */
    const {route, action} = info;
    if(action) {
        // 动作类型
        const {id} = action;
        if (id) {
            return _retTabsEventResult({
                eventType: 'actionEvent',
                eventOrigin: action
            })
        }
    }

    if (route) {
        // 路由类型
        const {location} = route;
        if (location) {
            const {pathname} = location;
            if (pathname) {
                return _retTabsEventResult({
                    eventType: 'routeEvent',
                    eventOrigin: location
                })
            }
        }
    }

    // 无效的tabsEvent
    return _retTabsEventResult({
        eventType: 'invalidEvent',
        eventOrigin: {}
    })
}