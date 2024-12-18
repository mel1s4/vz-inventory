<?php

/*
Plugin Name: Viroz Inventory
Plugin URI: https://viroz.studio/vz-inventory
Description: This plugin will help you manage the quantities and places of your products.
Version: 0.0.1
Author: Melisa Viroz
Author URI: https://melisaviroz.com
License: GPL2
*/

if (!defined('ABSPATH')) {
  die;
}

add_action('init', 'vzi_load_init_file');
function vzi_load_init_file() {
  include 'init.php';
}

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


function vzi_add_product_to_zone($sku, $zone_id) {
  $found_products = get_posts([
    'post_type' => 'product',
    'meta_key' => '_sku',
    'meta_value' => $sku,
    'posts_per_page' => 1,
    'fields' => 'ids',
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
    $product->set_status('publish');
    $product_id = $product->save();
    update_post_meta($zone_id, 'vzi_products_in_zone', [$product_id]);
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
    'Viroz Inventory Settings',
    'Viroz Inventory',
    'manage_options',
    'vz-inventory-settings',
    'vzi_settings_page',
    'dashicons-store',
    100
  );
}

function vzi_settings_page() {

}

add_action('admin_init', 'vzi_intercept_frontend');
function vzi_intercept_frontend() {
  if (isset($_GET['page']) && $_GET['page'] == 'vz-inventory-settings') {
    include 'frontend/index.php'; 
    die();
  }
}
