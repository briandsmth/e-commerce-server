const express = require('express')
const productRouter= express.Router()
const auth = require('../middleware/auth_middleware')
const { Product } = require('../models/product')

//api/product?category=mobile
productRouter.get('/api/product', auth, async(req, res)=>{
  try {
    const products = await Product.find({category: req.query.category})
    res.json(products)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
});

//get product by search
productRouter.get('/api/product/search/:name', auth, async(req, res)=>{
  try {
    const products = await Product.find({
      name: {$regex : req.params.name, $options: "i"},
    });
    res.json(products)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
});

//post rate the products
productRouter.post('/api/rate-product', auth, async(req, res)=>{
  try {
    const {id, rating} = req.body;
    let product = await Product.findById(id);

    for (let i = 0; i < product.ratings.length; i++) {
      if (product.ratings[i].userId == req.user) {
        product.ratings.splice(i, 1);
        break;
      }
      
    }

    const ratingSchema = {
      userId: req.user,
      rating,
    };

    product.ratings.push(ratingSchema);
    product = await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

productRouter.get('/api/deal-of-day', auth, async (req, res) => {
  try {
    let products = await Product.find({});
    products = products.sort((a, b) => {
      let aSum = 0;
      let bSum = 0;

      for(let i=0; i<a.ratings.length; i++){
        aSum+= a.ratings[i].rating;
      }

      for(let i=0; i<b.ratings.length; i++){
        bSum+= b.ratings[i].rating;
      }
      return aSum < bSum ? 1 : -1;
    });

    res.json(products[0]);
  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

module.exports = productRouter;