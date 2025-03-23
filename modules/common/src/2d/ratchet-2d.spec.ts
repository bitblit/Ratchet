import { Ratchet2d } from "./ratchet-2d.js";
import { Point2d } from "./point-2d.js";
import { Plane2d } from "./plane-2d.js";
import { describe, expect, test } from "vitest";
import { TransformationMatrix } from "./transformation-matrix.js";
import { MatrixFactory } from "./matrix-factory.js";
import { Plane2dType } from "./plane-2d-type.js";

describe('#ratchet2d', function () {
  test('should scale', () => {
    const pts: Point2d[] = [{x:0,y:0},{x:1, y:1}];
    const ptEven: Point2d[] = Ratchet2d.applyTransform(pts, MatrixFactory.scaleUniform(2));
    expect(ptEven.length).toEqual(2);
    expect(ptEven[0].x).toEqual(0);
    expect(ptEven[1].x).toEqual(2);
    expect(ptEven[1].y).toEqual(2);

    const ptX: Point2d[] = Ratchet2d.applyTransform(pts, MatrixFactory.scale(2,1));
    expect(ptX.length).toEqual(2);
    expect(ptX[0].x).toEqual(0);
    expect(ptX[1].x).toEqual(2);
    expect(ptX[1].y).toEqual(1);
  });

  test('should mirror', () => {
    const pts: Point2d[] = [{x:0,y:0},{x:1, y:1}];
    const ptY: Point2d[] = Ratchet2d.applyTransform(pts, MatrixFactory.mirrorAboutYAxis());
    expect(ptY.length).toEqual(2);
    expect(ptY[0].x).toEqual(0);
    expect(ptY[1].x).toEqual(-1);
    expect(ptY[1].y).toEqual(1);

    const ptX: Point2d[] = Ratchet2d.applyTransform(pts, MatrixFactory.mirrorAboutXAxis());
    expect(ptX.length).toEqual(2);
    expect(ptX[0].x).toEqual(0);
    expect(ptX[1].x).toEqual(1);
    expect(ptX[1].y).toEqual(-1);
  });

  test('should combine', () => {
    const pts: Point2d[] = [{x:0,y:0},{x:1, y:1}];
    const tx: TransformationMatrix = MatrixFactory.multiply([MatrixFactory.scaleUniform(2), MatrixFactory.mirrorAboutYAxis()]);
    const ptC: Point2d[] = Ratchet2d.applyTransform(pts, tx);
    expect(ptC.length).toEqual(2);
    expect(ptC[0].x).toEqual(0);
    expect(ptC[1].x).toEqual(-2);
    expect(ptC[1].y).toEqual(2);
  });

  test('should check for valid planes', () => {
    expect(Ratchet2d.validPlane(null)).toEqual(false);
    expect(Ratchet2d.validPlane({ width: null, height: null, type: Plane2dType.BottomLeft })).toEqual(false);
    expect(Ratchet2d.validPlane({ width: 0, height: null, type: Plane2dType.BottomLeft })).toEqual(false);
    expect(Ratchet2d.validPlane({ width: 0, height: 2, type: Plane2dType.BottomLeft })).toEqual(false);
    expect(Ratchet2d.validPlane({ width: 1, height: 7, type: Plane2dType.BottomLeft })).toEqual(true);
  });

  test('should check for valid lines', () => {
    expect(Ratchet2d.validLine(null)).toEqual(false);
    expect(Ratchet2d.validLine({ p1: null, p2: null })).toEqual(false);
    expect(Ratchet2d.validLine({ p1: { x: null, y: 0 }, p2: null })).toEqual(false);
    expect(Ratchet2d.validLine({ p1: { x: 0, y: 0 }, p2: { x: 27, y: null } })).toEqual(false);
    expect(Ratchet2d.validLine({ p1: { x: 0, y: 0 }, p2: { x: 27, y: 0 } })).toEqual(true);
    expect(Ratchet2d.validLine({ p1: { x: 1, y: 0 }, p2: { x: 1, y: 0 } })).toEqual(false); // same point
    expect(Ratchet2d.validLine({ p1: { x: 0, y: 0 }, p2: { x: 27, y: 13 } })).toEqual(true);
  });

  test('should transform points from one plane to another (scale)', () => {
    const plane1: Plane2d = { height: 10, width: 10, type: Plane2dType.BottomLeft };
    const plane2: Plane2d = { height: 100, width: 50, type: Plane2dType.BottomLeft };

    const p1: Point2d = { x: 5, y: 5 };
    const out1: Point2d = Ratchet2d.transformPointToNewPlane(p1, plane1, plane2);
    const out2: Point2d = Ratchet2d.transformPointToNewPlane(out1, plane2, plane1);

    expect(out1.x).toEqual(25);
    expect(out1.y).toEqual(50);

    expect(out2.x).toEqual(p1.x);
    expect(out2.y).toEqual(p1.y);
  });

  test('should transform points from one plane to another (mirror)', () => {
    const plane1: Plane2d = { height: 10, width: 10, type: Plane2dType.BottomLeft };
    const plane2: Plane2d = { height: 10, width: 10, type: Plane2dType.TopRight };

    const p1: Point2d = { x: 2, y: 8 };
    const out1: Point2d = Ratchet2d.transformPointToNewPlane(p1, plane1, plane2);
    const out2: Point2d = Ratchet2d.transformPointToNewPlane(out1, plane2, plane1);

    expect(out1.x).toEqual(7);
    expect(out1.y).toEqual(1);

    expect(out2.x).toEqual(p1.x);
    expect(out2.y).toEqual(p1.y);
  });

  test('should check for containment', () => {
    const plane: Plane2d = {
      width: 100,
      height: 100,
      type: Plane2dType.BottomLeft
    };

    expect(Ratchet2d.planeContainsPoint({ x: -1, y: 10 }, plane)).toEqual(false);
    expect(Ratchet2d.planeContainsPoint({ x: 101, y: 10 }, plane)).toEqual(false);
    expect(Ratchet2d.planeContainsPoint({ x: 1, y: -10 }, plane)).toEqual(false);
    expect(Ratchet2d.planeContainsPoint({ x: 10, y: 101 }, plane)).toEqual(false);
    expect(Ratchet2d.planeContainsPoint({ x: 10, y: 100 }, plane)).toEqual(false); // Boundary condition
    expect(Ratchet2d.planeContainsPoint({ x: 1, y: 10 }, plane)).toEqual(true);
    expect(Ratchet2d.planeContainsPoint({ x: 10, y: 10 }, plane)).toEqual(true);

    expect(
      Ratchet2d.planeContainsPoints(
        [
          { x: 10, y: 10 },
          { x: 100, y: 10 },
        ],
        plane,
      ),
    ).toEqual(false);
    expect(
      Ratchet2d.planeContainsPoints(
        [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
        ],
        plane,
      ),
    ).toEqual(true);

    expect(
      Ratchet2d.planeContainsLine(
        {
          p1: { x: 10, y: 10 },
          p2: { x: 100, y: 10 },
        },
        plane,
      ),
    ).toEqual(false);
    expect(
      Ratchet2d.planeContainsLine(
        {
          p1: { x: 10, y: 10 },
          p2: { x: 11, y: 10 },
        },
        plane,
      ),
    ).toEqual(true);
  });

  test('should fit input to curve', function () {
    const curve: Point2d[] = [
      { x: 0, y: 50 },
      { x: 0.5, y: 50 },
      { x: 0.8, y: 60 },
      { x: 1, y: 70 },
      { x: 1.2, y: 80 },
      { x: 1.5, y: 90 },
      { x: 1.6, y: 91 },
      { x: 1.7, y: 92 },
      { x: 1.8, y: 93 },
      { x: 1.9, y: 94 },
      { x: 2, y: 95 },
      {
        x: 3,
        y: 98,
      },
      { x: 4, y: 99 },
      { x: 5, y: 100 },
    ];

    expect(Ratchet2d.fitCurve(curve, -1)).toEqual(50);
    expect(Ratchet2d.fitCurve(curve, 0)).toEqual(50);
    expect(Ratchet2d.fitCurve(curve, 0.3)).toEqual(50);
    expect(Ratchet2d.fitCurve(curve, 0.5)).toEqual(50);
    expect(Ratchet2d.fitCurve(curve, 0.8)).toEqual(60);
    expect(Ratchet2d.fitCurve(curve, 1)).toEqual(70);
    expect(Ratchet2d.fitCurve(curve, 5)).toEqual(100);
    expect(Ratchet2d.fitCurve(curve, 6)).toEqual(100);
    expect(Ratchet2d.fitCurve(curve, 1.65)).toEqual(91.5);
  });

  test('rotate about origin', function () {
    const points: Point2d[] = [
      { x: 1, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 3 },
      { x: 4, y: 1 },
      { x: 6, y: 1 },
    ];
    //const plane: Plane2d = { height: 4, width: 8 };

    const r1: Point2d[] = Ratchet2d.rotateRightAboutCartesianOrigin90Degrees(points); //, plane);
    expect(r1.length).toEqual(6);

    // Full rotation should be the same
    const _r3: Point2d[] = Ratchet2d.rotateRightAboutCartesianOrigin90Degrees(points, 3);
    const r2: Point2d[] = Ratchet2d.rotateRightAboutCartesianOrigin90Degrees(points, 4);
    expect(r2.length).toEqual(6);
    expect(r2[0].x).toEqual(points[0].x);
    expect(r2[0].y).toEqual(points[0].y);
  });
});
