Feature: Keep your place while browsing the timetable
  The column labels and earlier-trains action stay within reach without pinning
  the page's direction controls. Showing and hiding trains keeps my place.

  Background:
    Given it is Wednesday 12:00pm
    And my commute is from "San Francisco" to "Mountain View"
    And the screen is 390 by 520 pixels
    And there is a train every ten minutes

  @R1
  Scenario Outline: The column labels and action stay above the scrolling trains
    Given <commute>
    When I open the app
    And I scroll train 1104 to 140 pixels from the top
    Then the top controls are off screen
    And the timetable header is pinned above the trains
    And the "Show 42 earlier trains" button is in the viewport
    And the timetable's columns are:
      | <one> | <two> | <three> | Train |

    Examples:
      | commute                                                                                          | one           | two       | three         |
      | my commute is from "San Francisco" to "Mountain View"                                             | Depart        | Arrive    | Ride          |
      | my commute is from "San Francisco" to "Mountain View" with a stop at "Palo Alto"                  | San Francisco | Palo Alto | Mountain View |

  @R2 @R3
  Scenario: Showing and hiding earlier trains keeps the upcoming train in place
    Given I open the app
    And I scroll train 1084 to 300 pixels from the top
    And I note where train 1084 is on screen
    When I tap "Show 42 earlier trains"
    Then train 1084 is still in the same place on screen
    And the earlier-trains hint says "Scroll up to view"
    And the earlier-trains action is expanded
    When I tap "Hide 42 earlier trains"
    Then train 1084 is still in the same place on screen
    And the earlier-trains action is collapsed

  @R2 @R3
  Scenario: Earlier trains can be hidden without going back from later trains
    Given I open the app
    And I tap "Show 42 earlier trains"
    And I scroll train 1104 to 140 pixels from the top
    And I note where train 1104 is on screen
    Then the "Hide 42 earlier trains" button is in the viewport
    When I tap "Hide 42 earlier trains"
    Then train 1104 is still in the same place on screen
    And the timetable header is pinned above the trains
    When I tap "Show 42 earlier trains"
    Then train 1104 is still in the same place on screen
    When 1 minute passes
    Then train 1104 is still in the same place on screen

  @R3
  Scenario: Hiding the past trains I am reading returns to the next train, not the page top
    Given I open the app
    And I tap "Show 42 earlier trains"
    And I scroll train 1008 to 140 pixels from the top
    When I tap "Hide 42 earlier trains"
    Then train 1084 begins immediately below the pinned header
    And the top controls are off screen
    And the timetable doesn't list train 1008

  @R2
  Scenario: Expanding with no train visible reveals the upcoming boundary, not the oldest train
    Given I open the app
    And I place the earlier-trains action at the bottom of the screen
    When I tap "Show 42 earlier trains"
    Then train 1084 begins immediately below the pinned header

  @R3 @R5
  Scenario: A selected past train stays in place when the other earlier trains are hidden
    Given I open the app
    And I tap "Show 42 earlier trains"
    And I scroll train 1008 to 140 pixels from the top
    And I tap train 1008
    And I note where train 1008 is on screen
    When I tap "Hide 41 earlier trains"
    Then train 1008 is still in the same place on screen
    And train 1008 is marked as picked
    And the timetable doesn't list train 1006

  @R4
  Scenario: Without earlier trains only the column labels stick, with no empty action row
    Given it is Wednesday 5:00am
    When I open the app
    And I scroll train 1006 to 180 pixels from the top
    Then there is no earlier-trains action or space reserved for it
    And the timetable header is pinned above the trains
    And the top controls are off screen

  @R4 @R5
  Scenario: The action appearing as time passes keeps the surviving train in place
    Given it is Wednesday 5:00am
    And I open the app
    And I scroll train 1006 to 180 pixels from the top
    And I note where train 1006 is on screen
    When 1 minute passes
    Then the "Show 1 earlier train" button is in the viewport
    And train 1006 is still in the same place on screen
    And the timetable header is pinned above the trains

  @R4
  Scenario: A selected train is not a reason to leave an empty earlier-trains action
    Given it is Wednesday 5:01am
    And I open the app
    And I tap "Show 1 earlier train"
    When I tap train 1000
    Then there is no earlier-trains action or space reserved for it
    And train 1000 is marked as picked

  @R5 @R6
  Scenario: Keyboard toggling preserves focus and place through a redraw
    Given I open the app
    And I scroll train 1104 to 140 pixels from the top
    And I move keyboard focus to "Show 42 earlier trains"
    And I note where train 1104 is on screen
    When I press Enter
    Then train 1104 is still in the same place on screen
    And the "Hide 42 earlier trains" button has keyboard focus
    When 1 minute passes
    Then the "Hide 43 earlier trains" button has keyboard focus
    And train 1104 is still in the same place on screen
    When I press Space
    Then train 1104 is still in the same place on screen
    And the "Show 43 earlier trains" button has keyboard focus

  @R6
  Scenario: Keyboard focus stays readable when moving backward under the sticky header
    Given I open the app
    And I scroll train 1104 to 140 pixels from the top
    And I move keyboard focus to train 1104
    When I press Shift+Tab
    And I press Shift+Tab
    Then train 1100 has keyboard focus
    And train 1100 is in the viewport below the header

  @R5
  Scenario: A refreshed timetable preserves a surviving visible train
    Given I open the app
    And I scroll train 1104 to 100 pixels from the top
    And I note where train 1104 is on screen
    And the next timetable starts with train 1104
    When the time reaches 12:35pm before the page redraws
    And I return to the app
    Then the timetable doesn't list train 1102
    And train 1104 is still in the same place on screen

  @R5
  Scenario: A refreshed timetable removing every visible row returns to the next available train
    Given I open the app
    And I scroll train 1104 to 100 pixels from the top
    And the next timetable starts with train 1132
    When the time reaches 12:35pm before the page redraws
    And I return to the app
    Then the timetable doesn't list train 1104
    And train 1132 begins immediately below the pinned header

  @R5
  Scenario: An automatic refresh does not pull an offscreen timetable into view
    Given the screen is 390 by 360 pixels
    And I open the app
    When the time reaches 12:35pm before the page redraws
    And I return to the app
    Then the countdown says "in 5 min"
    And the page is scrolled to the top
    And the top of the card is in view

  @R5
  Scenario: The 3am boundary keeps the same displayed service date and viewed train
    Given it is Thursday 2:59am
    And I open the app
    And I scroll train 1104 to 140 pixels from the top
    And I note where train 1104 is on screen
    When the time reaches 3:01am
    Then train 1104 is still in the same place on screen
    And there is no earlier-trains action or space reserved for it

  @R6
  Scenario: Removing the focused earlier-trains action on refresh moves focus without jumping
    Given I open the app
    And I scroll train 1104 to 140 pixels from the top
    And I note where train 1104 is on screen
    And I move keyboard focus to "Show 42 earlier trains"
    And the next timetable starts with train 1104
    When the time reaches 12:35pm before the page redraws
    And I return to the app
    Then the timetable doesn't list train 1102
    And there is no earlier-trains action or space reserved for it
    And the card has keyboard focus
    And train 1104 is still in the same place on screen

  @R5
  Scenario: Picking a train with the card off screen keeps the row in place
    Given I open the app
    And I scroll train 1104 to 140 pixels from the top
    And I note where train 1104 is on screen
    When I tap train 1104
    Then the card has changed height
    And train 1104 is still in the same place on screen
    And the "Back to top" button is in the viewport
    When I tap "Back to top"
    Then the page is scrolled to the top
    And the card has keyboard focus
    And there is no "Back to top" button

  @R1
  Scenario: The sticky header stays inside the table and does not cover the footer
    Given I open the app
    When I scroll to the bottom
    Then the timetable header does not cover the footer
    When I tap "Settings"
    Then there is no timetable header on screen
    And there is no "Back to top" button

  @R1
  Scenario: An empty timetable keeps its rounded corners
    Given the timetable has only the usual few trains
    And my commute is from "Gilroy" to "San Francisco"
    When I open the app
    Then the timetable is empty
    And the empty timetable has rounded bottom corners

  @R3
  Scenario: Collapsing near the end of a short table respects the page limits
    Given the timetable has only the usual few trains
    And it is Wednesday 7:10am
    And I open the app
    And I tap "Show 2 earlier trains"
    And I scroll to the bottom
    When I tap "Hide 2 earlier trains"
    Then train 108 is in the viewport below the header
    And there is no horizontal page overflow
