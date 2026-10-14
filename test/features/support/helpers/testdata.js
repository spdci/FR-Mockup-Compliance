// Identifiers and record types the suite searches for. The defaults match the records served by
// the mock FR. To run against a real FR, point TEST_DATA_FILE at a JSON file overriding any entry, e.g.
//   { "records": { "farmer": { "full": { "identifier_type": "FRN", "identifier_value": "123" } } },
//     "regRecordTypes": { "farmer": "FarmerRecord" } }

import { readFileSync } from 'node:fs';

const defaults = {
  records: {
    farmer: {
      full: { identifier_type: 'FRN', identifier_value: 'FR-0001' },
      crop: { identifier_type: 'FRN', identifier_value: 'FR-0002' },
      livestock: { identifier_type: 'FRN', identifier_value: 'FR-0003' },
      widow: { identifier_type: 'FRN', identifier_value: 'FR-0004' },
      minimal: { identifier_type: 'FRN', identifier_value: 'FR-0009' },
      // A farmer found by their national identity number instead of the farmer number.
      'by national id': { identifier_type: 'UIN', identifier_value: '810000002' },
      // The FR spec example farmer (served with its code list values corrected).
      'spec example': { identifier_type: 'NationalID', identifier_value: 'M123456' },
    },
    person: {
      full: { identifier_type: 'UIN', identifier_value: '810000001' },
      male: { identifier_type: 'UIN', identifier_value: '810000002' },
      child: { identifier_type: 'UIN', identifier_value: '810000003' },
      deceased: { identifier_type: 'UIN', identifier_value: '810000004' },
      widow: { identifier_type: 'UIN', identifier_value: '840000001' },
      labels: { identifier_type: 'UIN', identifier_value: '830000001' },
      minimal: { identifier_type: 'UIN', identifier_value: '890000009' },
    },
    member: {
      full: { identifier_type: 'UIN', identifier_value: '810000001' },
      male: { identifier_type: 'UIN', identifier_value: '810000002' },
      child: { identifier_type: 'UIN', identifier_value: '810000003' },
      disabled: { identifier_type: 'UIN', identifier_value: '820000001' },
      widow: { identifier_type: 'UIN', identifier_value: '840000001' },
      labels: { identifier_type: 'UIN', identifier_value: '830000001' },
      minimal: { identifier_type: 'UIN', identifier_value: '890000009' },
    },
    group: {
      family: { identifier_type: 'GID', identifier_value: 'G-0001' },
      household: { identifier_type: 'GID', identifier_value: 'G-0002' },
      widow: { identifier_type: 'GID', identifier_value: 'G-0003' },
      individual: { identifier_type: 'GID', identifier_value: 'G-0004' },
      minimal: { identifier_type: 'GID', identifier_value: 'G-0009' },
      // The household a person belongs to, found by the identifier of one of its members.
      'by member id': { identifier_type: 'UIN', identifier_value: '810000003' },
    },
  },
  unknown: { identifier_type: 'UIN', identifier_value: '999999999' },
  // The mock rejects this value with rjct.search.too_many_records_found.
  tooMany: { identifier_type: 'UIN', identifier_value: 'TOOMANY000' },
  regType: 'ns:org:RegistryType:FR',
  regRecordTypes: {
    farmer: 'spdci-extensions-dci:Farmer',
    person: 'spdci-extensions-dci:Person',
    member: 'spdci-extensions-dci:Member',
    group: 'spdci-extensions-dci:Group',
  },
};

const overrides = process.env.TEST_DATA_FILE ? JSON.parse(readFileSync(process.env.TEST_DATA_FILE, 'utf8')) : {};

export const testData = {
  ...defaults,
  ...overrides,
  records: Object.fromEntries(Object.keys(defaults.records).map((kind) => [
    kind, { ...defaults.records[kind], ...(overrides.records?.[kind] || {}) },
  ])),
  regRecordTypes: { ...defaults.regRecordTypes, ...(overrides.regRecordTypes || {}) },
};

// Identifier of a test record. "unknown" and "too many" exist for every kind.
export function testRecord(kind, name) {
  if (name === 'unknown') return testData.unknown;
  if (name === 'too many') return testData.tooMany;
  const byKind = testData.records[kind];
  if (!byKind) throw new Error(`Unknown record kind "${kind}". Known: ${Object.keys(testData.records).join(', ')}`);
  if (!byKind[name]) throw new Error(`Unknown ${kind} test record "${name}". Known: ${Object.keys(byKind).join(', ')}, unknown, too many`);
  return byKind[name];
}

export function regRecordType(kind) {
  const type = testData.regRecordTypes[kind];
  if (!type) throw new Error(`Unknown record kind "${kind}". Known: ${Object.keys(testData.regRecordTypes).join(', ')}`);
  return type;
}
