/**
 * Map TMS-Refex travel request body → Travel_Management_A02 FieldIds only.
 * Unknown FieldIds cause Kissflow create to fail (KISSFLOW_ERROR_01003).
 */
export function toKissflowTravelFields(body = {}, user = {}) {
  const mode = body.travel_mode || body.mode || 'air'
  const modeLabel =
    mode === 'air' || mode === 'flightHotel'
      ? 'Flight'
      : mode === 'train'
        ? 'Train'
        : mode === 'bus'
          ? 'Bus'
          : mode === 'cab'
            ? 'Cab'
            : 'Hotel'

  const from =
    body.from_location ||
    body.fromDisplay ||
    body.air?.segments?.[0]?.from?.display ||
    body.air?.segments?.[0]?.from?.city ||
    ''
  const to =
    body.to_location ||
    body.toDisplay ||
    (body.air?.tripType === 'multiCity'
      ? body.air?.segments?.[body.air.segments.length - 1]?.to?.display
      : body.air?.segments?.[0]?.to?.display) ||
    body.accommodation?.city?.display ||
    ''

  const dep =
    body.departure_date ||
    body.air?.segments?.[0]?.date ||
    body.trip?.date ||
    ''
  const ret =
    body.return_date ||
    body.air?.returnDate ||
    body.trip?.endDate ||
    body.accommodation?.checkout ||
    ''

  const amount = Number(
    body.amount ??
      body.bookingAmount ??
      body.selected_option?.flight?.totalFare ??
      body.air?.selectedOption?.flight?.totalFare ??
      0
  )

  const withHotel =
    mode === 'accommodation' ||
    mode === 'flightHotel' ||
    Boolean(body.addons?.withHotel) ||
    Boolean(body.accommodation?.requested_with_trip)

  const tripType = body.trip_type || body.air?.tripType || body.travelType || 'oneWay'
  const region = body.domestic_international || body.domesticInternational || 'Domestic'
  const email = body.requester_email || user.email || ''
  const name = body.requester_name || user.name || ''

  const selected = body.selected_option || body.air?.selectedOption || null
  const flight = selected?.flight || selected?.onward || null

  const fields = {
    Purpose_of_Travel: body.purpose || '',
    Purpose: body.purpose || '',
    DomesticInternational: region,
    Mode_of_Transport: modeLabel,
    Travel_Mode: mode === 'air' || mode === 'flightHotel' ? 'Air' : modeLabel,
    Travel_Type: tripType,
    Trip_Type: tripType,
    Departure_Date: dep,
    FS_Departure_Date: dep,
    From_Date: dep,
    To_Date: ret,
    FS_From_City: from,
    FS_To_City: to,
    common_From: from,
    common_To: to,
    Boarding_from: from,
    Destination_to_1: to,
    FS_Booking_Amount_1: amount || undefined,
    Booking_Amount_1: amount || undefined,
    Is_accommodation_required: withHotel ? 'Yes' : 'No',
    Beneficiary: body.beneficiary || 'Self',
    Comments: body.remarks || body.comments || '',
    City: body.accommodation?.city?.display || body.city || '',
    Checkin_Date: body.accommodation?.checkin || body.checkin_date || '',
    Checkout_Date: body.accommodation?.checkout || body.checkout_date || '',
    Pickup_Location: body.cab?.pickup || body.pickup_location || '',
    Drop_Location: body.cab?.drop || body.drop_location || '',
    Requester_Email: email,
    emp_email_address: email,
    Employee_Details: name,
  }

  if (flight) {
    Object.assign(fields, {
      FS_Airline_Name: flight.airlineName || flight.airline || '',
      FS_Airline_Code: flight.airlineCode || '',
      FS_Flight_Number: flight.flightNumber || flight.flightNo || '',
      FS_Selected_Flight_ID: flight.id || '',
      FS_Total_Fare: flight.totalFare ?? flight.total ?? amount,
      FS_Currency_Code: flight.currencyCode || body.currency || 'INR',
      FS_Departure_Time: flight.departureTime || flight.depart || '',
      FS_Arrival_Time: flight.arrivalTime || flight.arrive || '',
      FS_Duration: flight.duration || '',
      FS_Stops: flight.stops ?? '',
      FS_Trip_Type: tripType,
      FS_Is_International: region === 'International' ? 'Yes' : 'No',
    })
  }

  if (body.Travel_Booking_JSON || body.travel_booking_json) {
    fields.Travel_Booking_JSON = body.Travel_Booking_JSON || body.travel_booking_json
  }

  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  )
}
