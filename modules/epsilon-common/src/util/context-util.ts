import { Context, ProxyResult } from 'aws-lambda';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import { NumberRatchet } from '@bitblit/ratchet-common/lang/number-ratchet';
import { EpsilonInstance } from '../epsilon-instance.js';
import { LoggingTraceIdGenerator } from '../config/logging-trace-id-generator.js';
//import { BuiltInTraceIdGenerators } from '../built-in/built-in-trace-id-generators.js';
import { InternalBackgroundEntry } from '../background/internal-background-entry.js';
import { InterApiEntry } from '../inter-api/inter-api-entry.js';
import { ContextGlobalData } from "./context-global-data.js";
import { GlobalRatchet } from "@bitblit/ratchet-common/lang/global-ratchet";

// This class serves as a static holder for the AWS Lambda context, and also adds some
// simple helper functions
export class ContextUtil {
  // This only really works because Node is single-threaded - otherwise need some kind of thread local
  public static readonly CONTEXT_DATA_GLOBAL_NAME = 'EpsilonGlobalContextData';
  /*
  private static CURRENT_EPSILON_REFERENCE: EpsilonInstance;
  private static CURRENT_CONTEXT: Context;
  private static CURRENT_EVENT: any;
  private static CURRENT_LOG_VARS: Record<string, string | number | boolean> = {};
  private static CURRENT_PROCESS_LABEL: string;

  private static CURRENT_OVERRIDE_TRACE_ID: string;
  private static CURRENT_OVERRIDE_TRACE_DEPTH: number;*/

  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  private static fetchContextData(): ContextGlobalData {
    return GlobalRatchet.fetchGlobalVar(ContextUtil.CONTEXT_DATA_GLOBAL_NAME, {
      epsilonInstance: null,
      context: null,
      event: null,
      logVariables: {},
      processLabel: 'UNSET',
      overrideTraceDepth: null,
      overrideTraceId: null
    });
  }


  public static initContext(epsilon: EpsilonInstance, evt: any, ctx: Context, processLabel: string): void {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();
    cd.epsilonInstance= epsilon;
    cd.context= ctx;
    cd.event= evt;
    cd.processLabel= processLabel;
  }

  public static clearContext() {
    GlobalRatchet.setGlobalVar(ContextUtil.CONTEXT_DATA_GLOBAL_NAME, null);
  }

  public static setOverrideTrace(traceId: string, traceDepth: number): void {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();
    cd.overrideTraceId = traceId || cd.overrideTraceId;
    cd.overrideTraceDepth = traceDepth || cd.overrideTraceDepth;
  }

  public static setOverrideTraceFromInternalBackgroundEntry(entry: InternalBackgroundEntry<any>): void {
    ContextUtil.setOverrideTrace(entry.traceId, entry.traceDepth);
  }

  public static setOverrideTraceFromInterApiEntry(interApiEntry: InterApiEntry<any>): void {
    ContextUtil.setOverrideTrace(interApiEntry.traceId, interApiEntry.traceDepth);
  }

  public static addHeadersToRecord(input: Record<string, any>, depthOffset: number = 0): void {
    if (input) {
      input[ContextUtil.traceHeaderName()] = ContextUtil.currentTraceId();
      input[ContextUtil.traceDepthHeaderName()] = StringRatchet.safeString(ContextUtil.currentTraceDepth() + depthOffset);
    } else {
      ErrorRatchet.throwFormattedErr('Cannot add headers to null/undefined input');
    }
  }

  public static addTraceToProxyResult(pr: ProxyResult): void {
    pr.headers = pr.headers || {};
    ContextUtil.addHeadersToRecord(pr.headers);
  }

  public static addTraceToHttpRequestInit(ri: RequestInit): void {
    ri.headers = ri.headers || {};
    ContextUtil.addHeadersToRecord(ri.headers, 1);
  }

  public static setProcessLabel(processLabel: string): void {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();
    cd.processLabel = processLabel;
  }

  public static currentRequestId(): string {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();
    return cd?.context?.awsRequestId;
  }

  public static defaultedCurrentRequestId(defaultValueIfMissing: string = StringRatchet.createType4Guid()): string {
    return ContextUtil.currentRequestId() ?? defaultValueIfMissing;
  }

  public static remainingTimeMS(): number {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();
    return cd?.context?.getRemainingTimeInMillis();
  }

  public static currentProcessLabel(): string {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();
    return cd?.processLabel  || 'unset';
  }

  private static traceHeaderName(): string {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();
    const headerName: string = cd?.epsilonInstance?.config?.loggerConfig?.traceHeaderName || 'X-TRACE-ID';
    return headerName;
  }

  private static traceDepthHeaderName(): string {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();
    const headerName: string = cd?.epsilonInstance?.config?.loggerConfig?.traceDepthHeaderName || 'X-TRACE-DEPTH';
    return headerName;
  }

  public static currentTraceId(): string {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();

    const traceFn: LoggingTraceIdGenerator =
      cd?.epsilonInstance?.config?.loggerConfig?.traceIdGenerator || ContextUtil.defaultedCurrentRequestId;
    const traceId: string =
      cd?.overrideTraceId ||
      cd?.event?.headers?.[ContextUtil.traceHeaderName()] ||
      traceFn(cd?.event, cd?.context);
    return traceId;
  }

  public static currentTraceDepth(): number {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();

    const caller: number = cd?.overrideTraceDepth ||
      NumberRatchet.safeNumber(cd?.event?.headers?.[ContextUtil.traceDepthHeaderName()]) ||
      1;
    return caller;
  }

  public static addLogVariable(name: string, val: string | number | boolean): void {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();
    cd.logVariables[name] = val;
  }

  public static fetchLogVariable(name: string): string | number | boolean {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();
    return cd?.logVariables?.[name];
  }

  public static fetchLogVariables(): Record<string, string | number | boolean> {
    const cd: ContextGlobalData = ContextUtil.fetchContextData();
    return Object.assign({}, cd?.logVariables || {});
  }
}
