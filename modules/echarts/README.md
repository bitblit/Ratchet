# node-echarts
Generate chart by [Apache ECharts](https://github.com/apache/incubator-echarts) in Nodejs.

This library is forked from [node-echarts](https://github.com/hellosean1025/node-echarts) to which it is highly
indebted.  I have forked it because that library appears to now be dormant, and I'd like to be able to use newer
versions of echarts, and the new prebuilt versions of canvas in my Lambda functions.  I also prefer typescript
and will be bringing in type information.

## Install

Note: Since this library depends on Echarts >= 5.x and node-canvas (canvas) >= 2.9.3, it auto-bundles in the 
correct native libraries (prebuilt) for Windows, OSX, and Linux - see [the canvas github page](https://github.com/Automattic/node-canvas) 
for details.  Therefore, all you have to do is:

```
npm install @bitblit/ratchet-echarts
```

### Special notes for AWS Lambda

Most important - you MUST set your lambda to have sufficient memory - probably 512Mb or more.  If you find yourself
getting timeouts with no errors logged after adding the library, you most likely have insufficient memory set.


If you are using AWS Lambda (either Node 14/16, or containers built from the AWS parent container for them), you will
likely encounter the error "/lib64/libz.so.1: version `ZLIB_1.2.9' not found (required by /var/task/node_modules/canvas/build/Release/libpng16.so.16)"

See [the node-canvas issue for more details](https://github.com/Automattic/node-canvas/issues/1779).  The solution
varies depending on how you use Lambda.  

### Using a custom docker container (1st way)
To make sure it is compatible with whatever the current build of the image is, we will build from scratch.  In our
docker container, we'll add :

```docker
# To build things in yarn
RUN yum -y install python3
RUN yum -y install pkgconfig make

# Specifically for building canvas
RUN yum -y install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
```

And then, in the container we'll force a clean build, either by using
```docker
RUN npm install --build-from-source
```

or

```docker
RUN npm_config_build_from_source=true yarn install
```

### Using a custom docker container (alternate way)
Add this to your container:
```docker
# Bring these in to make echarts work...
# Also requires setting the LD_LIBRARY_PATH variable in the config
# https://github.com/Automattic/node-canvas/issues/1779
RUN yum -y install libuuid-devel libmount-devel
RUN cp /lib64/{libuuid,libmount,libblkid}.so.1 ${LAMBDA_TASK_ROOT}/node_modules/canvas/build/Release/
# End charts stuff
```

And then set an environment variable:
```
LD_LIBRARY_PATH="${LAMBDA_TASK_ROOT}/modules/api/node_modules/canvas/build/Release:${LD_LIBRARY_PATH}"
```

### Using one of the AWS Node options
Use a [prebuilt layer](https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:990551184979:applications~lambda-layer-canvas-nodejs)

## Usage

```typescript

import { EChartRatchet } from '../echart-ratchet';
import { EChartsOption } from 'echarts';
import fs from 'fs';

const options: EChartsOption = {
    // Some big echarts thing... see Echarts docs for how to build this
    //title: {
    //    text: 'test',
    //},
    //...
};

const canvasConfig: EChartCanvasConfig  = {
    width: 1000
    height: 500
}

const myChart: Buffer = await EChartRatchet.renderChart(options, canvasConfig);
fs.writeFileSync('somefile.png', myChart);

// Also could have just written
// await EChartRatchet.renderChartToPngFile('somefile.png', options, canvasConfig);

```

### EChartCanvasConfig

|name|type|default|description|
|---|---|---|---|
|width|Number|500|Image width|
|height|Number|500|Image height|
