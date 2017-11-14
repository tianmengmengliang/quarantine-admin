import React, { Component, PropTypes } from 'react';
import G2 from 'g2'
import moment from 'moment';
import createTempChart from './createTempChart.jsx'
import {fetch} from '../../services/'

let TempChart = createTempChart(({chart, slider, width, chartId, data})=>{

    if(typeof data.length === 'number' && data.length !== 0){
        var timeMin = data[0] && moment(data[0]["at"]).unix(), timeMax = data[0] && moment.unix(data[0]["at"]);
        var min = 0, max = 9;
        data.map((record)=> {
            if (record.t < min) {
                min = record.t;
            }
            if (record.t > max) {
                max = record.t;
            }
            if (moment(record.at).unix() < timeMin) {
                timeMin = record.at
            }
            if (moment(record.at).unix() > timeMax) {
                timeMax = record.at
            }
        });
    }

    // console.log(timeMin)

  /*  chart.col('t', {
        type: "linear",
        max: max,
        min: min,
        alias: "温度(℃)"
    });

    chart.axis('at', {
        title: null
    });*/

    /*chart.tooltip({
        title: null,
        crosshairs: {
            type: 'cross'
        }
    });*/

    var lineCfg = { // 线的配置信息
        stroke: '#94E08A'
    };

    var frame = new G2.Frame(data);
    chart.source(frame, {
        at: {
            nice: true,
            mask: 'yy/mm/dd HH:mm',
            alias: '时间',
            tickCount: 6
        },
        t: {
            type: "linear",
            tickInterval: 2,
            max: max,
            min: min,
            alias: "温度"
        }
    });

    chart.axis('at', false);

    chart.axis('t', {
        formatter: function(val) {
            return val + ' ℃';
        },
        grid: {
            line: {
                stroke: '#d9d9d9',
                lineWidth: 1,
                lineDash: [4, 4],
            }, // 代表栅格线的类型，line polygon circle 只能选择一种 图形属性
            minorLine: 0, // 次要线的配置项
            minorCount: 0, // 2个Grid线中间的次要线的数目
            odd: {
                fill: 'red'
            }, // 如果值为 null，则不显示。栅格内部的奇数背景 图形属性
            even: {
                fill: 'red'
            } //  如果值为 null，则不显示。栅格内部的偶数背景 图形属性
        }, // 坐标轴栅格线的配置信息，默认只有左边的坐标轴带有栅格线，null 为不显示。
    });

    chart.line().position('at*t').color('#B03A5B').size(2);
    chart.on('tooltipchange', function(ev) {
        var items = ev.items; // tooltip显示的项
        var origin = items[0]; // 将一条数据改成多条数据
        var at = origin.point._origin.at;
        var t = origin.point._origin.t;
        items.splice(0); // 清空
        items.push({
            name: '时间',
            // title: moment(at).format('YYYY-MM-DD HH:mm'),
            marker: true,
            color: origin.color,
            value:  at
        });
        items.push({
            name: '温度',
            title: t ,
            marker: true,
            color: origin.color,
            value: t + '℃'
        });
    });
    chart.tooltip({
        title: false
    });

    chart.legend(false);
    chart.guide().tag(['min', 2], ['max', 2],  '最低温度控制线: ' + 2 + '℃',  {line: lineCfg});
    chart.guide().tag(['min', 8], ['max', 8],  '最高温度控制线: ' + 8 + '℃',  {line: lineCfg});
    // chart.line().position('at*t');
    slider.render();
});

TempChart.propTypes = {
    prefix: PropTypes.string,
    data: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    plotCfg: React.PropTypes.object,
    forceFit: React.PropTypes.bool,
};

TempChart.defaultProps = {
    prefix: 'yzh'
};

export default TempChart;