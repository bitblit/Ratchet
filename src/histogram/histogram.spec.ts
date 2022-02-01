import {Histogram} from './histogram';

describe('#histogram', function () {
  it('should count the values correctly', function () {
    const histogram: Histogram<string> = new Histogram<string>();

    histogram.update('a');
    histogram.update('a');
    histogram.update('b');
    histogram.update('c');

    expect(histogram.getTotalCount()).toEqual(4);

    expect(histogram.countForValue('a')).toEqual(2);
    expect(histogram.countForValue('b')).toEqual(1);
    expect(histogram.countForValue('c')).toEqual(1);
    expect(histogram.countForValue('d')).toEqual(0);

    expect(histogram.percentForValue('a')).toEqual(0.5);
    expect(histogram.percentForValue('b')).toEqual(0.25);
    expect(histogram.percentForValue('c')).toEqual(0.25);
    expect(histogram.percentForValue('d')).toEqual(0);
  });
});
