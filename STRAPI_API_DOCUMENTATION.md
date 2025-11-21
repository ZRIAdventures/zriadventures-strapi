# ZRI Adventures - Strapi v5 Backend API Documentation

Complete API reference for frontend integration.

---

## Table of Contents
1. [API Collections](#api-collections)
2. [Reusable Components](#reusable-components)
3. [Enumeration Types](#enumeration-types)
4. [API Endpoints](#api-endpoints)
5. [Integration Notes](#integration-notes)

---

## API Collections

### 1. TOUR
**Endpoint:** `/api/tours`
**Description:** Multi-day tours with itineraries, accommodations, and comprehensive details

**Attributes:**
| Attribute | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| tourId | uid | No | - | Auto-generated |
| name | string | Yes | - | - |
| slug | uid | No | - | Target: name |
| tourType | enumeration | Yes | - | `Private Tour`, `Group Tour` |
| about | component | No | - | `experience.about` |
| tourSummary | component | Yes | - | `tour.tour-summary` |
| itinerary | component[] | No | - | `tour.itinerary-day` |
| highlights | component[] | No | - | `tour.highlight` |
| placesToSee | component[] | No | - | `tour.place-to-see` |
| travelMap | component | No | - | `tour.travel-map` |
| included | richtext | No | - | - |
| notIncluded | richtext | No | - | - |
| accommodationOptions | component[] | No | - | `tour.accommodation-option` |
| accommodationStays | component[] | No | - | `tour.accommodation-stay` |
| basePricePerPerson | component | No | - | `experience.rates` |
| paxPricing | component[] | No | - | `experience.pax-rates` |
| requiresAccommodation | boolean | No | true | - |
| customizable | boolean | No | true | - |
| startLocation | relation | No | - | → `location` (oneToOne) |
| endLocation | relation | No | - | → `location` (oneToOne) |
| trending | boolean | No | false | - |
| featured | boolean | No | false | - |
| upcomingGroupTourDates | json | No | - | - |
| images | media[] | No | - | images, videos |
| coverImage | media | No | - | images only |
| terms_and_condition | relation | No | - | → `terms-and-condition` (oneToOne) |
| faqs | relation[] | No | - | → `faq` (oneToMany) |
| relatedExperiences | relation[] | No | - | → `experience` (oneToMany) |
| cancellationPolicy | richtext | No | - | - |
| additionalInformation | component[] | No | - | `experience.requirements` |
| offer | integer | No | - | 0-100 (discount %) |
| voucher_templates | relation[] | No | - | → `voucher-template` (oneToMany) |
| seoMetadata | component | No | - | `common.seo-metadata` |
| reviews | relation[] | No | - | ← `review` (oneToMany) |
| rating | decimal | No | 0 | 0-5 |
| totalReviews | integer | No | 0 | - |
| ageRange | string | No | "12+" | - |
| minAge | integer | No | 12 | - |
| maxAge | integer | No | - | - |
| departureDates | component[] | No | - | `tour.departure-date` |
| promotionalOffers | component[] | No | - | `tour.promotional-offer` |
| bestSeller | boolean | No | false | - |
| newTour | boolean | No | false | - |
| instantConfirmation | boolean | No | false | - |
| guaranteedDeparture | boolean | No | false | - |
| customerPhotos | media[] | No | - | images only |
| videoUrl | string | No | - | - |
| pdfBrochure | media | No | - | files only |
| similarTours | relation[] | No | - | → `tour` (oneToMany) |
| includesFlight | boolean | No | false | - |
| includesInsurance | boolean | No | false | - |
| singleSupplement | component | No | - | `experience.rates` |
| depositRequired | component | No | - | `experience.rates` |
| bookingCutoff | integer | No | 7 | Days before departure |

---

### 2. EXPERIENCE
**Endpoint:** `/api/experiences`
**Description:** Day activities and experiences

**Attributes:**
| Attribute | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| experienceId | uid | No | - | Auto-generated |
| name | string | No | - | - |
| location | relation | No | - | → `location` (oneToOne) |
| about | component | No | - | `experience.about` |
| trending | boolean | No | - | - |
| offer | integer | No | - | Discount % |
| additionalInformation | component[] | No | - | `experience.requirements` |
| included | richtext | No | - | - |
| experience_categories | relation[] | No | - | → `experience-category` (oneToMany) |
| terms_and_condition | relation | No | - | → `terms-and-condition` (oneToOne) |
| faqs | relation[] | No | - | → `faq` (oneToMany) |
| extras | component[] | No | - | `experience.extras` |
| options | component[] | No | - | `experience.options` |
| bundle | boolean | No | false | - |
| voucher_templates | relation[] | No | - | → `voucher-template` (oneToMany) |
| images | media[] | No | - | All types |
| difficulty | enumeration | No | - | `Easy`, `Moderate`, `Hard`, `Challenging` |
| itinerary | component[] | No | - | `tour.itinerary-day` |
| highlights | component[] | No | - | `tour.highlight` |
| placesToSee | component[] | No | - | `tour.place-to-see` |
| travelMap | component | No | - | `tour.travel-map` |
| coordinates | component | No | - | `experience.coordinates` |
| mapEmbedUrl | text | No | - | - |
| notIncluded | richtext | No | - | - |
| seoMetadata | component | No | - | `common.seo-metadata` |
| reviews | relation[] | No | - | ← `review` (oneToMany) |
| rating | decimal | No | 0 | 0-5 |
| totalReviews | integer | No | 0 | - |
| customerPhotos | media[] | No | - | images only |
| videoUrl | string | No | - | - |
| bestSeller | boolean | No | false | - |
| instantConfirmation | boolean | No | false | - |
| minAge | integer | No | - | - |
| maxAge | integer | No | - | - |

---

### 3. TOUR-BOOKING
**Endpoint:** `/api/tour-bookings`
**Description:** Booking management for tours

**Attributes:**
| Attribute | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| bookingId | uid | Yes | - | Auto-generated |
| tour | relation | No | - | → `tour` (manyToOne) |
| departureDate | date | Yes | - | - |
| returnDate | date | Yes | - | - |
| bookingStatus | enumeration | No | "Pending" | See enums |
| paymentStatus | enumeration | No | "PENDING" | See enums |
| numberOfPax | integer | Yes | - | Min: 1 |
| adultsCount | integer | No | 0 | - |
| childrenCount | integer | No | 0 | - |
| infantsCount | integer | No | 0 | - |
| accommodationType | enumeration | No | - | See enums |
| roomType | enumeration | No | - | See enums |
| numberOfRooms | integer | No | 1 | - |
| singleSupplement | boolean | No | false | - |
| customerInfo | component | No | - | `tour.customer-info` |
| travelers | component[] | No | - | `tour.traveler-info` |
| totalAmount | decimal | Yes | - | - |
| depositAmount | decimal | No | - | - |
| amountPaid | decimal | No | 0 | - |
| currency | enumeration | No | "USD" | `USD`, `LKR` |
| paymentVendor | enumeration | No | - | See enums |
| specialRequests | text | No | - | - |
| dietaryRequirements | json | No | - | - |
| flightDetails | json | No | - | - |
| insuranceSelected | boolean | No | false | - |
| promoCode | string | No | - | - |
| discountApplied | decimal | No | 0 | - |
| bookingSource | enumeration | No | "Website" | See enums |
| confirmationEmailSent | boolean | No | false | - |
| vouchersSent | boolean | No | false | - |
| notes | text | No | - | - |
| emergencyContact | json | No | - | - |

---

### 4. REVIEW
**Endpoint:** `/api/reviews`
**Description:** Customer reviews and ratings

**Attributes:**
| Attribute | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| reviewerName | string | Yes | - | - |
| reviewerAvatar | media | No | - | images only |
| overallRating | decimal | Yes | - | 0-5 |
| ratings | component | No | - | `tour.detailed-ratings` |
| title | string | No | - | - |
| reviewText | text | Yes | - | - |
| tripDate | date | No | - | - |
| reviewDate | datetime | No | null | - |
| verified | boolean | No | false | - |
| tour | relation | No | - | → `tour` (manyToOne) |
| experience | relation | No | - | → `experience` (manyToOne) |
| customerPhotos | media[] | No | - | images, videos |
| helpful | integer | No | 0 | - |
| operatorResponse | component | No | - | `tour.operator-response` |
| travelStyle | string | No | - | - |
| featured | boolean | No | false | - |

---

### 5. EVENT
**Endpoint:** `/api/events`
**Description:** Special events

**Attributes:**
| Attribute | Type | Required | Default |
|-----------|------|----------|---------|
| eventId | uid | No | - |
| name | string | No | - |
| duration | component | No | `experience.duration` |
| location | relation | No | → `location` |
| included | richtext | No | - |
| cost | component | No | `experience.rates` |
| groupSize | integer | No | - |
| additionalInformation | component[] | No | `experience.requirements` |
| about | component | No | `experience.about` |
| startDate | date | No | - |
| endDate | date | No | - |
| faqs | relation[] | No | → `faq` |
| terms_and_condition | relation | No | → `terms-and-condition` |
| images | media[] | No | - |

---

### 6. LOCATION
**Endpoint:** `/api/locations`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| locationId | uid | No |
| name | string | No |
| coordinates | component | `experience.coordinates` |
| trending | boolean | No |
| description | text | No |
| googleMapsLink | string | No |
| image | media | No |

---

### 7. MERCHANDISE
**Endpoint:** `/api/merchandises`

**Attributes:**
| Attribute | Type | Required | Default |
|-----------|------|----------|---------|
| merchandiseId | uid | No | - |
| name | string | No | - |
| trending | boolean | No | - |
| offer | integer | No | - |
| merchandise_category | relation | No | → `merchandise-category` |
| shortDescription | text | No | - |
| features | richtext | No | - |
| description | richtext | No | - |
| additionalInformation | richtext | No | - |
| terms_and_condition | relation | No | → `terms-and-condition` |
| onlyRental | boolean | Yes | false |
| images | media[] | No | - |
| options | component | No | `merchandise.options` |

---

### 8. RENTAL
**Endpoint:** `/api/rentals`

**Attributes:**
| Attribute | Type |
|-----------|------|
| rentalId | uid |
| merchandise | relation → `merchandise` |
| options | component[] `rentals.rent-rates` |
| name | string |

---

### 9. VOUCHER
**Endpoint:** `/api/vouchers`

**Attributes:**
| Attribute | Type | Default |
|-----------|------|---------|
| couponCode | uid | - |
| type | enumeration | `CASH`, `PERCENTAGE`, `EXPERIENCE` |
| expiryDate | date | - |
| cash | component | `voucher.cash` |
| experience | json | - |
| info | json | - |
| voucherTemplate | json | - |
| email | string | - |
| percentageAmount | decimal | - |
| voucherStatus | enumeration | See enums |
| reusable | boolean | false |

---

### 10. V2-ORDER (Orders)
**Endpoint:** `/api/v2-orders`

**Attributes:**
| Attribute | Type | Required |
|-----------|------|----------|
| orderId | uid | Yes |
| firstName | string | No |
| lastName | string | No |
| contactNumber | string | No |
| email | email | No |
| items | json | No |
| paymentStatus | enumeration | No |
| nationality | string | No |
| paymentVendor | enumeration | No |
| totalAmount | float | No |
| amountPaid | float | No |
| currency | enumeration | No |
| addrLine1, addrLine2, city, postalCode | string | No |
| receiptSent | boolean | false |
| itemsData | json | No |

---

### Supporting Collections

**BANNER** `/api/banners`
- description (string)
- image (media)
- url (string)

**FAQ** `/api/faqs`
- question (string)
- answer (text)

**EXPERIENCE-CATEGORY** `/api/experience-categories`
- categoryId (uid)
- name (string)
- type (enum: water, land, air)

**MERCHANDISE-CATEGORY** `/api/merchandise-categories`
- categoryId (uid)
- name (string)

**TERMS-AND-CONDITION** `/api/terms-and-conditions`
- termsId (uid)
- type (string)
- terms (richtext)

**VOUCHER-TEMPLATE** `/api/voucher-templates`
- voucherId (uid)
- name (string)
- image (media)

---

## Reusable Components

### Core Components

#### experience.rates
**Used by:** 15+ components for pricing
```typescript
{
  USD: number;
  LKR: number;
}
```

#### experience.coordinates
```typescript
{
  latitude: number;
  longitude: number;
}
```

#### experience.duration
```typescript
{
  type: 'Minutes' | 'Hours' | 'Days';
  amount: number;
}
```

#### experience.about
```typescript
{
  shortDescription: string;
  longDesc: richtext;
}
```

#### common.seo-metadata
```typescript
{
  metaTitle: string;
  metaDescription: string;
  keywords: json;
  canonicalUrl: string;
  ogImage: media;
  googleProductCategory: string;
  gtin: string;
  brand: string; // default: "ZRI Adventures"
  availability: 'in stock' | 'out of stock' | 'preorder' | 'backorder';
  condition: 'new' | 'refurbished' | 'used';
}
```

---

### Tour Components

#### tour.tour-summary (Required for tours)
```typescript
{
  duration: string; // e.g., "7 Days / 6 Nights"
  theme: 'Adventure' | 'Cultural' | 'Wildlife' | 'Beach & Relaxation' |
         'Hiking & Trekking' | 'Photography' | 'Culinary' | 'Spiritual' |
         'Multi-Activity' | 'Honeymoon' | 'Family';
  intensity: 'Relaxed' | 'Light' | 'Moderate' | 'Active' | 'Challenging' | 'Extreme';
  fullyGuided: boolean; // default: true
  guideLanguages: json; // default: ["English"]
  minAge: number;
  maxGroupSize: number;
  minGroupSize: number; // default: 1
  fitnessLevel: 'No Fitness Required' | 'Low' | 'Moderate' | 'High' | 'Very High';
}
```

#### tour.itinerary-day
```typescript
{
  dayNumber: number; // required
  title: string; // required
  description: richtext; // required
  activities: tour.activity[]; // repeatable
  meals: 'Breakfast' | 'Lunch' | 'Dinner' | 'Breakfast & Lunch' |
         'Breakfast & Dinner' | 'Lunch & Dinner' | 'All Meals' | 'None';
  accommodation: string;
  images: media[];
}
```

#### tour.activity
```typescript
{
  name: string; // required
  description: string;
  duration: string;
  included: boolean; // default: true
  isAddon: boolean; // default: false
  addonCost: experience.rates;
  relatedExperience: relation → experience;
}
```

#### tour.highlight
```typescript
{
  title: string; // required
  description: string;
  icon: string;
  image: media;
}
```

#### tour.place-to-see
```typescript
{
  name: string; // required
  description: string;
  location: relation → location;
  coordinates: experience.coordinates;
  image: media; // required
  orderInTour: number; // default: 1
  timeSpent: string;
}
```

#### tour.accommodation-option
```typescript
{
  starRating: 'Not Required' | 'Star Three' | 'Star Four' | 'Star Five'; // required
  description: string;
  roomTypes: tour.room-type-pricing[]; // repeatable
  includedAmenities: json;
  priceIncrement: experience.rates;
}
```

#### tour.room-type-pricing
```typescript
{
  roomType: 'Single Room (1 Person - DB basis)' | 'Double Room (2 Persons - DB)' |
            'Triple Room (3 Persons - 2 DB)' | 'Quad Room (4 Persons - 2 DB)'; // required
  numberOfBeds: number; // required, default: 1
  maxOccupancy: number; // required
  pricePerPerson: experience.rates;
  totalRoomPrice: experience.rates;
  description: string;
}
```

#### tour.accommodation-stay
```typescript
{
  hotelName: string; // required
  starRating: 'Star Three' | 'Star Four' | 'Star Five' | 'Boutique' | 'Guesthouse';
  location: relation → location;
  description: richtext;
  amenities: json;
  images: media[];
  website: string;
  numberOfNights: number;
  checkInDay: number;
}
```

#### tour.departure-date
```typescript
{
  startDate: date; // required
  endDate: date; // required
  price: experience.rates;
  originalPrice: experience.rates;
  discountPercentage: number; // 0-100
  availability: 'Available' | 'Filling Fast' | 'Almost Sold Out' |
                'Sold Out' | 'Departure on Request';
  guaranteedDeparture: boolean; // default: false
  instantConfirmation: boolean; // default: false
  spotsRemaining: number;
  minGroupSize: number;
  maxGroupSize: number;
  currentBookings: number; // default: 0
  language: string; // default: "English"
  specialOffer: string;
  holdSpaceHours: number;
  bookingDeadline: date;
}
```

#### tour.promotional-offer
```typescript
{
  offerName: string; // required
  offerType: 'Black Friday' | 'Cyber Monday' | 'Early Bird' | 'Last Minute' |
             'Seasonal' | 'Flash Sale' | 'Year End' | 'New Year' |
             'Summer Sale' | 'Winter Sale' | 'Limited Time'; // required
  discountPercentage: number; // 0-100
  discountAmount: experience.rates;
  startDate: datetime; // required
  endDate: datetime; // required
  promoCode: string;
  description: richtext;
  termsAndConditions: richtext;
  badge: media;
  isActive: boolean; // default: true
  applicableToAllTours: boolean; // default: false
  minimumBookingValue: experience.rates;
  maxRedemptions: number;
  currentRedemptions: number; // default: 0
}
```

#### tour.travel-map
```typescript
{
  mapTitle: string;
  mapProvider: 'Google Maps' | 'OpenStreetMap' | 'Mapbox'; // default: "Google Maps"
  embedUrl: string;
  waypoints: experience.coordinates[]; // repeatable
  centerCoordinates: experience.coordinates;
  zoomLevel: number; // default: 8
}
```

#### tour.detailed-ratings
```typescript
{
  itinerary: number; // 0-5
  guide: number; // 0-5
  transport: number; // 0-5
  accommodation: number; // 0-5
  food: number; // 0-5
  valueForMoney: number; // 0-5
}
```

#### tour.customer-info
```typescript
{
  firstName: string; // required
  lastName: string; // required
  email: string; // required
  phone: string; // required
  nationality: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  passportNumber: string;
  passportExpiry: date;
}
```

#### tour.traveler-info
```typescript
{
  firstName: string; // required
  lastName: string; // required
  dateOfBirth: date;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  ageCategory: 'Adult' | 'Child' | 'Infant'; // default: "Adult"
  nationality: string;
  passportNumber: string;
  passportExpiry: date;
  dietaryRequirements: string;
  medicalConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}
```

#### tour.operator-response
```typescript
{
  responseText: string; // required
  responseDate: datetime;
  respondedBy: string;
}
```

---

### Experience Components

#### experience.pax-rates
```typescript
{
  minPax: number;
  maxPax: number;
  rates: experience.rates;
}
```

#### experience.options
```typescript
{
  duration: experience.duration;
  paxRates: experience.pax-rates[]; // repeatable
  childCostReduction: experience.rates;
}
```

#### experience.extras
```typescript
{
  extrasId: string;
  name: string;
  cost: experience.rates;
}
```

#### experience.requirements
```typescript
{
  name: string;
  description: string;
}
```

---

### Other Components

#### merchandise.options
```typescript
{
  type: string;
  option: merchandise.merch-option[]; // repeatable
}
```

#### merchandise.merch-option
```typescript
{
  optionId: string;
  name: string;
  cost: experience.rates;
}
```

#### rentals.rent-rates
```typescript
{
  duration: 'days-1' | 'days-3' | 'days-7';
  cost: experience.rates;
}
```

#### voucher.cash
```typescript
{
  amount: number;
  currency: 'LKR' | 'USD';
}
```

---

## Enumeration Types

### Booking & Payment

**Booking Status:**
- `Pending` → `Confirmed` → `Completed`
- `Pending` → `Hold`
- `Pending` → `Cancelled`

**Payment Status:**
- `PENDING` → `DEPOSIT_PAID` → `FULLY_PAID`
- `PENDING` → `FAILED`
- `FULLY_PAID` → `REFUNDED`

**Payment Vendors:**
`PAYHERE`, `BANK`, `KOKO`, `MINTPAY`, `GENIE`, `STRIPE`

**Booking Sources:**
`Website`, `Mobile App`, `Phone`, `Email`, `Walk-in`

**Currencies:**
`USD`, `LKR`

---

### Tour Related

**Tour Types:**
`Private Tour`, `Group Tour`

**Room Types:**
- `Single Room (1 Person - DB basis)`
- `Double Room (2 Persons - DB)`
- `Triple Room (3 Persons - 2 DB)`
- `Quad Room (4 Persons - 2 DB)`

**Accommodation Stars:**
`Not Required`, `Star Three`, `Star Four`, `Star Five`, `Boutique`, `Guesthouse`

**Tour Themes:**
`Adventure`, `Cultural`, `Wildlife`, `Beach & Relaxation`, `Hiking & Trekking`, `Photography`, `Culinary`, `Spiritual`, `Multi-Activity`, `Honeymoon`, `Family`

**Intensity Levels:**
`Relaxed`, `Light`, `Moderate`, `Active`, `Challenging`, `Extreme`

**Fitness Levels:**
`No Fitness Required`, `Low`, `Moderate`, `High`, `Very High`

**Availability Status:**
`Available`, `Filling Fast`, `Almost Sold Out`, `Sold Out`, `Departure on Request`

**Meal Options:**
`Breakfast`, `Lunch`, `Dinner`, `Breakfast & Lunch`, `Breakfast & Dinner`, `Lunch & Dinner`, `All Meals`, `None`

---

### Experience Related

**Difficulty:**
`Easy`, `Moderate`, `Hard`, `Challenging`

**Category Types:**
`water`, `land`, `air`

---

### Promotional Offers

**Offer Types:**
`Black Friday`, `Cyber Monday`, `Early Bird`, `Last Minute`, `Seasonal`, `Flash Sale`, `Year End`, `New Year`, `Summer Sale`, `Winter Sale`, `Limited Time`

---

### Voucher Status

`AVAILABLE`, `CLAIMED`, `EXPIRED`, `UNPAID`

**Voucher Types:**
`CASH`, `PERCENTAGE`, `EXPERIENCE`

---

### Other

**Duration Types:**
`Minutes`, `Hours`, `Days`

**Rental Duration:**
`days-1`, `days-3`, `days-7`

**Gender:**
`Male`, `Female`, `Other`, `Prefer not to say`

**Age Category:**
`Adult`, `Child`, `Infant`

**Map Providers:**
`Google Maps`, `OpenStreetMap`, `Mapbox`

---

## API Endpoints

### Base URL
All endpoints are prefixed with `/api/`

### Main Collections

```
GET/POST   /api/tours
GET/PUT/DEL /api/tours/:id

GET/POST   /api/experiences
GET/PUT/DEL /api/experiences/:id

GET/POST   /api/tour-bookings
GET/PUT/DEL /api/tour-bookings/:id

GET/POST   /api/reviews
GET/PUT/DEL /api/reviews/:id

GET/POST   /api/events
GET/PUT/DEL /api/events/:id

GET/POST   /api/locations
GET/PUT/DEL /api/locations/:id

GET/POST   /api/merchandises
GET/PUT/DEL /api/merchandises/:id

GET/POST   /api/rentals
GET/PUT/DEL /api/rentals/:id

GET/POST   /api/vouchers
GET/PUT/DEL /api/vouchers/:id

GET/POST   /api/v2-orders
GET/PUT/DEL /api/v2-orders/:id
```

### Supporting Collections

```
GET/POST   /api/banners
GET/POST   /api/faqs
GET/POST   /api/experience-categories
GET/POST   /api/merchandise-categories
GET/POST   /api/terms-and-conditions
GET/POST   /api/voucher-templates
```

---

## Integration Notes

### Populate Examples

```javascript
// Get tour with all relations
GET /api/tours?populate=*

// Get tour with specific fields
GET /api/tours?populate[tourSummary]=*&populate[highlights]=*&populate[itinerary][populate]=*

// Get tour with nested populations
GET /api/tours?populate[accommodationOptions][populate][roomTypes]=*

// Get tours with reviews populated
GET /api/tours?populate[reviews][populate][ratings]=*
```

### Filtering Examples

```javascript
// Featured tours
GET /api/tours?filters[featured][$eq]=true

// Trending experiences
GET /api/experiences?filters[trending][$eq]=true

// Verified reviews
GET /api/reviews?filters[verified][$eq]=true

// Available vouchers
GET /api/vouchers?filters[voucherStatus][$eq]=AVAILABLE

// Tours by type
GET /api/tours?filters[tourType][$eq]=Private Tour

// Experiences by difficulty
GET /api/experiences?filters[difficulty][$eq]=Easy

// Confirmed bookings
GET /api/tour-bookings?filters[bookingStatus][$eq]=Confirmed
```

### Sorting Examples

```javascript
// Sort by rating descending
GET /api/tours?sort=rating:desc

// Sort by name
GET /api/experiences?sort=name:asc

// Multiple sorts
GET /api/reviews?sort[0]=featured:desc&sort[1]=overallRating:desc
```

### Pagination

```javascript
// Default pagination
GET /api/tours?pagination[page]=1&pagination[pageSize]=10

// Get all (use carefully)
GET /api/locations?pagination[limit]=-1
```

---

### Required Fields Summary

**Creating a Tour:**
- `name` (required)
- `tourType` (required)
- `tourSummary` (required)

**Creating a Tour Booking:**
- `bookingId` (auto-generated)
- `departureDate` (required)
- `returnDate` (required)
- `numberOfPax` (required, min: 1)
- `totalAmount` (required)

**Creating a Review:**
- `reviewerName` (required)
- `overallRating` (required, 0-5)
- `reviewText` (required)

---

### Workflow States

**Tour Booking Workflow:**
```
Pending → Confirmed → Completed
      ↘ Hold
      ↘ Cancelled
```

**Payment Workflow:**
```
PENDING → DEPOSIT_PAID → FULLY_PAID
      ↘ FAILED
      ↘ REFUNDED
```

**Voucher Lifecycle:**
```
UNPAID → AVAILABLE → CLAIMED
                  ↘ EXPIRED
```

---

### Media Handling

All media fields return objects with:
```typescript
{
  id: number;
  url: string;
  alternativeText: string;
  caption: string;
  width: number;
  height: number;
  formats: {
    thumbnail: { url, width, height };
    small: { url, width, height };
    medium: { url, width, height };
    large: { url, width, height };
  }
}
```

---

### TypeScript Type Hints

```typescript
// Currency rates object
interface Rates {
  USD: number;
  LKR: number;
}

// Coordinates
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Common date types
type ISODate = string; // "2024-12-25"
type ISODateTime = string; // "2024-12-25T10:30:00.000Z"

// Rating constraint
type Rating = number; // 0-5, decimal

// Percentage constraint
type Percentage = number; // 0-100
```

---

## Component Dependency Tree

```
experience.rates (CORE)
├── Used by 15+ pricing components
└── Base for all currency calculations

experience.coordinates (CORE)
├── tour.travel-map (waypoints, center)
├── tour.place-to-see
├── experience
└── location

tour.itinerary-day
├── tour.activity (nested)
├── tour (itinerary)
└── experience (itinerary)

tour.accommodation-option
└── tour.room-type-pricing (nested)

experience.options
├── experience.duration (nested)
└── experience.pax-rates (nested)
```

---

## Notes for Frontend Integration

1. **Draft & Publish:** All collections have draft/publish enabled. Filter with `?publicationState=live` for published content only.

2. **Localization:** Not currently enabled, but can be added if needed.

3. **Richtext Fields:** Return HTML content - use appropriate sanitization.

4. **JSON Fields:** Used for flexible data (languages, amenities, etc.) - parse appropriately.

5. **UID Fields:** Auto-generated unique identifiers, useful for URLs.

6. **Media URLs:** Relative to Strapi server - prepend base URL.

7. **Component Arrays:** Always check for null/empty arrays.

8. **Relations:** Require explicit population to retrieve.

---

*Generated: 2024*
*Strapi Version: v5*
