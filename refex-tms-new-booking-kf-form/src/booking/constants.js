/** Travel_Management_A02 / Travel Request-Refex FieldIds — kf.context.updateField */
export const APP_ID = 'Expense_and_Travel_Management_A00'
export const TRAVEL_PROCESS_ID = 'Travel_Management_A02'

export const FIELDS = {
  purpose: 'Purpose_of_Travel',
  purposeAlt: 'Purpose',
  region: 'DomesticInternational',
  mode: 'Mode_of_Transport',
  modeAlt: 'Travel_Mode',
  trip: 'Travel_Type',
  tripAlt: 'Trip_Type',
  dep: 'Departure_Date',
  depAlt: 'FS_Departure_Date',
  ret: 'To_Date',
  from: 'FS_From_City',
  to: 'FS_To_City',
  fromAlt: 'common_From',
  toAlt: 'common_To',
  boarding: 'Boarding_from',
  dest: 'Destination_to_1',
  amount: 'FS_Booking_Amount_1',
  amountAlt: 'Booking_Amount_1',
  visa: 'Do_you_require_visa',
  hotel: 'Is_accommodation_required',
  exception: 'Exception',
  multi: 'Are_you_travelling_to_multiple_cities',
  modify: 'Select_the_request_which_you_want_to_modify',
  comments: 'Comments',
  pickup: 'Pickup_Location',
  drop: 'Drop_Location',
  pickupTime: 'Pickup_Time',
  dropTime: 'Drop_Time',
  city: 'City',
  checkin: 'Checkin_Date',
  checkout: 'Checkout_Date',
  requesterEmail: 'Requester_Email',
  empEmail: 'emp_email_address',
  employeeDetails: 'Employee_Details',
}

export const CLOUD_RUN = 'https://refex-tms-flightsearch-dhwffeu7pq-el.a.run.app'

export const PURPOSES = ['Business trip', 'Event', 'Conference', 'Customer visit', 'Sales meet', 'Exhibition']
export const MODE_OPTIONS = [
  { id: 'Air', label: 'Air', icon: 'ri-flight-takeoff-line' },
  { id: 'Train', label: 'Train', icon: 'ri-train-line' },
  { id: 'Bus', label: 'Bus', icon: 'ri-bus-line' },
  { id: 'Cab', label: 'Cab', icon: 'ri-taxi-line' },
]
export const TIMES = ['Morning', 'Afternoon', 'Evening', 'Night', 'Any time']
export const LINES = ['Refex', 'Venwind', 'Refex Green Mobility']
export const ENTITIES = ['Refex Industries', 'Venwind Refex', 'Refex Green Mobility']
