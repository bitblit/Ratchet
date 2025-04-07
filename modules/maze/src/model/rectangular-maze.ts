import { Coordinate } from "./coordinate.js";
import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { Direction } from "./direction.js";

// 0,1,2,3...width-1
// width,

export class RectangularMaze {

  private disabledIdx: Set<number> = new Set<number>();
  private passages: Map<number, Set<number>> = new Map<number, Set<number>>();

  constructor(private _width: number, private _height: number) {
  }

  public isDisabled(idx: number | Coordinate): boolean {
    if (typeof idx === 'number') {
      return this.disabledIdx.has(idx);
    } else {
      return this.disabledIdx.has(this.coordinateToIndex(idx));
    }
  }

  public neighborCoordinate(idx:number | Coordinate, direction: Direction): Coordinate {
    let rval: Coordinate = structuredClone((typeof idx==='number') ? this.indexToCoordinate(idx) : idx);

    switch (direction) {
      case Direction.North : rval.y--;break;
      case Direction.South : rval.y++;break;
      case Direction.East : rval.x++;break;
      case Direction.West : rval.x--;break;
      default: throw new Error('Cannot happen - invalid direction');
    }

    if (rval.x<0 || rval.y<0 || rval.x >=this.width || rval.y>=this.height) {
      rval = null;
    }

    return rval;
  }


  public neighborIdx(idx:number, direction: Direction): number {
    const n = this.neighborCoordinate(idx, direction);
    return n===null ? null : this.coordinateToIndex(n);
  }

  public hasWall(idx: number | Coordinate, direction: Direction): boolean {
    const idx1: number = (typeof(idx)==='number') ? idx : this.coordinateToIndex(idx);
    const idx2: number = this.neighborIdx(idx1, direction);
    return !this.hasPassage(idx1, idx2);
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public coordinateToIndex(coord: Coordinate): number {
    RequireRatchet.true(coord.x < this.width);
    RequireRatchet.true(coord.y < this.height);
    return (coord.y * this.width) + coord.x;
  }

  public indexToCoordinate(idx: number): Coordinate {
    const row: number = Math.floor(idx/this.width);
    const rval: Coordinate = {
      x: idx - (row*this.width),
      y: row
    };
    return rval;
  }

  public get maxIdx(): number {
    return this.coordinateToIndex({x: this.width-1, y: this.height-1});
  }

  public validIdx(idx: number): boolean {
    const crd: Coordinate = this.indexToCoordinate(idx);
    return crd.x < this.width && crd.y < this.height;
  }

  public get allIdxWithPassages(): Set<number> {
    const rval: Set<number> = new Set<number>();
    Array.from(this.passages.values()).forEach(vals=>{
      Array.from(vals).forEach(s=>rval.add(s));
    })
    return rval;
  }

  public disable(idx: number): void {
    RequireRatchet.true(this.validIdx(idx));
    RequireRatchet.true(!this.passages.has(idx));
    RequireRatchet.true(!this.allIdxWithPassages.has(idx));
    this.disabledIdx.add(idx);
  }

  public hasPassage(idx1: number, idx2: number): boolean {
    let rval: boolean = false;
    if (idx1!==null && idx2!==null) {
      const vals: Set<number> = this.passages.get(Math.min(idx1, idx2));
      rval = vals && vals.has(Math.max(idx1, idx2));
    }
    return rval;
  }


  public addPassage(idxC1: number | Coordinate, idxC2: number | Coordinate) : void {
    RequireRatchet.notNullOrUndefined(idxC1);
    RequireRatchet.notNullOrUndefined(idxC2);
    const idx1: number = (typeof idxC1 ==='number') ? idxC1 : this.coordinateToIndex(idxC1);
    const idx2: number = (typeof idxC2 ==='number') ? idxC2 : this.coordinateToIndex(idxC2);

    RequireRatchet.true(this.validIdx(idx1));
    RequireRatchet.true(this.validIdx(idx2));
    RequireRatchet.true(!this.disabledIdx.has(idx1));
    RequireRatchet.true(!this.disabledIdx.has(idx2));

    const cur: Set<number> = this.passages.get(Math.min(idx1, idx2)) ?? new Set<number>;
    cur.add(Math.max(idx1,idx2));
    this.passages.set(Math.min(idx1,idx2), cur);
  }

  public removePassage(idx1: number, idx2: number) : void {
    RequireRatchet.true(this.validIdx(idx1));
    RequireRatchet.true(this.validIdx(idx2));

    const cur: Set<number> = this.passages.get(Math.min(idx1, idx2)) ?? new Set<number>;
    cur.delete(Math.max(idx1, idx2));
  }

}