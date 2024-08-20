const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     name: {
//       type: String,
//       required: true // Make name mandatory
//     },
//     age: {
//       type: Number,
//       min: 1, // Set minimum age
//       max: 120 // Set maximum age
//     }
//   });
  
//   const upload = mongoose.model("user", userSchema);

  const Products_schema = new mongoose.Schema({
    name: {
      type: String,
      required: true // Make name mandatory
    },
    description: {
      type: String,
      required: true // Make name mandatory
    },
    rating: {
      type: Number,
      required: true // Make name mandatory
    },
    rate: {
      type: Number,
      required: true // Make name mandatory
    },
    listing: {
      type: Boolean,
      default: true // Default value is true if not provided
    },
      category: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'category',
      required: true // Make name mandatory
    }
  })

  const Product = new mongoose.model('product',Products_schema)

  const Category_schema = new mongoose.Schema({
    name: {
      type: String,
      required: true // Make name mandatory
    },
    description: {
      type: String,
      required: true // Make name mandatory
    },
    listing:{
      type: Boolean,
      default: true,
      required: true
    },
    rate: {
      type: Number,
      required: true // Make name mandatory
    }
  })

  const Category = new mongoose.model('category',Category_schema)


  module.exports = {Product, Category}

