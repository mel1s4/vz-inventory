<?php 


// create a custom post type called zones
// get from option
$zones_slug = get_option('vz_zones_slug', 'zones');
register_post_type('vzi-zones', [
  'labels' => [
    'name' => __vz('Product Zones'),
    'singular_name' => __vz('Zone')
  ],
  'public' => false,
  'has_archive' => false,
  'rewrite' => ['slug' => $zones_slug],
  'show_in_rest' => false
]);


