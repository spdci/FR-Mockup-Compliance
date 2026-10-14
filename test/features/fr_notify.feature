@method=POST @endpoint=fr/notify
Feature: Receive Farmer Registry notifications (POST /registry/notify)

This API is exposed by the SP (subscriber). The FR calls it whenever a subscribed
registration event ("register") occurs. The suite plays the FR: every notification is
first checked against the spec (including the FR data rules), then the SP must
acknowledge it.

  Background:
    Given the "notify" endpoint

  @smoke
  Scenario: Successfully receive a new farmer registration
    Given a notify request carrying the "farmer" records "full"
    Then the request should be a valid "notify" message
    When the request is sent
    Then the HTTP status should be 200
    And the response should have a JSON content type
    And the response should be received within 15000 ms
    And the response should be a valid acknowledgement with ack_status "ACK"

  @functional
  Scenario Outline: A registration of <kind> records "<records>" is acknowledged
    Given a notify request carrying the "<kind>" records "<records>"
    Then the request should be a valid "notify" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

    Examples:
      | kind   | records                 |
      | farmer | crop, livestock         |
      | farmer | widow, minimal          |
      | farmer | spec example corrected  |
      | person | full, deceased          |
      | member | disabled, labels        |
      | group  | family, individual      |

  @functional
  Scenario Outline: The event type may be sent as "<event>"
    Given a notify request with reg_event_type "<event>" carrying the "farmer" records "full"
    Then the request should be a valid "notify" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

    Examples:
      | event                                   |
      | register                                |
      | spdci-common:RegistryEventType:Register |

  @functional
  Scenario Outline: reg_records may be a single <kind> object, as declared in the spec
    Given a notify request carrying the "<kind>" record "<record>" as a single object
    Then the request should be a valid "notify" message
    When the request is sent
    Then the response should be a valid acknowledgement with ack_status "ACK"

    Examples:
      | kind   | record |
      | farmer | full   |
      | group  | family |

  @negative
  Scenario Outline: An invalid notification is rejected: <case>
    Given a valid request
    And the request field "<field>" becomes '<value>'
    When the request is sent
    Then the request should be rejected according to the DCI error model

    Examples: Envelope and event
      | case                     | field                                             | value          |
      | missing header           | header                                            | <removed>      |
      | wrong action             | header.action                                     | "on-search"    |
      | missing header status    | header.status                                     | <removed>      |
      | missing transaction_id   | message.transaction_id                            | <removed>      |
      | missing notify_event     | message.notify_event                              | <removed>      |
      | empty notify_event       | message.notify_event                              | []             |
      | missing reference_id     | message.notify_event.0.reference_id               | <removed>      |
      | missing timestamp        | message.notify_event.0.timestamp                  | <removed>      |
      | missing data             | message.notify_event.0.data                       | <removed>      |
      | missing reg_record_type  | message.notify_event.0.data.reg_record_type       | <removed>      |
      | missing reg_records      | message.notify_event.0.data.reg_records           | <removed>      |
      | unknown event type       | message.notify_event.0.data.reg_event_type        | "update"       |
      | invalid locale           | message.notify_event.0.locale                     | "en-GB"        |

    @strict-data
    Examples: Farmer data in the notification
      | case                          | field                                                                         | value             |
      | crop type outside code list   | message.notify_event.0.data.reg_records.0.farm_details.0.farming_activities.crop_production.0.crop_type_name | "Maize" |
      | fertilizer outside code list  | message.notify_event.0.data.reg_records.0.farm_details.0.farming_activities.crop_production.0.fertilizer_type | ["NPK"] |
      | livestock system unknown      | message.notify_event.0.data.reg_records.0.farm_details.0.farming_activities.animal_production.0.livestock_system | "Free range" |
      | measurement unit unknown      | message.notify_event.0.data.reg_records.0.farm_details.0.measurment           | "hectare"         |
      | mixed farming not a boolean   | message.notify_event.0.data.reg_records.0.farm_details.0.farming_activities.mixed_farming | "yes"  |
      | marital status unknown        | message.notify_event.0.data.reg_records.0.farmer_personal_details.marital_status | "Partnered"    |
      | disabled flag not a boolean   | message.notify_event.0.data.reg_records.0.farmer_personal_details.is_disabled | 0                 |
      | registration date not ISO     | message.notify_event.0.data.reg_records.0.registration_date                   | "01-04-2020"      |
      | phone number not E.164        | message.notify_event.0.data.reg_records.0.farmer_personal_details.demographic_info.phone_number | ["622000002"] |
