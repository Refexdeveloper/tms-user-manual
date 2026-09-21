# Refex TMS Flight Search Kissflow Component Instructions

You are working only inside:

/Users/bobbybahadur/refex-tms-flightsearch-kf-component

Do not modify files outside this repository.

## Business Context

This is a Kissflow custom form-field component used in Refex Travel Management for flight search and booking capture.

The component writes selected flight JSON into the custom field value using:

actions.updateValue(payloadText)

Do not reintroduce direct Kissflow SDK field updates from inside the component.

Do not use:
- kf.context.updateField(...)
- Selected_Flight_Data writeback
- external SDK initialization from the component iframe

The Kissflow form-level onChange event reads the component field value and updates hidden FS_* analytics fields.

## Canonical Business Rules

One Way booking:
- User selects exactly one flight.
- Component writes one selected flight payload.

Round Trip booking:
- User must select exactly one onward flight and exactly one return flight.
- Return date must be later than departure date.
- Component must not write a completed round-trip payload until both legs are selected.
- Onward and return flights must be visibly separated in the UI.
- Do not mix onward and return sector results in one flat selectable list.

## Known API Behavior

The Cloud Run API returns a flat result.options array.
Each option may include sectorIndex.

Expected interpretation:
- sectorIndex 0 = onward
- sectorIndex 1 = return

Fallback route detection:
- onward = sourceCityCode equals fromAirport.code and destinationCityCode equals toAirport.code
- return = sourceCityCode equals toAirport.code and destinationCityCode equals fromAirport.code

## Development Rules

Before making large changes:
- State which files will be touched.
- Explain why each file must change.
- Preserve working one-way behavior.
- Build after changes using npm run build.
- Generate ZIP only after successful build using npm run zip.
- Never deploy, publish, or run destructive commands without explicit approval.

## Regression Risks

Do not break:
- One-way flight search
- One-way flight selection
- actions.updateValue(payloadText)
- summary card display
- sticky scroll hint
- return-date validation
- hidden FS_* analytics writeback flow triggered by Kissflow form onChange

## Output Expected After Work

Report:
1. Files changed
2. Business logic changed
3. One-way behavior
4. Round-trip behavior
5. Build result
6. ZIP path
