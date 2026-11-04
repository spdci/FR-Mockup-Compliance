// Farmer registry records covering every data profile of the standard, for the four kinds of
// records an FR serves: Farmer, Person (FRPerson), Member and Group. They range from a record
// carrying only an identifier up to records carrying every optional attribute, sent either as
// codes or as labels, and every attribute spelling used by the FR spec example.
//
// They are used by the tests (payloads sent to SP endpoints, reference records for the data
// rules) and by mock/generate-mocks.mjs (records returned by the mock FR), so the mock and the
// tests always agree on the data.

const context = {
  '@vocab': 'https://schema.spdci.org/extensions/fr/v1/data',
  spdcicore: 'https://schema.spdci.org/core/v1/data',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
};

const id = (identifier_type, identifier_value) => ({ '@type': 'Identifier', identifier_type, identifier_value });
const geo = (latitude, longitude) => ({ '@type': 'GeoCoordinates', latitude, longitude });
const clone = (o) => structuredClone(o);

// ---------------------------------------------------------------------------
// Persons (FRPerson = core Person)
// ---------------------------------------------------------------------------
const kindiaAddress = {
  '@type': 'Address',
  address_line_1: 'Quartier Hamdallaye',
  address_line_2: 'Rue KA-012',
  locality: 'Kindia',
  sub_region_code: 'KD-01',
  region_code: 'KD',
  postal_code: '1001',
  country_code: 'GN',
  geo_location: {
    '@type': 'GeoLocation',
    plus_code: {
      global_code: '7C9RRR2G+2V',
      geometry: {
        bounds: { northeast: geo(10.051, -12.862), southwest: geo(10.05, -12.863) },
        location: geo(10.0505, -12.8625),
      },
    },
  },
};

const persons = {
  amina: {
    '@context': context,
    '@id': 'FRPerson_810000001',
    '@type': 'FRPerson',
    identifier: [id('UIN', '810000001'), id('NationalID', 'NID-1985-0412')],
    name: { '@type': 'Name', surname: 'Diallo', given_name: 'Amina', second_name: 'Mariam', maiden_name: 'Barry', prefix: 'Mrs', suffix: '' },
    sex: 'female',
    birth_date: '1985-04-12',
    address: [kindiaAddress],
    phone_number: ['+224622000001'],
    email: ['amina.diallo@example.org'],
    registration_date: '2019-03-01T09:00:00Z',
    last_updated: '2024-05-10T14:30:00Z',
  },
  moussa: {
    '@type': 'FRPerson',
    identifier: [id('UIN', '810000002'), id('NationalID', 'NID-1980-1102')],
    name: { surname: 'Diallo', given_name: 'Moussa' },
    sex: 'male',
    birth_date: '1980-11-02',
    address: [kindiaAddress],
    phone_number: ['+224622000002'],
    registration_date: '2019-02-20T09:00:00Z',
    last_updated: '2024-05-10T14:30:00Z',
  },
  fatou: {
    identifier: [id('UIN', '810000003')],
    name: { surname: 'Diallo', given_name: 'Fatou' },
    sex: 'female',
    birth_date: '2010-07-21',
    registration_date: '2019-03-01T09:00:00Z',
  },
  ibrahim: {
    identifier: [id('UIN', '810000004')],
    name: { surname: 'Camara', given_name: 'Ibrahim' },
    sex: 'male',
    birth_date: '1950-01-30',
    death_date: '2023-01-15',
    registration_date: '2015-06-01',
    last_updated: '2023-02-01',
  },
  kofi: {
    identifier: [id('UIN', '820000001')],
    name: { surname: 'Mensah', given_name: 'Kofi', prefix: 'Mr' },
    sex: 'male',
    birth_date: '1975-09-09',
    phone_number: ['+233244000001'],
    registration_date: '2020-02-14',
    last_updated: '2024-08-01',
  },
  grace: {
    identifier: [id('UIN', '830000001')],
    name: { surname: 'Kamara', given_name: 'Grace' },
    // Label spelling of SexCategoryEnum
    sex: 'Female',
    birth_date: '1992-12-03T00:00:00Z',
    email: ['grace.kamara@example.org'],
    registration_date: '2021-04-20',
    last_updated: '2024-03-02',
  },
  awa: {
    identifier: [id('UIN', '840000001')],
    name: { surname: 'Camara', given_name: 'Awa' },
    sex: 'female',
    birth_date: '1968-06-15',
    registration_date: '2018-09-10',
    last_updated: '2023-02-01',
  },
  minimal: {
    identifier: [id('UIN', '890000009')],
  },
};

// Short reference to a person, as used in related_person.
const ref = (person) => ({ identifier: clone(person.identifier.slice(0, 1)), name: clone(person.name) });

// ---------------------------------------------------------------------------
// Members (core Member, demographic_info = FRPerson)
// ---------------------------------------------------------------------------
const members = {
  amina: {
    '@type': 'Member',
    member_identifier: [id('UIN', '810000001')],
    demographic_info: clone(persons.amina),
    related_person: [
      { relationship_type: 'HUSB', related_member: ref(persons.moussa) },
      { relationship_type: 'DAU', related_member: ref(persons.fatou) },
    ],
    is_disabled: false,
    marital_status: 'M',
    employment_status: '6',
    occupation: '6',
    income_level: '1',
    language_code: 'en',
    education_level: '2',
    additional_attributes: [{ name: 'cooperative_member', value: 'yes' }],
    registration_date: '2019-03-01T09:00:00Z',
    last_updated: '2024-05-10T14:30:00Z',
  },
  moussa: {
    '@type': 'Member',
    member_identifier: [id('UIN', '810000002')],
    demographic_info: clone(persons.moussa),
    related_person: [
      { relationship_type: 'WIFE', related_member: ref(persons.amina) },
      { relationship_type: 'DAU', related_member: ref(persons.fatou) },
    ],
    is_disabled: false,
    marital_status: 'M',
    employment_status: '6',
    occupation: '6',
    education_level: '1',
    registration_date: '2019-02-20T09:00:00Z',
    last_updated: '2024-05-10T14:30:00Z',
  },
  fatou: {
    member_identifier: [id('UIN', '810000003')],
    demographic_info: clone(persons.fatou),
    is_disabled: false,
    marital_status: 'S',
    education_level: '1',
    registration_date: '2019-03-01T09:00:00Z',
  },
  kofi: {
    member_identifier: [id('UIN', '820000001')],
    demographic_info: clone(persons.kofi),
    is_disabled: true,
    disability_info: [{ disability_limitation_type: 'MOB_SS', functional_severity: '3' }],
    marital_status: 'M',
    employment_status: '5',
    occupation: '1',
    registration_date: '2020-02-14',
    last_updated: '2024-08-01',
  },
  awa: {
    member_identifier: [id('UIN', '840000001')],
    demographic_info: clone(persons.awa),
    related_person: [{ relationship_type: 'FRMSPS', related_member: clone(persons.ibrahim) }],
    is_disabled: false,
    marital_status: 'W',
    employment_status: '6',
    registration_date: '2018-09-10',
    last_updated: '2023-02-01',
  },
  // Every coded attribute sent as a label instead of a code.
  grace: {
    member_identifier: [id('UIN', '830000001')],
    demographic_info: clone(persons.grace),
    is_disabled: false,
    marital_status: 'Never Married',
    employment_status: 'Self employment: Own-account workers',
    occupation: 'Skilled agricultural, forestry and fishery worker',
    education_level: 'Upper secondary education',
    language_code: 'eng',
    registration_date: '2021-04-20',
    last_updated: '2024-03-02',
  },
  minimal: {
    member_identifier: [id('UIN', '890000009')],
  },
};

// ---------------------------------------------------------------------------
// Groups (core Group, head and members = FR Member)
// ---------------------------------------------------------------------------
const groups = {
  family: {
    '@context': context,
    '@id': 'Group_G-0001',
    '@type': 'Group',
    group_identifier: [id('GID', 'G-0001'), id('NationalID', 'HH-KD-0001')],
    group_type: '3',
    geographical_location: { '@type': 'Place', name: 'Hamdallaye', geo: geo(10.0505, -12.8625), contained_in_place: 'Kindia' },
    address: [kindiaAddress],
    place_address: true,
    poverty_score: 42.5,
    poverty_score_type: 'PMT',
    group_head_info: clone(members.moussa),
    group_size: 3,
    member_list: [clone(members.amina), clone(members.fatou)],
    additional_attributes: [{ name: 'village_validation', value: 'done' }],
    registration_date: '2019-02-20T09:00:00Z',
    last_updated: '2024-05-10T14:30:00Z',
  },
  household: {
    group_identifier: [id('GID', 'G-0002')],
    group_type: '2',
    poverty_score: 18,
    poverty_score_type: 'PMT',
    group_head_info: clone(members.kofi),
    // The head is also listed; the other members are not disclosed.
    group_size: 4,
    member_list: [clone(members.kofi)],
    registration_date: '2020-02-14',
    last_updated: '2024-08-01',
  },
  widow: {
    group_identifier: [id('GID', 'G-0003')],
    // Label spelling of AssistanceUnitEnum
    group_type: 'Household',
    group_head_info: clone(members.awa),
    group_size: 3,
    member_list: [clone(members.awa)],
    registration_date: '2018-09-10',
    last_updated: '2023-02-01',
  },
  individual: {
    group_identifier: [id('GID', 'G-0004')],
    group_type: '1',
    group_head_info: clone(members.grace),
    group_size: 1,
    member_list: [clone(members.grace)],
    registration_date: '2021-04-20',
  },
  minimal: {
    group_identifier: [id('GID', 'G-0009')],
  },
};

// ---------------------------------------------------------------------------
// Farmers (Farmer_Person)
// ---------------------------------------------------------------------------
const withIds = (member, ...extra) => ({ ...clone(member), member_identifier: [...clone(member.member_identifier), ...extra] });

const farmers = {
  // Every optional attribute, coded values sent as codes, model spellings.
  full: {
    '@context': context,
    '@id': 'Farmer_FR-0001',
    '@type': 'Farmer',
    farmer_personal_details: withIds(members.moussa, id('FRN', 'FR-0001')),
    family_details: clone(groups.family),
    farm_type: '1',
    farm_details: [
      {
        '@type': 'FarmInfo',
        location: { '@type': 'Place', name: 'Hamdallaye plot', address_line: 'Route de Kindia km 4', geo: geo(10.06, -12.87), contained_in_place: 'Kindia' },
        farm_type: 'Small subsistence-oriented farms',
        land_tenure: '1',
        land_size: 3.5,
        measurment: '0',
        farming_activities: {
          crop_production: [
            {
              activity_group: '011',
              crop_type_name: '1',
              variety: 'NERICA 4',
              season: 'rainy',
              end_use: ['1', '2'],
              irrigation: true,
              irrigation_water: ['1', '2'],
              fertilizer_type: ['1', '5'],
              registration_date: '2020-04-01',
              last_updated: '2024-04-15',
            },
            {
              activity_group: '012',
              crop_type_name: '3',
              variety: 'Kent mango',
              season: 'dry',
              end_use: ['1'],
              irrigation: false,
              fertilizer_type: ['3'],
              registration_date: '2020-04-01',
              last_updated: '2024-04-15',
            },
          ],
          animal_production: [
            { type: '1', count: 6, livestock_system: '3', registration_date: '2020-04-01', last_updated: '2024-04-15' },
            { type: '6', count: 40, livestock_system: '4', registration_date: '2021-01-10', last_updated: '2024-04-15' },
          ],
          mixed_farming: true,
          agri_support_activities: ['161', '163'],
          agroforestry: ['3'],
          registration_date: '2020-04-01',
          last_updated: '2024-04-15',
        },
        registration_date: '2020-04-01',
        last_updated: '2024-04-15',
      },
      {
        '@type': 'FarmInfo',
        location: { name: 'Fish pond', geo: geo(10.071, -12.881) },
        farm_type: '1',
        land_tenure: '2',
        land_size: 0.5,
        measurment: '0',
        farming_activities: {
          aquaculture: ['0322'],
          aqua_support_activities: '0330',
          mixed_farming: false,
          registration_date: '2022-06-01',
        },
        registration_date: '2022-06-01',
        last_updated: '2024-04-15',
      },
    ],
    machineries_details: [
      { type: '10', count: 3, equipement_source: '1', registration_date: '2020-04-01', last_updated: '2024-04-15' },
      { type: '32', count: 1, equipement_source: '5', registration_date: '2023-03-01', last_updated: '2024-04-15' },
    ],
    registration_date: '2020-04-01T08:00:00Z',
    last_updated: '2024-04-15T10:00:00Z',
  },
  // Crop farmer living alone; every coded value sent as a label and the FR spec example's
  // spellings (crop_type, measurement, farming_activities as a list, equipment_source).
  crop: {
    farmer_personal_details: withIds(members.grace, id('FRN', 'FR-0002')),
    family_details: clone(groups.individual),
    farm_details: [
      {
        place: { name: 'Bo market garden', geo: geo(7.96, -11.74) },
        farm_type: 'Small subsistence-oriented farms',
        land_tenure: 'Leased (Rented from someone else)',
        land_size: 2,
        measurement: 'AC',
        farming_activities: [
          {
            crop_production: [
              {
                activity_group: 'Non-perennial crops',
                crop_type: 'Vegetables and melons',
                variety: 'Roma tomato',
                season: 'dry',
                end_use: 'Food for human consumption',
                irrigation: true,
                irrigation_water: ['Groundwater'],
                fertilizer_type: ['Organic fertilizers', 'Manure'],
                registration_date: '2021-04-20',
                last_updated: '2024-03-02',
              },
            ],
            mixed_farming: false,
            agri_support_activities: ['Post-harvest crop activities'],
            registration_date: '2021-04-20',
          },
        ],
        registration_date: '2021-04-20',
      },
    ],
    machineries_details: [
      { type: 'Manually operated machines', count: 2, equipment_source: 'Owned solely by the farmer or members of the farmer’s household' },
    ],
    registration_date: '2021-04-20',
    last_updated: '2024-03-02',
  },
  // Large livestock holding run by a farmer with a disability.
  livestock: {
    farmer_personal_details: withIds(members.kofi, id('FRN', 'FR-0003')),
    family_details: clone(groups.household),
    farm_type: '5',
    farm_details: [
      {
        location: { name: 'Mensah ranch', geo: geo(9.4, -0.85) },
        farm_type: '5',
        land_tenure: '1',
        land_size: 120,
        measurment: '0',
        farming_activities: {
          animal_production: [
            { type: '1', count: 250, livestock_system: '3' },
            { type: '2', count: 400, livestock_system: '2' },
          ],
          mixed_farming: false,
          agri_support_activities: ['162'],
        },
      },
    ],
    machineries_details: [
      { type: '34', count: 2, equipement_source: '1' },
      { type: '37', count: 1, equipement_source: '6' },
    ],
    registration_date: '2020-02-14',
    last_updated: '2024-08-01',
  },
  // Widow heading her household: perennial crops, aquaculture and agroforestry on inherited land.
  widow: {
    farmer_personal_details: withIds(members.awa, id('FRN', 'FR-0004')),
    family_details: clone(groups.widow),
    farm_details: [
      {
        location: { name: 'Camara plantation', geo: geo(9.53, -13.68) },
        farm_type: '1',
        land_tenure: '5',
        land_size: 2.5,
        measurment: 'H',
        farming_activities: {
          crop_production: [
            { activity_group: '012', crop_type_name: '6', variety: 'Forastero cocoa', season: 'all year', end_use: ['3'], irrigation: false },
          ],
          aquaculture: ['0321', '0322'],
          aqua_support_activities: ['0330'],
          agroforestry: ['2', '4', '6'],
          mixed_farming: false,
        },
        registration_date: '2018-09-10',
      },
    ],
    registration_date: '2018-09-10',
    last_updated: '2023-02-01',
  },
  // Only an identifier: nothing else is mandatory.
  minimal: {
    farmer_personal_details: { member_identifier: [id('FRN', 'FR-0009')] },
  },
};

// Verbatim FRPerson example of fr_api_v1.0.0.yaml (src/extensions/fr/FRPerson.yaml).
// It uses its own spellings (famer_personal_details, first_name/last_name, gender, date_of_birth,
// "spdci:identifier", place, measurement, aqua_culture) and two values that are in no FR code
// list: aqua_culture "Marine aquafarming" (AquaCultureEnum: "Marine aquaculture") and machinery
// type "Machine powered equipment" (MachineriesEnum has no such entry).
export const specExample = {
  famer_personal_details: {
    member_identifier: { identifier_type: 'NationalID', identifier_value: 'M123456' },
    demographic_info: {
      identifier: { identifier_type: 'NationalID', identifier_value: 'M123456' },
      name: { first_name: 'John', last_name: 'Doe' },
      date_of_birth: '1990-05-15T00:00:00Z',
      gender: 'Male',
    },
  },
  family_details: {
    group_identifier: [{ identifier_type: 'NationalID', identifier_value: 'G9876543210' }],
    group_type: 'family',
    poverty_score: 45.2,
    poverty_score_type: 'income-based',
    group_head_info: {
      member_identifier: [{ identifier_type: 'NationalID', identifier_value: 'M123456' }],
      demographic_info: {
        identifier: { identifier_type: 'NationalID', identifier_value: 'M123456' },
        name: { first_name: 'John', last_name: 'Doe' },
        date_of_birth: '1990-05-15T00:00:00Z',
        gender: 'Male',
      },
      is_disabled: false,
      marital_status: 'married',
      registration_date: '1990-06-10T08:00:00Z',
    },
    group_size: 2,
    member_list: [
      {
        member_identifier: [{ '@type': 'Identifier', identifier_type: 'NationalID', identifier_value: 'M9876543210' }],
        demographic_info: {
          'spdci:identifier': [{ '@type': 'Identifier', identifier_type: 'NationalID', identifier_value: '1234567890' }],
          name: { '@type': 'Name', surname: 'Doe', given_name: 'Jane', prefix: 'Mr.', suffix: '' },
          sex: 'female',
          birth_date: '1982-03-15T00:00:00Z',
          registration_date: '2022-01-10T08:00:00Z',
        },
        is_disabled: false,
        marital_status: 'married',
        registration_date: '2022-01-10T08:00:00Z',
      },
    ],
    registration_date: '2022-01-10T08:00:00Z',
    last_updated: '2023-06-15T10:00:00Z',
  },
  farm_details: [{
    place: {
      name: 'Koh Samui',
      geo: { '@type': 'spdci:GeoLocation', latitude: 9.5604, longitude: 100.0245 },
    },
    farm_type: 'Small subsistence-oriented farms',
    farming_activities: [{
      crop_production: [{
        activity_group: 'perennial crops',
        crop_type: 'Fruit and nuts',
        variety: 'local',
        season: 'winter',
        end_use: ['Food for human consumption'],
        irrigation: true,
        irrigation_water: ['Mixed surface water and groundwater'],
        fertilizer_type: ['Organic fertilizers'],
        registration_date: '2023-01-10T00:00:00Z',
        last_updated: '2023-09-20T00:00:00Z',
      }],
      animal_production: [{
        type: 'Sheep and goats',
        count: 10,
        livestock_system: 'Mixed system',
        registration_date: '2023-01-10T00:00:00Z',
        last_updated: '2023-09-20T00:00:00Z',
      }],
      mixed_farming: true,
      agri_support_activities: ['Support activities for crop production'],
      aqua_support_activities: 'Support activities for fishing and aquaculture',
      aqua_culture: ['Marine aquafarming'],
      registration_date: '2023-01-10T00:00:00Z',
      last_updated: '2023-09-20T00:00:00Z',
    }],
  }],
  machineries_details: [{
    type: 'Machine powered equipment',
    count: 2,
    equipement_source: 'Provided by a cooperative',
    registration_date: '2022-01-10T08:00:00Z',
    last_updated: '2023-06-15T10:00:00Z',
  }],
  registration_date: '2023-01-10T00:00:00Z',
  last_updated: '2023-09-20T00:00:00Z',
};

// The spec example with its two out-of-list values replaced by the matching code list entries.
export const specExampleCorrected = (() => {
  const r = clone(specExample);
  r.farm_details[0].farming_activities[0].aqua_culture = ['Marine aquaculture'];
  r.machineries_details[0].type = 'Machines for general farm use';
  return r;
})();

// ---------------------------------------------------------------------------
// Public fixture catalogue: records[kind][profile]
// ---------------------------------------------------------------------------
export const records = {
  farmer: {
    ...farmers,
    'spec example': specExample,
    'spec example corrected': specExampleCorrected,
  },
  person: {
    full: persons.amina,
    male: persons.moussa,
    child: persons.fatou,
    deceased: persons.ibrahim,
    widow: persons.awa,
    labels: persons.grace,
    kofi: persons.kofi,
    minimal: persons.minimal,
  },
  member: {
    full: members.amina,
    male: members.moussa,
    child: members.fatou,
    disabled: members.kofi,
    widow: members.awa,
    labels: members.grace,
    minimal: members.minimal,
  },
  group: {
    family: groups.family,
    household: groups.household,
    widow: groups.widow,
    individual: groups.individual,
    minimal: groups.minimal,
  },
};

export function recordFixture(kind, profile) {
  const byKind = records[kind];
  if (!byKind) throw new Error(`Unknown record kind "${kind}". Known: ${Object.keys(records).join(', ')}`);
  if (!byKind[profile]) throw new Error(`Unknown ${kind} record "${profile}". Known: ${Object.keys(byKind).join(', ')}`);
  return clone(byKind[profile]);
}

// ---------------------------------------------------------------------------
// Identifiers carried by a record, by kind. A search by identifier must return records
// carrying the queried identifier at one of these places:
//  farmer: farmer_personal_details.member_identifier / its demographic_info identifiers
//  person: identifier ("spdci:identifier")
//  member: member_identifier / demographic_info identifiers
//  group : group_identifier, or the identifiers of its head or of one of its members
// ---------------------------------------------------------------------------
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const personIds = (p) => (p && typeof p === 'object' ? [...asList(p.identifier), ...asList(p['spdci:identifier'])] : []);
const memberIds = (m) => (m && typeof m === 'object' ? [...asList(m.member_identifier), ...personIds(m.demographic_info)] : []);

export function identifiersOf(record, kind) {
  if (!record || typeof record !== 'object') return [];
  const ids = {
    farmer: () => memberIds(record.farmer_personal_details ?? record.famer_personal_details),
    person: () => personIds(record),
    member: () => memberIds(record),
    group: () => [
      ...asList(record.group_identifier),
      ...memberIds(record.group_head_info),
      ...asList(record.member_list).flatMap(memberIds),
    ],
  }[kind]?.() ?? [];
  return ids.filter((i) => i && typeof i === 'object');
}

// Records of the mock FR, by kind and identifier value.
export function recordsByIdentifier(kind) {
  const index = {};
  const served = kind === 'farmer'
    ? Object.entries(records.farmer).filter(([name]) => name !== 'spec example')
    : Object.entries(records[kind]);
  for (const [, record] of served) {
    for (const { identifier_value: value } of identifiersOf(record, kind)) {
      index[value] ??= [];
      if (!index[value].includes(record)) index[value].push(record);
    }
  }
  return index;
}

// Records returned by the mock FR for the predicate (and expression/graphql) searches the
// suite sends, see payloads.js `predicates`.
export const predicateResults = {
  farmer: [farmers.full, farmers.crop, farmers.widow],
  person: [persons.amina, persons.fatou, persons.grace],
  member: [members.amina, members.moussa],
  group: [groups.household, groups.widow],
};
