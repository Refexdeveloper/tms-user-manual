import { flightIcon, trainIcon, busIcon, holidayIcon, hotelIcon, cabIcon } from '../../../raghul_icons/index.js'

/**
 * Kissflow IDs shared with employee-dashboard-v2 / approvers-dashboard-v2.
 * Travel process form FieldIds used by onChange mapping after this component writes JSON.
 */
export const KF_APP_ID = 'Expense_and_Travel_Management_A00'
export const KF_TRAVEL_PROCESS_ID = 'Travel_Management_A02'
export const KF_ADVANCE_PROCESS_ID = 'Advance_Payment_Request_Process_A01'
export const KF_EXPENSE_PROCESS_ID = 'Expense_Management_A03'

export const KF_TRAVEL_REPORT_ID = 'All_Items_A00'
export const KF_ADVANCE_REPORT_ID = 'ALL_ITEMS_WITH_TABLE_A00'
export const KF_EXPENSE_REPORT_ID = 'All_Items_MK_A00'

export const KF_EMPLOYEE_TRAVEL_POPUP = 'Popup_rCILSrY8KF'
export const KF_EMPLOYEE_DASHBOARD_PAGE = 'Employee_Dashboard_V2_A00'

/** Process form FieldIds (Travel_Management_A02) — map from component payload via form onChange */
export const TRAVEL_FORM_FIELDS = {
  purpose: 'Purpose_of_Travel',
  purposeAlt: 'Purpose',
  domesticInternational: 'DomesticInternational',
  modeOfTransport: 'Mode_of_Transport',
  travelType: 'Travel_Type',
  tripType: 'Trip_Type',
  departureDate: 'Departure_Date',
  fsDepartureDate: 'FS_Departure_Date',
  fromDate: 'From_Date',
  toDate: 'To_Date',
  commonFrom: 'common_From',
  commonTo: 'common_To',
  fsFromCity: 'FS_From_City',
  fsToCity: 'FS_To_City',
  boardingFrom: 'Boarding_from',
  destinationTo: 'Destination_to_1',
  bookingAmount: 'FS_Booking_Amount_1',
  bookingAmountAlt: 'Booking_Amount_1',
  mcRouteSummary: 'MC_Route_Summary',
  mcTotalAmount: 'MC_Total_Booking_Amount',
  isAccommodation: 'Is_accommodation_required',
  beneficiary: 'Beneficiary',
  comments: 'Comments',
  exception: 'Exception',
  requesterEmail: 'Requester_Email',
  empEmail: 'emp_email_address',
  employeeDetails: 'Employee_Details',
  city: 'City',
  checkin: 'Checkin_Date',
  checkout: 'Checkout_Date',
  pickupLocation: 'Pickup_Location',
  dropLocation: 'Drop_Location',
  pickupTime: 'Pickup_Time',
  dropTime: 'Drop_Time',
  greenMobility: 'Go_with_Green_mobility',
}

export const CLOUD_RUN_API_BASE = 'https://refex-tms-flightsearch-dhwffeu7pq-el.a.run.app'

export const MODES = [
  { id: 'air', label: 'Flight', subtitle: 'Domestic & International', icon: flightIcon, accent: '#1E88E5', soft: '#E3F2FD' },
  { id: 'train', label: 'Train', subtitle: 'Across India', icon: trainIcon, accent: '#43A047', soft: '#E8F5E9' },
  { id: 'bus', label: 'Bus', subtitle: 'Pan India Travel', icon: busIcon, accent: '#FB8C00', soft: '#FFF3E0' },
  { id: 'flightHotel', label: 'Flight + Hotel', subtitle: 'Complete Travel', icon: holidayIcon, accent: '#1565C0', soft: '#EEF4FF' },
  { id: 'accommodation', label: 'Hotel', subtitle: 'Stay with comfort', icon: hotelIcon, accent: '#7C3AED', soft: '#F3E8FF' },
  { id: 'cab', label: 'Cab', subtitle: 'Airport & Local', icon: cabIcon, accent: '#1E88E5', soft: '#E3F2FD' },
]
