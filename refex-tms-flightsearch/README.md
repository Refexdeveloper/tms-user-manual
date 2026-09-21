# Refex TMS Flight Search Form Component

A Kissflow custom form-field component for Refex Travel Management System.

The component supports:

- One-way flight search
- Round-trip flight search
- Multi-city flight search
- Multi-language UI labels
- Advance booking policy visibility
- Travolution-backed flight search through a secure Cloud Run API
- Multi-city selected flights capture into a Kissflow child table

## Screenshots

### One-way search

![One-way flight search](docs/demo-screenshots/Flight-search-form-component-one-way.png)

### Round-trip search

![Round-trip flight search](docs/demo-screenshots/Flight-search-form-component-round-trip.png)

### Multi-city search

![Multi-city flight search](docs/demo-screenshots/Flight-search-form-component-multi-city.png)

### Multilingual UI

![Multilingual flight search](docs/demo-screenshots/Flight-search-form-component-multi-lingual.png)

![Multilingual flight search expanded](docs/demo-screenshots/Flight-search-form-component-multi-lingual-1.png)

## Architecture

```text
Kissflow Form Field
  -> Cloud Run Backend
  -> Travolution Auth API
  -> Travolution Air Search API
  -> Normalized Flight Response
  -> Kissflow Field JSON
  -> Kissflow onChange Mapping
  -> Parent Summary Fields + Multi-city Child Table
