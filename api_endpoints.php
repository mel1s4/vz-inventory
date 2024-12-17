<?php

// All of these endpoints are for 'editor' role only

add_action('rest_api_init', 'vz_am_register_endpoints');
function vz_am_register_endpoints() {
  register_rest_route('vz-inventory/v1', '/zones', [
    'methods' => 'GET',
    'callback' => 'vz_am_get_zones',
    'permission_callback' => 'vz_am_check_permission'
  ]);

  register_rest_route('vz-inventory/v1', '/zones/(?P<id>\d+)', [
    'methods' => 'GET',
    'callback' => 'vz_am_get_zone',
    'permission_callback' => 'vz_am_check_permission'
  ]);

  register_rest_route('vz-inventory/v1', '/zones', [
    'methods' => 'POST',
    'callback' => 'vz_am_create_zone',
    'permission_callback' => 'vz_am_check_permission'
  ]);

  register_rest_route('vz-inventory/v1', '/zones/(?P<id>\d+)', [
    'methods' => 'PUT',
    'callback' => 'vz_am_update_zone',
    'permission_callback' => 'vz_am_check_permission'
  ]);

  register_rest_route('vz-inventory/v1', '/zones/(?P<id>\d+)', [
    'methods' => 'DELETE',
    'callback' => 'vz_am_delete_zone',
    'permission_callback' => 'vz_am_check_permission'
  ]);
}

function vz_am_get_zones($data) {
  $args = [
    'post_type' => 'vzi-zones',
    'posts_per_page' => -1
  ];
  $zones = get_posts($args);
  return $zones;
}

function vz_am_get_zone($data) {
  $zone = get_post($data['id']);
  return $zone;
}

function vz_am_create_zone($data) {
  $zone = [
    'post_title' => $data['title'],
    'post_content' => $data['description'],
    'post_status' => 'publish',
    'post_type' => 'vzi-zones'
  ];
  $zone_id = wp_insert_post($zone);
  return get_post($zone_id);
}

function vz_am_update_zone($data) {
  $zone = [
    'ID' => $data['id'],
    'post_title' => $data['title'],
    'post_content' => $data['description']
  ];
  wp_update_post($zone);
  return get_post($data['id']);
}

function vz_am_delete_zone($data) {
  wp_delete_post($data['id']);
  return ['message' => 'Zone deleted'];
}

function vz_am_check_permission() {
  return current_user_can('editor');
}

