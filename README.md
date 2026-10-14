# FR Registry Compliance and Mockup

Compliance test suite and mock API for the **DCI Farmer Registry (FR) API v1.0.0**
([`fr_api_v1.0.0.yaml`](https://github.com/spdci/api-standards), Farmer data model and
code lists from [`spdci/schemas`](https://github.com/spdci/schemas) `extensions/fr/v1` and `core/v1`).

## What is covered

All 11 endpoints of the standard, split by the system that exposes them:

| Side | Endpoint (mock path) | Spec path | Mock behaviour |
|---|---|---|---|
| FR | `fr/sync/search` | `/registry/sync/search` | Search results (header `on-search` + SearchResponse) |
| FR | `fr/search` | `/registry/search` | ACK, then `on-search` callback to `header.sender_uri` |
| FR | `fr/subscribe` | `/registry/subscribe` | ACK, then `on-subscribe` callback |
| FR | `fr/unsubscribe` | `/registry/unsubscribe` | ACK, then `on-unsubscribe` callback |
| FR | `fr/txn/status` | `/registry/txn/status` | ACK, then `txn/on-status` callback |
| FR | `fr/sync/txn/status` | `/registry/sync/txn/status` | Transaction status (header `txn-on-status` + TxnStatusResponse) |
| SP | `fr/on-search` | `/registry/on-search` | ACK |
| SP | `fr/on-subscribe` | `/registry/on-subscribe` | ACK |
| SP | `fr/on-unsubscribe` | `/registry/on-unsubscribe` | ACK |
| SP | `fr/txn/on-status` | `/registry/txn/on-status` | ACK |
| SP | `fr/notify` | `/registry/notify` | ACK |

Every mock endpoint validates the request against the spec schema and answers an `ERR`
acknowledgement (`err.request.bad`, HTTP 400) when it does not conform.

### Four kinds of search

The FR answers four kinds of searches, selected by `search_criteria.reg_record_type`:

| Search | Records returned | Default record type | Also recognised |
|---|---|---|---|
| Farmer (default when `reg_record_type` is absent) | Farmer: personal details, family, farms, activities, machinery | `spdci-extensions-dci:Farmer` | `FarmerRecord`, `FRFarmer`, `Farmer_Person` |
| Person | FRPerson (core Person) | `spdci-extensions-dci:Person` | `FRPerson`, `FR_Person` |
| Member | Member (identifiers, demographics, disability, marital status, ...) | `spdci-extensions-dci:Member` | `FRMember` |
| Group | Group (household/family, head, members, poverty score, ...) | `spdci-extensions-dci:Group` | `FRGroup` |

Record type names are implementation-defined, so every spelling is accepted bare or namespaced and
case-insensitively. An unknown record type is answered with `rjct.search_criteria.invalid`.

The test suite (`test/features`, 765 scenarios) checks, per endpoint:

- **smoke**: status, JSON content type, response time, response schema;
- **functional**: farmer, person, member and group searches by identifier, predicate, expression
  and graphql, batch requests (including batches mixing record kinds), pagination, sorting, locale,
  consent/authorize, not-found and rejected results, every status reason code, every txn type and
  attribute type, subscriptions per record kind;
- **callback**: the full async round trip. The suite starts a listener, sends it as
  `header.sender_uri`, and validates the callback the FR sends back;
- **negative**: requests that break the spec must be refused using one of the spec's error forms
  (`ERR` ack, HttpErrorResponse, or a `rjct` status with a reason code);
- **data** (`fr_record_data.feature`, offline): the FR data rules.

### FR data rules

Almost every FR attribute is optional, so a record may disclose only an identifier. But whenever an
attribute **is** sent it must be correct. Every farmer, person, member and group record returned or
sent by any endpoint is checked against these rules:

| Object | Rule when present |
|---|---|
| Coded attributes | A code **or** a label of the list, case-insensitive (`"3"` or `"Fruit and nuts"`). Lists: FarmType, LandTenure, MeasurmentUnit, CropActivity, CropType, CropEnduse, IrrigationWater, FertilizerType, Animals, LivestockSystem, AgriSupportActivity, AquaCulture, AquaSupportActivity, ForestActivity, Machineries, EquipmentSource, Sex, MaritalStatus, AssistanceUnit, RelationshipType, EmploymentStatus, Occupation, Education, FunctionalLimitationType, FunctionalSeverity. Multi-valued attributes must not repeat a value |
| Identifier | `identifier_type` is a code-like token (country-defined: UIN, NationalID, FRN, ...); `identifier_value` is a non-empty string; a list is non-empty and has no duplicates |
| Person | `name` has at least one name part; `phone_number` E.164; `email` RFC 5322; `address` object or list, `country_code` ISO 3166, plus code format; death ≥ birth; registration ≥ birth |
| Member | `is_disabled` boolean, and `false` excludes `disability_info`; `language_code` ISO 639; registration ≥ birth; a related person is not the member themself (unless `SELF`) |
| Group | `group_size` integer ≥ 1 and not smaller than the distinct members disclosed (head + `member_list`); no member listed twice; group type `1` (single member) has one member; the head is not deceased; `poverty_score` ≥ 0 |
| Farm | `land_size` > 0 and given with a measurement unit; `geo` latitude in [-90, 90], longitude in [-180, 180] |
| Farming activities | `mixed_farming` agrees with the crops and animals reported; a crop with `irrigation: false` has no `irrigation_water`; animal and machinery `count` integers ≥ 0 |
| Dates | ISO 8601 date or date-time, real calendar date, not in the future; in every object `last_updated` ≥ `registration_date`; the farmer is registered after birth |
| Spellings | Both spellings of an attribute (see below) may be sent, but they must not disagree |

Registry-specific extension attributes are allowed. Set `STRICT_ATTRIBUTES=true` to refuse
attributes the FR data model does not define (catches misspelled attributes).

The rules live in `test/features/support/helpers/schemas.js` (JSON Schema),
`helpers/codes.js` (code lists generated from the JSON-LD files) and `helpers/validator.js`
(cross-field rules). `fr_record_data.feature` proves each rule: it accepts each attribute when
absent, accepts correct values and rejects incorrect ones.

### Where the spec is ambiguous

The FR OpenAPI example and the FR data model use different spellings; the suite accepts both:

| Data model | FR spec example |
|---|---|
| `farmer_personal_details` | `famer_personal_details` |
| `given_name` / `surname` | `first_name` / `last_name` |
| `sex`, `birth_date`, `identifier` | `gender`, `date_of_birth`, `spdci:identifier` |
| identifier list | single identifier object |
| FarmInfo `location`, `measurment` | `place`, `measurement` |
| `farming_activities` object | list of farming activities |
| `crop_type_name`, `aquaculture` | `crop_type`, `aqua_culture` |
| `equipement_source` (sic, as in the example) | `equipment_source` |
| `reg_records` array (search) | single object (notify, txn status) |
| `reg_event_type` `register` | namespaced `spdci-common:RegistryEventType:Register` |

Issues found in the published material:

- The FR spec example sends two values that are in no FR code list: `aqua_culture`
  `"Marine aquafarming"` (AquaCultureEnum has `"Marine aquaculture"`) and machinery type
  `"Machine powered equipment"` (not in MachineriesEnum). The suite reports both
  (`fr_record_data.feature`) and the mock serves a corrected copy.
- `LandTenureEnum` declares code `1` twice and `EquipmentSource` code `4` twice; both labels are accepted.
- The FR sample process flows (`release/sample-jsons/.../fr`) were copied from the DR flows
  (`reg_type` DR, `reg_records` given as a schema); they are not used as a reference.
- In the FR API `on-subscribe` carries a callback header (with `status`) while `on-unsubscribe`
  carries a request header; the suite follows the spec.

## Prerequisites

Docker and Docker Compose. To run without Docker you need Node.js 18 or later.

## Run the mocks

```bash
./test_entrypoint.sh
```

The FR endpoints are served on port **3333** and the SP endpoints on port **3334**. Run
`GET /healthcheck` on either port to check they are up.

The mocks are generated from the test suite's schemas and record fixtures, so the two always
agree. After changing `schemas.js`, `codes.js` or `fixtures/records.js`, regenerate them and rebuild:

```bash
node mock/generate-mocks.mjs
```

The generated `mockoon-fr.json` and `mockoon-sp.json` can be opened in the Mockoon desktop
app (v9 or later).

Mock test data. The mock FR knows these records:

| Kind | Profile | Identifier |
|---|---|---|
| farmer | full (every attribute, codes) | FRN `FR-0001` (or UIN `810000002`) |
| farmer | crop (labels and spec example spellings) | FRN `FR-0002` |
| farmer | livestock (large holding, disabled farmer) | FRN `FR-0003` |
| farmer | widow (aquaculture, agroforestry, inherited land) | FRN `FR-0004` |
| farmer | minimal (identifier only) | FRN `FR-0009` |
| farmer | spec example (corrected) | NationalID `M123456` |
| person / member | full, male, child, deceased, widow, labels, minimal | UIN `810000001`, `810000002`, `810000003`, `810000004` (person), `840000001`, `830000001`, `890000009` |
| member | disabled | UIN `820000001` |
| group | family, household, widow, individual, minimal | GID `G-0001`, `G-0002`, `G-0003`, `G-0004`, `G-0009` |
| group | the household of a member | the member's UIN, e.g. `810000003` |

`TOOMANY000` is rejected with `rjct.search.too_many_records_found`. Any other identifier
returns an empty result.

## Run the compliance tests

With Docker:

```bash
cd test && ./test_entrypoint.sh
```

Without Docker:

```bash
cd test && npm install && npx cucumber-js
```

Reports are written to `test/result` (HTML, JUnit XML, Cucumber messages).

### Testing your own implementation

| Variable | Default | Purpose |
|---|---|---|
| `FR_BASE_URL` | `http://127.0.0.1:3333/` | FR under test (search, subscribe, txn status, ...) |
| `SP_BASE_URL` | `http://127.0.0.1:3334/` | SP under test (on-search, notify, ...) |
| `CALLBACK_PORT` / `CALLBACK_BASE_URL` | `3335` / `http://127.0.0.1:3335/` | Listener used as `header.sender_uri`; must be reachable from the FR under test |
| `TEST_DATA_FILE` | none | JSON overriding the identifiers searched and the record type names (see `helpers/testdata.js`) |
| `STRICT_ATTRIBUTES` | `false` | Refuse attributes the FR data model does not define |
| `AUTH_TOKEN` | none | Sent as `Authorization: Bearer <token>` |
| `RESPONSE_TIMEOUT_MS` / `CALLBACK_TIMEOUT_MS` | `15000` / `10000` | Timeouts |
| `CUCUMBER_TAGS` (Docker only) | none | Tag expression to select scenarios |

Endpoint paths are listed in `test/features/support/helpers/helpers.js`.

Select scenarios with tags:

| Tag | Scenarios |
|---|---|
| `@smoke` | basic checks for each endpoint |
| `@functional` | use cases |
| `@callback` | async round trips (need the listener to be reachable) |
| `@negative` | invalid requests |
| `@data` | offline FR data rules |
| `@strict-data` | SP must reject callbacks with invalid record data |
| `@mock` | relies on mock-only test data or behaviour |

For example, to test a real FR:

```bash
FR_BASE_URL=https://fr.example.org/ TEST_DATA_FILE=./my-data.json npx cucumber-js --tags "not @mock"
```
