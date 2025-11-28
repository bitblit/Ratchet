export interface AbstractCronEntry {
  name?: string; // Just used for labeling in logs
  eventFilter?: RegExp; // If set, matches against the schedule name from CloudWatch events
  minuteFilter?: number[]; // If set and length>0, only minutes matching this array will trigger 0-59
  hourFilter?: number[]; // If set and length>0, only hours matching this array will trigger (as defined by the timezone in cron config) 0-23
  dayOfWeekFilter?: (1 | 2 | 3 | 4 | 5 | 6 | 7)[]; // If set and length>0, only days of week matching this array will trigger (as defined by the timezone in cron config) 1-7 (1=Monday, 7=Sunday)
  dayOfMonthFilter?: number[]; // If set and length>0, only days of month matching this array will trigger (as defined by the timezone in cron config) 1-31
  monthOfYearFilter?: number[]; // If set and length>0, only months of year matching this array will trigger (as defined by the timezone in cron config) 1-12
  contextMatchFilter?: RegExp; // If set, the context must match this filter
  contextNoMatchFilter?: RegExp; // If set, the context must NOT match this filter
  // If both match and nomatch are set, the noMatch dominates over match

  // If set, this will be used instead of the timezone in cron-config
  // This override is to allow you to use a simple timezone like PT for most, while
  // still scheduling certain things to run in UTC (Not DST switching)
  overrideTimezone?: string;
}
