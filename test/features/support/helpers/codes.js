// Code lists of the DCI Farmer Registry data model, generated from the JSON-LD files of
// spdci/schemas (core/v1/code and extensions/fr/v1/code). Each entry lists the codes and the
// labels of the list. A coded attribute is accepted when it carries one of the codes or one
// of the labels (case-insensitive): the FR spec example sends labels ("Fruit and nuts",
// "Mixed system") while integrations usually send codes.
//
// Source quirks kept as published:
//  - LandTenureEnum declares code "1" twice and EquipmentSource code "4" twice (both labels are kept);
//  - "MeasurmentUnitEnum" is spelled as in the source file.

export const codeLists = {
  sex: {
    name: "SexCategoryEnum",
    codes: ["male", "female", "other", "unknown"],
    labels: ["Others"],
  },
  maritalStatus: {
    name: "MaritalStatusEnum",
    codes: ["S", "M", "W", "A", "D", "L", "U"],
    labels: ["Never Married", "Married", "Widow", "Annulled", "Divorced", "Legally Separated", "Unmarried"],
  },
  groupType: {
    name: "AssistanceUnitEnum",
    codes: ["1", "2", "3"],
    labels: ["Member (Person/Individual)", "Household", "Family"],
  },
  relationshipType: {
    name: "RelationshipTypeEnum",
    codes: ["SELF", "PRIMSPOUS", "FAMMEMB", "CHILD", "CHILDADOPT", "DAUADOPT", "SONADOPT", "CHILDFOST", "DAUFOST", "SONFOST", "DAUC", "DAU", "STPDAU", "NCHILD", "SON", "SONC", "STPSON", "STPCHILD", "EXT", "AUNT", "MAUNT", "PAUNT", "COUSN", "MCOUSN", "PCOUSN", "GGRPRN", "GGRFTH", "MGGRFTH", "PGGRFTH", "GGRMTH", "MGGRMTH", "PGGRMTH", "MGGRPRN", "PGGRPRN", "GRNDCHILD", "GRNDDAU", "GRNDSON", "GRPRN", "GRFTH", "MGRFTH", "PGRFTH", "GRMTH", "PGRMTH", "MGRMTH", "PGRPRN", "MGRPRN", "INLAW", "CHLDINLAW", "DAUINLAW", "SONINLAW", "PRNINLAW", "FTHINLAW", "MTHINLAW", "SIBINLAW", "BROINLAW", "SISINLAW", "NIENEPH", "NEPHEW", "NEICE", "UNCLE", "PUNCLE", "MUNCLE", "PRN", "ADOPTP", "ADOPTF", "ADOPTM", "FTH", "FTHFOST", "NFTH", "NFTHF", "STPFTH", "MTH", "GESTM", "FOSTMTH", "NMTH", "NMTHF", "STPMTH", "NPRN", "PRNFOST", "STPPRN", "SIB", "BRO", "HBRO", "NBRO", "TWINBRO", "FTWINBRO", "ITWINBRO", "STPBRO", "HSIB", "HSIS", "NSIB", "NSIS", "TWINSIS", "FTWINSIS", "ITWINSIS", "TWIN", "FTWIN", "ITWIN", "SIS", "STPSIS", "STPSIB", "SIGOTHR", "DOMPART", "FRMSPS", "SPS", "HUSB", "WIFE"],
    labels: ["Primary Spouse", "family member", "adopted child", "adopted daughter", "adopted son", "foster son", "foster daughter", "daughter", "natural daughter", "stepdaughter", "natural child", "natural son", "stepson", "step child", "extended family member", "maternal aunt", "paternal aunt", "cousin", "maternal cousin", "paternal cousin", "great grandparent", "great grandfather", "maternal great-grandfather", "paternal great-grandfather", "great grandmother", "maternal great-grandmother", "paternal great-grandmother", "maternal great-grandparent", "paternal great-grandparent", "grandchild", "granddaughter", "grandson", "grandparent", "grandfather", "maternal grandfather", "paternal grandfather", "grandmother", "paternal grandmother", "maternal grandmother", "paternal grandparent", "maternal grandparent", "child-in-law", "daughter in-law", "son in-law", "parent in-law", "father-in-law", "mother-in-law", "sibling in-law", "brother in-law", "sister in-law", "niece/nephew", "parental uncle", "maternal uncle", "parent", "adoptive parent", "adoptive father", "adoptive mother", "father", "foster father", "natural father", "natural father of fetus", "stepfather", "mother", "gestational mother", "foster mother", "natural mother", "natural mother of fetus", "stepmother", "natural parent", "foster parent", "step parent", "sibling", "borther", "half-brother", "natural brother", "twin brother", "faternal twin brother", "identical twin brother", "stepbrother", "half-sibling", "half-sister", "natural sibling", "natural sister", "twin sister", "faternal twin sister", "identical twin sister", "faternal twin", "identical twin", "sister", "step-sister", "step-sibling", "significant other", "domestic partner", "former spouse", "spouse", "husband"],
  },
  employmentStatus: {
    name: "EmploymentStatusEnum",
    codes: ["1", "2", "3", "4", "5", "6", "7", "8"],
    labels: ["Employed", "Not Employed", "Unknown", "Paid employment: Employee", "Self employment: Employers", "Self employment: Own-account workers", "Self employment: Members of producers’ cooperatives", "Self employment: Contributing family workers"],
  },
  occupation: {
    name: "OccupationEnum",
    codes: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    labels: ["Armed forces occupation", "Manager", "Professional", "Technician and associate professional", "Clerical support worker", "Service and sales worker", "Skilled agricultural, forestry and fishery worker", "Craft and related trades worker", "Plant and machine operator, and assembler", "Elementary occupation"],
  },
  educationLevel: {
    name: "EducationCodeEnum",
    codes: ["0", "1", "2", "3", "4", "5", "6", "7", "8"],
    labels: ["Early childhood education", "Primary education", "Lower secondary education", "Upper secondary education", "Post-secondary non-tertiary education", "Short-cycle tertiary education", "Bachelor's or equivalent", "Master's or equivalent", "Doctorate or equivalent"],
  },
  disabilityType: {
    name: "FunctionalLimitationType",
    codes: ["VIS_SS", "HEAR_SS", "MOB_SS", "COG_SS", "SC_SS", "COM_SS"],
    labels: ["Vision", "Hearing", "Mobility", "COGNITION (REMEMBERING)", "Self care", "Communication"],
  },
  functionalSeverity: {
    name: "FunctionalSeverityEnum",
    codes: ["1", "2", "3", "4"],
    labels: ["No difficulty", "Some difficulty", "A lot difficulty", "Cannot do it at all"],
  },
  farmType: {
    name: "FarmTypeEnum",
    codes: ["1", "2", "3", "4", "5", "6"],
    labels: ["Small subsistence-oriented farms", "Small semi-subsistence or part-commercial farms", "Small independent specialized farms", "Small dependent specialized farms", "Large commercial farms", "Commercial estates"],
  },
  landTenure: {
    name: "LandTenureEnum",
    codes: ["1", "2", "3", "4", "5", "6"],
    labels: ["Owner", "Non-legal ownership/Squatting illegally on land", "Leased (Rented from someone else)", "Adverse possession or prescription", "Sharecropping", "Inheritance", "Holdings without land"],
  },
  measurementUnit: {
    name: "MeasurmentUnitEnum",
    codes: ["0", "1", "2", "3", "4", "5", "6"],
    labels: ["H", "AC", "SQM", "SQKM", "SQF", "SQY", "DU"],
  },
  cropActivity: {
    name: "CropActivityEnum",
    codes: ["011", "012", "013"],
    labels: ["Non-perennial crops", "Perennial crops", "Plant propagation"],
  },
  cropType: {
    name: "CropTypeEnum",
    codes: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    labels: ["Cereals", "Vegetables and melons", "Fruit and nuts", "Oilseed crops and oleaginous fruits", "Root/tuber crops with high starch or inulin content", "Stimulant, spice and aromatic crops", "Leguminous crops", "Sugar crops", "Other crops"],
  },
  cropEndUse: {
    name: "CropEnduseEnum",
    codes: ["1", "2", "3", "4"],
    labels: ["Food for human consumption", "Feed for animals", "Biofuels or non-food products", "Other uses"],
  },
  irrigationWater: {
    name: "IrrigationWaterEnum",
    codes: ["1", "2", "3", "4", "5", "6", "7", "8"],
    labels: ["Surface water", "Groundwater", "Mixed surface water and groundwater", "Municipal water supply", "Treated or not-treated  wastewater", "Agricultural drainage water", "Desalinated water", "other"],
  },
  fertilizerType: {
    name: "FertilizerTypeEnum",
    codes: ["1", "2", "3", "4", "5", "6"],
    labels: ["Mineral fertilizers", "Organo-mineral fertilizers", "Organic fertilizers", "Biofertilizers", "Manure", "Other organic materials to enhance plant growth"],
  },
  animals: {
    name: "AnimalsEnum",
    codes: ["1", "2", "3", "4", "5", "6", "7", "8"],
    labels: ["Bovine animals", "Sheep and goats", "Swine/pigs", "Equines", "Camels and camelids", "poultry", "other animals", "Insects and worms"],
  },
  livestockSystem: {
    name: "LivestockSystemEnum",
    codes: ["1", "2", "3", "4", "5"],
    labels: ["Grazing system - Nomadic or totally pastoral", "Grazing system - Semi-nomadic, semi-pastoral or transhumant", "Grazing system - Sedentary pastoral or ranching", "Mixed system", "Industrial system"],
  },
  agriSupportActivity: {
    name: "AgriSupportActivityEnum",
    codes: ["161", "162", "163", "164"],
    labels: ["Support activities for crop production", "Support activities for animal production", "Post-harvest crop activities", "Seed processing for propagation"],
  },
  aquaCulture: {
    name: "AquaCultureEnum",
    codes: ["0321", "0322"],
    labels: ["Marine aquaculture", "Freshwater aquaculture"],
  },
  aquaSupportActivity: {
    name: "AquaSupportActivityEnum",
    codes: ["0330"],
    labels: ["Support activities for fishing and aquaculture"],
  },
  forestActivity: {
    name: "ForestActivityEnum",
    codes: ["1", "2", "3", "4", "5", "6", "7"],
    labels: ["Logging", "Afforestation (planting trees)", "Reforestation (replanting trees)", "Nursery (cultivating seedlings for afforestation or reforestation)", "Extraction of fuelwood and production of charcoal", "Gathering of plant-based edible and non-edible wild non-wood products", "Gathering of animal-based edible and non-edible wild non-wood products"],
  },
  machineries: {
    name: "MachineriesEnum",
    codes: ["10", "20", "31", "32", "33", "34", "35", "36", "37"],
    labels: ["Manually operated machines", "Animal-powered equipment", "Machines for general farm use", "Tractors, bulldozers and other vehicles", "Crop machinery and equipment", "Livestock machinery and equipment", "Aquacultural machinery and equipment", "Forestry machinery and equipment*", "Unmanned Aerial vehicle and robots*"],
  },
  equipmentSource: {
    name: "EquipmentSource",
    codes: ["1", "2", "3", "4", "5", "6"],
    labels: ["Owned solely by the farmer or members of the farmer’s household", "Owned by the farmer jointly with other farmers", "Provided by the landlord", "Provided by other private holders (excluding cooperatives)", "Provided by a cooperative", "Provided by a private agricultural service establishment", "Provided by a government agency"],
  },
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const caseless = (s) => [...escapeRe(s)].map((ch) => (/[a-z]/i.test(ch) && ch.toLowerCase() !== ch.toUpperCase()
  ? `[${ch.toLowerCase()}${ch.toUpperCase()}]` : ch)).join('');

// Every accepted spelling of a list: its codes and its labels.
export const allowedValues = (key) => [...codeLists[key].codes, ...codeLists[key].labels];

// Case-insensitive JSON Schema pattern accepting a code or a label of the list. Built with
// character classes (no regex flags) so the same schema works in Ajv and in Mockoon.
export const codePattern = (key) => `^(${allowedValues(key).map(caseless).join('|')})$`;

export function isCode(key, value) {
  if (typeof value !== 'string') return false;
  const v = value.trim().toLowerCase();
  return allowedValues(key).some((a) => a.toLowerCase() === v);
}

// Normalises a code or a label to the list's code (labels are matched case-insensitively).
export function toCode(key, value) {
  if (typeof value !== 'string') return undefined;
  const { codes, labels } = codeLists[key];
  const v = value.trim().toLowerCase();
  const code = codes.find((c) => c.toLowerCase() === v);
  if (code) return code;
  const i = labels.findIndex((l) => l.toLowerCase() === v);
  return i >= 0 ? (codes[i] ?? labels[i]) : undefined;
}

// Case-insensitive pattern accepting any of the given names, optionally namespaced
// ("spdci-extensions-dci:Farmer" as well as "Farmer").
export const namespacedPattern = (names) => `^([A-Za-z0-9_.-]+:)*(${names.map(caseless).join('|')})$`;
