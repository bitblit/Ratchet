import { RectangularMaze } from "./rectangular-maze.js";
import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";

import fs from "fs";
import { Direction } from "./direction.js";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";

// 0,1,2,3...width-1
// width,

export class DrawingUtil {

  public static formatBitmapToString(bmap: string[][], lineEnd: string = '\n'): string {
    const rval: string = bmap.map(s=>s.join(' ')).join(lineEnd);
    return rval;
  }

  public static rectangularMazeToBitmap(maze: RectangularMaze): string[][] {
    RequireRatchet.notNullOrUndefined(maze);
    RequireRatchet.true(maze.width>0);
    RequireRatchet.true(maze.height>0);

    const rval: string[][]=[];

    for (let y=0;y<maze.height;y++) {
      const curRow: string[] = [];
      for (let x=0;x<maze.width;x++) {
        if (maze.isDisabled({x:x, y:y})) {
          curRow.push('X');
        } else {
          let num: number = 0;
          num += maze.hasWall({x,y}, Direction.North) ? 1 : 0;
          num += maze.hasWall({x,y}, Direction.East) ? 2 : 0;
          num += maze.hasWall({x,y}, Direction.South) ? 4 : 0;
          num += maze.hasWall({x,y}, Direction.West) ? 8 : 0;
          curRow.push(StringRatchet.HEXITS[num]);
        }
      }
      rval.push(curRow);
    }

    return rval;
  }


  public static rectangularMazeToSvg(maze: RectangularMaze, opts?: RectangularMazeDrawOptions): string {
    RequireRatchet.notNullOrUndefined(maze);
    RequireRatchet.true(maze.width>0);
    RequireRatchet.true(maze.height>0);

    const widthPx: number = maze.width * opts.cellSize;
    const heightPx: number = maze.height * opts.cellSize;

    let rval: string =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0  ${widthPx} ${heightPx}"><g> \n`
     // `<text x="10" y="10" font-family="Style_Script, cursive" font-size="2">Test</text>`;

    for (let y=0;y<maze.height;y++) {
      for (let x=0;x<maze.width;x++) {
        // Upper left corner
        const uX: number = x * opts.cellSize;
        const uY: number = y * opts.cellSize;
        if (maze.isDisabled({x:x, y:y})) {

          //curRow.push('X');
        } else {
          if (maze.hasWall({x,y}, Direction.North)) {
            rval+=`<polyline stroke="#000080" stroke-width="1" fill="none" points="${uX},${uY} ${uX+opts.cellSize} ${uY}" />\n`;
          }
          if (maze.hasWall({x,y}, Direction.East)) {
            rval+=`<polyline stroke="#000080" stroke-width="1" fill="none" points="${uX+opts.cellSize},${uY} ${uX+opts.cellSize} ${uY+opts.cellSize}" />\n`;
          }
          if (maze.hasWall({x,y}, Direction.South)) {
            rval+=`<polyline stroke="#000080" stroke-width="1" fill="none" points="${uX},${uY+opts.cellSize} ${uX+opts.cellSize} ${uY+opts.cellSize}" />\n`;
          }
          if (maze.hasWall({x,y}, Direction.West)) {
            rval+=`<polyline stroke="#000080" stroke-width="1" fill="none" points="${uX},${uY+opts.cellSize} ${uX} ${uY}" />\n`;
          }
        }
      }
    }

    rval+='</g></svg>';

    return rval;
  }

}

export interface RectangularMazeDrawOptions {
  backgroundColor: string;
  wallColor: string;
  disabledColor: string;
  cellSize: number;
}

// DELETE ME
const x: RectangularMaze = new RectangularMaze(2,2);
x.addPassage(0,1);
x.addPassage(1,3);
const bmap: string[][]=DrawingUtil.rectangularMazeToBitmap(x);
console.log(DrawingUtil.formatBitmapToString(bmap));
//const x: RectangularMaze = new RectangularMaze(10,10);
const out: string = DrawingUtil.rectangularMazeToSvg(x, {backgroundColor: '#FFF', wallColor: '#000', disabledColor: '#333', cellSize: 10});
fs.writeFileSync('test.svg', out);