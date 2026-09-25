Feature: Loading the timetable
  The app downloads the timetable from caltrain.com each time it opens, and keeps
  the last copy for when that fails.

  Background:
    Given it is Wednesday 7:10am
    And my commute is from "San Francisco" to "Mountain View"

  Scenario: It says it's loading until the timetable arrives
    Given caltrain.com is slow to answer
    When I open the app
    Then the card shows "Loading timetable…"
    When caltrain.com answers
    Then the card is headed "Next train"
    And the footer says "Timetable loaded from caltrain.com at 7:10am today."

  Scenario: It offers to try again when caltrain.com can't be reached
    Given caltrain.com can't be reached
    When I open the app
    Then the card shows "Couldn't load the timetable"
    And the card shows "Couldn't reach caltrain.com."
    Given caltrain.com is reachable again
    When I tap "Try again"
    Then the card is headed "Next train"

  Scenario: It reports a server error
    Given caltrain.com answers with error 503
    When I open the app
    Then the card shows "The caltrain.com server returned an error (HTTP 503)."

  Scenario: It reports a page it doesn't recognize
    Given caltrain.com has redesigned its timetable page
    When I open the app
    Then the card shows "The caltrain.com timetable has a layout this page doesn't recognize."

  Scenario: It keeps working from the saved timetable when caltrain.com is down
    Given I open the app
    And the card is headed "Next train"
    When caltrain.com can't be reached
    And I reload the app
    Then the card is headed "Next train"
    And the card shows Express train 502
    And the footer warns "Couldn't reach caltrain.com."
    And the footer says "Showing the timetable saved at 7:10am today."
