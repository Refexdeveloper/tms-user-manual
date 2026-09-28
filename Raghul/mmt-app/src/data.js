export const products = [
  { id: "flights", label: "Flights", icon: "/assets/icons/nav-flights.png", hint: "Book International and Domestic Flights" },
  { id: "hotels", label: "Hotels", icon: "/assets/icons/nav-hotels.png", hint: "Book hotels, homestays and more" },
  { id: "homestays", label: "Villas & Homestays", icon: "/assets/icons/nav-homestays.png", hint: "Book villas & homestays across India" },
  { id: "holidays", label: "Holiday Packages", icon: "/assets/icons/nav-holidays.png", hint: "Book flights + hotel holiday packages" },
  { id: "trains", label: "Trains", icon: "/assets/icons/nav-trains.png", hint: "Book IRCTC train tickets" },
  { id: "buses", label: "Buses", icon: "/assets/icons/nav-buses.png", hint: "Book bus tickets across India" },
  { id: "cabs", label: "Cabs", icon: "/assets/icons/nav-cabs.png", hint: "Book outstation and hourly cabs" },
  { id: "tours", label: "Tours & Attractions", icon: "/assets/icons/nav-tours.png", hint: "Discover tours & attractions" },
  { id: "visa", label: "Visa", icon: "/assets/icons/nav-visa.png", hint: "Visa on MakeMyTrip | Powered by Experts" },
  { id: "cruise", label: "Cruise", icon: "/assets/icons/nav-cruise.png", hint: "Explore cruise holidays", isNew: true },
  { id: "forex", label: "Forex Card & Currency", icon: "/assets/icons/nav-forex.png", hint: "Get forex cards and currency" },
  { id: "insurance", label: "Travel Insurance", icon: "/assets/icons/nav-insurance.png", hint: "Get travel insurance for your trip" },
];

export const airports = [
  { city: "Delhi", code: "DEL, Delhi Airport" },
  { city: "Mumbai", code: "BOM, Chhatrapati Shivaji International Airport" },
  { city: "Bengaluru", code: "BLR, Kempegowda International Airport" },
  { city: "Chennai", code: "MAA, Chennai International Airport" },
  { city: "Hyderabad", code: "HYD, Rajiv Gandhi International Airport" },
  { city: "Kolkata", code: "CCU, Netaji Subhash Chandra Bose Airport" },
  { city: "Goa", code: "GOI, Dabolim Goa International Airport" },
];

export const explore = [
  { title: "Where2Go", icon: "/assets/explore/where2go.png" },
  { title: "How2Go", sub: "Find routes to anywhere", icon: "/assets/explore/how2go.png", isNew: true },
  { title: "MakeMyTrip ICICI Credit Card", sub: "Never-expiring rewards & big benefits", icon: "/assets/explore/travelcard.png" },
  { title: "MICE", sub: "Offsites, Events & Meetings", icon: "/assets/explore/mice.png" },
  { title: "Gift Cards", icon: "/assets/explore/giftcards.png" },
];

export const offerTabs = [
  ["ALL", "ALL OFFERS"],
  ["FLIGHTS", "FLIGHTS"],
  ["HOTELS", "HOTELS"],
  ["HOLIDAYS", "HOLIDAYS"],
  ["TRAINS", "TRAINS"],
  ["CABS", "CABS"],
  ["BANK", "BANK OFFERS"],
];

export const offers = {
  ALL: [
    { tag: "INTL FLIGHTS", title: "The Only Fest You Need to Fly Business Class!", text: "Here’s FLAT 8% OFF* for You.", img: "/assets/offers/business-class.jpg" },
    { tag: "INTL FLIGHTS", title: "LIVE NOW: Sale by Air India", text: "with Up to 10% OFF* on Premium Economy Bookings.", img: "/assets/offers/airindia.jpg" },
    { tag: "DOM FLIGHTS", title: "Save Big and Travel Smart:", text: "Grab Up to 35% OFF* on Flights, Hotels and Packages.", img: "/assets/offers/indusind.jpg" },
    { tag: "INTL FLIGHTS", title: "LIVE NOW: Sale by Qatar Airways", text: "with Up to 18% OFF* on Business Class Bookings.", img: "/assets/offers/qatar.jpg" },
    { tag: "HOLIDAYS", title: "Here Now: Lakshadweep Packages with Direct Flights", text: "Book now starting at ₹84,999*.", img: "/assets/offers/lakshadweep.jpg" },
    { tag: "DOM HOTELS", title: "Too Good to Miss", text: "Up to 60% OFF* on Stays at Oyo Hotels on select properties!", img: "/assets/offers/oyo.jpg" },
  ],
  FLIGHTS: [
    { tag: "INTL FLIGHTS", title: "LIVE NOW: Sale by AirAsia", text: "with Flights Starting at ₹11,999*.", img: "/assets/offers/airasia.jpg" },
    { tag: "INTL FLIGHTS", title: "Sale by Japan Airlines", text: "with Flights to Tokyo Starting at ₹20,000*.", img: "/assets/offers/japan.jpg" },
    { tag: "INTL FLIGHTS", title: "LIVE NOW: Sale by Gulf Air", text: "with Up to 20% OFF* on Flights.", img: "/assets/offers/gulf.jpg" },
  ],
  HOTELS: [
    { tag: "DOM HOTELS", title: "YOUR CITY. YOUR IBIS.", text: "SAVE 10% ON STAYS* across ibis hotels in India", img: "/assets/offers/ibis.jpg" },
    { tag: "DOM HOTELS", title: "Live Now: Limited-time Deals", text: "for quick weekend getaways.", img: "/assets/offers/lastminute.jpg" },
    { tag: "DOM HOTELS", title: "FOR INDIA’S FINEST HOTELS:", text: "FLAT 15% OFF* on 5-Star Hotels", img: "/assets/offers/visa-hotels.jpg" },
  ],
  HOLIDAYS: [
    { tag: "HOLIDAYS", title: "4N/5D Phu Quoc Group Package with Direct Flights.", text: "Book starting at ₹99,999*.", img: "/assets/offers/phuquoc.jpg" },
    { tag: "HOLIDAYS", title: "Singapore-special: Get 1 FREE* Activity", text: "on booking Disney Cruise Line Packages with us.", img: "/assets/offers/disney.jpg" },
    { tag: "HOLIDAYS", title: "Here Now: Lakshadweep Packages with Direct Flights", text: "Book now starting at ₹84,999*.", img: "/assets/offers/lakshadweep.jpg" },
  ],
  TRAINS: [
    { tag: "RAILS", title: "For Your Diwali Trip: Cancel Train Ticket at ₹0*.", text: "Get Free Cancellation on trains at no additional cost.", img: "/assets/offers/trains.jpg" },
    { tag: "RAILS", title: "Special Deal on Trains for MMTBLACK Members.", text: "Up to ₹500 OFF* on Alternate Trip Plan or Free Cancellation.", img: "/assets/offers/black-train.jpg" },
    { tag: "RAILS", title: "INTRODUCING: Seat Availability Forecast", text: "and Sold-out Alerts for train bookings.", img: "/assets/offers/seat-forecast.jpg" },
  ],
  CABS: [
    { tag: "CABS", title: "Book Hourly Rental Cabs with Us", text: "and Enjoy No Surge Pricing, Flexibility, Customizable Packages & more.", img: "/assets/offers/hr-cab.jpg" },
    { tag: "CABS", title: "Explore Top Routes for Outstation Cabs", text: "Starting @ ₹10/km* & book reliable journeys with us!", img: "/assets/offers/os-cab.jpg" },
    { tag: "CABS", title: "Up to ₹500 OFF* on Outstation Cabs!", text: "Grab this special offer for your next road trip.", img: "/assets/offers/ahm-vad.jpg" },
  ],
  BANK: [
    { tag: "INTL FLIGHTS", title: "Up to ₹10000 instant discount", text: "on International Flights!", img: "/assets/offers/icici-if.jpg" },
    { tag: "INTL HOTELS", title: "Grab Upto 15% OFF* on 3, 4 & 5-Star Stays", text: "with ICICI Bank Credit Cards and Credit Card EMI.", img: "/assets/offers/icici-ih.jpg" },
    { tag: "INTL FLIGHTS", title: "Grab Up to ₹7500 OFF* on Flights.", text: "Big Savings for You with HDFC EMI.", img: "/assets/offers/hdfc.jpg" },
  ],
};

export const collections = [
  { kicker: "Top 8", title: "Stays in & Around Delhi for a Weekend Getaway", img: "/assets/collections/delhi.jpg" },
  { kicker: "Top 8", title: "Stays in & Around Mumbai for a Weekend Getaway", img: "/assets/collections/mumbai.jpg" },
  { kicker: "Top 9", title: "Stays in & Around Bangalore for a Weekend Getaway", img: "/assets/collections/bangalore.jpg" },
  { kicker: "Top 11", title: "Beach Destinations", img: "/assets/collections/beach.jpg" },
  { kicker: "Top 11", title: "Hill Stations", img: "/assets/collections/hills.jpg" },
];

export const destinations = [
  { title: "Shimla's Best Kept Secret", img: "/assets/destinations/narkanda.jpg" },
  { title: "Tamil Nadu's Charming Hill Town", img: "/assets/destinations/yercaud.jpg" },
  { title: "Picturesque Gateway to Himalayas", img: "/assets/destinations/dooars.jpg" },
  { title: "Quaint Little Hill Station in Gujarat", img: "/assets/destinations/saputara.jpg" },
  { title: "Seaside Resort Village in West Bengal", img: "/assets/destinations/mandarmani.jpg" },
];

export const promos = [
  { img: "/assets/promo/homestays.png", text: "Explore Villas & Homestays Made for Your Kind of Getaways! Book Your FIRST Stay @ FLAT 20% OFF*. Use Code: FIRSTHOMESTAY" },
  { img: "/assets/promo/onecircle.png", text: "Introducing OneCircle. Reward Your Stays Across 11,000+ Properties in 1000+ Cities worldwide." },
  { img: "/assets/promo/tours.png", text: "Tours & Attractions. Discover 2 Lakh+ unmissable experiences across the world and add them to your trip." },
  { img: "/assets/promo/visa.png", text: "Visa on MakeMyTrip | Powered by Experts. High approval rate, expert assistance and lowest price." },
];
