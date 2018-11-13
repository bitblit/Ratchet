
export interface DaemonProcessState {
    id: string;

    title: string;
    targetFileName: string;

    lastUpdatedEpochMS: number;
    lastUpdatedMessage: string;

    startedEpochMS: number;
    completedEpochMS: number;
    meta: any;
    error: string;
    link: string;
    contentType: string;

}
