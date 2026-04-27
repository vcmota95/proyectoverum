export const getBadgeForXp = (xp) => {
  const currentXp = xp || 0;
  if (currentXp < 150) return { title: 'Célula', icon: '🧫', minTier: 0, nextTier: 150, nextTitle: 'Hueso' };
  if (currentXp < 500) return { title: 'Hueso', icon: '🦴', minTier: 150, nextTier: 500, nextTitle: 'Pulmón' };
  if (currentXp < 1500) return { title: 'Pulmón', icon: '🫁', minTier: 500, nextTier: 1500, nextTitle: 'Corazón' };
  if (currentXp < 3000) return { title: 'Corazón', icon: '🫀', minTier: 1500, nextTier: 3000, nextTitle: 'Cerebro' };
  return { title: 'Cerebro', icon: '🧠', minTier: 3000, nextTier: null, nextTitle: null };
};
