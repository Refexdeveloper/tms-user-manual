/** Tiny real travel images for mode tabs (MMT-style) + larger card / hero assets */

export const MODE_THUMBS = {
  air: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f0?auto=format&fit=crop&w=96&h=96&q=80',
  train: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=96&h=96&q=80',
  bus: 'https://images.unsplash.com/photo-1544620341-7adceaacd5b4?auto=format&fit=crop&w=96&h=96&q=80',
  accommodation: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=96&h=96&q=80',
  cab: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=96&h=96&q=80',
}

/** Larger photos for premium My Trip cards / hero */
export const MODE_CARDS = {
  air: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f0?auto=format&fit=crop&w=640&h=400&q=80',
  train: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=640&h=400&q=80',
  bus: 'https://images.unsplash.com/photo-1544620341-7adceaacd5b4?auto=format&fit=crop&w=640&h=400&q=80',
  accommodation: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=640&h=400&q=80',
  cab: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=640&h=400&q=80',
  flightHotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=640&h=400&q=80',
}

export const HERO_PLANE =
  'https://images.unsplash.com/photo-1436491865332-7a61a109c0f0?auto=format&fit=crop&w=1400&h=520&q=80'

export function thumbForMode(mode, { withHotel } = {}) {
  if (withHotel) return MODE_THUMBS.accommodation
  return MODE_THUMBS[mode] || MODE_THUMBS.air
}

export function cardForMode(mode, { withHotel } = {}) {
  if (withHotel) return MODE_CARDS.flightHotel
  return MODE_CARDS[mode] || MODE_CARDS.air
}
