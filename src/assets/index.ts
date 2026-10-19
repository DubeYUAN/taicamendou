/**
 * Application Assets Registry
 */

export { sounds } from './sounds';
export { PRESET_DECK_ASSETS } from './deckPresets';
export type { PresetDeckAsset } from './deckPresets';

// SVG Asset URLs / imports
import logoSvg from './logo.svg';
import emptyCardsSvg from './empty-cards.svg';

export const ASSET_IMAGES = {
  logo: logoSvg,
  emptyCards: emptyCardsSvg,
};
