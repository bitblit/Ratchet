export interface CiRunInformation {
  buildNumber: string; // You MUST set this one
  localTime: string; // And this one
  branch?: string;
  tag?: string;
  commitHash?: string;
  userName?: string;
  projectName?: string;
}
