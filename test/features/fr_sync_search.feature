@method=POST @endpoint=fr/sync/search
Feature: Synchronous search of the Farmer Registry (POST /registry/sync/search)

This API is exposed by the FR and called by SP systems or other registries.
The response carries a callback header (action "on-search") and a SearchResponse.
The FR answers four kinds of searches, selected by search_criteria.reg_record_type:
farmer search (default), person search, member search and group search.
Every returned record is checked against the FR data rules: attributes are optional,
but whatever is returned must be correct.

  Background:
    Given the "sync search" endpoint

  @smoke
  Scenario: Successful farmer search by farmer registration number
    Given a "farmer" search by identifier for the "full" test record
    Then the request should be a valid "search" message
    When the request is sent
    Then the HTTP status should be 200
    And the response should have a JSON content type
    And the response should be received within 15000 ms
    And the response should be a valid "sync-search-response" message
    And every search result should have status "succ"
    And every search result should carry "farmer" records
    And the result should contain the record identified by the query
    And every returned record should be valid FR data

  # ---------------------------------------------------------------------------
  # Search by identifier, every kind of record and every data profile
  # ---------------------------------------------------------------------------
  @functional
  Scenario Outline: <kind> search by identifier returns correct data for the "<profile>" record
    Given a "<kind>" search by identifier for the "<profile>" test record
    Then the request should be a valid "search" message
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And every search result should have status "succ"
    And every search result should carry "<kind>" records
    And the result should contain the record identified by the query
    And at least 1 record should be returned
    And every returned record should be valid FR data

    Examples: Farmer search
      | kind   | profile        |
      | farmer | full           |
      | farmer | crop           |
      | farmer | livestock      |
      | farmer | widow          |
      | farmer | minimal        |
      | farmer | by national id |
      | farmer | spec example   |

    Examples: Person search
      | kind   | profile  |
      | person | full     |
      | person | male     |
      | person | child    |
      | person | deceased |
      | person | widow    |
      | person | labels   |
      | person | minimal  |

    Examples: Member search
      | kind   | profile  |
      | member | full     |
      | member | male     |
      | member | child    |
      | member | disabled |
      | member | widow    |
      | member | labels   |
      | member | minimal  |

    Examples: Group search
      | kind  | profile      |
      | group | family       |
      | group | household    |
      | group | widow        |
      | group | individual   |
      | group | minimal      |
      | group | by member id |

  @functional
  Scenario: A search without reg_record_type is answered with Farmer records
    Given a search without reg_record_type by identifier for the "full" test farmer
    Then the request should be a valid "search" message
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And every search result should have status "succ"
    And every search result should carry "farmer" records
    And every returned record should be valid FR data

  @functional @mock
  Scenario Outline: The record type may be spelled "<record type>"
    Given a "<kind>" search by identifier for the "<profile>" test record
    And the search asks for the record type "<record type>"
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And every search result should carry "<kind>" records
    And the result should contain the record identified by the query
    And every returned record should be valid FR data

    Examples:
      | kind   | profile | record type           |
      | farmer | full    | FarmerRecord          |
      | farmer | full    | spdci-extensions-fr:Farmer |
      | person | full    | FRPerson              |
      | member | full    | FRMember              |
      | group  | family  | FRGroup               |
      | group  | family  | spdci:group           |

  @functional @mock
  Scenario: An unknown record type is rejected with a coded reason
    Given a "farmer" search by identifier for the "full" test record
    And the search asks for the record type "spdci-extensions-dci:Vehicle"
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And the search result should be rejected with reason code "rjct.search_criteria.invalid"

  # ---------------------------------------------------------------------------
  # Query types
  # ---------------------------------------------------------------------------
  @functional
  Scenario Outline: <kind> predicate search only returns records matching every condition
    Given a "<kind>" predicate search
    Then the request should be a valid "search" message
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And every search result should have status "succ"
    And every search result should carry "<kind>" records
    And every returned record should satisfy the predicate
    And every returned record should be valid FR data

    Examples:
      | kind   |
      | farmer |
      | person |
      | member |
      | group  |

  @functional
  Scenario Outline: <kind> <query type> search is answered with a valid result
    Given a "<kind>" <query type> search
    Then the request should be a valid "search" message
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And every returned record should be valid FR data

    Examples:
      | kind   | query type |
      | farmer | expression |
      | farmer | graphql    |
      | person | expression |
      | person | graphql    |
      | member | expression |
      | member | graphql    |
      | group  | expression |
      | group  | graphql    |

  # ---------------------------------------------------------------------------
  # Optional search criteria: pagination, sort, locale, consent / authorize
  # ---------------------------------------------------------------------------
  @functional
  Scenario Outline: Pagination of a <kind> search is honoured (page <page>, page_size <size>)
    Given a "<kind>" predicate search
    And the search requests page <page> with page_size <size>
    Then the request should be a valid "search" message
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And the search result pagination should report page <page> with at most <size> records per page
    And every returned record should be valid FR data

    Examples:
      | kind   | page | size |
      | farmer | 1    | 1    |
      | farmer | 2    | 1    |
      | farmer | 1    | 2    |
      | farmer | 1    | 100  |
      | person | 2    | 2    |
      | member | 1    | 1    |
      | group  | 2    | 1    |

  @functional
  Scenario Outline: Sorting a <kind> search by <attribute> <order> is honoured
    Given a "<kind>" predicate search
    And the search results are sorted by "<attribute>" in "<order>" order
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And the returned records should be sorted by "<attribute>" in "<order>" order

    Examples:
      | kind   | attribute         | order |
      | farmer | registration_date | asc   |
      | farmer | registration_date | desc  |
      | person | birth_date        | asc   |
      | person | birth_date        | desc  |
      | member | registration_date | asc   |
      | group  | group_size        | desc  |

  @functional
  Scenario: The requested locale is honoured
    Given a "farmer" search by identifier for the "full" test record
    And the search request asks for locale "fra"
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And every requested locale should be honoured

  @functional
  Scenario: A search carrying consent and authorize information is accepted
    Given a "farmer" search by identifier for the "full" test record
    And the search request carries consent and authorize information
    Then the request should be a valid "search" message
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And every search result should have status "succ"

  # ---------------------------------------------------------------------------
  # Batch, not found, rejection by the registry
  # ---------------------------------------------------------------------------
  @functional
  Scenario: A batch farmer search answers every request item with its own result
    Given a batch "farmer" search for the test records "full, crop, livestock, unknown"
    Then the request should be a valid "search" message
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And each batch item should be answered with its own result
    And every returned record should be valid FR data

  @functional
  Scenario: A batch search may mix farmer, person, member and group searches
    Given a batch search mixing the test records "farmer:full, person:child, member:disabled, group:household"
    Then the request should be a valid "search" message
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And each batch item should be answered with its own result
    And every returned record should be valid FR data

  @functional
  Scenario Outline: Searching an unknown <kind> returns no record or a coded rejection
    Given a "<kind>" search by identifier for the "unknown" test record
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And the search result should be empty or rejected with a valid reason code

    Examples:
      | kind   |
      | farmer |
      | person |
      | member |
      | group  |

  @functional @mock
  Scenario: A rejected search item carries a spec reason code and no data
    Given a "farmer" search by identifier for the "too many" test record
    When the request is sent
    Then the response should be a valid "sync-search-response" message
    And the search result should be rejected with reason code "rjct.search.too_many_records_found"

  # ---------------------------------------------------------------------------
  # Requests that break the spec must be refused
  # ---------------------------------------------------------------------------
  @negative
  Scenario Outline: An invalid request is rejected: <case>
    Given a valid request
    And the request field "<field>" becomes '<value>'
    When the request is sent
    Then the request should be rejected according to the DCI error model

    Examples: Envelope and header
      | case                       | field                   | value          |
      | missing header             | header                  | <removed>      |
      | missing message            | message                 | <removed>      |
      | wrong action               | header.action           | "subscribe"    |
      | missing message_id         | header.message_id       | <removed>      |
      | missing message_ts         | header.message_ts       | <removed>      |
      | message_ts not ISO 8601    | header.message_ts       | "13/10/2026"   |
      | missing sender_id          | header.sender_id        | <removed>      |
      | missing total_count        | header.total_count      | <removed>      |
      | total_count not an integer | header.total_count      | "one"          |
      | sender_uri not a URI       | header.sender_uri       | "not a uri"    |
      | is_msg_encrypted not bool  | header.is_msg_encrypted | "no"           |

    Examples: Search request
      | case                         | field                                                   | value                                   |
      | missing transaction_id       | message.transaction_id                                  | <removed>                               |
      | transaction_id too long      | message.transaction_id                                  | "TXN0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" |
      | missing search_request       | message.search_request                                  | <removed>                               |
      | empty search_request         | message.search_request                                  | []                                      |
      | missing reference_id         | message.search_request.0.reference_id                   | <removed>                               |
      | missing timestamp            | message.search_request.0.timestamp                      | <removed>                               |
      | invalid timestamp            | message.search_request.0.timestamp                      | "yesterday"                             |
      | missing search_criteria      | message.search_request.0.search_criteria                | <removed>                               |
      | missing query_type           | message.search_request.0.search_criteria.query_type     | <removed>                               |
      | unknown query_type           | message.search_request.0.search_criteria.query_type     | "sql"                                   |
      | missing query                | message.search_request.0.search_criteria.query          | <removed>                               |
      | query not matching type      | message.search_request.0.search_criteria.query          | [{"expression1":{"attribute_name":"farm_type","operator":"eq","attribute_value":"1"}}] |
      | idtype-value without value   | message.search_request.0.search_criteria.query          | {"type":"FRN"}                          |
      | empty reg_record_type        | message.search_request.0.search_criteria.reg_record_type | ""                                     |
      | invalid locale               | message.search_request.0.locale                         | "english"                               |
      | pagination without page_size | message.search_request.0.search_criteria.pagination     | {"page_number":1}                       |
      | page_size zero               | message.search_request.0.search_criteria.pagination     | {"page_size":0}                         |
      | invalid sort order           | message.search_request.0.search_criteria.sort           | [{"attribute_name":"registration_date","sort_order":"up"}] |
      | consent with invalid ts      | message.search_request.0.search_criteria.consent        | {"ts":"now"}                            |

    Examples: Predicate query
      | case                         | field                                                   | value                                   |
      | unknown operator             | message.search_request.0.search_criteria                | {"query_type":"predicate","query":[{"expression1":{"attribute_name":"farm_type","operator":"like","attribute_value":"1"}}]} |
      | unknown condition            | message.search_request.0.search_criteria                | {"query_type":"predicate","query":[{"expression1":{"attribute_name":"farm_type","operator":"eq","attribute_value":"1"},"condition":"xor","expression2":{"attribute_name":"land_size","operator":"ge","attribute_value":2}}]} |
      | expression without operator  | message.search_request.0.search_criteria                | {"query_type":"predicate","query":[{"expression1":{"attribute_name":"farm_type","attribute_value":"1"}}]} |
      | empty predicate              | message.search_request.0.search_criteria                | {"query_type":"predicate","query":[]}  |

  @negative
  Scenario: A body that is not JSON is rejected
    When the raw body "this is not json" is sent
    Then the request should be rejected according to the DCI error model
