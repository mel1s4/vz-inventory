<?php
  $plugin_url = plugin_dir_url(__FILE__);
  $parent_id = isset($_GET['parent_id']) ? $_GET['parent_id'] : 0;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="Viroz Inventory App">
  <link rel="stylesheet" href="<?php echo $plugin_url ?>build\static\css\main.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>
    Viroz Inventory App
  </title>
</head>
<body>
  <script>
    var vz_app_params = {
      rest_url: '<?php echo rest_url() ?>',
      rest_nonce: '<?php echo wp_create_nonce('wp_rest') ?>',
      results: <?php echo json_encode(vzi_get_zones(['parent_id' => $parent_id])) ?>,
    };
    window.vz_app_params = vz_app_params;
  </script>
  <div id="root"></div>
  <script src="<?php echo $plugin_url ?>build\static\js\main.js"></script>
</body>
</html>