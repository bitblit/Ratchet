import { Point2d } from './point-2d.js';
import { Plane2d } from './plane-2d.js';
import { Line2d } from './line-2d.js';
import { PolyLine2d } from './poly-line-2d.js';
import { BooleanRatchet } from '../lang/boolean-ratchet.js';

export class Ratchet2d {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static translateToOriginVector(points: Point2d[]): Point2d {
    let rval: Point2d = null;
    if (Ratchet2d.validPoints(points)) {
      rval = {
        x: null,
        y: null,
      };
      points.forEach((p) => {
        rval.x = rval.x === null || p.x < rval.x ? p.x : rval.x;
        rval.y = rval.y === null || p.y < rval.y ? p.y : rval.y;
      });

      rval.x *= -1;
      rval.y *= -1;
    }
    return rval;
  }

  public static minimalContainingPlane(points: Point2d[]): Plane2d {
    let rval: Plane2d = null;
    if (Ratchet2d.validPoints(points)) {
      rval = {
        width: 0,
        height: 0,
      };
      points.forEach((p) => {
        rval.width = Math.max(rval.width, p.x + 1);
        rval.height = Math.max(rval.height, p.y + 1);
      });
    }
    return rval;
  }

  public static scaleVector(src: Plane2d, dst: Plane2d): Point2d {
    let rval: Point2d = null;
    if (Ratchet2d.validPlane(src) && Ratchet2d.validPlane(dst)) {
      rval = {
        x: dst.width / src.width,
        y: dst.height / src.height,
      };
    }
    return rval;
  }

  public static samePoint(p1: Point2d, p2: Point2d): boolean {
    return !!p1 && !!p2 && p1.x === p2.x && p1.y === p2.y;
  }

  public static atLeastOneDimensionShared(p1: Point2d, p2: Point2d): boolean {
    return !!p1 && !!p2 && (p1.x === p2.x || p1.y === p2.y);
  }

  public static validPlane(plane: Plane2d): boolean {
    return !!plane && !!plane.height && !!plane.width; // Can use this since 0 isn't an accepted value;
  }

  public static validLine(line: Line2d): boolean {
    return !!line && Ratchet2d.validPoint(line.p1) && Ratchet2d.validPoint(line.p2) && !Ratchet2d.samePoint(line.p1, line.p2);
  }

  public static validLines(lines: Line2d[]): boolean {
    return !!lines && BooleanRatchet.allTrue(lines.map((l) => Ratchet2d.validLine(l)));
  }

  public static validPolyLine(pline: PolyLine2d): boolean {
    return !!pline && pline.pts?.length > 1 && BooleanRatchet.allTrue(pline.pts.map((p) => Ratchet2d.validPoint(p)));
  }

  public static polyLineToLines(pline: PolyLine2d): Line2d[] {
    let rval: Line2d[] = null;
    if (Ratchet2d.validPolyLine(pline)) {
      rval = [];
      for (let i = 1; i < pline.pts.length; i++) {
        rval.push({ p1: pline.pts[i - 1], p2: pline.pts[i] });
      }
    }
    return rval;
  }

  public static lastPointOnPolyLine(polyLine: PolyLine2d): Point2d {
    return Ratchet2d.validPolyLine(polyLine) ? polyLine.pts[polyLine.pts.length - 1] : null;
  }

  public static lineToPolyLine(line: Line2d): PolyLine2d {
    return Ratchet2d.validLine(line) ? { pts: [line.p1, line.p2] } : null;
  }

  // Multiple lines are collapsed into a polyline if the end of line N is the start of line N+1
  public static linesToPolyLines(lines: Line2d[]): PolyLine2d[] {
    let rval: PolyLine2d[] = null;
    if (Ratchet2d.validLines(lines)) {
      rval = [];
      let currentPLine: PolyLine2d = Ratchet2d.lineToPolyLine(lines[0]);
      for (let i = 1; i < lines.length; i++) {
        if (Ratchet2d.samePoint(Ratchet2d.lastPointOnPolyLine(currentPLine), lines[i].p1)) {
          currentPLine.pts.push(lines[i].p2);
        } else {
          rval.push(currentPLine);
          currentPLine = Ratchet2d.lineToPolyLine(lines[i]);
        }
      }
      rval.push(currentPLine);
    }
    return rval;
  }

  public static validPoint(pt: Point2d): boolean {
    return !!pt && pt.x != null && pt.x != undefined && pt.y !== null && pt.y !== undefined;
  }

  public static validPoints(pt: Point2d[]): boolean {
    return (
      !!pt &&
      BooleanRatchet.allTrue(
        pt.map((p) => Ratchet2d.validPoint(p)),
        false,
      )
    );
  }

  public static planeContainsPoint(pt: Point2d, plane: Plane2d): boolean {
    return Ratchet2d.validPlane(plane) && Ratchet2d.validPoint(pt) && pt.x >= 0 && pt.x < plane.width && pt.y >= 0 && pt.y < plane.height;
  }

  public static planeContainsPoints(pt: Point2d[], plane: Plane2d): boolean {
    return pt && pt.map((p) => Ratchet2d.planeContainsPoint(p, plane)).reduce((a, i) => a && i, true);
  }

  public static linesToPoints(lines: Line2d[]): Point2d[] {
    let rval: Point2d[] = null;
    if (Ratchet2d.validLines(lines)) {
      rval = lines.map((l) => [l.p1, l.p2]).flat();
    }
    return rval;
  }

  public static pointsToLines(points: Point2d[]): Line2d[] {
    let rval: Line2d[] = null;
    if (Ratchet2d.validPoints(points)) {
      if (points.length % 2 == 0) {
        rval = [];
        for (let i = 0; i < points.length; i += 2) {
          rval.push({ p1: points[i], p2: points[i + 1] });
        }
      } else {
        throw new Error('Cannot convert non-even array of points into lines');
      }
    }
    return rval;
  }

  public static rotateRightAboutOrigin90Degrees(points: Point2d[], times: number = 1): Point2d[] {
    let rval: Point2d[] = null;
    let translate: Point2d = { x: 0, y: 0 };
    if (Ratchet2d.validPoints(points)) {
      rval = Object.assign([], points);
      translate = Ratchet2d.translateToOriginVector(rval);
      rval = Ratchet2d.translate(rval, translate); // Move it to the origin first
      let plane: Plane2d = Ratchet2d.minimalContainingPlane(rval);

      rval = Ratchet2d.xToY(rval);
      plane = { width: plane.height, height: plane.width };
      translate = { x: translate.y * -1, y: translate.x * -1 };
      rval = Ratchet2d.mirrorPointsOnPlane(rval, plane, true, false);
      // Move it back
      rval = Ratchet2d.translate(rval, translate);
    }
    const timesToRotate: number = times > 4 ? times % 4 : times; // Allow 4 since its used for testing, but not more than that
    if (timesToRotate > 1) {
      rval = Ratchet2d.rotateRightAboutOrigin90Degrees(rval, timesToRotate - 1);
    }

    return rval;
  }

  public static planeContainsLines(lines: Line2d[], plane: Plane2d): boolean {
    return lines && Ratchet2d.planeContainsPoints(lines.map((l) => [l.p1, l.p2]).flat(), plane);
  }

  public static planeContainsPolyLine(pline: PolyLine2d, plane: Plane2d): boolean {
    return Ratchet2d.planeContainsLines(Ratchet2d.polyLineToLines(pline), plane);
  }

  public static planeContainsLine(line: Line2d, plane: Plane2d): boolean {
    return (
      Ratchet2d.validPlane(plane) &&
      Ratchet2d.validLine(line) &&
      Ratchet2d.planeContainsPoint(line.p1, plane) &&
      Ratchet2d.planeContainsPoint(line.p2, plane)
    );
  }

  public static xToY(points: Point2d[]): Point2d[] {
    let rval: Point2d[] = null;
    if (Ratchet2d.validPoints(points)) {
      rval = points.map((p) => {
        const next: Point2d = { x: p.y, y: p.x };
        return next;
      });
    }
    return rval;
  }

  public static translate(points: Point2d[], xlate: Point2d): Point2d[] {
    let rval: Point2d[] = null;
    if (Ratchet2d.validPoints(points) && Ratchet2d.validPoint(xlate)) {
      rval = points.map((p) => {
        const next: Point2d = {
          x: p.x + xlate.x,
          y: p.y + xlate.y,
        };
        return next;
      });
    }
    return rval;
  }

  public static mirrorPointsOnPlane(points: Point2d[], src: Plane2d, mirrorX: boolean, mirrorY: boolean): Point2d[] {
    let rval: Point2d[] = null;
    if (Ratchet2d.validPoints(points) && Ratchet2d.validPlane(src)) {
      if (mirrorX || mirrorY) {
        rval = points.map((p) => {
          const next: Point2d = {
            x: mirrorX ? src.width - 1 - p.x : p.x,
            y: mirrorY ? src.height - 1 - p.y : p.y,
          };
          return next;
        });
      } else {
        // If not mirroring in either direction, then just copy
        rval = Object.assign([], points);
      }
    }
    return rval;
  }

  public static transformPointsToNewPlane(points: Point2d[], src: Plane2d, dst: Plane2d): Point2d[] {
    let rval: Point2d[] = null;
    if (Ratchet2d.validPoints(points) && Ratchet2d.validPlane(src) && Ratchet2d.validPlane(dst)) {
      const scale: Point2d = Ratchet2d.scaleVector(src, dst);
      rval = points.map((p) => {
        const next: Point2d = { x: p.x * scale.x, y: p.y * scale.y };
        return next;
      });
      rval = Ratchet2d.mirrorPointsOnPlane(rval, dst, dst.rightToLeft !== src.rightToLeft, dst.topToBottom !== src.topToBottom);
    }
    return rval;
  }

  public static transformPointToNewPlane(point: Point2d, src: Plane2d, dst: Plane2d): Point2d {
    const tmp: Point2d[] = Ratchet2d.transformPointsToNewPlane([point], src, dst);
    return tmp.length === 1 ? tmp[0] : null;
  }

  public static transformLines(lines: Line2d[], src: Plane2d, dst: Plane2d): Line2d[] {
    return null;
  }

  // Given a set of points defining a curve, and a particular X, find the "best" Y
  // for the curve defined by the points
  public static fitCurve(curveDef: Point2d[], inputX: number): number {
    curveDef.sort((a, b) => {
      return a.x - b.x;
    });

    if (inputX <= curveDef[0].x) {
      return curveDef[0].y;
    } else if (inputX >= curveDef[curveDef.length - 1].x) {
      return curveDef[curveDef.length - 1].y;
    } else {
      let idx = 0;
      while (curveDef[idx + 1].x < inputX) {
        idx++;
      }
      const xSpread: number = curveDef[idx + 1].x - curveDef[idx].x;
      const ySpread: number = curveDef[idx + 1].y - curveDef[idx].y;
      const pct: number = (inputX - curveDef[idx].x) / xSpread;
      const yAdd: number = pct * ySpread;
      return curveDef[idx].y + yAdd;
    }
  }
}
