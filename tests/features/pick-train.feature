Feature: Pick a train from the timetable
  Tapping a train in the timetable shows it on the card instead of the next train.
  Tags point at the requirements in docs/select-train/spec.md.

  Background:
    Given it is Wednesday 7:10am
    And my commute is from "San Francisco" to "Mountain View"

  @R1 @R2
  Scenario: Tapping a train shows it on the card
    Given my commute is from "San Francisco" to "Mountain View" with a stop at "Palo Alto"
    And I open the app
    When I tap train 402
    Then the card is headed "Selected train"
    And the countdown says "in 50 min"
    And the card's itinerary is:
      | 8:00am | San Francisco |      |
      | 8:35am | Palo Alto     | Stop |
      | 8:44am | Mountain View |      |
    And the card shows Limited train 402
    And the card shows "44 min ride · 2 stops"
    And the trains after it are:
      | 9:00am Local · in 1 h 50 min   |
      | 11:50pm Local · in 16 h 40 min |
    And there is a "Back to next train" button
    And screen readers call the card "Selected train"
    And train 402 is marked as picked
    And train 502 isn't marked as picked
    And train 502 is highlighted as the next train

  @R2
  Scenario: A picked train that skips my stop says so
    Given it is Wednesday 6:30am
    And my commute is from "San Francisco" to "Mountain View" with a stop at "Palo Alto"
    And I open the app
    When I tap train 502
    Then the card is headed "Selected train"
    And the card's itinerary is:
      | 7:30am | San Francisco |       |
      | —      | Palo Alto     | Skips |
      | 8:05am | Mountain View |       |

  @R3
  Scenario Outline: <Way> goes back to the next train
    Given I open the app
    And I tap train 106
    When <action>
    Then the card is headed "Next train"
    And the card shows Express train 502
    And there is no "Back to next train" button
    And no train is marked as picked
    And screen readers call the card "Next train"

    Examples:
      | Way                            | action                     |
      | Tapping the picked train again | I tap train 106            |
      | Tapping the next train         | I tap train 502            |
      | "Back to next train"           | I tap "Back to next train" |

  @R2
  Scenario: A train that has already left says how long ago
    Given I open the app
    And I tap "Show 2 earlier trains"
    When I tap train 104
    Then the card is headed "Selected train"
    And the countdown says "left 10 min ago"
    And the countdown is dimmed
    When I tap "Hide 1 earlier train"
    Then the timetable lists trains 104, 502, 402, 106 and 108
    And train 104 is shown as already left

  @R2
  Scenario: The earlier-trains button doesn't count a picked train that's showing anyway
    Given I open the app
    And I tap "Show 2 earlier trains"
    When I tap train 104
    Then there is a "Hide 1 earlier train" button
    When I tap "Hide 1 earlier train"
    Then there is a "Show 1 earlier train" button
    And the timetable lists trains 104, 502, 402, 106 and 108

  @R4
  Scenario: A picked train stays picked as the trains before it leave, and after it leaves
    Given I open the app
    And I tap train 402
    # The 7:30 has left, so the picked 8:00 is now the next train.
    When the time reaches 7:31am
    Then the card is headed "Next train"
    And the countdown says "in 29 min"
    And there is no "Back to next train" button
    And train 402 is marked as picked
    When the time reaches 8:02am
    Then the card is headed "Selected train"
    And the countdown says "left 2 min ago"
    And there is a "Back to next train" button
    And the timetable lists trains 402, 106 and 108

  @R4
  Scenario: The pick survives the page's regular redraw
    Given I open the app
    And I tap train 402
    When 1 minute passes
    Then the card is headed "Selected train"
    And the countdown says "in 49 min"

  @R3
  Scenario: Tapping the direction or schedule that's already on keeps the pick
    Given I open the app
    And I tap train 402
    When I tap "Work"
    And I tap "Weekday"
    Then the card is headed "Selected train"
    And train 402 is marked as picked

  @R3
  Scenario: Switching direction or schedule drops the pick
    Given I open the app
    And I tap train 402
    When I tap "Home"
    And I tap "Work"
    Then the card shows Express train 502
    When I tap train 402
    And I tap "Weekend"
    And I tap "Weekday"
    Then the card is headed "Next train"

  @R3
  Scenario: Saving settings drops the pick
    Given I open the app
    And I tap train 402
    And the card is headed "Selected train"
    When I tap "Settings"
    And I tap "Save"
    Then the card is headed "Next train"

  @R2
  Scenario: On the other day's schedule a picked train has no countdown
    Given I open the app
    And I tap "Weekend"
    When I tap train 602
    Then the card is headed "Weekend schedule"
    And there is no countdown
    And the card shows Local train 602
    And the trains after it are:
      | 10:00am Local |
    When I tap "Back to summary"
    Then the card shows "2 trains · first 8:00am · last 10:00am"

  @R3
  Scenario: A pick doesn't carry over to the next day's trains
    Given it is Wednesday 11:40pm
    And I open the app
    And I tap "Show 5 earlier trains"
    When I tap train 106
    Then the countdown says "left 14 h 40 min ago"
    # Train 108 at 11:50pm is the last one; after it, Thursday's trains show.
    When the time reaches 11:55pm
    Then the card is headed "Next train · Thursday"
    And no train is marked as picked

  @R4
  Scenario: The 3am change of service day keeps the pick
    # After Friday's last train, Saturday's trains show from 12:15am on.
    Given it is Saturday 2:50am
    And I open the app with "#home" in the address
    When I tap train 603
    Then the card is headed "Selected train · Saturday"
    And the countdown says "in 16 h 30 min"
    When the time reaches 3:05am
    Then the card is headed "Selected train"
    And the countdown says "in 16 h 15 min"
    And train 603 is marked as picked

  @R3
  Scenario: A tap just after the last train goes to the next day's table
    # Not tomorrow's train with the same number.
    Given it is Wednesday 11:49pm
    And I open the app
    And I tap "Show 5 earlier trains"
    When the time reaches 11:51pm before the page redraws
    And I tap train 402
    Then the card is headed "Next train · Thursday"
    And no train is marked as picked

  @R1
  Scenario: Tapping the highlighted train just after it left shows that train
    Given it is Wednesday 7:29am
    And I open the app
    When the time reaches 7:31am before the page redraws
    And I tap train 502
    Then the card is headed "Selected train"
    And the card shows Express train 502
    And the countdown says "left 1 min ago"

  @R6
  Scenario: Trains can be picked from the keyboard, and keep focus through a redraw
    Given I open the app
    When I press Enter on train 402
    Then the card is headed "Selected train"
    And train 402 has keyboard focus
    # At 7:31 the 7:30 has left and the rows are redrawn.
    When the time reaches 7:31am
    Then the timetable doesn't list train 502
    And train 402 has keyboard focus

  @R6
  Scenario: After "Back to next train", keyboard focus is on the card
    Given I open the app
    And I tap train 106
    When I tap "Back to next train"
    Then the card has keyboard focus

  @R6
  Scenario: Unpicking a train that then hides moves keyboard focus to the card
    Given I open the app
    And I tap "Show 2 earlier trains"
    And I tap train 104
    And I tap "Hide 1 earlier train"
    When I press Enter on train 104
    Then the timetable doesn't list train 104
    And the card has keyboard focus

  @R6
  Scenario: A redraw that removes the focused back button moves focus to the card
    Given I open the app
    And I tap train 402
    And I move keyboard focus to "Back to next train"
    # 402 becomes the next train, which needs no back button.
    When the time reaches 7:31am
    Then there is no "Back to next train" button
    And the card has keyboard focus

  @R5
  Scenario: Picking a train with the card in view leaves the card's heading in view
    # Found by eye in Chrome: keeping the row in place scrolled the heading under the controls.
    Given I open the app
    When I tap train 106
    Then the card is headed "Selected train"
    And the top of the card is in view

  @R5
  Scenario: The tapped train stays put while the card above it changes height
    Given the screen is 390 by 520 pixels
    And I open the app
    And I tap "Show 2 earlier trains"
    And I scroll to the bottom
    And I note where train 106 is on screen
    When I tap train 106
    Then the card is headed "Selected train"
    And the card has changed height
    And train 106 is still in the same place on screen
    When I tap train 106
    Then the card is headed "Next train"
    And train 106 is still in the same place on screen

  @R5
  Scenario: A floating button goes back up to the card once it's out of view
    Given the screen is 390 by 520 pixels
    And I open the app
    Then there is no "Back to top" button
    When I tap "Show 2 earlier trains"
    And I scroll to the bottom
    Then there is a "Back to top" button
    When I tap "Back to top"
    Then the page is scrolled to the top
    And there is no "Back to top" button
    And the card has keyboard focus

  @R5
  Scenario: The floating button isn't shown over Settings
    Given the screen is 390 by 520 pixels
    And I open the app
    And I tap "Show 2 earlier trains"
    And I scroll to the bottom
    And there is a "Back to top" button
    When I tap "Settings"
    Then there is no "Back to top" button
