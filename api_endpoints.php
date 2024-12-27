<?php
add_action('rest_api_init', 'vzi_register_endpoints');
function vzi_register_endpoints() {
  register_rest_route('vz-inventory/v1', '/zones', [
    'methods' => 'GET',
    'callback' => 'vzi_get_zones',
    'permission_callback' => 'vzi_check_permission'
  ]);
  register_rest_route('vz-inventory/v1', '/zones/(?P<id>\d+)', [
    'methods' => 'GET',
    'callback' => 'vzi_get_zone',
    'permission_callback' => 'vzi_check_permission'
  ]);
  register_rest_route('vz-inventory/v1', '/zones/(?P<id>[\w-]+)', [
    'methods' => 'PUT',
    'callback' => 'vzi_update_zone',
    'permission_callback' => 'vzi_check_permission'
  ]);
  register_rest_route('vz-inventory/v1', '/zones/(?P<id>\d+)', [
    'methods' => 'DELETE',
    'callback' => 'vzi_delete_zone',
    'permission_callback' => 'vzi_check_permission'
  ]); 
  register_rest_route('vz-inventory/v1', '/product/(?P<id>[\w-]+)', [
    'methods' => 'POST',
    'callback' => 'vzi_update_product',
    'permission_callback' => 'vzi_check_permission'
  ]);
}

function vzi_update_product($data) {
  $zone_id = $data['zone_id'];
  $zone = get_post($zone_id);
  if (!$zone || $zone->post_type != 'vzi-zones') {
    return rest_ensure_response([
      'error' => 'Zone not found'
    ]);
  }

  $sku = $data['sku'];
  $id = $data['id'];
  $title = $data['title'];
  $quantity = $data['quantity'];
  $isInventory = $data['isInventory'];
  $result = false;

  if ($id == 'new') {
    $result = vzi_add_product_to_zone($sku, $zone_id, $quantity, $title);
  } else {
    vzi_product_log($sku, $zone_id, $title, $quantity, $isInventory);
  }
  return rest_ensure_response([
    'message' => 'success',
    'product' => [
      'ID' => $result,
      'sku' => $sku,
      'title' => get_the_title($result),
    ]
  ]);
}

function vzi_get_zones($data) {
  $zone_id = $data['parent_id'];

  if ($zone_id == null) {
    $zone_id = 0;
  }

  $args = [
    'post_type' => 'vzi-zones',
    'posts_per_page' => -1,
    'post_parent' => $zone_id,
    'orderby' => 'title',
    'order' => 'ASC',
    'fields' => ['title', 'ID', 'post_parent'],
  ];
  $zones = get_posts($args);

  if ($zone_id > 0) {
    $products_ids = get_post_meta($zone_id, 'vzi_products_in_zone', true);
    if (!$products_ids) {
      $products_ids = [];
    }
    $products = [];
    foreach ($products_ids as $product) {
      $products[] = [
        'id' => $product,
        'title' => get_the_title($product),
        'sku' => get_post_meta($product, '_sku', true),
      ];
    }
  } else {
    $products = [];
  }

  $zones_filtered = [];
  foreach ($zones as $zone) {
    $zones_filtered[] = [
      'id' => $zone->ID,
      'post_title' => $zone->post_title,
      'parent_id' => $zone->post_parent,
      'color' => get_post_meta($zone->ID, 'vzi_zone_color', true),
    ];
  }

  return [
    'zones' => $zones_filtered,
    'products' => $products,
    'breadcrumb' => vzi_get_zone_breadcrumb($zone_id),
    'title' => get_the_title($zone_id),
  ];
}

function vzi_get_zone_breadcrumb($zone_id) {
  if ($zone_id == 0) {
    return [];
  }
  $breadcrumb = [];
  $zone = get_post($zone_id);
  while ($zone->post_parent > 0) {
    $breadcrumb[] = [
      'id' => $zone->ID,
      'title' => $zone->post_title,
    ];
    $zone = get_post($zone->post_parent);
  }
  $breadcrumb[] = [
    'id' => $zone->ID,
    'title' => $zone->post_title,
  ];
  return array_reverse($breadcrumb);
}

function vzi_get_zone($data) {
  $zone = get_post($data['id']);
  return $zone;
}

function vzi_update_zone($data) {
  $id = $data['id'];
  $title = $data['post_title'];
  $color = $data['color'];
  if ( $id === 'new') {
    $parent_id = $data['parent_id'] ? $data['parent_id'] : 0;
    $zone = [
      'post_title' => $title,
      'post_status' => 'publish',
      'post_type' => 'vzi-zones',
      'post_parent' => $parent_id,
    ];
    $id = wp_insert_post($zone);
  } else {
    $zone = [
      'ID' => $id,
      'post_title' => $title,
    ];
    wp_update_post($zone);
  }
  update_post_meta($id, 'vzi_zone_color', $color);
  return rest_ensure_response(
    [
      'message' => 'success', 
      'id' => $id
      ]
  );
}

function vzi_delete_zone($data) {
  wp_delete_post($data['id']);
  return ['message' => 'Zone deleted'];
}

function vzi_check_permission() {
  if (vzi_is_env()) {
    return true;
  }
  return current_user_can('edit_pages');
}

