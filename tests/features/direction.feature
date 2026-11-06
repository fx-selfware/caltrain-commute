Feature: Work or Home by the time of day
  The app opens on Work in the morning and on Home from noon. Coming back after
  two hours away counts as opening it again. Caltrain's day runs until 3am.

  Background:
    Given my commute is from "San Francisco" to "Mountain View"

  @R1
  Scenario Outline: The time of day picks the direction
    Given it is <day> <time>
    When I open the app
    Then the <direction> direction is selected

    Examples:
      | day       | time    | direction |
      | Wednesday | 7:10am  | Work      |
      | Wednesday | 11:59am | Work      |
      | Wednesday | 12:00pm | Home      |
      | Thursday  | 12:30am | Home      |
      | Thursday  | 3:00am  | Work      |

  @R1
  Scenario: In the afternoon, the card shows the train home
    Given it is Wednesday 1:00pm
    When I open the app
    Then the card's itinerary is:
      | 4:50pm | Mountain View |
      | 5:45pm | San Francisco |
    And the timetable lists trains 101, 501, 103 and 105

  @R1
  Scenario: Weekends follow the same rule
    Given it is Saturday 1:00pm
    When I open the app
    Then the Home direction is selected
    And the Weekend schedule is selected
    And the card shows Local train 601

  @R2
  Scenario: #work in the address opens on Work in the afternoon
    Given it is Wednesday 1:00pm
    When I open the app with "#work" in the address
    Then the Work direction is selected
    And the card shows Local train 108

  @R2
  Scenario: Anything else in the address leaves it to the time of day
    Given it is Wednesday 1:00pm
    When I open the app with "#later" in the address
    Then the Home direction is selected

  @R3
  Scenario: Coming back in the evening shows the train home
    Given it is Wednesday 8:00am
    And I open the app
    And I leave the app
    When the time reaches 5:00pm
    And I return to the app
    Then the Home direction is selected
    And the card shows Express train 501
    And the countdown says "in 30 min"

  @R3
  Scenario: A short time away keeps the direction, even across noon
    Given it is Wednesday 11:59am
    And I open the app
    And I leave the app
    When the time reaches 12:01pm
    And I return to the app
    Then the Work direction is selected

  @R3
  Scenario: A tapped direction stays until I've been away two hours
    Given it is Wednesday 8:00am
    And I open the app
    And I tap "Home"
    And I leave the app
    When the time reaches 9:59am
    And I return to the app
    Then the Home direction is selected
    When I leave the app
    And the time reaches 11:59am
    And I return to the app
    Then the Work direction is selected

  @R3
  Scenario: It doesn't switch while the app is on screen
    Given it is Wednesday 8:00am
    And I open the app
    When the time reaches 5:00pm
    Then the Work direction is selected
    When I leave the app
    And I return to the app
    Then the Work direction is selected
    When I leave the app
    And the time reaches 7:00pm
    And I return to the app
    Then the Home direction is selected

  @R3
  Scenario: Switching on return shows the next train at the top, with earlier trains hidden
    Given the screen is 390 by 520 pixels
    And there is a train every ten minutes
    And it is Wednesday 8:00am
    And I open the app
    And I tap "Show 18 earlier trains"
    And I scroll train 1060 to 140 pixels from the top
    And I leave the app
    When the time reaches 5:00pm
    And I return to the app
    Then the Home direction is selected
    And the earlier-trains action is collapsed
    And the page is scrolled to the top
    And the top of the card is in view

  @R3
  Scenario: Coming back after two hours to the same direction keeps my place
    Given the screen is 390 by 520 pixels
    And there is a train every ten minutes
    And it is Wednesday 8:00am
    And I open the app
    And I scroll train 1080 to 140 pixels from the top
    And I note where train 1080 is on screen
    And I leave the app
    When the time reaches 10:05am
    And I return to the app
    Then the Work direction is selected
    And train 1080 is still in the same place on screen

  @R3
  Scenario: An app opened in the background picks its direction when first seen
    # Seen for the first time after noon, so it's an opening, however recent the load.
    Given it is Wednesday 11:50am
    And I open the app in the background
    When the time reaches 12:10pm
    And I return to the app
    Then the Home direction is selected

  @R2 @R3
  Scenario: The address still decides when I come back
    Given it is Wednesday 7:10am
    And I open the app with "#home" in the address
    And I tap "Work"
    And I leave the app
    When the time reaches 10:00am
    And I return to the app
    Then the Home direction is selected

  @R3
  Scenario: Coming back to Settings after two hours keeps them open, where they were
    Given the screen is 390 by 360 pixels
    And it is Wednesday 8:00am
    And I open the app
    And I tap "Settings"
    And I scroll to the bottom
    And I leave the app
    When the time reaches 5:00pm
    And I return to the app
    Then I'm asked to choose my stations
    And the page is still scrolled to the bottom
    When I tap "Cancel"
    Then the settings are closed
    And the Home direction is selected
