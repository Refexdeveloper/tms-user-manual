/**
 * Build Travel_Management_A02 field payload from booking UI state.
 * FieldIds match process schema (Venwind / development).
 */
export function buildTravelFields(state) {
  const {
    purpose,
    region,
    mode,
    tripType,
    from,
    to,
    depDate,
    retDate,
    selected,
    hotel,
    cab,
    hotelCity,
    checkin,
    checkout,
    pickup,
    drop,
    comments,
    user,
    fareClass,
    breached,
    lead,
  } = state

  const tripLabel =
    tripType === 'roundTrip' ? 'Round Trip' : tripType === 'multiCity' ? 'Multi City' : 'One Way'

  const travelMode = ['Air', 'Train', 'Bus'].includes(mode) ? mode : 'Air'
  const f = selected || {}
  const amount = Number(f.total || 0) || undefined

  const fields = {
    Purpose_of_Travel: purpose || '',
    Purpose: purpose || '',
    DomesticInternational: region || 'Domestic',
    Travel_Mode: travelMode,
    Mode_of_Transport: travelMode === 'Air' ? 'Flight' : travelMode,
    OnewayRound_tripNot_applicable: tripLabel,
    Travel_Type: tripType || 'oneWay',
    Trip_Type: tripLabel,
    From_Date: depDate || '',
    To_Date: retDate || (tripType === 'oneWay' ? depDate : '') || '',
    Departure_Date: depDate || '',
    Boarding_from: from?.city || from?.display || '',
    Destination_to_1: to?.city || to?.display || '',
    common_From: from?.city || '',
    common_To: to?.city || '',
    Boarding: from?.city || '',
    Destination_1: to?.city || '',
    Is_accommodation_required: Boolean(hotel || mode === 'Hotel'),
    Do_you_require_Cab_service_: Boolean(cab || mode === 'Cab'),
    Travel_booking_required_by_Travel_Desk: true,
    Comments: comments || '',
    Beneficiary: 'Self',
    City: hotelCity || (mode === 'Hotel' ? to?.city : '') || '',
    Checkin_Date: checkin || '',
    Checkout_Date: checkout || '',
    Pickup_Location: pickup || '',
    Drop_Location: drop || '',
    Requester_Email: user?.Email || '',
    emp_email_address: user?.Email || '',
    Employee_Details: user?.Name || '',
    Booking_Amount_1: amount,
    Eligible_Mode: fareClass || 'Economy',

    // Flight selection FS_*
    FS_Airline_Name: f.airline || '',
    FS_Airline_Code: f.airlineCode || '',
    FS_Flight_Number: f.flightNo || '',
    FS_Selected_Flight_ID: f.id || '',
    FS_Is_International: region === 'International' ? 'Yes' : 'No',
    FS_Booking_Amount: amount,
    FS_Booking_Amount_1: amount,
    FS_Currency_Code: f.currency || 'INR',
    FS_Total_Fare: amount,
    FS_Total_Fare_1: amount,
    FS_From_Code: from?.code || '',
    FS_From_City: from?.city || '',
    FS_From_Airport_Name: from?.name || '',
    FS_From_Country: from?.country || 'IN',
    FS_To_Code: to?.code || '',
    FS_To_City: to?.city || '',
    FS_To_Airport_Name: to?.name || '',
    FS_To_Country: to?.country || 'IN',
    FS_Trip_Type: tripType || 'oneWay',
    FS_Fare_Type: fareClass || 'Economy',
    FS_Departure_Date: depDate || '',
    FS_Departure_Time: f.depart || '',
    FS_Arrival_Time: f.arrive || '',
    FS_Duration: f.duration || '',
    FS_Stops: f.stops ?? '',
    FS_Policy_Status: breached ? 'BREACHED' : 'PASS',
    FS_Policy_Actual_Advance_Days: lead != null ? lead : '',
    FS_Policy_Required_Advance_Days: 15,
    FS_Policy_Breached_Day_Count: breached && lead != null ? Math.max(0, 15 - lead) : 0,
    FS_Policy_Insight_Message: breached
      ? `This booking breaches the 15-day advance booking policy by ${Math.max(0, 15 - (lead || 0))} days. Fare impact tracking should be initiated for Finance/Admin review.`
      : 'Within 15-day advance booking policy.',
    FS_Search_Source: 'refex-tms-travel-booking',
  }

  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  )
}
