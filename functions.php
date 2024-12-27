<?php

/*
Plugin Name: Viroz Inventory
Plugin URI: https://viroz.studio/vz-inventory
Description: This plugin will help you manage the quantities and places of your products.
Version: 0.1.0
Author: Melisa Viroz
Author URI: https://melisaviroz.com
License: GPL2
*/

function vzi_is_env() {
  return true;;
}

// if woocommerce is not installed, send notification
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
  add_action('admin_notices', 'vzi_woocommerce_not_installed');
  function vzi_woocommerce_not_installed() {
    ?>
    <div class="notice notice-error is-dismissible">
      <p><?php _e('Viroz Inventory requires WooCommerce to function properly.', 'vzi'); ?></p>
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

function vzi_create_database_table() {
  global $wpdb;
  $table_name = $wpdb->prefix . 'vzi_zone_logs';
  $charset_collate = $wpdb->get_charset_collate();
  $sql = "CREATE TABLE $table_name (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    zone_id mediumint(9) NOT NULL,
    product_id mediumint(9) NOT NULL,
    user_id mediumint(9) NOT NULL,
    date_created datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
    motive varchar(255) DEFAULT 'inventory' NOT NULL,
    quantity int(11) DEFAULT 0 NOT NULL,
    PRIMARY KEY  (id)
  ) $charset_collate;";
  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);
}


// localhost dev CORS
if ($_SERVER['HTTP_HOST'] == 'localhost') {
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
    'Product Zones',
    'vzi_product_zones_meta_box',
    'vzi-zones',
    'side',
    'default'
  );
}

function vzi_product_log($sku, $zone, $quantity, $inventory = false) {
  global $wpdb;
  $table_name = $wpdb->prefix . 'vzi_zone_logs';
  $user_id = get_current_user_id();
  $zone_id = $zone->ID;
  $product_id = vzi_get_product_id($sku);
  $motive = 'set';
  if ($inventory) {
    $motive = 'inventory';
  }
  $wpdb->insert(
    $table_name,
    [
      'zone_id' => $zone_id,
      'product_id' => $product_id,
      'user_id' => $user_id,
      'date_created' => current_time('mysql'),
      'motive' => $motive,
      'quantity' => $quantity,
    ]
  );
}

function vzi_add_product_to_zone($isku, $zone_id, $quantity = 1, $product_title = null) {
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
    vzi_product_log($sku, $zone_id, $quantity, true);
  } else {
    $product = new WC_Product_Simple();
    if ($product_title !== '' && $product_title !== null) {
      $product->set_name($product_title);
    } else {
      $product->set_name($sku);
    }
    $product->set_sku($sku);
    $product->set_status('draft');
    $product_id = $product->save();
    vzi_product_log($sku, $zone_id, $quantity, true);
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
    'VZ Inventory',
    'VZ Inventory',
    'manage_options',
    'vz-inventory',
    'vzi_settings_page',
    'dashicons-store',
    100
  );

  add_submenu_page(
    'vz-inventory',
    'Zone Navigation',
    'Zone Navigation',
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
