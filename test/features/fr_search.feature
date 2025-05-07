@method=POST @endpoint=fr/search
Feature: Search person from FR based on specific criteria

This API is to be exposed by the FR.
It will be called by the SP systems or other registries.

    @smoke
    Scenario: Successfully search FR to be processed
        Given System wants to search for person in FR
        When A POST request to search is sent
        Then The response from the search should be received
        And The search response should have status 200
        And The search response should have "Content-Type": "application/json" header
        And The search response should be returned in a timely manner within 15000ms
        And The search response should match the expected JSON schema

