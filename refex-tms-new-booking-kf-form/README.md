# Travel Request — Kissflow Form component

**Priority 1:** Replace native Kissflow Travel Request fields with TMS-Refex UI, write to `Travel_Management_A02`.

## Upload

```bash
npm install
npm run zip
```

Upload `refex-tms-new-booking-kf-form.zip` as Kissflow custom component type **Form**, place on Travel Management create popup.

## Integration

See [`../refex-tms/docs/KISSFLOW_INTEGRATION.md`](../refex-tms/docs/KISSFLOW_INTEGRATION.md).

Writes fields via [`kf.context.updateField`](https://developers.kissflow.com/form/updatefield/).

## Includes

- Travel Request (purpose, domestic/intl, beneficiary, mode)
- Flight search (Travolution Cloud Run — correct payload)
- Hotel / Cab / Train / Bus request details
- PM design system (Inter, `#1E88E5`, white cards)

## Next (Travel Booking)

Deep booking UX parity with Kissflow live screenshots (hotel inventory, cab options) — same FieldIds, extended UI.
