/**
 * Comprehensive emoji list for health and medical related content
 * Used across various forms in the application
 */

export const healthEmojis = [
  // 🩺 Medical & Healthcare
  '💊', '💉', '🩹', '🩺', '🩻', '🧬', '🧫', '🧪', '🧴', '⚕️', '🏥', '🏨', '🚑',
  '🧍', '🧍‍♀️', '🧍‍♂️', '👩‍⚕️', '👨‍⚕️', '🧎', '🧎‍♀️', '🧎‍♂️',

  // 🤕 Symptoms & Conditions
  '🤕', '🤒', '😷', '🤧', '🤮', '🤢', '🥴', '😵', '😵‍💫', '🥱', '😴',
  '🥵', '🥶', '🤯', '😫', '😖', '😣', '😓', '😤', '😔', '😞', '😰', '😨', '😱', '😩', '🤤',

  // 💪 Body & Anatomy
  '🧠', '🫀', '🫁', '🦷', '🦴', '👁️', '👂', '👃', '👄', '👅', '🖐️', '✋', '🤚', '🤲', '🙏',
  '🦵', '🦶', '💪', '🫶', '🤰', '🤱', '🧘', '🧘‍♀️', '🧘‍♂️', '🏃', '🏃‍♀️', '🏃‍♂️',

  // 💆 Relaxation & Mindfulness
  '💆', '💆‍♀️', '💆‍♂️', '💅', '💇', '💇‍♀️', '💇‍♂️', '🧖', '🧖‍♀️', '🧖‍♂️', '🧘', '🧘‍♀️', '🧘‍♂️',
  '🕯️', '🪷', '🛀', '🛌', '🧺', '🌙', '☀️',

  // 🏋️‍♂️ Fitness & Sports
  '🏋️', '🏋️‍♀️', '🏋️‍♂️', '🚴', '🚴‍♀️', '🚴‍♂️', '🚶', '🚶‍♀️', '🚶‍♂️', '🤸', '🤸‍♀️', '🤸‍♂️',
  '🏊', '🏊‍♀️', '🏊‍♂️', '⛹️', '🤾', '🏌️', '🏹', '🚣', '🤽',

  // 🌿 Nature & Healing
  '🌿', '🍃', '🌱', '🌺', '🌸', '🌻', '🌼', '🍀', '🍎', '🍋', '🥦', '🥕', '🥬', '🍯', '🌾', '🌴',
  '🪴', '🌍', '☘️',

  // 🌡️ Health States
  '🌡️', '🔥', '❄️', '💧', '💨', '⚡', '💥', '🌈', '🌟', '✨',

  // ❤️ Emotions & Well-being
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🩷', '🩵', '🤍', '🤎', '🖤', 
  '💓', '💗', '💖', '💞', '💝', '💟', '💌', '🤗', '😊', '🙂', '😇', '😌', '🙌', '🤝',

  // 🍎 Nutrition & Lifestyle
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🥑', '🥦', '🥕', '🥗', '🍲', '🥣', '🥛', '💧', '🍵', '☕', '🥤'
];

/**
 * Get emoji by category for easier organization in UI
 */
export const getEmojisByCategory = () => {
  return {
    medical: healthEmojis.slice(0, 21), // Medical & Healthcare
    symptoms: healthEmojis.slice(21, 46), // Symptoms & Conditions  
    body: healthEmojis.slice(46, 72), // Body & Anatomy
    relaxation: healthEmojis.slice(72, 89), // Relaxation & Mindfulness
    fitness: healthEmojis.slice(89, 107), // Fitness & Sports
    nature: healthEmojis.slice(107, 126), // Nature & Healing
    states: healthEmojis.slice(126, 136), // Health States
    emotions: healthEmojis.slice(136, 160), // Emotions & Well-being
    nutrition: healthEmojis.slice(160) // Nutrition & Lifestyle
  };
};

/**
 * Search emojis by category or general search
 */
export const searchEmojis = (query: string): string[] => {
  const categories = getEmojisByCategory();
  const lowerQuery = query.toLowerCase();
  
  // Direct category match
  if (lowerQuery in categories) {
    return categories[lowerQuery as keyof typeof categories];
  }
  
  // Category keyword matching
  const categoryMap: Record<string, string[]> = {
    'medical': categories.medical,
    'doctor': categories.medical,
    'hospital': categories.medical,
    'medicine': categories.medical,
    'sick': categories.symptoms,
    'pain': categories.symptoms,
    'hurt': categories.symptoms,
    'fever': categories.symptoms,
    'body': categories.body,
    'anatomy': categories.body,
    'muscle': categories.body,
    'relax': categories.relaxation,
    'calm': categories.relaxation,
    'peace': categories.relaxation,
    'exercise': categories.fitness,
    'sport': categories.fitness,
    'workout': categories.fitness,
    'plant': categories.nature,
    'herb': categories.nature,
    'natural': categories.nature,
    'health': categories.states,
    'energy': categories.states,
    'emotion': categories.emotions,
    'happy': categories.emotions,
    'love': categories.emotions,
    'food': categories.nutrition,
    'eat': categories.nutrition,
    'drink': categories.nutrition
  };
  
  for (const [keyword, emojis] of Object.entries(categoryMap)) {
    if (keyword.includes(lowerQuery) || lowerQuery.includes(keyword)) {
      return emojis;
    }
  }
  
  // Return all if no specific match
  return healthEmojis;
};