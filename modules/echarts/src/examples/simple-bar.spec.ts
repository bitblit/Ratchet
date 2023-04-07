import { EChartRatchet } from '../common/echart-ratchet.js';
import { EChartsOption } from 'echarts';

const options: EChartsOption = {
  title: {
    text: 'test',
  },
  tooltip: {},
  legend: {
    data: ['test'],
  },
  xAxis: {
    data: ['a', 'b', 'c', 'd', 'f', 'g'],
  },
  yAxis: {},
  series: [
    {
      name: 'test',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20],
    },
  ],
};

describe('#simpleBarChart', function () {
  it('should generate the chart', async () => {
    const data: Buffer = await EChartRatchet.renderChart(options, {
      width: 1000,
      height: 500,
    });

    // As of 2022-08-06 this is 7606... there must be a better test than this..
    expect(data.length).toBeGreaterThan(5_000);
    expect(data.length).toBeLessThan(10_000);
  });
});
