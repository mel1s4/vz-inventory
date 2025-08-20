<?php
  $plugin_url = plugin_dir_url(__FILE__);
  $parent_id = isset($_GET['parent_id']) ? $_GET['parent_id'] : 0;
?>
<!DOCTYPE html>
<html lang="<?php echo get_locale() ?>">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="<?php echo esc_attr(__('Viroz Inventory App', VZI_TEXT_DOMAIN)) ?>">
  <link rel="stylesheet" href="<?php echo $plugin_url ?>build/static/css/main.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>
    <?php echo esc_html(__('VZ Inventory', VZI_TEXT_DOMAIN)) ?>
  </title>
</head>
<body>
  <?php 
    // Ensure locale is loaded
    $locale = get_locale();
    
    // Load WordPress scripts for i18n - Force loading
    if (!wp_script_is('wp-i18n', 'registered')) {
      wp_register_script('wp-i18n', includes_url('js/dist/i18n.min.js'), array(), false, false);
    }
    if (!wp_script_is('wp-i18n', 'enqueued')) {
      wp_enqueue_script('wp-i18n');
    }
    wp_print_scripts('wp-i18n');
    
    // Force creation of JSON file if it doesn't exist
    $json_translation_file = plugin_dir_path(__FILE__) . "../languages/vz-inventory-{$locale}-vz-inventory-frontend.json";
    if (!file_exists($json_translation_file) && $locale !== 'en_US') {
      // Try to call our conversion function
      if (function_exists('vzi_create_script_translations')) {
        vzi_create_script_translations();
      }
    }
  ?>
  <script>
    // Debug information
    console.log('WordPress Locale:', '<?php echo get_locale() ?>');
    console.log('Text Domain:', '<?php echo VZI_TEXT_DOMAIN ?>');
    console.log('Translation file expected:', '<?php echo plugin_dir_path(__FILE__) . "../languages/vz-inventory-{$locale}-vz-inventory-frontend.json" ?>');
    console.log('Translation file exists:', <?php echo file_exists(plugin_dir_path(__FILE__) . "../languages/vz-inventory-{$locale}-vz-inventory-frontend.json") ? 'true' : 'false' ?>);
    
    var vz_app_params = {
      rest_url: '<?php echo rest_url() ?>',
      src_url: '<?php echo $plugin_url ?>build/',
      rest_nonce: '<?php echo wp_create_nonce('wp_rest') ?>',
      results: <?php echo json_encode(vzi_get_zones(['parent_id' => $parent_id])) ?>,
      locale: '<?php echo get_locale() ?>',
      text_domain: '<?php echo VZI_TEXT_DOMAIN ?>',
      is_rtl: <?php echo is_rtl() ? 'true' : 'false' ?>,
    };
    window.vz_app_params = vz_app_params;
    
    console.log('VZ App Params:', vz_app_params);
    
    <?php
    // Load translations manually if available
    $json_translation_file = plugin_dir_path(__FILE__) . "../languages/vz-inventory-{$locale}-vz-inventory-frontend.json";
    if (file_exists($json_translation_file)) {
      $translations = file_get_contents($json_translation_file);
      echo "console.log('Loading translations for locale: {$locale}');";
      echo "if (typeof wp !== 'undefined' && wp.i18n) {";
      echo "  console.log('wp.i18n available, setting locale data');";
      echo "  wp.i18n.setLocaleData(" . $translations . ", '" . VZI_TEXT_DOMAIN . "');";
      echo "  console.log('Translations loaded:', wp.i18n.getLocaleData('" . VZI_TEXT_DOMAIN . "'));";
      echo "} else {";
      echo "  console.error('wp.i18n not available!');";
      echo "}";
    } else {
      echo "console.log('No translation file found for locale: {$locale}');";
      echo "console.log('Looking for file:', '{$json_translation_file}');";
      
      // If Spanish but no translation file, inject fallback translations
      if (strpos($locale, 'es') === 0) {
        echo "console.log('Spanish locale detected, loading fallback translations');";
        echo "if (typeof wp !== 'undefined' && wp.i18n) {";
        echo "  var fallbackTranslations = " . json_encode([
          'domain' => 'messages',
          'locale_data' => [
            'messages' => [
              '' => [
                'domain' => 'messages',
                'plural_forms' => 'nplurals=2; plural=(n != 1);',
                'lang' => $locale
              ],
              'Home' => ['Inicio'],
              'Zone' => ['Zona'],
              'Product' => ['Producto'],
              'Add' => ['Agregar'],
              'Edit' => ['Editar'],
              'Delete' => ['Eliminar'],
              'Cancel' => ['Cancelar'],
              'Save' => ['Guardar'],
              'Loading...' => ['Cargando...'],
              'Dark' => ['Oscuro'],
              'Light' => ['Claro'],
              'New Zone' => ['Nueva Zona'],
              'No Zones' => ['Sin Zonas'],
              'No Products' => ['Sin Productos'],
              'Product SKU' => ['SKU del Producto'],
              'Edit in WordPress' => ['Editar en WordPress'],
              'Are you sure you want to delete this zone?' => ['¿Estás seguro de que quieres eliminar esta zona?'],
              'Are you sure you want to delete this product?' => ['¿Estás seguro de que quieres eliminar este producto?']
            ]
          ]
        ]) . ";";
        echo "  wp.i18n.setLocaleData(fallbackTranslations, '" . VZI_TEXT_DOMAIN . "');";
        echo "  console.log('Fallback Spanish translations loaded');";
        echo "}";
      }
    }
    ?>
  </script>
  <div id="root"></div>
  <script src="<?php echo $plugin_url ?>build/static/js/main.js" id="vz-inventory-frontend"></script>
</body>
</html>