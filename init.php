<?php 

$zones_slug = get_option('vz_zones_slug', 'zones');
register_post_type('vzi-zones', [
  'labels' => [
    'name' => __vz('Product Zones'),
    'singular_name' => __vz('Zone')
  ],
  'hierarchical' => true,
  'public' => false,
  'has_archive' => false,
  'rewrite' => ['slug' => $zones_slug],
  'show_in_rest' => false,
  'supports' => ['title', 'editor'],
  'show_ui' => true,
  'show_in_menu' => 'vz-inventory',
]);


vzi_create_database_table();
