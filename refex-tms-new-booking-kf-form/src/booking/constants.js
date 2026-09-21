/** Travel_Management_A02 FieldIds */
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
  hotel: 'Is_accommodation_required',
  comments: 'Comments',
  pickup: 'Pickup_Location',
  drop: 'Drop_Location',
  city: 'City',
  checkin: 'Checkin_Date',
  checkout: 'Checkout_Date',
  requesterEmail: 'Requester_Email',
  empEmail: 'emp_email_address',
  employeeDetails: 'Employee_Details',
}

export const CLOUD_RUN = 'https://refex-tms-flightsearch-dhwffeu7pq-el.a.run.app'

export const PURPOSES = ['Business trip', 'Event', 'Conference', 'Customer visit', 'Sales meet', 'Exhibition']

/** Tiny mode chips — Ixigo / MMT style */
export const MODE_OPTIONS = [
  { id: 'Air', label: 'Flights', icon: 'ri-flight-takeoff-line', accent: '#1E88E5' },
  { id: 'Train', label: 'Trains', icon: 'ri-train-line', accent: '#0084AD' },
  { id: 'Bus', label: 'Bus', icon: 'ri-bus-line', accent: '#F97316' },
  { id: 'Cab', label: 'Cabs', icon: 'ri-taxi-line', accent: '#0F766E' },
  { id: 'Hotel', label: 'Hotels', icon: 'ri-hotel-bed-line', accent: '#8B5CF6' },
]

export const FARE_CLASSES = ['Economy', 'Premium Economy', 'Business']
