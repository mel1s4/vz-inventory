cd frontend;
npm install;
npm run build;

cd build/static/js;
mv main.*.js main.js;
mv main.*.js.map main.js.map;
cd ../css;
mv main.*.css main.css;
mv main.*.css.map main.css.map;

cd ../../../../;
mkdir 'vz-inventory-plugin';
mkdir 'vz-inventory-plugin/frontend';
mkdir 'vz-inventory-plugin/frontend/build';

find . -maxdepth 1 -type f -exec cp {} vz-inventory-plugin/ \;
cp -r frontend/build/* vz-inventory-plugin/frontend/build/

# cp 'frondend/index.php' 'vz-inventory-plugin/frontend/index.php';
cp frontend/index.php vz-inventory-plugin/frontend/index.php;

cd vz-inventory-plugin;
rm -rf prepare_plugin.sh;
rm -rf README.md;
zip -r ../vz-inventory-plugin.zip .;
cd ../;

rm -rf vz-inventory-plugin;

