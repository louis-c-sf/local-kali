'use strict';

exports.WorkflowContextFidelity = void 0;
(function (WorkflowContextFidelity) {
  WorkflowContextFidelity["Burst"] = "Burst";
  WorkflowContextFidelity["Activity"] = "Activity";
})(exports.WorkflowContextFidelity || (exports.WorkflowContextFidelity = {}));
exports.WorkflowPersistenceBehavior = void 0;
(function (WorkflowPersistenceBehavior) {
  WorkflowPersistenceBehavior["Suspended"] = "Suspended";
  WorkflowPersistenceBehavior["WorkflowBurst"] = " WorkflowBurst";
  WorkflowPersistenceBehavior["WorkflowPassCompleted"] = "WorkflowPassCompleted";
  WorkflowPersistenceBehavior["ActivityExecuted"] = "ActivityExecuted";
})(exports.WorkflowPersistenceBehavior || (exports.WorkflowPersistenceBehavior = {}));
exports.WorkflowStatus = void 0;
(function (WorkflowStatus) {
  WorkflowStatus["Idle"] = "Idle";
  WorkflowStatus["Running"] = "Running";
  WorkflowStatus["Finished"] = "Finished";
  WorkflowStatus["Suspended"] = "Suspended";
  WorkflowStatus["Faulted"] = "Faulted";
  WorkflowStatus["Cancelled"] = "Cancelled";
})(exports.WorkflowStatus || (exports.WorkflowStatus = {}));
exports.OrderBy = void 0;
(function (OrderBy) {
  OrderBy["Started"] = "Started";
  OrderBy["LastExecuted"] = "LastExecuted";
  OrderBy["Finished"] = "Finished";
})(exports.OrderBy || (exports.OrderBy = {}));
exports.ActivityTraits = void 0;
(function (ActivityTraits) {
  ActivityTraits[ActivityTraits["Action"] = 1] = "Action";
  ActivityTraits[ActivityTraits["Trigger"] = 2] = "Trigger";
  ActivityTraits[ActivityTraits["Job"] = 4] = "Job";
})(exports.ActivityTraits || (exports.ActivityTraits = {}));
class SyntaxNames {
}
SyntaxNames.Literal = 'Literal';
SyntaxNames.JavaScript = 'JavaScript';
SyntaxNames.Liquid = 'Liquid';
SyntaxNames.Json = 'Json';
SyntaxNames.Variable = 'Variable';
SyntaxNames.Output = 'Output';
const getVersionOptionsString = (versionOptions) => {
  if (!versionOptions)
    return '';
  return versionOptions.allVersions
    ? 'AllVersions'
    : versionOptions.isDraft
      ? 'Draft'
      : versionOptions.isLatest
        ? 'Latest'
        : versionOptions.isPublished
          ? 'Published'
          : versionOptions.isLatestOrPublished
            ? 'LatestOrPublished'
            : versionOptions.version.toString();
};
exports.WorkflowTestActivityMessageStatus = void 0;
(function (WorkflowTestActivityMessageStatus) {
  WorkflowTestActivityMessageStatus["Done"] = "Done";
  WorkflowTestActivityMessageStatus["Waiting"] = "Waiting";
  WorkflowTestActivityMessageStatus["Failed"] = "Failed";
  WorkflowTestActivityMessageStatus["Modified"] = "Modified";
})(exports.WorkflowTestActivityMessageStatus || (exports.WorkflowTestActivityMessageStatus = {}));

exports.SyntaxNames = SyntaxNames;
exports.getVersionOptionsString = getVersionOptionsString;
