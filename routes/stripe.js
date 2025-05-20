const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent/:addressID', async (req, res) => {
  const {addressID} = req.params;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map(item => {
       
        return {
          price_data: {
            currency: "myr",
            product_data: {
              name: item.name,
            },
            unit_amount: item.price*100,
          },
          quantity: item.quantity,
        }
      }),
      success_url: `${process.env.CLIENT_URL}/User/Checkout/Success/${addressID}`,
      cancel_url: `${process.env.CLIENT_URL}/User/Checkout/Failed`,
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
});

module.exports = router;