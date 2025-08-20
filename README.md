![image](https://github.com/user-attachments/assets/5debba93-a0ce-4eac-a7fa-67244672faa1)

# Viroz Inventory

A WordPress plugin that provides advanced inventory management through hierarchical zones and WooCommerce integration. The plugin features a modern React-based interface for organizing products into location-based zones with powerful CRUD operations.

## Overview

Viroz Inventory extends WooCommerce by introducing a zone-based inventory management system. Products are organized into hierarchical zones (like folders) that represent physical storage locations. This allows businesses to track where products are stored and manage inventory across multiple locations efficiently.

## Architecture

### Backend (PHP/WordPress)
- **Custom Post Type**: `vzi-zones` for zone management
- **REST API**: Custom endpoints at `/wp-json/vz-inventory/v1/`
- **WooCommerce Integration**: Automatic product creation and SKU management
- **Permission System**: Editor-level capabilities required for inventory management

### Frontend (React)
- **Single Page Application**: Built with React 19 and Create React App
- **Modern UI**: Responsive design with SCSS styling
- **Real-time Updates**: Axios-based API communication
- **Development Mode**: Localhost CORS support for development

## Current Features (v0.5)

### ✅ Implemented Features

#### Zone Management
- **Hierarchical Zones**: Create parent-child zone relationships
- **Color Coding**: Assign colors to zones for visual organization
- **CRUD Operations**: Create, read, update, and delete zones
- **Breadcrumb Navigation**: Navigate through zone hierarchy
- **Zone Deletion**: Confirmation dialogs for safe deletion

#### Product Management
- **SKU-based Assignment**: Add products to zones using SKU codes
- **Auto Product Creation**: Creates WooCommerce products if SKU doesn't exist
- **Product Removal**: Remove products from specific zones
- **WordPress Integration**: Direct links to edit products in WordPress admin
- **Flexible Input**: Numeric/text input modes for SKU entry

#### User Interface
- **Admin Menu Integration**: Accessible via WordPress admin menu
- **React SPA**: Modern single-page application interface
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Feedback**: Loading states and error handling

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/zones` | Get zones by parent ID with products |
| GET | `/zones/{id}` | Get specific zone details |
| POST | `/zones` | Create new zone |
| PUT | `/zones/{id}` | Update existing zone |
| DELETE | `/zones/{id}` | Delete zone |
| POST | `/product/{id}` | Add/update product in zone |
| DELETE | `/product/{id}` | Remove product from zone |

### Database Structure

#### Post Type: `vzi-zones`
- **post_title**: Zone name
- **post_parent**: Parent zone ID (for hierarchy)
- **post_status**: publish
- **Meta Fields**:
  - `vzi_zone_color`: Hex color code
  - `vzi_products_in_zone`: Array of product IDs

## Installation & Setup

### Requirements
- WordPress 5.0+
- WooCommerce plugin
- PHP 7.4+
- Node.js 14+ (for development)

### Installation
1. Upload plugin to `/wp-content/plugins/vz-inventory/`
2. Activate plugin in WordPress admin
3. Access via **VZ Inventory** menu in WordPress admin

### Development Setup
```bash
cd frontend/
npm install
npm start  # Starts development server on localhost:3000
npm run build  # Builds production files
```

### Build Scripts
- `build-and-rename.sh` (Linux/Mac)
- `build-and-rename.ps1` (Windows PowerShell)

## Usage

### Creating Zones
1. Navigate to **VZ Inventory > Zone Navigation**
2. Click **+ Zone** button
3. Enter zone name and select color
4. Save to create the zone

### Adding Products
1. Navigate into a zone (zones can contain products)
2. Click **+ Product** button
3. Enter product SKU
4. System will find existing product or create new one
5. Save to add product to zone

### Zone Navigation
- Use breadcrumb navigation to move between zones
- Click zone names to enter sub-zones
- Use "Home" link to return to root level

## Development Notes

### File Structure
```
vz-inventory/
├── functions.php          # Main plugin file & WooCommerce integration
├── init.php              # Post type registration
├── api_endpoints.php     # REST API endpoints
├── viroz_helpers.php     # Utility functions
├── frontend/             # React application
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── zoneArchive/  # Zone management component
│   │   ├── api.js        # API helper functions
│   │   └── translations.js
│   ├── public/           # Static assets
│   └── build/            # Compiled React app
└── README.md
```

### Key Functions
- `vzi_add_product_to_zone()`: Adds products to zones
- `vzi_get_zones()`: Retrieves zone hierarchy with products
- `vzi_check_permission()`: Permission validation
- `vzi_get_zone_breadcrumb()`: Builds navigation breadcrumb

### Security
- WordPress nonce verification for REST API
- Editor capability requirements
- Sanitized input handling
- CORS support for development environment

## Product Zones and Quantity Log (Future)
The concept is to divide products into zones that represent physical storage locations. Future versions will include quantity logging capabilities where users with Editor capabilities can add quantity logs representing the exact amount of products visible at any moment. These logs will represent additions, subtractions, or resets of product quantities.

## The Technical Challenge (Future)
The most complex aspect will be calculating large amounts of quantity logs into correct result numbers based on their timestamps and zones, providing real-time inventory accuracy across multiple locations. 


# Todo
## V0.5 feature list:
[X] Easy way to set development environment
[X] Make wp admin submenu - Zones, Inventory, Consolidations
[X] Add color to zone
[ ] Add product by SKU and or Name
[ ] Alert before deleting a product and zone
[ ] Select products and zones
[ ] Delete selected products and zones
[ ] Move selection to new zone
[ ] Cut/paste selection
[ ] Copy/paste selection
[ ] Search product in zones


## V1.0 - Inventory log
[ ] Create table, if not exists '[prefix]vz_inventory_log'
    log_id[primary] | timestamp | user_id | zone_id | product_id | type [ add, subtract, reset ] | Quantity | motive [entry, sell, adjustment, inventory, consolidation]
[ ] Show in single product -> Calculate total quantity of product 
[ ] Information about the date and user of the log
[ ] Product quantities and places search archive
[ ] The Fun Stuff -> Consolidations - a place where the total quantity of products is consolidated in a single registry to make counting easier. You can see the actions of each users and how the total came to be. Accept it to consolidate it and update WooCommerce quantity


# V2 - Product Pipelines
[ ] Pipe line post type
[ ] Create pipe line page
[ ] Pipe line stages, its resources and responsibles
[ ] Pipe line estimated time 
[ ] Pipe line user actions dashboard

In this version administrators will be able to sell compounded products - which depend on the quantity of other products, to be able to quantify resources and pipelines
WooCommerce will be able to display the max ammount of producable products and administrators will be able to know the state and the responsible users to finish the product and deliver it.

# V3 - Offers (WooCommerce Override)
[ ] Resources Post Type [relates directly to the inventory data]
[ ] Offers Post Type - What resources it need, pipelines it triggers
As you can see products are not products in woocommerce, they are offers. A product can be offered multiple times, but still be available until one is processed. in this version we aim to create a new interface for eCommerce where retailers can offer the same products in multiple ways - compounded, processed, raw, I hope you get it, and still manage their inventory understandibly. Its still kinda far away but thats the aim

# V4 - Purchases 
[ ] Supplier Post Type
[ ] Purchases Post Type
[ ] Resources from supplier, their cost
[ ] Purchases total spending
[ ] Purchases total value
top secret, my brain hasn't told me yet but it will aim to manage the entries of resources to the commerce, manage their costs and availability or resources, and therefore products, and therefore, offers. Yes im a genius 

