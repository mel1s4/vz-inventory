/**
 * WordPress i18n utilities for React frontend
 * Fully integrated with WordPress translation system
 */

/* global wp */

// Get WordPress app parameters
const getWpParams = () => {
  return window.vz_app_params || {};
};

// Check if wp.i18n is available (WordPress environment)
const hasWpI18n = typeof wp !== 'undefined' && wp.i18n;

// WordPress translation functions
let __ = (text, domain = 'vz-inventory') => text;
let _x = (text, context, domain = 'vz-inventory') => text;
let _n = (single, plural, number, domain = 'vz-inventory') => number === 1 ? single : plural;

if (hasWpI18n) {
  // Use WordPress i18n functions
  __ = wp.i18n.__;
  _x = wp.i18n._x;
  _n = wp.i18n._n;
  
  // Debug information
  console.log('VZ Inventory: WordPress i18n system loaded');
  console.log('Available wp.i18n functions:', Object.keys(wp.i18n));
  
  // Test a translation
  const testTranslation = __('Zone', 'vz-inventory');
  console.log('Test translation "Zone":', testTranslation);
  
  // Check locale data
  const localeData = wp.i18n.getLocaleData('vz-inventory');
  console.log('Locale data for vz-inventory:', localeData);
} else {
  // Minimal fallback for development
  console.warn('VZ Inventory: WordPress i18n not available - using fallback');
  console.log('wp object:', typeof wp);
  console.log('wp.i18n object:', typeof wp !== 'undefined' ? wp.i18n : 'wp not defined');
  
  // Basic development fallback
  const getDevelopmentTranslation = (text) => {
    const wpParams = getWpParams();
    const locale = wpParams.locale || 'en_US';
    
    // Simple Spanish translations for development
    if (locale.startsWith('es')) {
      const simpleTranslations = {
        'Home': 'Inicio',
        'Zone': 'Zona',
        'Product': 'Producto',
        'Add': 'Agregar',
        'Edit': 'Editar',
        'Delete': 'Eliminar',
        'Cancel': 'Cancelar',
        'Save': 'Guardar',
        'Loading...': 'Cargando...',
        'Dark': 'Oscuro',
        'Light': 'Claro',
        'New Zone': 'Nueva Zona',
        'No Zones': 'Sin Zonas',
        'No Products': 'Sin Productos',
        'Product SKU': 'SKU del Producto',
        'Edit in WordPress': 'Editar en WordPress',
        'Are you sure you want to delete this zone?': '¿Estás seguro de que quieres eliminar esta zona?',
        'Are you sure you want to delete this product?': '¿Estás seguro de que quieres eliminar este producto?'
      };
      return simpleTranslations[text] || text;
    }
    return text;
  };

  __ = getDevelopmentTranslation;
  _n = (single, plural, number) => {
    const text = number === 1 ? single : plural;
    return getDevelopmentTranslation(text);
  };
}

/**
 * Main translation function with text domain
 * @param {string} text - Text to translate
 * @param {string} domain - Text domain (default: 'vz-inventory')
 * @returns {string} Translated text
 */
export const t = (text, domain = 'vz-inventory') => {
  return __(text, domain);
};

/**
 * Translation function with context
 * @param {string} text - Text to translate
 * @param {string} context - Translation context
 * @param {string} domain - Text domain (default: 'vz-inventory')
 * @returns {string} Translated text
 */
export const tx = (text, context, domain = 'vz-inventory') => {
  return _x(text, context, domain);
};

/**
 * Plural translation function
 * @param {string} single - Singular form
 * @param {string} plural - Plural form
 * @param {number} number - Number for plural decision
 * @param {string} domain - Text domain (default: 'vz-inventory')
 * @returns {string} Translated text
 */
export const tn = (single, plural, number, domain = 'vz-inventory') => {
  return _n(single, plural, number, domain);
};

/**
 * Legacy support for existing _vz function
 * @param {string} key - Translation key (now just the text itself)
 * @returns {string} Translated text
 */
export const _vz = (key) => {
  return t(key);
};

/**
 * Get current WordPress locale
 * @returns {string} Current locale (e.g., 'es_ES', 'en_US')
 */
export const getCurrentLocale = () => {
  const wpParams = getWpParams();
  return wpParams.locale || 'en_US';
};

/**
 * Get current language code (first 2 chars of locale)
 * @returns {string} Language code (e.g., 'es', 'en')
 */
export const getCurrentLanguage = () => {
  return getCurrentLocale().substring(0, 2);
};

/**
 * Check if current language is RTL
 * @returns {boolean} True if RTL language
 */
export const isRTL = () => {
  const wpParams = getWpParams();
  return wpParams.is_rtl || false;
};

/**
 * Get WordPress text domain
 * @returns {string} Text domain
 */
export const getTextDomain = () => {
  const wpParams = getWpParams();
  return wpParams.text_domain || 'vz-inventory';
};

// Export WordPress functions for direct use
export { __, _x, _n };

// Default export with all utilities
const i18nUtils = {
  t,
  tx,
  tn,
  _vz,
  getCurrentLocale,
  getCurrentLanguage,
  isRTL,
  getTextDomain,
  __,
  _x,
  _n
};

export default i18nUtils;
