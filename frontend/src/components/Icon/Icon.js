import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faPen,
  faTrash,
  faExternalLinkAlt,
  faSun,
  faMoon,
  faChevronRight,
  faHome,
  faBox,
  faWarehouse,
  faTags,
  faBarcode,
  faEdit,
  faKeyboard,
  faHashtag,
  faSort,
  faPencilAlt
} from '@fortawesome/free-solid-svg-icons';
import './Icon.scss';

// Icon mapping from your current icon names to FontAwesome icons
const iconMap = {
  // Current icon mappings
  'add': faPlus,
  'add_white': faPlus,  // Will use same icon, styling will handle color
  'edit': faEdit,
  'delete': faTrash,
  'visit': faExternalLinkAlt,
  
  // Theme toggle icons
  'sun': faSun,
  'moon': faMoon,
  
  // Navigation
  'chevron-right': faChevronRight,
  'home': faHome,
  
  // Inventory specific
  'zone': faWarehouse,
  'product': faBox,
  'tags': faTags,
  'barcode': faBarcode,
  'sku': faHashtag,
  
  // Input modes
  'keyboard': faKeyboard,
  'numeric': faHashtag,
  'text': faKeyboard,
  
  // Sorting
  'sort': faSort,
  
  // Alternative names
  'pen': faPen,
  'pencil': faPencilAlt,
  'trash': faTrash,
  'plus': faPlus,
  'external-link': faExternalLinkAlt
};

/**
 * Icon component using FontAwesome
 * @param {string} icon - Icon name from iconMap
 * @param {string} className - Additional CSS classes
 * @param {string} size - FontAwesome size (xs, sm, lg, xl, 2x, etc.)
 * @param {string} color - Text color for the icon
 * @param {object} style - Inline styles
 * @param {function} onClick - Click handler
 * @param {string} title - Tooltip text
 */
const Icon = ({ 
  icon = 'edit', 
  className = '', 
  size = undefined,
  color = undefined,
  style = {},
  onClick = undefined,
  title = undefined,
  ...props 
}) => {
  const iconDefinition = iconMap[icon];
  
  if (!iconDefinition) {
    console.warn(`Icon "${icon}" not found in iconMap. Available icons:`, Object.keys(iconMap));
    return <FontAwesomeIcon icon={faEdit} className={`icon ${className}`.trim()} {...props} />;
  }

  const iconProps = {
    icon: iconDefinition,
    className: `icon ${className}`.trim(),
    size,
    style: {
      color,
      ...style
    },
    onClick,
    title,
    ...props
  };

  // Remove undefined values
  Object.keys(iconProps).forEach(key => {
    if (iconProps[key] === undefined) {
      delete iconProps[key];
    }
  });

  return <FontAwesomeIcon {...iconProps} />;
};

// Convenience component for backwards compatibility
export const VzIcon = ({ icon = 'edit', ...props }) => {
  return (
    <span className="icon" {...props}>
      <Icon icon={icon} />
    </span>
  );
};

export default Icon;
