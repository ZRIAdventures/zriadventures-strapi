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
      'voucher.cash': VoucherCash;
      'voucher.experience': VoucherExperience;
      'voucher.extras': VoucherExtras;
    }
  }
}
