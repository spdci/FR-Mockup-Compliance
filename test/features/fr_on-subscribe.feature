@method=POST @endpoint=fr/on-subscribe
Feature: Callback for Subscribe To Farmer registry based on specific criteria

This API is to be exposed by the FR.
It will be called by the SP systems or other registeries .

    @smoke
    Scenario: Successfully receive async subscribe results from FR
        Given SP has previously sent a subscribe request to FR
        When FR completes processing and calls SP on-subscribe callback
        Then SP should receive the on-subscribe response from FR
        And The on-subscribe response should have status 200
        And The on-subscribe response should have "Content-Type": "application/json" header
        And The on-subscribe response should be returned in a timely manner 15000ms
        And The on-subscribe response should match json schema