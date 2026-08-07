Right now there can be multiple admin accounts be created. Need to remove the admin creating in the sign up page and there should only be 1 admin to the website i.e one email and one password to it. Also the admin can see everything about the website.

We need to create a new actor(employee) who is responsible for managing the user's queries, managing of the stores, validation of retailers and suppliers when they register to our website. There can be multiple employees and each of the employee will recieve their own queries to resolved, a validation of a particular supplir or a store will be shown to a employee and that wont be shown to other employees. Example: if there are 10 employees, and there are 20 stores to be validated, each employee gets 2 stores to be validated and that wont be shown to other employee.

The history of the purchase order for the retailer and the consumer doesn't work properly, need to fix that.
Returns management between supplier - retailer and retailer - consumer doesn't work accordingly, that also needs to be fixed.

The retailer is only able to create new stores while signing up, later after they are signed up, they aren't able to create a new stores, need to add a functionality for that in the retailer module.

Need to add a valid logic for the low stock alert and reorder recommendation for the retailer.

After a retailer has brought products from a supplier, the retailer must be able to change the price, margin and other relevant details of the product after the product has been delivered.

Need to maintain a overall sync in the website. Example: a product ordered by a retailer from a supplier results in the change in supplier and retailer's dashboard, supplier and retailer's product list, availability of the product in consumer's module.

Purchase orders do not validate supplier stock levels. A retailer can place a purchase order for a quantity that exceeds the supplier's actual available stock, and the system will accept it.

Transaction (POS) price forgery. The biller/transactions module accepts the product price directly from the request payload without validating it against the actual database price, allowing checkouts with manipulated or even negative prices.

Product deletion constraints are missing. A supplier can delete a product even if it has pending purchase orders or is actively stocked by retailers, which will break the retailer's inventory and pending orders.

Concurrency and stock recalculation bug. The transaction module rebuilds the entire inventory from all historical transactions every time a new order is placed. This overwrites manual stock adjustments and causes race conditions under concurrent checkouts.

Missing authorization scope on product updates/deletions. The product update and delete endpoints do not verify the retailerId or supplierId, meaning any authenticated user with the product ID can modify or delete another user's products.

The products being available to the consumer should be based on the location of the store and the consumer. Example: A consumer in city A should only be shown products of city A or nearby city A.