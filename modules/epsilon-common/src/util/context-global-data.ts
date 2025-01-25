import { EpsilonInstance } from "../epsilon-instance";
import { Context } from "aws-lambda";

export interface ContextGlobalData {
 epsilonInstance: EpsilonInstance;
 context: Context;
 event: any;
 logVariables: Record<string, string | number | boolean>;
 processLabel: string;

 overrideTraceId: string;
 overrideTraceDepth: number;
}