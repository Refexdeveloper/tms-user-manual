/**
 * Kissflow FieldId map for Travel_Management_A02
 * Shared reference for TMS-Refex ↔ Kissflow writeback
 */
export const KF = {
  APP_ID: 'Expense_and_Travel_Management_A00',
  TRAVEL_PROCESS_ID: 'Travel_Management_A02',
  TRAVEL_REPORT_ID: 'All_Items_A00',
  TRAVEL_CREATE_POPUP: 'Popup_rCILSrY8KF',
  CLOUD_RUN: 'https://refex-tms-flightsearch-dhwffeu7pq-el.a.run.app',
}

export const TRAVEL_FIELDS = {
  Purpose_of_Travel: 'Purpose_of_Travel',
  Purpose: 'Purpose',
  DomesticInternational: 'DomesticInternational',
  Mode_of_Transport: 'Mode_of_Transport',
  Travel_Type: 'Travel_Type',
  Trip_Type: 'Trip_Type',
  Departure_Date: 'Departure_Date',
  FS_Departure_Date: 'FS_Departure_Date',
  From_Date: 'From_Date',
  To_Date: 'To_Date',
  FS_From_City: 'FS_From_City',
  FS_To_City: 'FS_To_City',
  common_From: 'common_From',
  common_To: 'common_To',
  Boarding_from: 'Boarding_from',
  Destination_to_1: 'Destination_to_1',
  FS_Booking_Amount_1: 'FS_Booking_Amount_1',
  Booking_Amount_1: 'Booking_Amount_1',
  Is_accommodation_required: 'Is_accommodation_required',
  Beneficiary: 'Beneficiary',
  Comments: 'Comments',
  City: 'City',
  Checkin_Date: 'Checkin_Date',
  Checkout_Date: 'Checkout_Date',
  Pickup_Location: 'Pickup_Location',
  Drop_Location: 'Drop_Location',
  Requester_Email: 'Requester_Email',
  emp_email_address: 'emp_email_address',
  Employee_Details: 'Employee_Details',
}

/** Build Kissflow updateField payload from TMS request form state */
export function toKissflowTravelPayload(state) {
  const mode = state.mode === 'flightHotel' ? 'air' : state.mode
  const modeLabel =
    mode === 'air' ? 'Flight' : mode === 'train' ? 'Train' : mode === 'bus' ? 'Bus' : mode === 'cab' ? 'Cab' : 'Hotel'
  const from = state.fromDisplay || ''
  const to = state.toDisplay || ''
  const amount = Number(state.bookingAmount || 0)
  const withHotel = state.mode === 'flightHotel' || state.withHotel || mode === 'accommodation'

  return {
    [TRAVEL_FIELDS.Purpose_of_Travel]: state.purpose || '',
    [TRAVEL_FIELDS.Purpose]: state.purpose || '',
    [TRAVEL_FIELDS.DomesticInternational]: state.domesticInternational || 'Domestic',
    [TRAVEL_FIELDS.Mode_of_Transport]: modeLabel,
    [TRAVEL_FIELDS.Travel_Type]: state.travelType || 'oneWay',
    [TRAVEL_FIELDS.Trip_Type]: state.travelType || 'oneWay',
    [TRAVEL_FIELDS.Departure_Date]: state.departureDate || '',
    [TRAVEL_FIELDS.FS_Departure_Date]: state.departureDate || '',
    [TRAVEL_FIELDS.From_Date]: state.departureDate || '',
    [TRAVEL_FIELDS.To_Date]: state.returnDate || state.checkoutDate || '',
    [TRAVEL_FIELDS.FS_From_City]: from,
    [TRAVEL_FIELDS.FS_To_City]: to,
    [TRAVEL_FIELDS.common_From]: from,
    [TRAVEL_FIELDS.common_To]: to,
    [TRAVEL_FIELDS.Boarding_from]: from,
    [TRAVEL_FIELDS.Destination_to_1]: to,
    [TRAVEL_FIELDS.FS_Booking_Amount_1]: amount,
    [TRAVEL_FIELDS.Booking_Amount_1]: amount,
    [TRAVEL_FIELDS.Is_accommodation_required]: withHotel ? 'Yes' : 'No',
    [TRAVEL_FIELDS.Beneficiary]: state.beneficiary || 'Self',
    [TRAVEL_FIELDS.Comments]: state.remarks || '',
    [TRAVEL_FIELDS.City]: state.cityDisplay || to,
    [TRAVEL_FIELDS.Checkin_Date]: state.checkinDate || '',
    [TRAVEL_FIELDS.Checkout_Date]: state.checkoutDate || '',
    [TRAVEL_FIELDS.Pickup_Location]: state.pickupLocation || '',
    [TRAVEL_FIELDS.Drop_Location]: state.dropLocation || '',
    [TRAVEL_FIELDS.Requester_Email]: state.requesterEmail || '',
    [TRAVEL_FIELDS.emp_email_address]: state.requesterEmail || '',
    [TRAVEL_FIELDS.Employee_Details]: state.requesterName || '',
  }
}
