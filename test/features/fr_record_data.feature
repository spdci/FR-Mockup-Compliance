@data
Feature: FR data rules (Farmer, Person, Member, Group)

The Farmer Registry standard makes almost every attribute optional. A record may disclose
only an identifier. But whenever an attribute IS sent it must be correct: right type,
right format, a value from the right code list (as a code or as its label), and consistent
with the rest of the record.

This feature is the rule book. It runs offline (no API) and proves that the validator
applied to every record returned or sent by the API scenarios accepts absent attributes,
accepts correct values and rejects incorrect ones, for the four kinds of FR records:
Farmer (farmer search), Person (person search), Member (member search) and Group (group search).

Sources: fr_api_v1.0.0.yaml, extensions/fr/v1/data (Farmer, FarmInfo, FarmingActivities,
CropDetails, LivestockDetails, Machineries, Member, Group, FRPerson), extensions/fr/v1/code,
core/v1/data (Person, Member, Group, Name, Identifier, Address, Place, GeoCoordinates,
GeoLocation, DisabilityInfo, RelatedPerson) and core/v1/code.

  # ===========================================================================
  # Reference records
  # ===========================================================================
  @smoke
  Scenario Outline: Reference <kind> record "<record>" is valid FR data
    Given the "<record>" <kind> record
    Then the record should be valid

    Examples: Farmers
      | kind   | record                 |
      | farmer | full                   |
      | farmer | crop                   |
      | farmer | livestock              |
      | farmer | widow                  |
      | farmer | minimal                |
      | farmer | spec example corrected |

    Examples: Persons (FRPerson)
      | kind   | record   |
      | person | full     |
      | person | male     |
      | person | child    |
      | person | deceased |
      | person | widow    |
      | person | labels   |
      | person | minimal  |

    Examples: Members
      | kind   | record   |
      | member | full     |
      | member | male     |
      | member | child    |
      | member | disabled |
      | member | widow    |
      | member | labels   |
      | member | minimal  |

    Examples: Groups
      | kind  | record     |
      | group | family     |
      | group | household  |
      | group | widow      |
      | group | individual |
      | group | minimal    |

  Scenario Outline: The published FR example is rejected because of <issue>
    Given the "spec example" farmer record
    Then the record should be rejected because of "<error>"

    Examples:
      | issue                                   | error                                                                    |
      | an aquaculture value outside the list   | "Marine aquafarming" is not a code or label of AquaCultureEnum           |
      | a machinery type outside the list       | "Machine powered equipment" is not a code or label of MachineriesEnum    |

  Scenario Outline: A <kind> record with no attribute at all is accepted (nothing is mandatory)
    Given an empty <kind> record
    Then the record should be valid

    Examples:
      | kind   |
      | farmer |
      | person |
      | member |
      | group  |

  # ===========================================================================
  # Absent optional attributes are accepted
  # ===========================================================================
  Scenario Outline: Optional farmer attribute "<attribute>" may be omitted
    Given the "full" farmer record
    When its "<attribute>" attribute is removed
    Then the record should be valid

    Examples: Farmer
      | attribute                                 |
      | @context                                  |
      | @id                                       |
      | @type                                     |
      | farmer_personal_details                   |
      | farmer_personal_details.demographic_info  |
      | farmer_personal_details.related_person    |
      | family_details                            |
      | family_details.member_list                |
      | family_details.group_head_info            |
      | farm_type                                 |
      | farm_details                              |
      | machineries_details                       |
      | registration_date                         |
      | last_updated                              |

    Examples: Farm (FarmInfo)
      | attribute                                 |
      | farm_details.0.location                   |
      | farm_details.0.location.geo               |
      | farm_details.0.farm_type                  |
      | farm_details.0.land_tenure                |
      | farm_details.0.farming_activities         |
      | farm_details.0.registration_date          |
      | farm_details.0.last_updated               |

    Examples: Farming activities
      | attribute                                                        |
      | farm_details.0.farming_activities.crop_production                |
      | farm_details.0.farming_activities.animal_production              |
      | farm_details.0.farming_activities.mixed_farming                  |
      | farm_details.0.farming_activities.agri_support_activities        |
      | farm_details.0.farming_activities.agroforestry                   |
      | farm_details.1.farming_activities.aquaculture                    |
      | farm_details.1.farming_activities.aqua_support_activities        |
      | farm_details.0.farming_activities.crop_production.0.activity_group |
      | farm_details.0.farming_activities.crop_production.0.crop_type_name |
      | farm_details.0.farming_activities.crop_production.0.variety      |
      | farm_details.0.farming_activities.crop_production.0.season       |
      | farm_details.0.farming_activities.crop_production.0.end_use      |
      | farm_details.0.farming_activities.crop_production.0.irrigation   |
      | farm_details.0.farming_activities.crop_production.0.irrigation_water |
      | farm_details.0.farming_activities.crop_production.0.fertilizer_type |
      | farm_details.0.farming_activities.animal_production.0.type       |
      | farm_details.0.farming_activities.animal_production.0.count      |
      | farm_details.0.farming_activities.animal_production.0.livestock_system |

    Examples: Machinery
      | attribute                                 |
      | machineries_details.0.type                |
      | machineries_details.0.count               |
      | machineries_details.0.equipement_source   |
      | machineries_details.0.registration_date   |

  Scenario Outline: Optional person attribute "<attribute>" may be omitted
    Given the "full" person record
    When its "<attribute>" attribute is removed
    Then the record should be valid

    Examples:
      | attribute                        |
      | identifier                       |
      | name                             |
      | name.second_name                 |
      | name.maiden_name                 |
      | name.prefix                      |
      | name.suffix                      |
      | sex                              |
      | birth_date                       |
      | address                          |
      | address.0.geo_location           |
      | address.0.postal_code            |
      | address.0.country_code           |
      | phone_number                     |
      | email                            |
      | registration_date                |
      | last_updated                     |

  Scenario Outline: Optional member attribute "<attribute>" may be omitted
    Given the "full" member record
    When its "<attribute>" attribute is removed
    Then the record should be valid

    Examples:
      | attribute               |
      | member_identifier       |
      | demographic_info        |
      | related_person          |
      | is_disabled             |
      | marital_status          |
      | employment_status       |
      | occupation              |
      | income_level            |
      | language_code           |
      | education_level         |
      | additional_attributes   |
      | registration_date       |
      | last_updated            |

  Scenario Outline: Optional group attribute "<attribute>" may be omitted
    Given the "family" group record
    When its "<attribute>" attribute is removed
    Then the record should be valid

    Examples:
      | attribute               |
      | group_identifier        |
      | group_type              |
      | geographical_location   |
      | address                 |
      | place_address           |
      | poverty_score           |
      | poverty_score_type      |
      | group_head_info         |
      | group_size              |
      | member_list             |
      | additional_attributes   |
      | registration_date       |
      | last_updated            |

  # ===========================================================================
  # Correct values are accepted (codes, labels, every published spelling)
  # ===========================================================================
  Scenario Outline: Farmer attribute "<attribute>" accepts <value>
    Given the "full" farmer record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be valid

    Examples: Farm type (FarmTypeEnum)
      | attribute                 | value                                               |
      | farm_type                 | "1"                                                 |
      | farm_type                 | "6"                                                 |
      | farm_type                 | "Small semi-subsistence or part-commercial farms"   |
      | farm_type                 | "large commercial farms"                            |
      | farm_details.0.farm_type  | "Commercial estates"                                |

    Examples: Land (LandTenureEnum, MeasurmentUnitEnum)
      | attribute                   | value                                               |
      | farm_details.0.land_tenure  | "6"                                                 |
      | farm_details.0.land_tenure  | "Sharecropping"                                     |
      | farm_details.0.land_tenure  | "Non-legal ownership/Squatting illegally on land"   |
      | farm_details.0.land_tenure  | "Holdings without land"                             |
      | farm_details.0.measurment   | "1"                                                 |
      | farm_details.0.measurment   | "SQM"                                               |
      | farm_details.0.measurment   | "du"                                                |
      | farm_details.0.land_size    | 0.25                                                |
      | farm_details.0.land_size    | 1500                                                |

    Examples: Farm location (Place / GeoCoordinates)
      | attribute                       | value                                                                            |
      | farm_details.0.location         | {"name":"Plot 7"}                                                                |
      | farm_details.0.location.geo     | {"latitude":-90,"longitude":180}                                                 |
      | farm_details.0.location         | {"name":"Plot 7","contained_in_place":{"name":"Kindia","contained_in_place":"Guinea"}} |

    Examples: Crop production (CropActivityEnum, CropTypeEnum, CropEnduseEnum, IrrigationWaterEnum, FertilizerTypeEnum)
      | attribute                                                            | value                                                  |
      | farm_details.0.farming_activities.crop_production.0.activity_group   | "013"                                                  |
      | farm_details.0.farming_activities.crop_production.0.activity_group   | "Plant propagation"                                    |
      | farm_details.0.farming_activities.crop_production.0.crop_type_name   | "9"                                                    |
      | farm_details.0.farming_activities.crop_production.0.crop_type_name   | "Root/tuber crops with high starch or inulin content"  |
      | farm_details.0.farming_activities.crop_production.0.crop_type_name   | "Stimulant, spice and aromatic crops"                  |
      | farm_details.0.farming_activities.crop_production.0.end_use          | ["3","4"]                                              |
      | farm_details.0.farming_activities.crop_production.0.end_use          | "Feed for animals"                                     |
      | farm_details.0.farming_activities.crop_production.0.end_use          | []                                                     |
      | farm_details.0.farming_activities.crop_production.0.irrigation_water | ["Desalinated water","Agricultural drainage water"]    |
      | farm_details.0.farming_activities.crop_production.0.irrigation_water | ["Treated or not-treated  wastewater"]                 |
      | farm_details.0.farming_activities.crop_production.0.fertilizer_type  | ["2","4","6"]                                          |
      | farm_details.0.farming_activities.crop_production.0.fertilizer_type  | ["Biofertilizers"]                                     |
      | farm_details.0.farming_activities.crop_production.1.irrigation       | true                                                   |

    Examples: Animal production (AnimalsEnum, LivestockSystemEnum)
      | attribute                                                                | value                                                        |
      | farm_details.0.farming_activities.animal_production.0.type               | "8"                                                          |
      | farm_details.0.farming_activities.animal_production.0.type               | "Camels and camelids"                                        |
      | farm_details.0.farming_activities.animal_production.0.type               | "Poultry"                                                    |
      | farm_details.0.farming_activities.animal_production.0.livestock_system   | "1"                                                          |
      | farm_details.0.farming_activities.animal_production.0.livestock_system   | "Grazing system - Semi-nomadic, semi-pastoral or transhumant" |
      | farm_details.0.farming_activities.animal_production.0.livestock_system   | "Industrial system"                                          |
      | farm_details.0.farming_activities.animal_production.0.count              | 0                                                            |
      | farm_details.0.farming_activities.animal_production.0.count              | 25000                                                        |

    Examples: Other activities (AgriSupportActivityEnum, AquaCultureEnum, AquaSupportActivityEnum, ForestActivityEnum)
      | attribute                                                 | value                                                                              |
      | farm_details.0.farming_activities.agri_support_activities | ["162","164"]                                                                      |
      | farm_details.0.farming_activities.agri_support_activities | ["Seed processing for propagation"]                                                |
      | farm_details.0.farming_activities.agroforestry            | ["1","5","7"]                                                                      |
      | farm_details.0.farming_activities.agroforestry            | ["Logging","Gathering of animal-based edible and non-edible wild non-wood products"] |
      | farm_details.1.farming_activities.aquaculture             | ["0321"]                                                                           |
      | farm_details.1.farming_activities.aquaculture             | ["Marine aquaculture","Freshwater aquaculture"]                                    |
      | farm_details.1.farming_activities.aquaculture             | "Freshwater aquaculture"                                                           |
      | farm_details.1.farming_activities.aqua_support_activities | "Support activities for fishing and aquaculture"                                   |
      | farm_details.1.farming_activities.aqua_support_activities | ["0330"]                                                                           |

    Examples: Machinery (MachineriesEnum, EquipmentSource)
      | attribute                              | value                                                        |
      | machineries_details.0.type             | "20"                                                         |
      | machineries_details.0.type             | "Tractors, bulldozers and other vehicles"                    |
      | machineries_details.0.type             | "Unmanned Aerial vehicle and robots*"                        |
      | machineries_details.0.equipement_source | "Provided by a government agency"                           |
      | machineries_details.0.equipement_source | "Owned by the farmer jointly with other farmers"            |
      | machineries_details.0.equipement_source | "4"                                                         |
      | machineries_details.0.count            | 0                                                            |

    Examples: Dates (ISO 8601 date or date-time)
      | attribute                          | value                        |
      | registration_date                  | "2020-04-01"                 |
      | registration_date                  | "2020-04-01T08:00:00+01:00"  |
      | last_updated                       | "2024-04-15T10:00:00.123Z"   |

  Scenario Outline: The FR spec example spellings are accepted: <attribute>
    Given the "full" farmer record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be valid

    Examples:
      | attribute                                                        | value                                                         |
      | farm_details.0.farming_activities                                | [{"crop_production":[{"crop_type":"Cereals"}],"aqua_culture":["0322"]}] |
      | farm_details.1                                                   | {"place":{"name":"Fish pond","geo":{"latitude":10.07,"longitude":-12.88}},"land_size":0.5,"measurement":"H"} |
      | farm_details.1.measurement                                       | "H"                                                           |
      | machineries_details.1.equipment_source                           | "Provided by a cooperative"                                   |

  Scenario Outline: The farmer may be sent as "famer_personal_details" (FR spec example spelling)
    Given the "<record>" farmer record
    When its "famer_personal_details" attribute is set to '{"member_identifier":{"identifier_type":"NationalID","identifier_value":"M123456"},"demographic_info":{"identifier":{"identifier_type":"NationalID","identifier_value":"M123456"},"name":{"first_name":"John","last_name":"Doe"},"date_of_birth":"1990-05-15","gender":"Male"}}'
    And its "farmer_personal_details" attribute is removed
    Then the record should be valid

    Examples:
      | record  |
      | minimal |
      | full    |

  Scenario Outline: Person attribute "<attribute>" accepts <value>
    Given the "full" person record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be valid

    Examples: Identifiers (country-defined identifier types)
      | attribute         | value                                                                                         |
      | identifier        | [{"identifier_type":"UIN","identifier_value":"123456789"}]                                    |
      | identifier        | [{"identifier_type":"NationalID","identifier_value":"M123456"}]                               |
      | identifier        | [{"identifier_type":"BRN","identifier_value":"BRN-1985-01"},{"identifier_type":"DRN","identifier_value":"D-2"}] |
      | identifier        | {"identifier_type":"NationalID","identifier_value":"M123456"}                                 |
      | spdci:identifier  | [{"@type":"Identifier","identifier_type":"PassportNo","identifier_value":"GN1234567"}]        |

    Examples: Name
      | attribute | value                                              |
      | name      | {"surname":"Diallo"}                               |
      | name      | {"given_name":"Amina"}                             |
      | name      | {"first_name":"Amina","last_name":"Diallo"}        |
      | name      | {"given_name":"Amina","first_name":"Amina"}        |
      | name      | {"given_name":"Amina","prefix":"Dr.","suffix":"Jr"} |

    Examples: Sex (SexCategoryEnum, code or label) and its "gender" spelling
      | attribute | value     |
      | sex       | "male"    |
      | sex       | "female"  |
      | sex       | "other"   |
      | sex       | "Others"  |
      | sex       | "unknown" |
      | sex       | "FEMALE"  |
      | gender    | "Female"  |

    Examples: Dates and the "date_of_birth" spelling
      | attribute     | value                   |
      | birth_date    | "1985-04-12T00:00:00Z"  |
      | date_of_birth | "1985-04-12"            |
      | death_date    | ""                      |

    Examples: Contact details (E.164 phone, RFC 5322 e-mail)
      | attribute    | value                                    |
      | phone_number | ["+14155552671"]                         |
      | phone_number | ["+224622000001","+33612345678"]         |
      | phone_number | []                                       |
      | email        | ["a.diallo@example.org","b+c@sub.example.co"] |

    Examples: Address (object or list, both address line spellings)
      | attribute | value                                                                                   |
      | address   | {"address_line1":"Rue 12","locality":"Kindia","country_code":"GIN"}                      |
      | address   | [{"address_line_1":"Rue 12"},{"address_line_1":"BP 45","postal_code":"1001"}]           |

  Scenario Outline: Member attribute "<attribute>" accepts <value>
    Given the "full" member record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be valid

    Examples: Marital status (MaritalStatusEnum, code or label)
      | attribute      | value               |
      | marital_status | "S"                 |
      | marital_status | "A"                 |
      | marital_status | "L"                 |
      | marital_status | "U"                 |
      | marital_status | "married"           |
      | marital_status | "Legally Separated" |
      | marital_status | "never married"     |

    Examples: Employment, occupation, education (core code lists)
      | attribute         | value                                          |
      | employment_status | "1"                                            |
      | employment_status | "Self employment: Members of producers’ cooperatives" |
      | occupation        | "0"                                            |
      | occupation        | "Plant and machine operator, and assembler"   |
      | education_level   | "8"                                            |
      | education_level   | "Doctorate or equivalent"                      |
      | language_code     | "fr"                                           |
      | language_code     | "ful"                                          |

    Examples: Disability (FunctionalLimitationType, FunctionalSeverityEnum)
      | attribute        | value                                                                                                      |
      | is_disabled      | true                                                                                                       |
      | disability_info  | []                                                                                                         |

    Examples: Related persons (RelationshipTypeEnum, code or label)
      | attribute                          | value             |
      | related_person.0.relationship_type | "SPS"             |
      | related_person.0.relationship_type | "husband"         |
      | related_person.0.relationship_type | "Primary Spouse"  |
      | related_person.1.relationship_type | "CHILD"           |
      | related_person.1.relationship_type | "natural daughter" |

    Examples: Identifiers
      | attribute         | value                                                                                   |
      | member_identifier | {"identifier_type":"UIN","identifier_value":"810000001"}                                |
      | member_identifier | [{"identifier_type":"UIN","identifier_value":"810000001"},{"identifier_type":"FRN","identifier_value":"FR-1"}] |

    Examples: Additional attributes (list of key-value pairs)
      | attribute             | value                                                    |
      | additional_attributes | [{"name":"coop","value":"A"},{"attribute_name":"x","attribute_value":1}] |
      | additional_attributes | []                                                       |

  Scenario Outline: A disabled member may describe the disability: <value>
    Given the "disabled" member record
    When its "disability_info" attribute is set to '<value>'
    Then the record should be valid

    Examples:
      | value                                                                                                                        |
      | [{"disability_limitation_type":"VIS_SS","functional_severity":"2"}]                                                          |
      | [{"disability_limitation_type":"Hearing","functional_severity":"Cannot do it at all"}]                                       |
      | [{"disability_limitation_type":"COG_SS","functional_severity":"4"},{"disability_limitation_type":"Self care","functional_severity":"1"}] |

  Scenario Outline: Group attribute "<attribute>" accepts <value>
    Given the "family" group record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be valid

    Examples: Group type (AssistanceUnitEnum, code or label)
      | attribute  | value       |
      | group_type | "2"         |
      | group_type | "Family"    |
      | group_type | "household" |

    Examples: Size, poverty score, location
      | attribute             | value                                                          |
      | group_size            | 3                                                              |
      | group_size            | 12                                                             |
      | poverty_score         | 0                                                              |
      | poverty_score         | 87.25                                                          |
      | poverty_score_type    | "income-based"                                                 |
      | place_address         | false                                                          |
      | geographical_location | {"name":"Kindia","geo":{"latitude":10.05,"longitude":-12.86}} |
      | group_identifier      | {"identifier_type":"NationalID","identifier_value":"G9876543210"} |

  # ===========================================================================
  # Incorrect values are rejected
  # ===========================================================================
  Scenario Outline: Farmer attribute "<attribute>" rejects <value>
    Given the "full" farmer record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be rejected because of "<error>"

    Examples: Code lists
      | attribute                                                                | value                           | error                                                |
      | farm_type                                                                | "Smallholder"                   | is not a code or label of FarmTypeEnum               |
      | farm_type                                                                | "7"                             | is not a code or label of FarmTypeEnum               |
      | farm_type                                                                | 1                               | /farm_type must be string                            |
      | farm_details.0.land_tenure                                               | "Rented"                        | is not a code or label of LandTenureEnum             |
      | farm_details.0.measurment                                                | "hectare"                       | is not a code or label of MeasurmentUnitEnum         |
      | farm_details.0.farming_activities.crop_production.0.activity_group       | "11"                            | is not a code or label of CropActivityEnum           |
      | farm_details.0.farming_activities.crop_production.0.crop_type_name       | "Maize"                         | is not a code or label of CropTypeEnum               |
      | farm_details.0.farming_activities.crop_production.0.end_use              | ["Export"]                      | is not a code or label of CropEnduseEnum             |
      | farm_details.0.farming_activities.crop_production.0.irrigation_water     | ["Rain"]                        | is not a code or label of IrrigationWaterEnum        |
      | farm_details.0.farming_activities.crop_production.0.fertilizer_type      | ["NPK"]                         | is not a code or label of FertilizerTypeEnum         |
      | farm_details.0.farming_activities.animal_production.0.type               | "Cattle"                        | is not a code or label of AnimalsEnum                |
      | farm_details.0.farming_activities.animal_production.0.livestock_system   | "Free range"                    | is not a code or label of LivestockSystemEnum        |
      | farm_details.0.farming_activities.agri_support_activities                | ["Harvesting"]                  | is not a code or label of AgriSupportActivityEnum    |
      | farm_details.0.farming_activities.agroforestry                           | ["Beekeeping"]                  | is not a code or label of ForestActivityEnum         |
      | farm_details.1.farming_activities.aquaculture                            | ["Marine aquafarming"]          | is not a code or label of AquaCultureEnum            |
      | farm_details.1.farming_activities.aqua_support_activities                | "Fishing"                       | is not a code or label of AquaSupportActivityEnum    |
      | machineries_details.0.type                                               | "Machine powered equipment"     | is not a code or label of MachineriesEnum            |
      | machineries_details.0.equipement_source                                  | "Rented"                        | is not a code or label of EquipmentSource            |

    Examples: Types, ranges and structure
      | attribute                                                             | value                    | error                                                     |
      | farm_details                                                          | {"farm_type":"1"}        | /farm_details must be array                               |
      | farm_details.0.land_size                                              | 0                        | /farm_details/0/land_size must be > 0                     |
      | farm_details.0.land_size                                              | -3                       | /farm_details/0/land_size must be > 0                     |
      | farm_details.0.land_size                                              | "3.5"                    | /farm_details/0/land_size must be number                  |
      | farm_details.0.location.geo                                           | {"latitude":95,"longitude":10} | /farm_details/0/location/geo/latitude must be <= 90  |
      | farm_details.0.location.geo                                           | {"latitude":9}           | must have required property 'longitude'                   |
      | farm_details.0.location                                               | "Kindia"                 | /farm_details/0/location must be object                   |
      | farm_details.0.farming_activities.crop_production                     | {"crop_type_name":"1"}   | /crop_production must be array                            |
      | farm_details.0.farming_activities.crop_production.0.irrigation        | "yes"                    | /irrigation must be boolean                               |
      | farm_details.0.farming_activities.mixed_farming                       | 1                        | /mixed_farming must be boolean                            |
      | farm_details.0.farming_activities.animal_production.0.count           | -1                       | /count must be >= 0                                       |
      | farm_details.0.farming_activities.animal_production.0.count           | 2.5                      | /count must be integer                                    |
      | farm_details.0.farming_activities.animal_production.0.count           | "6"                      | /count must be integer                                    |
      | machineries_details.0.count                                           | -2                       | /machineries_details/0/count must be >= 0                 |
      | machineries_details                                                   | {"type":"10"}            | /machineries_details must be array                        |
      | farmer_personal_details                                               | "FR-0001"                | /farmer_personal_details must be object                   |
      | family_details                                                        | []                       | /family_details must be object                            |

    Examples: Dates
      | attribute                                                    | value                  | error                                                          |
      | registration_date                                            | "01/04/2020"           | /registration_date must match pattern                          |
      | registration_date                                            | "2020-02-30"           | registration_date "2020-02-30" is not a valid ISO 8601 calendar date |
      | last_updated                                                 | "2999-01-01"           | last_updated "2999-01-01" is in the future                     |
      | farm_details.0.registration_date                             | "2020-13-01"           | /farm_details/0/registration_date must match pattern           |
      | farm_details.0.farming_activities.crop_production.0.last_updated | "2024-02-31"       | crop_production[0].last_updated "2024-02-31" is not a valid ISO 8601 calendar date |
      | machineries_details.0.registration_date                      | 20200401               | /machineries_details/0/registration_date must be string        |

  Scenario Outline: Person attribute "<attribute>" rejects <value>
    Given the "full" person record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be rejected because of "<error>"

    Examples:
      | attribute        | value                                                       | error                                              |
      | identifier       | [{"identifier_type":"UIN"}]                                 | must have required property 'identifier_value'     |
      | identifier       | [{"identifier_value":"810000001"}]                          | must have required property 'identifier_type'      |
      | identifier       | [{"identifier_type":"UIN","identifier_value":""}]           | /identifier/0/identifier_value must NOT have fewer than 1 characters |
      | identifier       | [{"identifier_type":"National ID","identifier_value":"1"}]  | /identifier/0/identifier_type must match pattern   |
      | identifier       | []                                                          | /identifier must NOT have fewer than 1 items       |
      | identifier       | "810000001"                                                 | /identifier must be object                         |
      | name             | {"prefix":"Mrs"}                                            | must have required property 'surname'              |
      | name             | "Amina Diallo"                                              | /name must be object                               |
      | name             | {"given_name":42}                                           | /name/given_name must be string                    |
      | sex              | "F"                                                         | is not a code or label of SexCategoryEnum          |
      | sex              | "woman"                                                     | is not a code or label of SexCategoryEnum          |
      | gender           | "girl"                                                      | is not a code or label of SexCategoryEnum          |
      | birth_date       | "12-04-1985"                                                | /birth_date must match pattern                     |
      | birth_date       | "1985-02-29"                                                | birth_date "1985-02-29" is not a valid ISO 8601 calendar date |
      | birth_date       | "2999-01-01"                                                | birth_date "2999-01-01" is in the future           |
      | date_of_birth    | "1985/04/12"                                                | /date_of_birth must match pattern                  |
      | death_date       | "yesterday"                                                 | /death_date must match pattern                     |
      | phone_number     | ["0622000001"]                                              | /phone_number/0 must match pattern                 |
      | phone_number     | "+224622000001"                                             | /phone_number must be array                        |
      | email            | ["amina.example.org"]                                       | /email/0 must match format "email"                 |
      | address          | [{"country_code":"Guinea"}]                                 | /country_code must match pattern                   |
      | address          | []                                                          | /address must NOT have fewer than 1 items          |
      | address          | [{"geo_location":{"plus_code":{"global_code":"not-a-code"}}}] | /global_code must match pattern                  |

  Scenario Outline: Member attribute "<attribute>" rejects <value>
    Given the "full" member record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be rejected because of "<error>"

    Examples:
      | attribute                           | value                                                          | error                                              |
      | member_identifier                   | [{"identifier_type":"UIN"}]                                    | must have required property 'identifier_value'     |
      | demographic_info                    | "Amina"                                                        | /demographic_info must be object                   |
      | demographic_info.sex                | "F"                                                            | is not a code or label of SexCategoryEnum          |
      | is_disabled                         | "no"                                                           | /is_disabled must be boolean                       |
      | marital_status                      | "Partnered"                                                    | is not a code or label of MaritalStatusEnum        |
      | marital_status                      | "m."                                                           | is not a code or label of MaritalStatusEnum        |
      | employment_status                   | "Farmer"                                                       | is not a code or label of EmploymentStatusEnum     |
      | occupation                          | "10"                                                           | is not a code or label of OccupationEnum           |
      | education_level                     | "University"                                                   | is not a code or label of EducationCodeEnum        |
      | language_code                       | "English"                                                      | /language_code must match pattern                  |
      | income_level                        | ""                                                             | /income_level must NOT have fewer than 1 characters |
      | related_person                      | {"relationship_type":"WIFE"}                                   | /related_person must be array                      |
      | related_person.0.relationship_type  | "spouse of"                                                    | is not a code or label of RelationshipTypeEnum     |
      | related_person.0.related_member     | {"identifier":[{"identifier_type":"UIN"}]}                     | must have required property 'identifier_value'     |
      | disability_info                     | [{"disability_limitation_type":"Blind"}]                       | is not a code or label of FunctionalLimitationType |
      | additional_attributes               | [{}]                                                           | /additional_attributes/0 must NOT have fewer than 1 properties |
      | additional_attributes               | {"coop":"A"}                                                   | /additional_attributes must be array               |

  Scenario Outline: A disabled member's disability severity must be in the list: <value>
    Given the "disabled" member record
    When its "disability_info" attribute is set to '<value>'
    Then the record should be rejected because of "is not a code or label of FunctionalSeverityEnum"

    Examples:
      | value                                                                     |
      | [{"disability_limitation_type":"MOB_SS","functional_severity":"5"}]       |
      | [{"disability_limitation_type":"MOB_SS","functional_severity":"severe"}]  |

  Scenario Outline: Group attribute "<attribute>" rejects <value>
    Given the "family" group record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be rejected because of "<error>"

    Examples:
      | attribute                  | value                                     | error                                              |
      | group_identifier           | [{"identifier_value":"G-0001"}]           | must have required property 'identifier_type'      |
      | group_type                 | "clan"                                    | is not a code or label of AssistanceUnitEnum       |
      | group_type                 | 2                                         | /group_type must be string                         |
      | group_size                 | 0                                         | /group_size must be >= 1                           |
      | group_size                 | 3.5                                       | /group_size must be integer                        |
      | group_size                 | "3"                                       | /group_size must be integer                        |
      | poverty_score              | -1                                        | /poverty_score must be >= 0                        |
      | poverty_score              | "high"                                    | /poverty_score must be number                      |
      | poverty_score_type         | ""                                        | /poverty_score_type must NOT have fewer than 1 characters |
      | place_address              | "yes"                                     | /place_address must be boolean                     |
      | member_list                | {"member_identifier":[]}                  | /member_list must be array                         |
      | member_list.0.marital_status | "Wed"                                   | is not a code or label of MaritalStatusEnum        |
      | group_head_info.demographic_info.birth_date | "1980-11-31"             | group_head_info.demographic_info.birth_date "1980-11-31" is not a valid ISO 8601 calendar date |
      | geographical_location      | {"geo":{"latitude":10,"longitude":-200}}  | /geographical_location/geo/longitude must be >= -180 |

  # ===========================================================================
  # Consistency rules (attributes must not contradict each other)
  # ===========================================================================
  Scenario Outline: Inconsistent farmer data is rejected: <case>
    Given the "<record>" farmer record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be rejected because of "<error>"

    Examples:
      | case                                          | record | attribute                                                          | value                         | error                                                          |
      | not mixed farming but crops and animals       | full   | farm_details.0.farming_activities.mixed_farming                    | false                         | mixed_farming is false but both crop_production and animal_production are reported |
      | mixed farming without animals                 | full   | farm_details.0.farming_activities.animal_production                | []                            | mixed_farming is true but animal_production is empty           |
      | mixed farming without crops                   | full   | farm_details.0.farming_activities.crop_production                  | []                            | mixed_farming is true but crop_production is empty             |
      | irrigation water for a rain-fed crop          | full   | farm_details.0.farming_activities.crop_production.1.irrigation_water | ["1"]                       | irrigation is false but irrigation_water is given              |
      | the same fertilizer twice (code and label)    | full   | farm_details.0.farming_activities.crop_production.0.fertilizer_type | ["3","Organic fertilizers"]  | fertilizer_type repeats 3                                      |
      | the same end use twice                        | full   | farm_details.0.farming_activities.crop_production.0.end_use        | ["1","1"]                     | end_use repeats 1                                              |
      | the same aquaculture twice                    | full   | farm_details.1.farming_activities.aquaculture                      | ["0321","marine aquaculture"] | aquaculture repeats 0321                                       |
      | land size without a unit                      | full   | farm_details.0.measurment                                          | <removed>                     | land_size 3.5 is given without a measurement unit              |
      | two different measurement units               | full   | farm_details.0.measurement                                         | "AC"                          | disagree (two spellings of the same attribute)                 |
      | two different crop types                      | full   | farm_details.0.farming_activities.crop_production.0.crop_type      | "Cereals and rice"            | is not a code or label of CropTypeEnum                         |
      | two different crop type spellings             | full   | farm_details.0.farming_activities.crop_production.0.crop_type      | "2"                           | disagree (two spellings of the same attribute)                 |
      | both location and place                       | full   | farm_details.0.place                                               | {"name":"Other plot"}         | gives both location and place                                  |
      | two equipment source spellings disagree       | full   | machineries_details.0.equipment_source                             | "3"                           | disagree (two spellings of the same attribute)                 |
      | both farmer and famer personal details        | full   | famer_personal_details                                             | {"member_identifier":[{"identifier_type":"FRN","identifier_value":"FR-0001"}]} | gives both farmer_personal_details and famer_personal_details |
      | farmer registered before being born           | full   | registration_date                                                  | "1975-01-01"                  | registration_date 1975-01-01 is before the farmer's birth date 1980-11-02 |
      | farm updated before being registered          | full   | farm_details.0.last_updated                                        | "2019-01-01"                  | farm_details[0].last_updated 2019-01-01 is before registration_date 2020-04-01 |
      | crop updated before being registered          | full   | farm_details.0.farming_activities.crop_production.0.last_updated   | "2020-03-31"                  | crop_production[0].last_updated 2020-03-31 is before registration_date 2020-04-01 |
      | machinery updated before being registered     | full   | machineries_details.0.last_updated                                 | "2019-12-31"                  | machineries_details[0].last_updated 2019-12-31 is before registration_date 2020-04-01 |
      | farmer updated before being registered        | full   | last_updated                                                       | "2020-03-01"                  | record.last_updated 2020-03-01 is before registration_date 2020-04-01 |

  Scenario Outline: Inconsistent person data is rejected: <case>
    Given the "<record>" person record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be rejected because of "<error>"

    Examples:
      | case                                  | record   | attribute        | value                                                                                 | error                                                    |
      | death before birth                    | deceased | death_date       | "1949-12-31"                                                                          | death_date 1949-12-31 is before the birth date 1950-01-30 |
      | registered before birth               | full     | registration_date | "1980-01-01"                                                                         | registration_date 1980-01-01 is before the birth date 1985-04-12 |
      | updated before registration           | full     | last_updated     | "2018-01-01"                                                                          | last_updated 2018-01-01 is before registration_date 2019-03-01 |
      | sex and gender disagree               | full     | gender           | "male"                                                                                | record.sex "female" and record.gender "male" disagree    |
      | birth date spellings disagree         | full     | date_of_birth    | "1985-04-13"                                                                          | birth_date "1985-04-12" and record.date_of_birth "1985-04-13" disagree |
      | given and first name disagree         | full     | name.first_name  | "Aminata"                                                                             | name.given_name "Amina" and record.name.first_name "Aminata" disagree |
      | duplicate identifiers                 | full     | identifier       | [{"identifier_type":"UIN","identifier_value":"1"},{"identifier_type":"UIN","identifier_value":"1"}] | identifier contains duplicate identifiers: UIN\|1 |

  Scenario Outline: Inconsistent member data is rejected: <case>
    Given the "<record>" member record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be rejected because of "<error>"

    Examples:
      | case                                       | record   | attribute                         | value                                                                     | error                                                  |
      | disability details for a non-disabled one  | full     | disability_info                   | [{"disability_limitation_type":"VIS_SS","functional_severity":"2"}]       | is_disabled is false but disability_info lists 1       |
      | disabled flag removed from details         | disabled | is_disabled                       | false                                                                     | is_disabled is false but disability_info lists 1       |
      | related person is the member themself      | full     | related_person.0.related_member   | {"identifier":[{"identifier_type":"UIN","identifier_value":"810000001"}]} | related_person[0] is the member themself (UIN\|810000001) |
      | member registered before birth             | full     | registration_date                 | "1984-01-01"                                                              | registration_date 1984-01-01 is before the member's birth date 1985-04-12 |
      | member updated before registration         | full     | last_updated                      | "2019-01-01"                                                              | record.last_updated 2019-01-01 is before registration_date 2019-03-01 |
      | duplicate member identifiers               | full     | member_identifier                 | [{"identifier_type":"UIN","identifier_value":"7"},{"identifier_type":"UIN","identifier_value":"7"}] | member_identifier contains duplicate identifiers |
      | related person died before being born      | widow    | related_person.0.related_member.death_date | "1940-01-01"                                                     | death_date 1940-01-01 is before the birth date 1950-01-30 |

  Scenario Outline: Inconsistent group data is rejected: <case>
    Given the "<record>" group record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be rejected because of "<error>"

    Examples:
      | case                                         | record     | attribute                                    | value                     | error                                                              |
      | more members disclosed than the group size   | family     | group_size                                   | 2                         | group_size 2 is smaller than the 3 distinct members disclosed      |
      | the same member listed twice                 | family     | member_list.1                                | {"member_identifier":[{"identifier_type":"UIN","identifier_value":"810000001"}]} | member_list lists the same member more than once: UIN\|810000001 |
      | single-member group with several members     | family     | group_type                                   | "1"                       | (single member) but the group has more than one member             |
      | single-member group bigger than one          | individual | group_size                                   | 2                         | (single member) but the group has more than one member             |
      | deceased group head                          | family     | group_head_info.demographic_info.death_date  | "2023-05-01"              | group_head_info is deceased                                        |
      | member registered before birth               | family     | member_list.1.registration_date              | "2009-01-01"              | member_list[1].registration_date 2009-01-01 is before the member's birth date 2010-07-21 |
      | group updated before registration            | family     | last_updated                                 | "2019-01-01"              | record.last_updated 2019-01-01 is before registration_date 2019-02-20 |
      | duplicate group identifiers                  | family     | group_identifier                             | [{"identifier_type":"GID","identifier_value":"G-1"},{"identifier_type":"GID","identifier_value":"G-1"}] | group_identifier contains duplicate identifiers |

  Scenario Outline: Consistent data is accepted: <case>
    Given the "<record>" <kind> record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be valid

    Examples:
      | case                                     | kind   | record    | attribute                                                   | value                  |
      | head repeated in member_list             | group  | household | group_size                                                  | 1                      |
      | group larger than its disclosed members  | group  | family    | group_size                                                  | 9                      |
      | crop and animals without the mixed flag  | farmer | full      | farm_details.0.farming_activities.mixed_farming             | <removed>              |
      | mixed farming without detailed activities | farmer | crop     | farm_details.0.farming_activities.0                         | {"mixed_farming":true} |
      | irrigated crop with no water source given | farmer | full     | farm_details.0.farming_activities.crop_production.0.irrigation_water | <removed>     |
      | relationship SELF pointing to the member | member | full      | related_person.0                                            | {"relationship_type":"SELF","related_member":{"identifier":[{"identifier_type":"UIN","identifier_value":"810000001"}]}} |
      | sex and gender as code and label         | person | full      | gender                                                      | "Female"               |
      | same day birth date as date and date-time | person | full     | date_of_birth                                               | "1985-04-12T00:00:00Z" |
      | registration on the day of birth         | person | child     | registration_date                                           | "2010-07-21"           |
      | land without a size needs no unit        | farmer | full      | farm_details.0.land_size                                    | <removed>              |

  # ===========================================================================
  # Strict attribute mode (STRICT_ATTRIBUTES=true): attributes the FR data model does not
  # define are refused, which catches misspellings. By default they are accepted as
  # registry extensions.
  # ===========================================================================
  Scenario Outline: An undefined attribute "<attribute>" is accepted by default but refused in strict mode
    Given the "<record>" <kind> record
    When its "<attribute>" attribute is set to '<value>'
    Then the record should be rejected in strict attribute mode because of "<attribute name>"

    Examples:
      | kind   | record | attribute                                                | value      | attribute name   |
      | farmer | full   | farm_details.0.farm_size                                 | 3.5        | farm_size        |
      | farmer | full   | farmer_details                                           | {}         | farmer_details   |
      | farmer | full   | farm_details.0.farming_activities.crop_production.0.crop | "Maize"    | crop             |
      | farmer | full   | machineries_details.0.quantity                           | 3          | quantity         |
      | person | full   | gender_identity                                          | "female"   | gender_identity  |
      | member | full   | maritalStatus                                            | "M"        | maritalStatus    |
      | group  | family | household_size                                           | 3          | household_size   |

  Scenario Outline: Every reference <kind> record "<record>" is valid in strict attribute mode
    Given the "<record>" <kind> record
    Then the record should be valid in strict attribute mode

    Examples:
      | kind   | record                 |
      | farmer | full                   |
      | farmer | crop                   |
      | farmer | spec example corrected |
      | person | full                   |
      | member | full                   |
      | group  | family                 |

  # ===========================================================================
  # Encrypted payloads
  # ===========================================================================
  Scenario Outline: An encrypted "<action>" message must be a complete EncryptedMessage
    Given an encrypted "<action>" message
    Then the encrypted message should be valid

    Examples:
      | action        |
      | on-search     |
      | on-subscribe  |
      | notify        |
      | txn-on-status |

  Scenario Outline: An encrypted message missing "<field>" is rejected
    Given an encrypted "on-search" message
    When its encrypted field "<field>" is removed
    Then the encrypted message should be rejected because of "<error>"

    Examples:
      | field         | error                                             |
      | ciphertext    | must have required property 'ciphertext'          |
      | encrypted_key | must have required property 'encrypted_key'       |
      | tag           | must have required property 'tag'                 |
      | iv            | must have required property 'iv'                  |
      | header        | /message must have required property 'header'     |
      | header.kid    | /message/header must have required property 'kid' |
