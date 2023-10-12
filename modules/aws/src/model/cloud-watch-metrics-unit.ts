// NOTE: This is a psuedo-enum to fix some issues with Typescript enums.  See: https://exploringjs.com/tackling-ts/ch_enum-alternatives.html for details

export const CloudWatchMetricsUnit = {
  Seconds: 'Seconds',
  Microseconds: 'Microseconds',
  Milliseconds: 'Milliseconds',
  Bytes: 'Bytes',
  Kilobytes: 'Kilobytes',
  Megabytes: 'Megabytes',
  Gigabytes: 'Gigabytes',
  Terabytes: 'Terabytes',
  Bits: 'Bits',
  Kilobits: 'Kilobits',
  Megabits: 'Megabits',
  Gigabits: 'Gigabits',
  Terabits: 'Terabits',
  Percent: 'Percent',
  Count: 'Count',
  BytesPerSecond: 'Bytes/Second',
  KilobytesPerSecond: 'Kilobytes/Second',
  MegabytesPerSecond: 'Megabytes/Second',
  GigabytesPerSecond: 'Gigabytes/Second',
  TerabytesPerSecond: 'Terabytes/Second',
  BitsPerSecond: 'Terabytes/Second',
  KilobitsPerSecond: 'Kilobits/Second',
  MegabitsPerSecond: 'Megabits/Second',
  GigabitsPerSecond: 'Gigabits/Second',
  TerabitsPerSecond: 'Terabits/Second',
  CountPerSecond: 'Count/Second',
  None: 'None',
};

export type CloudWatchMetricsUnit = (typeof CloudWatchMetricsUnit)[keyof typeof CloudWatchMetricsUnit];
