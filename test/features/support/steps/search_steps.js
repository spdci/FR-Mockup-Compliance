import { Given, Then } from '@cucumber/cucumber';
import chai from 'chai';
import {
  searchItem, searchMessage, idTypeValueQuery, predicateQuery, expressionQuery, graphqlQuery, consent,
  predicates, valuesAt,
} from '../helpers/payloads.js';
import { codes, recordKind } from '../helpers/schemas.js';
import { toCode } from '../helpers/codes.js';
import { identifiersOf } from '../fixtures/records.js';
import { useRequest } from './common_steps.js';

const { expect } = chai;

const KINDS = ['farmer', 'person', 'member', 'group'];
const checkKind = (kind) => {
  if (!KINDS.includes(kind)) throw new Error(`Unknown record kind "${kind}". Known: ${KINDS.join(', ')}`);
  return kind;
};

const items = (world) => world.request.message.search_request;
const results = (world) => {
  const message = world.inspected.body?.message;
  return message?.search_response || message?.txnstatus_response?.txn_status?.search_response || [];
};
const recordsOf = (item) => {
  const r = item?.data?.reg_records;
  return Array.isArray(r) ? r : r ? [r] : [];
};
const idKeys = (record, kind) => identifiersOf(record, kind).map((id) => `${id.identifier_type}|${id.identifier_value}`);

// ---------------------------------------------------------------------------
// Building search requests
// ---------------------------------------------------------------------------
Given('a {string} search by identifier for the {string} test record', function (kind, name) {
  this.kind = checkKind(kind);
  useRequest(this, searchMessage([searchItem(kind, idTypeValueQuery(kind, name))]));
});

// reg_record_type is optional in search_criteria: the FR then answers with Farmer records.
Given('a search without reg_record_type by identifier for the {string} test farmer', function (name) {
  this.kind = 'farmer';
  useRequest(this, searchMessage([searchItem(undefined, idTypeValueQuery('farmer', name))]));
});

Given('the search asks for the record type {string}', function (type) {
  items(this).forEach((i) => { i.search_criteria.reg_record_type = type; });
});

Given('a batch {string} search for the test records {string}', function (kind, list) {
  this.kind = checkKind(kind);
  const names = list.split(',').map((p) => p.trim());
  useRequest(this, searchMessage(names.map((n) => searchItem(kind, idTypeValueQuery(kind, n)))));
});

// "farmer:full, person:child, group:family" - one search item per kind:record.
Given('a batch search mixing the test records {string}', function (list) {
  const pairs = list.split(',').map((p) => p.trim().split(':').map((s) => s.trim()));
  useRequest(this, searchMessage(pairs.map(([kind, name]) => searchItem(checkKind(kind), idTypeValueQuery(kind, name)))));
});

Given('a {string} predicate search', function (kind) {
  this.kind = checkKind(kind);
  this.predicate = predicates[kind];
  useRequest(this, searchMessage([searchItem(kind, predicateQuery(this.predicate))]));
});

Given('a {string} expression search', function (kind) {
  this.kind = checkKind(kind);
  useRequest(this, searchMessage([searchItem(kind, expressionQuery(kind))]));
});

Given('a {string} graphql search', function (kind) {
  this.kind = checkKind(kind);
  useRequest(this, searchMessage([searchItem(kind, graphqlQuery(kind))]));
});

Given('the search requests page {int} with page_size {int}', function (page, size) {
  items(this).forEach((i) => { i.search_criteria.pagination = { page_size: size, page_number: page }; });
});

Given('the search results are sorted by {string} in {string} order', function (attribute, order) {
  items(this).forEach((i) => { i.search_criteria.sort = [{ attribute_name: attribute, sort_order: order }]; });
});

Given('the search request asks for locale {string}', function (locale) {
  items(this).forEach((i) => { i.locale = locale; });
});

Given('the search request carries consent and authorize information', function () {
  items(this).forEach((i) => {
    i.search_criteria.consent = consent('Consent');
    i.search_criteria.authorize = consent('Authorize');
  });
});

// ---------------------------------------------------------------------------
// Functional checks on search results (response of sync search, on-search callback,
// txn status of a search)
// ---------------------------------------------------------------------------
Then('every search result should have status {string}', function (status) {
  const r = results(this);
  expect(r, 'search_response').to.not.be.empty;
  r.forEach((item, i) => expect(item.status, `search_response[${i}].status`).to.equal(status));
});

Then('every search result should carry {string} records', function (kind) {
  const r = results(this);
  expect(r, 'search_response').to.not.be.empty;
  r.forEach((item, i) => {
    expect(item.data, `search_response[${i}].data`).to.exist;
    expect(recordKind(item.data.reg_record_type), `search_response[${i}].data.reg_record_type ${JSON.stringify(item.data.reg_record_type)}`).to.equal(checkKind(kind));
  });
});

Then('the result should contain the record identified by the query', function () {
  const r = results(this);
  items(this).forEach((requestItem) => {
    const { type, value } = requestItem.search_criteria.query;
    const kind = recordKind(requestItem.search_criteria.reg_record_type);
    const item = r.find((x) => x.reference_id === requestItem.reference_id);
    expect(item, `result for reference_id ${requestItem.reference_id}`).to.exist;
    const records = recordsOf(item);
    expect(records, `${kind} records for ${type} ${value}`).to.not.be.empty;
    records.forEach((record, j) => {
      expect(idKeys(record, kind), `reg_records[${j}] (${kind}) does not carry the queried identifier ${type} ${value}`).to.include(`${type}|${value}`);
    });
  });
});

// Coded attributes are compared on their code, so "Household" satisfies group_type eq "2".
const codedAttributes = {
  farm_type: 'farmType', land_tenure: 'landTenure', sex: 'sex', gender: 'sex',
  marital_status: 'maritalStatus', group_type: 'groupType',
};

function satisfies(actual, op, expected, attribute) {
  const list = codedAttributes[attribute.split('.').at(-1)];
  const norm = (v) => {
    if (list && typeof v === 'string') return toCode(list, v) ?? v.toLowerCase();
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
    return v;
  };
  const a = norm(actual);
  const e = Array.isArray(expected) ? expected.map(norm) : norm(expected);
  switch (op) {
    case 'eq': return a === e;
    case 'gt': return a > e;
    case 'lt': return a < e;
    case 'ge': return a >= e;
    case 'le': return a <= e;
    case 'in': return Array.isArray(e) ? e.includes(a) : String(e).split(',').includes(a);
    default: return true;
  }
}

Then('every returned record should satisfy the predicate', function () {
  results(this).flatMap(recordsOf).forEach((record, j) => {
    for (const { attribute_name: name, operator, attribute_value: value } of this.predicate) {
      const values = valuesAt(record, name);
      if (!values.length) continue; // optional attribute not disclosed
      expect(values.some((v) => satisfies(v, operator, value, name)),
        `reg_records[${j}].${name} = ${JSON.stringify(values)} does not satisfy "${operator} ${JSON.stringify(value)}"`).to.be.true;
    }
  });
});

Then('the returned records should be sorted by {string} in {string} order', function (attribute, order) {
  results(this).forEach((item, i) => {
    const values = recordsOf(item).map((r) => valuesAt(r, attribute)[0]).filter((v) => v !== undefined)
      .map((v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : v));
    const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    if (order === 'desc') sorted.reverse();
    expect(values, `search_response[${i}] ${attribute} order`).to.deep.equal(sorted);
  });
});

Then('the search result pagination should report page {int} with at most {int} record(s) per page', function (page, size) {
  results(this).forEach((item, i) => {
    expect(item.pagination, `search_response[${i}].pagination`).to.exist;
    expect(item.pagination.page_number, `search_response[${i}].pagination.page_number`).to.equal(page);
    expect(item.pagination.page_size, `search_response[${i}].pagination.page_size`).to.be.at.most(size);
    expect(recordsOf(item).length, `search_response[${i}] record count`).to.be.at.most(size);
  });
});

Then('every requested locale should be honoured', function () {
  const asked = Object.fromEntries(items(this).map((i) => [i.reference_id, i.locale]));
  results(this).forEach((item, i) => {
    if (item.locale !== undefined && asked[item.reference_id]) {
      expect(item.locale, `search_response[${i}].locale`).to.equal(asked[item.reference_id]);
    }
  });
});

Then('the search result should be empty or rejected with a valid reason code', function () {
  const r = results(this);
  expect(r, 'search_response').to.not.be.empty;
  r.forEach((item, i) => {
    if (item.status === 'rjct') {
      expect(codes.searchStatusReasonCode, `search_response[${i}].status_reason_code`).to.include(item.status_reason_code);
    } else {
      expect(recordsOf(item), `search_response[${i}] records for an unknown identifier`).to.be.empty;
      if (item.pagination) expect(item.pagination.total_count, `search_response[${i}].pagination.total_count`).to.equal(0);
    }
  });
});

Then('the search result should be rejected with reason code {string}', function (code) {
  const r = results(this);
  expect(r, 'search_response').to.not.be.empty;
  r.forEach((item, i) => {
    expect(item.status, `search_response[${i}].status`).to.equal('rjct');
    expect(item.status_reason_code, `search_response[${i}].status_reason_code`).to.equal(code);
  });
});

Then('each batch item should be answered with its own result', function () {
  const r = results(this);
  const refs = items(this).map((i) => i.reference_id);
  expect(r.map((x) => x.reference_id).sort(), 'answered reference_ids').to.deep.equal([...refs].sort());
  items(this).forEach((requestItem) => {
    const item = r.find((x) => x.reference_id === requestItem.reference_id);
    const kind = recordKind(requestItem.search_criteria.reg_record_type);
    const { type, value } = requestItem.search_criteria.query;
    if (recordsOf(item).length) {
      expect(recordKind(item.data?.reg_record_type), `batch result ${item.reference_id} record type`).to.equal(kind);
    }
    recordsOf(item).forEach((record) => {
      expect(idKeys(record, kind), `batch result ${item.reference_id} returned a ${kind} record that does not match ${type} ${value}`).to.include(`${type}|${value}`);
    });
  });
});
