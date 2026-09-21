# Travel Booking — Kissflow Form component

Ixigo / MakeMyTrip-style travel booking UI for Kissflow **Form** custom components.

On **Save to Kissflow & continue**, fields write into process **`Travel_Management_A02`** via `kf.context.updateField`. Then use Kissflow **Submit** so the existing workflow runs.

## Upload

1. `npm run zip`
2. Kissflow → Custom components → **Form** → upload `refex-tms-new-booking-kf-form.zip`
3. Place on Travel Request create form

## Features

- Tiny mode chips: Flights / Trains / Bus / Cabs / Hotels
- MMT-style FROM–TO–dates search strip + orange SEARCH
- Airline logos, SELECT, filters, 15-day policy breach
- + Hotel / + Cab add-ons
- FieldIds for Travel_Management_A02 (`Travel_Mode`, `Purpose_of_Travel`, `FS_*`, …)
