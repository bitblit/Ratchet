export enum Plane2dType {
  BottomLeft = 'BottomLeft', // x increases to the right, y increases going up (common cartesian)
  BottomRight = 'BottomRight', // x increases to the left, y increases going up (uncommon)
  TopLeft = 'TopLeft', // x increases to the right, y increases going down (common graphics)
  TopRight = 'TopRight' // x increases to the left, y increases going down (uncommon)
}
