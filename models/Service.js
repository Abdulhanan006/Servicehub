const mongoose = require('mongoose');
const slugify = require('slugify');

const ServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    slug: {
      type: String,
      unique: true
    },
    short_description: {
      type: String,
      required: [true, 'Please add a short description'],
      maxlength: [200, 'Short description cannot be more than 200 characters']
    },
    full_description: {
      type: String,
      required: [true, 'Please add a full description']
    },
    image_url: {
      type: String,
      required: [true, 'Please add an image URL or upload an image']
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: ['Web', 'AI', 'Mobile', 'UI/UX', 'Marketing', 'Consulting', 'Other']
    },
    price: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Create slug from title before saving
ServiceSchema.pre('save', function () {
  if (!this.isModified('title')) {
    return;
  }
  this.slug = slugify(this.title, { lower: true, strict: true });
});

module.exports = mongoose.model('Service', ServiceSchema);
