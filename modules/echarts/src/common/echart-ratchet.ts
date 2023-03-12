import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';
import { Canvas } from 'canvas';
import { EChartCanvasConfig } from './echart-canvas-config';
import fs from 'fs';

export class EChartRatchet {
  public static async renderChartUsingProvidedCanvas(opt: EChartsOption, canvas: Canvas): Promise<Buffer> {
    if (!opt) {
      throw new Error('You must supply an opts parameter');
    }
    if (!canvas) {
      throw new Error('You must supply an canvas parameter');
    }
    let rval: Buffer = null;

    opt.animation = false; // Always do not animate given its is a static image
    const canvasHtml: HTMLElement = canvas as unknown as HTMLElement;
    // This is deprecated, and unneeded so far as I can tell
    //echarts.setCanvasCreator(()=>{return canvasHtml;});
    const chart: ECharts = echarts.init(canvasHtml);
    chart.setOption(opt);
    rval = canvas.toBuffer();
    return rval;
  }

  public static async renderChart(opts: EChartsOption, config: EChartCanvasConfig): Promise<Buffer> {
    if (!opts) {
      throw new Error('You must supply an opts parameter');
    }
    if (!config) {
      throw new Error('You must supply an config parameter');
    }
    const canvas: Canvas = new Canvas(config.width, config.height);
    const rval: Buffer = await this.renderChartUsingProvidedCanvas(opts, canvas);

    return rval;
  }

  public static async renderChartToPngFile(filename: string, opts: EChartsOption, config: EChartCanvasConfig): Promise<Buffer> {
    if (!opts) {
      throw new Error('You must supply an opts parameter');
    }
    if (!config) {
      throw new Error('You must supply an config parameter');
    }
    if (!filename || filename.trim().length === 0) {
      throw new Error('You must supply a non-empty filename parameter');
    }
    if (!filename.toLowerCase().endsWith('.png')) {
      throw new Error('Your filename should end with .png - this generates a png file');
    }
    const rval: Buffer = await this.renderChart(opts, config);
    fs.writeFileSync(filename, rval);

    return rval;
  }
}
