import { RouteMapping } from "./route-mapping.js";
import Route from 'route-parser';

export interface RouteAndParse {
  mapping: RouteMapping;
  route: Route;
  parsed: any;
}
