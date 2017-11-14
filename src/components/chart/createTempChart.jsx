import React, { Component, PropTypes } from 'react';
import G2 from 'g2'
import moment from 'moment'


let uniqueId = 0, sliderUniqueId = 0;
function _generatorChartId(){

    return `temp-chart-id${uniqueId++}`
}

function _generatorSliderUniqueId(){
    return `react-slider-${sliderUniqueId++}`
}

export default function createTempChart(_operation) {
    class TempChart extends Component {
        constructor(props) {
            super(props);
            this.slider = null;
            this.sliderId = _generatorSliderUniqueId();
            this.chart = null;
            this.chartId = _generatorChartId();
        }

        componentDidMount() {
            this.initChart(this.props);
        }

        componentWillReceiveProps(newProps) {
            const { data: newData, width: newWidth, height: newHeight, plotCfg: newPlotCfg } = newProps;
            const { data: oldData, width: oldWidth, height: oldHeight, plotCfg: oldPlotCfg } = this.props;

            if (newPlotCfg !== oldPlotCfg) {
                console.warn('plotCfg 不支持修改');
            }

            if (newData !== oldData) {
                this.chart.changeData(newData);
                this.slider.repaint();
            }
            if (newWidth !== oldWidth || newHeight !== oldHeight) {
                this.chart.changeSize(newWidth, newHeight);
            }
        }

        shouldComponentUpdate() {
            return false;
        }

        componentWillUnmount() {
            this.chart.destroy();
            this.slider.destroy();
            this.chart = null;
            this.chartId = null;
            this.slider = null;
            this.sliderId = null;
        }

        /*
         * @interface 创建图表对象
         * @param {Array} data 数据源
         * */
        createChart = (data = [])=> {
            const { width, height, forceFit }=this.props;
            $(this.refs["chartContainer"]).empty();
            $('#slider').remove();
            var chart = new G2.Chart({
                container: this.refs["chartContainer"],
                forceFit: forceFit,
                width: width,
                height: height
            }); // 创建图表
            /* chart.source(data, {
             at: {
             type: "time",
             range: [0, 1],
             alias: "时间",
             mask: "yyyy-mm-dd hh:mm:ss"
             },
             t: {
             type: "linear",
             range: [0, 1],
             alias: "温度, 单位:℃"
             }
             }); // 载入数据源*/
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
            var frame = new G2.Frame(data);
            chart.source(frame, {
                at: {
                    nice: true,
                    mask: 'yy/mm/dd hh:mm',
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
         /*   chart.axis('at', {
                labelOffset: 35,
                formatter: function (val) {
                    console.log(val)
                    return val;
                },
            });
            chart.axis('t', {
                formatter: function (val) {
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
            });*/

            var lineCfg = { // 线的配置信息
                stroke: '#94E08A'
            };

            chart.line().position('at*t').color('#B03A5B').size(2);
            chart.on('tooltipchange', function (ev) {
                var items = ev.items; // tooltip显示的项
                var origin = items[0]; // 将一条数据改成多条数据
                var at = origin.point._origin.at;
                var t = origin.point._origin.t;
                items.splice(0); // 清空
                items.push({
                    name: '时间',
                    title: at,
                    marker: true,
                    color: origin.color,
                    value: at
                });
                items.push({
                    name: '温度',
                    title: t,
                    marker: true,
                    color: origin.color,
                    value: t + '℃'
                });
            });
            chart.tooltip({
                title: false
            });
            chart.guide().text(['min', 'max'], '温度单位：℃');
            chart.guide().tag(['min', 2], ['max', 2], '最低温度控制线: ' + 2 + '℃', {line: lineCfg});
            chart.guide().tag(['min', 8], ['max', 8], '最高温度控制线: ' + 8 + '℃', {line: lineCfg});
            // chart.line().position('at*t'); // 使用图形语法绘制柱状图
            // chart.render();

            $(this.refs["chartContainer"]).parent().append('<div id="slider"></div>');
            var slider = new G2.Plugin.slider({
                domId: 'slider', //DOM id
                width: width,
                height: 26,
                xDim: 'at',
                yDim: 't',
                charts: [chart]
            });
            slider.render();

            this.chart = chart;
        }

        initChart = (props)=> {
            const { width, height, data, plotCfg, forceFit } = props;
            const chart = new G2.Chart({
                id: this.chartId,
                width, height,
                plotCfg,
                forceFit,
            });
            chart.source(data, {
                at: {
                    type: 'time',
                    tickCount: 8,
                    mask: 'm/dd hh:MM'
                },
                t:{
                    type: 'linear',
                    alias: '温度(℃)'
                }
            });
            $("<div id="+this.sliderId+"></div>").insertAfter(`#${this.chartId}`);
            var slider = new G2.Plugin.slider({
                domId: this.sliderId, //DOM id
                width: width || 650,
                height: 26,
                xDim: 'at',
                yDim: 't',
                charts: chart
            });
            _operation({chart, chartId: this.chartId, slider, sliderId: this.sliderId, ...props});
            this.chart = chart;
            this.slider = slider;
        };

        render() {
            return (
                <div id={this.chartId}></div>
            )
        }
    }

    TempChart.propTypes = {
        prefix: PropTypes.string,
        data: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        plotCfg: React.PropTypes.object,
        forceFit: React.PropTypes.bool
    };

    TempChart.defaultProps = {
        prefix: 'yzh'
    };

    return TempChart;
}