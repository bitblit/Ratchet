import { describe, expect, test } from 'vitest';
import { DrawingUtil, type RectangularMazeDrawOptions } from './drawing-util.js';
import { RectangularMaze } from './rectangular-maze.js';

describe('DrawingUtil', () => {
  const options: RectangularMazeDrawOptions = {
    backgroundColor: '#FFF',
    wallColor: '#000',
    disabledColor: '#333',
    cellSize: 10,
  };

  describe('formatBitmapToString', () => {
    test('separates cells with spaces and rows with newlines', () => {
      expect(
        DrawingUtil.formatBitmapToString([
          ['D', '3'],
          ['X', 'E'],
        ]),
      ).toBe('D 3\nX E');
    });

    test('supports a custom line ending', () => {
      expect(DrawingUtil.formatBitmapToString([['F'], ['X']], '\r\n')).toBe('F\r\nX');
    });

    test('formats an empty bitmap as an empty string', () => {
      expect(DrawingUtil.formatBitmapToString([])).toBe('');
    });
  });

  describe('rectangularMazeToBitmap', () => {
    test('encodes a cell with all four walls as F', () => {
      expect(DrawingUtil.rectangularMazeToBitmap(new RectangularMaze(1, 1))).toEqual([['F']]);
    });

    test('encodes directional walls in row order and marks disabled cells', () => {
      const maze = new RectangularMaze(2, 2);
      maze.addPassage(0, 1);
      maze.addPassage(1, 3);
      maze.disable(2);

      expect(DrawingUtil.rectangularMazeToBitmap(maze)).toEqual([
        ['D', '3'],
        ['X', 'E'],
      ]);
    });

    test('encodes a cell with no walls as 0', () => {
      const maze = new RectangularMaze(3, 3);
      [1, 3, 5, 7].forEach((neighbor) => maze.addPassage(4, neighbor));

      expect(DrawingUtil.rectangularMazeToBitmap(maze)[1][1]).toBe('0');
    });
  });

  describe('rectangularMazeToSvg', () => {
    test('scales wall coordinates and omits walls for a passage', () => {
      const maze = new RectangularMaze(2, 1);
      maze.addPassage(0, 1);

      const svg = DrawingUtil.rectangularMazeToSvg(maze, options);

      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('viewBox="0 0  20 10"');
      expect(Array.from(svg.matchAll(/points="([^"]+)"/g), (match) => match[1])).toEqual([
        '0,0 10 0',
        '0,10 10 10',
        '0,10 0 0',
        '10,0 20 0',
        '20,0 20 10',
        '10,10 20 10',
      ]);
      expect(svg.endsWith('</g></svg>')).toBe(true);
    });

    test('does not draw walls for disabled cells', () => {
      const maze = new RectangularMaze(1, 2);
      maze.disable(1);

      const svg = DrawingUtil.rectangularMazeToSvg(maze, options);

      expect(svg).toContain('viewBox="0 0  10 20"');
      expect(Array.from(svg.matchAll(/points="([^"]+)"/g), (match) => match[1])).toEqual([
        '0,0 10 0',
        '10,0 10 10',
        '0,10 10 10',
        '0,10 0 0',
      ]);
    });
  });

  test.each([
    null,
    undefined,
    new RectangularMaze(0, 1),
    new RectangularMaze(1, 0),
    new RectangularMaze(-1, 1),
    new RectangularMaze(1, -1),
  ])('rejects an invalid maze: %s', (maze) => {
    expect(() => DrawingUtil.rectangularMazeToBitmap(maze)).toThrow();
    expect(() => DrawingUtil.rectangularMazeToSvg(maze, options)).toThrow();
  });
});
