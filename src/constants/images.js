// Config de imágenes y handler de fallback
export const SKIN_IMAGE_BASE = 'https://steamcommunity-a.akamaihd.net/economy/image/';

// Utility para imágenes con fallback visual
export const getSkinImageUrl = (skinName) => {
  // Fallback: Si la imagen falla, mostrar emoji/placeholder
  return `${SKIN_IMAGE_BASE}get_item_image_rgb/default/${skinName}.png`;
};

// Emojis para representar armas si la imagen falla
export const WEAPON_EMOJIS = {
  'AK-47': '🔫',
  'M4A4': '🎯',
  'M4A1-S': '🎯',
  'AWP': '🏹',
  'Glock': '🔵',
  'USP-S': '🔴',
  'Desert Eagle': '🟡',
  'P250': '🟣',
  'P90': '⚫',
  'Five-SeveN': '🟢',
  'Tec-9': '🔶',
  'MP9': '🟠'
};

// Obtener emoji según arma
export const getWeaponEmoji = (skinName) => {
  for (const [weapon, emoji] of Object.entries(WEAPON_EMOJIS)) {
    if (skinName.includes(weapon)) return emoji;
  }
  return '🎁';
};
