@service-worker
Feature: Working offline
  The app keeps an offline copy of itself, through its service worker, and the
  last timetable it loaded. Other pages on the same site are left alone.
  Runs in Chromium only; see the webkit project in playwright.config.js.

  Background:
    Given it is Wednesday 7:10am
    And my commute is from "San Francisco" to "Mountain View"
    And the app is ready to work offline

  Scenario: The app opens offline with the saved timetable
    When I go offline
    And I open the app again
    Then the card is headed "Next train"
    And the card shows Express train 502
    And the footer warns "Couldn't reach caltrain.com."

  Scenario: Another page on the site opens as itself, not as the app
    When I open "tests/fixtures/timetable.html" on the same site
    Then I see the stand-in timetable, not the app

  Scenario: Opening another page doesn't replace the app's offline copy
    Given I open "tests/fixtures/timetable.html" on the same site
    When I open the app again
    Then the card is headed "Next train"
    And the card shows Express train 502
