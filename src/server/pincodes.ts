/**
 * Indian PIN Code verification database for VAYRIVO e-commerce.
 * Contains major metros, Tier 1, 2, and 3 cities with delivery estimates and COD eligibility.
 */

export interface PinCodeInfo {
  pincode: string;
  city: string;
  state: string;
  serviceable: boolean;
  codAvailable: boolean;
  estimatedDays: number;
  expressAvailable: boolean;
}

const PINCODE_DATABASE: Record<string, Omit<PinCodeInfo, 'pincode'>> = {
  // Mumbai & Maharashtra
  '400001': { city: 'Mumbai', state: 'Maharashtra', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '400050': { city: 'Bandra, Mumbai', state: 'Maharashtra', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '400053': { city: 'Andheri West, Mumbai', state: 'Maharashtra', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '411001': { city: 'Pune', state: 'Maharashtra', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '440001': { city: 'Nagpur', state: 'Maharashtra', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: false },

  // Delhi NCR
  '110001': { city: 'New Delhi (Connaught Place)', state: 'Delhi', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '110016': { city: 'Hauz Khas, New Delhi', state: 'Delhi', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '110024': { city: 'Defence Colony, New Delhi', state: 'Delhi', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '122001': { city: 'Gurugram', state: 'Haryana', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },

  // Karnataka / Bengaluru
  '560001': { city: 'Bengaluru (MG Road)', state: 'Karnataka', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '560034': { city: 'Koramangala, Bengaluru', state: 'Karnataka', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '560038': { city: 'Indiranagar, Bengaluru', state: 'Karnataka', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '560100': { city: 'Electronic City, Bengaluru', state: 'Karnataka', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },

  // Tamil Nadu / Chennai
  '600001': { city: 'Chennai (George Town)', state: 'Tamil Nadu', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: true },
  '600028': { city: 'R.A. Puram, Chennai', state: 'Tamil Nadu', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: true },

  // Telangana / Hyderabad
  '500001': { city: 'Hyderabad', state: 'Telangana', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '500034': { city: 'Banjara Hills, Hyderabad', state: 'Telangana', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },
  '500081': { city: 'HITEC City, Hyderabad', state: 'Telangana', serviceable: true, codAvailable: true, estimatedDays: 2, expressAvailable: true },

  // West Bengal / Kolkata
  '700001': { city: 'Kolkata', state: 'West Bengal', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: true },
  '700019': { city: 'Ballygunge, Kolkata', state: 'West Bengal', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: true },

  // Gujarat
  '380001': { city: 'Ahmedabad', state: 'Gujarat', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: true },
  '395001': { city: 'Surat', state: 'Gujarat', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: true },

  // Rajasthan
  '302001': { city: 'Jaipur', state: 'Rajasthan', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: true },
  '342001': { city: 'Jodhpur', state: 'Rajasthan', serviceable: true, codAvailable: true, estimatedDays: 4, expressAvailable: false },

  // Kerala
  '682001': { city: 'Kochi', state: 'Kerala', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: true },
  '695001': { city: 'Thiruvananthapuram', state: 'Kerala', serviceable: true, codAvailable: true, estimatedDays: 4, expressAvailable: false },

  // Punjab & Chandigarh
  '160017': { city: 'Chandigarh', state: 'Punjab/Haryana', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: true },
  '141001': { city: 'Ludhiana', state: 'Punjab', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: false },

  // Goa
  '403001': { city: 'Panaji', state: 'Goa', serviceable: true, codAvailable: true, estimatedDays: 3, expressAvailable: false },
};

/**
 * Validate a 6-digit Indian PIN code.
 * If in exact database, returns high-precision delivery times.
 * If 6 digits and valid Indian postal zone, returns default zone estimation.
 */
export function lookupPinCode(pincode: string): PinCodeInfo | null {
  const cleanPin = pincode.trim();
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return null;
  }

  if (PINCODE_DATABASE[cleanPin]) {
    return {
      pincode: cleanPin,
      ...PINCODE_DATABASE[cleanPin],
    };
  }

  // Zone heuristics for all valid 6-digit Indian PIN codes (Zone 1-9)
  const firstDigit = cleanPin[0];
  let state = 'India';
  let city = 'Regional Hub';
  let estimatedDays = 4;

  switch (firstDigit) {
    case '1':
      state = 'Delhi / Haryana / Punjab / HP / J&K';
      city = 'North Region';
      estimatedDays = 3;
      break;
    case '2':
      state = 'Uttar Pradesh / Uttarakhand';
      city = 'North-Central Region';
      estimatedDays = 4;
      break;
    case '3':
      state = 'Rajasthan / Gujarat';
      city = 'West Region';
      estimatedDays = 3;
      break;
    case '4':
      state = 'Maharashtra / Goa / MP / Chhattisgarh';
      city = 'West-Central Region';
      estimatedDays = 3;
      break;
    case '5':
      state = 'Andhra Pradesh / Telangana / Karnataka';
      city = 'South Region';
      estimatedDays = 3;
      break;
    case '6':
      state = 'Tamil Nadu / Kerala';
      city = 'Deep South Region';
      estimatedDays = 4;
      break;
    case '7':
      state = 'West Bengal / Odisha / North East';
      city = 'East Region';
      estimatedDays = 4;
      break;
    case '8':
      state = 'Bihar / Jharkhand';
      city = 'East-Central Region';
      estimatedDays = 4;
      break;
    default:
      state = 'India';
      city = 'Serviceable Territory';
      estimatedDays = 5;
  }

  return {
    pincode: cleanPin,
    city: city,
    state: state,
    serviceable: true,
    codAvailable: true,
    estimatedDays: estimatedDays,
    expressAvailable: false,
  };
}
