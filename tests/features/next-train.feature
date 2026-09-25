Feature: Next train and timetable
  The card shows the next train with a countdown; the timetable below lists the
  day's trains between my stations.

  Background:
    Given it is Wednesday 7:10am
    And my commute is from "San Francisco" to "Mountain View"

  Scenario: The card shows the next train, its countdown and the two after it
    When I open the app
    Then the card is headed "Next train"
    And the countdown says "in 20 min"
    And the card's itinerary is:
      | 7:30am | San Francisco |
      | 8:05am | Mountain View |
    And the card shows Express train 502
    And the card shows "35 min ride · 1 stop"
    And the trains after it are:
      | 8:00am Limited · in 50 min   |
      | 9:00am Local · in 1 h 50 min |

  Scenario: The countdown keeps time
    Given I open the app
    When 1 minute passes
    Then the countdown says "in 19 min"
    When 19 minutes pass
    Then the countdown says "departing now"

  Scenario: The timetable hides trains that have left and highlights the next one
    When I open the app
    Then the timetable's columns are:
      | Depart | Arrive | Ride | Train |
    And the timetable lists trains 502, 402, 106 and 108
    And train 502 is highlighted as the next train
    And train 402 shows "44 min" under "Ride"
    When I tap "Show 2 earlier trains"
    Then the timetable lists trains 102, 104, 502, 402, 106 and 108
    And train 104 is shown as already left
    When I tap "Hide 2 earlier trains"
    Then the timetable lists trains 502, 402, 106 and 108

  Scenario: Home switches the direction
    Given I open the app
    When I tap "Home"
    Then the Home direction is selected
    And the card's itinerary is:
      | 4:50pm | Mountain View |
      | 5:45pm | San Francisco |
    And the countdown says "in 9 h 40 min"
    And the timetable lists trains 101, 501, 103 and 105

  Scenario: #home in the address opens on Home
    When I open the app with "#home" in the address
    Then the Home direction is selected
    And the card shows Local train 101

  Scenario: A stop gets its own column and a place on the card
    Given my commute is from "San Francisco" to "Mountain View" with a stop at "Palo Alto"
    When I open the app
    Then the timetable's columns are:
      | San Francisco | Palo Alto | Mountain View | Train |
    And train 502 shows "—" under "Palo Alto"
    And train 402 shows "8:35am" under "Palo Alto"
    And the card's itinerary is:
      | 7:30am | San Francisco |       |
      | —      | Palo Alto     | Skips |
      | 8:05am | Mountain View |       |
    When 21 minutes pass
    Then the card's itinerary is:
      | 8:00am | San Francisco |      |
      | 8:35am | Palo Alto     | Stop |
      | 8:44am | Mountain View |      |

  Scenario: The other day's schedule shows a summary instead of a next train
    Given I open the app
    When I tap "Weekend"
    Then the card is headed "Weekend schedule · San Francisco → Mountain View"
    And the card shows "2 trains · first 8:00am · last 10:00am"
    And the timetable lists trains 602 and 604
    And there is no "Show 2 earlier trains" button
    When 1 minute passes
    Then the Weekend schedule is selected
    When I tap "Weekday"
    Then the card is headed "Next train"

  Scenario: No single train serves both stations
    Given my commute is from "Gilroy" to "San Francisco"
    When I open the app
    Then the card shows "No weekday trains stop at both stations"
    And the timetable is empty

  Scenario: The footer links to the trip on caltrain.com
    When I open the app
    Then the footer links to "https://www.caltrain.com/?service=weekday&active_tab=route_explorer_tab&origin=7001&destination=7017"
