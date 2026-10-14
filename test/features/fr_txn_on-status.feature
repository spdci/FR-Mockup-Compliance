@method=POST @endpoint=fr/txn/on-status
Feature: Receive a transaction status from the Farmer Registry (POST /registry/txn/on-status)

This API is exposed by the SP to receive the result of an async transaction status request.
For a search transaction the status carries the records found, checked against the FR data rules.

  Background:
    Given the "txn on-status" endpoint

  @smoke
  Scenario: Successfully receive the status of a farmer search transaction
    Given a txn on-status callback for a "search" transaction on "farmer" records
    Then the request should be a valid "txn-on-status" message
    When the request is sent
    Then the HTTP status should be 200
    And the response should have a JSON content type
    And the response should be received within 15000 ms
    And the response should be a valid acknowledgement with ack_status "ACK"

  @functional
  Scenario Outline: The status of a <txn type> transaction on <kind> records is acknowledged
    Given a txn on-status callback for a "<txn type>" transaction on "<kind>" records
    Then the request should be a valid "txn-on-status" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

    Examples:
      | txn type    | kind   |
      | search      | person |
      | search      | member |
      | search      | group  |
      | subscribe   | farmer |
      | unsubscribe | farmer |

  @negative
  Scenario Outline: An invalid txn on-status callback is rejected: <case>
    Given a valid request
    And the request field "<field>" becomes '<value>'
    When the request is sent
    Then the request should be rejected according to the DCI error model

    Examples:
      | case                         | field                                                  | value         |
      | missing header               | header                                                 | <removed>     |
      | wrong action                 | header.action                                          | "txn-status"  |
      | missing correlation_id       | message.correlation_id                                 | <removed>     |
      | missing txnstatus_response   | message.txnstatus_response                             | <removed>     |
      | unknown txn_type             | message.txnstatus_response.txn_type                    | "notify"      |
      | txn_status of the wrong type | message.txnstatus_response.txn_type                    | "unsubscribe" |

    @strict-data
    Examples: Farmer data in the status
      | case                         | field                                                                                    | value      |
      | farm type outside code list  | message.txnstatus_response.txn_status.search_response.0.data.reg_records.0.farm_type     | "Big"      |
      | machinery count negative     | message.txnstatus_response.txn_status.search_response.0.data.reg_records.0.machineries_details.0.count | -1 |
