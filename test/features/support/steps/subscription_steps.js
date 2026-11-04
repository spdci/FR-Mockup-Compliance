import { Given, Then } from '@cucumber/cucumber';
import chai from 'chai';
import {
  subscribeItem, subscribeMessage, unsubscribeMessage, txnStatusMessage,
  searchResponseMessage, subscribeResponseMessage, unsubscribeResponseMessage,
  txnStatusResponseMessage, notifyMessage,
} from '../helpers/payloads.js';
import { recordFixture } from '../fixtures/records.js';
import { useRequest } from './common_steps.js';

const { expect } = chai;

const fixtures = (kind, list) => list.split(',').map((p) => recordFixture(kind, p.trim()));

// ---------------------------------------------------------------------------
// FR-side requests
// ---------------------------------------------------------------------------
Given('a subscribe request for new {string} registrations filtered by {string}', function (kind, filterType) {
  useRequest(this, subscribeMessage([subscribeItem(kind, filterType)]));
});

Given('a subscribe request for new registrations of the record kinds {string}', function (list) {
  useRequest(this, subscribeMessage(list.split(',').map((k) => subscribeItem(k.trim()))));
});

Given('a subscribe request for {string} events of {string} records', function (eventType, kind) {
  useRequest(this, subscribeMessage([subscribeItem(kind, 'idtype-value', eventType)]));
});

Given('an unsubscribe request for the subscription codes {string}', function (list) {
  useRequest(this, unsubscribeMessage(list.split(',').map((c) => c.trim())));
});

Given('a transaction status request for {string} transactions by {string}', function (txnType, attributeType) {
  useRequest(this, txnStatusMessage(txnType, attributeType));
});

Then('the transaction status should be reported for a {string} transaction', function (txnType) {
  const r = this.inspected.body?.message?.txnstatus_response;
  expect(r, 'message.txnstatus_response').to.exist;
  expect(r.txn_type, 'txnstatus_response.txn_type').to.equal(txnType);
  expect(r.txn_status, 'txnstatus_response.txn_status').to.exist;
});

Then('every subscription should be confirmed with a subscription code', function () {
  const items = this.inspected.body?.message?.subscribe_response || [];
  expect(items, 'subscribe_response').to.not.be.empty;
  items.forEach((item, i) => {
    expect(item.status, `subscribe_response[${i}].status`).to.equal('succ');
    expect(item.subscriptions, `subscribe_response[${i}].subscriptions`).to.not.be.empty;
    item.subscriptions.forEach((s, j) => expect(s.status, `subscriptions[${j}].status`).to.equal('subscribe'));
  });
});

Then('every subscription should keep the requested notify_record_type', function () {
  const asked = Object.fromEntries(this.request.message.subscribe_request.map((s) => [s.reference_id, s.subscribe_criteria.notify_record_type]));
  (this.inspected.body?.message?.subscribe_response || []).forEach((item, i) => {
    (item.subscriptions || []).forEach((s, j) => {
      if (s.notify_record_type !== undefined && asked[item.reference_id]) {
        expect(s.notify_record_type, `subscribe_response[${i}].subscriptions[${j}].notify_record_type`).to.equal(asked[item.reference_id]);
      }
    });
  });
});

Then('every subscription code should be reported as unsubscribed', function () {
  const message = this.inspected.body?.message;
  const asked = this.request.message.subscription_codes;
  expect(message.status, 'message.status').to.equal('succ');
  const reported = (message.subscription_status || []).filter((s) => s.status === 'unsubscribe').map((s) => s.code);
  expect(reported, 'unsubscribed codes').to.have.members(asked);
});

// ---------------------------------------------------------------------------
// SP-side callbacks (payloads an FR sends to an SP)
// ---------------------------------------------------------------------------
Given('an on-search callback carrying the {string} records {string}', function (kind, list) {
  useRequest(this, searchResponseMessage(kind, fixtures(kind, list)));
});

Given('an on-search callback rejected with reason code {string}', function (code) {
  useRequest(this, searchResponseMessage('farmer', [], { status: 'rjct', reasonCode: code }));
});

Given('an on-search callback with an empty {string} result', function (kind) {
  useRequest(this, searchResponseMessage(kind, []));
});

Given('an on-subscribe callback confirming the subscription to {string} records', function (kind) {
  useRequest(this, subscribeResponseMessage(kind));
});

Given('an on-subscribe callback rejected with reason code {string}', function (code) {
  useRequest(this, subscribeResponseMessage('farmer', { status: 'rjct', reasonCode: code }));
});

Given('an on-unsubscribe callback confirming the unsubscription', function () {
  useRequest(this, unsubscribeResponseMessage());
});

Given('an on-unsubscribe callback rejected with reason code {string}', function (code) {
  useRequest(this, unsubscribeResponseMessage({ status: 'rjct', reasonCode: code }));
});

Given('a txn on-status callback for a {string} transaction on {string} records', function (txnType, kind) {
  const profile = { farmer: 'full', person: 'full', member: 'full', group: 'family' }[kind];
  useRequest(this, txnStatusResponseMessage(txnType, kind, [recordFixture(kind, profile)]));
});

Given('a notify request carrying the {string} records {string}', function (kind, list) {
  useRequest(this, notifyMessage(kind, fixtures(kind, list)));
});

Given('a notify request with reg_event_type {string} carrying the {string} records {string}', function (eventType, kind, list) {
  useRequest(this, notifyMessage(kind, fixtures(kind, list), eventType));
});

Given('a notify request carrying the {string} record {string} as a single object', function (kind, name) {
  useRequest(this, notifyMessage(kind, recordFixture(kind, name)));
});
