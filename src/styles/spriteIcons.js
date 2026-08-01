/**
 * Pixel-identical icon crops lifted directly from makemytrip.com's own sprite
 * sheets (position/size values captured via computed styles on the live
 * site), so these render exactly like the real MMT header/category tabs.
 */
const LANDING_SPRITE = 'https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/landingSprite@30x.png';
const HEADER_SPRITE = 'https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/B2CHeaderSprite@2.png';
const FLAG_SPRITE = 'https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/flagSprite4.png';
const FOOTER_SOCIAL_SPRITE = 'https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/landingSprite2@3x.png';

// ----- Mobile PWA sprites -----
const MOBILE_HEADER_SPRITE = 'https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/B2CHeaderSprite@1.png';
const MOBILE_MENU_SPRITE = 'https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/scMenuSprite@4x.png';
const MOBILE_BOTTOM_NAV_SPRITE = 'https://go-assets.ibcdn.com/u/GI/images/1773728221453-landing-sprite.png';

export const NAV_ICONS = {
  listYourProperty: { sprite: LANDING_SPRITE, bgSize: '200px 700px', bgPosition: '-78px -517px', width: 32, height: 33 },
  myTrips: { sprite: LANDING_SPRITE, bgSize: '200px 700px', bgPosition: '-121px -29px', width: 18, height: 26 },
  wishlist: { sprite: LANDING_SPRITE, bgSize: '200px 700px', bgPosition: '-54.5px -373px', width: 24, height: 24 },
};

export const FLAG_ICON = { sprite: FLAG_SPRITE, bgSize: '24px 120px', bgPosition: '0px -2px', width: 24, height: 18 };

export const CATEGORY_ICONS = {
  flights: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-5px -44px', width: 42, height: 32 },
  hotels: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-60px 0px', width: 36, height: 40 },
  homestays: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-57px -83px', width: 44, height: 37 },
  holidays: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-109px -3px', width: 42, height: 33 },
  trains: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-156.5px -3px', width: 47, height: 37 },
  buses: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-210.5px -1px', width: 43, height: 36 },
  cabs: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-110px -81px', width: 39, height: 37 },
  tours: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-10px -400px', width: 40, height: 40 },
  visa: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-166px -399px', width: 40, height: 40 },
  cruise: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-215px -399px', width: 40, height: 40 },
  forex: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-167px -83px', width: 30, height: 34 },
  insurance: { sprite: HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-221px -85px', width: 25, height: 29 },
};

export const FOOTER_SOCIAL_ICONS = {
  instagram: { sprite: FOOTER_SOCIAL_SPRITE, bgSize: '200px 700px', bgPosition: '-63px -50px', width: 47, height: 46 },
  twitter: { sprite: FOOTER_SOCIAL_SPRITE, bgSize: '200px 700px', bgPosition: '-120px -52px', width: 36, height: 37 },
  linkedin: { sprite: FOOTER_SOCIAL_SPRITE, bgSize: '200px 700px', bgPosition: '-8px -51px', width: 44, height: 45 },
  facebook: { sprite: FOOTER_SOCIAL_SPRITE, bgSize: '200px 700px', bgPosition: '-166px -48px', width: 20, height: 42 },
};

// ----- Mobile PWA icon sets -----

export const MOBILE_PRIMARY_ICONS = {
  flights: { sprite: MOBILE_HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-5px -44px', width: 44, height: 36 },
  hotels: { sprite: MOBILE_HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-62px -41.5px', width: 41, height: 42 },
  trains: { sprite: MOBILE_HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-156px -41px', width: 50, height: 40 },
  holidays: { sprite: MOBILE_HEADER_SPRITE, bgSize: '260px 450px', bgPosition: '-109px -43px', width: 45, height: 37 },
};

export const MOBILE_SECONDARY_ICONS = {
  'airport-cabs': { sprite: MOBILE_MENU_SPRITE, bgSize: '192px 140px', bgPosition: '0px 0px', width: 44, height: 41 },
  homestays: { sprite: MOBILE_MENU_SPRITE, bgSize: '192px 140px', bgPosition: '-52px 0px', width: 46, height: 41 },
  bus: { sprite: MOBILE_MENU_SPRITE, bgSize: '192px 140px', bgPosition: '2px -88px', width: 44, height: 41 },
  outstation: { sprite: MOBILE_MENU_SPRITE, bgSize: '192px 140px', bgPosition: '-147px 0px', width: 44, height: 41 },
  tours: { sprite: MOBILE_MENU_SPRITE, bgSize: '192px 140px', bgPosition: '-147px -84px', width: 41, height: 38 },
  forex: { sprite: MOBILE_MENU_SPRITE, bgSize: '192px 140px', bgPosition: '-101px 1px', width: 44, height: 41 },
  visa: { sprite: MOBILE_MENU_SPRITE, bgSize: '192px 140px', bgPosition: '-54px -88px', width: 44, height: 41 },
  insurance: { sprite: MOBILE_MENU_SPRITE, bgSize: '192px 140px', bgPosition: '-139px -39px', width: 44, height: 41 },
  pnr: { sprite: MOBILE_MENU_SPRITE, bgSize: '192px 140px', bgPosition: '-96px -39px', width: 44, height: 41 },
  gifts: { sprite: MOBILE_MENU_SPRITE, bgSize: '192px 140px', bgPosition: '4px -39px', width: 44, height: 41 },
};

export const BOTTOM_NAV_ICONS = {
  home: { sprite: MOBILE_BOTTOM_NAV_SPRITE, bgSize: '300px 550px', bgPosition: '-157px -475px', width: 35, height: 35 },
  myTrips: { sprite: MOBILE_BOTTOM_NAV_SPRITE, bgSize: '300px 550px', bgPosition: '-191px -478px', width: 35, height: 35 },
  offers: { sprite: MOBILE_BOTTOM_NAV_SPRITE, bgSize: '300px 550px', bgPosition: '-229px -478px', width: 35, height: 35 },
  where2go: { sprite: MOBILE_BOTTOM_NAV_SPRITE, bgSize: '300px 550px', bgPosition: '-260px -478px', width: 35, height: 35 },
};
