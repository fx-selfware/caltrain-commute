Feature: Service day
  Which day's trains show: weekends, trains after midnight, and moving on to the
  next day after the last train. Caltrain's day runs until 3am.

  Background:
    Given my commute is from "San Francisco" to "Mountain View"

  Scenario: On a Saturday the weekend schedule shows
    Given it is Saturday 9:00am
    When I open the app
    Then the Weekend schedule is selected
    And the card shows Local train 604
    And the countdown says "in 1 h 0 min"

  Scenario: Just after midnight still counts as the previous day
    Given it is Saturday 12:05am
    When I open the app with "#home" in the address
    Then the date shown is "Sat, Sep 26"
    And the Weekday schedule is selected
    And the card is headed "Next train"
    And the card shows Local train 105
    And the countdown says "in 10 min"

  Scenario: After the last train, the next day's trains show
    Given it is Wednesday 11:55pm
    When I open the app
    Then the card is headed "Next train · Thursday"
    And the countdown says "in 6 h 5 min"
    And the timetable is headed "Thursday's trains"
    And the timetable lists trains 102, 104, 502, 402, 106 and 108

  Scenario: After Friday's last train, the weekend schedule shows
    Given it is Friday 11:45pm
    And I open the app
    And the Weekday schedule is selected
    And the countdown says "in 5 min"
    When 10 minutes pass
    Then the Weekend schedule is selected
    And the card is headed "Next train · Saturday"
    And the card shows Local train 602
    And the countdown says "in 8 h 5 min"
    And the timetable is headed "Saturday's trains"
