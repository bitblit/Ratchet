import { EChartsOption } from 'echarts';
import { EChartRatchet } from '../common/echart-ratchet.js';

const options: EChartsOption = {
  backgroundColor: '#2c343c',
  title: {
    text: 'Customized Pie',
    left: 'center',
    top: 20,
    textStyle: {
      color: '#ccc',
    },
  },
  tooltip: {
    trigger: 'item',
  },
  visualMap: {
    show: false,
    min: 80,
    max: 600,
    inRange: {
      colorLightness: [0, 1],
    },
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: '55%',
      center: ['50%', '50%'],
      data: [
        { value: 335, name: 'Direct' },
        { value: 310, name: 'Email' },
        { value: 274, name: 'Union Ads' },
        { value: 235, name: 'Video Ads' },
        { value: 400, name: 'Search Engine' },
      ].sort(function (a, b) {
        return a.value - b.value;
      }),
      roseType: 'radius',
      label: {
        color: 'rgba(255, 255, 255, 0.3)',
      },
      labelLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
        },
        smooth: 0.2,
        length: 10,
        length2: 20,
      },
      itemStyle: {
        color: '#c23531',
        shadowBlur: 200,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: function (idx) {
        return Math.random() * 200;
      },
    },
  ],
};

describe('#pieChart', function () {
  it('should generate the chart', async () => {
    const data: Buffer = await EChartRatchet.renderChartToPngFile('test.png', options, {
      width: 1000,
      height: 500,
    });

    // As of 2022-08-06 this is 32175... there must be a better test than this..
    expect(data.length).toBeGreaterThan(30_000);
    expect(data.length).toBeLessThan(40_000);
  });
});
