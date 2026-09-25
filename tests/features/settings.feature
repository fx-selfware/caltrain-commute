Feature: Settings
  Stations and the time format are chosen in Settings and saved in the browser.

  Scenario: The first time, the app asks for my stations, listed A to Z
    Given it is Wednesday 7:10am
    And I haven't chosen my stations yet
    When I open the app
    Then I'm asked to choose my stations
    And there is no "Cancel" button
    And the station choices are:
      | Choose a station |
      | Gilroy           |
      | Millbrae         |
      | Mountain View    |
      | Palo Alto        |
      | San Francisco    |
      | San Jose Diridon |

  Scenario: Saving checks that home and work are two different stations
    Given it is Wednesday 7:10am
    And I haven't chosen my stations yet
    And I open the app
    When I tap "Save"
    Then I'm told "Choose your home station."
    When I choose "San Francisco" as my home station
    And I tap "Save"
    Then I'm told "Choose your work station."
    When I choose "San Francisco" as my work station
    And I tap "Save"
    Then I'm told "Home and work need to be different stations."

  Scenario: The stop can only be a station between home and work
    Given it is Wednesday 7:10am
    And I haven't chosen my stations yet
    When I open the app
    Then I can't choose a stop, because "Choose home and work first."
    When I choose "San Francisco" as my home station
    And I choose "Mountain View" as my work station
    Then the stop choices are:
      | None      |
      | Millbrae  |
      | Palo Alto |
    When I choose "Palo Alto" as my home station
    Then I can't choose a stop, because "There are no stations between home and work."

  Scenario: Saving shows my next train and remembers my stations
    Given it is Wednesday 7:10am
    And I haven't chosen my stations yet
    And I open the app
    When I choose "San Francisco" as my home station
    And I choose "Mountain View" as my work station
    And I choose "Palo Alto" as my stop
    And I tap "Save"
    Then the settings are closed
    And the card is headed "Next train"
    And my saved stations are "San Francisco" to "Mountain View" with a stop at "Palo Alto"
    When I reload the app
    Then the card is headed "Next train"

  Scenario: The gear opens Settings, and Cancel leaves them as they were
    Given it is Wednesday 7:10am
    And my commute is from "San Francisco" to "Mountain View"
    And I open the app
    When I tap "Settings"
    Then the settings show "San Francisco" as my home station
    And the settings show "Mountain View" as my work station
    When I choose "San Jose Diridon" as my work station
    And I tap "Cancel"
    Then the settings are closed
    And the card's itinerary is:
      | 7:30am | San Francisco |
      | 8:05am | Mountain View |

  Scenario: Times follow the phone's region: 12-hour in the US
    Given it is Wednesday 7:10am
    And my commute is from "San Francisco" to "Mountain View"
    When I open the app
    Then the card's itinerary is:
      | 7:30am | San Francisco |
      | 8:05am | Mountain View |

  @en-GB
  Scenario: Times follow the phone's region: 24-hour in the UK
    Given it is Wednesday 7:10am
    And my commute is from "San Francisco" to "Mountain View"
    When I open the app
    Then the card's itinerary is:
      | 07:30 | San Francisco |
      | 08:05 | Mountain View |

  Scenario: The time format can be changed in Settings and is remembered
    Given it is Wednesday 7:10am
    And my commute is from "San Francisco" to "Mountain View"
    And I open the app
    When I tap "Settings"
    And I tap "24-hour"
    And I tap "Save"
    Then the card's itinerary is:
      | 07:30 | San Francisco |
      | 08:05 | Mountain View |
    And train 502 shows "07:30" under "Depart"
    When I reload the app
    Then train 502 shows "07:30" under "Depart"

  Scenario: Settings from the version with two work stations are converted
    Given it is Wednesday 7:10am
    And I saved my stations with the older version: home "San Francisco", work "Palo Alto" and "Mountain View"
    When I open the app
    Then the timetable's columns are:
      | San Francisco | Palo Alto | Mountain View | Train |
    And my saved stations are "San Francisco" to "Mountain View" with a stop at "Palo Alto"
