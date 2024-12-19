# Viroz Inventory
This is a WordPress plugin that is open source and aims at controlling que inventory, quantities places and movements, of products and services.

## Product Zones and Quantity Log
The idea is to divide the products into their zones. This zones are like folders that represent a place in reality where products are stored. When a  User with Editor capabilites uses the website they will be able to add quantity logs: The exant ammount of a certain product that they can see in the moment. This logs can represent rewrites, additions and / or subtractions of one or several products. 

## The hard part
Calculating large ammounts of logs into their correct result numbers based on their timestamp and zone. 


# Todo
## V0.5 feature list:
[ ] Easy way to set development environment
[ ] Make wp admin submenu - Zones, Inventory, Consolidations
[ ] Add color to zone
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

[ ] The Fun Stuff -> Consolidations - a place where the total quantity of products is consolidated in a single registry to make counting easier. You can see the actions of each users and how the total came to be. Accept it to consolidate it and update WooCommerce quantity



# V2 - Product Pipelines
In this version administrators will be able to sell compounded products - which depend on the quantity of other products, to be able to quantify resources and pipelines
WooCommerce will be able to display the max ammount of producable products and administrators will be able to know the state and the responsible users to finish the product and deliver it.

# V3 - Offers (WooCommerce Override)
As you can see products are not products in woocommerce, they are offers. A product can be offered multiple times, but still be available until one is processed. in this version we aim to create a new interface for eCommerce where retailers can offer the same products in multiple ways - compounded, processed, raw, I hope you get it, and still manage their inventory understandibly. Its still kinda far away but thats the aim

# V4 - Purchases 
top secret, my brain hasn't told me yet but it will aim to manage the entries of resources to the commerce, manage their costs and availability or resources, and therefore products, and therefore, offers. Yes im a genius 

