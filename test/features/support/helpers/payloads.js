// Builders for spec-compliant DCI FR requests ({ signature, header, message }).
// Searches, subscriptions and callbacks are built per kind of record: farmer, person, member, group.

import { randomUUID } from 'node:crypto';
import { senderId, receiverId } from './helpers.js';
import { testData, testRecord, regRecordType } from './testdata.js';

const nowTs = () => new Date().toISOString();
const shortId = (prefix) => `${prefix}${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

export const newTransactionId = () => shortId('TXN');
export const newReferenceId = () => shortId('REF');

export function msgHeader(action, { totalCount = 1, senderUri } = {}) {
  return {
    version: '1.0.0',
    message_id: randomUUID(),
    message_ts: nowTs(),
    action,
    sender_id: senderId,
    ...(senderUri ? { sender_uri: senderUri } : {}),
    receiver_id: receiverId,
    total_count: totalCount,
    is_msg_encrypted: false,
  };
}

export function callbackHeader(action, { status = 'succ', totalCount = 1, completedCount = totalCount } = {}) {
  return {
    version: '1.0.0',
    message_id: randomUUID(),
    message_ts: nowTs(),
    action,
    status,
    total_count: totalCount,
    completed_count: completedCount,
    sender_id: receiverId,
    receiver_id: senderId,
    is_msg_encrypted: false,
  };
}

export const envelope = (header, message) => ({ header, message });

// ----- queries -----
export function idTypeValueQuery(kind, name) {
  const { identifier_type, identifier_value } = testRecord(kind, name);
  return { query_type: 'idtype-value', query: { type: identifier_type, value: identifier_value } };
}

// Predicate searches sent by the suite, one per kind of record. The farmer one is the FR spec's
// process flow 2 ("farmers that have small subsistence-oriented farms" of a minimum size).
export const predicates = {
  farmer: [
    { attribute_name: 'farm_details.farm_type', operator: 'eq', attribute_value: 'Small subsistence-oriented farms' },
    { attribute_name: 'farm_details.land_size', operator: 'ge', attribute_value: 2 },
  ],
  person: [
    { attribute_name: 'sex', operator: 'eq', attribute_value: 'female' },
    { attribute_name: 'birth_date', operator: 'ge', attribute_value: '1980-01-01' },
  ],
  member: [
    { attribute_name: 'marital_status', operator: 'eq', attribute_value: 'M' },
    { attribute_name: 'is_disabled', operator: 'eq', attribute_value: false },
  ],
  group: [
    { attribute_name: 'group_type', operator: 'eq', attribute_value: '2' },
    { attribute_name: 'group_size', operator: 'ge', attribute_value: 3 },
  ],
};

// Attribute the suite sorts each kind of record by.
export const sortAttributes = {
  farmer: 'registration_date',
  person: 'birth_date',
  member: 'registration_date',
  group: 'group_size',
};

export function predicateQuery(conditions) {
  // conditions: [{ attribute_name, operator, attribute_value }, ...] joined with "and"
  const query = [];
  for (let i = 0; i < conditions.length; i += 2) {
    const item = { seq_num: i / 2 + 1, expression1: conditions[i] };
    if (conditions[i + 1]) Object.assign(item, { condition: 'and', expression2: conditions[i + 1] });
    query.push(item);
  }
  return { query_type: 'predicate', query };
}

const mongoOperator = { eq: '$eq', gt: '$gt', lt: '$lt', ge: '$gte', le: '$lte', in: '$in' };

// The predicate of the kind, as a NoSQL expression (FR ExpTemplate / spec process flows).
export const expressionQuery = (kind) => ({
  query_type: 'expression',
  query: {
    type: 'ns:org:QueryType:expression',
    value: {
      expression: {
        collection: regRecordType(kind),
        query: { $and: predicates[kind].map((p) => ({ [p.attribute_name]: { [mongoOperator[p.operator]]: p.attribute_value } })) },
      },
    },
  },
});

const graphqlFields = {
  farmer: 'farmer_personal_details { member_identifier demographic_info { name sex birth_date } } farm_details { farm_type land_size measurment }',
  person: 'identifier name sex birth_date',
  member: 'member_identifier demographic_info { name sex birth_date } marital_status is_disabled',
  group: 'group_identifier group_type group_size group_head_info { member_identifier }',
};

export const graphqlQuery = (kind) => ({
  query_type: 'graphql',
  query: {
    type: 'ns:org:QueryType:graphql',
    value: { expression: `query { ${kind}s(filter: ${JSON.stringify(predicates[kind])}) { ${graphqlFields[kind]} } }` },
  },
});

export const consent = (type) => ({
  '@context': `https://schema.spdci.org/common/v1/api-schemas/${type}.jsonld`,
  '@type': type,
  ts: nowTs(),
  purpose: { text: 'Farmer support programme eligibility', code: 'FSP-ELIG', ref_uri: 'https://example.org/consent-codes' },
});

export function searchItem(kind, criteria, { locale } = {}) {
  return {
    reference_id: newReferenceId(),
    timestamp: nowTs(),
    search_criteria: {
      version: '1.0.0',
      reg_type: testData.regType,
      ...(kind ? { reg_record_type: regRecordType(kind) } : {}),
      ...criteria,
    },
    ...(locale ? { locale } : {}),
  };
}

export const searchMessage = (items) => ({ transaction_id: newTransactionId(), search_request: items });

// ----- subscriptions -----
export function subscribeItem(kind, filterType = 'idtype-value', eventType = 'register') {
  const filter = {
    'idtype-value': () => idTypeValueQuery(kind, kind === 'group' ? 'family' : 'full'),
    // New registrations since a date (FR spec process flow 3).
    'predicate': () => predicateQuery([{ attribute_name: 'registration_date', operator: 'gt', attribute_value: '2024-12-12T00:00:00Z' }]),
    'expression': () => expressionQuery(kind),
    'graphql': () => graphqlQuery(kind),
  }[filterType]();
  const start = new Date();
  const end = new Date(start.getTime() + 365 * 24 * 3600 * 1000);
  return {
    reference_id: newReferenceId(),
    timestamp: nowTs(),
    subscribe_criteria: {
      version: '1.0.0',
      reg_type: testData.regType,
      reg_event_type: eventType,
      frequency: { start_time: start.toISOString(), end_time: end.toISOString(), frequency: '0 0 0 * * ? *' },
      filter_type: filter.query_type,
      filter: filter.query,
      notify_record_type: regRecordType(kind),
      authorize: consent('Authorize'),
    },
    locale: 'eng',
  };
}

export const subscribeMessage = (items) => ({ transaction_id: newTransactionId(), subscribe_request: items });

export const unsubscribeMessage = (codes) => ({ transaction_id: newTransactionId(), timestamp: nowTs(), subscription_codes: codes });

// ----- transaction status -----
export function txnStatusMessage(txnType, attributeType) {
  const attributeValue = {
    transaction_id: newTransactionId(),
    reference_id_list: [newReferenceId(), newReferenceId()],
    correlation_id: `CORR-${randomUUID().slice(0, 8)}`,
    subscription_code_list: ['SUB-0001', 'SUB-0002'],
  }[attributeType];
  return {
    transaction_id: newTransactionId(),
    txnstatus_request: {
      reference_id: newReferenceId(),
      txn_type: txnType,
      attribute_type: attributeType,
      attribute_value: attributeValue,
      locale: 'eng',
    },
  };
}

// ----- callback payloads (what an FR sends to an SP) -----
const correlationId = () => `FR-${randomUUID().slice(0, 8)}`;

export function searchResponseMessage(kind, records, { status = 'succ', reasonCode, transactionId = newTransactionId() } = {}) {
  return {
    transaction_id: transactionId,
    correlation_id: correlationId(),
    search_response: [{
      reference_id: newReferenceId(),
      timestamp: nowTs(),
      status,
      ...(reasonCode ? { status_reason_code: reasonCode, status_reason_message: 'Search could not be completed' } : {}),
      ...(status === 'rjct' ? {} : {
        data: { version: '1.0.0', reg_type: testData.regType, reg_record_type: regRecordType(kind), reg_records: records },
        pagination: { page_size: Math.max(records.length, 1), page_number: 1, total_count: records.length },
      }),
      locale: 'eng',
    }],
  };
}

export function subscribeResponseMessage(kind = 'farmer', { status = 'succ', reasonCode } = {}) {
  const item = subscribeItem(kind);
  return {
    transaction_id: newTransactionId(),
    correlation_id: correlationId(),
    subscribe_response: [{
      reference_id: item.reference_id,
      timestamp: nowTs(),
      status,
      ...(reasonCode ? { status_reason_code: reasonCode, status_reason_message: 'Subscription refused' } : {}),
      ...(status === 'succ' ? {
        subscriptions: [{
          version: '1.0.0',
          code: 'SUB-0001',
          status: 'subscribe',
          timestamp: nowTs(),
          ...item.subscribe_criteria,
          locale: 'eng',
        }],
      } : {}),
      locale: 'eng',
    }],
  };
}

export function unsubscribeResponseMessage({ status = 'succ', reasonCode } = {}) {
  return {
    transaction_id: newTransactionId(),
    correlation_id: correlationId(),
    timestamp: nowTs(),
    status,
    ...(reasonCode ? { status_reason_code: reasonCode, status_reason_message: 'Unsubscribe refused' } : {}),
    subscription_status: [{ code: 'SUB-0001', status: 'unsubscribe' }],
  };
}

export function txnStatusResponseMessage(txnType, kind, records) {
  const txnStatus = {
    search: () => searchResponseMessage(kind, records),
    subscribe: () => subscribeResponseMessage(kind),
    unsubscribe: () => unsubscribeResponseMessage(),
  }[txnType]();
  return {
    transaction_id: txnStatus.transaction_id,
    correlation_id: txnStatus.correlation_id,
    txnstatus_response: { txn_type: txnType, txn_status: txnStatus },
  };
}

export function notifyMessage(kind, records, eventType = 'register') {
  return {
    transaction_id: newTransactionId(),
    notify_event: [{
      reference_id: newReferenceId(),
      timestamp: nowTs(),
      data: {
        version: '1.0.0',
        reg_type: testData.regType,
        reg_event_type: eventType,
        reg_record_type: regRecordType(kind),
        reg_records: records,
      },
      locale: 'eng',
    }],
  };
}

export const encryptedMessage = () => ({
  header: { alg: 'RSA-OAEP-256', enc: 'A256GCM', kid: `${senderId}|key-1` },
  ciphertext: 'eyJ0cmFuc2FjdGlvbl9pZCI6IlRYTjEyMyJ9',
  encrypted_key: 'OKOawDo13gRp2ojaHV7LFpZcgV7T6DVZKTyKOMTYUmKoTCVJRgckCL9kiMT03JGeipsEdY3mx',
  tag: 'Mz-VPPyU4RlcuYv1IwIvzw',
  iv: '48V1_ALb6US04U3b',
});

// ----- path helpers ("message.search_request.0.locale") -----
const parsePath = (path) => path.split('.').map((p) => (/^\d+$/.test(p) ? Number(p) : p));

export function getPath(obj, path) {
  return parsePath(path).reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setPath(obj, path, value) {
  const keys = parsePath(path);
  let o = obj;
  keys.slice(0, -1).forEach((k, i) => {
    if (o[k] == null || typeof o[k] !== 'object') o[k] = typeof keys[i + 1] === 'number' ? [] : {};
    o = o[k];
  });
  o[keys.at(-1)] = value;
}

export function deletePath(obj, path) {
  const keys = parsePath(path);
  const parent = getPath(obj, keys.slice(0, -1).join('.')) ?? (keys.length === 1 ? obj : undefined);
  if (parent && typeof parent === 'object') {
    if (Array.isArray(parent)) parent.splice(keys.at(-1), 1);
    else delete parent[keys.at(-1)];
  }
}

// Every value found at a dotted path, flattening lists ("farm_details.land_size" on a farmer
// with two farms gives both sizes).
export function valuesAt(obj, path) {
  let current = [obj];
  for (const key of path.split('.')) {
    current = current.flatMap((o) => (Array.isArray(o) ? o : [o]))
      .map((o) => (o && typeof o === 'object' ? o[key] : undefined))
      .filter((v) => v !== undefined);
  }
  return current.flatMap((v) => (Array.isArray(v) ? v : [v]));
}

export const clone = (o) => structuredClone(o);
