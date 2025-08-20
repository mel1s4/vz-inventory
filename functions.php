<?php

/*
Plugin Name: Viroz Inventory
Plugin URI: https://viroz.studio/vz-inventory
Description: This plugin will help you manage the quantities and places of your products.
Version: 0.1.0
Author: Melisa Viroz
Author URI: https://melisaviroz.com
License: GPL2
Text Domain: vz-inventory
Domain Path: /languages
*/

// Prevent direct access
if (!defined('ABSPATH')) {
  exit;
}

// Define plugin constants
define('VZI_PLUGIN_FILE', __FILE__);
define('VZI_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('VZI_PLUGIN_URL', plugin_dir_url(__FILE__));
define('VZI_TEXT_DOMAIN', 'vz-inventory');

function vzi_is_env() {
  return true;;
}

// Load plugin text domain for translations
add_action('plugins_loaded', 'vzi_load_textdomain');
function vzi_load_textdomain() {
  load_plugin_textdomain(
    VZI_TEXT_DOMAIN,
    false,
    dirname(plugin_basename(VZI_PLUGIN_FILE)) . '/languages'
  );
}

// Load JavaScript translations for React frontend
add_action('admin_enqueue_scripts', 'vzi_enqueue_scripts_with_translations');
function vzi_enqueue_scripts_with_translations($hook) {
  // Only load on our plugin pages
  if ($hook !== 'toplevel_page_vz-inventory' && $hook !== 'vz-inventory_page_vz-inventory-navigation') {
    return;
  }
  
  // Ensure wp-i18n is loaded
  wp_enqueue_script('wp-i18n');
  
  // Set script translations - this will be used by React
  wp_set_script_translations('vz-inventory-frontend', VZI_TEXT_DOMAIN, VZI_PLUGIN_PATH . 'languages');
}

// Convert .po file to JSON format for JavaScript
add_action('init', 'vzi_create_script_translations');
function vzi_create_script_translations() {
  // Only create translations in admin or when specifically needed
  if (!is_admin() && !wp_doing_ajax()) {
    return;
  }
  
  $locale = get_locale();
  
  // Skip if English (default)
  if ($locale === 'en_US' || $locale === 'en') {
    return;
  }
  
  $po_file = VZI_PLUGIN_PATH . "languages/vz-inventory-{$locale}.po";
  $json_file = VZI_PLUGIN_PATH . "languages/vz-inventory-{$locale}-vz-inventory-frontend.json";
  
  // Check if .po file exists and JSON is outdated
  if (file_exists($po_file) && (!file_exists($json_file) || filemtime($po_file) > filemtime($json_file))) {
    vzi_convert_po_to_json($po_file, $json_file);
  }
}

// Function to convert .po to JSON format for wp.i18n
function vzi_convert_po_to_json($po_file, $json_file) {
  if (!function_exists('wp_get_pomo_reader')) {
    require_once ABSPATH . WPINC . '/pomo/po.php';
  }
  
  $po = new PO();
  if (!$po->import_from_file($po_file)) {
    return false;
  }
  
  $translations = array();
  $headers = $po->headers;
  
  foreach ($po->entries as $entry) {
    if (!empty($entry->singular)) {
      $translations[$entry->singular] = array($entry->translations[0]);
    }
  }
  
  $json_data = array(
    'domain' => 'messages',
    'locale_data' => array(
      'messages' => array_merge(
        array(
          '' => array(
            'domain' => 'messages',
            'plural_forms' => isset($headers['Plural-Forms']) ? $headers['Plural-Forms'] : 'nplurals=2; plural=(n != 1);',
            'lang' => isset($headers['Language']) ? $headers['Language'] : get_locale()
          )
        ),
        $translations
      )
    )
  );
  
  file_put_contents($json_file, json_encode($json_data, JSON_UNESCAPED_UNICODE));
  return true;
}

// if woocommerce is not installed, send notification
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
  add_action('admin_notices', 'vzi_woocommerce_not_installed');
  function vzi_woocommerce_not_installed() {
    ?>
    <div class="notice notice-error is-dismissible">
      <p><?php _e('Viroz Inventory requires WooCommerce to function properly.', VZI_TEXT_DOMAIN); ?></p>
    </div>
    <?php
  }
  return;
}


if (!defined('ABSPATH')) {
  die;
}

add_action('init', 'vzi_load_init_file');
function vzi_load_init_file() {
  include 'init.php';
}


// Development CORS - allow for localhost and local network IPs
$host = $_SERVER['HTTP_HOST'];
if ($host == 'localhost' || preg_match('/^192\.168\.\d+\.\d+/', $host) || preg_match('/^10\.\d+\.\d+\.\d+/', $host) || preg_match('/^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+/', $host)) {
  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
  header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Origin, Authorization");
}

include 'viroz_helpers.php';
include 'api_endpoints.php';

// add product meta box
add_action('add_meta_boxes', 'vzi_add_product_meta_box');
function vzi_add_product_meta_box() {
  add_meta_box(
    'vzi_product_zones',
    __('Product Zones', VZI_TEXT_DOMAIN),
    'vzi_product_zones_meta_box',
    'vzi-zones',
    'side',
    'default'
  );
}


function vzi_add_product_to_zone($isku, $zone_id) {
  $sku = sanitize_text_field(strtoupper(str_replace(' ', '', $isku)));
  $found_products = get_posts([
    'post_type' => 'product',
    'meta_key' => '_sku',
    'meta_value' => $sku,
    'posts_per_page' => 1,
    'fields' => 'ids',
    'post_status' => get_post_types('', 'names'),
  ]);
  if ($found_products) {
    $product_id = $found_products[0];
    $product_zones = get_post_meta($zone_id, 'vzi_products_in_zone', true);
    if (!$product_zones) {
      $product_zones = [];
    }
    if (!in_array($product_id, $product_zones)) {
      $product_zones[] = $product_id;
      update_post_meta($zone_id, 'vzi_products_in_zone', $product_zones);
    }
    $result = $product_id;
  } else {
    $product = new WC_Product_Simple();
    $product->set_name($sku);
    $product->set_sku($sku);
    $product->set_status('draft');
    $product_id = $product->save();
    $product_zones = get_post_meta($zone_id, 'vzi_products_in_zone', true);
    if (!$product_zones) {
      $product_zones = [$product_id];
    } else {
      $product_zones[] = $product_id;
    }
    update_post_meta($zone_id, 'vzi_products_in_zone', $product_zones);
    $result = $product_id;
  }

  return $result;
}

function vzi_product_zones_meta_box($post) {
  $product_zones = get_post_meta($post->ID, 'vzi_products_in_zone');
  print_x($product_zones);
}


add_action('admin_menu', 'vzi_add_settings_page');
function vzi_add_settings_page() {
  add_menu_page(
    __('VZ Inventory', VZI_TEXT_DOMAIN),
    __('VZ Inventory', VZI_TEXT_DOMAIN),
    'manage_options',
    'vz-inventory',
    'vzi_settings_page',
    'dashicons-store',
    100
  );

  add_submenu_page(
    'vz-inventory',
    __('Zone Navigation', VZI_TEXT_DOMAIN),
    __('Zone Navigation', VZI_TEXT_DOMAIN),
    'manage_options',
    'vz-inventory-navigation',
    'vzi_settings_page'
  );
}

function vzi_settings_page() {
  return; // silence is golden
}

add_action('admin_init', 'vzi_intercept_frontend');
function vzi_intercept_frontend() {
  if (isset($_GET['page']) && $_GET['page'] == 'vz-inventory-navigation') {
    include plugin_dir_path(__FILE__) . 'frontend/index.php'; 
    die();
  }
}
