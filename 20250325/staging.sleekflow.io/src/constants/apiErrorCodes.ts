// Source: https://github.com/SleekFlow/Sleekflow/blob/master/Sleekflow/Exceptions/ErrorCodeConstant.cs

export const API_ERROR_CODES = {
  // General
  missingEnvironmentVariableException: 1000,
  validationException: 1001,
  unauthorizedException: 1002,
  notFoundObjectException: 1003,
  unrecognizedEntityTypeException: 1004,
  userFriendlyException: 1005,
  internalException: 1006,
  queryException: 1007,
  cognitiveSearchException: 1008,
  externalCallException: 1009,
  serviceUnavailableException: 1010,
  transactionalBatchException: 1011,

  // Salesforce
  sObjectOperationException: 2000,
  sObjectQueryOperationException: 2001,
  unhandledApexOperationException: 2002,
  unrecognizedSObjectTypeNameException: 2003,

  // Crm Hub
  notInitializedException: 3000,
  duplicateUnifyRuleException: 3001,
  duplicateWebhookException: 3002,
  idUnresolvableException: 3003,
  readOnlyIntegrationException: 3004,

  // Hubspot
  missingNecessaryFieldFiltersException: 4001,
  notSupportedOperationException: 4002,

  // CrmHubWorker
  webhookProcessingException: 5000,

  // MessagingHub
  stillInProgressException: 6000,
  graphApiErrorException: 6001,
  messageFunctionRestrictedFunctionException: 6002,
  incorrectStateIdException: 6003,
  incorrectEtagException: 6006,

  // Dynamics365
  integratorOperationException: 7000,

  // CommerceHub
  unsupportedDiscountTypeException: 8000,
  exceedAvailableCountException: 8001,

  // FlowHub
  scriptingException: 9000,
  multipleWorkflowActiveException: 9001,
  workflowIdsNotMatchException: 9002,
  workflowNotActiveException: 9003,
  workflowVersionedIdNotMatchedException: 9004,
  infiniteDetectionException: 9005,
  webhookEventMatchingException: 9006,
  flowHubUserFriendlyException: 9007,
  workflowWebhookTriggerNotFoundException: 9008,
  flowHubExceedUsageException: 9009,
  workflowExecutionStatusNotCancellableException: 9010,
  workflowGroupNameDuplicateException: 9011,

  // IntelligentHub
  knowledgeBaseSourceTypeNotSupportedException: 10000,
  knowledgeBaseDocumentTypeNotSupportedException: 10001,

  // TenantHub
  exceedSubscriptionPlanLimitException: 11000,
  invalidIpAddressException: 11001,
  reachIpAddressLimitException: 11002,

  // Ticketing
  duplicateTicketTypeLabel: 12003,
  exceedTicketTypeLimit: 12004,
} as const;
