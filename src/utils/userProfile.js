const STORAGE_PREFIX = 'visitjo.userProfile.';

const isUuidLike = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());

const titleCase = (word) => {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const deriveNameFromEmail = (email) => {
  const safeEmail = String(email || '').trim();
  if (!safeEmail) {
    return { firstName: '', lastName: '', displayName: '', email: '' };
  }

  if (isUuidLike(safeEmail)) {
    return { firstName: '', lastName: '', displayName: 'Account', email: safeEmail };
  }

  const localPart = safeEmail.split('@')[0] || safeEmail;

  // Turn common separators into spaces and remove plus-tags
  const cleaned = localPart
    .replace(/\+/g, ' ')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = cleaned.split(' ').filter(Boolean).map(titleCase);
  const displayName = tokens.join(' ') || localPart;

  return {
    firstName: tokens[0] || localPart,
    lastName: tokens.slice(1).join(' '),
    displayName,
    email: safeEmail,
  };
};

const storageKeyForEmail = (email) => {
  const safeEmail = String(email || '').trim().toLowerCase();
  if (!safeEmail) return `${STORAGE_PREFIX}anonymous`;
  return `${STORAGE_PREFIX}${safeEmail}`;
};

export const loadSavedProfile = (email) => {
  try {
    const raw = localStorage.getItem(storageKeyForEmail(email));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveProfile = (email, profile) => {
  try {
    localStorage.setItem(storageKeyForEmail(email), JSON.stringify(profile || {}));
  } catch {
    // ignore
  }
};

export const clearSavedProfile = (email) => {
  try {
    localStorage.removeItem(storageKeyForEmail(email));
  } catch {
    // ignore
  }
};
