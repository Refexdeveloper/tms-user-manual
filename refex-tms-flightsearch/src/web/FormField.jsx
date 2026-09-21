/* global globalThis */
import React, { useEffect, useMemo, useState } from 'react'

const CLOUD_RUN_API_BASE =
    'https://refex-tms-flightsearch-dhwffeu7pq-el.a.run.app'
const BOOKING_AMOUNT_FIELD_ID = 'Booking_Amount_1'

const POLICY_REQUIRED_ADVANCE_DAYS = 15
const POLICY_TIMEZONE = 'Asia/Kolkata'

const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'kn', label: 'Kannada' },
    { value: 'or', label: 'Odia/Oriya' },
    { value: 'bn', label: 'Bengali' },
    { value: 'mr', label: 'Marathi' },
    { value: 'gu', label: 'Gujarati' },
]

const TRANSLATIONS = {
    en: {
        searchFlights: 'Search Flights',
        selectLanguage: 'Select Language',
        oneWay: 'One Way',
        roundTrip: 'Round Trip',
        multiCity: 'Multi-city',
        from: 'FROM',
        to: 'TO',
        departure: 'DEPARTURE',
        return: 'RETURN',
        class: 'CLASS',
        search: 'SEARCH',
        searching: 'SEARCHING',
        filters: 'Filters',
        stops: 'Stops',
        airlines: 'Airlines',
        loadStopFilters: 'Search flights to load stop filters.',
        loadAirlineFilters: 'Search flights to load airline filters.',
        individualFlights: 'Individual Flights',
        lowestFareFirst: 'Lowest Fare First',
        searchingFlights: 'Searching flights...',
        noFlightsMatch: 'No flights match the selected filters.',
        noFlightSelected: 'No flight selected',
        selectFlightInstruction:
            'Select a flight option to write the flight JSON payload to this custom form field.',
        select: 'Select',
        selected: 'Selected',
        selectOnward: 'Select Onward',
        selectReturn: 'Select Return',
        onwardFlights: 'Onward flights',
        returnFlights: 'Return flights',
        viewFlightDetails: 'View Flight Details',
        hideDetails: 'Hide Details',
        baggage: 'Baggage',
        seats: 'Seats',
        nonStop: 'Non-stop',
        searchFailed: 'Search failed',
        providerFailed:
            'The flight provider returned Failed for this search. No fare options were returned.',
        policyHeader: 'Policy: book flights 15 days before departure',
        selectAirport: 'Select an airport',
        optionsShown: '{count} options shown',
        optionsShownFiltered: '{visible} of {total} options shown',
        individualFlightsLower: 'individual flights',
        lowestFareFirstLower: 'lowest fare first',
        shownRouteCounts:
            '{onward} onward · {returnCount} return · {visible} of {total} options shown',
        scrollHint:
            'Scroll to review all {count} flight options before selecting. Search history is preserved for Finance review.',
        allFlights: 'All flights',
        showingPage: 'Showing {start}-{end} of {total}',
        pageOf: 'Page {page} of {pages}',
        previous: 'Previous',
        next: 'Next',
        baggageFallback: 'Available during fare rules check',
        seatsUnavailableShort: 'NA',
        fare: 'Fare',
        policyUnavailable: 'Policy unavailable',
        airline: 'Airline',
        stopSingular: '{count} stop',
        stopPlural: '{count} stops',
        oneStop: '1 stop',
        twoPlusStops: '2+ Stops',
        searchFlightsInitial: 'Search flights to view available options.',
        onlyAirlineReturned:
            'Only {airline} returned for this route/date. Airline filtering is not applicable.',
        selectedFlightSaved: 'Selected flight saved.',
        selectedFlightUnavailable:
            'Selected flight captured, but component value update is unavailable.',
        onwardSelectedReady:
            'Onward flight selected. Save round trip when ready.',
        onwardSelectedNeedReturn:
            'Onward flight selected. Select a return flight to continue.',
        returnSelectedReady:
            'Return flight selected. Save round trip when ready.',
        returnSelectedNeedOnward:
            'Return flight selected. Select an onward flight to continue.',
        selectBothBeforeSave:
            'Select one onward flight and one return flight before saving round trip.',
        roundTripSaved: 'Round trip saved.',
        roundTripUnavailable:
            'Round trip captured, but component value update is unavailable.',
        roundTripSelection: 'Round Trip Selection',
        totalFare: 'Total fare',
        readyToSave: 'Ready to save',
        selectOnwardAndReturn: 'Select onward and return flights',
        saveRoundTrip: 'Save Round Trip',
        selectMultiCityFlight: 'Select Stop {count} flight',
        saveMultiCity: 'Save Multi-city',
        multiCitySaved: 'Multi-city saved.',
        multiCityUnavailable:
            'Multi-city captured, but component value update is unavailable.',
        selectAllMultiCity: 'Select one flight from each stop before saving.',
        onwardSelected: 'Onward selected',
        onwardNotSelected: 'Onward not selected',
        returnSelected: 'Return selected',
        returnNotSelected: 'Return not selected',
        notSelected: 'Not selected',
        fareTypeUnavailable: 'Fare type unavailable',
        seatsUnavailable: 'Seats unavailable',
        onlySeatsLeft: 'Only {count} seat{plural} left',
        limitedSeats: 'Limited seats: {count}',
        seatsAvailable: '{count} seats available',
        selectValidAirports:
            'Please select valid From and To airports from the suggestions.',
        returnDateInvalid:
            'For round trip bookings, the return date must be later than the departure date.',
        returnDateStatus: 'Return date must be after departure date.',
        searchingLiveFares: 'Searching live fares from provider...',
        searchFailedWithMessage: 'Search failed: {message}',
        noSectionFlights: 'No {section} match the selected filters.',
        layoverAfterLeg: 'Layover',
        policyUnknownMessage:
            'Policy insight could not be calculated because booking/departure date is unavailable.',
        policyPassMessage:
            'You are booking this flight within the allowed {requiredDays}-day advance booking window. Proceed?',
        policyBreachedMessage:
            'This booking breaches the {requiredDays}-day advance booking policy by {breachedDays} days. Fare impact tracking should be initiated for Finance/Admin review.',
    },
}

const TRANSLATION_OVERRIDES = {
    hi: {
        searchFlights: 'फ्लाइट खोजें',
        selectLanguage: 'भाषा चुनें',
        oneWay: 'एक तरफ',
        roundTrip: 'आना-जाना',
        from: 'से',
        to: 'तक',
        departure: 'प्रस्थान',
        return: 'वापसी',
        class: 'श्रेणी',
        search: 'खोजें',
        searching: 'खोज जारी',
        filters: 'फिल्टर',
        stops: 'स्टॉप',
        airlines: 'एयरलाइंस',
        loadStopFilters: 'स्टॉप फिल्टर लोड करने के लिए फ्लाइट खोजें।',
        loadAirlineFilters: 'एयरलाइन फिल्टर लोड करने के लिए फ्लाइट खोजें।',
        individualFlights: 'अलग-अलग फ्लाइट',
        lowestFareFirst: 'सबसे कम किराया पहले',
        searchingFlights: 'फ्लाइट खोजी जा रही हैं...',
        noFlightsMatch: 'चुने गए फिल्टर से कोई फ्लाइट मेल नहीं खाती।',
        noFlightSelected: 'कोई फ्लाइट चयनित नहीं',
        selectFlightInstruction:
            'इस कस्टम फॉर्म फील्ड में फ्लाइट JSON payload लिखने के लिए एक फ्लाइट विकल्प चुनें।',
        select: 'चुनें',
        selected: 'चयनित',
        selectOnward: 'आगे की फ्लाइट चुनें',
        selectReturn: 'वापसी फ्लाइट चुनें',
        onwardFlights: 'आगे की फ्लाइटें',
        returnFlights: 'वापसी फ्लाइटें',
        viewFlightDetails: 'फ्लाइट विवरण देखें',
        hideDetails: 'विवरण छिपाएं',
        baggage: 'सामान',
        seats: 'सीटें',
        nonStop: 'नॉन-स्टॉप',
        searchFailed: 'खोज विफल',
        providerFailed:
            'provider ने इस खोज के लिए Failed लौटाया। प्रदाता ने कोई किराया विकल्प नहीं लौटाया।',
        policyHeader: 'नीति: प्रस्थान से 15 दिन पहले फ्लाइट बुक करें',
        policyUnknownMessage:
            'नीति जानकारी की गणना नहीं हो सकी क्योंकि बुकिंग/प्रस्थान तारीख उपलब्ध नहीं है।',
        policyPassMessage:
            'आप इस फ्लाइट को अनुमत {requiredDays}-दिन की अग्रिम बुकिंग अवधि में बुक कर रहे हैं। आगे बढ़ें?',
        policyBreachedMessage:
            'यह बुकिंग {requiredDays}-दिन की अग्रिम बुकिंग नीति का {breachedDays} दिन उल्लंघन करती है। Finance/Admin समीक्षा के लिए किराया प्रभाव ट्रैकिंग शुरू की जानी चाहिए।',
    },
    ta: {
        searchFlights: 'விமானங்களை தேடவும்',
        selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
        oneWay: 'ஒரு வழி',
        roundTrip: 'சென்று வருதல்',
        from: 'இருந்து',
        to: 'வரை',
        departure: 'புறப்படும் தேதி',
        return: 'திரும்பும் தேதி',
        class: 'வகுப்பு',
        search: 'தேடு',
        searching: 'தேடுகிறது',
        filters: 'வடிப்பான்கள்',
        stops: 'நிறுத்தங்கள்',
        airlines: 'விமான நிறுவனங்கள்',
        loadStopFilters: 'நிறுத்த வடிப்பான்களை ஏற்ற விமானங்களை தேடவும்.',
        loadAirlineFilters:
            'விமான நிறுவனம் வடிப்பான்களை ஏற்ற விமானங்களை தேடவும்.',
        individualFlights: 'தனிப்பட்ட விமானங்கள்',
        lowestFareFirst: 'குறைந்த கட்டணம் முதலில்',
        searchingFlights: 'விமானங்கள் தேடப்படுகின்றன...',
        noFlightsMatch:
            'தேர்ந்தெடுத்த வடிப்பான்களுக்கு பொருந்தும் விமானங்கள் இல்லை.',
        noFlightSelected: 'விமானம் தேர்ந்தெடுக்கப்படவில்லை',
        selectFlightInstruction:
            'இந்த custom form field-ல் flight JSON payload எழுத ஒரு விமானத்தைத் தேர்ந்தெடுக்கவும்.',
        select: 'தேர்ந்தெடு',
        selected: 'தேர்ந்தெடுக்கப்பட்டது',
        selectOnward: 'செல்லும் விமானம் தேர்வு',
        selectReturn: 'திரும்பும் விமானம் தேர்வு',
        onwardFlights: 'செல்லும் விமானங்கள்',
        returnFlights: 'திரும்பும் விமானங்கள்',
        viewFlightDetails: 'விமான விவரங்கள் காண்க',
        hideDetails: 'விவரங்களை மறை',
        baggage: 'பேக்கேஜ்',
        seats: 'இருக்கைகள்',
        nonStop: 'நிறுத்தமின்றி',
        searchFailed: 'தேடல் தோல்வியடைந்தது',
        providerFailed:
            'இந்த தேடலுக்கு provider Failed என திருப்பியது. கட்டண விருப்பங்கள் எதுவும் வழங்கப்படவில்லை.',
        policyHeader:
            'கொள்கை: புறப்படும் தேதிக்கு 15 நாட்களுக்கு முன் விமானம் முன்பதிவு செய்யவும்',
        policyUnknownMessage:
            'புக்கிங்/புறப்படும் தேதி இல்லாததால் கொள்கை தகவலை கணக்கிட முடியவில்லை.',
        policyPassMessage:
            'இந்த விமானத்தை அனுமதிக்கப்பட்ட {requiredDays}-நாள் முன்பதிவு காலத்திற்குள் பதிவு செய்கிறீர்கள். தொடரவா?',
        policyBreachedMessage:
            'இந்த புக்கிங் {requiredDays}-நாள் முன்பதிவு கொள்கையை {breachedDays} நாட்கள் மீறுகிறது. Finance/Admin மதிப்பாய்வுக்காக கட்டண தாக்கம் கண்காணிப்பு தொடங்கப்பட வேண்டும்.',
    },
    te: {
        searchFlights: 'విమానాలను వెతకండి',
        selectLanguage: 'భాషను ఎంచుకోండి',
        oneWay: 'ఒక దారి',
        roundTrip: 'రౌండ్ ట్రిప్',
        from: 'నుంచి',
        to: 'వరకు',
        departure: 'బయలుదేరు',
        return: 'తిరుగు',
        class: 'తరగతి',
        search: 'వెతకండి',
        searching: 'వెతుకుతోంది',
        filters: 'ఫిల్టర్లు',
        stops: 'స్టాప్‌లు',
        airlines: 'ఎయిర్‌లైన్స్',
        loadStopFilters: 'స్టాప్ ఫిల్టర్లు లోడ్ చేయడానికి విమానాలను వెతకండి.',
        loadAirlineFilters:
            'ఎయిర్‌లైన్ ఫిల్టర్లు లోడ్ చేయడానికి విమానాలను వెతకండి.',
        individualFlights: 'ప్రత్యేక విమానాలు',
        lowestFareFirst: 'తక్కువ ధర ముందుగా',
        searchingFlights: 'విమానాలు వెతుకుతోంది...',
        noFlightsMatch: 'ఎంచుకున్న ఫిల్టర్లకు సరిపోయే విమానాలు లేవు.',
        noFlightSelected: 'విమానం ఎంచుకోలేదు',
        selectFlightInstruction:
            'ఈ custom form field లో flight JSON payload రాయడానికి ఒక విమానాన్ని ఎంచుకోండి.',
        select: 'ఎంచుకోండి',
        selected: 'ఎంచుకున్నారు',
        selectOnward: 'వెళ్లే విమానం ఎంచుకోండి',
        selectReturn: 'తిరుగు విమానం ఎంచుకోండి',
        onwardFlights: 'వెళ్లే విమానాలు',
        returnFlights: 'తిరుగు విమానాలు',
        viewFlightDetails: 'విమాన వివరాలు చూడండి',
        hideDetails: 'వివరాలు దాచండి',
        baggage: 'బ్యాగేజ్',
        seats: 'సీట్లు',
        nonStop: 'నాన్-స్టాప్',
        searchFailed: 'శోధన విఫలమైంది',
        providerFailed:
            'ఈ శోధనకు provider Failed అని ఇచ్చింది. ప్రొవైడర్ ఎటువంటి ధర ఎంపికలు ఇవ్వలేదు.',
        policyHeader:
            'పాలసీ: బయలుదేరే తేదీకి 15 రోజుల ముందు విమానాలు బుక్ చేయండి',
        policyUnknownMessage:
            'బుకింగ్/బయలుదేరే తేదీ అందుబాటులో లేకపోవడంతో పాలసీ వివరాలను లెక్కించలేకపోయాం.',
        policyPassMessage:
            'మీరు ఈ విమానాన్ని అనుమతించిన {requiredDays}-రోజుల ముందస్తు బుకింగ్ వ్యవధిలో బుక్ చేస్తున్నారు. కొనసాగాలా?',
        policyBreachedMessage:
            'ఈ బుకింగ్ {requiredDays}-రోజుల ముందస్తు బుకింగ్ పాలసీని {breachedDays} రోజులు ఉల్లంఘిస్తోంది. Finance/Admin సమీక్ష కోసం ఛార్జీ ప్రభావం ట్రాకింగ్ ప్రారంభించాలి.',
    },
    kn: {
        searchFlights: 'ವಿಮಾನಗಳನ್ನು ಹುಡುಕಿ',
        selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
        oneWay: 'ಒಂದು ದಾರಿ',
        roundTrip: 'ಹೋಗಿ ಬರುವುದು',
        from: 'ಇಂದ',
        to: 'ಗೆ',
        departure: 'ಪ್ರಯಾಣ ಆರಂಭ',
        return: 'ಮರಳಿ',
        class: 'ವರ್ಗ',
        search: 'ಹುಡುಕಿ',
        searching: 'ಹುಡುಕುತ್ತಿದೆ',
        filters: 'ಫಿಲ್ಟರ್‌ಗಳು',
        stops: 'ನಿಲುಗಡೆಗಳು',
        airlines: 'ಏರ್‌ಲೈನ್ಸ್',
        loadStopFilters:
            'ನಿಲುಗಡೆ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಮಾನಗಳನ್ನು ಹುಡುಕಿ.',
        loadAirlineFilters:
            'ಏರ್‌ಲೈನ್ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಮಾನಗಳನ್ನು ಹುಡುಕಿ.',
        individualFlights: 'ಪ್ರತ್ಯೇಕ ವಿಮಾನಗಳು',
        lowestFareFirst: 'ಕಡಿಮೆ ದರ ಮೊದಲು',
        searchingFlights: 'ವಿಮಾನಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
        noFlightsMatch: 'ಆಯ್ಕೆ ಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಹೊಂದುವ ವಿಮಾನಗಳಿಲ್ಲ.',
        noFlightSelected: 'ವಿಮಾನ ಆಯ್ಕೆ ಮಾಡಿಲ್ಲ',
        selectFlightInstruction:
            'ಈ custom form field ಗೆ flight JSON payload ಬರೆಯಲು ಒಂದು ವಿಮಾನ ಆಯ್ಕೆಮಾಡಿ.',
        select: 'ಆಯ್ಕೆಮಾಡಿ',
        selected: 'ಆಯ್ಕೆಯಾಗಿದೆ',
        selectOnward: 'ಹೋಗುವ ವಿಮಾನ ಆಯ್ಕೆ',
        selectReturn: 'ಮರಳಿ ವಿಮಾನ ಆಯ್ಕೆ',
        onwardFlights: 'ಹೋಗುವ ವಿಮಾನಗಳು',
        returnFlights: 'ಮರಳಿ ವಿಮಾನಗಳು',
        viewFlightDetails: 'ವಿಮಾನ ವಿವರ ನೋಡಿ',
        hideDetails: 'ವಿವರ ಮರೆಮಾಡಿ',
        baggage: 'ಬ್ಯಾಗೇಜ್',
        seats: 'ಸೀಟುಗಳು',
        nonStop: 'ನಾನ್-ಸ್ಟಾಪ್',
        searchFailed: 'ಹುಡುಕಾಟ ವಿಫಲವಾಯಿತು',
        providerFailed:
            'ಈ ಹುಡುಕಾಟಕ್ಕೆ provider Failed ಎಂದು ಮರಳಿಸಿದೆ. ಪೂರೈಕೆದಾರರು ದರ ಆಯ್ಕೆಗಳನ್ನು ಮರಳಿಸಲಿಲ್ಲ.',
        policyHeader: 'ನೀತಿ: ಪ್ರಯಾಣಕ್ಕೆ 15 ದಿನಗಳ ಮೊದಲು ವಿಮಾನಗಳನ್ನು ಬುಕ್ ಮಾಡಿ',
        policyUnknownMessage:
            'ಬುಕಿಂಗ್/ಪ್ರಯಾಣ ದಿನಾಂಕ ಲಭ್ಯವಿಲ್ಲದ ಕಾರಣ ನೀತಿ ಮಾಹಿತಿಯನ್ನು ಲೆಕ್ಕ ಹಾಕಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
        policyPassMessage:
            'ನೀವು ಈ ವಿಮಾನವನ್ನು ಅನುಮತಿಸಿದ {requiredDays}-ದಿನಗಳ ಮುಂಗಡ ಬುಕಿಂಗ್ ಅವಧಿಯೊಳಗೆ ಬುಕ್ ಮಾಡುತ್ತಿದ್ದೀರಿ. ಮುಂದುವರೆಯಲೇ?',
        policyBreachedMessage:
            'ಈ ಬುಕಿಂಗ್ {requiredDays}-ದಿನಗಳ ಮುಂಗಡ ಬುಕಿಂಗ್ ನೀತಿಯನ್ನು {breachedDays} ದಿನಗಳು ಉಲ್ಲಂಘಿಸುತ್ತದೆ. Finance/Admin ಪರಿಶೀಲನೆಗಾಗಿ ದರ ಪರಿಣಾಮ ಟ್ರ್ಯಾಕಿಂಗ್ ಪ್ರಾರಂಭಿಸಬೇಕು.',
    },
    or: {
        searchFlights: 'ଫ୍ଲାଇଟ୍ ଖୋଜନ୍ତୁ',
        selectLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
        oneWay: 'ଏକ ମାର୍ଗ',
        roundTrip: 'ରାଉଣ୍ଡ ଟ୍ରିପ୍',
        from: 'ଠାରୁ',
        to: 'ପର୍ଯ୍ୟନ୍ତ',
        departure: 'ପ୍ରସ୍ଥାନ',
        return: 'ଫେରା',
        class: 'ଶ୍ରେଣୀ',
        search: 'ଖୋଜନ୍ତୁ',
        searching: 'ଖୋଜୁଛି',
        filters: 'ଫିଲ୍ଟର',
        stops: 'ଷ୍ଟପ୍',
        airlines: 'ଏୟାରଲାଇନ୍ସ',
        loadStopFilters: 'ଷ୍ଟପ୍ ଫିଲ୍ଟର ଲୋଡ୍ କରିବାକୁ ଫ୍ଲାଇଟ୍ ଖୋଜନ୍ତୁ।',
        loadAirlineFilters: 'ଏୟାରଲାଇନ୍ ଫିଲ୍ଟର ଲୋଡ୍ କରିବାକୁ ଫ୍ଲାଇଟ୍ ଖୋଜନ୍ତୁ।',
        individualFlights: 'ବ୍ୟକ୍ତିଗତ ଫ୍ଲାଇଟ୍',
        lowestFareFirst: 'ସବୁଠାରୁ କମ୍ ଭାଡା ପ୍ରଥମେ',
        searchingFlights: 'ଫ୍ଲାଇଟ୍ ଖୋଜାଯାଉଛି...',
        noFlightsMatch: 'ଚୟନିତ ଫିଲ୍ଟର ସହିତ କୌଣସି ଫ୍ଲାଇଟ୍ ମେଳ ଖାଉନାହିଁ।',
        noFlightSelected: 'କୌଣସି ଫ୍ଲାଇଟ୍ ଚୟନ ହୋଇନାହିଁ',
        selectFlightInstruction:
            'ଏହି custom form field ରେ flight JSON payload ଲେଖିବା ପାଇଁ ଏକ ଫ୍ଲାଇଟ୍ ବାଛନ୍ତୁ।',
        select: 'ବାଛନ୍ତୁ',
        selected: 'ଚୟନିତ',
        selectOnward: 'ଯିବା ଫ୍ଲାଇଟ୍ ବାଛନ୍ତୁ',
        selectReturn: 'ଫେରା ଫ୍ଲାଇଟ୍ ବାଛନ୍ତୁ',
        onwardFlights: 'ଯିବା ଫ୍ଲାଇଟ୍',
        returnFlights: 'ଫେରା ଫ୍ଲାଇଟ୍',
        viewFlightDetails: 'ଫ୍ଲାଇଟ୍ ବିବରଣୀ ଦେଖନ୍ତୁ',
        hideDetails: 'ବିବରଣୀ ଲୁଚାନ୍ତୁ',
        baggage: 'ବ୍ୟାଗେଜ୍',
        seats: 'ସିଟ୍',
        nonStop: 'ନନ୍-ଷ୍ଟପ୍',
        searchFailed: 'ଖୋଜା ବିଫଳ',
        providerFailed:
            'ଏହି ଖୋଜା ପାଇଁ provider Failed ଫେରାଇଲା। ପ୍ରଦାତା କୌଣସି ଭାଡା ବିକଳ୍ପ ଫେରାଇଲେ ନାହିଁ।',
        policyHeader: 'ନୀତି: ପ୍ରସ୍ଥାନର 15 ଦିନ ପୂର୍ବରୁ ଫ୍ଲାଇଟ୍ ବୁକ୍ କରନ୍ତୁ',
        policyUnknownMessage:
            'ବୁକିଂ/ପ୍ରସ୍ଥାନ ତାରିଖ ନଥିବାରୁ ନୀତି ସୂଚନା ଗଣନା କରିହେଲା ନାହିଁ।',
        policyPassMessage:
            'ଆପଣ ଏହି ଫ୍ଲାଇଟ୍‌କୁ ଅନୁମୋଦିତ {requiredDays}-ଦିନର ଆଗୁଆ ବୁକିଂ ସମୟସୀମା ଭିତରେ ବୁକ୍ କରୁଛନ୍ତି। ଆଗକୁ ବଢିବେ?',
        policyBreachedMessage:
            'ଏହି ବୁକିଂ {requiredDays}-ଦିନର ଆଗୁଆ ବୁକିଂ ନୀତିକୁ {breachedDays} ଦିନ ଉଲ୍ଲଂଘନ କରୁଛି। Finance/Admin ସମୀକ୍ଷା ପାଇଁ ଭାଡା ପ୍ରଭାବ ଟ୍ରାକିଂ ଆରମ୍ଭ କରିବା ଉଚିତ।',
    },
    bn: {
        searchFlights: 'ফ্লাইট খুঁজুন',
        selectLanguage: 'ভাষা নির্বাচন করুন',
        oneWay: 'এক পথ',
        roundTrip: 'রাউন্ড ট্রিপ',
        from: 'থেকে',
        to: 'পর্যন্ত',
        departure: 'রওনা',
        return: 'ফেরা',
        class: 'ক্লাস',
        search: 'খুঁজুন',
        searching: 'খোঁজা হচ্ছে',
        filters: 'ফিল্টার',
        stops: 'স্টপ',
        airlines: 'এয়ারলাইনস',
        loadStopFilters: 'স্টপ ফিল্টার লোড করতে ফ্লাইট খুঁজুন।',
        loadAirlineFilters: 'এয়ারলাইন ফিল্টার লোড করতে ফ্লাইট খুঁজুন।',
        individualFlights: 'আলাদা ফ্লাইট',
        lowestFareFirst: 'সর্বনিম্ন ভাড়া আগে',
        searchingFlights: 'ফ্লাইট খোঁজা হচ্ছে...',
        noFlightsMatch: 'নির্বাচিত ফিল্টারের সঙ্গে কোনো ফ্লাইট মেলেনি।',
        noFlightSelected: 'কোনো ফ্লাইট নির্বাচিত নয়',
        selectFlightInstruction:
            'এই custom form field-এ flight JSON payload লিখতে একটি ফ্লাইট নির্বাচন করুন।',
        select: 'নির্বাচন করুন',
        selected: 'নির্বাচিত',
        selectOnward: 'যাওয়ার ফ্লাইট নির্বাচন',
        selectReturn: 'ফেরার ফ্লাইট নির্বাচন',
        onwardFlights: 'যাওয়ার ফ্লাইট',
        returnFlights: 'ফেরার ফ্লাইট',
        viewFlightDetails: 'ফ্লাইটের বিবরণ দেখুন',
        hideDetails: 'বিবরণ লুকান',
        baggage: 'ব্যাগেজ',
        seats: 'সিট',
        nonStop: 'নন-স্টপ',
        searchFailed: 'অনুসন্ধান ব্যর্থ',
        providerFailed:
            'এই অনুসন্ধানের জন্য provider Failed ফিরিয়েছে। প্রদানকারী কোনো ভাড়া বিকল্প ফেরায়নি।',
        policyHeader: 'নীতি: রওনার 15 দিন আগে ফ্লাইট বুক করুন',
        policyUnknownMessage:
            'বুকিং/রওনার তারিখ না থাকায় নীতির তথ্য গণনা করা যায়নি।',
        policyPassMessage:
            'আপনি অনুমোদিত {requiredDays}-দিনের অগ্রিম বুকিং সময়সীমার মধ্যে এই ফ্লাইট বুক করছেন। এগোবেন?',
        policyBreachedMessage:
            'এই বুকিং {requiredDays}-দিনের অগ্রিম বুকিং নীতি {breachedDays} দিন লঙ্ঘন করছে। Finance/Admin পর্যালোচনার জন্য ভাড়ার প্রভাব ট্র্যাকিং শুরু করা উচিত।',
    },
    mr: {
        searchFlights: 'फ्लाइट शोधा',
        selectLanguage: 'भाषा निवडा',
        oneWay: 'एक मार्ग',
        roundTrip: 'ये-जा',
        from: 'पासून',
        to: 'पर्यंत',
        departure: 'प्रस्थान',
        return: 'परत',
        class: 'वर्ग',
        search: 'शोधा',
        searching: 'शोधत आहे',
        filters: 'फिल्टर्स',
        stops: 'थांबे',
        airlines: 'एअरलाईन्स',
        loadStopFilters: 'थांबा फिल्टर्स लोड करण्यासाठी फ्लाइट शोधा.',
        loadAirlineFilters: 'एअरलाईन फिल्टर्स लोड करण्यासाठी फ्लाइट शोधा.',
        individualFlights: 'स्वतंत्र फ्लाइट्स',
        lowestFareFirst: 'सर्वात कमी भाडे आधी',
        searchingFlights: 'फ्लाइट्स शोधत आहे...',
        noFlightsMatch: 'निवडलेल्या फिल्टर्सशी कोणतीही फ्लाइट जुळत नाही.',
        noFlightSelected: 'कोणतीही फ्लाइट निवडलेली नाही',
        selectFlightInstruction:
            'या custom form field मध्ये flight JSON payload लिहिण्यासाठी एक फ्लाइट पर्याय निवडा.',
        select: 'निवडा',
        selected: 'निवडले',
        selectOnward: 'जाणारी फ्लाइट निवडा',
        selectReturn: 'परतीची फ्लाइट निवडा',
        onwardFlights: 'जाणाऱ्या फ्लाइट्स',
        returnFlights: 'परतीच्या फ्लाइट्स',
        viewFlightDetails: 'फ्लाइट तपशील पहा',
        hideDetails: 'तपशील लपवा',
        baggage: 'बॅगेज',
        seats: 'सीट्स',
        nonStop: 'नॉन-स्टॉप',
        searchFailed: 'शोध अयशस्वी',
        providerFailed:
            'या शोधासाठी provider ने Failed परत केले. प्रदात्याने कोणतेही भाडे पर्याय परत केले नाहीत.',
        policyHeader: 'धोरण: प्रस्थानाच्या 15 दिवस आधी फ्लाइट बुक करा',
        policyUnknownMessage:
            'बुकिंग/प्रस्थान तारीख उपलब्ध नसल्याने धोरण माहिती मोजता आली नाही.',
        policyPassMessage:
            'तुम्ही ही फ्लाइट अनुमत {requiredDays}-दिवसांच्या आगाऊ बुकिंग कालावधीत बुक करत आहात. पुढे जायचे?',
        policyBreachedMessage:
            'ही बुकिंग {requiredDays}-दिवसांच्या आगाऊ बुकिंग धोरणाचे {breachedDays} दिवस उल्लंघन करते. Finance/Admin पुनरावलोकनासाठी भाडे परिणाम ट्रॅकिंग सुरू केले पाहिजे.',
    },
    gu: {
        searchFlights: 'ફ્લાઇટ શોધો',
        selectLanguage: 'ભાષા પસંદ કરો',
        oneWay: 'એક માર્ગ',
        roundTrip: 'રાઉન્ડ ટ્રિપ',
        from: 'થી',
        to: 'સુધી',
        departure: 'પ્રસ્થાન',
        return: 'પરત',
        class: 'વર્ગ',
        search: 'શોધો',
        searching: 'શોધી રહ્યું છે',
        filters: 'ફિલ્ટર્સ',
        stops: 'સ્ટોપ્સ',
        airlines: 'એરલાઇન્સ',
        loadStopFilters: 'સ્ટોપ ફિલ્ટર્સ લોડ કરવા ફ્લાઇટ શોધો.',
        loadAirlineFilters: 'એરલાઇન ફિલ્ટર્સ લોડ કરવા ફ્લાઇટ શોધો.',
        individualFlights: 'અલગ ફ્લાઇટ્સ',
        lowestFareFirst: 'સૌથી ઓછું ભાડું પહેલાં',
        searchingFlights: 'ફ્લાઇટ્સ શોધાઈ રહી છે...',
        noFlightsMatch: 'પસંદ કરેલા ફિલ્ટર્સ સાથે કોઈ ફ્લાઇટ મળતી નથી.',
        noFlightSelected: 'કોઈ ફ્લાઇટ પસંદ નથી',
        selectFlightInstruction:
            'આ custom form field માં flight JSON payload લખવા માટે એક ફ્લાઇટ વિકલ્પ પસંદ કરો.',
        select: 'પસંદ કરો',
        selected: 'પસંદ કરેલ',
        selectOnward: 'જતી ફ્લાઇટ પસંદ કરો',
        selectReturn: 'પરત ફ્લાઇટ પસંદ કરો',
        onwardFlights: 'જતી ફ્લાઇટ્સ',
        returnFlights: 'પરત ફ્લાઇટ્સ',
        viewFlightDetails: 'ફ્લાઇટ વિગતો જુઓ',
        hideDetails: 'વિગતો છુપાવો',
        baggage: 'બેગેજ',
        seats: 'સીટ્સ',
        nonStop: 'નોન-સ્ટોપ',
        searchFailed: 'શોધ નિષ્ફળ',
        providerFailed:
            'આ શોધ માટે provider એ Failed પરત કર્યું. પ્રદાતાએ કોઈ ભાડા વિકલ્પો પરત કર્યા નથી.',
        policyHeader: 'નીતિ: પ્રસ્થાનના 15 દિવસ પહેલાં ફ્લાઇટ બુક કરો',
        policyUnknownMessage:
            'બુકિંગ/પ્રસ્થાન તારીખ ઉપલબ્ધ ન હોવાથી નીતિ માહિતી ગણતરી કરી શકાઈ નથી.',
        policyPassMessage:
            'તમે આ ફ્લાઇટ અનુમતિ આપેલા {requiredDays}-દિવસના આગોતરા બુકિંગ સમયગાળામાં બુક કરી રહ્યા છો. આગળ વધશો?',
        policyBreachedMessage:
            'આ બુકિંગ {requiredDays}-દિવસની આગોતરા બુકિંગ નીતિનો {breachedDays} દિવસ ભંગ કરે છે. Finance/Admin સમીક્ષા માટે ભાડા અસર ટ્રેકિંગ શરૂ કરવું જોઈએ.',
    },
}

Object.entries(TRANSLATION_OVERRIDES).forEach(([language, messages]) => {
    TRANSLATIONS[language] = { ...TRANSLATIONS.en, ...messages }
})

function translate(language, key, values = {}) {
    const messages = TRANSLATIONS[language] || TRANSLATIONS.en
    const template = messages[key] || TRANSLATIONS.en[key] || key

    return Object.entries(values).reduce(
        (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
        template
    )
}

function parseIsoDateOnly(value) {
    if (!value) return null
    const parts = String(value).split('-').map(Number)
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]))
}

function formatIsoDateOnly(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 10)
}

function addDays(date, days) {
    const next = new Date(date.getTime())
    next.setUTCDate(next.getUTCDate() + days)
    return next
}

function addMinutesToIsoDateTime(dateIso, timeValue, minutes) {
    const baseMinutes = parseIsoDateTimeToMinutes(dateIso, timeValue)
    if (baseMinutes === null) return null
    return minutesToIsoDateTime(baseMinutes + minutes)
}

function parseIsoDateTimeToMinutes(dateIso, timeValue) {
    const date = parseIsoDateOnly(dateIso)
    const timeMatch = String(timeValue || '').match(/^(\d{2}):(\d{2})/)
    if (!date || !timeMatch) return null
    const hours = Number(timeMatch[1])
    const minutes = Number(timeMatch[2])
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
    return Math.floor(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            hours,
            minutes
        ) / 60000
    )
}

function minutesToIsoDateTime(totalMinutes) {
    const date = new Date(totalMinutes * 60000)
    return {
        date: date.toISOString().slice(0, 10),
        time: date.toISOString().slice(11, 16),
    }
}

function compareIsoDateTime(
    dateIso,
    timeValue,
    referenceDateIso,
    referenceTimeValue
) {
    const candidate = parseIsoDateTimeToMinutes(dateIso, timeValue)
    const reference = parseIsoDateTimeToMinutes(
        referenceDateIso,
        referenceTimeValue
    )
    if (candidate === null || reference === null) return null
    return candidate - reference
}

function diffDays(fromDate, toDate) {
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.floor((toDate.getTime() - fromDate.getTime()) / msPerDay)
}

function isAfterIsoDateOnly(candidateIso, referenceIso) {
    const candidate = parseIsoDateOnly(candidateIso)
    const reference = parseIsoDateOnly(referenceIso)

    if (!candidate || !reference) return false
    return candidate.getTime() > reference.getTime()
}

function getTodayInIndiaIsoDate() {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: POLICY_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })

    return formatter.format(new Date())
}

function calculatePolicyInsight({ bookingDateIso, departureDateIso }) {
    const bookingDate = parseIsoDateOnly(bookingDateIso)
    const departureDate = parseIsoDateOnly(departureDateIso)

    if (!bookingDate || !departureDate) {
        return {
            policyStatus: 'UNKNOWN',
            policyRequiredAdvanceDays: POLICY_REQUIRED_ADVANCE_DAYS,
            actualAdvanceDays: null,
            policyBreachedDayCount: null,
            idealPolicyBookingDate: '',
            insightMessage:
                'Policy insight could not be calculated because booking/departure date is unavailable.',
        }
    }

    const actualAdvanceDays = diffDays(bookingDate, departureDate)
    const policyBreachedDayCount = Math.max(
        POLICY_REQUIRED_ADVANCE_DAYS - actualAdvanceDays,
        0
    )
    const policyStatus =
        actualAdvanceDays >= POLICY_REQUIRED_ADVANCE_DAYS ? 'PASS' : 'BREACHED'
    const idealPolicyBookingDate = formatIsoDateOnly(
        addDays(departureDate, -POLICY_REQUIRED_ADVANCE_DAYS)
    )

    const insightMessage =
        policyStatus === 'PASS'
            ? `You are booking this flight within the allowed ${POLICY_REQUIRED_ADVANCE_DAYS}-day advance booking window. Proceed?`
            : `This booking breaches the ${POLICY_REQUIRED_ADVANCE_DAYS}-day advance booking policy by ${policyBreachedDayCount} day${policyBreachedDayCount === 1 ? '' : 's'}. Fare impact tracking should be initiated for Finance/Admin review.`

    return {
        policyStatus,
        policyRequiredAdvanceDays: POLICY_REQUIRED_ADVANCE_DAYS,
        actualAdvanceDays,
        policyBreachedDayCount,
        idealPolicyBookingDate,
        insightMessage,
    }
}

const DEFAULT_FROM = {
    code: 'MAA',
    city: 'Chennai',
    name: 'Chennai International Airport',
    country: 'IN',
    display: 'Chennai, IN - MAA',
}

const DEFAULT_TO = {
    code: 'DEL',
    city: 'New Delhi',
    name: 'Indira Gandhi International Airport',
    country: 'IN',
    display: 'New Delhi, IN - DEL',
}

const DEFAULT_MULTI_CITY_SEGMENT_COUNT = 2
const MAX_MULTI_CITY_SEGMENTS = 12
const SEARCH_OPTIONS_LIMIT = 500
const FLIGHTS_PAGE_SIZE = 10
const DOMESTIC_CONNECTION_MINUTES = 180
const INTERNATIONAL_CONNECTION_MINUTES = 240

function getAirportLabel(airport) {
    return airport?.city || airport?.code || ''
}

function getDefaultDepartureDate() {
    return formatIsoDateOnly(new Date())
}

function getDefaultReturnDate() {
    return formatIsoDateOnly(addDays(new Date(), 4))
}

function createMultiCitySegment({
    fromAirport = null,
    toAirport = null,
    depDateValue = getDefaultDepartureDate(),
} = {}) {
    return {
        fromAirport,
        toAirport,
        fromText: getAirportLabel(fromAirport),
        toText: getAirportLabel(toAirport),
        depDate: depDateValue,
        fromSuggestions: [],
        toSuggestions: [],
        showFromSuggestions: false,
        showToSuggestions: false,
        hint: '',
    }
}

function buildInitialMultiCitySegments(
    fromAirport = DEFAULT_FROM,
    toAirport = DEFAULT_TO,
    depDateValue = getDefaultDepartureDate()
) {
    return [
        createMultiCitySegment({ fromAirport, toAirport, depDateValue }),
        createMultiCitySegment({
            fromAirport: toAirport,
            toAirport: null,
            depDateValue,
        }),
    ]
}

function formatMoney(value) {
    const amount = Number(value || 0)
    return `₹${amount.toLocaleString('en-IN')}`
}

function normalizeText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
}

function parseStoredPayload(value) {
    if (!value) return null

    try {
        return typeof value === 'string' ? JSON.parse(value) : value
    } catch (error) {
        return null
    }
}

function cleanAirport(airport) {
    if (!airport) return null
    return {
        code: airport.code || '',
        city: airport.city || '',
        name: airport.name || '',
        country: airport.country || '',
        display: airport.display || '',
    }
}

function getLegSummaryFingerprint(option) {
    if (!Array.isArray(option?.legSummary) || !option.legSummary.length) return ''
    return option.legSummary
        .map((leg) =>
            [
                String(leg?.flightCode || '').trim(),
                String(leg?.flightNumber || '').trim(),
                String(leg?.from || '').trim(),
                String(leg?.to || '').trim(),
                String(leg?.departureTime || '').trim(),
                String(leg?.arrivalTime || '').trim(),
                String(leg?.duration || '').trim(),
                String(leg?.layoverTime || '').trim(),
            ].join('~')
        )
        .join('>')
}

function getFlightFingerprint(option) {
    if (!option) return ''
    return [
        String(option.airlineCode || '').trim().toUpperCase(),
        String(option.flightNumber || '').trim(),
        String(option.sourceCityCode || '').trim().toUpperCase(),
        String(option.destinationCityCode || '').trim().toUpperCase(),
        String(option.departureDate || '').trim(),
        String(option.arrivalDate || '').trim(),
        String(option.departureTime || '').trim(),
        String(option.arrivalTime || '').trim(),
        String(option.duration || '').trim(),
        Number(option.stops || 0),
        Number(option.totalFare || 0),
        String(option.fareKey || '').trim(),
        String(option.fareType || '').trim(),
        option.sectorIndex ?? '',
        getLegSummaryFingerprint(option),
    ].join('|')
}

function getOptionIdentity(option) {
    if (!option) return ''
    if (option.__optionKey) return String(option.__optionKey)
    if (option.uuid) return `uuid:${option.uuid}`
    if (option.fareKey) return `fare:${option.fareKey}`
    const fingerprint = getFlightFingerprint(option)
    if (fingerprint) return `fp:${fingerprint}`
    if (option.id != null && option.id !== '') return `id:${option.id}`
    return `ord:${option.__providerOrder ?? ''}`
}

function isSameFlight(a, b) {
    if (!a || !b) return false
    // Client-assigned keys are unique per list row (API often reuses the same id).
    if (a.__optionKey && b.__optionKey) {
        return String(a.__optionKey) === String(b.__optionKey)
    }
    const fingerprintA = getFlightFingerprint(a)
    const fingerprintB = getFlightFingerprint(b)
    if (a.id != null && b.id != null && String(a.id) === String(b.id)) {
        // Same provider id can be reused across distinct packages — require fingerprint match.
        if (fingerprintA && fingerprintB) return fingerprintA === fingerprintB
        return true
    }
    return Boolean(fingerprintA) && fingerprintA === fingerprintB
}

function parseSectorIndex(option) {
    if (!option) return null
    const raw =
        option.sectorIndex ??
        option.sector ??
        option.boundIndex ??
        option.journeyIndex ??
        option.legIndex
    if (raw === undefined || raw === null || raw === '') return null
    const sectorIndex = Number(raw)
    return Number.isFinite(sectorIndex) ? sectorIndex : null
}

function getSectorIndexBase(options = []) {
    const values = (Array.isArray(options) ? options : [])
        .map(parseSectorIndex)
        .filter((value) => value != null)
    if (!values.length) return 0
    const min = Math.min(...values)
    const max = Math.max(...values)
    // Treat 1,2,... as 1-based only when a 2+ sector is also present.
    return min >= 1 && max >= 2 ? 1 : 0
}

function asOptionArray(value) {
    if (Array.isArray(value)) return value
    if (value && Array.isArray(value.options)) return value.options
    if (value && Array.isArray(value.flights)) return value.flights
    return []
}

function collectSearchOptions(result) {
    if (!result || typeof result !== 'object') return []

    const primary = asOptionArray(result.options)
    if (primary.length) return primary

    const collected = []
    const append = (list, forcedSectorIndex) => {
        asOptionArray(list).forEach((option) => {
            if (!option || typeof option !== 'object') return
            const hasSectorIndex =
                option.sectorIndex !== undefined &&
                option.sectorIndex !== null &&
                option.sectorIndex !== ''
            collected.push(
                !hasSectorIndex && forcedSectorIndex != null
                    ? { ...option, sectorIndex: forcedSectorIndex }
                    : option
            )
        })
    }

    append(result.flights)
    append(
        result.onwardOptions ||
            result.onwardFlights ||
            result.outboundOptions,
        0
    )
    append(
        result.returnOptions ||
            result.returnFlights ||
            result.inboundOptions,
        1
    )
    asOptionArray(result.sectors).forEach((sector, index) =>
        append(sector, index)
    )
    asOptionArray(result.segments).forEach((segment, index) =>
        append(segment, index)
    )

    return collected
}

function normalizeSearchOptions(options = []) {
    return (Array.isArray(options) ? options : []).map((option, index) => {
        const parsedSectorIndex = parseSectorIndex(option)
        const withOrder = {
            ...option,
            sectorIndex:
                parsedSectorIndex == null
                    ? option?.sectorIndex
                    : parsedSectorIndex,
            __providerOrder: Number.isFinite(Number(option?.__providerOrder))
                ? Number(option.__providerOrder)
                : index,
        }
        const fingerprint = getFlightFingerprint(withOrder)
        return {
            ...withOrder,
            __optionKey:
                withOrder.__optionKey ||
                `opt-${index}-${fingerprint || withOrder.id || withOrder.uuid || 'x'}`,
        }
    })
}

function paginateOptions(list, page, pageSize = FLIGHTS_PAGE_SIZE) {
    const items = Array.isArray(list) ? list : []
    const total = items.length
    const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1)
    const safePage = Math.min(Math.max(Number(page) || 1, 1), pageCount)
    const startIndex = (safePage - 1) * pageSize
    return {
        total,
        pageCount,
        page: safePage,
        start: total ? startIndex + 1 : 0,
        end: Math.min(startIndex + pageSize, total),
        items: items.slice(startIndex, startIndex + pageSize),
    }
}

function isFlightSelected(option, selectedFlights = []) {
    const list = Array.isArray(selectedFlights)
        ? selectedFlights
        : [selectedFlights]
    return list.filter(Boolean).some((flight) => isSameFlight(option, flight))
}

function prioritizeSelectedFlights(options, selectedFlights = []) {
    const selectedList = (
        Array.isArray(selectedFlights) ? selectedFlights : [selectedFlights]
    ).filter(Boolean)

    if (!selectedList.length || !Array.isArray(options) || !options.length) {
        return options
    }

    const selected = []
    const rest = []

    options.forEach((option) => {
        if (isFlightSelected(option, selectedList)) {
            selected.push(option)
        } else {
            rest.push(option)
        }
    })

    return [...selected, ...rest]
}

function ensureFlightsInOptions(options, flights = []) {
    const next = Array.isArray(options) ? [...options] : []

    ;(Array.isArray(flights) ? flights : [flights])
        .filter(Boolean)
        .forEach((flight, index) => {
            if (next.some((option) => isSameFlight(option, flight))) return
            next.unshift({
                ...flight,
                __providerOrder: -1000 - index,
            })
        })

    return prioritizeSelectedFlights(next, flights)
}

function cleanFlight(option) {
    if (!option) return null

    return {
        id: option.id,
        __optionKey: option.__optionKey || getOptionIdentity(option),
        uuid: option.uuid,
        tripType: option.tripType,
        currencyCode: option.currencyCode || 'INR',
        sectorIndex: option.sectorIndex,
        fareType: option.fareType,
        fareKey: option.fareKey,
        provider: option.provider,
        airlineName: option.airlineName,
        airlineCode: option.airlineCode,
        flightNumber: String(option.flightNumber || '').trim(),
        flightImage: option.flightImage,
        sourceCityCode: option.sourceCityCode,
        sourceCityName: option.sourceCityName,
        destinationCityCode: option.destinationCityCode,
        destinationCityName: option.destinationCityName,
        departureAirport: option.departureAirport,
        arrivalAirport: option.arrivalAirport,
        departureDate: option.departureDate,
        arrivalDate: option.arrivalDate,
        departureTime: option.departureTime,
        arrivalTime: option.arrivalTime,
        duration: option.duration,
        stops: Number(option.stops || 0),
        seatsAvailable: option.seatsAvailable,
        refundable: option.refundable,
        baseRate: option.baseRate,
        tax: option.tax,
        totalFare: Number(option.totalFare || 0),
        baggage: option.baggage,
        legSummary: Array.isArray(option.legSummary) ? option.legSummary : [],
    }
}

function normalizeAirportCode(value) {
    return String(value || '')
        .trim()
        .toUpperCase()
}

function uniqueAirportCodes(...values) {
    return [
        ...new Set(values.map(normalizeAirportCode).filter(Boolean)),
    ]
}

function getAirportCodeSet(airport) {
    return new Set(
        uniqueAirportCodes(
            airport?.code,
            airport?.city,
            airport?.iata,
            airport?.cityCode
        )
    )
}

function getOptionRouteCodes(option) {
    const legs = Array.isArray(option?.legSummary) ? option.legSummary : []
    const firstLeg = legs[0] || {}
    const lastLeg = legs[legs.length - 1] || {}

    return {
        sourceCodes: uniqueAirportCodes(
            option?.sourceCityCode,
            option?.sourceCityCode,
            option?.originAirportCode,
            option?.fromAirportCode,
            option?.fromCity,
            option?.fromCityCode,
            option?.origin,
            option?.from,
            firstLeg.from,
            firstLeg.fromCity,
            firstLeg.sourceCityCode,
            firstLeg.sourceCityCode
        ),
        destinationCodes: uniqueAirportCodes(
            option?.destinationCityCode,
            option?.destinationCityCode,
            option?.destinationAirportCode,
            option?.toAirportCode,
            option?.toCity,
            option?.toCityCode,
            option?.destination,
            option?.to,
            lastLeg.to,
            lastLeg.toCity,
            lastLeg.destinationCityCode,
            lastLeg.destinationCityCode
        ),
    }
}

function optionMatchesRoute(option, fromAirport, toAirport) {
    const { sourceCodes, destinationCodes } = getOptionRouteCodes(option)
    const fromCodes = getAirportCodeSet(fromAirport)
    const toCodes = getAirportCodeSet(toAirport)
    const sourceIsFrom = sourceCodes.some((code) => fromCodes.has(code))
    const destinationIsTo = destinationCodes.some((code) => toCodes.has(code))
    const sourceIsTo = sourceCodes.some((code) => toCodes.has(code))
    const destinationIsFrom = destinationCodes.some((code) => fromCodes.has(code))

    return {
        onward: sourceIsFrom && destinationIsTo,
        return: sourceIsTo && destinationIsFrom,
        onwardPartial: sourceIsFrom || destinationIsTo,
        returnPartial: sourceIsTo || destinationIsFrom,
    }
}

function getFlightSector(option, fromAirport, toAirport, sectorBase = 0) {
    if (!option) return 'unknown'

    const match = optionMatchesRoute(option, fromAirport, toAirport)
    if (match.onward && !match.return) return 'onward'
    if (match.return && !match.onward) return 'return'

    const sectorIndex = parseSectorIndex(option)
    if (sectorIndex != null) {
        const normalizedIndex = sectorIndex - Number(sectorBase || 0)
        if (normalizedIndex === 0) return 'onward'
        if (normalizedIndex === 1) return 'return'
    }

    if (match.onward) return 'onward'
    if (match.return) return 'return'
    if (match.onwardPartial && !match.returnPartial) return 'onward'
    if (match.returnPartial && !match.onwardPartial) return 'return'

    return 'unknown'
}

function optionMatchesMultiCityStop(
    option,
    segment,
    stopIndex,
    sectorBase = 0,
    allSegments = []
) {
    if (
        optionMatchesRoute(option, segment?.fromAirport, segment?.toAirport)
            .onward
    ) {
        return true
    }

    const matchesAnotherStop = (allSegments || []).some(
        (other, otherIndex) =>
            otherIndex !== stopIndex &&
            optionMatchesRoute(
                option,
                other?.fromAirport,
                other?.toAirport
            ).onward
    )
    if (matchesAnotherStop) return false

    const sectorIndex = parseSectorIndex(option)
    return (
        sectorIndex != null &&
        sectorIndex - Number(sectorBase || 0) === stopIndex
    )
}

function buildComponentValue({
    option,
    fromAirport,
    toAirport,
    departureDateIso,
    tripType,
    fareClass,
    searchOptions = [],
    searchMeta = {},
}) {
    const from = cleanAirport(fromAirport)
    const to = cleanAirport(toAirport)
    const flight = cleanFlight(option)
    const bookingDateIso = getTodayInIndiaIsoDate()
    const policyInsight = calculatePolicyInsight({
        bookingDateIso,
        departureDateIso,
    })

    return {
        component: 'refex-tms-flight-search',
        version: '0.3.0',
        selectedAt: new Date().toISOString(),
        // Common process field for all trip types (oneWay / roundTrip)
        Departure_Date: departureDateIso || '',
        bookingAmount: flight?.totalFare || 0,
        bookingAmountFieldId: BOOKING_AMOUNT_FIELD_ID,
        currencyCode: flight?.currencyCode || 'INR',
        route: {
            from,
            to,
            isInternational: from?.country !== to?.country,
        },
        flight,
        policy: {
            timezone: POLICY_TIMEZONE,
            bookingDate: bookingDateIso,
            departureDate: departureDateIso,
            requiredAdvanceDays: policyInsight.policyRequiredAdvanceDays,
            actualAdvanceDays: policyInsight.actualAdvanceDays,
            status: policyInsight.policyStatus,
            breachedDayCount: policyInsight.policyBreachedDayCount,
            idealPolicyBookingDate: policyInsight.idealPolicyBookingDate,
            insightMessage: policyInsight.insightMessage,
        },
        searchSnapshot: {
            capturedAt: new Date().toISOString(),
            tripType,
            fareClass,
            fromAirportCode: from?.code || '',
            toAirportCode: to?.code || '',
            departureDate: departureDateIso,
            currencyCode:
                flight?.currencyCode || searchMeta.currencyCode || 'INR',
            totalOptionCount: Number(
                searchMeta.totalOptionCount || searchOptions.length || 0
            ),
            returnedOptionCount: Number(
                searchMeta.returnedOptionCount || searchOptions.length || 0
            ),
            providerStatus: searchMeta.providerStatus || '',
            source: searchMeta.source || '',
            uuid: searchMeta.uuid || flight?.uuid || '',
            options: Array.isArray(searchOptions) ? searchOptions : [],
        },
    }
}

function buildRoundTripComponentValue({
    onwardOption,
    returnOption,
    fromAirport,
    toAirport,
    departureDateIso,
    returnDateIso,
    fareClass,
    searchOptions = [],
    searchMeta = {},
    isInternationalPackage = false,
}) {
    const payload = buildComponentValue({
        option: onwardOption,
        fromAirport,
        toAirport,
        departureDateIso,
        tripType: 'roundTrip',
        fareClass,
        searchOptions,
        searchMeta,
    })

    // International RT: one full-trip package option (onward+return already inside).
    if (isInternationalPackage || (onwardOption && !returnOption)) {
        const packageFlight = cleanFlight(onwardOption)
        const totalAmount = Number(packageFlight?.totalFare || 0)
        return {
            ...payload,
            version: '0.4.0',
            bookingAmount: totalAmount,
            currencyCode:
                packageFlight?.currencyCode || payload.currencyCode || 'INR',
            flight: packageFlight,
            roundTrip: {
                onwardFlight: packageFlight,
                returnFlight: null,
                onwardAmount: totalAmount,
                returnAmount: 0,
                totalAmount,
                departureDate: departureDateIso,
                returnDate: returnDateIso,
                isPackage: true,
            },
            searchSnapshot: {
                ...payload.searchSnapshot,
                tripType: 'roundTrip',
                departureDate: departureDateIso,
                returnDate: returnDateIso,
                options: Array.isArray(searchOptions) ? searchOptions : [],
            },
        }
    }

    const onwardFlight = cleanFlight(onwardOption)
    const returnFlight = cleanFlight(returnOption)
    const onwardAmount = Number(onwardFlight?.totalFare || 0)
    const returnAmount = Number(returnFlight?.totalFare || 0)
    const totalAmount = onwardAmount + returnAmount

    return {
        ...payload,
        version: '0.4.0',
        bookingAmount: totalAmount,
        currencyCode:
            onwardFlight?.currencyCode ||
            returnFlight?.currencyCode ||
            payload.currencyCode ||
            'INR',
        flight: onwardFlight,
        roundTrip: {
            onwardFlight,
            returnFlight,
            onwardAmount,
            returnAmount,
            totalAmount,
            departureDate: departureDateIso,
            returnDate: returnDateIso,
        },
        searchSnapshot: {
            ...payload.searchSnapshot,
            tripType: 'roundTrip',
            departureDate: departureDateIso,
            returnDate: returnDateIso,
            options: Array.isArray(searchOptions) ? searchOptions : [],
        },
    }
}

function buildConnectionMetadata({ previousFlight, isInternational }) {
    if (!previousFlight) return null

    const minimumConnectionMinutes = isInternational
        ? INTERNATIONAL_CONNECTION_MINUTES
        : DOMESTIC_CONNECTION_MINUTES
    const previousArrivalDate = previousFlight.arrivalDate || ''
    const previousArrivalTime = previousFlight.arrivalTime || ''
    const earliestAllowed = addMinutesToIsoDateTime(
        previousArrivalDate,
        previousArrivalTime,
        minimumConnectionMinutes
    )

    if (!earliestAllowed) {
        return {
            previousArrivalDate,
            previousArrivalTime,
            minimumConnectionMinutes,
            earliestAllowedDepartureDate: '',
            earliestAllowedDepartureTime: '',
            status: 'UNKNOWN',
        }
    }

    return {
        previousArrivalDate,
        previousArrivalTime,
        minimumConnectionMinutes,
        earliestAllowedDepartureDate: earliestAllowed.date,
        earliestAllowedDepartureTime: earliestAllowed.time,
        status: 'VALID',
    }
}

function getConnectionStatusForFlight(option, connection) {
    if (!connection) return { status: 'VALID', reason: '' }
    if (connection.status !== 'VALID')
        return { status: 'INVALID', reason: 'Connection time unavailable' }

    const diff = compareIsoDateTime(
        option.departureDate,
        option.departureTime,
        connection.earliestAllowedDepartureDate,
        connection.earliestAllowedDepartureTime
    )

    if (diff === null) {
        return { status: 'VALID', reason: '' }
    }

    if (diff < 0) {
        return { status: 'INVALID', reason: 'Connection too tight' }
    }

    return { status: 'VALID', reason: '' }
}

function getSelectedFlightAt(selectedFlights, index) {
    if (!selectedFlights) return null
    if (Array.isArray(selectedFlights)) return selectedFlights[index] || null
    return (
        selectedFlights[index] ||
        selectedFlights[String(index)] ||
        null
    )
}

function buildMultiCityComponentValue({
    segments,
    selectedFlights,
    fareClass,
    searchOptions = [],
    searchMeta = {},
    isInternational,
}) {
    const selectedList = segments
        .map((segment, index) =>
            cleanFlight(getSelectedFlightAt(selectedFlights, index))
        )
        .filter(Boolean)
    const totalAmount = selectedList.reduce(
        (sum, flight) => sum + Number(flight?.totalFare || 0),
        0
    )
    const bookingDateIso = getTodayInIndiaIsoDate()
    const departureDates = segments
        .map((segment) => segment.depDate)
        .filter(Boolean)
        .sort()
    const earliestDepartureDate = departureDates[0] || ''
    const policyInsight = calculatePolicyInsight({
        bookingDateIso,
        departureDateIso: earliestDepartureDate,
    })
    const from = cleanAirport(segments[0]?.fromAirport)
    const to = cleanAirport(segments[segments.length - 1]?.toAirport)
    const firstRawFlight = getSelectedFlightAt(selectedFlights, 0)
    const lastRawFlight = getSelectedFlightAt(
        selectedFlights,
        segments.length - 1
    )
    const firstCleanFlight = cleanFlight(firstRawFlight)
    const lastCleanFlight = cleanFlight(lastRawFlight)
    // Kissflow summary fields: first origin + last destination only
    const firstDepartureDate =
        segments[0]?.depDate || firstCleanFlight?.departureDate || ''
    const firstDepartureCity =
        from?.city ||
        from?.name ||
        firstCleanFlight?.sourceCityName ||
        from?.code ||
        ''
    const lastArrivalCity =
        to?.city ||
        to?.name ||
        lastCleanFlight?.destinationCityName ||
        to?.code ||
        ''

    // International multi-city: one package option covers the full route (stops are inside the option).
    const isIntlPackage =
        Boolean(isInternational) &&
        Boolean(getSelectedFlightAt(selectedFlights, 0)) &&
        segments.every(
            (_, index) =>
                index === 0 || !getSelectedFlightAt(selectedFlights, index)
        )

    const payloadSegments = segments.map((segment, index) => {
        const rawFlight = isIntlPackage
            ? index === 0
                ? getSelectedFlightAt(selectedFlights, 0)
                : null
            : getSelectedFlightAt(selectedFlights, index)
        const selectedFlight = cleanFlight(rawFlight)
        const previousRawFlight = isIntlPackage
            ? null
            : getSelectedFlightAt(selectedFlights, index - 1)
        const connection =
            !isIntlPackage && index > 0
                ? buildConnectionMetadata({
                      previousFlight: previousRawFlight,
                      isInternational,
                  })
                : null
        const selectedStatus =
            selectedFlight && connection
                ? getConnectionStatusForFlight(selectedFlight, connection)
                : { status: 'VALID' }

        return {
            segmentIndex: index,
            from: cleanAirport(segment.fromAirport),
            to: cleanAirport(segment.toAirport),
            departureDate: segment.depDate,
            selectedFlight,
            ...(connection
                ? {
                      connection: {
                          ...connection,
                          status: selectedStatus.status,
                      },
                  }
                : {}),
        }
    })

    return {
        component: 'refex-tms-flight-search',
        version: '0.5.0',
        selectedAt: new Date().toISOString(),
        tripType: 'multiCity',
        // Common process field — first multi-city segment departure
        Departure_Date: firstDepartureDate || '',
        bookingAmount: totalAmount,
        bookingAmountFieldId: BOOKING_AMOUNT_FIELD_ID,
        currencyCode:
            selectedList[0]?.currencyCode || searchMeta.currencyCode || 'INR',
        route: {
            from,
            to,
            isInternational,
        },
        multiCity: {
            segmentCount: segments.length,
            segments: payloadSegments,
            totalAmount,
            firstDepartureDate,
            firstDepartureCity,
            lastArrivalCity,
        },
        searchSnapshot: {
            capturedAt: new Date().toISOString(),
            tripType: 'multiCity',
            fareClass,
            currencyCode:
                selectedList[0]?.currencyCode ||
                searchMeta.currencyCode ||
                'INR',
            totalOptionCount: Number(
                searchMeta.totalOptionCount || searchOptions.length || 0
            ),
            returnedOptionCount: Number(
                searchMeta.returnedOptionCount || searchOptions.length || 0
            ),
            providerStatus: searchMeta.providerStatus || '',
            source: searchMeta.source || '',
            uuid: searchMeta.uuid || selectedList[0]?.uuid || '',
            options: Array.isArray(searchOptions) ? searchOptions : [],
        },
        policy: {
            timezone: POLICY_TIMEZONE,
            bookingDate: bookingDateIso,
            departureDate: earliestDepartureDate,
            requiredAdvanceDays: policyInsight.policyRequiredAdvanceDays,
            actualAdvanceDays: policyInsight.actualAdvanceDays,
            status: policyInsight.policyStatus,
            breachedDayCount: policyInsight.policyBreachedDayCount,
            idealPolicyBookingDate: policyInsight.idealPolicyBookingDate,
            insightMessage: policyInsight.insightMessage,
        },
    }
}

function getViewportMode() {
    if (
        typeof globalThis === 'undefined' ||
        typeof globalThis.matchMedia !== 'function'
    ) {
        return 'desktop'
    }

    if (globalThis.matchMedia('(max-width: 640px)').matches) return 'mobile'
    if (globalThis.matchMedia('(max-width: 900px)').matches) return 'tablet'
    if (globalThis.matchMedia('(max-width: 1200px)').matches) return 'laptop'
    return 'desktop'
}

function getUiScale(mode) {
    const scales = {
        mobile: {
            shellPad: 6,
            shellGap: 8,
            shellRadius: 12,
            shellBorder: 1,
            cardRadius: 12,
            cardPad: 10,
            cardShadow: '0 4px 14px rgba(15,23,42,0.06)',
            titleSize: 14,
            iconSize: 26,
            iconRadius: 9,
            labelSize: 10,
            hintSize: 10,
            metaSize: 11,
            bodySize: 12,
            inputPad: '7px 9px',
            inputFont: 12,
            inputRadius: 9,
            inputWeight: 700,
            buttonPad: '8px 10px',
            buttonFont: 12,
            buttonRadius: 9,
            chipPad: '5px 8px',
            chipFont: 10,
            fareSize: 16,
            timeSize: 15,
            sectionTitleSize: 13,
            filterSidebar: '1fr',
            searchFieldGap: 8,
            stickyFont: 11,
        },
        tablet: {
            shellPad: 10,
            shellGap: 10,
            shellRadius: 14,
            shellBorder: 2,
            cardRadius: 14,
            cardPad: 12,
            cardShadow: '0 6px 18px rgba(15,23,42,0.07)',
            titleSize: 16,
            iconSize: 30,
            iconRadius: 10,
            labelSize: 10,
            hintSize: 11,
            metaSize: 12,
            bodySize: 13,
            inputPad: '8px 10px',
            inputFont: 13,
            inputRadius: 10,
            inputWeight: 700,
            buttonPad: '9px 12px',
            buttonFont: 13,
            buttonRadius: 10,
            chipPad: '6px 10px',
            chipFont: 11,
            fareSize: 18,
            timeSize: 17,
            sectionTitleSize: 14,
            filterSidebar: '1fr',
            searchFieldGap: 8,
            stickyFont: 11,
        },
        laptop: {
            shellPad: 12,
            shellGap: 12,
            shellRadius: 16,
            shellBorder: 2,
            cardRadius: 16,
            cardPad: 12,
            cardShadow: '0 8px 22px rgba(15,23,42,0.08)',
            titleSize: 17,
            iconSize: 32,
            iconRadius: 11,
            labelSize: 11,
            hintSize: 11,
            metaSize: 12,
            bodySize: 13,
            inputPad: '9px 11px',
            inputFont: 13,
            inputRadius: 11,
            inputWeight: 700,
            buttonPad: '9px 13px',
            buttonFont: 13,
            buttonRadius: 11,
            chipPad: '7px 11px',
            chipFont: 12,
            fareSize: 18,
            timeSize: 18,
            sectionTitleSize: 15,
            filterSidebar: '200px 1fr',
            searchFieldGap: 8,
            stickyFont: 12,
        },
        desktop: {
            shellPad: 12,
            shellGap: 12,
            shellRadius: 18,
            shellBorder: 2,
            cardRadius: 18,
            cardPad: 14,
            cardShadow: '0 8px 24px rgba(15,23,42,0.08)',
            titleSize: 18,
            iconSize: 34,
            iconRadius: 12,
            labelSize: 11,
            hintSize: 11,
            metaSize: 12,
            bodySize: 13,
            inputPad: '10px 12px',
            inputFont: 14,
            inputRadius: 12,
            inputWeight: 700,
            buttonPad: '10px 14px',
            buttonFont: 14,
            buttonRadius: 12,
            chipPad: '8px 12px',
            chipFont: 12,
            fareSize: 20,
            timeSize: 20,
            sectionTitleSize: 16,
            filterSidebar: '260px 1fr',
            searchFieldGap: 8,
            stickyFont: 12,
        },
    }

    return scales[mode] || scales.desktop
}

function FormField(props) {
    const {
        actions = {},
        readonly = false,
        disabled = false,
        value,
    } = props || {}

    const [tripType, setTripType] = useState('oneWay')
    const [fromAirport, setFromAirport] = useState(DEFAULT_FROM)
    const [toAirport, setToAirport] = useState(DEFAULT_TO)
    const [fromText, setFromText] = useState('Chennai')
    const [toText, setToText] = useState('New Delhi')
    const [fromSuggestions, setFromSuggestions] = useState([])
    const [toSuggestions, setToSuggestions] = useState([])
    const [showFromSuggestions, setShowFromSuggestions] = useState(false)
    const [showToSuggestions, setShowToSuggestions] = useState(false)
    const [depDate, setDepDate] = useState(getDefaultDepartureDate)
    const [arrDate, setArrDate] = useState(getDefaultReturnDate)
    const [fareClass, setFareClass] = useState('Economy')
    const [options, setOptions] = useState([])
    const [searchMeta, setSearchMeta] = useState({})
    const [selected, setSelected] = useState(null)
    const [selectedOutbound, setSelectedOutbound] = useState(null)
    const [selectedReturn, setSelectedReturn] = useState(null)
    const [multiCitySegments, setMultiCitySegments] = useState(() =>
        buildInitialMultiCitySegments(
            DEFAULT_FROM,
            DEFAULT_TO,
            getDefaultDepartureDate()
        )
    )
    const [selectedMultiCityFlights, setSelectedMultiCityFlights] = useState({})
    const [activeMultiCityTab, setActiveMultiCityTab] = useState(0)
    const [isMultiCityBuilderCollapsed, setIsMultiCityBuilderCollapsed] =
        useState(false)
    const [writebackStatus, setWritebackStatus] = useState('')
    const [expandedId, setExpandedId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')
    const [error, setError] = useState('')
    const [sortMode, setSortMode] = useState('individual')
    const [selectedLanguage, setSelectedLanguage] = useState('en')
    const [languageDropdownValue, setLanguageDropdownValue] = useState('')
    const [activeRoundTripTab, setActiveRoundTripTab] = useState('all')
    const [resultsPage, setResultsPage] = useState(1)
    const [viewportMode, setViewportMode] = useState(() =>
        getViewportMode()
    )
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [filters, setFilters] = useState({
        stops: new Set(),
        airlines: new Set(),
    })

    const t = useMemo(() => {
        return (key, values) => translate(selectedLanguage, key, values)
    }, [selectedLanguage])

    useEffect(() => {
        setResultsPage(1)
    }, [
        options,
        filters,
        sortMode,
        tripType,
        activeRoundTripTab,
        activeMultiCityTab,
    ])

    useEffect(() => {
        if (
            typeof globalThis === 'undefined' ||
            typeof globalThis.matchMedia !== 'function'
        ) {
            return undefined
        }

        const updateViewportMode = () => {
            setViewportMode(getViewportMode())
        }

        updateViewportMode()

        const queries = [
            globalThis.matchMedia('(max-width: 640px)'),
            globalThis.matchMedia('(max-width: 900px)'),
            globalThis.matchMedia('(max-width: 1200px)'),
        ]

        const handleChanges = () => updateViewportMode()

        if (typeof queries[0].addEventListener === 'function') {
            queries.forEach((query) =>
                query.addEventListener('change', handleChanges)
            )
            return () => {
                queries.forEach((query) =>
                    query.removeEventListener('change', handleChanges)
                )
            }
        }

        if (typeof queries[0].addListener === 'function') {
            queries.forEach((query) => query.addListener(handleChanges))
            return () => {
                queries.forEach((query) => query.removeListener(handleChanges))
            }
        }

        return undefined
    }, [])

    function handleLanguageChange(value) {
        setLanguageDropdownValue(value)
        setSelectedLanguage(TRANSLATIONS[value] ? value : 'en')
    }

    function getPolicyInsightText(policyInsight = {}) {
        const requiredDays = Number(
            policyInsight.requiredAdvanceDays ||
                policyInsight.policyRequiredAdvanceDays ||
                POLICY_REQUIRED_ADVANCE_DAYS
        )
        const breachedDays = Number(
            policyInsight.breachedDayCount ||
                policyInsight.policyBreachedDayCount ||
                0
        )
        const status =
            policyInsight.status || policyInsight.policyStatus || 'UNKNOWN'

        if (
            status === 'PASS' ||
            status === 'SATISFIED' ||
            status === 'COMPLIANT' ||
            status === 'OK'
        ) {
            return t('policyPassMessage', { requiredDays })
        }

        if (status === 'BREACHED') {
            return t('policyBreachedMessage', { requiredDays, breachedDays })
        }

        return t('policyUnknownMessage')
    }

    const isLocked = readonly || disabled
    const policyDepartureDate =
        tripType === 'multiCity'
            ? multiCitySegments
                  .map((segment) => segment.depDate)
                  .filter(Boolean)
                  .sort()[0] || depDate
            : depDate
    const currentPolicyInsight = calculatePolicyInsight({
        bookingDateIso: getTodayInIndiaIsoDate(),
        departureDateIso: policyDepartureDate,
    })

    useEffect(() => {
        const storedPayload = parseStoredPayload(value)

        if (
            !storedPayload ||
            storedPayload.component !== 'refex-tms-flight-search'
        ) {
            return
        }

        if (storedPayload.route?.from) {
            setFromAirport(storedPayload.route.from)
            setFromText(
                storedPayload.route.from.city ||
                    storedPayload.route.from.code ||
                    ''
            )
        }

        if (storedPayload.route?.to) {
            setToAirport(storedPayload.route.to)
            setToText(
                storedPayload.route.to.city || storedPayload.route.to.code || ''
            )
        }

        if (storedPayload.policy?.departureDate) {
            setDepDate(storedPayload.policy.departureDate)
        }

        if (
            storedPayload.roundTrip?.returnDate ||
            storedPayload.searchSnapshot?.returnDate
        ) {
            setArrDate(
                storedPayload.roundTrip?.returnDate ||
                    storedPayload.searchSnapshot.returnDate
            )
        }

        const restoredTripType =
            storedPayload.searchSnapshot?.tripType || storedPayload.tripType
        if (restoredTripType) {
            setTripType(restoredTripType)
        }

        if (storedPayload.multiCity?.segments?.length) {
            const restoredSegments = storedPayload.multiCity.segments.map(
                (segment) =>
                    createMultiCitySegment({
                        fromAirport: segment.from,
                        toAirport: segment.to,
                        depDateValue:
                            segment.departureDate ||
                            storedPayload.policy?.departureDate ||
                            getDefaultDepartureDate(),
                    })
            )
            setMultiCitySegments(restoredSegments)
            const restoredFlights = {}
            storedPayload.multiCity.segments.forEach((segment, index) => {
                if (segment.selectedFlight) {
                    const key =
                        segment.segmentIndex === 0 || segment.segmentIndex
                            ? segment.segmentIndex
                            : index
                    restoredFlights[key] = segment.selectedFlight
                }
            })
            setSelectedMultiCityFlights(restoredFlights)
            const firstSelectedStop = storedPayload.multiCity.segments.findIndex(
                (segment) => Boolean(segment.selectedFlight)
            )
            setActiveMultiCityTab(
                firstSelectedStop >= 0 ? firstSelectedStop : 0
            )
            // Keep itinerary inputs open on view/edit (do not require Edit click)
            setIsMultiCityBuilderCollapsed(false)
        }

        if (storedPayload.searchSnapshot?.fareClass) {
            setFareClass(storedPayload.searchSnapshot.fareClass)
        }

        const storedOptions = Array.isArray(
            storedPayload.searchSnapshot?.options
        )
            ? storedPayload.searchSnapshot.options
            : []

        const normalizedOptions = normalizeSearchOptions(storedOptions)

        const restoredSelectedFlights = [
            storedPayload.flight,
            storedPayload.roundTrip?.onwardFlight,
            storedPayload.roundTrip?.returnFlight,
            ...(storedPayload.multiCity?.segments || [])
                .map((segment) => segment.selectedFlight)
                .filter(Boolean),
        ].filter(Boolean)

        const optionsWithSelected = ensureFlightsInOptions(
            normalizedOptions,
            restoredSelectedFlights
        )

        setOptions(optionsWithSelected)
        if (!storedPayload.multiCity?.segments?.length) {
            setIsMultiCityBuilderCollapsed(false)
        }
        setSearchMeta({
            totalOptionCount:
                storedPayload.searchSnapshot?.totalOptionCount ||
                optionsWithSelected.length,
            returnedOptionCount:
                storedPayload.searchSnapshot?.returnedOptionCount ||
                optionsWithSelected.length,
            currencyCode:
                storedPayload.searchSnapshot?.currencyCode ||
                storedPayload.currencyCode ||
                'INR',
            providerStatus: storedPayload.searchSnapshot?.providerStatus || '',
            source: storedPayload.searchSnapshot?.source || '',
            uuid:
                storedPayload.searchSnapshot?.uuid ||
                storedPayload.flight?.uuid ||
                '',
        })
        setSelected(storedPayload)
        if (storedPayload.roundTrip?.onwardFlight) {
            setSelectedOutbound(storedPayload.roundTrip.onwardFlight)
            setActiveRoundTripTab('onward')
        }
        if (storedPayload.roundTrip?.returnFlight) {
            setSelectedReturn(storedPayload.roundTrip.returnFlight)
            if (!storedPayload.roundTrip?.onwardFlight) {
                setActiveRoundTripTab('return')
            }
        }
        setWritebackStatus(
            optionsWithSelected.length
                ? `${optionsWithSelected.length} stored search options restored for Finance review.`
                : 'Selected flight restored. Original search options were not available in this saved payload.'
        )
        setStatus(
            optionsWithSelected.length
                ? `${optionsWithSelected.length} stored options restored from selected flight data.`
                : 'Selected flight restored. Original search list was not available in this saved payload.'
        )
    }, [value])

    async function callCloudRun(url, options = {}) {
        if (
            typeof globalThis === 'undefined' ||
            typeof globalThis.fetch !== 'function'
        ) {
            throw new Error(
                'Browser network access is unavailable in this Kissflow component runtime.'
            )
        }

        return globalThis.fetch(url, options)
    }

    async function searchAirports(term, target) {
        if (!term || term.trim().length < 2) {
            target === 'from' ? setFromSuggestions([]) : setToSuggestions([])
            return
        }

        try {
            const response = await callCloudRun(
                `${CLOUD_RUN_API_BASE}/api/airports/search?term=${encodeURIComponent(term)}&limit=8`
            )
            const data = await response.json()
            const results = data.results || []

            if (target === 'from') {
                setFromSuggestions(results)
                setShowFromSuggestions(true)
            } else {
                setToSuggestions(results)
                setShowToSuggestions(true)
            }
        } catch (_error) {
            target === 'from' ? setFromSuggestions([]) : setToSuggestions([])
        }
    }

    function selectAirport(target, airport) {
        if (target === 'from') {
            setFromAirport(airport)
            setFromText(airport.city || airport.code)
            setShowFromSuggestions(false)
        } else {
            setToAirport(airport)
            setToText(airport.city || airport.code)
            setShowToSuggestions(false)
        }
    }

    function swapAirports() {
        if (!fromAirport || !toAirport) return
        const oldFrom = fromAirport
        const oldFromText = fromText
        setFromAirport(toAirport)
        setToAirport(oldFrom)
        setFromText(toText)
        setToText(oldFromText)
    }

    function handleTripTypeChange(value) {
        setTripType(value)
        setError('')
        setWritebackStatus('')
        if (value === 'multiCity') {
            setMultiCitySegments((current) => {
                if (current.length >= DEFAULT_MULTI_CITY_SEGMENT_COUNT)
                    return current
                return buildInitialMultiCitySegments(
                    fromAirport || DEFAULT_FROM,
                    toAirport || DEFAULT_TO,
                    depDate
                )
            })
            setActiveMultiCityTab(0)
            setIsMultiCityBuilderCollapsed(false)
        }
    }

    async function searchSegmentAirports(term, segmentIndex, field) {
        if (!term || term.trim().length < 2) {
            updateMultiCitySegment(
                segmentIndex,
                field === 'from'
                    ? { fromSuggestions: [] }
                    : { toSuggestions: [] },
                { normalizeChain: false }
            )
            return
        }

        try {
            const response = await callCloudRun(
                `${CLOUD_RUN_API_BASE}/api/airports/search?term=${encodeURIComponent(term)}&limit=8`
            )
            const data = await response.json()
            const results = data.results || []
            updateMultiCitySegment(
                segmentIndex,
                field === 'from'
                    ? { fromSuggestions: results, showFromSuggestions: true }
                    : { toSuggestions: results, showToSuggestions: true },
                { normalizeChain: false }
            )
        } catch (_error) {
            updateMultiCitySegment(
                segmentIndex,
                field === 'from'
                    ? { fromSuggestions: [] }
                    : { toSuggestions: [] },
                { normalizeChain: false }
            )
        }
    }

    function markMultiCityRouteChanged() {
        setOptions([])
        setSearchMeta({})
        setSelected(null)
        setSelectedMultiCityFlights({})
        setActiveMultiCityTab(0)
        setIsMultiCityBuilderCollapsed(false)
        setWritebackStatus('Route changed. Search again.')
        setStatus('Route changed. Search again.')
        setError('')
    }

    function normalizeMultiCityChain(segments) {
        return segments.map((segment, index, list) => {
            if (index === 0) return segment
            const previousTo = list[index - 1].toAirport
            const previousToText = getAirportLabel(previousTo)
            return {
                ...segment,
                fromAirport: previousTo || null,
                fromText: previousToText,
                hint: previousTo
                    ? 'Next flight starts from the previous destination'
                    : segment.hint,
            }
        })
    }

    function updateMultiCitySegment(segmentIndex, changes, options = {}) {
        setMultiCitySegments((current) => {
            const next = current.map((segment, index) =>
                index === segmentIndex ? { ...segment, ...changes } : segment
            )
            return options.normalizeChain === false
                ? next
                : normalizeMultiCityChain(next)
        })
    }

    function selectMultiCityAirport(segmentIndex, field, airport) {
        updateMultiCitySegment(
            segmentIndex,
            field === 'from'
                ? {
                      fromAirport: airport,
                      fromText: getAirportLabel(airport),
                      fromSuggestions: [],
                      showFromSuggestions: false,
                  }
                : {
                      toAirport: airport,
                      toText: getAirportLabel(airport),
                      toSuggestions: [],
                      showToSuggestions: false,
                  }
        )
        markMultiCityRouteChanged()
    }

    function addMultiCitySegment() {
        setMultiCitySegments((current) => {
            if (current.length >= MAX_MULTI_CITY_SEGMENTS) return current
            const previous = current[current.length - 1]
            const previousDate = parseIsoDateOnly(previous.depDate)
            const nextSegment = createMultiCitySegment({
                fromAirport: previous.toAirport,
                toAirport: null,
                depDateValue: previousDate
                    ? formatIsoDateOnly(addDays(previousDate, 1))
                    : previous.depDate || depDate,
            })
            return normalizeMultiCityChain([...current, nextSegment])
        })
        markMultiCityRouteChanged()
    }

    function removeMultiCitySegment(segmentIndex) {
        setMultiCitySegments((current) => {
            if (current.length <= DEFAULT_MULTI_CITY_SEGMENT_COUNT) {
                return current
            }

            return normalizeMultiCityChain(
                current.filter((_segment, index) => index !== segmentIndex)
            )
        })
        setActiveMultiCityTab((current) => {
            if (current > segmentIndex) return Math.max(current - 1, 0)
            if (current === segmentIndex) return Math.max(segmentIndex - 1, 0)
            return current
        })
        markMultiCityRouteChanged()
    }

    function getIsMultiCityInternational() {
        return multiCitySegments.some(
            (segment) =>
                segment.fromAirport?.country &&
                segment.toAirport?.country &&
                segment.fromAirport.country !== segment.toAirport.country
        )
    }

    function getIsRoundTripInternational() {
        return Boolean(
            fromAirport?.country &&
                toAirport?.country &&
                fromAirport.country !== toAirport.country
        )
    }

    function getMultiCityValidationError() {
        if (multiCitySegments.length < DEFAULT_MULTI_CITY_SEGMENT_COUNT)
            return 'Add at least 2 stops.'
        if (multiCitySegments.length > MAX_MULTI_CITY_SEGMENTS)
            return `Multi-city supports a maximum of ${MAX_MULTI_CITY_SEGMENTS} stops.`
        for (const [index, segment] of multiCitySegments.entries()) {
            if (!segment.fromAirport) return 'Select a Start city.'
            if (!segment.toAirport)
                return `Select a destination for Stop ${index + 1}.`
            if (!segment.depDate)
                return `Select a departure date for Stop ${index + 1}.`
            if (segment.fromAirport.code === segment.toAirport.code)
                return `Stop ${index + 1} cannot match its starting airport.`
            if (
                index > 0 &&
                segment.fromAirport.code !==
                    multiCitySegments[index - 1].toAirport?.code
            ) {
                return `Stop ${index + 1} must start from the previous stop.`
            }
        }
        return ''
    }

    async function searchFlights() {
        const validationError =
            tripType === 'multiCity' ? getMultiCityValidationError() : ''

        if (validationError) {
            setError(validationError)
            return
        }

        if (tripType !== 'multiCity' && (!fromAirport || !toAirport)) {
            setError(t('selectValidAirports'))
            return
        }

        if (tripType === 'roundTrip' && !isAfterIsoDateOnly(arrDate, depDate)) {
            setError(t('returnDateInvalid'))
            setStatus(t('returnDateStatus'))
            return
        }

        setLoading(true)
        setError('')
        setSelected(null)
        setSelectedOutbound(null)
        setSelectedReturn(null)
        setSelectedMultiCityFlights({})
        setWritebackStatus('')
        setStatus(t('searchingLiveFares'))
        setOptions([])
        setSearchMeta({})
        setActiveRoundTripTab('all')
        setResultsPage(1)
        setActiveMultiCityTab(0)
        setIsMultiCityBuilderCollapsed(false)
        setFilters({
            stops: new Set(),
            airlines: new Set(),
        })

        const isMultiCityInternational = getIsMultiCityInternational()
        const payload =
            tripType === 'multiCity'
                ? {
                      tripType: 'multiCity',
                      isInternational: isMultiCityInternational,
                      fareClass,
                      fromCity: multiCitySegments[0].fromAirport.code,
                      toCity: multiCitySegments[multiCitySegments.length - 1]
                          .toAirport.code,
                      depDate: multiCitySegments[0].depDate,
                      noOfAdults: 1,
                      noOfChildren: 0,
                      noOfInfant: 0,
                      limit: SEARCH_OPTIONS_LIMIT,
                      maxResults: SEARCH_OPTIONS_LIMIT,
                      segments: multiCitySegments.map((segment) => ({
                          fromCity: segment.fromAirport.code,
                          toCity: segment.toAirport.code,
                          depDate: segment.depDate,
                      })),
                  }
                : {
                      tripType,
                      isInternational:
                          fromAirport.country !== toAirport.country,
                      fareClass,
                      fromCity: fromAirport.code,
                      toCity: toAirport.code,
                      depDate,
                      noOfAdults: 1,
                      noOfChildren: 0,
                      noOfInfant: 0,
                      limit: SEARCH_OPTIONS_LIMIT,
                      maxResults: SEARCH_OPTIONS_LIMIT,
                  }

        if (tripType === 'roundTrip') {
            payload.arrDate = arrDate
        }

        try {
            const response = await callCloudRun(
                `${CLOUD_RUN_API_BASE}/api/flights/search`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            )

            const data = await response.json()

            if (!response.ok || !data.ok) {
                throw new Error(data.error || t('searchFailed'))
            }

            const result = data.result || {}

            if (String(result.status || '').toLowerCase() === 'failed') {
                throw new Error(t('providerFailed'))
            }

            const nextOptions = normalizeSearchOptions(
                collectSearchOptions(result)
            )

            const nextSearchMeta = {
                totalOptionCount: result.totalOptionCount || nextOptions.length,
                returnedOptionCount:
                    result.returnedOptionCount || nextOptions.length,
                currencyCode: result.currencyCode || 'INR',
                providerStatus: result.status || '',
                source: data.source || '',
                uuid: result.uuid || '',
            }

            setOptions(nextOptions)
            setSearchMeta(nextSearchMeta)
            setSortMode('individual')
            if (tripType === 'multiCity') {
                // Keep multi-city inputs expanded after search (no Edit click needed)
                setIsMultiCityBuilderCollapsed(false)
                setActiveMultiCityTab(0)
            }
            setStatus(
                `${t('optionsShown', { count: nextOptions.length })} · ${nextSearchMeta.currencyCode} · ${t('individualFlightsLower')}`
            )
        } catch (searchError) {
            setError(
                t('searchFailedWithMessage', { message: searchError.message })
            )
            setStatus(t('searchFailed'))
        } finally {
            setLoading(false)
        }
    }

    function updateSetFilter(type, value, checked) {
        setFilters((current) => {
            const next = {
                stops: new Set(current.stops),
                airlines: new Set(current.airlines),
            }

            if (checked) {
                next[type].add(value)
            } else {
                next[type].delete(value)
            }

            return next
        })
    }

    const visibleOptions = useMemo(() => {
        let filtered = [...options]

        if (filters.stops.size) {
            filtered = filtered.filter((option) => {
                const stops = Number(option.stops || 0)
                return (
                    (filters.stops.has('0') && stops === 0) ||
                    (filters.stops.has('1') && stops === 1) ||
                    (filters.stops.has('2plus') && stops >= 2)
                )
            })
        }

        if (filters.airlines.size) {
            filtered = filtered.filter((option) => {
                const airlineName = normalizeText(option.airlineName)
                const airlineCode = normalizeText(option.airlineCode)
                return Array.from(filters.airlines).some(
                    (airline) =>
                        airlineName === airline || airlineCode === airline
                )
            })
        }

        if (sortMode === 'lowestFare') {
            filtered.sort(
                (a, b) => Number(a.totalFare || 0) - Number(b.totalFare || 0)
            )
        } else {
            filtered.sort(
                (a, b) =>
                    Number(a.__providerOrder || 0) -
                    Number(b.__providerOrder || 0)
            )
        }

        const selectedFlightsForSort = [
            selected?.flight,
            selectedOutbound,
            selectedReturn,
            ...Object.values(selectedMultiCityFlights || {}),
        ]

        return prioritizeSelectedFlights(filtered, selectedFlightsForSort)
    }, [
        options,
        filters,
        sortMode,
        selected,
        selectedOutbound,
        selectedReturn,
        selectedMultiCityFlights,
    ])

    const sectorIndexBase = useMemo(
        () => getSectorIndexBase(options),
        [options]
    )

    const visibleOutboundOptions = useMemo(() => {
        return prioritizeSelectedFlights(
            visibleOptions.filter((option) => {
                const sector = getFlightSector(
                    option,
                    fromAirport,
                    toAirport,
                    sectorIndexBase
                )
                return sector === 'onward'
            }),
            [selectedOutbound, selected?.roundTrip?.onwardFlight]
        )
    }, [
        visibleOptions,
        fromAirport,
        toAirport,
        selectedOutbound,
        selected,
        sectorIndexBase,
    ])

    const visibleReturnOptions = useMemo(() => {
        return prioritizeSelectedFlights(
            visibleOptions.filter((option) => {
                const sector = getFlightSector(
                    option,
                    fromAirport,
                    toAirport,
                    sectorIndexBase
                )
                return sector === 'return'
            }),
            [selectedReturn, selected?.roundTrip?.returnFlight]
        )
    }, [
        visibleOptions,
        fromAirport,
        toAirport,
        selectedReturn,
        selected,
        sectorIndexBase,
    ])

    const visibleMultiCitySections = useMemo(() => {
        const isMultiCityInternationalForConnection = multiCitySegments.some(
            (segment) =>
                segment.fromAirport?.country &&
                segment.toAirport?.country &&
                segment.fromAirport.country !== segment.toAirport.country
        )

        return multiCitySegments.map((segment, index) => {
            const allSectorOptions = visibleOptions.filter((option) =>
                optionMatchesMultiCityStop(
                    option,
                    segment,
                    index,
                    sectorIndexBase,
                    multiCitySegments
                )
            )
            const connection =
                index > 0
                    ? buildConnectionMetadata({
                          previousFlight: selectedMultiCityFlights[index - 1],
                          isInternational:
                              isMultiCityInternationalForConnection,
                      })
                    : null
            const requiresPreviousSelection =
                index > 0 && !selectedMultiCityFlights[index - 1]
            const tightConnectionCount = requiresPreviousSelection
                ? 0
                : allSectorOptions.filter(
                      (option) =>
                          getConnectionStatusForFlight(option, connection)
                              .status !== 'VALID'
                  ).length

            return {
                segment,
                index,
                connection,
                requiresPreviousSelection,
                options: prioritizeSelectedFlights(allSectorOptions, [
                    selectedMultiCityFlights[index],
                ]),
                hiddenConnectionCount: tightConnectionCount,
            }
        })
    }, [
        visibleOptions,
        multiCitySegments,
        selectedMultiCityFlights,
        sectorIndexBase,
    ])

    const listedOptions = useMemo(() => {
        const isRoundTripSplit =
            tripType === 'roundTrip' &&
            !(
                fromAirport?.country &&
                toAirport?.country &&
                fromAirport.country !== toAirport.country
            )
        const isMultiCitySplit =
            tripType === 'multiCity' &&
            !multiCitySegments.some(
                (segment) =>
                    segment.fromAirport?.country &&
                    segment.toAirport?.country &&
                    segment.fromAirport.country !== segment.toAirport.country
            )
        if (isRoundTripSplit) {
            if (activeRoundTripTab === 'onward') return visibleOutboundOptions
            if (activeRoundTripTab === 'return') return visibleReturnOptions
            return visibleOptions
        }
        if (isMultiCitySplit) {
            const section =
                visibleMultiCitySections.find(
                    (item) => item.index === activeMultiCityTab
                ) || visibleMultiCitySections[0]
            return section?.options || visibleOptions
        }
        return visibleOptions
    }, [
        tripType,
        activeRoundTripTab,
        activeMultiCityTab,
        visibleOptions,
        visibleOutboundOptions,
        visibleReturnOptions,
        visibleMultiCitySections,
        fromAirport,
        toAirport,
        multiCitySegments,
    ])

    const filterSourceOptions = useMemo(() => {
        const isRoundTripSplit =
            tripType === 'roundTrip' &&
            !(
                fromAirport?.country &&
                toAirport?.country &&
                fromAirport.country !== toAirport.country
            )
        const isMultiCitySplit =
            tripType === 'multiCity' &&
            !multiCitySegments.some(
                (segment) =>
                    segment.fromAirport?.country &&
                    segment.toAirport?.country &&
                    segment.fromAirport.country !== segment.toAirport.country
            )
        if (isRoundTripSplit) {
            if (activeRoundTripTab === 'onward') {
                return options.filter(
                    (option) =>
                        getFlightSector(
                            option,
                            fromAirport,
                            toAirport,
                            sectorIndexBase
                        ) === 'onward'
                )
            }
            if (activeRoundTripTab === 'return') {
                return options.filter(
                    (option) =>
                        getFlightSector(
                            option,
                            fromAirport,
                            toAirport,
                            sectorIndexBase
                        ) === 'return'
                )
            }
            return options
        }
        if (isMultiCitySplit) {
            const segment = multiCitySegments[activeMultiCityTab]
            if (!segment) return options
            return options.filter((option) =>
                optionMatchesMultiCityStop(
                    option,
                    segment,
                    activeMultiCityTab,
                    sectorIndexBase,
                    multiCitySegments
                )
            )
        }
        return options
    }, [
        options,
        tripType,
        activeRoundTripTab,
        activeMultiCityTab,
        fromAirport,
        toAirport,
        sectorIndexBase,
        multiCitySegments,
    ])

    const stopRows = useMemo(() => {
        return [
            {
                value: '0',
                label: t('nonStop'),
                count: filterSourceOptions.filter(
                    (option) => Number(option.stops || 0) === 0
                ).length,
            },
            {
                value: '1',
                label: t('oneStop'),
                count: filterSourceOptions.filter(
                    (option) => Number(option.stops || 0) === 1
                ).length,
            },
            {
                value: '2plus',
                label: t('twoPlusStops'),
                count: filterSourceOptions.filter(
                    (option) => Number(option.stops || 0) >= 2
                ).length,
            },
        ].filter((row) => row.count > 0)
    }, [filterSourceOptions, t])

    const airlineRows = useMemo(() => {
        const map = new Map()
        filterSourceOptions.forEach((option) => {
            const name =
                option.airlineName ||
                option.provider ||
                option.airlineCode ||
                t('airline')
            const key = normalizeText(name)
            if (!map.has(key)) {
                map.set(key, { value: key, label: name, count: 0 })
            }
            map.get(key).count += 1
        })
        return Array.from(map.values()).sort((a, b) =>
            a.label.localeCompare(b.label)
        )
    }, [filterSourceOptions, t])

    async function selectFlight(option) {
        // Same field names / payload shape as the working old FormField (v0.3.0)
        const payload = buildComponentValue({
            option,
            fromAirport,
            toAirport,
            departureDateIso: depDate,
            tripType: 'oneWay',
            fareClass,
            searchOptions: options,
            searchMeta,
        })

        const payloadText = JSON.stringify(payload, null, 2)

        setSelected(payload)

        if (typeof actions.updateValue === 'function') {
            actions.updateValue(payloadText)
            setWritebackStatus(t('selectedFlightSaved'))
        } else {
            setWritebackStatus(t('selectedFlightUnavailable'))
        }
    }

    function persistRoundTrip(onwardOption, returnOption) {
        const isIntlPackage = getIsRoundTripInternational()

        if (isLocked) return

        if (isIntlPackage) {
            if (!onwardOption) {
                setWritebackStatus('Select a round trip flight option.')
                return
            }
        } else if (!onwardOption || !returnOption) {
            setWritebackStatus(t('selectBothBeforeSave'))
            return
        }

        // Same field names / payload shape as the working old FormField (v0.4.0)
        const payload = buildRoundTripComponentValue({
            onwardOption,
            returnOption: isIntlPackage ? null : returnOption,
            fromAirport,
            toAirport,
            departureDateIso: depDate,
            returnDateIso: arrDate,
            fareClass,
            searchOptions: options,
            searchMeta,
            isInternationalPackage: isIntlPackage,
        })
        const payloadText = JSON.stringify(payload, null, 2)

        setSelected(payload)

        if (typeof actions.updateValue === 'function') {
            actions.updateValue(payloadText)
            setWritebackStatus(t('roundTripSaved'))
        } else {
            setWritebackStatus(t('roundTripUnavailable'))
        }
    }

    /** International round trip returns full-trip package options — select one, no Onward/Return tabs. */
    function selectRoundTripInternationalFlight(option) {
        if (!option || isLocked) return
        setSelectedOutbound(option)
        setSelectedReturn(null)
        persistRoundTrip(option, null)
    }

    function selectRoundTripLeg(option, sector) {
        // International packages are selected as a single itinerary (not onward + return).
        if (getIsRoundTripInternational()) {
            selectRoundTripInternationalFlight(option)
            return
        }

        const nextOutbound = sector === 'onward' ? option : selectedOutbound
        const nextReturn = sector === 'return' ? option : selectedReturn

        if (sector === 'onward') {
            setSelectedOutbound(option)
            if (activeRoundTripTab !== 'all') {
                setActiveRoundTripTab('return')
            }
        } else {
            setSelectedReturn(option)
            if (activeRoundTripTab !== 'all') {
                setActiveRoundTripTab('return')
            }
        }

        // Auto-write Kissflow field when both legs are selected (old payload keys)
        if (nextOutbound && nextReturn) {
            persistRoundTrip(nextOutbound, nextReturn)
            return
        }

        setSelected(null)
        if (sector === 'onward') {
            setWritebackStatus(
                nextReturn
                    ? t('onwardSelectedReady')
                    : t('onwardSelectedNeedReturn')
            )
            return
        }

        setWritebackStatus(
            nextOutbound
                ? t('returnSelectedReady')
                : t('returnSelectedNeedOnward')
        )
    }

    async function saveRoundTrip() {
        if (getIsRoundTripInternational()) {
            persistRoundTrip(selectedOutbound, null)
            return
        }
        persistRoundTrip(selectedOutbound, selectedReturn)
    }

    /** International multi-city returns full-route package options — select one, no Stop tabs. */
    function selectMultiCityInternationalFlight(option) {
        if (!option || isLocked) return
        const nextFlights = { 0: option }
        setSelectedMultiCityFlights(nextFlights)
        persistMultiCity(nextFlights, multiCitySegments)
    }

    function selectMultiCityFlight(option, segmentIndex) {
        // International packages are selected as a single itinerary (not per-stop).
        if (getIsMultiCityInternational()) {
            selectMultiCityInternationalFlight(option)
            return
        }

        const connection =
            segmentIndex > 0
                ? buildConnectionMetadata({
                      previousFlight: getSelectedFlightAt(
                          selectedMultiCityFlights,
                          segmentIndex - 1
                      ),
                      isInternational: false,
                  })
                : null
        const connectionStatus = getConnectionStatusForFlight(
            option,
            connection
        )

        if (connectionStatus.status !== 'VALID') {
            setWritebackStatus(
                connectionStatus.reason || 'Connection too tight'
            )
            return
        }

        const nextFlights = {
            ...selectedMultiCityFlights,
            [segmentIndex]: option,
        }
        Object.keys(nextFlights).forEach((key) => {
            if (Number(key) > segmentIndex) delete nextFlights[key]
        })

        setSelectedMultiCityFlights(nextFlights)

        let nextSegments = multiCitySegments
        if (segmentIndex < multiCitySegments.length - 1) {
            nextSegments = multiCitySegments.map((segment) => ({ ...segment }))
            const following = nextSegments[segmentIndex + 1]
            const arrivalDate = option.arrivalDate || following.depDate
            following.fromAirport = {
                ...(following.fromAirport || {}),
                code:
                    option.destinationCityCode ||
                    following.fromAirport?.code ||
                    '',
                city:
                    option.destinationCityName ||
                    following.fromAirport?.city ||
                    option.destinationCityCode ||
                    '',
                name:
                    option.arrivalAirport || following.fromAirport?.name || '',
                country: following.fromAirport?.country || '',
                display:
                    option.destinationCityCode ||
                    following.fromAirport?.display ||
                    '',
            }
            following.fromText = getAirportLabel(following.fromAirport)
            if (
                arrivalDate &&
                following.depDate &&
                parseIsoDateOnly(following.depDate)?.getTime() <
                    parseIsoDateOnly(arrivalDate)?.getTime()
            ) {
                following.depDate = arrivalDate
                following.hint =
                    'Adjusted based on previous flight arrival time'
            } else {
                following.hint =
                    'Next flight starts from the previous destination'
            }
            nextSegments = nextSegments.map((segment, index, list) => {
                if (index <= segmentIndex + 1) return segment
                const previousTo = list[index - 1].toAirport
                return {
                    ...segment,
                    fromAirport: previousTo || null,
                    fromText: getAirportLabel(previousTo),
                    hint: previousTo
                        ? 'Next flight starts from the previous destination'
                        : segment.hint,
                }
            })
            setMultiCitySegments(nextSegments)
            setActiveMultiCityTab(segmentIndex + 1)
        }

        const allSelected = nextSegments.every((_, index) =>
            getSelectedFlightAt(nextFlights, index)
        )

        if (allSelected) {
            // Same as old Save Multi-city → actions.updateValue for form onChange
            persistMultiCity(nextFlights, nextSegments)
            return
        }

        setSelected(null)
        setWritebackStatus(`Stop ${segmentIndex + 1} flight selected.`)
    }

    function getMultiCitySaveIssue(
        flights = selectedMultiCityFlights,
        segments = multiCitySegments
    ) {
        if (segments.length < DEFAULT_MULTI_CITY_SEGMENT_COUNT) {
            return 'Add at least 2 stops.'
        }
        if (segments.length > MAX_MULTI_CITY_SEGMENTS) {
            return `Multi-city supports a maximum of ${MAX_MULTI_CITY_SEGMENTS} stops.`
        }
        for (const [index, segment] of segments.entries()) {
            if (!segment.fromAirport?.code || !segment.toAirport?.code) {
                return `Stop ${index + 1}: select From and To airports.`
            }
            if (segment.fromAirport.code === segment.toAirport.code) {
                return `Stop ${index + 1}: From and To cannot be the same.`
            }
            if (
                index > 0 &&
                segment.fromAirport.code !== segments[index - 1].toAirport?.code
            ) {
                return `Stop ${index + 1}: From must match previous To airport.`
            }
        }

        // International: one full-route package option is enough (no per-stop picks).
        if (getIsMultiCityInternational()) {
            if (!getSelectedFlightAt(flights, 0)) {
                return 'Select a multi-city flight option.'
            }
            return ''
        }

        for (const [index] of segments.entries()) {
            const flight = getSelectedFlightAt(flights, index)
            if (!flight) return t('selectAllMultiCity')
            if (index > 0) {
                const connection = buildConnectionMetadata({
                    previousFlight: getSelectedFlightAt(flights, index - 1),
                    isInternational: false,
                })
                const connectionStatus = getConnectionStatusForFlight(
                    flight,
                    connection
                )
                if (connectionStatus.status !== 'VALID') {
                    return `Stop ${index + 1}: ${connectionStatus.reason || 'Connection too tight'}`
                }
            }
        }
        return ''
    }

    function persistMultiCity(
        flights = selectedMultiCityFlights,
        segments = multiCitySegments
    ) {
        const issue = getMultiCitySaveIssue(flights, segments)
        if (issue) {
            setWritebackStatus(issue)
            return false
        }

        // Exact old multi-city payload shape for Kissflow form onChange / child table
        const payload = buildMultiCityComponentValue({
            segments,
            selectedFlights: flights,
            fareClass,
            searchOptions: options,
            searchMeta,
            isInternational: getIsMultiCityInternational(),
        })
        const payloadText = JSON.stringify(payload, null, 2)

        setSelected(payload)

        if (typeof actions.updateValue === 'function') {
            actions.updateValue(payloadText)
            setWritebackStatus(t('multiCitySaved'))
            return true
        }

        setWritebackStatus(t('multiCityUnavailable'))
        return false
    }

    async function saveMultiCity() {
        persistMultiCity(selectedMultiCityFlights, multiCitySegments)
    }

    const isMobile = viewportMode === 'mobile'
    const isTablet = viewportMode === 'tablet'
    const isLaptop = viewportMode === 'laptop'
    const isCompact = isMobile || isTablet
    const ui = getUiScale(viewportMode)

    const shellStyle = {
        height: isCompact ? 'auto' : 980,
        maxHeight: isCompact ? 'none' : 980,
        overflow: isCompact ? 'visible' : 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: ui.shellGap,
        background: '#f6f8fc',
        border: `${ui.shellBorder}px solid #0b63f6`,
        borderRadius: ui.shellRadius,
        padding: ui.shellPad,
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#172033',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',
    }

    const cardStyle = {
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: ui.cardRadius,
        boxShadow: ui.cardShadow,
    }

    const inputStyle = {
        width: '100%',
        minWidth: 0,
        border: '1px solid #dbe3ef',
        borderRadius: ui.inputRadius,
        padding: ui.inputPad,
        fontSize: ui.inputFont,
        fontWeight: ui.inputWeight,
        boxSizing: 'border-box',
    }

    const buttonStyle = {
        border: 0,
        borderRadius: ui.buttonRadius,
        padding: ui.buttonPad,
        fontSize: ui.buttonFont,
        fontWeight: 800,
        cursor: isLocked ? 'not-allowed' : 'pointer',
    }

    const searchFormGridStyle = (() => {
        if (isMobile) {
            return {
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: ui.searchFieldGap,
                alignItems: 'start',
            }
        }

        if (isTablet) {
            return {
                display: 'grid',
                gridTemplateColumns:
                    tripType === 'roundTrip'
                        ? '1fr 40px 1fr'
                        : '1fr 40px 1fr',
                gap: ui.searchFieldGap,
                alignItems: 'start',
            }
        }

        return {
            display: 'grid',
            gridTemplateColumns:
                tripType === 'roundTrip'
                    ? isLaptop
                        ? 'minmax(0,1.2fr) 40px minmax(0,1.2fr) minmax(112px,0.85fr) minmax(112px,0.85fr) minmax(120px,0.8fr) minmax(96px,0.7fr)'
                        : 'minmax(0,1.2fr) 44px minmax(0,1.2fr) minmax(130px,0.9fr) minmax(130px,0.9fr) minmax(130px,0.85fr) minmax(110px,0.75fr)'
                    : isLaptop
                      ? 'minmax(0,1.2fr) 40px minmax(0,1.2fr) minmax(120px,0.9fr) minmax(120px,0.8fr) minmax(96px,0.7fr)'
                      : 'minmax(0,1.2fr) 44px minmax(0,1.2fr) minmax(140px,0.9fr) minmax(140px,0.85fr) minmax(120px,0.75fr)',
            gap: ui.searchFieldGap,
            alignItems: 'start',
        }
    })()

    function renderStickyHint(optionCount, sticky = true) {
        return optionCount > 3 ? (
            <div
                style={{
                    position: sticky ? 'sticky' : 'static',
                    bottom: sticky ? 0 : 'auto',
                    marginTop: 4,
                    padding: isMobile ? '6px 8px' : '8px 10px',
                    borderRadius: ui.inputRadius,
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    color: '#9a3412',
                    fontSize: ui.stickyFont,
                    fontWeight: 800,
                    textAlign: 'center',
                    lineHeight: 1.35,
                    boxShadow: sticky
                        ? '0 -8px 18px rgba(15,23,42,0.08)'
                        : 'none',
                }}
            >
                {t('scrollHint', { count: optionCount })}
            </div>
        ) : null
    }

    function renderPaginationBar(paged) {
        if (!paged || paged.total <= FLIGHTS_PAGE_SIZE) return null

        const pagerButtonStyle = (disabled) => ({
            ...buttonStyle,
            padding: isMobile ? '6px 10px' : '7px 12px',
            fontSize: isMobile ? 11 : 12,
            minHeight: 32,
            background: disabled ? '#e2e8f0' : '#0b63f6',
            color: disabled ? '#64748b' : '#fff',
            cursor: disabled ? 'not-allowed' : 'pointer',
        })

        return (
            <div
                style={{
                    marginTop: 8,
                    padding: isMobile ? '8px 8px' : '10px 10px',
                    borderRadius: ui.inputRadius,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                }}
            >
                <div
                    style={{
                        fontSize: isMobile ? 11 : 12,
                        fontWeight: 800,
                        color: '#334155',
                    }}
                >
                    {t('showingPage', {
                        start: paged.start,
                        end: paged.end,
                        total: paged.total,
                    })}
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <button
                        type="button"
                        disabled={paged.page <= 1}
                        onClick={() => setResultsPage(paged.page - 1)}
                        style={pagerButtonStyle(paged.page <= 1)}
                    >
                        {t('previous')}
                    </button>
                    <div
                        style={{
                            fontSize: isMobile ? 11 : 12,
                            fontWeight: 800,
                            color: '#0b5ed7',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {t('pageOf', {
                            page: paged.page,
                            pages: paged.pageCount,
                        })}
                    </div>
                    <button
                        type="button"
                        disabled={paged.page >= paged.pageCount}
                        onClick={() => setResultsPage(paged.page + 1)}
                        style={pagerButtonStyle(paged.page >= paged.pageCount)}
                    >
                        {t('next')}
                    </button>
                </div>
            </div>
        )
    }

    function renderUnderlineTabs({
        tabs,
        activeId,
        onChange,
        disabled = false,
        compact = false,
        scrollable = false,
        style = {},
    }) {
        return (
            <div
                role="tablist"
                style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: isMobile ? 14 : 28,
                    borderBottom: '1px dashed #dbe3ef',
                    overflowX: scrollable ? 'auto' : 'visible',
                    WebkitOverflowScrolling: scrollable ? 'touch' : undefined,
                    scrollbarWidth: scrollable ? 'none' : undefined,
                    marginBottom: compact ? 8 : 10,
                    flexShrink: 0,
                    ...style,
                }}
            >
                {tabs.map((tab) => {
                    const isActive = tab.id === activeId
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            disabled={disabled || tab.disabled}
                            onClick={() => onChange(tab.id)}
                            style={{
                                flex: scrollable && isMobile ? '0 0 auto' : undefined,
                                minWidth: scrollable && isMobile ? 88 : undefined,
                                border: 0,
                                borderBottom: isActive
                                    ? '2px solid #0b63f6'
                                    : '2px solid transparent',
                                marginBottom: -1,
                                background: 'transparent',
                                color: isActive ? '#0b63f6' : '#64748b',
                                padding: compact
                                    ? isMobile
                                        ? '6px 2px 8px'
                                        : '7px 2px 9px'
                                    : isMobile
                                      ? '6px 2px 10px'
                                      : '8px 4px 12px',
                                cursor:
                                    disabled || tab.disabled
                                        ? 'not-allowed'
                                        : 'pointer',
                                fontWeight: isActive ? 800 : 700,
                                fontSize: compact
                                    ? isMobile
                                        ? 12
                                        : 13
                                    : isMobile
                                      ? 13
                                      : 15,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                opacity: disabled || tab.disabled ? 0.55 : 1,
                            }}
                        >
                            <span>{tab.label}</span>
                            {typeof tab.count === 'number' ? (
                                <span
                                    style={{
                                        color: isActive ? '#0b63f6' : '#94a3b8',
                                        fontSize: isMobile ? 10 : 11,
                                        fontWeight: 800,
                                    }}
                                >
                                    ({tab.count})
                                </span>
                            ) : null}
                            {tab.selected ? (
                                <span
                                    style={{
                                        color: '#16a34a',
                                        fontSize: 11,
                                        fontWeight: 900,
                                    }}
                                >
                                    ✓
                                </span>
                            ) : null}
                        </button>
                    )
                })}
            </div>
        )
    }

    function renderResultsTabBar(tabs, activeId, onChange) {
        return renderUnderlineTabs({
            tabs,
            activeId,
            onChange,
            compact: true,
            scrollable: true,
        })
    }

    function renderTabPanel({
        title,
        subtitle,
        hint,
        warning,
        sectionOptions,
        selectedOption,
        selectedFlights,
        onSelect,
        keyPrefix,
        disabledReason = '',
        emptyText,
    }) {
        const selectedList = (
            Array.isArray(selectedFlights) ? selectedFlights : [selectedOption]
        ).filter(Boolean)
        const paged = paginateOptions(sectionOptions, resultsPage)
        return (
            <div
                role="tabpanel"
                style={{
                    ...cardStyle,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    flex: 1,
                    overflow: 'hidden',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        padding: isMobile ? '8px 10px' : '9px 12px',
                        borderBottom: '1px solid #e2e8f0',
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            fontWeight: 900,
                            fontSize: isMobile ? 12 : 13,
                        }}
                    >
                        {title}
                    </div>
                    {subtitle ? (
                        <div
                            style={{
                                color: '#64748b',
                                fontSize: isMobile ? 10 : 11,
                                marginTop: 2,
                                fontWeight: 700,
                            }}
                        >
                            {subtitle}
                        </div>
                    ) : null}
                    {hint ? (
                        <div
                            style={{
                                color: '#0b5ed7',
                                fontSize: isMobile ? 10 : 11,
                                marginTop: 3,
                                fontWeight: 800,
                            }}
                        >
                            {hint}
                        </div>
                    ) : null}
                </div>

                <div
                    style={{
                        padding: isMobile ? 8 : 10,
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        flex: 1,
                        minHeight: isCompact ? 320 : 280,
                        maxHeight: isCompact ? '70vh' : undefined,
                    }}
                >
                    {warning ? (
                        <div
                            style={{
                                color: '#9a3412',
                                background: '#fff7ed',
                                border: '1px solid #fed7aa',
                                borderRadius: 10,
                                padding: '7px 9px',
                                marginBottom: 8,
                                fontSize: isMobile ? 11 : 12,
                                fontWeight: 800,
                            }}
                        >
                            {warning}
                        </div>
                    ) : null}

                    {sectionOptions.length ? (
                        <>
                            {paged.items.map((option) =>
                                renderFlightOptionCard({
                                    option,
                                    isSelected: isFlightSelected(
                                        option,
                                        selectedList
                                    ),
                                    buttonLabel: t('select'),
                                    selectedLabel: t('selected'),
                                    onSelect: () => onSelect(option),
                                    keyPrefix,
                                    disabledReason,
                                })
                            )}
                            {renderPaginationBar(paged)}
                            {paged.pageCount <= 1 ? (
                                <div style={{ marginTop: 6 }}>
                                    {renderStickyHint(sectionOptions.length, false)}
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <StateMessage text={emptyText} />
                    )}
                </div>
            </div>
        )
    }

    function renderRoundTripInternationalResults() {
        const selectedOption = selectedOutbound
        const sectionOptions = prioritizeSelectedFlights(visibleOptions, [
            selectedOption,
        ])
        const fromCode = fromAirport?.code || t('from')
        const toCode = toAirport?.code || t('to')

        return (
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {renderTabPanel({
                    title: t('roundTrip'),
                    subtitle: `${fromCode} → ${toCode} / ${toCode} → ${fromCode} · ${sectionOptions.length} options`,
                    hint: 'Select one itinerary. Onward and return are already included in each option.',
                    warning: '',
                    sectionOptions,
                    selectedOption,
                    onSelect: (option) =>
                        selectRoundTripInternationalFlight(option),
                    keyPrefix: 'rt-intl-',
                    emptyText: t('noFlightsMatch'),
                })}
            </div>
        )
    }

    function renderRoundTripResults() {
        // International round trip: flat package list only (no Onward / Return tabs).
        if (getIsRoundTripInternational()) {
            return renderRoundTripInternationalResults()
        }

        const tabs = [
            {
                id: 'all',
                label: t('allFlights'),
                subtitle: getRouteDisplay(),
                count: visibleOptions.length,
                selected: Boolean(selectedOutbound || selectedReturn),
            },
            {
                id: 'onward',
                label: t('onwardFlights'),
                subtitle: `${fromAirport?.code || t('from')} → ${toAirport?.code || t('to')}`,
                count: visibleOutboundOptions.length,
                selected: Boolean(selectedOutbound),
            },
            {
                id: 'return',
                label: t('returnFlights'),
                subtitle: `${toAirport?.code || t('to')} → ${fromAirport?.code || t('from')}`,
                count: visibleReturnOptions.length,
                selected: Boolean(selectedReturn),
            },
        ]
        const isAll = activeRoundTripTab === 'all'
        const isOnward = activeRoundTripTab === 'onward'
        const sectionOptions = isAll
            ? visibleOptions
            : isOnward
              ? visibleOutboundOptions
              : visibleReturnOptions
        const selectedFlights = isAll
            ? [selectedOutbound, selectedReturn]
            : isOnward
              ? [selectedOutbound]
              : [selectedReturn]
        const title = isAll
            ? t('allFlights')
            : isOnward
              ? t('onwardFlights')
              : t('returnFlights')
        const subtitle = isAll
            ? `${getRouteDisplay()} · ${sectionOptions.length} options`
            : isOnward
              ? `${fromAirport?.code || t('from')} → ${toAirport?.code || t('to')} · ${sectionOptions.length} options`
              : `${toAirport?.code || t('to')} → ${fromAirport?.code || t('from')} · ${sectionOptions.length} options`

        return (
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {renderResultsTabBar(tabs, activeRoundTripTab, (id) =>
                    setActiveRoundTripTab(id)
                )}
                {renderTabPanel({
                    title,
                    subtitle,
                    sectionOptions,
                    selectedFlights,
                    onSelect: (option) => {
                        if (isAll) {
                            const sector = getFlightSector(
                                option,
                                fromAirport,
                                toAirport,
                                sectorIndexBase
                            )
                            selectRoundTripLeg(
                                option,
                                sector === 'return' ? 'return' : 'onward'
                            )
                            return
                        }
                        selectRoundTripLeg(
                            option,
                            isOnward ? 'onward' : 'return'
                        )
                    },
                    keyPrefix: `${isAll ? 'all' : isOnward ? 'onward' : 'return'}-`,
                    emptyText: t('noSectionFlights', {
                        section: title.toLowerCase(),
                    }),
                })}
            </div>
        )
    }

    function renderMultiCityInternationalResults() {
        const selectedOption = getSelectedFlightAt(selectedMultiCityFlights, 0)
        const sectionOptions = prioritizeSelectedFlights(visibleOptions, [
            selectedOption,
        ])
        const routeLabel = getMultiCityRouteSummary()

        return (
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {renderTabPanel({
                    title: t('multiCity'),
                    subtitle: `${routeLabel} · ${sectionOptions.length} options`,
                    hint: 'Select one itinerary. Stops inside each option are already included.',
                    warning: '',
                    sectionOptions,
                    selectedOption,
                    onSelect: (option) =>
                        selectMultiCityInternationalFlight(option),
                    keyPrefix: 'multi-intl-',
                    emptyText: t('noFlightsMatch'),
                })}
            </div>
        )
    }

    function renderMultiCityResults() {
        // International multi-city: flat package list only (no Stop 1 / Stop 2 tabs).
        if (getIsMultiCityInternational()) {
            return renderMultiCityInternationalResults()
        }

        const safeTabIndex = Math.min(
            Math.max(activeMultiCityTab, 0),
            Math.max(visibleMultiCitySections.length - 1, 0)
        )
        const tabs = visibleMultiCitySections.map((section) => {
            const fromCode =
                section.segment.fromAirport?.code ||
                section.segment.fromAirport?.city ||
                t('from')
            const toCode =
                section.segment.toAirport?.code ||
                section.segment.toAirport?.city ||
                t('to')
            return {
                id: section.index,
                label: `Stop ${section.index + 1}`,
                subtitle: `${fromCode} → ${toCode}`,
                count: section.options.length,
                selected: Boolean(selectedMultiCityFlights[section.index]),
            }
        })
        const activeSection =
            visibleMultiCitySections.find(
                (section) => section.index === safeTabIndex
            ) || visibleMultiCitySections[0]

        if (!activeSection) {
            return <StateMessage text={t('noFlightsMatch')} />
        }

        const {
            segment,
            index,
            connection,
            requiresPreviousSelection,
            options: sectionOptions,
            hiddenConnectionCount,
        } = activeSection
        const selectedOption = selectedMultiCityFlights[index]
        const connectionMinutes =
            connection?.minimumConnectionMinutes || DOMESTIC_CONNECTION_MINUTES
        const fromLabel =
            segment.fromAirport?.city ||
            segment.fromAirport?.code ||
            t('from')
        const toLabel =
            segment.toAirport?.city || segment.toAirport?.code || t('to')

        return (
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {renderResultsTabBar(tabs, safeTabIndex, (id) =>
                    setActiveMultiCityTab(Number(id))
                )}
                {renderTabPanel({
                    title: `Stop ${index + 1}`,
                    subtitle: `${fromLabel} → ${toLabel} · ${sectionOptions.length} options`,
                    hint:
                        index > 0
                            ? `Minimum connection: ${connectionMinutes / 60}h after previous arrival`
                            : '',
                    warning: requiresPreviousSelection
                        ? 'Select previous stop flight first to validate connection time.'
                        : hiddenConnectionCount
                          ? `${hiddenConnectionCount} flights have a tight connection and stay listed`
                          : '',
                    sectionOptions,
                    selectedOption,
                    onSelect: (option) =>
                        selectMultiCityFlight(option, index),
                    keyPrefix: `multi-${index}-`,
                    disabledReason: requiresPreviousSelection
                        ? 'Select previous stop first'
                        : '',
                    emptyText: `No options returned for Stop ${index + 1}.`,
                })}
            </div>
        )
    }

    function renderFlightOptionCard({
        option,
        isSelected,
        buttonLabel,
        selectedLabel,
        onSelect,
        keyPrefix = '',
        disabledReason = '',
    }) {
        const optionKey = getOptionIdentity(option)
        const isExpanded = expandedId === optionKey
        const stops = Number(option.stops || 0)
        const stopText =
            stops === 0
                ? t('nonStop')
                : stops === 1
                  ? t('oneStop')
                  : t('stopPlural', { count: stops })
        const actionDisabled = isLocked || Boolean(disabledReason)
        const airlineLabel =
            option.airlineName || option.provider || t('airline')
        const flightMeta = [
            option.flightNumber
                ? `${option.airlineCode || ''} ${option.flightNumber}`.trim()
                : '',
            option.fareType || '',
        ]
            .filter(Boolean)
            .join(' · ')
        const compactTimeSize = isMobile ? 13 : isTablet ? 14 : 15
        const compactMetaSize = isMobile ? 10 : 11
        const compactFareSize = isMobile ? 14 : 15
        const actionText =
            isSelected && selectedLabel ? selectedLabel : buttonLabel

        return (
            <div
                key={`${keyPrefix}${optionKey}`}
                style={{
                    ...cardStyle,
                    padding: isMobile ? '8px 9px' : '8px 10px',
                    marginBottom: 6,
                    borderRadius: isMobile ? 10 : 12,
                    borderColor: isSelected ? '#0b63f6' : '#e2e8f0',
                    boxShadow: isSelected
                        ? '0 0 0 1px rgba(11,99,246,0.28), 0 4px 12px rgba(15,23,42,0.06)'
                        : '0 1px 3px rgba(15,23,42,0.05)',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile
                            ? '1fr auto'
                            : isTablet
                              ? 'minmax(100px,0.9fr) minmax(0,1.6fr) auto'
                              : 'minmax(120px,0.95fr) minmax(0,1.7fr) auto',
                        gap: isMobile ? '6px 8px' : '6px 12px',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            minWidth: 0,
                            gridColumn: isMobile ? '1 / 2' : undefined,
                        }}
                    >
                        {option.flightImage ? (
                            <img
                                src={option.flightImage}
                                alt=""
                                style={{
                                    width: isMobile ? 22 : 26,
                                    height: isMobile ? 22 : 26,
                                    objectFit: 'contain',
                                    flexShrink: 0,
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: isMobile ? 22 : 26,
                                    height: isMobile ? 22 : 26,
                                    borderRadius: 6,
                                    background: '#eef6ff',
                                    color: '#0b5ed7',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontSize: 10,
                                    fontWeight: 900,
                                    flexShrink: 0,
                                }}
                            >
                                ✈
                            </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    fontWeight: 800,
                                    fontSize: isMobile ? 12 : 13,
                                    lineHeight: 1.2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {airlineLabel}
                            </div>
                            {flightMeta ? (
                                <div
                                    style={{
                                        color: '#64748b',
                                        fontSize: compactMetaSize,
                                        lineHeight: 1.25,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {flightMeta}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {isMobile ? (
                        <div
                            style={{
                                fontWeight: 900,
                                fontSize: compactFareSize,
                                whiteSpace: 'nowrap',
                                justifySelf: 'end',
                            }}
                        >
                            {formatMoney(option.totalFare)}
                        </div>
                    ) : null}

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            gap: isMobile ? 4 : 8,
                            alignItems: 'center',
                            minWidth: 0,
                            gridColumn: isMobile ? '1 / -1' : undefined,
                        }}
                    >
                        <TimeBlock
                            time={option.departureTime}
                            code={option.sourceCityCode}
                            airport={option.departureAirport}
                            timeSize={compactTimeSize}
                            metaSize={compactMetaSize}
                            compact
                        />
                        <div
                            style={{
                                textAlign: 'center',
                                color: '#64748b',
                                fontSize: compactMetaSize,
                                minWidth: isMobile ? 52 : 64,
                                lineHeight: 1.2,
                            }}
                        >
                            <div style={{ fontWeight: 700 }}>
                                {option.duration || '—'}
                            </div>
                            <div
                                style={{
                                    height: 1,
                                    background: '#cbd5e1',
                                    margin: '3px auto',
                                    maxWidth: isMobile ? 56 : 72,
                                }}
                            />
                            <div>{stopText}</div>
                        </div>
                        <TimeBlock
                            time={option.arrivalTime}
                            code={option.destinationCityCode}
                            airport={option.arrivalAirport}
                            timeSize={compactTimeSize}
                            metaSize={compactMetaSize}
                            align="right"
                            compact
                        />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'row' : 'column',
                            alignItems: isMobile ? 'center' : 'flex-end',
                            justifyContent: isMobile
                                ? 'space-between'
                                : 'center',
                            gap: isMobile ? 8 : 4,
                            minWidth: isMobile ? 0 : 108,
                            gridColumn: isMobile ? '1 / -1' : undefined,
                        }}
                    >
                        {isMobile ? null : (
                            <div
                                style={{
                                    fontWeight: 900,
                                    fontSize: compactFareSize,
                                    lineHeight: 1.1,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {formatMoney(option.totalFare)}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onSelect}
                            disabled={actionDisabled}
                            title={actionText}
                            style={{
                                ...buttonStyle,
                                marginTop: 0,
                                padding: isMobile ? '6px 10px' : '6px 12px',
                                fontSize: isMobile ? 11 : 12,
                                borderRadius: 8,
                                minHeight: isMobile ? 30 : 32,
                                width: isMobile ? 'auto' : '100%',
                                maxWidth: isMobile ? 'none' : 120,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                background: isSelected
                                    ? '#16a34a'
                                    : actionDisabled
                                      ? '#cbd5e1'
                                      : '#ff6b00',
                                color: actionDisabled ? '#64748b' : '#fff',
                            }}
                        >
                            {actionText}
                        </button>
                        {disabledReason ? (
                            <div
                                style={{
                                    color: '#b91c1c',
                                    fontSize: 10,
                                    fontWeight: 800,
                                    textAlign: isMobile ? 'left' : 'right',
                                    lineHeight: 1.2,
                                }}
                            >
                                {disabledReason}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 5,
                        paddingTop: 5,
                        borderTop: '1px solid #f1f5f9',
                    }}
                >
                    <button
                        type="button"
                        onClick={() =>
                            setExpandedId(isExpanded ? null : optionKey)
                        }
                        style={{
                            border: 0,
                            background: 'transparent',
                            color: '#0b63f6',
                            fontWeight: 700,
                            fontSize: compactMetaSize,
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1.2,
                        }}
                    >
                        {isExpanded ? t('hideDetails') : t('viewFlightDetails')}
                    </button>
                    {option.seatsAvailable ? (
                        <span
                            style={{
                                color: '#64748b',
                                fontSize: compactMetaSize,
                                fontWeight: 700,
                            }}
                        >
                            {t('seats')}: {option.seatsAvailable}
                        </span>
                    ) : null}
                </div>

                {isExpanded ? (
                    <div
                        style={{
                            marginTop: 6,
                            borderTop: '1px solid #e2e8f0',
                            paddingTop: 6,
                        }}
                    >
                        {(option.legSummary?.length
                            ? option.legSummary
                            : [
                                  {
                                      flightName: option.airlineName,
                                      flightCode: option.airlineCode,
                                      flightNumber: option.flightNumber,
                                      from:
                                          option.sourceCityCode ||
                                          option.sourceCityCode,
                                      to:
                                          option.destinationCityCode ||
                                          option.destinationCityCode,
                                      departureTime: option.departureTime,
                                      arrivalTime: option.arrivalTime,
                                      duration: option.duration,
                                  },
                              ]
                        ).map((leg, index) => (
                            <div
                                key={`${optionKey}-${index}`}
                                style={{
                                    fontSize: compactMetaSize,
                                    marginBottom: 5,
                                    lineHeight: 1.35,
                                    color: '#334155',
                                }}
                            >
                                <strong>
                                    {leg.flightName || option.airlineName}{' '}
                                    {leg.flightCode || ''}-
                                    {leg.flightNumber || ''}
                                </strong>
                                <br />
                                {leg.from} {leg.departureTime} → {leg.to}{' '}
                                {leg.arrivalTime} · {leg.duration || ''}
                                {leg.layoverTime ? (
                                    <>
                                        <br />
                                        {t('layoverAfterLeg')}:{' '}
                                        {leg.layoverTime}
                                    </>
                                ) : null}
                            </div>
                        ))}
                        <div
                            style={{
                                color: '#64748b',
                                fontSize: compactMetaSize,
                            }}
                        >
                            {t('baggage')}:{' '}
                            {option.baggage || t('baggageFallback')} ·{' '}
                            {t('seats')}:{' '}
                            {option.seatsAvailable ||
                                t('seatsUnavailableShort')}
                        </div>
                    </div>
                ) : null}
            </div>
        )
    }

    function formatLegSelection(option) {
        if (!option) return t('notSelected')

        return `${option.airlineName || option.provider || t('airline')} ${option.flightNumber || ''} · ${option.sourceCityCode} ${option.departureTime || ''} → ${option.destinationCityCode} ${option.arrivalTime || ''} · ${formatMoney(option.totalFare)}`
    }

    function getMultiCityRouteAirports() {
        return [
            multiCitySegments[0]?.fromAirport,
            ...multiCitySegments.map((segment) => segment.toAirport),
        ].filter(Boolean)
    }

    function getMultiCityRouteSummary() {
        const codes = getMultiCityRouteAirports()
            .map((airport) => airport.code || t('to'))
            .filter(Boolean)
        return codes.length ? codes.join(' → ') : 'Start → Stop'
    }

    function renderMultiCityBuilder() {
        // Always show full itinerary inputs (view/edit/create) — no collapsed Edit gate
        if (false && isMultiCityBuilderCollapsed && options.length > 0) {
            return (
                <div
                    style={{
                        borderBottom: '1px solid #e2e8f0',
                        padding: '6px 0 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <div
                            style={{
                                fontWeight: 800,
                                fontSize: ui.bodySize,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {getMultiCityRouteSummary()}
                        </div>
                        <div
                            style={{
                                color: '#64748b',
                                fontSize: ui.metaSize,
                                fontWeight: 700,
                                marginTop: 1,
                            }}
                        >
                            {multiCitySegments.length} trips · {fareClass}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsMultiCityBuilderCollapsed(false)}
                        disabled={isLocked}
                        style={{
                            ...buttonStyle,
                            padding: '6px 10px',
                            background: 'transparent',
                            color: '#0b63f6',
                            border: '1px solid #dbe3ef',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Edit
                    </button>
                </div>
            )
        }

        const canRemoveTrip =
            multiCitySegments.length > DEFAULT_MULTI_CITY_SEGMENT_COUNT
        const canAddTrip =
            !isLocked && multiCitySegments.length < MAX_MULTI_CITY_SEGMENTS
        const rowGap = isMobile ? 6 : 8
        const controlHeight = isMobile ? 34 : 36
        const tripRowColumns = isMobile
            ? '1fr'
            : isTablet
              ? 'minmax(0,1fr) minmax(0,1fr) minmax(120px,0.7fr) auto'
              : 'minmax(0,1.3fr) minmax(0,1.3fr) minmax(132px,0.75fr) auto'
        const headerLabelStyle = {
            fontSize: ui.labelSize,
            color: '#64748b',
            fontWeight: 800,
            letterSpacing: 0.2,
            marginBottom: 4,
        }
        const compactInputStyle = {
            ...inputStyle,
            padding: isMobile ? '6px 8px' : '7px 9px',
            fontSize: isMobile ? 12 : 13,
            borderRadius: 8,
            height: controlHeight,
            minHeight: controlHeight,
            boxSizing: 'border-box',
        }
        const hintStyle = {
            color: '#64748b',
            fontSize: 10,
            marginTop: 3,
            lineHeight: 1.2,
            minHeight: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        }
        const actionBtnBase = {
            border: '1px solid #fed7aa',
            background: '#fff7ed',
            color: '#ea580c',
            borderRadius: 8,
            width: controlHeight,
            height: controlHeight,
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1,
            display: 'grid',
            placeItems: 'center',
            padding: 0,
            flexShrink: 0,
            boxSizing: 'border-box',
        }
        const addBtnStyle = {
            ...actionBtnBase,
            border: '1px solid #86efac',
            background: '#f0fdf4',
            color: '#16a34a',
        }

        return (
            <div>
                {!isMobile ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: tripRowColumns,
                            gap: rowGap,
                            alignItems: 'end',
                            marginBottom: 2,
                        }}
                    >
                        <div style={headerLabelStyle}>
                            Departure Airport *
                        </div>
                        <div style={headerLabelStyle}>Arrival Airport *</div>
                        <div style={headerLabelStyle}>Departure Date *</div>
                        <div style={{ width: controlHeight * 2 + 6 }} />
                    </div>
                ) : null}

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isMobile ? 10 : 8,
                    }}
                >
                    {multiCitySegments.map((segment, index) => {
                        const isChainedFrom = index > 0
                        const isLastRow = index === multiCitySegments.length - 1
                        const showAdjustedHint =
                            segment.hint ===
                            'Adjusted based on previous flight arrival time'
                        const fromHint = isChainedFrom
                            ? segment.fromAirport?.code
                                ? `From Trip ${index} · ${segment.fromAirport.code}`
                                : 'Auto from previous arrival'
                            : segment.fromAirport
                              ? `${segment.fromAirport.code}`
                              : t('selectAirport')
                        const toHint = segment.toAirport
                            ? `${segment.toAirport.code}`
                            : t('selectAirport')

                        return (
                            <div
                                key={index}
                                style={{
                                    paddingBottom: isMobile ? 8 : 0,
                                    borderBottom: isLastRow
                                        ? 'none'
                                        : '1px solid #f1f5f9',
                                }}
                            >
                                {isMobile ? (
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr',
                                            gap: rowGap,
                                        }}
                                    >
                                        <AirportInput
                                            label="Departure Airport *"
                                            value={segment.fromText}
                                            hint={fromHint}
                                            onChange={(value) => {
                                                if (isChainedFrom) return
                                                updateMultiCitySegment(
                                                    index,
                                                    {
                                                        fromText: value,
                                                        fromAirport: null,
                                                    },
                                                    { normalizeChain: false }
                                                )
                                                markMultiCityRouteChanged()
                                                searchSegmentAirports(
                                                    value,
                                                    index,
                                                    'from'
                                                )
                                            }}
                                            suggestions={
                                                isChainedFrom
                                                    ? []
                                                    : segment.fromSuggestions
                                            }
                                            showSuggestions={
                                                !isChainedFrom &&
                                                segment.showFromSuggestions
                                            }
                                            onSelect={(airport) =>
                                                selectMultiCityAirport(
                                                    index,
                                                    'from',
                                                    airport
                                                )
                                            }
                                            inputStyle={{
                                                ...compactInputStyle,
                                                background: isChainedFrom
                                                    ? '#f8fafc'
                                                    : '#fff',
                                                color: isChainedFrom
                                                    ? '#475569'
                                                    : '#172033',
                                            }}
                                            disabled={
                                                isLocked || isChainedFrom
                                            }
                                            isMobile={isMobile}
                                            labelSize={ui.labelSize}
                                            hintSize={10}
                                            hintStyle={hintStyle}
                                        />
                                        <AirportInput
                                            label="Arrival Airport *"
                                            value={segment.toText}
                                            hint={toHint}
                                            onChange={(value) => {
                                                updateMultiCitySegment(index, {
                                                    toText: value,
                                                    toAirport: null,
                                                })
                                                markMultiCityRouteChanged()
                                                searchSegmentAirports(
                                                    value,
                                                    index,
                                                    'to'
                                                )
                                            }}
                                            suggestions={
                                                segment.toSuggestions
                                            }
                                            showSuggestions={
                                                segment.showToSuggestions
                                            }
                                            onSelect={(airport) =>
                                                selectMultiCityAirport(
                                                    index,
                                                    'to',
                                                    airport
                                                )
                                            }
                                            inputStyle={compactInputStyle}
                                            disabled={isLocked}
                                            isMobile={isMobile}
                                            labelSize={ui.labelSize}
                                            hintSize={10}
                                            hintStyle={hintStyle}
                                        />
                                        <Field
                                            label="Departure Date *"
                                            labelSize={ui.labelSize}
                                        >
                                            <input
                                                value={segment.depDate}
                                                type="date"
                                                onChange={(event) => {
                                                    updateMultiCitySegment(
                                                        index,
                                                        {
                                                            depDate:
                                                                event.target
                                                                    .value,
                                                        }
                                                    )
                                                    markMultiCityRouteChanged()
                                                }}
                                                style={compactInputStyle}
                                                disabled={isLocked}
                                            />
                                        </Field>
                                        {showAdjustedHint ? (
                                            <div
                                                style={{
                                                    ...hintStyle,
                                                    color: '#0b5ed7',
                                                }}
                                            >
                                                Adjusted for arrival
                                            </div>
                                        ) : null}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                                gap: 6,
                                                height: controlHeight,
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeMultiCitySegment(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    isLocked || !canRemoveTrip
                                                }
                                                aria-label={`Remove trip ${index + 1}`}
                                                title={
                                                    canRemoveTrip
                                                        ? 'Remove trip'
                                                        : 'Minimum 2 trips required'
                                                }
                                                style={{
                                                    ...actionBtnBase,
                                                    opacity:
                                                        isLocked ||
                                                        !canRemoveTrip
                                                            ? 0.4
                                                            : 1,
                                                    cursor:
                                                        isLocked ||
                                                        !canRemoveTrip
                                                            ? 'not-allowed'
                                                            : 'pointer',
                                                }}
                                            >
                                                −
                                            </button>
                                            {isLastRow ? (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        addMultiCitySegment
                                                    }
                                                    disabled={!canAddTrip}
                                                    aria-label="Add trip"
                                                    title="Add trip"
                                                    style={{
                                                        ...addBtnStyle,
                                                        opacity: canAddTrip
                                                            ? 1
                                                            : 0.4,
                                                        cursor: canAddTrip
                                                            ? 'pointer'
                                                            : 'not-allowed',
                                                    }}
                                                >
                                                    +
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns:
                                                    tripRowColumns,
                                                gap: rowGap,
                                                alignItems: 'center',
                                            }}
                                        >
                                            <AirportInput
                                                label=""
                                                value={segment.fromText}
                                                hint={fromHint}
                                                hideHint
                                                onChange={(value) => {
                                                    if (isChainedFrom) return
                                                    updateMultiCitySegment(
                                                        index,
                                                        {
                                                            fromText: value,
                                                            fromAirport: null,
                                                        },
                                                        {
                                                            normalizeChain: false,
                                                        }
                                                    )
                                                    markMultiCityRouteChanged()
                                                    searchSegmentAirports(
                                                        value,
                                                        index,
                                                        'from'
                                                    )
                                                }}
                                                suggestions={
                                                    isChainedFrom
                                                        ? []
                                                        : segment.fromSuggestions
                                                }
                                                showSuggestions={
                                                    !isChainedFrom &&
                                                    segment.showFromSuggestions
                                                }
                                                onSelect={(airport) =>
                                                    selectMultiCityAirport(
                                                        index,
                                                        'from',
                                                        airport
                                                    )
                                                }
                                                inputStyle={{
                                                    ...compactInputStyle,
                                                    background: isChainedFrom
                                                        ? '#f8fafc'
                                                        : '#fff',
                                                    color: isChainedFrom
                                                        ? '#475569'
                                                        : '#172033',
                                                }}
                                                disabled={
                                                    isLocked || isChainedFrom
                                                }
                                                isMobile={isMobile}
                                            />
                                            <AirportInput
                                                label=""
                                                value={segment.toText}
                                                hint={toHint}
                                                hideHint
                                                onChange={(value) => {
                                                    updateMultiCitySegment(
                                                        index,
                                                        {
                                                            toText: value,
                                                            toAirport: null,
                                                        }
                                                    )
                                                    markMultiCityRouteChanged()
                                                    searchSegmentAirports(
                                                        value,
                                                        index,
                                                        'to'
                                                    )
                                                }}
                                                suggestions={
                                                    segment.toSuggestions
                                                }
                                                showSuggestions={
                                                    segment.showToSuggestions
                                                }
                                                onSelect={(airport) =>
                                                    selectMultiCityAirport(
                                                        index,
                                                        'to',
                                                        airport
                                                    )
                                                }
                                                inputStyle={compactInputStyle}
                                                disabled={isLocked}
                                                isMobile={isMobile}
                                            />
                                            <input
                                                value={segment.depDate}
                                                type="date"
                                                onChange={(event) => {
                                                    updateMultiCitySegment(
                                                        index,
                                                        {
                                                            depDate:
                                                                event.target
                                                                    .value,
                                                        }
                                                    )
                                                    markMultiCityRouteChanged()
                                                }}
                                                style={compactInputStyle}
                                                disabled={isLocked}
                                            />
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-start',
                                                    gap: 6,
                                                    height: controlHeight,
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeMultiCitySegment(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        isLocked ||
                                                        !canRemoveTrip
                                                    }
                                                    aria-label={`Remove trip ${index + 1}`}
                                                    title={
                                                        canRemoveTrip
                                                            ? 'Remove trip'
                                                            : 'Minimum 2 trips required'
                                                    }
                                                    style={{
                                                        ...actionBtnBase,
                                                        opacity:
                                                            isLocked ||
                                                            !canRemoveTrip
                                                                ? 0.4
                                                                : 1,
                                                        cursor:
                                                            isLocked ||
                                                            !canRemoveTrip
                                                                ? 'not-allowed'
                                                                : 'pointer',
                                                    }}
                                                >
                                                    −
                                                </button>
                                                {isLastRow ? (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            addMultiCitySegment
                                                        }
                                                        disabled={!canAddTrip}
                                                        aria-label="Add trip"
                                                        title="Add trip"
                                                        style={{
                                                            ...addBtnStyle,
                                                            opacity: canAddTrip
                                                                ? 1
                                                                : 0.4,
                                                            cursor: canAddTrip
                                                                ? 'pointer'
                                                                : 'not-allowed',
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                ) : (
                                                    <span
                                                        style={{
                                                            width: controlHeight,
                                                            height: controlHeight,
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns:
                                                    tripRowColumns,
                                                gap: rowGap,
                                                marginTop: 3,
                                            }}
                                        >
                                            <div style={hintStyle}>
                                                {fromHint}
                                            </div>
                                            <div style={hintStyle}>
                                                {toHint}
                                            </div>
                                            <div
                                                style={{
                                                    ...hintStyle,
                                                    color: showAdjustedHint
                                                        ? '#0b5ed7'
                                                        : '#64748b',
                                                }}
                                            >
                                                {showAdjustedHint
                                                    ? 'Adjusted for arrival'
                                                    : '\u00A0'}
                                            </div>
                                            <div />
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 8,
                        alignItems: 'end',
                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                        marginTop: 10,
                    }}
                >
                    <Field label={t('class')} labelSize={ui.labelSize}>
                        <select
                            value={fareClass}
                            onChange={(event) => {
                                setFareClass(event.target.value)
                                markMultiCityRouteChanged()
                            }}
                            style={{
                                ...compactInputStyle,
                                width: isMobile ? '100%' : 140,
                            }}
                        >
                            <option>Economy</option>
                            <option>PremiumEconomy</option>
                            <option>Business</option>
                            <option>First</option>
                        </select>
                    </Field>
                    <button
                        type="button"
                        onClick={searchFlights}
                        disabled={isLocked || loading}
                        style={{
                            ...buttonStyle,
                            background: '#ff6b00',
                            color: '#fff',
                            height: controlHeight,
                            minHeight: controlHeight,
                            padding: isMobile ? '0 14px' : '0 16px',
                            width: isMobile ? '100%' : 'auto',
                            flex: isMobile ? '1 1 100%' : undefined,
                        }}
                    >
                        {loading ? t('searching') : t('search')}
                    </button>
                </div>
            </div>
        )
    }

    function renderOneWaySummary() {
        if (!selected?.flight) {
            return (
                <>
                    <div style={{ flex: 1, minWidth: isMobile ? 0 : 220 }}>
                        <strong style={{ fontSize: ui.bodySize }}>
                            {t('noFlightSelected')}
                        </strong>
                        <div
                            style={{
                                color: '#64748b',
                                fontSize: ui.metaSize,
                                marginTop: 3,
                            }}
                        >
                            {t('selectFlightInstruction')}
                        </div>
                    </div>
                    <span
                        style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: '#fff7ed',
                            color: '#9a3412',
                            fontSize: 12,
                            fontWeight: 900,
                        }}
                    >
                        {currentPolicyInsight.policyStatus}
                    </span>
                </>
            )
        }

        const flight = selected.flight
        const stops = Number(flight.stops || 0)
        const stopText =
            stops === 0
                ? t('nonStop')
                : stops === 1
                  ? t('oneStop')
                  : t('stopPlural', { count: stops })
        const policyStatus = selected.policy?.status || 'UNKNOWN'
        const policyPass =
            policyStatus === 'PASS' ||
            policyStatus === 'SATISFIED' ||
            policyStatus === 'COMPLIANT' ||
            policyStatus === 'OK'
        const policyColor =
            policyStatus === 'BREACHED'
                ? '#b91c1c'
                : policyPass
                  ? '#166534'
                  : '#9a3412'
        const policyBg =
            policyStatus === 'BREACHED'
                ? '#fef2f2'
                : policyPass
                  ? '#f0fdf4'
                  : '#fff7ed'

        return (
            <>
                <div style={{ flex: 1, minWidth: isMobile ? 0 : 260 }}>
                    <strong style={{ fontSize: ui.bodySize }}>
                        {flight.airlineName} {flight.flightNumber} ·{' '}
                        {formatMoney(selected.bookingAmount)}
                    </strong>
                    <div
                        style={{
                            color: '#64748b',
                            fontSize: ui.metaSize,
                            marginTop: 3,
                        }}
                    >
                        {flight.sourceCityCode} {flight.departureTime} →{' '}
                        {flight.destinationCityCode} {flight.arrivalTime} ·{' '}
                        {stopText} · {flight.duration}
                    </div>
                </div>
                <span
                    style={{
                        padding: '6px 10px',
                        borderRadius: 999,
                        background: policyBg,
                        color: policyColor,
                        fontSize: 12,
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {policyStatus}
                </span>
            </>
        )
    }

    function renderRoundTripSummary() {
        const isIntlPackage = getIsRoundTripInternational()
        const onwardAmount = Number(selectedOutbound?.totalFare || 0)
        const returnAmount = Number(selectedReturn?.totalFare || 0)
        const totalAmount = isIntlPackage
            ? onwardAmount
            : onwardAmount + returnAmount
        const canSaveRoundTrip = isIntlPackage
            ? Boolean(selectedOutbound && !isLocked)
            : Boolean(selectedOutbound && selectedReturn && !isLocked)
        const policyStatus = selected?.roundTrip
            ? selected?.policy?.status || 'UNKNOWN'
            : currentPolicyInsight.policyStatus
        const saveStateText = canSaveRoundTrip
            ? t('readyToSave')
            : isIntlPackage
              ? 'Select a round trip flight option'
              : t('selectOnwardAndReturn')

        if (isIntlPackage) {
            return (
                <>
                    <div
                        style={{
                            flex: isMobile ? '1 1 100%' : '1 1 260px',
                            minWidth: isMobile ? 0 : 220,
                        }}
                    >
                        <strong style={{ fontSize: ui.bodySize }}>
                            {selectedOutbound
                                ? '1 round trip itinerary selected'
                                : 'Select a round trip flight option'}
                        </strong>
                        <div
                            style={{
                                color: '#334155',
                                fontSize: ui.metaSize,
                                marginTop: 3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: isMobile ? 'normal' : 'nowrap',
                            }}
                        >
                            {formatLegSelection(selectedOutbound)}
                        </div>
                        <div
                            style={{
                                color: canSaveRoundTrip ? '#166534' : '#9a3412',
                                fontSize: ui.metaSize,
                                fontWeight: 800,
                                marginTop: 3,
                            }}
                        >
                            {saveStateText}
                        </div>
                    </div>
                    <div
                        style={{
                            minWidth: isMobile ? 0 : 130,
                            flex: isMobile ? '1 1 45%' : undefined,
                        }}
                    >
                        <div
                            style={{
                                fontSize: ui.metaSize,
                                color: '#64748b',
                                fontWeight: 900,
                            }}
                        >
                            {t('totalFare')}
                        </div>
                        <div
                            style={{
                                fontWeight: 900,
                                fontSize: ui.fareSize,
                                marginTop: 2,
                            }}
                        >
                            {formatMoney(totalAmount)}
                        </div>
                    </div>
                    <span
                        style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: '#eef6ff',
                            color: '#0b5ed7',
                            fontSize: 12,
                            fontWeight: 900,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {policyStatus}
                    </span>
                    <button
                        type="button"
                        onClick={saveRoundTrip}
                        disabled={!canSaveRoundTrip}
                        style={{
                            ...buttonStyle,
                            background: canSaveRoundTrip ? '#ff6b00' : '#cbd5e1',
                            color: canSaveRoundTrip ? '#fff' : '#64748b',
                            whiteSpace: 'nowrap',
                            width: isMobile ? '100%' : 'auto',
                        }}
                    >
                        {t('saveRoundTrip')}
                    </button>
                </>
            )
        }

        return (
            <>
                <div
                    style={{
                        flex: isMobile ? '1 1 100%' : '1 1 210px',
                        minWidth: isMobile ? 0 : 190,
                    }}
                >
                    <div
                        style={{
                            fontSize: ui.metaSize,
                            color: selectedOutbound ? '#166534' : '#64748b',
                            fontWeight: 900,
                        }}
                    >
                        {selectedOutbound
                            ? t('onwardSelected')
                            : t('onwardNotSelected')}
                    </div>
                    <div
                        style={{
                            color: '#334155',
                            fontSize: ui.metaSize,
                            marginTop: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: isMobile ? 'normal' : 'nowrap',
                        }}
                    >
                        {formatLegSelection(selectedOutbound)}
                    </div>
                </div>
                <div
                    style={{
                        flex: isMobile ? '1 1 100%' : '1 1 210px',
                        minWidth: isMobile ? 0 : 190,
                    }}
                >
                    <div
                        style={{
                            fontSize: ui.metaSize,
                            color: selectedReturn ? '#166534' : '#64748b',
                            fontWeight: 900,
                        }}
                    >
                        {selectedReturn
                            ? t('returnSelected')
                            : t('returnNotSelected')}
                    </div>
                    <div
                        style={{
                            color: '#334155',
                            fontSize: ui.metaSize,
                            marginTop: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: isMobile ? 'normal' : 'nowrap',
                        }}
                    >
                        {formatLegSelection(selectedReturn)}
                    </div>
                </div>
                <div style={{ minWidth: isMobile ? 0 : 130, flex: isMobile ? '1 1 45%' : undefined }}>
                    <div
                        style={{
                            fontSize: ui.metaSize,
                            color: '#64748b',
                            fontWeight: 900,
                        }}
                    >
                        {t('totalFare')}
                    </div>
                    <div
                        style={{
                            fontWeight: 900,
                            fontSize: ui.fareSize,
                            marginTop: 2,
                        }}
                    >
                        {formatMoney(totalAmount)}
                    </div>
                    <div
                        style={{
                            color: canSaveRoundTrip ? '#166534' : '#9a3412',
                            fontSize: ui.metaSize,
                            fontWeight: 800,
                        }}
                    >
                        {saveStateText}
                    </div>
                </div>
                <span
                    style={{
                        padding: '6px 10px',
                        borderRadius: 999,
                        background: '#eef6ff',
                        color: '#0b5ed7',
                        fontSize: 12,
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {policyStatus}
                </span>
                <button
                    type="button"
                    onClick={saveRoundTrip}
                    disabled={!canSaveRoundTrip}
                    style={{
                        ...buttonStyle,
                        background: canSaveRoundTrip ? '#ff6b00' : '#cbd5e1',
                        color: canSaveRoundTrip ? '#fff' : '#64748b',
                        whiteSpace: 'nowrap',
                        width: isMobile ? '100%' : 'auto',
                    }}
                >
                    {t('saveRoundTrip')}
                </button>
            </>
        )
    }

    function renderMultiCitySummary() {
        const isIntlPackage = getIsMultiCityInternational()
        const selectedPackage = getSelectedFlightAt(selectedMultiCityFlights, 0)
        const selectedCount = isIntlPackage
            ? selectedPackage
                ? 1
                : 0
            : Object.keys(selectedMultiCityFlights).length
        const totalAmount = isIntlPackage
            ? Number(selectedPackage?.totalFare || 0)
            : Object.values(selectedMultiCityFlights).reduce(
                  (sum, flight) => sum + Number(flight?.totalFare || 0),
                  0
              )
        const saveIssue = getMultiCitySaveIssue()
        const canSave = !saveIssue && !isLocked

        return (
            <>
                <div
                    style={{
                        flex: isMobile ? '1 1 100%' : '1 1 260px',
                        minWidth: isMobile ? 0 : 220,
                    }}
                >
                    <strong style={{ fontSize: ui.bodySize }}>
                        {isIntlPackage
                            ? selectedCount
                                ? '1 multi-city itinerary selected'
                                : 'Select a multi-city flight option'
                            : `${selectedCount} of ${multiCitySegments.length} stop flights selected`}
                    </strong>
                    <div
                        style={{
                            color: '#64748b',
                            fontSize: ui.metaSize,
                            marginTop: 3,
                        }}
                    >
                        {saveIssue || 'Ready to save multi-city itinerary'}
                    </div>
                </div>
                <div style={{ minWidth: isMobile ? 0 : 130 }}>
                    <div
                        style={{
                            fontSize: ui.metaSize,
                            color: '#64748b',
                            fontWeight: 900,
                        }}
                    >
                        {t('totalFare')}
                    </div>
                    <div
                        style={{
                            fontWeight: 900,
                            fontSize: ui.fareSize,
                            marginTop: 2,
                        }}
                    >
                        {formatMoney(totalAmount)}
                    </div>
                </div>
                <span
                    style={{
                        padding: '6px 10px',
                        borderRadius: 999,
                        background: '#eef6ff',
                        color: '#0b5ed7',
                        fontSize: 12,
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {currentPolicyInsight.policyStatus}
                </span>
                <button
                    type="button"
                    onClick={saveMultiCity}
                    disabled={!canSave}
                    style={{
                        ...buttonStyle,
                        background: canSave ? '#ff6b00' : '#cbd5e1',
                        color: canSave ? '#fff' : '#64748b',
                        whiteSpace: 'nowrap',
                        width: isMobile ? '100%' : 'auto',
                    }}
                >
                    {t('saveMultiCity')}
                </button>
            </>
        )
    }

    function renderWritebackStatus() {
        if (!writebackStatus) return null

        return (
            <div
                style={{
                    padding: '7px 10px',
                    borderRadius: 10,
                    background: writebackStatus.includes('saved')
                        ? '#f0fdf4'
                        : '#fff7ed',
                    border: writebackStatus.includes('saved')
                        ? '1px solid #bbf7d0'
                        : '1px solid #fed7aa',
                    color: writebackStatus.includes('saved')
                        ? '#166534'
                        : '#9a3412',
                    fontSize: 12,
                    fontWeight: 700,
                    maxWidth: 260,
                }}
            >
                {writebackStatus}
            </div>
        )
    }

    function renderBottomSelectionSummary() {
        if (tripType === 'multiCity' && options.length === 0) {
            return (
                <div
                    style={{
                        padding: '6px 10px',
                        color: '#64748b',
                        fontSize: 12,
                        fontWeight: 800,
                    }}
                >
                    Build your route and search flights.
                    {renderWritebackStatus()}
                </div>
            )
        }

        return (
            <div
                style={{
                    ...cardStyle,
                    padding: tripType === 'multiCity' ? 8 : ui.cardPad,
                    display: 'flex',
                    alignItems: isCompact ? 'stretch' : 'center',
                    gap: isMobile ? 8 : 12,
                    flexWrap: 'wrap',
                    flexDirection: isMobile ? 'column' : 'row',
                }}
            >
                {tripType === 'multiCity'
                    ? renderMultiCitySummary()
                    : tripType === 'roundTrip'
                      ? renderRoundTripSummary()
                      : renderOneWaySummary()}
                {renderWritebackStatus()}
            </div>
        )
    }

    function getRouteDisplay() {
        const fromCode = fromAirport?.code || t('from')
        const toCode = toAirport?.code || t('to')

        if (tripType === 'roundTrip') {
            return `${fromCode} → ${toCode} / ${toCode} → ${fromCode}`
        }

        if (tripType === 'multiCity') {
            return getMultiCityRouteSummary()
        }

        return `${fromCode} → ${toCode}`
    }

    function getVisibleOptionsSummary() {
        if (tripType === 'roundTrip') {
            if (getIsRoundTripInternational()) {
                return `${listedOptions.length} of ${options.length} options shown`
            }
            return `${listedOptions.length} of ${options.length} options shown · ${visibleOutboundOptions.length} onward · ${visibleReturnOptions.length} return`
        }

        if (tripType === 'multiCity') {
            if (getIsMultiCityInternational()) {
                return `${listedOptions.length} of ${options.length} options shown`
            }
            return `${visibleMultiCitySections.map((section) => `Stop ${section.index + 1}: ${section.options.length}`).join(' · ')} · ${listedOptions.length} of ${options.length} options shown`
        }

        if (listedOptions.length === options.length) {
            return t('optionsShown', { count: listedOptions.length })
        }

        return t('optionsShownFiltered', {
            visible: listedOptions.length,
            total: options.length,
        })
    }

    const swapButtonStyle = {
        ...buttonStyle,
        marginTop: isCompact ? 0 : ui.labelSize + 5,
        justifySelf: isMobile ? 'center' : 'auto',
        alignSelf: isMobile ? 'center' : 'start',
        width: isMobile ? 36 : isTablet ? 40 : 40,
        height: isMobile ? 36 : isTablet ? 40 : 40,
        minHeight: isCompact ? 36 : 40,
        padding: 0,
        borderRadius: isCompact ? 999 : ui.buttonRadius,
        background: '#eef6ff',
        color: '#0b5ed7',
        display: 'grid',
        placeItems: 'center',
        gridColumn: isMobile ? '1' : undefined,
        fontSize: 16,
        lineHeight: 1,
        boxSizing: 'border-box',
    }

    const dateFieldsStyle = isCompact
        ? {
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: ui.searchFieldGap,
              gridColumn: isTablet ? '1 / -1' : undefined,
          }
        : null

    return (
        <div style={shellStyle}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: isMobile ? 8 : 12,
                    alignItems: isMobile ? 'stretch' : 'center',
                    flexWrap: isCompact ? 'wrap' : 'nowrap',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? 8 : 10,
                        fontWeight: 900,
                        fontSize: ui.titleSize,
                        minWidth: 0,
                        flex: isMobile ? '1 1 100%' : undefined,
                    }}
                >
                    <div
                        style={{
                            width: ui.iconSize,
                            height: ui.iconSize,
                            borderRadius: ui.iconRadius,
                            background: '#eaf3ff',
                            color: '#0b5ed7',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: isMobile ? 13 : 16,
                            flexShrink: 0,
                        }}
                    >
                        ✈
                    </div>
                    <div>{t('searchFlights')}</div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: isMobile ? 'stretch' : 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                        flex: isMobile ? '1 1 100%' : undefined,
                        width: isMobile ? '100%' : 'auto',
                    }}
                >
                    <div
                        style={{
                            background: '#fff7ed',
                            border: '1px solid #fed7aa',
                            color: '#9a3412',
                            padding: ui.chipPad,
                            borderRadius: 999,
                            fontSize: ui.chipFont,
                            fontWeight: 700,
                            lineHeight: 1.3,
                            flex: isMobile ? '1 1 auto' : undefined,
                            minWidth: 0,
                        }}
                    >
                        {t('policyHeader')}
                    </div>
                    <select
                        value={languageDropdownValue}
                        onChange={(event) =>
                            handleLanguageChange(event.target.value)
                        }
                        style={{
                            ...inputStyle,
                            width: isMobile ? '100%' : isTablet ? 150 : 170,
                            minWidth: isMobile ? 0 : 140,
                            padding: ui.chipPad,
                            fontSize: ui.chipFont,
                            fontWeight: 800,
                            background: '#fff',
                        }}
                    >
                        <option value="" disabled>
                            {t('selectLanguage')}
                        </option>
                        {LANGUAGE_OPTIONS.map((language) => (
                            <option key={language.value} value={language.value}>
                                {language.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div
                style={{
                    ...cardStyle,
                    padding:
                        tripType === 'multiCity'
                            ? isMobile
                                ? 8
                                : 10
                            : ui.cardPad,
                }}
            >
                {renderUnderlineTabs({
                    tabs: [
                        { id: 'oneWay', label: t('oneWay') },
                        { id: 'roundTrip', label: t('roundTrip') },
                        { id: 'multiCity', label: t('multiCity') },
                    ],
                    activeId: tripType,
                    onChange: handleTripTypeChange,
                    disabled: isLocked,
                    style: {
                        marginBottom:
                            tripType === 'multiCity'
                                ? 8
                                : isMobile
                                  ? 10
                                  : 12,
                    },
                })}

                {tripType === 'multiCity' ? (
                    renderMultiCityBuilder()
                ) : (
                    <div style={searchFormGridStyle}>
                        <AirportInput
                            label={t('from')}
                            value={fromText}
                            hint={
                                fromAirport
                                    ? `${fromAirport.code} · ${fromAirport.name}`
                                    : t('selectAirport')
                            }
                            onChange={(value) => {
                                setFromText(value)
                                setFromAirport(null)
                                searchAirports(value, 'from')
                            }}
                            suggestions={fromSuggestions}
                            showSuggestions={showFromSuggestions}
                            onSelect={(airport) =>
                                selectAirport('from', airport)
                            }
                            inputStyle={inputStyle}
                            disabled={isLocked}
                            isMobile={isMobile}
                            labelSize={ui.labelSize}
                            hintSize={ui.hintSize}
                        />

                        <button
                            type="button"
                            onClick={swapAirports}
                            disabled={isLocked}
                            aria-label="Swap airports"
                            style={swapButtonStyle}
                        >
                            {tripType === 'roundTrip' ? '⇄' : '→'}
                        </button>

                        <AirportInput
                            label={t('to')}
                            value={toText}
                            hint={
                                toAirport
                                    ? `${toAirport.code} · ${toAirport.name}`
                                    : t('selectAirport')
                            }
                            onChange={(value) => {
                                setToText(value)
                                setToAirport(null)
                                searchAirports(value, 'to')
                            }}
                            suggestions={toSuggestions}
                            showSuggestions={showToSuggestions}
                            onSelect={(airport) => selectAirport('to', airport)}
                            inputStyle={inputStyle}
                            disabled={isLocked}
                            isMobile={isMobile}
                            labelSize={ui.labelSize}
                            hintSize={ui.hintSize}
                        />

                        {isCompact ? (
                            <>
                                <div style={dateFieldsStyle}>
                                    <Field
                                        label={t('departure')}
                                        labelSize={ui.labelSize}
                                    >
                                        <input
                                            value={depDate}
                                            type="date"
                                            onChange={(event) =>
                                                setDepDate(event.target.value)
                                            }
                                            style={inputStyle}
                                        />
                                    </Field>

                                    {tripType === 'roundTrip' ? (
                                        <Field
                                            label={t('return')}
                                            labelSize={ui.labelSize}
                                        >
                                            <input
                                                value={arrDate}
                                                type="date"
                                                onChange={(event) =>
                                                    setArrDate(
                                                        event.target.value
                                                    )
                                                }
                                                style={inputStyle}
                                            />
                                        </Field>
                                    ) : null}

                                    <Field
                                        label={t('class')}
                                        labelSize={ui.labelSize}
                                        style={
                                            tripType === 'roundTrip'
                                                ? { gridColumn: '1 / -1' }
                                                : undefined
                                        }
                                    >
                                        <select
                                            value={fareClass}
                                            onChange={(event) =>
                                                setFareClass(
                                                    event.target.value
                                                )
                                            }
                                            style={inputStyle}
                                        >
                                            <option>Economy</option>
                                            <option>PremiumEconomy</option>
                                            <option>Business</option>
                                            <option>First</option>
                                        </select>
                                    </Field>
                                </div>
                                <button
                                    type="button"
                                    onClick={searchFlights}
                                    disabled={isLocked || loading}
                                    style={{
                                        ...buttonStyle,
                                        marginTop: 0,
                                        background: '#ff6b00',
                                        color: '#fff',
                                        minHeight: isMobile ? 38 : 40,
                                        width: '100%',
                                        gridColumn: '1 / -1',
                                    }}
                                >
                                    {loading ? t('searching') : t('search')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Field
                                    label={t('departure')}
                                    labelSize={ui.labelSize}
                                >
                                    <input
                                        value={depDate}
                                        type="date"
                                        onChange={(event) =>
                                            setDepDate(event.target.value)
                                        }
                                        style={inputStyle}
                                    />
                                </Field>

                                {tripType === 'roundTrip' ? (
                                    <Field
                                        label={t('return')}
                                        labelSize={ui.labelSize}
                                    >
                                        <input
                                            value={arrDate}
                                            type="date"
                                            onChange={(event) =>
                                                setArrDate(event.target.value)
                                            }
                                            style={inputStyle}
                                        />
                                    </Field>
                                ) : null}

                                <Field
                                    label={t('class')}
                                    labelSize={ui.labelSize}
                                >
                                    <select
                                        value={fareClass}
                                        onChange={(event) =>
                                            setFareClass(event.target.value)
                                        }
                                        style={inputStyle}
                                    >
                                        <option>Economy</option>
                                        <option>PremiumEconomy</option>
                                        <option>Business</option>
                                        <option>First</option>
                                    </select>
                                </Field>
                            </>
                        )}

                        {isCompact ? null : (
                            <button
                                type="button"
                                onClick={searchFlights}
                                disabled={isLocked || loading}
                                style={{
                                    ...buttonStyle,
                                    marginTop: 22,
                                    background: '#ff6b00',
                                    color: '#fff',
                                    minHeight: 42,
                                }}
                            >
                                {loading ? t('searching') : t('search')}
                            </button>
                        )}
                    </div>
                )}

                {error ? (
                    <div
                        style={{
                            marginTop: 10,
                            color: '#b91c1c',
                            fontSize: ui.bodySize,
                            fontWeight: 700,
                        }}
                    >
                        {error}
                    </div>
                ) : (
                    <div
                        style={{
                            marginTop: 10,
                            color:
                                currentPolicyInsight.policyStatus === 'PASS'
                                    ? '#166534'
                                    : '#9a3412',
                            background:
                                currentPolicyInsight.policyStatus === 'PASS'
                                    ? '#f0fdf4'
                                    : '#fff7ed',
                            border:
                                currentPolicyInsight.policyStatus === 'PASS'
                                    ? '1px solid #bbf7d0'
                                    : '1px solid #fed7aa',
                            borderRadius: ui.inputRadius,
                            padding: isMobile
                                ? '6px 8px'
                                : tripType === 'multiCity'
                                  ? '6px 9px'
                                  : '8px 10px',
                            fontSize: ui.bodySize,
                            fontWeight: 700,
                            lineHeight: 1.35,
                        }}
                    >
                        {getPolicyInsightText(currentPolicyInsight)}
                    </div>
                )}
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: ui.filterSidebar,
                    gap: tripType === 'multiCity' ? 10 : isMobile ? 10 : 14,
                    flex: 1,
                    minHeight: 0,
                }}
            >
                <div
                    style={{
                        minHeight: 0,
                        overflowY: isCompact ? 'visible' : 'auto',
                    }}
                >
                    <div style={{ ...cardStyle, padding: ui.cardPad }}>
                        {isCompact ? (
                            <button
                                type="button"
                                onClick={() => setFiltersOpen((open) => !open)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 8,
                                    border: 0,
                                    background: 'transparent',
                                    padding: 0,
                                    cursor: 'pointer',
                                    marginBottom: filtersOpen ? 10 : 0,
                                }}
                            >
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: ui.sectionTitleSize,
                                    }}
                                >
                                    {t('filters')}
                                </h3>
                                <span
                                    style={{
                                        color: '#475569',
                                        fontSize: 14,
                                        fontWeight: 900,
                                    }}
                                >
                                    {filtersOpen ? '▴' : '▾'}
                                </span>
                            </button>
                        ) : (
                            <h3
                                style={{
                                    margin: '0 0 12px',
                                    fontSize: ui.sectionTitleSize,
                                }}
                            >
                                {t('filters')}
                            </h3>
                        )}

                        {!isCompact || filtersOpen ? (
                            <>
                                <FilterSection
                                    title={t('stops')}
                                    emptyText={t('loadStopFilters')}
                                    rows={stopRows}
                                    active={filters.stops}
                                    onChange={(value, checked) =>
                                        updateSetFilter(
                                            'stops',
                                            value,
                                            checked
                                        )
                                    }
                                    fontSize={ui.bodySize}
                                    compact={isCompact}
                                />

                                <div style={{ marginTop: isMobile ? 12 : 16 }}>
                                    <strong style={{ fontSize: ui.bodySize }}>
                                        {t('airlines')}
                                    </strong>
                                    {airlineRows.length === 0 ? (
                                        <div
                                            style={{
                                                color: '#94a3b8',
                                                fontSize: ui.bodySize,
                                                marginTop: 8,
                                            }}
                                        >
                                            {t('loadAirlineFilters')}
                                        </div>
                                    ) : airlineRows.length === 1 ? (
                                        <div
                                            style={{
                                                color: '#94a3b8',
                                                fontSize: ui.bodySize,
                                                marginTop: 8,
                                            }}
                                        >
                                            {t('onlyAirlineReturned', {
                                                airline: airlineRows[0].label,
                                            })}
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                display: isCompact
                                                    ? 'grid'
                                                    : 'block',
                                                gridTemplateColumns: isCompact
                                                    ? '1fr 1fr'
                                                    : undefined,
                                                gap: isCompact ? 4 : undefined,
                                            }}
                                        >
                                            {airlineRows.map((row) => (
                                                <label
                                                    key={row.value}
                                                    style={{
                                                        display: 'block',
                                                        marginTop: isCompact
                                                            ? 4
                                                            : 8,
                                                        fontSize: ui.bodySize,
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.airlines.has(
                                                            row.value
                                                        )}
                                                        onChange={(event) =>
                                                            updateSetFilter(
                                                                'airlines',
                                                                row.value,
                                                                event.target
                                                                    .checked
                                                            )
                                                        }
                                                    />{' '}
                                                    {row.label}{' '}
                                                    <span
                                                        style={{
                                                            color: '#64748b',
                                                        }}
                                                    >
                                                        ({row.count})
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>

                <div
                    style={{
                        minHeight: 0,
                        overflow: isCompact ? 'visible' : 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        style={{
                            ...cardStyle,
                            padding: tripType === 'multiCity' ? 9 : ui.cardPad,
                            marginBottom: tripType === 'multiCity' ? 8 : 10,
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 10,
                            alignItems: isCompact ? 'stretch' : 'center',
                            flexWrap: isCompact ? 'wrap' : 'nowrap',
                        }}
                    >
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                                style={{
                                    fontWeight: 900,
                                    fontSize: ui.bodySize,
                                }}
                            >
                                {getRouteDisplay()}
                            </div>
                            <div
                                style={{
                                    color: '#64748b',
                                    fontSize: ui.metaSize,
                                    marginTop: 2,
                                }}
                            >
                                {getVisibleOptionsSummary()} · INR ·{' '}
                                {sortMode === 'lowestFare'
                                    ? t('lowestFareFirstLower')
                                    : t('individualFlightsLower')}
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: 6,
                                flexWrap: 'wrap',
                                width: isMobile ? '100%' : 'auto',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setSortMode('individual')}
                                style={{
                                    ...buttonStyle,
                                    flex: isMobile ? 1 : undefined,
                                    padding: isMobile
                                        ? '7px 8px'
                                        : ui.buttonPad,
                                    fontSize: isMobile ? 11 : ui.buttonFont,
                                    background:
                                        sortMode === 'individual'
                                            ? '#0b63f6'
                                            : '#eef6ff',
                                    color:
                                        sortMode === 'individual'
                                            ? '#fff'
                                            : '#0b5ed7',
                                }}
                            >
                                {isMobile
                                    ? 'Individual'
                                    : t('individualFlights')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setSortMode('lowestFare')}
                                style={{
                                    ...buttonStyle,
                                    flex: isMobile ? 1 : undefined,
                                    padding: isMobile
                                        ? '7px 8px'
                                        : ui.buttonPad,
                                    fontSize: isMobile ? 11 : ui.buttonFont,
                                    background:
                                        sortMode === 'lowestFare'
                                            ? '#0b63f6'
                                            : '#eef6ff',
                                    color:
                                        sortMode === 'lowestFare'
                                            ? '#fff'
                                            : '#0b5ed7',
                                }}
                            >
                                {isMobile
                                    ? 'Lowest fare'
                                    : t('lowestFareFirst')}
                            </button>
                        </div>
                    </div>

                    {tripType === 'multiCity' ? (
                        <div
                            style={{
                                flex: 1,
                                minHeight: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                paddingRight: 2,
                            }}
                        >
                            {loading ? (
                                <StateMessage text={t('searchingFlights')} />
                            ) : visibleOptions.length === 0 ? (
                                <StateMessage
                                    text={
                                        options.length
                                            ? t('noFlightsMatch')
                                            : status ||
                                              t('searchFlightsInitial')
                                    }
                                />
                            ) : (
                                renderMultiCityResults()
                            )}
                        </div>
                    ) : tripType === 'roundTrip' ? (
                        <div
                            style={{
                                flex: 1,
                                minHeight: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                paddingRight: 2,
                            }}
                        >
                            {loading ? (
                                <StateMessage text={t('searchingFlights')} />
                            ) : visibleOptions.length === 0 ? (
                                <StateMessage
                                    text={
                                        options.length
                                            ? t('noFlightsMatch')
                                            : status ||
                                              t('searchFlightsInitial')
                                    }
                                />
                            ) : (
                                renderRoundTripResults()
                            )}
                        </div>
                    ) : (
                        <div
                            style={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: 'auto',
                                paddingRight: 4,
                            }}
                        >
                            {loading ? (
                                <StateMessage text={t('searchingFlights')} />
                            ) : visibleOptions.length === 0 ? (
                                <StateMessage
                                    text={
                                        options.length
                                            ? t('noFlightsMatch')
                                            : status ||
                                              t('searchFlightsInitial')
                                    }
                                />
                            ) : (
                                <>
                                    {paginateOptions(
                                        visibleOptions,
                                        resultsPage
                                    ).items.map((option) =>
                                        renderFlightOptionCard({
                                            option,
                                            isSelected: isSameFlight(
                                                option,
                                                selected?.flight
                                            ),
                                            buttonLabel: t('select'),
                                            selectedLabel: t('selected'),
                                            onSelect: () =>
                                                selectFlight(option),
                                        })
                                    )}
                                    {renderPaginationBar(
                                        paginateOptions(
                                            visibleOptions,
                                            resultsPage
                                        )
                                    )}
                                    {visibleOptions.length <=
                                    FLIGHTS_PAGE_SIZE
                                        ? renderStickyHint(
                                              visibleOptions.length
                                          )
                                        : null}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {renderBottomSelectionSummary()}
        </div>
    )
}

function Field({ label, children, labelSize = 11, style }) {
    return (
        <label
            style={{
                display: 'block',
                width: '100%',
                minWidth: 0,
                ...style,
            }}
        >
            {label ? (
                <div
                    style={{
                        fontSize: labelSize,
                        color: '#64748b',
                        fontWeight: 800,
                        marginBottom: 4,
                        letterSpacing: 0.2,
                    }}
                >
                    {label}
                </div>
            ) : null}
            <div style={{ width: '100%', minWidth: 0 }}>{children}</div>
        </label>
    )
}

function AirportInput({
    label,
    value,
    hint,
    onChange,
    suggestions,
    showSuggestions,
    onSelect,
    inputStyle,
    disabled,
    isMobile = false,
    labelSize = 11,
    hintSize = 11,
    hintStyle,
    hideHint = false,
}) {
    const suggestionTop = label ? (isMobile ? 54 : 62) : isMobile ? 38 : 40

    return (
        <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
            <Field label={label} labelSize={labelSize}>
                <input
                    value={value}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value)}
                    style={{ ...inputStyle, minWidth: 0 }}
                />
            </Field>
            {hideHint ? null : (
                <div
                    style={
                        hintStyle || {
                            color: '#64748b',
                            fontSize: hintSize,
                            marginTop: 3,
                            whiteSpace: isMobile ? 'normal' : 'nowrap',
                            overflowWrap: 'anywhere',
                            overflow: 'hidden',
                            textOverflow: isMobile ? 'clip' : 'ellipsis',
                            lineHeight: 1.3,
                        }
                    }
                >
                    {hint || '\u00A0'}
                </div>
            )}
            {showSuggestions && suggestions.length ? (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 20,
                        top: suggestionTop,
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: isMobile ? 10 : 12,
                        boxShadow: '0 12px 30px rgba(15,23,42,0.16)',
                        overflow: 'hidden',
                        maxHeight: isMobile ? 220 : 280,
                        overflowY: 'auto',
                    }}
                >
                    {suggestions.map((airport) => (
                        <button
                            key={`${airport.code}-${airport.name}`}
                            type="button"
                            onClick={() => onSelect(airport)}
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                border: 0,
                                background: '#fff',
                                padding: isMobile ? '8px 10px' : '10px 12px',
                                cursor: 'pointer',
                                fontSize: isMobile ? 12 : 14,
                            }}
                        >
                            <strong>
                                {airport.city || airport.name} ({airport.code})
                            </strong>
                            <div
                                style={{
                                    color: '#64748b',
                                    fontSize: isMobile ? 11 : 12,
                                }}
                            >
                                {airport.name} · {airport.country}
                            </div>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

function FilterSection({
    title,
    rows,
    active,
    onChange,
    emptyText,
    fontSize = 13,
    compact = false,
}) {
    return (
        <div style={{ marginTop: compact ? 0 : 16 }}>
            <strong style={{ fontSize }}>{title}</strong>
            {rows.length ? (
                <div
                    style={{
                        display: compact ? 'grid' : 'block',
                        gridTemplateColumns: compact ? '1fr 1fr' : undefined,
                        gap: compact ? 4 : undefined,
                    }}
                >
                    {rows.map((row) => (
                        <label
                            key={row.value}
                            style={{
                                display: 'block',
                                marginTop: compact ? 4 : 8,
                                fontSize,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={active.has(row.value)}
                                onChange={(event) =>
                                    onChange(row.value, event.target.checked)
                                }
                            />{' '}
                            {row.label}{' '}
                            <span style={{ color: '#64748b' }}>
                                ({row.count})
                            </span>
                        </label>
                    ))}
                </div>
            ) : (
                <div
                    style={{
                        color: '#94a3b8',
                        fontSize,
                        marginTop: 8,
                    }}
                >
                    {emptyText}
                </div>
            )}
        </div>
    )
}

function TimeBlock({
    time,
    code,
    airport,
    timeSize = 20,
    metaSize = 12,
    align = 'left',
    compact = false,
}) {
    const codeText = String(code || '').trim()
    const airportText = String(airport || '').trim()
    let meta = codeText

    if (!compact && airportText) {
        const airportLooksLikeCode =
            airportText.toUpperCase() === codeText.toUpperCase() ||
            airportText.toUpperCase().includes(codeText.toUpperCase())
        meta = airportLooksLikeCode
            ? codeText || airportText
            : codeText
              ? `${codeText} · ${airportText}`
              : airportText
    }

    return (
        <div style={{ textAlign: align, minWidth: 0 }}>
            <div
                style={{
                    fontSize: timeSize,
                    fontWeight: 900,
                    lineHeight: 1.1,
                }}
            >
                {time || '--:--'}
            </div>
            <div
                style={{
                    color: '#64748b',
                    fontSize: metaSize,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.25,
                    marginTop: 1,
                }}
            >
                {meta || '—'}
            </div>
        </div>
    )
}

function StateMessage({ text }) {
    return (
        <div
            style={{
                background: '#fff',
                border: '1px dashed #cbd5e1',
                borderRadius: 14,
                padding: 18,
                color: '#64748b',
                textAlign: 'center',
                fontSize: 13,
            }}
        >
            {text}
        </div>
    )
}

export default FormField
