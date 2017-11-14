import area from './area.js'

/*
* @interface 根据省市id返回省市对象
* @provinceId {string} 省的id
* @cityId {string} 城市id
* @return {Array.object} 返回省市的对象
* */
export function searchLocationByValues(provinceId,cityId){
    if(!provinceId||!cityId) return [];
    function loop(id,arr){
        if(!id||!arr) return {};
        try{
           for(var i=0,len=arr.length;i<len;i++){
               if(arr[i].value==id) return arr[i]
           }
            return {};
        }catch(e){
            console.log(e)
        }
        return {};
    }

    var province=loop(provinceId,area);
    var city=loop(cityId,province.children);
    var location=[];
    location.province={
        value:province.value,
        label:province.label
    };
    location.city=city;

    return location
}