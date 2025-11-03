import type { Schema, Struct } from '@strapi/strapi';

export interface CommonImages extends Struct.ComponentSchema {
  collectionName: 'components_common_images';
  info: {
    displayName: 'images';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String;
    src: Schema.Attribute.String;
  };
}

export interface CommonSeoMetadata extends Struct.ComponentSchema {
  collectionName: 'components_common_seo_metadata';
  info: {
    description: 'SEO and Google Merchant metadata';
    displayName: 'SEO Metadata';
    icon: 'search';
  };
  attributes: {
    availability: Schema.Attribute.Enumeration<
      ['in stock', 'out of stock', 'preorder', 'backorder']
    > &
      Schema.Attribute.DefaultTo<'in stock'>;
    brand: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'ZRI Adventures'>;
    canonicalUrl: Schema.Attribute.String;
    condition: Schema.Attribute.Enumeration<['new', 'refurbished', 'used']> &
      Schema.Attribute.DefaultTo<'new'>;
    googleProductCategory: Schema.Attribute.String;
    gtin: Schema.Attribute.String;
    keywords: Schema.Attribute.JSON;
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
    ogImage: Schema.Attribute.Media<'images'>;
  };
}

export interface ExperienceAbout extends Struct.ComponentSchema {
  collectionName: 'components_experience_abouts';
  info: {
    description: '';
    displayName: 'about';
    icon: 'book';
  };
  attributes: {
    longDesc: Schema.Attribute.RichText;
    shortDescription: Schema.Attribute.Text;
  };
}

export interface ExperienceCoordinates extends Struct.ComponentSchema {
  collectionName: 'components_experience_coordinates';
  info: {
    displayName: 'coordinates';
    icon: 'pinMap';
  };
  attributes: {
    latitude: Schema.Attribute.Float;
    longitude: Schema.Attribute.Float;
  };
}

export interface ExperienceDuration extends Struct.ComponentSchema {
  collectionName: 'components_experience_durations';
  info: {
    description: '';
    displayName: 'duration';
    icon: 'clock';
  };
  attributes: {
    amount: Schema.Attribute.Integer;
    type: Schema.Attribute.Enumeration<['Minutes', 'Hours', 'Days']>;
  };
}

export interface ExperienceDurationRates extends Struct.ComponentSchema {
  collectionName: 'components_experience_duration_rates';
  info: {
    displayName: 'durationRates';
    icon: 'priceTag';
  };
  attributes: {
    duration: Schema.Attribute.Component<'experience.duration', false>;
    rates: Schema.Attribute.Component<'experience.rates', false>;
  };
}

export interface ExperienceExtras extends Struct.ComponentSchema {
  collectionName: 'components_experience_extras';
  info: {
    displayName: 'extras';
    icon: 'chartBubble';
  };
  attributes: {
    cost: Schema.Attribute.Component<'experience.rates', false>;
    extrasId: Schema.Attribute.String;
    name: Schema.Attribute.String;
  };
}

export interface ExperienceOptions extends Struct.ComponentSchema {
  collectionName: 'components_experience_options';
  info: {
    description: '';
    displayName: 'options';
    icon: 'bulletList';
  };
  attributes: {
    childCostReduction: Schema.Attribute.Component<'experience.rates', false>;
    duration: Schema.Attribute.Component<'experience.duration', false>;
    paxRates: Schema.Attribute.Component<'experience.pax-rates', true>;
  };
}

export interface ExperiencePaxRates extends Struct.ComponentSchema {
  collectionName: 'components_experience_pax_rates';
  info: {
    description: '';
    displayName: 'paxRates';
    icon: 'priceTag';
  };
  attributes: {
    maxPax: Schema.Attribute.Integer;
    minPax: Schema.Attribute.Integer;
    rates: Schema.Attribute.Component<'experience.rates', false>;
  };
}

export interface ExperienceRates extends Struct.ComponentSchema {
  collectionName: 'components_rates_rates';
  info: {
    description: '';
    displayName: 'rates';
    icon: 'stack';
  };
  attributes: {
    LKR: Schema.Attribute.Integer;
    USD: Schema.Attribute.Integer;
  };
}

export interface ExperienceRequirements extends Struct.ComponentSchema {
  collectionName: 'components_experience_requirements';
  info: {
    displayName: 'requirements';
    icon: 'archive';
  };
  attributes: {
    description: Schema.Attribute.Text;
    name: Schema.Attribute.String;
  };
}

export interface MerchandiseMerchOption extends Struct.ComponentSchema {
  collectionName: 'components_merchandise_merch_options';
  info: {
    displayName: 'MerchOption';
  };
  attributes: {
    cost: Schema.Attribute.Component<'experience.rates', false>;
    name: Schema.Attribute.String;
    optionId: Schema.Attribute.String;
  };
}

export interface MerchandiseOptions extends Struct.ComponentSchema {
  collectionName: 'components_merchandise_options';
  info: {
    displayName: 'Options';
  };
  attributes: {
    option: Schema.Attribute.Component<'merchandise.merch-option', true>;
    type: Schema.Attribute.String;
  };
}

export interface RentalsRentRates extends Struct.ComponentSchema {
  collectionName: 'components_rentals_rent_rates';
  info: {
    displayName: 'RentRates';
    icon: 'archive';
  };
  attributes: {
    cost: Schema.Attribute.Component<'experience.rates', false>;
    duration: Schema.Attribute.Enumeration<['days-1', 'days-3', 'days-7']>;
  };
}

export interface TourAccommodationOption extends Struct.ComponentSchema {
  collectionName: 'components_tour_accommodation_options';
  info: {
    description: 'Accommodation tier for tour bookings (3-star, 4-star, 5-star)';
    displayName: 'Accommodation Option';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text;
    includedAmenities: Schema.Attribute.JSON;
    priceIncrement: Schema.Attribute.Component<'experience.rates', false>;
    roomTypes: Schema.Attribute.Component<'tour.room-type-pricing', true>;
    starRating: Schema.Attribute.Enumeration<
      ['Not Required', 'Star Three', 'Star Four', 'Star Five']
    > &
      Schema.Attribute.Required;
  };
}

export interface TourAccommodationStay extends Struct.ComponentSchema {
  collectionName: 'components_tour_accommodation_stays';
  info: {
    description: 'Details about where guests will stay during the tour';
    displayName: 'Accommodation Stay';
    icon: 'building';
  };
  attributes: {
    amenities: Schema.Attribute.JSON;
    checkInDay: Schema.Attribute.Integer;
    description: Schema.Attribute.RichText;
    hotelName: Schema.Attribute.String & Schema.Attribute.Required;
    images: Schema.Attribute.Media<'images', true>;
    location: Schema.Attribute.Relation<'oneToOne', 'api::location.location'>;
    numberOfNights: Schema.Attribute.Integer;
    starRating: Schema.Attribute.Enumeration<
      ['Star Three', 'Star Four', 'Star Five', 'Boutique', 'Guesthouse']
    >;
    website: Schema.Attribute.String;
  };
}

export interface TourActivity extends Struct.ComponentSchema {
  collectionName: 'components_tour_activities';
  info: {
    description: 'Individual activity within a day';
    displayName: 'Activity';
    icon: 'play';
  };
  attributes: {
    addonCost: Schema.Attribute.Component<'experience.rates', false>;
    description: Schema.Attribute.Text;
    duration: Schema.Attribute.String;
    included: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    isAddon: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    relatedExperience: Schema.Attribute.Relation<
      'oneToOne',
      'api::experience.experience'
    >;
  };
}

export interface TourCertification extends Struct.ComponentSchema {
  collectionName: 'components_tour_certifications';
  info: {
    description: 'Operator certifications and badges';
    displayName: 'Certification';
    icon: 'shield';
  };
  attributes: {
    badge: Schema.Attribute.Media<'images'>;
    description: Schema.Attribute.Text;
    expiryDate: Schema.Attribute.Date;
    issueDate: Schema.Attribute.Date;
    issuedBy: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    verificationUrl: Schema.Attribute.String;
  };
}

export interface TourCustomerInfo extends Struct.ComponentSchema {
  collectionName: 'components_tour_customer_info';
  info: {
    description: 'Primary customer contact information';
    displayName: 'Customer Info';
    icon: 'user';
  };
  attributes: {
    address: Schema.Attribute.Text;
    city: Schema.Attribute.String;
    country: Schema.Attribute.String;
    email: Schema.Attribute.Email & Schema.Attribute.Required;
    firstName: Schema.Attribute.String & Schema.Attribute.Required;
    lastName: Schema.Attribute.String & Schema.Attribute.Required;
    nationality: Schema.Attribute.String;
    passportExpiry: Schema.Attribute.Date;
    passportNumber: Schema.Attribute.String;
    phone: Schema.Attribute.String & Schema.Attribute.Required;
    postalCode: Schema.Attribute.String;
  };
}

export interface TourDepartureDate extends Struct.ComponentSchema {
  collectionName: 'components_tour_departure_dates';
  info: {
    description: 'Tour departure dates with availability and pricing';
    displayName: 'Departure Date';
    icon: 'calendar';
  };
  attributes: {
    availability: Schema.Attribute.Enumeration<
      [
        'Available',
        'Filling Fast',
        'Almost Sold Out',
        'Sold Out',
        'Departure on Request',
      ]
    > &
      Schema.Attribute.DefaultTo<'Available'>;
    bookingDeadline: Schema.Attribute.Date;
    currentBookings: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    discountPercentage: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    endDate: Schema.Attribute.Date & Schema.Attribute.Required;
    guaranteedDeparture: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    holdSpaceHours: Schema.Attribute.Integer;
    instantConfirmation: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    language: Schema.Attribute.String & Schema.Attribute.DefaultTo<'English'>;
    maxGroupSize: Schema.Attribute.Integer;
    minGroupSize: Schema.Attribute.Integer;
    originalPrice: Schema.Attribute.Component<'experience.rates', false>;
    price: Schema.Attribute.Component<'experience.rates', false>;
    specialOffer: Schema.Attribute.String;
    spotsRemaining: Schema.Attribute.Integer;
    startDate: Schema.Attribute.Date & Schema.Attribute.Required;
  };
}

export interface TourDetailedRatings extends Struct.ComponentSchema {
  collectionName: 'components_tour_detailed_ratings';
  info: {
    description: 'Breakdown of ratings by category';
    displayName: 'Detailed Ratings';
    icon: 'star';
  };
  attributes: {
    accommodation: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      >;
    food: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      >;
    guide: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      >;
    itinerary: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      >;
    transport: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      >;
    valueForMoney: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      >;
  };
}

export interface TourHighlight extends Struct.ComponentSchema {
  collectionName: 'components_tour_highlights';
  info: {
    description: 'Key highlight or feature of tour/experience';
    displayName: 'Highlight';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface TourItineraryDay extends Struct.ComponentSchema {
  collectionName: 'components_tour_itinerary_days';
  info: {
    description: 'Daily itinerary with activities and details';
    displayName: 'Itinerary Day';
    icon: 'calendar';
  };
  attributes: {
    accommodation: Schema.Attribute.String;
    activities: Schema.Attribute.Component<'tour.activity', true>;
    dayNumber: Schema.Attribute.Integer & Schema.Attribute.Required;
    description: Schema.Attribute.RichText & Schema.Attribute.Required;
    images: Schema.Attribute.Media<'images', true>;
    meals: Schema.Attribute.Enumeration<
      [
        'Breakfast',
        'Lunch',
        'Dinner',
        'Breakfast & Lunch',
        'Breakfast & Dinner',
        'Lunch & Dinner',
        'All Meals',
        'None',
      ]
    > &
      Schema.Attribute.DefaultTo<'None'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface TourOperatorResponse extends Struct.ComponentSchema {
  collectionName: 'components_tour_operator_responses';
  info: {
    description: 'Tour operator response to customer review';
    displayName: 'Operator Response';
    icon: 'message';
  };
  attributes: {
    respondedBy: Schema.Attribute.String;
    responseDate: Schema.Attribute.DateTime;
    responseText: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface TourPlaceToSee extends Struct.ComponentSchema {
  collectionName: 'components_tour_places_to_see';
  info: {
    description: 'Location with image and details for tour stops';
    displayName: 'Place to See';
    icon: 'landscape';
  };
  attributes: {
    coordinates: Schema.Attribute.Component<'experience.coordinates', false>;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    location: Schema.Attribute.Relation<'oneToOne', 'api::location.location'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    orderInTour: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    timeSpent: Schema.Attribute.String;
  };
}

export interface TourPromotionalOffer extends Struct.ComponentSchema {
  collectionName: 'components_tour_promotional_offers';
  info: {
    description: 'Special offers and promotional campaigns';
    displayName: 'Promotional Offer';
    icon: 'percent';
  };
  attributes: {
    applicableToAllTours: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    badge: Schema.Attribute.Media<'images'>;
    currentRedemptions: Schema.Attribute.Integer &
      Schema.Attribute.DefaultTo<0>;
    description: Schema.Attribute.RichText;
    discountAmount: Schema.Attribute.Component<'experience.rates', false>;
    discountPercentage: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    endDate: Schema.Attribute.DateTime & Schema.Attribute.Required;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    maxRedemptions: Schema.Attribute.Integer;
    minimumBookingValue: Schema.Attribute.Component<'experience.rates', false>;
    offerName: Schema.Attribute.String & Schema.Attribute.Required;
    offerType: Schema.Attribute.Enumeration<
      [
        'Black Friday',
        'Cyber Monday',
        'Early Bird',
        'Last Minute',
        'Seasonal',
        'Flash Sale',
        'Year End',
        'New Year',
        'Summer Sale',
        'Winter Sale',
        'Limited Time',
      ]
    > &
      Schema.Attribute.Required;
    promoCode: Schema.Attribute.String;
    startDate: Schema.Attribute.DateTime & Schema.Attribute.Required;
    termsAndConditions: Schema.Attribute.RichText;
  };
}

export interface TourRoomTypePricing extends Struct.ComponentSchema {
  collectionName: 'components_tour_room_type_pricings';
  info: {
    description: 'Room configuration with Double Bed (DB) basis pricing';
    displayName: 'Room Type Pricing';
    icon: 'house';
  };
  attributes: {
    description: Schema.Attribute.Text;
    maxOccupancy: Schema.Attribute.Integer & Schema.Attribute.Required;
    numberOfBeds: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<1>;
    pricePerPerson: Schema.Attribute.Component<'experience.rates', false>;
    roomType: Schema.Attribute.Enumeration<
      [
        'Single Room (1 Person - DB basis)',
        'Double Room (2 Persons - DB)',
        'Triple Room (3 Persons - 2 DB)',
        'Quad Room (4 Persons - 2 DB)',
      ]
    > &
      Schema.Attribute.Required;
    totalRoomPrice: Schema.Attribute.Component<'experience.rates', false>;
  };
}

export interface TourSustainabilityInitiative extends Struct.ComponentSchema {
  collectionName: 'components_tour_sustainability_initiatives';
  info: {
    description: 'Environmental and social sustainability programs';
    displayName: 'Sustainability Initiative';
    icon: 'earth';
  };
  attributes: {
    category: Schema.Attribute.Enumeration<
      [
        'Animal Welfare',
        'Supporting Destinations',
        'Sustainability Programs',
        'Carbon Offset',
        'Community Support',
        'Waste Reduction',
        'Water Conservation',
      ]
    > &
      Schema.Attribute.Required;
    description: Schema.Attribute.RichText;
    icon: Schema.Attribute.Media<'images'>;
    impact: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface TourTourSummary extends Struct.ComponentSchema {
  collectionName: 'components_tour_summaries';
  info: {
    description: 'Overview details about the tour';
    displayName: 'Tour Summary';
    icon: 'information';
  };
  attributes: {
    duration: Schema.Attribute.String & Schema.Attribute.Required;
    fitnessLevel: Schema.Attribute.Enumeration<
      ['No Fitness Required', 'Low', 'Moderate', 'High', 'Very High']
    >;
    fullyGuided: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    guideLanguages: Schema.Attribute.JSON &
      Schema.Attribute.DefaultTo<['English']>;
    intensity: Schema.Attribute.Enumeration<
      ['Relaxed', 'Light', 'Moderate', 'Active', 'Challenging', 'Extreme']
    > &
      Schema.Attribute.Required;
    maxGroupSize: Schema.Attribute.Integer;
    minAge: Schema.Attribute.Integer;
    minGroupSize: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    theme: Schema.Attribute.Enumeration<
      [
        'Adventure',
        'Cultural',
        'Wildlife',
        'Beach & Relaxation',
        'Hiking & Trekking',
        'Photography',
        'Culinary',
        'Spiritual',
        'Multi-Activity',
        'Honeymoon',
        'Family',
      ]
    >;
  };
}

export interface TourTravelMap extends Struct.ComponentSchema {
  collectionName: 'components_tour_travel_maps';
  info: {
    description: 'Map configuration with route and waypoints';
    displayName: 'Travel Map';
    icon: 'pinMap';
  };
  attributes: {
    centerCoordinates: Schema.Attribute.Component<
      'experience.coordinates',
      false
    >;
    embedUrl: Schema.Attribute.Text;
    mapProvider: Schema.Attribute.Enumeration<
      ['Google Maps', 'OpenStreetMap', 'Mapbox']
    > &
      Schema.Attribute.DefaultTo<'Google Maps'>;
    mapTitle: Schema.Attribute.String;
    waypoints: Schema.Attribute.Component<'experience.coordinates', true>;
    zoomLevel: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<8>;
  };
}

export interface TourTravelerInfo extends Struct.ComponentSchema {
  collectionName: 'components_tour_traveler_info';
  info: {
    description: 'Individual traveler details';
    displayName: 'Traveler Info';
    icon: 'user';
  };
  attributes: {
    ageCategory: Schema.Attribute.Enumeration<['Adult', 'Child', 'Infant']> &
      Schema.Attribute.DefaultTo<'Adult'>;
    dateOfBirth: Schema.Attribute.Date;
    dietaryRequirements: Schema.Attribute.String;
    emergencyContactName: Schema.Attribute.String;
    emergencyContactPhone: Schema.Attribute.String;
    firstName: Schema.Attribute.String & Schema.Attribute.Required;
    gender: Schema.Attribute.Enumeration<
      ['Male', 'Female', 'Other', 'Prefer not to say']
    >;
    lastName: Schema.Attribute.String & Schema.Attribute.Required;
    medicalConditions: Schema.Attribute.Text;
    nationality: Schema.Attribute.String;
    passportExpiry: Schema.Attribute.Date;
    passportNumber: Schema.Attribute.String;
  };
}

export interface VoucherCash extends Struct.ComponentSchema {
  collectionName: 'components_voucher_cash';
  info: {
    displayName: 'cash';
  };
  attributes: {
    amount: Schema.Attribute.Float;
    currency: Schema.Attribute.Enumeration<['LKR', 'USD']>;
  };
}

export interface VoucherExperience extends Struct.ComponentSchema {
  collectionName: 'components_voucher_experiences';
  info: {
    displayName: 'experience';
  };
  attributes: {
    adults: Schema.Attribute.Integer;
    children: Schema.Attribute.Integer;
    extras: Schema.Attribute.Component<'voucher.extras', true>;
    name: Schema.Attribute.String;
  };
}

export interface VoucherExtras extends Struct.ComponentSchema {
  collectionName: 'components_voucher_extras';
  info: {
    displayName: 'extras';
  };
  attributes: {
    name: Schema.Attribute.String;
    quantity: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'common.images': CommonImages;
      'common.seo-metadata': CommonSeoMetadata;
      'experience.about': ExperienceAbout;
      'experience.coordinates': ExperienceCoordinates;
      'experience.duration': ExperienceDuration;
      'experience.duration-rates': ExperienceDurationRates;
      'experience.extras': ExperienceExtras;
      'experience.options': ExperienceOptions;
      'experience.pax-rates': ExperiencePaxRates;
      'experience.rates': ExperienceRates;
      'experience.requirements': ExperienceRequirements;
      'merchandise.merch-option': MerchandiseMerchOption;
      'merchandise.options': MerchandiseOptions;
      'rentals.rent-rates': RentalsRentRates;
      'tour.accommodation-option': TourAccommodationOption;
      'tour.accommodation-stay': TourAccommodationStay;
      'tour.activity': TourActivity;
      'tour.certification': TourCertification;
      'tour.customer-info': TourCustomerInfo;
      'tour.departure-date': TourDepartureDate;
      'tour.detailed-ratings': TourDetailedRatings;
      'tour.highlight': TourHighlight;
      'tour.itinerary-day': TourItineraryDay;
      'tour.operator-response': TourOperatorResponse;
      'tour.place-to-see': TourPlaceToSee;
      'tour.promotional-offer': TourPromotionalOffer;
      'tour.room-type-pricing': TourRoomTypePricing;
      'tour.sustainability-initiative': TourSustainabilityInitiative;
      'tour.tour-summary': TourTourSummary;
      'tour.travel-map': TourTravelMap;
      'tour.traveler-info': TourTravelerInfo;
      'voucher.cash': VoucherCash;
      'voucher.experience': VoucherExperience;
      'voucher.extras': VoucherExtras;
    }
  }
}
