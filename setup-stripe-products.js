#!/usr/bin/env node

/**
 * Stripe Products and Prices Setup Script
 * Run this script to automatically create all required products and prices in Stripe
 * 
 * Usage:
 * 1. Install dependencies: npm install stripe dotenv
 * 2. Set your Stripe secret key in .env: 
 * 3. Run: node setup-stripe-products.js
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRODUCTS_CONFIG = {
  // Patient Subscription Plans
  patientBasic: {
    name: 'Basic Subscription',
    description: 'Basic medical consultation plan with up to 5 cases per month. Includes standard response time and email support.',
    metadata: {
      plan_type: 'BASIC',
      max_cases: '5',
      response_time: '48_hours',
      support_level: 'email'
    },
    prices: [
      {
        nickname: 'Basic Monthly',
        unit_amount: 2999, // $29.99
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          billing_cycle: 'monthly',
          plan_type: 'BASIC'
        }
      },
      {
        nickname: 'Basic Yearly',
        unit_amount: 29999, // $299.99
        currency: 'usd',
        recurring: {
          interval: 'year'
        },
        metadata: {
          billing_cycle: 'yearly',
          plan_type: 'BASIC',
          savings: '10%'
        }
      }
    ]
  },

  patientStandard: {
    name: 'Standard Subscription',
    description: 'Standard medical consultation plan with up to 15 cases per month. Includes priority response time, specialist consultations, and email & phone support.',
    metadata: {
      plan_type: 'STANDARD',
      max_cases: '15',
      response_time: '24_hours',
      support_level: 'email_phone',
      specialist_access: 'true'
    },
    prices: [
      {
        nickname: 'Standard Monthly',
        unit_amount: 5999, // $59.99
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          billing_cycle: 'monthly',
          plan_type: 'STANDARD'
        }
      },
      {
        nickname: 'Standard Yearly',
        unit_amount: 59999, // $599.99
        currency: 'usd',
        recurring: {
          interval: 'year'
        },
        metadata: {
          billing_cycle: 'yearly',
          plan_type: 'STANDARD',
          savings: '16%'
        }
      }
    ]
  },

  patientPremium: {
    name: 'Premium Subscription',
    description: 'Premium medical consultation plan with unlimited cases. Includes urgent response time, 24/7 priority support, dedicated health advisor, and all specialist consultations.',
    metadata: {
      plan_type: 'PREMIUM',
      max_cases: 'unlimited',
      response_time: '4_hours',
      support_level: '24_7_priority',
      specialist_access: 'all',
      health_advisor: 'true'
    },
    prices: [
      {
        nickname: 'Premium Monthly',
        unit_amount: 9999, // $99.99
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          billing_cycle: 'monthly',
          plan_type: 'PREMIUM'
        }
      },
      {
        nickname: 'Premium Yearly',
        unit_amount: 99999, // $999.99
        currency: 'usd',
        recurring: {
          interval: 'year'
        },
        metadata: {
          billing_cycle: 'yearly',
          plan_type: 'PREMIUM',
          savings: '16%'
        }
      }
    ]
  },

  // Doctor Subscription
  doctorYearly: {
    name: 'Doctor Yearly Subscription',
    description: 'Annual subscription for doctors to join the medical consultation platform. Includes 90-day free trial, unlimited case access, and payout management.',
    metadata: {
      user_type: 'DOCTOR',
      trial_days: '90',
      billing_cycle: 'yearly'
    },
    prices: [
      {
        nickname: 'Doctor Yearly',
        unit_amount: 49999, // $499.99
        currency: 'usd',
        recurring: {
          interval: 'year',
          trial_period_days: 90
        },
        metadata: {
          billing_cycle: 'yearly',
          user_type: 'DOCTOR',
          trial_period: '90_days'
        }
      }
    ]
  },

  // Consultation Fee Product (for dynamic pricing)
  consultationFee: {
    name: 'Consultation Fee',
    description: 'Pay-per-consultation service fee. Price varies by doctor specialization.',
    metadata: {
      payment_type: 'CONSULTATION',
      pricing: 'dynamic'
    },
    // No prices defined here - will be created dynamically per consultation
  }
};

async function createProduct(productConfig) {
  try {
    console.log(`\n📦 Creating product: ${productConfig.name}`);
    
    const product = await stripe.products.create({
      name: productConfig.name,
      description: productConfig.description,
      metadata: productConfig.metadata
    });

    console.log(`✅ Product created: ${product.id}`);
    console.log(`   Name: ${product.name}`);
    
    const priceIds = [];
    
    if (productConfig.prices) {
      for (const priceConfig of productConfig.prices) {
        console.log(`\n💰 Creating price: ${priceConfig.nickname}`);
        
        const price = await stripe.prices.create({
          product: product.id,
          nickname: priceConfig.nickname,
          unit_amount: priceConfig.unit_amount,
          currency: priceConfig.currency,
          recurring: priceConfig.recurring,
          metadata: priceConfig.metadata
        });

        console.log(`✅ Price created: ${price.id}`);
        console.log(`   Amount: ${(priceConfig.unit_amount / 100).toFixed(2)} ${priceConfig.currency.toUpperCase()}`);
        console.log(`   Interval: ${priceConfig.recurring?.interval || 'one-time'}`);
        
        priceIds.push({
          nickname: priceConfig.nickname,
          id: price.id,
          amount: priceConfig.unit_amount
        });
      }
    }

    return {
      product,
      prices: priceIds
    };
  } catch (error) {
    console.error(`❌ Error creating product ${productConfig.name}:`, error.message);
    throw error;
  }
}

async function setupStripeProducts() {
  console.log('🚀 Starting Stripe Products Setup...\n');
  console.log('═══════════════════════════════════════════════════════════');

  const results = {};

  try {
    // Create Patient Subscription Products
    console.log('\n\n📋 PATIENT SUBSCRIPTION PLANS');
    console.log('═══════════════════════════════════════════════════════════');

    results.patientBasic = await createProduct(PRODUCTS_CONFIG.patientBasic);
    results.patientStandard = await createProduct(PRODUCTS_CONFIG.patientStandard);
    results.patientPremium = await createProduct(PRODUCTS_CONFIG.patientPremium);

    // Create Doctor Subscription Product
    console.log('\n\n👨‍⚕️ DOCTOR SUBSCRIPTION');
    console.log('═══════════════════════════════════════════════════════════');

    results.doctorYearly = await createProduct(PRODUCTS_CONFIG.doctorYearly);

    // Create Consultation Fee Product
    console.log('\n\n💉 CONSULTATION FEE PRODUCT');
    console.log('═══════════════════════════════════════════════════════════');

    results.consultationFee = await createProduct(PRODUCTS_CONFIG.consultationFee);

    // Print Summary
    console.log('\n\n✨ SETUP COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n📝 Configuration for your application.properties:\n');
    
    console.log('# Patient Subscription Price IDs');
    console.log(`stripe.price.basic.monthly=${results.patientBasic.prices.find(p => p.nickname === 'Basic Monthly')?.id}`);
    console.log(`stripe.price.basic.yearly=${results.patientBasic.prices.find(p => p.nickname === 'Basic Yearly')?.id}`);
    console.log(`stripe.price.standard.monthly=${results.patientStandard.prices.find(p => p.nickname === 'Standard Monthly')?.id}`);
    console.log(`stripe.price.standard.yearly=${results.patientStandard.prices.find(p => p.nickname === 'Standard Yearly')?.id}`);
    console.log(`stripe.price.premium.monthly=${results.patientPremium.prices.find(p => p.nickname === 'Premium Monthly')?.id}`);
    console.log(`stripe.price.premium.yearly=${results.patientPremium.prices.find(p => p.nickname === 'Premium Yearly')?.id}`);
    
    console.log('\n# Doctor Subscription Price ID');
    console.log(`stripe.price.doctor.yearly=${results.doctorYearly.prices.find(p => p.nickname === 'Doctor Yearly')?.id}`);
    
    console.log('\n# Product IDs');
    console.log(`stripe.product.patient.basic=${results.patientBasic.product.id}`);
    console.log(`stripe.product.patient.standard=${results.patientStandard.product.id}`);
    console.log(`stripe.product.patient.premium=${results.patientPremium.product.id}`);
    console.log(`stripe.product.doctor=${results.doctorYearly.product.id}`);
    console.log(`stripe.product.consultation=${results.consultationFee.product.id}`);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('\n💡 Next Steps:');
    console.log('1. Copy the price IDs to your application.properties file');
    console.log('2. Update your frontend .env with the publishable key');
    console.log('3. Set up webhook endpoints in Stripe Dashboard');
    console.log('4. Test the payment flows');
    console.log('\n✅ Setup script completed successfully!');

  } catch (error) {
    console.error('\n\n❌ Setup failed:', error.message);
    console.error('\nPlease check your Stripe API key and try again.');
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY not found in environment variables');
    console.error('Please create a .env file with your Stripe secret key:');
    console.error('STRIPE_SECRET_KEY=sk_test_...');
    process.exit(1);
  }

  setupStripeProducts().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { setupStripeProducts };