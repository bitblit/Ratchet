/*
From https://graphicmaths.com/pure/matrices/matrix-2d-transformations/

Matrix is the form:

 a b u
 c d v
 0 0 1

 */

export interface TransformationMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  u?: number;
  v?: number;
}