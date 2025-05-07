export const localhost = 'http://127.0.0.1:3333/';
export const defaultResponseTime = 15000;
export const defaultExpectedResponseTime = 15000;
export const acceptHeader = {
  key: 'Accept',
  value: 'application/json',
};
export const contentTypeHeader = {
  key: 'content-type',
  value: 'application/json; charset=utf-8',
};
export const searchEndpoint = 'fr/sync/search';
export const searchResponseSchema = {
  "type": "object",
  "properties": {
    "transaction_id": { "type": "integer" },
    "correlation_id": { "type": "string" },
    "txnstatus_response": {
      "type": "object",
      "properties": {
        "transaction_id": { "type": "integer" },
        "correlation_id": { "type": "string" },
        "search_response": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "reference_id": { "type": "string" },
              "timestamp": { "type": "string" },
              "status": { "type": "string" },
              "status_reason_code": { "type": "string" },
              "status_reason_message": { "type": "string" },
              "data": {
                "type": "object",
                "properties": {
                  "version": { "type": "string" },
                  "reg_type": { "type": "string" },
                  "reg_event_type": { "type": "string" },
                  "reg_record_type": { "type": "string" },
                  "reg_records": {
                    "type": "array",
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export const subscribeEndpoint = 'fr/subscribe'
export const subscribeResponseSchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: {
      type: 'object',
      required: ['ack_status', 'timestamp', 'error', 'correlation_id'],
      properties: {
        ack_status: { type: 'string' },
        timestamp: { type: 'string' },
        error: { type: 'object' },
        correlation_id: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};
export const unsubscribeEndpoint = 'fr/unsubscribe'
export const unsubscribeResponseSchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: {
      type: 'object',
      required: ['ack_status', 'timestamp', 'error', 'correlation_id'],
      properties: {
        ack_status: { type: 'string' },
        timestamp: { type: 'string' },
        error: { type: 'object' },
        correlation_id: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};

// Define the schema for validation
export const regRecordsSchema = {
  type: "object",
  properties: {
    famer_personal_details: {
      type: "object",
      properties: {
        member_identifier: {
          type: "object",
          properties: {
            identifier_type: { type: "string" },
            identifier_value: { type: "string" }
          },
        },
        demographic_info: {
          type: "object",
          properties: {
            identifier: {
              type: "object",
              properties: {
                identifier_type: { type: "string" },
                identifier_value: { type: "string" }
              },
            },
            name: {
              type: "object",
              properties: {
                first_name: { type: "string" },
                last_name: { type: "string" }
              },
            },
            date_of_birth: { type: "string", format: "date-time" },
            gender: { type: "string" }
          },
        }
      }
    },
    family_details: {
      type: "object",
      properties: {
        group_identifier: {
          type: "array",
          items: {
            type: "object",
            properties: {
              identifier_type: { type: "string" },
              identifier_value: { type: "string" }
            },
          }
        },
        group_type: { type: "string" },
        poverty_score: { type: "number" },
        poverty_score_type: { type: "string" },
        group_head_info: {
          type: "object",
          properties: {
            member_identifier: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  identifier_type: { type: "string" },
                  identifier_value: { type: "string" }
                },
              }
            },
            demographic_info: {
              type: "object",
              properties: {
                identifier: {
                  type: "object",
                  properties: {
                    identifier_type: { type: "string" },
                    identifier_value: { type: "string" }
                  }
                },
                name: {
                  type: "object",
                  properties: {
                    first_name: { type: "string" },
                    last_name: { type: "string" }
                  }
                },
                date_of_birth: { type: "string", format: "date-time" },
                gender: { type: "string" }
              }
            },
            is_disabled: { type: "boolean" },
            marital_status: { type: "string" },
            registration_date: { type: "string", format: "date-time" }
          }
        },
        group_size: { type: "number" },
        member_list: {
          type: "array",
          items: {
            type: "object",
            properties: {
              member_identifier: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    "@type": { type: "string" },
                    identifier_type: { type: "string" },
                    identifier_value: { type: "string" }
                  }
                }
              },
              demographic_info: {
                type: "object",
                properties: {
                  "spdci:identifier": {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        "@type": { type: "string" },
                        identifier_type: { type: "string" },
                        identifier_value: { type: "string" }
                      }
                    }
                  },
                  name: {
                    type: "object",
                    properties: {
                      "@type": { type: "string" },
                      surname: { type: "string" },
                      given_name: { type: "string" },
                      prefix: { type: "string" },
                      suffix: { type: "string" }
                    }
                  },
                  sex: { type: "string" },
                  birth_date: { type: "string", format: "date-time" },
                  registration_date: { type: "string", format: "date-time" }
                }
              },
              is_disabled: { type: "boolean" },
              marital_status: { type: "string" },
              registration_date: { type: "string", format: "date-time" }
            }
          }
        },
        registration_date: { type: "string", format: "date-time" },
        last_updated: { type: "string", format: "date-time" }
      }
    },
    farm_details: {
      type: "array",
      items: {
        type: "object",
        properties: {
          place: {
            type: "object",
            properties: {
              name: { type: "string" },
              geo: {
                type: "object",
                properties: {
                  "@type": { type: "string" },
                  latitude: { type: "number" },
                  longitude: { type: "number" }
                }
              }
            }
          },
          land_tenure: { type: "string" },
          land_size: { type: "number" },
          measurement: { type: "string" },
          farm_type: { type: "string" },
          farming_activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                crop_production: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      activity_group: { type: "string" },
                      crop_type: { type: "string" },
                      variety: { type: "string" },
                      season: { type: "string" },
                      end_use: {
                        type: "array",
                        items: { type: "string" }
                      },
                      irrigation: { type: "boolean" },
                      irrigation_water: {
                        type: "array",
                        items: { type: "string" }
                      },
                      fertilizer_type: {
                        type: "array",
                        items: { type: "string" }
                      },
                      registration_date: { type: "string", format: "date-time" },
                      last_updated: { type: "string", format: "date-time" }
                    }
                  }
                },
                animal_production: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      count: { type: "number" },
                      livestock_system: { type: "string" },
                      registration_date: { type: "string", format: "date-time" },
                      last_updated: { type: "string", format: "date-time" }
                    }
                  }
                },
                mixed_farming: { type: "boolean" },
                agri_support_activities: {
                  type: "array",
                  items: { type: "string" }
                },
                aqua_support_activities: { type: "string" },
                aqua_culture: {
                  type: "array",
                  items: { type: "string" }
                },
                agroforestry: {
                  type: "array",
                  items: { type: "string" }
                },
                registration_date: { type: "string", format: "date-time" },
                last_updated: { type: "string", format: "date-time" }
              }
            }
          },
          registration_date: { type: "string", format: "date-time" },
          last_updated: { type: "string", format: "date-time" }
        }
      }
    },
    machineries_details: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          count: { type: "number" },
          equipement_source: { type: "string" },
          registration_date: { type: "string", format: "date-time" },
          last_updated: { type: "string", format: "date-time" }
        }
      }
    },
    registration_date: { type: "string", format: "date-time" },
    last_updated: { type: "string", format: "date-time" }
  }
};

export const asyncsearchEndpoint = 'fr/search';
export const asyncsearchResponseSchema ={
  type: 'object',
  required: ['transaction_id', 'correlation_id', 'search_response'],
  properties: {
    transaction_id: { type: 'integer' },
    correlation_id: { type: 'string' },
    search_response: {
      type: 'object',
      required: ['status', 'message'],
      properties: {
        status: { type: 'string'},
        message: { type: 'string' }
      }
    }
  }
};


export const onsearchEndpoint= 'fr/on-search';
export const onsearchResponseSchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: {
      type: 'object',
      required: ['ack_status', 'timestamp', 'error', 'correlation_id'],
      properties: {
        ack_status: { type: 'string' },
        timestamp: { type: 'string' },
        error: { type: 'object' },
        correlation_id: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};
export const onsearchRequestSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {
      "message": {
        "type": "object",
        "properties": {
          "transaction_id": { "type": "integer" },
          "correlation_id": { "type": "string" },
          "search_response": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "reference_id": { "type": "string" },
                "timestamp": { "type": "string" },
                "status": { "type": "string", "enum": ["rcvd", "processed", "failed"] },
                "status_reason_code": { "type": "string" },
                "status_reason_message": { "type": "string" },
                "data": { "type": "object" },
                "pagination": { "type": "object" },
                "locale": { "type": "string", "enum": ["en", "fr", "ar"] }
              }
            }
          }
        },
        "required": ["transaction_id", "correlation_id", "search_response"]
      }
    },
    "required": ["message"]
    
}

export const onsubscribeEndpoint = 'fr/on-subscribe';
export const onsubscribeResponseSchema =  {
  type: 'object',
  required: ['message'],
  properties: {
    message: {
      type: 'object',
      required: ['ack_status', 'timestamp', 'error', 'correlation_id'],
      properties: {
        ack_status: { type: 'string' },
        timestamp: { type: 'string' },
        error: { type: 'object' },
        correlation_id: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};

export const onunsubscribeEndpoint = 'fr/on-unsubscribe';
export const onunsubscribeResponseSchema =  {
  type: 'object',
  required: ['message'],
  properties: {
    message: {
      type: 'object',
      required: ['ack_status', 'timestamp', 'error', 'correlation_id'],
      properties: {
        ack_status: { type: 'string' },
        timestamp: { type: 'string' },
        error: { type: 'object' },
        correlation_id: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};

export const txnstatusEndpoint = 'fr/sync/txn/status';
export const txnstatusResponseSchema = {
  type: 'object',
  required: ['transaction_id', 'correlation_id', 'txnstatus_response'],
  properties: {
    transaction_id: { type: 'integer' },
    correlation_id: { type: 'string' },
    txnstatus_response: {
      type: 'object',
      properties: {
        transaction_id: { type: 'integer' },
        correlation_id: { type: 'string', maxLength: 99 },
      }
    },
  }
};



export const asynctxnstatusEndpoint = 'fr/txn/status';
export const asynctxnstatusResponseSchema =  {
  type: 'object',
  required: ['message'],
  properties: {
    message: {
      type: 'object',
      required: ['ack_status', 'timestamp', 'error', 'correlation_id'],
      properties: {
        ack_status: { type: 'string' },
        timestamp: { type: 'string' },
        error: { type: 'object' },
        correlation_id: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};

export const ontxnstatusEndpoint = 'fr/txn/on-status';
export const ontxnstatusResponseSchema =  {
  type: 'object',
  required: ['message'],
  properties: {
    message: {
      type: 'object',
      required: ['ack_status', 'timestamp', 'error', 'correlation_id'],
      properties: {
        ack_status: { type: 'string' },
        timestamp: { type: 'string' },
        error: { type: 'object' },
        correlation_id: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};