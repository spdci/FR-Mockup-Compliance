// JSON Schemas (draft-07) for the DCI Farmer Registry (FR) API v1.0.0.
//
// Sources:
//  - api-standards/release/yaml/fr_api_v1.0.0.yaml (envelopes, messages, status/reason codes)
//  - schemas/extensions/fr/v1/data (Farmer, Member, Group, FRPerson, FarmInfo, FarmingActivities,
//    CropDetails, LivestockDetails, Machineries) and schemas/core/v1/data (Person, Member, Group,
//    Name, Identifier, Address, Place, GeoCoordinates, GeoLocation, DisabilityInfo, RelatedPerson)
//  - code lists: see codes.js
//
// Almost every data attribute is optional in the standard. The schemas therefore do not
// require them, but whenever an attribute IS present its type, format, code list and
// structure are enforced. Registry extensions (extra attributes) are allowed unless the
// suite runs with STRICT_ATTRIBUTES=true (see `strictSchemas`).
//
// The same definitions are embedded in the Mockoon mocks (valid_json_schema rules), so
// they deliberately use only draft-07 keywords and ajv-formats formats (no custom ones).

import { codeLists, codePattern, namespacedPattern } from './codes.js';

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------
const DATE = '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])';
const TIME = '([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d(\\.\\d+)?)?';
const TZ = '(Z|[+-]([01]\\d|2[0-3]):?[0-5]\\d)';
// ISO 8601 calendar date, optionally with time and timezone (DCI DateTime, e.g. "1990-05-15T00:00:00Z").
export const ISO_DATE_PATTERN = `^${DATE}(T${TIME}${TZ}?)?$`;
// E.164 phone number, as recommended by the core Person object.
export const E164_PATTERN = '^\\+[1-9]\\d{1,14}$';
// ISO 639-3 language code, as required by the spec's `locale`.
export const LOCALE_PATTERN = '^[a-z]{3}$';
// ISO 639-1 / 639-3 language code for Member.language_code (LanguageCodeEnum example: "en").
export const LANGUAGE_CODE_PATTERN = '^[a-z]{2,3}$';
// ISO 3166-1 alpha-2 / alpha-3 country code.
export const COUNTRY_CODE_PATTERN = '^[A-Z]{2,3}$';
// Open Location Code (plus code), full or padded.
export const PLUS_CODE_PATTERN = '^[23456789CFGHJMPQRVWX0]{2,8}\\+[23456789CFGHJMPQRVWX]{0,3}$';
// Identifier types are a country-defined code list (core IdentifierTypeEnum lists UIN, BRN,
// MRN, DRN as examples; the FR spec example uses "NationalID"): a code-like token is required.
export const IDENTIFIER_TYPE_PATTERN = '^[A-Za-z][A-Za-z0-9_.:-]*$';
// FR RegistryEventType: "register" (bare, as in the spec enum, or namespaced).
export const REG_EVENT_TYPE_PATTERN = namespacedPattern(['register']);

// ---------------------------------------------------------------------------
// Record types: the FR answers searches for four kinds of records. The record type name
// is implementation-defined, so every usual spelling is recognised, bare or namespaced
// (spec example "spdci-extensions-dci:Farmer", mediator names "FarmerRecord", "FRGroup", ...).
// ---------------------------------------------------------------------------
export const recordKinds = {
  farmer: { definition: 'Farmer', names: ['Farmer', 'FarmerRecord', 'FRFarmer', 'Farmer_Person', 'FarmerPerson'] },
  person: { definition: 'FRPerson', names: ['Person', 'FRPerson', 'FR_Person'] },
  member: { definition: 'Member', names: ['Member', 'FRMember', 'FR_Member'] },
  group: { definition: 'Group', names: ['Group', 'FRGroup', 'FR_Group'] },
};
export const recordKindPattern = (kind) => namespacedPattern(recordKinds[kind].names);

// Kind of record for a reg_record_type; the FR default (Farmer) when none is given.
export function recordKind(regRecordType) {
  if (regRecordType === undefined || regRecordType === null || regRecordType === '') return 'farmer';
  return Object.keys(recordKinds).find((k) => new RegExp(recordKindPattern(k), 'u').test(regRecordType));
}

// ---------------------------------------------------------------------------
// Protocol code lists (fr_api_v1.0.0.yaml)
// ---------------------------------------------------------------------------
export const codes = {
  requestStatus: ['rcvd', 'pdng', 'succ', 'rjct'],
  ackStatus: ['ACK', 'NACK', 'ERR'],
  queryType: ['idtype-value', 'expression', 'predicate', 'graphql'],
  operator: ['gt', 'lt', 'eq', 'ge', 'le', 'in'],
  condition: ['and', 'or', 'not'],
  sortOrder: ['asc', 'desc'],
  txnType: ['search', 'subscribe', 'unsubscribe'],
  attributeType: ['transaction_id', 'reference_id_list', 'correlation_id', 'subscription_code_list'],
  subscriptionStatus: ['subscribe', 'unsubscribe'],
  searchStatusReasonCode: [
    'rjct.reference_id.invalid', 'rjct.reference_id.duplicate', 'rjct.timestamp.invalid',
    'rjct.search_criteria.invalid', 'rjct.filter.invalid', 'rjct.sort.invalid',
    'rjct.pagination.invalid', 'rjct.search.too_many_records_found',
  ],
  subscribeStatusReasonCode: [
    'rjct.reference_id.invalid', 'rjct.reference_id.duplicate', 'rjct.timestamp.invalid',
    'rjct.notify_types.invalid', 'rjct.notify_details.invalid', 'rjct.person_id.invalid',
    'rjct.event.already_subscribed',
  ],
  unsubscribeStatusReasonCode: [
    'rjct.reference_id.invalid', 'rjct.reference_id.duplicate', 'rjct.timestamp.invalid',
    'rjct.subscription_code.invalid', 'rjct.requester.invalid', 'rjct.event.already_unsubscribed',
  ],
  headerStatusReasonCode: [
    'rjct.version.invalid', 'rjct.message_id.duplicate', 'rjct.message_ts.invalid',
    'rjct.action.invalid', 'rjct.action.not_supported', 'rjct.total_count.invalid',
    'rjct.total_count.limit_exceeded', 'rjct.errors.too_many',
  ],
  errorCode: [
    'err.request.bad', 'err.request.unauthorized', 'err.request.forbidden', 'err.request.not_found',
    'err.request.timeout', 'err.version.not_supported', 'err.request.too_many_requests',
    'err.sender_id.invalid', 'err.sender_uri.invalid', 'err.receiver_id.invalid',
    'err.signature.missing', 'err.signature.invalid', 'err.encryption.invalid',
    'err.service.unavailable',
  ],
};

const ref = (name) => ({ $ref: `#/definitions/${name}` });
const str = { type: 'string' };
const nonEmptyStr = { type: 'string', minLength: 1 };
const bool = { type: 'boolean' };
const jsonLd = {
  '@context': { type: ['string', 'object'] },
  '@id': str,
  '@type': str,
};
const listOf = (item, minItems = 0) => ({ type: 'array', ...(minItems ? { minItems } : {}), items: item });
// A coded attribute: one of the list's codes or labels, case-insensitive. `description`
// names the list so the validator can report "... is not a <List> code or label".
const code = (key) => ({
  type: 'string',
  pattern: codePattern(key),
  description: `code:${codeLists[key].name}`,
});
// Multi-valued code attributes (@list in the model) are accepted as a list or, as some spec
// examples do, as a single value.
const codeOrList = (key) => ({ anyOf: [code(key), listOf(code(key))] });
const dates = { registration_date: ref('IsoDate'), last_updated: ref('IsoDate') };

// ---------------------------------------------------------------------------
// Definitions
// ---------------------------------------------------------------------------
export const definitions = {
  // ----- common types -----
  DateTime: { type: 'string', format: 'date-time' },
  IsoDate: { type: 'string', pattern: ISO_DATE_PATTERN },
  IsoDateOrEmpty: { type: 'string', pattern: `^$|${ISO_DATE_PATTERN}` },
  TransactionId: { type: 'string', minLength: 1, maxLength: 99 },
  CorrelationId: { type: 'string', minLength: 1, maxLength: 99, pattern: '^[a-zA-Z0-9-]+$' },
  ReferenceId: nonEmptyStr,
  SubscriptionCode: { type: 'string', minLength: 1, maxLength: 99 },
  Locale: { type: 'string', pattern: LOCALE_PATTERN },
  RequestStatus: { type: 'string', enum: codes.requestStatus },
  StatusReasonMessage: { type: 'string', maxLength: 999 },
  Version: { type: 'string', minLength: 1 },
  RegType: nonEmptyStr,
  RegRecordType: nonEmptyStr,
  RegEventType: { type: 'string', pattern: REG_EVENT_TYPE_PATTERN },
  ScalarOrObject: { type: ['string', 'number', 'boolean', 'object', 'array'] },
  Pagination: {
    type: 'object',
    required: ['page_size', 'page_number', 'total_count'],
    properties: {
      page_size: { type: 'integer', minimum: 1 },
      page_number: { type: 'integer', minimum: 1 },
      total_count: { type: 'integer', minimum: 0 },
    },
  },
  RequestPagination: {
    type: 'object',
    required: ['page_size'],
    properties: {
      page_size: { type: 'integer', minimum: 1 },
      page_number: { type: 'integer', minimum: 1 },
    },
  },
  Purpose: {
    type: 'object',
    properties: {
      text: str,
      code: str,
      ref_uri: { type: 'string', format: 'uri' },
    },
  },
  Consent: {
    type: 'object',
    properties: { ...jsonLd, ts: ref('DateTime'), purpose: ref('Purpose') },
  },

  // ----- message envelope -----
  MsgSignature: nonEmptyStr,
  Meta: { type: 'object' },
  MsgHeader: {
    type: 'object',
    required: ['message_id', 'message_ts', 'action', 'sender_id', 'total_count'],
    properties: {
      version: ref('Version'),
      message_id: nonEmptyStr,
      message_ts: ref('DateTime'),
      action: nonEmptyStr,
      sender_id: nonEmptyStr,
      sender_uri: { type: 'string', format: 'uri' },
      receiver_id: nonEmptyStr,
      total_count: { type: 'integer', minimum: 0 },
      is_msg_encrypted: bool,
      meta: ref('Meta'),
    },
  },
  MsgCallbackHeader: {
    type: 'object',
    required: ['message_id', 'message_ts', 'action', 'status'],
    properties: {
      version: ref('Version'),
      message_id: nonEmptyStr,
      message_ts: ref('DateTime'),
      action: nonEmptyStr,
      status: ref('RequestStatus'),
      status_reason_code: { type: 'string', enum: codes.headerStatusReasonCode },
      status_reason_message: ref('StatusReasonMessage'),
      total_count: { type: 'integer', minimum: 0 },
      completed_count: { type: 'integer', minimum: 0 },
      sender_id: nonEmptyStr,
      receiver_id: nonEmptyStr,
      is_msg_encrypted: bool,
      meta: ref('Meta'),
    },
  },
  EncryptedMessage: {
    type: 'object',
    required: ['header', 'ciphertext', 'encrypted_key', 'tag', 'iv'],
    properties: {
      header: {
        type: 'object',
        required: ['alg', 'enc', 'kid'],
        properties: { alg: nonEmptyStr, enc: nonEmptyStr, kid: nonEmptyStr },
      },
      ciphertext: nonEmptyStr,
      encrypted_key: nonEmptyStr,
      tag: nonEmptyStr,
      iv: nonEmptyStr,
    },
  },
  Error: {
    type: 'object',
    properties: {
      code: { type: 'string', enum: codes.errorCode },
      message: { type: 'string', maxLength: 999 },
    },
  },

  // ----- core data objects -----
  Identifier: {
    type: 'object',
    required: ['identifier_type', 'identifier_value'],
    properties: {
      ...jsonLd,
      identifier_type: { type: 'string', pattern: IDENTIFIER_TYPE_PATTERN },
      identifier_value: nonEmptyStr,
    },
  },
  // The model declares identifier lists; the FR spec example also sends a single Identifier.
  IdentifierList: {
    anyOf: [ref('Identifier'), listOf(ref('Identifier'), 1)],
  },
  Name: {
    type: 'object',
    // At least one name part. first_name/last_name are the FR spec example's names for
    // given_name/surname (core Name).
    anyOf: [{ required: ['surname'] }, { required: ['given_name'] }, { required: ['first_name'] }, { required: ['last_name'] }],
    properties: {
      '@type': str,
      surname: str,
      given_name: str,
      second_name: str,
      maiden_name: str,
      prefix: str,
      suffix: str,
      first_name: str,
      last_name: str,
    },
  },
  GeoCoordinates: {
    type: 'object',
    required: ['latitude', 'longitude'],
    properties: {
      '@id': str,
      '@type': str,
      latitude: { type: 'number', minimum: -90, maximum: 90 },
      longitude: { type: 'number', minimum: -180, maximum: 180 },
    },
  },
  GeoLocation: {
    type: 'object',
    properties: {
      '@id': str,
      '@type': str,
      plus_code: {
        type: 'object',
        properties: {
          global_code: { type: 'string', pattern: PLUS_CODE_PATTERN },
          geometry: {
            type: 'object',
            properties: {
              '@id': str,
              '@type': str,
              bounds: {
                type: 'object',
                properties: {
                  '@id': str,
                  '@type': str,
                  northeast: ref('GeoCoordinates'),
                  southwest: ref('GeoCoordinates'),
                },
              },
              location: ref('GeoCoordinates'),
            },
          },
        },
      },
    },
  },
  Address: {
    type: 'object',
    properties: {
      ...jsonLd,
      // core Address.jsonld uses address_line_1/2, other DCI examples address_line1/2.
      address_line_1: str,
      address_line_2: str,
      address_line1: str,
      address_line2: str,
      locality: str,
      sub_region_code: str,
      region_code: str,
      postal_code: str,
      country_code: { type: 'string', pattern: COUNTRY_CODE_PATTERN },
      geo_location: ref('GeoLocation'),
    },
  },
  AddressList: {
    anyOf: [ref('Address'), listOf(ref('Address'), 1)],
  },
  Place: {
    type: 'object',
    properties: {
      ...jsonLd,
      name: str,
      address_line: str,
      address: str,
      geo: ref('GeoCoordinates'),
      contained_in_place: { anyOf: [{ type: 'string' }, ref('Place')] },
      contains_place: listOf(ref('Place')),
    },
  },
  AdditionalAttributes: listOf({ type: 'object', minProperties: 1 }),

  // FRPerson (subclass of core Person). The FR spec example uses gender/date_of_birth and a
  // "spdci:identifier" list; these spellings are accepted and checked like sex/birth_date/identifier.
  FRPerson: {
    type: 'object',
    properties: {
      ...jsonLd,
      identifier: ref('IdentifierList'),
      'spdci:identifier': ref('IdentifierList'),
      name: ref('Name'),
      sex: code('sex'),
      gender: code('sex'),
      birth_date: ref('IsoDate'),
      date_of_birth: ref('IsoDate'),
      death_date: ref('IsoDateOrEmpty'),
      address: ref('AddressList'),
      phone_number: listOf({ type: 'string', pattern: E164_PATTERN }),
      email: listOf({ type: 'string', format: 'email' }),
      ...dates,
    },
  },
  DisabilityInfo: {
    type: 'object',
    properties: {
      ...jsonLd,
      disability_limitation_type: code('disabilityType'),
      functional_severity: code('functionalSeverity'),
    },
  },
  RelatedPerson: {
    type: 'object',
    properties: {
      ...jsonLd,
      relationship_type: code('relationshipType'),
      related_member: ref('FRPerson'),
    },
  },
  // FR Member (core Member whose demographic_info is an FRPerson).
  Member: {
    type: 'object',
    properties: {
      ...jsonLd,
      member_identifier: ref('IdentifierList'),
      demographic_info: ref('FRPerson'),
      related_person: listOf(ref('RelatedPerson')),
      is_disabled: bool,
      disability_info: listOf(ref('DisabilityInfo')),
      marital_status: code('maritalStatus'),
      employment_status: code('employmentStatus'),
      occupation: code('occupation'),
      income_level: nonEmptyStr,
      language_code: { type: 'string', pattern: LANGUAGE_CODE_PATTERN },
      education_level: code('educationLevel'),
      additional_attributes: ref('AdditionalAttributes'),
      ...dates,
    },
  },
  // FR Group (core Group whose head and members are FR Members).
  Group: {
    type: 'object',
    properties: {
      ...jsonLd,
      group_identifier: ref('IdentifierList'),
      group_type: code('groupType'),
      geographical_location: ref('Place'),
      address: ref('AddressList'),
      place_address: bool,
      poverty_score: { type: 'number', minimum: 0 },
      poverty_score_type: nonEmptyStr,
      group_head_info: ref('Member'),
      group_size: { type: 'integer', minimum: 1 },
      member_list: listOf(ref('Member')),
      additional_attributes: ref('AdditionalAttributes'),
      ...dates,
    },
  },

  // ----- farmer registry objects -----
  CropDetails: {
    type: 'object',
    properties: {
      ...jsonLd,
      activity_group: code('cropActivity'),
      // Model: crop_type_name; FR spec example: crop_type.
      crop_type: code('cropType'),
      crop_type_name: code('cropType'),
      variety: str,
      season: str,
      end_use: codeOrList('cropEndUse'),
      irrigation: bool,
      irrigation_water: codeOrList('irrigationWater'),
      fertilizer_type: codeOrList('fertilizerType'),
      ...dates,
    },
  },
  LivestockDetails: {
    type: 'object',
    properties: {
      ...jsonLd,
      type: code('animals'),
      count: { type: 'integer', minimum: 0 },
      livestock_system: code('livestockSystem'),
      ...dates,
    },
  },
  FarmingActivities: {
    type: 'object',
    properties: {
      ...jsonLd,
      crop_production: listOf(ref('CropDetails')),
      animal_production: listOf(ref('LivestockDetails')),
      mixed_farming: bool,
      agri_support_activities: codeOrList('agriSupportActivity'),
      // Model: aquaculture; FR spec example: aqua_culture.
      aquaculture: codeOrList('aquaCulture'),
      aqua_culture: codeOrList('aquaCulture'),
      aqua_support_activities: codeOrList('aquaSupportActivity'),
      agroforestry: codeOrList('forestActivity'),
      ...dates,
    },
  },
  FarmInfo: {
    type: 'object',
    properties: {
      ...jsonLd,
      // Model: location / measurment; FR spec example: place / measurement.
      location: ref('Place'),
      place: ref('Place'),
      farm_type: code('farmType'),
      land_tenure: code('landTenure'),
      land_size: { type: 'number', exclusiveMinimum: 0 },
      measurment: code('measurementUnit'),
      measurement: code('measurementUnit'),
      // Model: a FarmingActivities object; FR spec example: a list of them.
      farming_activities: { anyOf: [ref('FarmingActivities'), listOf(ref('FarmingActivities'))] },
      ...dates,
    },
  },
  Machineries: {
    type: 'object',
    properties: {
      ...jsonLd,
      type: code('machineries'),
      count: { type: 'integer', minimum: 0 },
      // FR spec example: equipement_source (sic).
      equipement_source: code('equipmentSource'),
      equipment_source: code('equipmentSource'),
      ...dates,
    },
  },
  // Farmer (Farmer_Person). The FR spec example spells farmer_personal_details "famer_personal_details".
  Farmer: {
    type: 'object',
    properties: {
      ...jsonLd,
      farmer_personal_details: ref('Member'),
      famer_personal_details: ref('Member'),
      family_details: ref('Group'),
      farm_type: code('farmType'),
      farm_details: listOf(ref('FarmInfo')),
      machineries_details: listOf(ref('Machineries')),
      ...dates,
    },
  },

  // ----- queries -----
  Expression: {
    type: 'object',
    required: ['attribute_name', 'operator', 'attribute_value'],
    properties: {
      attribute_name: nonEmptyStr,
      operator: { type: 'string', enum: codes.operator },
      attribute_value: ref('ScalarOrObject'),
    },
  },
  PredicateQuery: {
    type: 'array',
    minItems: 1,
    items: {
      type: 'object',
      required: ['expression1'],
      properties: {
        seq_num: { type: 'number' },
        expression1: ref('Expression'),
        condition: { type: 'string', enum: codes.condition },
        expression2: ref('Expression'),
      },
    },
  },
  IdTypeValueQuery: {
    type: 'object',
    required: ['type', 'value'],
    properties: {
      type: nonEmptyStr,
      value: { type: ['string', 'number', 'boolean', 'object'] },
    },
  },
  ExpressionQuery: {
    type: 'object',
    required: ['type', 'value'],
    properties: {
      type: nonEmptyStr,
      value: { type: 'object' },
    },
  },
  Query: {
    anyOf: [ref('IdTypeValueQuery'), ref('ExpressionQuery'), ref('PredicateQuery')],
  },
  SortItem: {
    type: 'object',
    required: ['attribute_name'],
    properties: {
      attribute_name: nonEmptyStr,
      sort_order: { type: 'string', enum: codes.sortOrder },
    },
  },
  SearchCriteria: {
    type: 'object',
    required: ['query_type', 'query'],
    properties: {
      version: ref('Version'),
      reg_type: ref('RegType'),
      reg_record_type: ref('RegRecordType'),
      query_type: { type: 'string', enum: codes.queryType },
      query: ref('Query'),
      sort: listOf(ref('SortItem')),
      pagination: ref('RequestPagination'),
      consent: ref('Consent'),
      authorize: ref('Consent'),
    },
    allOf: [
      {
        if: { properties: { query_type: { const: 'idtype-value' } }, required: ['query_type'] },
        then: { properties: { query: ref('IdTypeValueQuery') } },
      },
      {
        if: { properties: { query_type: { const: 'predicate' } }, required: ['query_type'] },
        then: { properties: { query: ref('PredicateQuery') } },
      },
      {
        if: { properties: { query_type: { enum: ['expression', 'graphql'] } }, required: ['query_type'] },
        then: { properties: { query: ref('ExpressionQuery') } },
      },
    ],
  },
  Frequency: {
    type: 'object',
    required: ['start_time', 'end_time', 'frequency'],
    properties: {
      start_time: ref('DateTime'),
      end_time: ref('DateTime'),
      frequency: nonEmptyStr,
    },
  },
  SubscribeCriteria: {
    type: 'object',
    required: ['reg_event_type', 'filter', 'notify_record_type'],
    properties: {
      version: ref('Version'),
      reg_type: ref('RegType'),
      reg_event_type: ref('RegEventType'),
      frequency: ref('Frequency'),
      filter_type: { type: 'string', enum: codes.queryType },
      filter: ref('Query'),
      notify_record_type: ref('RegRecordType'),
      authorize: ref('Consent'),
    },
    allOf: [
      {
        if: { properties: { filter_type: { const: 'idtype-value' } }, required: ['filter_type'] },
        then: { properties: { filter: ref('IdTypeValueQuery') } },
      },
      {
        if: { properties: { filter_type: { const: 'predicate' } }, required: ['filter_type'] },
        then: { properties: { filter: ref('PredicateQuery') } },
      },
      {
        if: { properties: { filter_type: { enum: ['expression', 'graphql'] } }, required: ['filter_type'] },
        then: { properties: { filter: ref('ExpressionQuery') } },
      },
    ],
  },

  // ----- messages -----
  SearchRequest: {
    type: 'object',
    required: ['transaction_id', 'search_request'],
    properties: {
      transaction_id: ref('TransactionId'),
      search_request: listOf({
        type: 'object',
        required: ['reference_id', 'timestamp', 'search_criteria'],
        properties: {
          reference_id: ref('ReferenceId'),
          timestamp: ref('DateTime'),
          search_criteria: ref('SearchCriteria'),
          locale: ref('Locale'),
        },
      }, 1),
    },
  },
  SearchResponseItem: {
    type: 'object',
    required: ['reference_id', 'timestamp', 'status'],
    properties: {
      reference_id: ref('ReferenceId'),
      timestamp: ref('DateTime'),
      status: ref('RequestStatus'),
      status_reason_code: { type: 'string', enum: codes.searchStatusReasonCode },
      status_reason_message: ref('StatusReasonMessage'),
      data: ref('SearchData'),
      pagination: ref('Pagination'),
      locale: ref('Locale'),
    },
  },
  SearchResponse: {
    type: 'object',
    required: ['transaction_id', 'correlation_id', 'search_response'],
    properties: {
      transaction_id: ref('TransactionId'),
      correlation_id: ref('CorrelationId'),
      search_response: listOf(ref('SearchResponseItem')),
    },
  },
  SubscribeRequest: {
    type: 'object',
    required: ['transaction_id', 'subscribe_request'],
    properties: {
      transaction_id: ref('TransactionId'),
      subscribe_request: listOf({
        type: 'object',
        required: ['reference_id', 'timestamp', 'subscribe_criteria'],
        properties: {
          reference_id: ref('ReferenceId'),
          timestamp: ref('DateTime'),
          subscribe_criteria: ref('SubscribeCriteria'),
          locale: ref('Locale'),
        },
      }, 1),
    },
  },
  Subscription: {
    type: 'object',
    required: ['code', 'status', 'timestamp'],
    properties: {
      version: ref('Version'),
      code: ref('SubscriptionCode'),
      status: { type: 'string', enum: codes.subscriptionStatus },
      timestamp: ref('DateTime'),
      reg_type: ref('RegType'),
      reg_event_type: ref('RegEventType'),
      frequency: ref('Frequency'),
      filter_type: { type: 'string', enum: codes.queryType },
      filter: ref('Query'),
      notify_record_type: ref('RegRecordType'),
      locale: ref('Locale'),
    },
  },
  SubscribeResponse: {
    type: 'object',
    required: ['transaction_id', 'correlation_id', 'subscribe_response'],
    properties: {
      transaction_id: ref('TransactionId'),
      correlation_id: ref('CorrelationId'),
      subscribe_response: listOf({
        type: 'object',
        required: ['reference_id', 'timestamp', 'status'],
        properties: {
          reference_id: ref('ReferenceId'),
          timestamp: ref('DateTime'),
          status: ref('RequestStatus'),
          status_reason_code: { type: 'string', enum: codes.subscribeStatusReasonCode },
          status_reason_message: ref('StatusReasonMessage'),
          subscriptions: listOf(ref('Subscription')),
          pagination: ref('Pagination'),
          locale: ref('Locale'),
        },
      }),
    },
  },
  UnSubscribeRequest: {
    type: 'object',
    required: ['transaction_id', 'timestamp', 'subscription_codes'],
    properties: {
      transaction_id: ref('TransactionId'),
      timestamp: ref('DateTime'),
      subscription_codes: listOf(ref('SubscriptionCode'), 1),
    },
  },
  UnSubscribeResponse: {
    type: 'object',
    required: ['transaction_id', 'correlation_id', 'timestamp', 'status'],
    properties: {
      transaction_id: ref('TransactionId'),
      correlation_id: ref('CorrelationId'),
      timestamp: ref('DateTime'),
      status: ref('RequestStatus'),
      status_reason_code: { type: 'string', enum: codes.unsubscribeStatusReasonCode },
      status_reason_message: ref('StatusReasonMessage'),
      subscription_status: listOf({
        type: 'object',
        required: ['code', 'status'],
        properties: {
          code: ref('SubscriptionCode'),
          status: { type: 'string', enum: codes.subscriptionStatus },
        },
      }),
    },
  },
  NotifyEventRequest: {
    type: 'object',
    required: ['transaction_id', 'notify_event'],
    properties: {
      transaction_id: ref('TransactionId'),
      notify_event: listOf({
        type: 'object',
        required: ['reference_id', 'timestamp', 'data'],
        properties: {
          reference_id: ref('ReferenceId'),
          timestamp: ref('DateTime'),
          data: ref('NotifyData'),
          locale: ref('Locale'),
        },
      }, 1),
    },
  },
  TxnStatusRequest: {
    type: 'object',
    required: ['transaction_id', 'txnstatus_request'],
    properties: {
      transaction_id: ref('TransactionId'),
      txnstatus_request: {
        type: 'object',
        required: ['reference_id', 'txn_type', 'attribute_type', 'attribute_value'],
        properties: {
          reference_id: ref('ReferenceId'),
          txn_type: { type: 'string', enum: codes.txnType },
          attribute_type: { type: 'string', enum: codes.attributeType },
          attribute_value: {
            anyOf: [ref('TransactionId'), listOf(ref('ReferenceId'), 1)],
          },
          locale: ref('Locale'),
        },
        // attribute_value must match the declared attribute_type.
        allOf: [
          {
            if: { properties: { attribute_type: { const: 'transaction_id' } }, required: ['attribute_type'] },
            then: { properties: { attribute_value: ref('TransactionId') } },
          },
          {
            if: { properties: { attribute_type: { const: 'correlation_id' } }, required: ['attribute_type'] },
            then: { properties: { attribute_value: ref('CorrelationId') } },
          },
          {
            if: { properties: { attribute_type: { const: 'reference_id_list' } }, required: ['attribute_type'] },
            then: { properties: { attribute_value: listOf(ref('ReferenceId'), 1) } },
          },
          {
            if: { properties: { attribute_type: { const: 'subscription_code_list' } }, required: ['attribute_type'] },
            then: { properties: { attribute_value: listOf(ref('SubscriptionCode'), 1) } },
          },
        ],
      },
    },
  },
  TxnSearchResponse: {
    type: 'object',
    required: ['transaction_id', 'correlation_id', 'search_response'],
    properties: {
      transaction_id: ref('TransactionId'),
      correlation_id: ref('CorrelationId'),
      search_response: listOf({
        type: 'object',
        required: ['reference_id', 'timestamp', 'status'],
        properties: {
          reference_id: ref('ReferenceId'),
          timestamp: ref('DateTime'),
          status: ref('RequestStatus'),
          status_reason_code: { type: 'string', enum: codes.searchStatusReasonCode },
          status_reason_message: ref('StatusReasonMessage'),
          data: ref('NotifyData'),
          pagination: ref('Pagination'),
          locale: ref('Locale'),
        },
      }),
    },
  },
  TxnStatusResponse: {
    type: 'object',
    required: ['transaction_id', 'correlation_id', 'txnstatus_response'],
    properties: {
      transaction_id: ref('TransactionId'),
      correlation_id: ref('CorrelationId'),
      txnstatus_response: {
        type: 'object',
        properties: {
          txn_type: { type: 'string', enum: codes.txnType },
          txn_status: {
            anyOf: [ref('TxnSearchResponse'), ref('SubscribeResponse'), ref('UnSubscribeResponse')],
          },
        },
        // txn_status must be the response type matching txn_type.
        allOf: [
          {
            if: { properties: { txn_type: { const: 'search' } }, required: ['txn_type'] },
            then: { properties: { txn_status: ref('TxnSearchResponse') } },
          },
          {
            if: { properties: { txn_type: { const: 'subscribe' } }, required: ['txn_type'] },
            then: { properties: { txn_status: ref('SubscribeResponse') } },
          },
          {
            if: { properties: { txn_type: { const: 'unsubscribe' } }, required: ['txn_type'] },
            then: { properties: { txn_status: ref('UnSubscribeResponse') } },
          },
        ],
      },
    },
  },

  // ----- synchronous HTTP responses -----
  AckResponse: {
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'object',
        required: ['ack_status', 'timestamp', 'correlation_id'],
        properties: {
          ack_status: { type: 'string', enum: codes.ackStatus },
          timestamp: ref('DateTime'),
          error: ref('Error'),
          correlation_id: ref('CorrelationId'),
        },
        // An ERR acknowledgement must explain itself with an error code.
        if: { properties: { ack_status: { const: 'ERR' } }, required: ['ack_status'] },
        then: { required: ['error'], properties: { error: { required: ['code'] } } },
      },
    },
  },
  HttpErrorResponse: {
    type: 'object',
    required: ['errors'],
    properties: {
      errors: listOf({
        type: 'object',
        required: ['code'],
        properties: { code: nonEmptyStr, message: str },
      }, 1),
    },
  },
};

// reg_records are validated against the data object of their reg_record_type (Farmer,
// FRPerson, Member or Group). Search responses carry an array; notify and txn status declare a
// single object in the spec, so both forms are accepted there.
const recordsByType = (records) => ({
  allOf: Object.entries(recordKinds).map(([kind, { definition }]) => ({
    if: { properties: { reg_record_type: { pattern: recordKindPattern(kind) } }, required: ['reg_record_type'] },
    then: { properties: { reg_records: records(ref(definition)) } },
  })),
});
definitions.SearchData = {
  type: 'object',
  required: ['reg_record_type', 'reg_records'],
  properties: {
    version: ref('Version'),
    reg_type: ref('RegType'),
    reg_record_type: ref('RegRecordType'),
    reg_records: listOf({ type: 'object' }),
  },
  ...recordsByType((item) => listOf(item)),
};
definitions.NotifyData = {
  type: 'object',
  required: ['reg_record_type', 'reg_records'],
  properties: {
    version: ref('Version'),
    reg_type: ref('RegType'),
    reg_event_type: ref('RegEventType'),
    reg_record_type: ref('RegRecordType'),
    reg_records: { anyOf: [listOf({ type: 'object' }), { type: 'object' }] },
  },
  ...recordsByType((item) => ({ anyOf: [listOf(item), item] })),
};

// FR data objects (STRICT_ATTRIBUTES mode refuses attributes the standard does not define).
export const dataDefinitions = [
  'Identifier', 'Name', 'GeoCoordinates', 'Address', 'Place', 'FRPerson', 'DisabilityInfo', 'RelatedPerson',
  'Member', 'Group', 'CropDetails', 'LivestockDetails', 'FarmingActivities', 'FarmInfo', 'Machineries', 'Farmer',
];

// ---------------------------------------------------------------------------
// Envelopes: { signature, header, message } per endpoint
// ---------------------------------------------------------------------------
const encryptedIf = {
  properties: {
    header: { properties: { is_msg_encrypted: { const: true } }, required: ['is_msg_encrypted'] },
  },
  required: ['header'],
};

function envelope({ headerDef, action, messageDef, messageRequired }) {
  return {
    type: 'object',
    required: messageRequired ? ['header', 'message'] : ['header'],
    properties: {
      signature: ref('MsgSignature'),
      header: {
        allOf: [ref(headerDef), { type: 'object', properties: { action: { const: action } } }],
      },
      message: { type: 'object' },
    },
    // message is the plain payload, or an EncryptedMessage when header.is_msg_encrypted is true.
    if: encryptedIf,
    then: { properties: { message: ref('EncryptedMessage') } },
    else: { properties: { message: ref(messageDef) } },
  };
}

// Header type and action per path, as declared in fr_api_v1.0.0.yaml (note: in the FR API
// on-subscribe carries a callback header, on-unsubscribe a request header).
export const envelopeDefinitions = {
  'search': envelope({ headerDef: 'MsgHeader', action: 'search', messageDef: 'SearchRequest', messageRequired: true }),
  'subscribe': envelope({ headerDef: 'MsgHeader', action: 'subscribe', messageDef: 'SubscribeRequest', messageRequired: true }),
  'unsubscribe': envelope({ headerDef: 'MsgHeader', action: 'unsubscribe', messageDef: 'UnSubscribeRequest', messageRequired: true }),
  'txn-status': envelope({ headerDef: 'MsgHeader', action: 'txn-status', messageDef: 'TxnStatusRequest', messageRequired: true }),
  'on-search': envelope({ headerDef: 'MsgCallbackHeader', action: 'on-search', messageDef: 'SearchResponse', messageRequired: false }),
  'on-subscribe': envelope({ headerDef: 'MsgCallbackHeader', action: 'on-subscribe', messageDef: 'SubscribeResponse', messageRequired: true }),
  'on-unsubscribe': envelope({ headerDef: 'MsgHeader', action: 'on-unsubscribe', messageDef: 'UnSubscribeResponse', messageRequired: true }),
  'notify': envelope({ headerDef: 'MsgCallbackHeader', action: 'notify', messageDef: 'NotifyEventRequest', messageRequired: false }),
  'txn-on-status': envelope({ headerDef: 'MsgCallbackHeader', action: 'txn-on-status', messageDef: 'TxnStatusResponse', messageRequired: false }),
};
envelopeDefinitions['sync-search-response'] = envelopeDefinitions['on-search'];
envelopeDefinitions['sync-txn-status-response'] = envelopeDefinitions['txn-on-status'];

// Top-level, self-contained schemas (every one embeds all definitions so it can be compiled
// on its own, which is what Mockoon's valid_json_schema rule needs).
const standalone = (root, defs = definitions) => ({ ...root, definitions: defs });

const recordSchemas = (defs) => Object.fromEntries(
  Object.entries(recordKinds).map(([kind, { definition }]) => [kind, standalone(defs[definition], defs)]),
);

export const schemas = {
  ...Object.fromEntries(Object.entries(envelopeDefinitions).map(([k, v]) => [k, standalone(v)])),
  'ack': standalone(definitions.AckResponse),
  'http-error': standalone(definitions.HttpErrorResponse),
  ...recordSchemas(definitions),
};

// Same record schemas, refusing undefined attributes in every FR data object.
const strictDefinitions = structuredClone(definitions);
for (const name of dataDefinitions) strictDefinitions[name].additionalProperties = false;
export const strictSchemas = recordSchemas(strictDefinitions);
