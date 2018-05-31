var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    //connects to the database from npm package

    // Your port; if not 8889

    port: 8889,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon_db"
})

//connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;

    console.log("Inzane Paintball" + connection.threadId + "\n");
    listProducts();

})

// This function allows user to look through products
function listProducts() {

    console.log("Inzane Paintball!! Choose from our selection of paintballs!")
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Item: " + res[i].item_id + " Product: " + res[i].product_name
                + " Skill Level: " + res[i].skill_level + " Department: " + res[i].department_name
                + " Price: " + res[i].price + " Quantity Left: " + res[i].stock_quantity + "\n")
        }
        purchasePrompt(res);
    })
}

// This function prompts the user on what product and quantity to purchase
function purchasePrompt(res) {
    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "Please enter the paintball product you would like to purchase: "
            },
            {
                name: "amount",
                type: "input",
                message: "Please enter the quantity of boxes you would like to purchase: ",
                validate: function (value) {
                    if (isNaN(value)) {
                        return "Please type in a number."
                    }

                    return true;
                }
            }
        ])
        .then(function (res) {
            checkQuantity(res);
        });
}

function updateProduct(productName, productQuantity, Price) {
    // console.log("Updating all paintball quantities...\n");
    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                product_name: productName
            },

            {
                stock_quantity: productQuantity
            },

            // { 
            // price: Price
            // }
        ]
    );

    // logs the actual query being run
    console.log(query.sql);
}

function start() {
    inquirer
        .prompt({
            name: "start",
            type: "confirm",
            message: "Would you like to buy an item?"
        })
        .then(function (res) {
            if (res.start) {
                listProducts();
            } else { }
            console.log("Come back and visit again!");
        })
}


function readProducts() {
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.log(res);
        connection.end();
    })
};

function checkQuantity(userInput) {
    connection.query("SELECT stock_quantity, price from products WHERE ?", { product_name: userInput.item }, function (err, res) {
        console.log(res);
        if (res.stock_quantity < userInput.amount) {
            console.log("This item is out of stock.");
        } else {
            console.log("Your order has been processed");
            showOrder(userInput.item, userInput.amount, userInput.price);
        }
    })
}

function showOrder(name, stock_quantity, price) {

    var orderCost = stock_quantity * price;
    console.log("Thank you. Your order is now complete.Your total is: $" + orderCost);
    updateProduct(name, stock_quantity);

    process.exit();
}