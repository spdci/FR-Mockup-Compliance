@method=POST @endpoint=fr/on-search
Feature: Receive async search results from the Farmer Registry (POST /registry/on-search)

This API is exposed by the SP. The FR calls it after processing an async search.
The suite plays the FR: every payload is first checked against the spec (including the
FR data rules for farmer, person, member and group records), then the SP must acknowledge it.
An SP must refuse results whose record data breaks the spec (@strict-data).

  Background:
    Given the "on-search" endpoint

  @smoke
  Scenario: Successfully receive farmer search results
    Given an on-search callback carrying the "farmer" records "full"
    Then the request should be a valid "on-search" message
    When the request is sent
    Then the HTTP status should be 200
    And the response should have a JSON content type
    And the response should be received within 15000 ms
    And the response should be a valid acknowledgement with ack_status "ACK"

  @functional
  Scenario Outline: <kind> search results "<records>" are acknowledged
    Given an on-search callback carrying the "<kind>" records "<records>"
    Then the request should be a valid "on-search" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

    Examples: Farmer results
      | kind   | records                              |
      | farmer | full                                 |
      | farmer | crop, livestock, widow               |
      | farmer | minimal                              |
      | farmer | spec example corrected               |

    Examples: Person results
      | kind   | records                              |
      | person | full, male, child                    |
      | person | deceased, labels, minimal            |

    Examples: Member results
      | kind   | records                              |
      | member | full, disabled, widow                |
      | member | labels, minimal                      |

    Examples: Group results
      | kind   | records                              |
      | group  | family, household                    |
      | group  | widow, individual, minimal           |

  @functional
  Scenario Outline: An empty <kind> result is acknowledged
    Given an on-search callback with an empty "<kind>" result
    Then the request should be a valid "on-search" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

    Examples:
      | kind   |
      | farmer |
      | group  |

  @functional
  Scenario Outline: A rejected search with reason code <code> is acknowledged
    Given an on-search callback rejected with reason code "<code>"
    Then the request should be a valid "on-search" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

    Examples: SearchStatusReasonCode
      | code                               |
      | rjct.reference_id.invalid          |
      | rjct.reference_id.duplicate        |
      | rjct.timestamp.invalid             |
      | rjct.search_criteria.invalid       |
      | rjct.filter.invalid                |
      | rjct.sort.invalid                  |
      | rjct.pagination.invalid            |
      | rjct.search.too_many_records_found |

  @negative
  Scenario Outline: An invalid on-search callback is rejected: <case>
    Given a valid request
    And the request field "<field>" becomes '<value>'
    When the request is sent
    Then the request should be rejected according to the DCI error model

    Examples: Envelope and search response
      | case                     | field                                        | value                |
      | missing header           | header                                       | <removed>            |
      | wrong action             | header.action                                | "search"             |
      | missing header status    | header.status                                | <removed>            |
      | unknown header status    | header.status                                | "done"               |
      | missing transaction_id   | message.transaction_id                       | <removed>            |
      | missing correlation_id   | message.correlation_id                       | <removed>            |
      | invalid correlation_id   | message.correlation_id                       | "id with spaces"     |
      | missing search_response  | message.search_response                      | <removed>            |
      | unknown item status      | message.search_response.0.status             | "ok"                 |
      | unknown reason code      | message.search_response.0.status_reason_code | "rjct.farmer.unknown" |
      | missing reg_record_type  | message.search_response.0.data.reg_record_type | <removed>          |
      | reg_records not a list   | message.search_response.0.data.reg_records   | {"farm_type":"1"}    |
      | pagination incomplete    | message.search_response.0.pagination         | {"page_size":10}     |

    @strict-data
    Examples: Farmer data in the results
      | case                          | field                                                                          | value                 |
      | farm type outside code list   | message.search_response.0.data.reg_records.0.farm_type                         | "Smallholder"         |
      | land tenure outside code list | message.search_response.0.data.reg_records.0.farm_details.0.land_tenure        | "Rented"              |
      | negative land size            | message.search_response.0.data.reg_records.0.farm_details.0.land_size          | -1                    |
      | animal type outside code list | message.search_response.0.data.reg_records.0.farm_details.0.farming_activities.animal_production.0.type | "Cattle" |
      | animal count not an integer   | message.search_response.0.data.reg_records.0.farm_details.0.farming_activities.animal_production.0.count | "six" |
      | irrigation not a boolean      | message.search_response.0.data.reg_records.0.farm_details.0.farming_activities.crop_production.0.irrigation | "yes" |
      | machinery outside code list   | message.search_response.0.data.reg_records.0.machineries_details.0.type        | "Tractor"             |
      | farmer sex outside code list  | message.search_response.0.data.reg_records.0.farmer_personal_details.demographic_info.sex | "M"        |
      | farmer birth date not ISO     | message.search_response.0.data.reg_records.0.farmer_personal_details.demographic_info.birth_date | "02/11/1980" |
      | group type outside code list  | message.search_response.0.data.reg_records.0.family_details.group_type         | "clan"                |
      | group size zero               | message.search_response.0.data.reg_records.0.family_details.group_size         | 0                     |
      | member identifier incomplete  | message.search_response.0.data.reg_records.0.family_details.member_list.0.member_identifier | [{"identifier_type":"UIN"}] |
      | farm location latitude        | message.search_response.0.data.reg_records.0.farm_details.0.location.geo       | {"latitude":120,"longitude":10} |
