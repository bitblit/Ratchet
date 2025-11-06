import { TransformationMatrix } from "./transformation-matrix.js";

export class MatrixFactory {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static multiply(tx: TransformationMatrix[]): TransformationMatrix {
    let rval: TransformationMatrix = MatrixFactory.identity();
    tx.forEach(t=>{
      rval = {
        a: (rval.a * t.a) + (rval.b * t.c) + ((rval.u ?? 0) * 0),
        b: (rval.a * t.b) + (rval.b * t.d) + ((rval.u ?? 0) * 0),
        u: (rval.a * (t.u ?? 0)) + (rval.b * (t.v ?? 0)) + ((rval.u ?? 0) * 1),
        c: (rval.c * t.a) + (rval.d * t.c) + ((rval.v ?? 0) * 0),
        d: (rval.c * t.b) + (rval.d * t.d) + ((rval.v ?? 0)  * 0),
        v: (rval.c * (t.u ?? 0)) + (rval.d * (t.v ?? 0)) + ((rval.v ?? 0)  * 1),
      };
    });
    return rval;
  }

  public static translate(xMove: number, yMove: number): TransformationMatrix {
    const rval: TransformationMatrix = MatrixFactory.identity();
    rval.u = xMove;
    rval.v = yMove;
    return rval;
  }


  public static scaleUniform(scale: number): TransformationMatrix {
    return MatrixFactory.scale(scale, scale);
  }

  public static scale(xScale: number, yScale: number): TransformationMatrix {
    return {
      a: xScale,
      b: 0,
      c: 0,
      d: yScale,
    }
  }

  public static rotate(angleTheta: number): TransformationMatrix {
    return {
      a: Math.cos(angleTheta),
      b: -1 * Math.sin(angleTheta),
      c: Math.sin(angleTheta),
      d: Math.cos(angleTheta)
    };
  }

  public static shear(xShear: number, yShear: number): TransformationMatrix {
    return {
      a: 1,
      b: xShear,
      c: yShear,
      d: 1
    }
  }

  public static mirrorAboutYAxis(): TransformationMatrix {
    return {
      a: -1,
      b: 0,
      c: 0,
      d: 1
    }
  }

  public static mirrorAboutXAxis(): TransformationMatrix {
    return {
      a: 1,
      b: 0,
      c: 0,
      d: -1
    }
  }


  public static identity(): TransformationMatrix {
    return {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      u: 0,
      v: 0
    }
  }



}