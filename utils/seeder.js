const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Service = require('../models/Service');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Service.deleteMany();

    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'password123'
    });

    const sampleServices = [
      {
        title: 'Custom Website Development',
        short_description: 'High-performance, responsive websites tailored to your brand.',
        full_description: 'We build custom, full-stack web applications using the latest technologies like React, Node.js, and MongoDB. Our solutions are scalable, secure, and optimized for performance.',
        image_url: '/images/web-dev.jpg',
        category: 'Web',
        price: 999,
        status: 'active'
      },
      {
        title: 'AI Integration & Consulting',
        short_description: 'Leverage the power of Artificial Intelligence in your business.',
        full_description: 'We help you integrate LLMs, machine learning models, and automated AI workflows into your existing systems to boost productivity and unlock new capabilities.',
        image_url: '/images/ai-consulting.jpg',
        category: 'AI',
        price: 1499,
        status: 'active'
      },
      {
        title: 'Mobile App Development',
        short_description: 'Native and cross-platform mobile apps for iOS and Android.',
        full_description: 'From concept to deployment, we build user-friendly mobile applications that engage your customers and drive growth.',
        image_url: '/images/mobile-dev.jpg',
        category: 'Mobile',
        price: 1299,
        status: 'active'
      },
      {
        title: 'UI/UX Design',
        short_description: 'Beautiful, intuitive interfaces that users love.',
        full_description: 'Our design team creates stunning, user-centric interfaces. We focus on both aesthetics and usability to ensure a seamless experience for your users.',
        image_url: '/images/ui-ux.jpg',
        category: 'UI/UX',
        price: 799,
        status: 'active'
      }
    ];

    for (const service of sampleServices) {
      await Service.create(service);
    }

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Service.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
