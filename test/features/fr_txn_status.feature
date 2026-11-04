@method=POST @endpoint=fr/txn/status
Feature: Asynchronous transaction status check (POST /registry/txn/status)

This API is exposed by the FR and called by SP systems or other registries.
The FR acknowledges the request, then delivers a TxnStatusResponse to the
txn/on-status callback given in header.sender_uri.

  Background:
    Given the "txn status" endpoint

  @smoke
  Scenario: A transaction status request is acknowledged
    Given a transaction status request for "search" transactions by "transaction_id"
    Then the request should be a valid "txn-status" message
    When the request is sent
    Then the HTTP status should be 200
    And the response should have a JSON content type
    And the response should be received within 15000 ms
    And the response should be a valid acknowledgement with ack_status "ACK"

  @functional
  Scenario Outline: Status of a <txn type> transaction looked up by <attribute type> is acknowledged
    Given a transaction status request for "<txn type>" transactions by "<attribute type>"
    Then the request should be a valid "txn-status" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

    Examples:
      | txn type    | attribute type         |
      | search      | transaction_id         |
      | search      | reference_id_list      |
      | search      | correlation_id         |
      | subscribe   | subscription_code_list |
      | unsubscribe | transaction_id         |

  @callback
  Scenario Outline: The status of a <txn type> transaction is delivered to the txn/on-status callback
    Given a transaction status request for "<txn type>" transactions by "<attribute type>"
    And the callback listener is used as sender_uri
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"
    And an "txn-on-status" callback should be received
    And the callback should be a valid "txn-on-status" message
    And the transaction status should be reported for a "<txn type>" transaction
    And every returned record should be valid FR data

    Examples:
      | txn type    | attribute type         |
      | search      | transaction_id         |
      | subscribe   | subscription_code_list |
      | unsubscribe | correlation_id         |

  @negative
  Scenario Outline: An invalid transaction status request is rejected: <case>
    Given a valid request
    And the request field "<field>" becomes '<value>'
    When the request is sent
    Then the request should be rejected according to the DCI error model

    Examples:
      | case                     | field                                       | value               |
      | missing header           | header                                      | <removed>           |
      | wrong action             | header.action                               | "txn-on-status"     |
      | missing message          | message                                     | <removed>           |
      | missing txnstatus_request | message.txnstatus_request                  | <removed>           |
      | missing reference_id     | message.txnstatus_request.reference_id      | <removed>           |
      | unknown txn_type         | message.txnstatus_request.txn_type          | "notify"            |
      | unknown attribute_type   | message.txnstatus_request.attribute_type    | "farmer_id"         |
      | reference list as string | message.txnstatus_request                   | {"reference_id":"R1","txn_type":"search","attribute_type":"reference_id_list","attribute_value":"REF1"} |
      | invalid locale           | message.txnstatus_request.locale            | "en"                |
