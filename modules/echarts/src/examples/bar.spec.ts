import { EChartsOption } from 'echarts';
import { EChartRatchet } from '../common/echart-ratchet.js';
import { LabelOption } from 'echarts/types/src/util/types.js';
import { describe, expect, test } from 'vitest';

const labelRight: LabelOption = {
  position: 'right',
};

const options: EChartsOption = {
  title: {
    text: 'Bar Chart with Negative Value',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    top: 80,
    bottom: 30,
  },
  xAxis: {
    type: 'value',
    position: 'top',
    splitLine: {
      lineStyle: {
        type: 'dashed',
      },
    },
  },
  yAxis: {
    type: 'category',
    axisLine: { show: false },
    axisLabel: { show: false },
    axisTick: { show: false },
    splitLine: { show: false },
    data: ['ten', 'nine', 'eight', 'seven', 'six', 'five', 'four', 'three', 'two', 'one'],
  },
  series: [
    {
      name: 'Cost',
      type: 'bar',
      stack: 'Total',
      label: {
        show: true,
        formatter: '{b}',
      },
      data: [
        { value: -0.07, label: labelRight },
        { value: -0.09, label: labelRight },
        0.2,
        0.44,
        { value: -0.23, label: labelRight },
        0.08,
        { value: -0.17, label: labelRight },
        0.47,
        { value: -0.36, label: labelRight },
        0.18,
      ],
    },
  ],
};

describe('#simpleBarChart', function () {
  test('should generate the chart', async () => {
    const data: Buffer = await EChartRatchet.renderChartToPngFile('test.png', options, {
      width: 1000,
      height: 500,
    });

    // As of 2022-08-06 this is 15569... there must be a better test than this..
    expect(data.length).toBeGreaterThan(15_000);
    expect(data.length).toBeLessThan(20_000);
  });
});
