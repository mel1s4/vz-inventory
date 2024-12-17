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

add_action('init', 'vz_am_load_init_file');
function vz_am_load_init_file() {
  include 'init.php';
}

if ($_SERVER['HTTP_HOST'] == 'localhost') {
  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
  header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Origin, Authorization");
}

include 'viroz_helpers.php';
include 'api_endpoints.php';
