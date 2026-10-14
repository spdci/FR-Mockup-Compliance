@method=POST @endpoint=fr/search
Feature: Asynchronous search of the Farmer Registry (POST /registry/search)

This API is exposed by the FR and called by SP systems or other registries.
The FR acknowledges the request, then delivers a SearchResponse to the
on-search callback given in header.sender_uri. The records delivered in the
callback (farmers, persons, members or groups) are checked against the FR data rules.

  Background:
    Given the "search" endpoint

  @smoke
  Scenario: An async farmer search is acknowledged
    Given a "farmer" search by identifier for the "full" test record
    Then the request should be a valid "search" message
    When the request is sent
    Then the HTTP status should be 200
    And the response should have a JSON content type
    And the response should be received within 15000 ms
    And the response should be a valid acknowledgement with ack_status "ACK"

  @functional
  Scenario Outline: Every kind of search and query type is acknowledged: <request>
    Given <request>
    Then the request should be a valid "search" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

    Examples:
      | request                                                                      |
      | a "farmer" search by identifier for the "crop" test record                   |
      | a "person" search by identifier for the "child" test record                  |
      | a "member" search by identifier for the "disabled" test record               |
      | a "group" search by identifier for the "family" test record                  |
      | a "farmer" predicate search                                                  |
      | a "group" expression search                                                  |
      | a "member" graphql search                                                    |
      | a batch search mixing the test records "farmer:full, person:full, group:widow" |

  # ---------------------------------------------------------------------------
  # Full async round trip: results are delivered to header.sender_uri
  # ---------------------------------------------------------------------------
  @callback
  Scenario Outline: <kind> results for the "<profile>" record are delivered to the on-search callback
    Given a "<kind>" search by identifier for the "<profile>" test record
    And the callback listener is used as sender_uri
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"
    And an "on-search" callback should be received
    And the callback should be a valid "on-search" message
    And every search result should have status "succ"
    And every search result should carry "<kind>" records
    And the result should contain the record identified by the query
    And every returned record should be valid FR data

    Examples:
      | kind   | profile      |
      | farmer | full         |
      | farmer | livestock    |
      | farmer | minimal      |
      | person | full         |
      | person | deceased     |
      | member | disabled     |
      | member | widow        |
      | group  | family       |
      | group  | by member id |

  @callback
  Scenario: A paginated, sorted farmer predicate search is delivered to the on-search callback
    Given a "farmer" predicate search
    And the search requests page 1 with page_size 2
    And the search results are sorted by "registration_date" in "asc" order
    And the callback listener is used as sender_uri
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"
    And an "on-search" callback should be received
    And the callback should be a valid "on-search" message
    And every returned record should satisfy the predicate
    And the search result pagination should report page 1 with at most 2 records per page
    And the returned records should be sorted by "registration_date" in "asc" order
    And every returned record should be valid FR data

  @callback
  Scenario: A mixed batch search is answered item by item in the on-search callback
    Given a batch search mixing the test records "farmer:widow, person:labels, member:full, group:individual"
    And the callback listener is used as sender_uri
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"
    And an "on-search" callback should be received
    And the callback should be a valid "on-search" message
    And each batch item should be answered with its own result
    And every returned record should be valid FR data

  # ---------------------------------------------------------------------------
  # Requests that break the spec must be refused
  # ---------------------------------------------------------------------------
  @negative
  Scenario Outline: An invalid async search is rejected: <case>
    Given a valid request
    And the request field "<field>" becomes '<value>'
    When the request is sent
    Then the request should be rejected according to the DCI error model

    Examples:
      | case                     | field                                                | value          |
      | missing header           | header                                               | <removed>      |
      | missing message          | message                                              | <removed>      |
      | wrong action             | header.action                                        | "on-search"    |
      | missing sender_id        | header.sender_id                                     | <removed>      |
      | invalid message_ts       | header.message_ts                                    | "2026-13-01"   |
      | sender_uri not a URI     | header.sender_uri                                    | "callback"     |
      | missing transaction_id   | message.transaction_id                               | <removed>      |
      | empty search_request     | message.search_request                               | []             |
      | missing search_criteria  | message.search_request.0.search_criteria             | <removed>      |
      | unknown query_type       | message.search_request.0.search_criteria.query_type  | "sql"          |
      | invalid locale           | message.search_request.0.locale                      | "EN"           |
      | encrypted flag without encrypted payload | header.is_msg_encrypted              | true           |

  @negative
  Scenario: A body that is not JSON is rejected
    When the raw body "{not json" is sent
    Then the request should be rejected according to the DCI error model
