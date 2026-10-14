// Validation of DCI FR payloads: JSON Schema (structure, types, formats, code lists)
// plus the semantic rules a schema cannot express (real calendar dates, chronology,
// consistency between attributes, request/response correlation).

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { schemas, strictSchemas, ISO_DATE_PATTERN, recordKind } from './schemas.js';
import { toCode } from './codes.js';
import { identifiersOf } from '../fixtures/records.js';

// STRICT_ATTRIBUTES=true also refuses attributes the FR data model does not define
// (catches misspelled attributes, at the cost of refusing registry extensions).
export const strictAttributes = /^(1|true|yes)$/i.test(process.env.STRICT_ATTRIBUTES || '');

const ajv = new Ajv({ allErrors: true, strict: false, verbose: true });
addFormats(ajv);

const compiled = {};
const compile = (name, set = schemas) => {
  const key = set === schemas ? name : `strict:${name}`;
  if (!set[name]) throw new Error(`Unknown schema "${name}". Known: ${Object.keys(set).join(', ')}`);
  compiled[key] ??= ajv.compile(set[name]);
  return compiled[key];
};

const formatAjvErrors = (errors = []) => {
  const kept = errors.filter((e) => !['anyOf', 'if', 'oneOf', 'allOf'].includes(e.keyword));
  // Alternatives (single value or list, object or list) produce a "must be <type>" error for
  // the branch that did not apply: drop it when a more specific error exists for that value.
  const specific = kept.filter((e) => !(e.keyword === 'type' && kept.some((o) => o !== e && o.keyword !== 'type'
    && (o.instancePath === e.instancePath || o.instancePath.startsWith(`${e.instancePath}/`)))));
  const seen = new Set();
  return specific
    .map((e) => {
      const where = e.instancePath || '(root)';
      const list = typeof e.parentSchema?.description === 'string' && e.parentSchema.description.startsWith('code:')
        ? e.parentSchema.description.slice(5) : undefined;
      if (list && e.keyword === 'pattern') return `${where} ${JSON.stringify(e.data)} is not a code or label of ${list}`;
      if (e.keyword === 'additionalProperties') return `${where} has an attribute the FR data model does not define: "${e.params.additionalProperty}"`;
      const extra = e.keyword === 'enum' ? ` ${JSON.stringify(e.params.allowedValues)}`
        : e.keyword === 'const' ? ` ${JSON.stringify(e.params.allowedValue)}` : '';
      return `${where} ${e.message}${extra}`;
    })
    .filter((m) => (seen.has(m) ? false : seen.add(m)));
};

export function validateSchema(name, data, { strict = false } = {}) {
  const validate = compile(name, strict ? strictSchemas : schemas);
  const valid = validate(data);
  return { valid, errors: valid ? [] : formatAjvErrors(validate.errors) };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const isoDateRe = new RegExp(ISO_DATE_PATTERN);

export function isRealDate(value) {
  if (typeof value !== 'string' || !isoDateRe.test(value)) return false;
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

// Calendar-day comparison so that "1980-03-23" and "1980-03-23T10:20:15Z" are the same day.
const day = (value) => value.slice(0, 10);
const present = (v) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
const asList = (v) => (Array.isArray(v) ? v : [v]).filter(present);
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const today = () => new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10); // 1 day clock-skew tolerance
const validDay = (v) => (typeof v === 'string' && isRealDate(v) ? day(v) : undefined);
const idKey = (i) => (isObject(i) && i.identifier_value !== undefined ? `${i.identifier_type}|${i.identifier_value}` : undefined);

const DATE_FIELDS = ['birth_date', 'date_of_birth', 'death_date', 'registration_date', 'last_updated'];

// 1. Every date sent anywhere in a record is a real calendar date, not in the future, and
//    in each object last_updated is not before registration_date.
function checkDates(node, where, errors) {
  if (Array.isArray(node)) {
    node.forEach((n, i) => checkDates(n, `${where}[${i}]`, errors));
    return;
  }
  if (!isObject(node)) return;
  for (const field of DATE_FIELDS) {
    const value = node[field];
    if (typeof value !== 'string' || value === '') continue; // type errors are reported by the schema
    if (!isRealDate(value)) errors.push(`${where}.${field} "${value}" is not a valid ISO 8601 calendar date`);
    else if (day(value) > today()) errors.push(`${where}.${field} "${value}" is in the future`);
  }
  const registration = validDay(node.registration_date);
  const lastUpdated = validDay(node.last_updated);
  if (registration && lastUpdated && lastUpdated < registration) {
    errors.push(`${where}.last_updated ${lastUpdated} is before registration_date ${registration}`);
  }
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'object') checkDates(value, `${where}.${key}`, errors);
  }
}

// Two spellings of the same attribute (model vs FR spec example) must not disagree.
function checkAlias(node, where, a, b, errors, normalise = (v) => v) {
  if (!isObject(node) || !present(node[a]) || !present(node[b])) return;
  if (JSON.stringify(normalise(node[a])) !== JSON.stringify(normalise(node[b]))) {
    errors.push(`${where}.${a} ${JSON.stringify(node[a])} and ${where}.${b} ${JSON.stringify(node[b])} disagree (two spellings of the same attribute)`);
  }
}

function checkDuplicateIds(list, where, errors) {
  const keys = asList(list).map(idKey).filter(Boolean);
  const duplicates = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (duplicates.length) errors.push(`${where} contains duplicate identifiers: ${[...new Set(duplicates)].join(', ')}`);
}

// Multi-valued code attributes must not repeat a value (a code and its label are the same value).
function checkDuplicateCodes(node, where, field, list, errors) {
  if (!isObject(node) || !Array.isArray(node[field])) return;
  const normalised = node[field].map((v) => toCode(list, v) ?? v);
  const duplicates = normalised.filter((v, i) => normalised.indexOf(v) !== i);
  if (duplicates.length) errors.push(`${where}.${field} repeats ${[...new Set(duplicates)].join(', ')}`);
}

// ---------------------------------------------------------------------------
// Data object rules
// ---------------------------------------------------------------------------
function personRules(p, where, errors) {
  if (!isObject(p)) return;
  checkAlias(p, where, 'sex', 'gender', errors, (v) => toCode('sex', v) ?? v);
  checkAlias(p, where, 'birth_date', 'date_of_birth', errors, (v) => (typeof v === 'string' ? day(v) : v));
  if (isObject(p.name)) {
    checkAlias(p.name, `${where}.name`, 'given_name', 'first_name', errors);
    checkAlias(p.name, `${where}.name`, 'surname', 'last_name', errors);
  }
  checkDuplicateIds([...asList(p.identifier), ...asList(p['spdci:identifier'])], `${where}.identifier`, errors);
  const birth = validDay(p.birth_date) ?? validDay(p.date_of_birth);
  const death = validDay(p.death_date);
  const registration = validDay(p.registration_date);
  if (birth && death && death < birth) errors.push(`${where}.death_date ${death} is before the birth date ${birth}`);
  if (birth && registration && registration < birth) errors.push(`${where}.registration_date ${registration} is before the birth date ${birth}`);
}

const birthOf = (person) => (isObject(person) ? validDay(person.birth_date) ?? validDay(person.date_of_birth) : undefined);

function memberRules(m, where, errors) {
  if (!isObject(m)) return;
  checkDuplicateIds(m.member_identifier, `${where}.member_identifier`, errors);
  personRules(m.demographic_info, `${where}.demographic_info`, errors);

  // A member declared as not disabled cannot carry disability details.
  if (m.is_disabled === false && Array.isArray(m.disability_info) && m.disability_info.length) {
    errors.push(`${where}.is_disabled is false but disability_info lists ${m.disability_info.length} disability(ies)`);
  }

  const birth = birthOf(m.demographic_info);
  const registration = validDay(m.registration_date);
  if (birth && registration && registration < birth) {
    errors.push(`${where}.registration_date ${registration} is before the member's birth date ${birth}`);
  }

  // Related persons are other persons (except relationship SELF).
  const own = new Set(identifiersOf(m, 'member').map(idKey).filter(Boolean));
  asList(m.related_person).forEach((r, i) => {
    if (!isObject(r)) return;
    personRules(r.related_member, `${where}.related_person[${i}].related_member`, errors);
    const self = toCode('relationshipType', r.relationship_type) === 'SELF';
    const theirs = identifiersOf(r.related_member, 'person').map(idKey).filter(Boolean);
    if (!self && theirs.some((k) => own.has(k))) {
      errors.push(`${where}.related_person[${i}] is the member themself (${theirs.find((k) => own.has(k))}) with relationship_type ${JSON.stringify(r.relationship_type)}`);
    }
  });
}

function groupRules(g, where, errors) {
  if (!isObject(g)) return;
  checkDuplicateIds(g.group_identifier, `${where}.group_identifier`, errors);
  memberRules(g.group_head_info, `${where}.group_head_info`, errors);
  asList(g.member_list).forEach((m, i) => memberRules(m, `${where}.member_list[${i}]`, errors));

  // Members are distinct persons; the head may or may not be repeated in member_list.
  const keyOf = (m) => identifiersOf(m, 'member').map(idKey).filter(Boolean)[0];
  const listKeys = asList(g.member_list).map(keyOf);
  const known = listKeys.filter(Boolean);
  const duplicates = known.filter((k, i) => known.indexOf(k) !== i);
  if (duplicates.length) errors.push(`${where}.member_list lists the same member more than once: ${[...new Set(duplicates)].join(', ')}`);

  const headKey = keyOf(g.group_head_info);
  const headListed = headKey && listKeys.includes(headKey);
  const disclosed = listKeys.length + (isObject(g.group_head_info) && !headListed ? 1 : 0);
  if (Number.isInteger(g.group_size) && disclosed > g.group_size) {
    errors.push(`${where}.group_size ${g.group_size} is smaller than the ${disclosed} distinct members disclosed (head and member_list)`);
  }
  if (toCode('groupType', g.group_type) === '1' && (disclosed > 1 || (Number.isInteger(g.group_size) && g.group_size > 1))) {
    errors.push(`${where}.group_type ${JSON.stringify(g.group_type)} (single member) but the group has more than one member`);
  }
  if (isObject(g.group_head_info?.demographic_info) && validDay(g.group_head_info.demographic_info.death_date)) {
    errors.push(`${where}.group_head_info is deceased (death_date ${g.group_head_info.demographic_info.death_date})`);
  }
}

function cropRules(c, where, errors) {
  if (!isObject(c)) return;
  checkAlias(c, where, 'crop_type', 'crop_type_name', errors, (v) => toCode('cropType', v) ?? v);
  if (c.irrigation === false && present(c.irrigation_water)) {
    errors.push(`${where}.irrigation is false but irrigation_water is given`);
  }
  checkDuplicateCodes(c, where, 'end_use', 'cropEndUse', errors);
  checkDuplicateCodes(c, where, 'irrigation_water', 'irrigationWater', errors);
  checkDuplicateCodes(c, where, 'fertilizer_type', 'fertilizerType', errors);
}

function activityRules(a, where, errors) {
  if (!isObject(a)) return;
  asList(a.crop_production).forEach((c, i) => cropRules(c, `${where}.crop_production[${i}]`, errors));
  checkAlias(a, where, 'aquaculture', 'aqua_culture', errors, (v) => asList(v).map((x) => toCode('aquaCulture', x) ?? x));
  const crops = Array.isArray(a.crop_production) ? a.crop_production.length : undefined;
  const animals = Array.isArray(a.animal_production) ? a.animal_production.length : undefined;
  // Mixed farming = crops AND animals (FarmingActivities.jsonld, group 015).
  if (a.mixed_farming === false && crops > 0 && animals > 0) {
    errors.push(`${where}.mixed_farming is false but both crop_production and animal_production are reported`);
  }
  if (a.mixed_farming === true && (crops === 0 || animals === 0)) {
    errors.push(`${where}.mixed_farming is true but ${crops === 0 ? 'crop_production' : 'animal_production'} is empty`);
  }
  for (const [field, list] of [['agri_support_activities', 'agriSupportActivity'], ['aquaculture', 'aquaCulture'],
    ['aqua_culture', 'aquaCulture'], ['aqua_support_activities', 'aquaSupportActivity'], ['agroforestry', 'forestActivity']]) {
    checkDuplicateCodes(a, where, field, list, errors);
  }
}

function farmRules(f, where, errors) {
  if (!isObject(f)) return;
  if (present(f.location) && present(f.place)) errors.push(`${where} gives both location and place (two spellings of the farm location)`);
  checkAlias(f, where, 'measurment', 'measurement', errors, (v) => toCode('measurementUnit', v) ?? v);
  // A land size is meaningless without its unit.
  if (present(f.land_size) && !present(f.measurment) && !present(f.measurement)) {
    errors.push(`${where}.land_size ${f.land_size} is given without a measurement unit (measurment)`);
  }
  if (Array.isArray(f.farming_activities)) f.farming_activities.forEach((a, i) => activityRules(a, `${where}.farming_activities[${i}]`, errors));
  else activityRules(f.farming_activities, `${where}.farming_activities`, errors);
}

function machineryRules(m, where, errors) {
  if (!isObject(m)) return;
  checkAlias(m, where, 'equipement_source', 'equipment_source', errors, (v) => toCode('equipmentSource', v) ?? v);
}

function farmerRules(f, where, errors) {
  if (!isObject(f)) return;
  if (present(f.farmer_personal_details) && present(f.famer_personal_details)) {
    errors.push(`${where} gives both farmer_personal_details and famer_personal_details (two spellings of the farmer)`);
  }
  const personal = f.farmer_personal_details ?? f.famer_personal_details;
  const personalKey = f.farmer_personal_details ? 'farmer_personal_details' : 'famer_personal_details';
  memberRules(personal, `${where}.${personalKey}`, errors);
  groupRules(f.family_details, `${where}.family_details`, errors);
  asList(f.farm_details).forEach((farm, i) => farmRules(farm, `${where}.farm_details[${i}]`, errors));
  asList(f.machineries_details).forEach((m, i) => machineryRules(m, `${where}.machineries_details[${i}]`, errors));

  const birth = birthOf(personal?.demographic_info);
  const registration = validDay(f.registration_date);
  if (birth && registration && registration < birth) {
    errors.push(`${where}.registration_date ${registration} is before the farmer's birth date ${birth}`);
  }
}

const kindRules = { farmer: farmerRules, person: personRules, member: memberRules, group: groupRules };

// Semantic rules for one record of the given kind (farmer, person, member, group).
export function checkRecordRules(kind, record, where = 'record') {
  if (!isObject(record)) return [`${where} must be an object`];
  const errors = [];
  checkDates(record, where, errors);
  kindRules[kind](record, where, errors);
  return errors;
}

// Schema + rules for one record.
export function validateRecord(kind, record, where = 'record', { strict = strictAttributes } = {}) {
  if (!kindRules[kind]) return [`${where}: unknown record kind "${kind}"`];
  const { errors } = validateSchema(kind, record, { strict });
  return [...errors.map((e) => where + e.replace(/^\(root\)/, '')), ...checkRecordRules(kind, record, where)];
}

const recordsOf = (regRecords) => {
  if (Array.isArray(regRecords)) return regRecords;
  if (regRecords && typeof regRecords === 'object') return [regRecords];
  return [];
};

// Extracts every record from any FR message (search, notify, txn status), with its kind
// (from data.reg_record_type; undefined when the record type is not one the FR standard defines).
export function extractRecords(message) {
  const out = [];
  const fromItems = (items, path) => (Array.isArray(items) ? items : []).forEach((item, i) => {
    const type = item?.data?.reg_record_type;
    recordsOf(item?.data?.reg_records).forEach((r, j) => out.push({
      record: r, kind: recordKind(type), regRecordType: type, where: `${path}[${i}].data.reg_records[${j}]`,
    }));
  });
  if (!message || typeof message !== 'object') return out;
  fromItems(message.search_response, 'message.search_response');
  fromItems(message.notify_event, 'message.notify_event');
  fromItems(message.txnstatus_response?.txn_status?.search_response, 'message.txnstatus_response.txn_status.search_response');
  return out;
}

// ---------------------------------------------------------------------------
// Message-level rules
// ---------------------------------------------------------------------------

// Rules on a callback header (sync responses and async callbacks).
export function checkCallbackHeaderRules(header) {
  const errors = [];
  if (!header) return errors;
  if (Number.isInteger(header.total_count) && Number.isInteger(header.completed_count) && header.completed_count > header.total_count) {
    errors.push(`header.completed_count ${header.completed_count} is greater than header.total_count ${header.total_count}`);
  }
  if (header.status === 'rjct' && !header.status_reason_code) {
    errors.push('header.status is "rjct" but no header.status_reason_code explains the rejection');
  }
  return errors;
}

// Rules on a search result item, optionally against the original search_request item.
export function checkSearchResponseItem(item, where, requestItem) {
  const errors = [];
  if (!item || typeof item !== 'object') return errors;
  if (item.status === 'succ' && !item.data) errors.push(`${where}.status is "succ" but no data is returned`);
  if (item.status === 'rjct' && !item.status_reason_code) errors.push(`${where}.status is "rjct" but no status_reason_code is given`);
  if (item.status === 'rjct' && item.data && recordsOf(item.data.reg_records).length) {
    errors.push(`${where}.status is "rjct" but records are returned`);
  }
  const count = recordsOf(item.data?.reg_records).length;
  const p = item.pagination;
  if (p && Number.isInteger(p.page_size) && count > p.page_size) {
    errors.push(`${where} returns ${count} records, more than pagination.page_size ${p.page_size}`);
  }
  if (p && Number.isInteger(p.total_count) && Number.isInteger(p.page_size) && Number.isInteger(p.page_number)
      && count > Math.max(0, p.total_count - (p.page_number - 1) * p.page_size)) {
    errors.push(`${where} returns ${count} records, more than pagination.total_count ${p.total_count} allows on page ${p.page_number}`);
  }
  const criteria = requestItem?.search_criteria;
  const requested = criteria?.pagination;
  if (requested && p) {
    if (Number.isInteger(requested.page_size) && p.page_size > requested.page_size) {
      errors.push(`${where}.pagination.page_size ${p.page_size} exceeds the requested page_size ${requested.page_size}`);
    }
    const askedPage = requested.page_number ?? 1;
    if (p.page_number !== askedPage) errors.push(`${where}.pagination.page_number ${p.page_number} is not the requested page ${askedPage}`);
  }
  // The records returned are of the kind asked for (Farmer, Person, Member or Group).
  if (criteria && item.data && count) {
    const asked = recordKind(criteria.reg_record_type);
    const got = recordKind(item.data.reg_record_type);
    if (asked && got && asked !== got) {
      errors.push(`${where}.data.reg_record_type ${JSON.stringify(item.data.reg_record_type)} is not the requested ${JSON.stringify(criteria.reg_record_type ?? 'Farmer (default)')}`);
    }
  }
  return errors;
}

// Correlates a SearchResponse with the SearchRequest it answers.
export function checkSearchCorrelation(requestMessage, responseMessage, where = 'message') {
  const errors = [];
  if (!requestMessage || !responseMessage) return errors;
  if (responseMessage.transaction_id !== requestMessage.transaction_id) {
    errors.push(`${where}.transaction_id "${responseMessage.transaction_id}" does not echo the request transaction_id "${requestMessage.transaction_id}"`);
  }
  const requestItems = requestMessage.search_request || [];
  const byRef = Object.fromEntries(requestItems.map((r) => [r.reference_id, r]));
  const items = responseMessage.search_response || [];
  items.forEach((item, i) => {
    if (!(item.reference_id in byRef)) errors.push(`${where}.search_response[${i}].reference_id "${item.reference_id}" was not part of the request`);
    errors.push(...checkSearchResponseItem(item, `${where}.search_response[${i}]`, byRef[item.reference_id]));
  });
  const answered = new Set(items.map((i) => i.reference_id));
  for (const r of requestItems) {
    if (!answered.has(r.reference_id)) errors.push(`${where}: request reference_id "${r.reference_id}" has no search_response`);
  }
  return errors;
}

function checkFrequency(frequency, where) {
  if (!frequency?.start_time || !frequency?.end_time) return [];
  const start = Date.parse(frequency.start_time);
  const end = Date.parse(frequency.end_time);
  return !Number.isNaN(start) && !Number.isNaN(end) && end < start
    ? [`${where}.end_time ${frequency.end_time} is before start_time ${frequency.start_time}`]
    : [];
}

// Full validation of a received message of the given kind. Returns a list of errors.
export function validateMessage(kind, body, request) {
  const errors = validateSchema(kind, body).errors.map((e) => `[schema] ${e}`);
  if (!body || typeof body !== 'object') return errors;

  const header = body.header;
  const message = body.message;
  const encrypted = header?.is_msg_encrypted === true;
  const isCallback = ['on-search', 'on-subscribe', 'notify', 'txn-on-status', 'sync-search-response', 'sync-txn-status-response'].includes(kind);

  if (isCallback) {
    errors.push(...checkCallbackHeaderRules(header).map((e) => `[rule] ${e}`));
    if (header?.status === 'succ' && !message) errors.push('[rule] header.status is "succ" but no message is returned');
  }
  if (encrypted || !message) return errors;

  if (['on-search', 'sync-search-response'].includes(kind)) {
    if (request?.message) errors.push(...checkSearchCorrelation(request.message, message).map((e) => `[rule] ${e}`));
    else (message.search_response || []).forEach((item, i) => errors.push(...checkSearchResponseItem(item, `message.search_response[${i}]`).map((e) => `[rule] ${e}`)));
  }
  if (['txn-on-status', 'sync-txn-status-response'].includes(kind)) {
    const r = message.txnstatus_response;
    if (request?.message && message.transaction_id !== request.message.transaction_id) {
      errors.push(`[rule] message.transaction_id "${message.transaction_id}" does not echo the request transaction_id "${request.message.transaction_id}"`);
    }
    const askedType = request?.message?.txnstatus_request?.txn_type;
    if (askedType && r?.txn_type && r.txn_type !== askedType) {
      errors.push(`[rule] txnstatus_response.txn_type "${r.txn_type}" does not match the requested txn_type "${askedType}"`);
    }
    (r?.txn_status?.search_response || []).forEach((item, i) => errors.push(...checkSearchResponseItem(item, `message.txnstatus_response.txn_status.search_response[${i}]`).map((e) => `[rule] ${e}`)));
  }
  if (['on-subscribe', 'on-unsubscribe'].includes(kind) && request?.message && message.transaction_id !== request.message.transaction_id) {
    errors.push(`[rule] message.transaction_id "${message.transaction_id}" does not echo the request transaction_id "${request.message.transaction_id}"`);
  }
  if (kind === 'on-subscribe') {
    (message.subscribe_response || []).forEach((item, i) => {
      if (item.status === 'rjct' && !item.status_reason_code) errors.push(`[rule] message.subscribe_response[${i}].status is "rjct" but no status_reason_code is given`);
      if (item.status === 'succ' && !(item.subscriptions || []).length) errors.push(`[rule] message.subscribe_response[${i}].status is "succ" but no subscription code is returned`);
      (item.subscriptions || []).forEach((s, j) => errors.push(...checkFrequency(s.frequency, `message.subscribe_response[${i}].subscriptions[${j}].frequency`).map((e) => `[rule] ${e}`)));
    });
  }
  if (kind === 'subscribe') {
    (message.subscribe_request || []).forEach((item, i) => errors.push(...checkFrequency(item?.subscribe_criteria?.frequency, `message.subscribe_request[${i}].subscribe_criteria.frequency`).map((e) => `[rule] ${e}`)));
  }
  if (kind === 'on-unsubscribe' && message.status === 'rjct' && !message.status_reason_code) {
    errors.push('[rule] message.status is "rjct" but no status_reason_code is given');
  }

  // Record data, wherever it appears.
  for (const { record, kind: recordKindName, where } of extractRecords(message)) {
    if (recordKindName) errors.push(...checkRecordRules(recordKindName, record, where).map((e) => `[data] ${e}`));
  }
  return errors;
}

export function formatErrors(errors) {
  return errors.map((e) => `  - ${e}`).join('\n');
}
