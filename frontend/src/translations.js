import strings from './localized-strings.json';

const lang = () => {
  let lan = window.localStorage.getItem('lang') || 'en';
  return lan.substring(0, 2);
}

export const __ = (key) => {
  if (strings[key] === undefined) {
    console.log('Translation not found:', key);
    return key;
  }
  return strings[key][lang()];
}

export function vz_translations() {
  return strings;
}