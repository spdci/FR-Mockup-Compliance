@method=POST @endpoint=fr/txn/on-status
Feature: Get transaction status

This API is to be exposed by the FR.
It will be called by the SP systems or other registries.

    @smoke
    Scenario: Successfully receive async txn status result from FR
        Given SP has previously sent a txn status request to FR
        When FR completes processing and calls SP txn on-status callback
        Then SP should receive the txn on-status response from FR
        And The txn on-status response should have status 200
        And The txn on-status response should have "Content-Type": "application/json" header
        And The txn on-status response should be returned in a timely manner 15000ms
        And The txn on-status response should match json schema