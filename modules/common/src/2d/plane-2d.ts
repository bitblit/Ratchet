// Planes flow from 0->width on the x axis and 0->height on the y axis
// Plane is assumed to be the upper-left quadrant of a cartesion space (ie, point 0,0 in the bottom left corner)
// Unless one or both of the directional booleans are set (rightToLeft, topToBottom)
export interface Plane2d {
  height: number;
  width: number;
  rightToLeft?: boolean;
  topToBottom?: boolean;
}
