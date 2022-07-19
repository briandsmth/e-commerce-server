const e = require('express');
const express = require('express')
const adminRouter = express.Router()
const admin = require('../middleware/admin_middleware');
const { Product } = require('../models/product');
const Order = require('../models/orders');
const { PromiseProvider } = require('mongoose');

// Add product
adminRouter.post('/admin/add-product', admin, async (req, res) => {
  try {
    const{ name, description, images, quantity, price, category } = req.body;
    let product = new Product({
      name,
      description,
      images,
      quantity,
      price,
      category,
    })
    productSave = await product.save();
    res.json(productSave);
    
  } catch (error) {
    res.status(500).json({error : error.message})
  }
})

//get product data

adminRouter.get('/admin/get-products', admin, async(req, res)=>{
  try {
    const products = await Product.find({})
    res.json(products)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

//Delete product
adminRouter.post('/admin/delete-product', admin, async (req, res)=>{
  try {
    const {id} = req.body;
    let product = await Product.findByIdAndDelete(id);
    res.json(product);
    
  } catch (error) {
    res.status(500).json({error : error.message})
  }
})

adminRouter.get('/admin/get-orders', admin, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    res.status(500).json({error: e.message});
  }
})

adminRouter.post('/admin/change-order-status', admin, async (req, res)=>{
  try {
    const {id, status} = req.body;
    let order = await Order.findById(id);
    order.status = status;
    order = await order.save();
    res.json(order);
    
  } catch (error) {
    res.status(500).json({error : error.message})
  }
})

adminRouter.get('/admin/analytics', admin, async(req, res)=>{
  try {
    const orders = await Order.find({});
    let totalearnings = 0;

    for(let i=0; i<orders.length; i++){
      for(let a=0; a<orders[i].products.length; a++){
        totalearnings += orders[i].products[a].quantity * orders[i].products[a].product.price
      }
    }
    // Category wise order get Data
    let mobileEarnings = await getCategoryWiseProduct("Mobiles");
    let essentialEarnings = await getCategoryWiseProduct("Essentials");
    let applianceEarnings = await getCategoryWiseProduct("Appliances");
    let booksEarnings = await getCategoryWiseProduct("Books");
    let fashionEarnings = await getCategoryWiseProduct("Fashion");

    let earnings = {
      totalearnings,
      mobileEarnings,
      essentialEarnings,
      applianceEarnings,
      booksEarnings,
      fashionEarnings,
    };

    res.json(earnings);

  } catch (error) {
    res.status(500).json({error: error.message});
  }
})

async function getCategoryWiseProduct(category){
  let earnings = 0;
  let categoryOrders = await Order.find({
    'products.product.category': category,
  });

  for(let i=0; i<categoryOrders.length; i++){
    for(let a=0; a<categoryOrders[i].products.length; a++){
      earnings +=
      categoryOrders[i].products[a].quantity * categoryOrders[i].products[a].product.price;
    }
  }
  return earnings;
}

module.exports = adminRouter;

