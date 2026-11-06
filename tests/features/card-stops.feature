Feature: Every stop on the card
  The card shows where my train leaves and arrives, and my stop if I set one.
  "Show N more stops" lists every other station it stops at on the way.
  Tags point at the requirements in docs/2026-11-06-card-stops/spec.md.

  Background:
    Given it is Wednesday 7:10am

  @R1 @R2
  Scenario: Showing and hiding the stations a train stops at on the way
    Given my commute is from "San Francisco" to "San Jose Diridon"
    When I open the app
    Then the card's itinerary is:
      | 7:30am | San Francisco    |
      | 8:20am | San Jose Diridon |
    And the card's "Show 2 more stops" button is just under the departure
    And the card's stops are collapsed
    When I tap "Show 2 more stops"
    Then the card's itinerary is:
      | 7:30am | San Francisco    |
      | 7:45am | Millbrae         |
      | 8:05am | Mountain View    |
      | 8:20am | San Jose Diridon |
    And the card's "Hide 2 stops" button is just under the departure
    And the card's stops are expanded
    When I tap "Hide 2 stops"
    Then the card's itinerary is:
      | 7:30am | San Francisco    |
      | 8:20am | San Jose Diridon |
    And the card's "Show 2 more stops" button is just under the departure
    And the card's stops are collapsed

  @R1 @R2
  Scenario: My stop keeps its place when the train skips it
    Given my commute is from "San Francisco" to "San Jose Diridon" with a stop at "Palo Alto"
    When I open the app
    Then the card's itinerary is:
      | 7:30am | San Francisco    |       |
      | —      | Palo Alto        | Skips |
      | 8:20am | San Jose Diridon |       |
    And the card's "Show 2 more stops" button is just under the departure
    When I tap "Show 2 more stops"
    Then the card's itinerary is:
      | 7:30am | San Francisco    |       |
      | 7:45am | Millbrae         |       |
      | —      | Palo Alto        | Skips |
      | 8:05am | Mountain View    |       |
      | 8:20am | San Jose Diridon |       |
    And the card's "Hide 2 stops" button is just under the departure

  @R1 @R2
  Scenario: My stop keeps its place between stops on both sides
    Given it is Wednesday 7:40am
    And my commute is from "San Francisco" to "San Jose Diridon" with a stop at "Palo Alto"
    When I open the app
    Then the card's itinerary is:
      | 8:00am | San Francisco    |      |
      | 8:35am | Palo Alto        | Stop |
      | 9:00am | San Jose Diridon |      |
    And the card's "Show 2 more stops" button is just under the departure
    When I tap "Show 2 more stops"
    Then the card's itinerary is:
      | 8:00am | San Francisco    |      |
      | 8:15am | Millbrae         |      |
      | 8:35am | Palo Alto        | Stop |
      | 8:44am | Mountain View    |      |
      | 9:00am | San Jose Diridon |      |
    And the card's "Hide 2 stops" button is just under the departure

  @R1 @R2
  Scenario: A single stop on the way says so
    Given my commute is from "San Francisco" to "Mountain View"
    When I open the app
    Then the card's "Show 1 more stop" button is just under the departure
    When I tap "Show 1 more stop"
    Then the card's itinerary is:
      | 7:30am | San Francisco |
      | 7:45am | Millbrae      |
      | 8:05am | Mountain View |
    And the card's "Hide 1 stop" button is just under the departure

  @R2
  Scenario: Going home, the stations are in the order the train reaches them
    Given my commute is from "San Francisco" to "Mountain View"
    And I open the app
    When I tap "Home"
    And I tap "Show 2 more stops"
    Then the card's itinerary is:
      | 4:50pm | Mountain View |
      | 5:00pm | Palo Alto     |
      | 5:25pm | Millbrae      |
      | 5:45pm | San Francisco |

  @R2
  Scenario: Stops after midnight show their times
    Given it is Wednesday 11:40pm
    And my commute is from "San Francisco" to "San Jose Diridon"
    And I open the app with "#work" in the address
    When I tap "Show 3 more stops"
    Then the card's itinerary is:
      | 11:50pm | San Francisco    |
      | 12:10am | Millbrae         |
      | 12:35am | Palo Alto        |
      | 12:45am | Mountain View    |
      | 1:05am  | San Jose Diridon |

  @R1
  Scenario Outline: No button when the train stops nowhere else on the way: <why>
    Given it is Wednesday <time>
    And my commute is from "Millbrae" to "Mountain View" with a stop at "Palo Alto"
    When I open the app
    Then the card shows <kind> train <n>
    And the card has no button for more stops

    Examples:
      | time   | kind    | n   | why                     |
      | 7:10am | Local   | 104 | it stops only at my stop |
      | 7:30am | Express | 502 | it skips my stop too     |

  @R1
  Scenario: No button between neighboring stations
    Given my commute is from "San Francisco" to "Millbrae"
    When I open the app
    Then the card shows Express train 502
    And the card has no button for more stops

  @R3
  Scenario: Once expanded, the card stays expanded for every train it shows
    Given my commute is from "San Francisco" to "Mountain View"
    And I open the app
    When I tap "Show 1 more stop"
    # The 7:30 leaves, and the card moves on to the 8:00.
    And the time reaches 7:31am
    Then the card shows Limited train 402
    And the card's itinerary is:
      | 8:00am | San Francisco |
      | 8:15am | Millbrae      |
      | 8:35am | Palo Alto     |
      | 8:44am | Mountain View |
    And there is a "Hide 2 stops" button
    When I tap train 106
    Then the card is headed "Selected train"
    And the card's itinerary is:
      | 9:00am | San Francisco |
      | 9:20am | Millbrae      |
      | 9:45am | Palo Alto     |
      | 9:55am | Mountain View |
    When I tap "Back to next train"
    And I tap "Settings"
    And I tap "Save"
    Then the card shows Limited train 402
    And there is a "Hide 2 stops" button
    When I tap "Home"
    Then the card's itinerary is:
      | 4:50pm | Mountain View |
      | 5:00pm | Palo Alto     |
      | 5:25pm | Millbrae      |
      | 5:45pm | San Francisco |
    When I tap "Weekend"
    Then the card is headed "Weekend schedule · Mountain View → San Francisco"
    And the card has no button for more stops
    When I tap "Weekday"
    Then there is a "Hide 2 stops" button
    When I reload the app
    Then the card's itinerary is:
      | 8:00am | San Francisco |
      | 8:44am | Mountain View |
    And the card's stops are collapsed

  @R3
  Scenario: Coming back after two hours keeps the card expanded
    Given it is Wednesday 8:00am
    And my commute is from "San Francisco" to "Mountain View"
    And I open the app
    And I tap "Show 2 more stops"
    And I leave the app
    When the time reaches 5:00pm
    And I return to the app
    Then the Home direction is selected
    And the card's itinerary is:
      | 5:30pm | Mountain View |
      | 5:50pm | Millbrae      |
      | 6:05pm | San Francisco |
    And the card's stops are expanded

  @R4
  Scenario: The button stays where it was tapped
    Given the screen is 390 by 844 pixels
    And my commute is from "San Francisco" to "San Jose Diridon"
    And I open the app
    # With trains on screen below the card, keeping their place would scroll the button away.
    And train 502 is in the viewport below the header
    And I note where the card's stops button is on screen
    When I tap "Show 2 more stops"
    Then the card's stops are expanded
    And the card's stops button is still in the same place on screen
    When I tap "Hide 2 stops"
    Then the card's stops are collapsed
    And the card's stops button is still in the same place on screen

  @R5
  Scenario: The button works from the keyboard and keeps focus through a redraw
    Given my commute is from "San Francisco" to "Mountain View"
    And I open the app
    When I move keyboard focus to "Show 1 more stop"
    And I press Enter
    Then the card's stops are expanded
    And the "Hide 1 stop" button has keyboard focus
    # The countdown changes each minute, and the card is drawn again.
    When 1 minute passes
    Then the countdown says "in 19 min"
    And the "Hide 1 stop" button has keyboard focus
    When I press Enter
    Then the card's stops are collapsed
    And the "Show 1 more stop" button has keyboard focus
