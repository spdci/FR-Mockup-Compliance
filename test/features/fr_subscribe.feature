@method=POST @endpoint=fr/subscribe
Feature: Subscribe to Farmer Registry registrations (POST /registry/subscribe)

This API is exposed by the FR and called by SP systems or other registries.
The FR acknowledges the subscription, then delivers the subscription result
(with a subscription code) to the on-subscribe callback given in header.sender_uri.
The FR registry event type is "register" (new registrations).

  Background:
    Given the "subscribe" endpoint

  @smoke
  Scenario: Successfully subscribe to new farmer registrations
    Given a subscribe request for new "farmer" registrations filtered by "idtype-value"
    Then the request should be a valid "subscribe" message
    When the request is sent
    Then the HTTP status should be 200
    And the response should have a JSON content type
    And the response should be received within 15000 ms
    And the response should be a valid acknowledgement with ack_status "ACK"

  @functional
  Scenario Outline: Subscribing to new <kind> registrations filtered by <filter type> is acknowledged
    Given a subscribe request for new "<kind>" registrations filtered by "<filter type>"
    Then the request should be a valid "subscribe" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

    Examples:
      | kind   | filter type  |
      | farmer | idtype-value |
      | farmer | predicate    |
      | farmer | expression   |
      | farmer | graphql      |
      | person | predicate    |
      | member | expression   |
      | group  | idtype-value |
      | group  | predicate    |

  @functional
  Scenario Outline: The namespaced event type "<event>" is accepted
    Given a subscribe request for "<event>" events of "farmer" records
    Then the request should be a valid "subscribe" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

    Examples:
      | event                                   |
      | register                                |
      | spdci-common:RegistryEventType:Register |

  @functional
  Scenario: Several subscriptions in one request are acknowledged
    Given a subscribe request for new registrations of the record kinds "farmer, person, member, group"
    Then the request should be a valid "subscribe" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

  @callback
  Scenario Outline: The <kind> subscription result is delivered to the on-subscribe callback
    Given a subscribe request for new "<kind>" registrations filtered by "predicate"
    And the callback listener is used as sender_uri
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"
    And an "on-subscribe" callback should be received
    And the callback should be a valid "on-subscribe" message
    And every subscription should be confirmed with a subscription code
    And every subscription should keep the requested notify_record_type

    Examples:
      | kind   |
      | farmer |
      | group  |

  @callback
  Scenario: Every subscription of a batch is confirmed in the on-subscribe callback
    Given a subscribe request for new registrations of the record kinds "farmer, person, member, group"
    And the callback listener is used as sender_uri
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"
    And an "on-subscribe" callback should be received
    And the callback should be a valid "on-subscribe" message
    And every subscription should be confirmed with a subscription code
    And every subscription should keep the requested notify_record_type

  @negative
  Scenario Outline: An invalid subscribe request is rejected: <case>
    Given a valid request
    And the request field "<field>" becomes '<value>'
    When the request is sent
    Then the request should be rejected according to the DCI error model

    Examples:
      | case                         | field                                                     | value                    |
      | missing header               | header                                                    | <removed>                |
      | wrong action                 | header.action                                             | "search"                 |
      | missing message              | message                                                   | <removed>                |
      | missing transaction_id       | message.transaction_id                                    | <removed>                |
      | empty subscribe_request      | message.subscribe_request                                 | []                       |
      | missing subscribe_criteria   | message.subscribe_request.0.subscribe_criteria            | <removed>                |
      | missing reg_event_type       | message.subscribe_request.0.subscribe_criteria.reg_event_type | <removed>            |
      | unknown event type           | message.subscribe_request.0.subscribe_criteria.reg_event_type | "update"             |
      | missing filter               | message.subscribe_request.0.subscribe_criteria.filter     | <removed>                |
      | missing notify_record_type   | message.subscribe_request.0.subscribe_criteria.notify_record_type | <removed>        |
      | unknown filter_type          | message.subscribe_request.0.subscribe_criteria.filter_type | "sql"                   |
      | frequency without end_time   | message.subscribe_request.0.subscribe_criteria.frequency  | {"start_time":"2026-01-01T00:00:00Z","frequency":"daily"} |
      | invalid frequency start_time | message.subscribe_request.0.subscribe_criteria.frequency.start_time | "tomorrow"     |
      | invalid locale               | message.subscribe_request.0.locale                        | "en"                     |

  @negative
  Scenario: A body that is not JSON is rejected
    When the raw body "subscribe me" is sent
    Then the request should be rejected according to the DCI error model
