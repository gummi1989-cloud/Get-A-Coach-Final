import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createServer as createViteServer } from 'vite';
import { onRequest } from 'firebase-functions/v2/https';
import firebaseConfig from './firebase-applet-config.json';

// Load environment variables from .env.local and .env
dotenv.config({ path: '.env.local' });
dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase client for Firestore backend operations
const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const firestoreDb = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

// Lazy Stripe initialization ensuring secure server-side access via process.env
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = (process.env.STRIPE_SECRET_KEY || '').trim();
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not defined. Please set it in your environment or secrets.');
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// -----------------------------------------------------------------------------
// Stripe Webhook Endpoint (Requires raw body BEFORE express.json() is applied)
// -----------------------------------------------------------------------------
app.post(
  ['/api/stripeWebhook', '/api/stripe-webhook', '/api/webhook'],
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();

    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET is not set. Skipping webhook signature verification.');
      return res.status(200).json({ received: true, warning: 'Webhook secret missing' });
    }

    if (!sig) {
      console.error('Webhook error: Missing stripe-signature header.');
      return res.status(400).send('Webhook Error: Missing stripe-signature');
    }

    let event: Stripe.Event;
    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId || session.client_reference_id;

        if (bookingId) {
          await setDoc(
            doc(firestoreDb, 'bookings', bookingId),
            {
              paymentStatus: 'paid',
              paymentProvider: 'stripe',
              stripeSessionId: session.id,
              stripePaymentIntentId: session.payment_intent,
              amountTotal: session.amount_total ? session.amount_total / 100 : undefined,
              currency: session.currency,
              updatedAt: serverTimestamp()
            },
            { merge: true }
          );
        }
      }
      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Error handling webhook event:', error);
      return res.status(500).json({ error: 'Internal server error processing webhook' });
    }
  }
);

// Standard Middleware
app.use(express.json());

// -----------------------------------------------------------------------------
// Stripe Create Checkout Session Endpoint
// -----------------------------------------------------------------------------
app.post(
  ['/api/create-checkout-session', '/api/createCheckoutSession', '/api/stripe-checkout'],
  async (req, res) => {
    try {
      const { coachId, coachName, serviceTitle, amount, duration, clientName, clientEmail, bookingId } = req.body;

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Ungültiger Betrag angegeben.'
        });
      }

      const stripe = getStripe();
      const origin = req.headers.origin || req.headers.referer || `http://${req.headers.host}`;
      const cleanOrigin = origin.replace(/\/+$/, '');

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'twint'],
        line_items: [
          {
            price_data: {
              currency: 'chf',
              product_data: {
                name: `Coaching: ${serviceTitle || 'Session'} mit ${coachName || 'Coach'}`,
                description: duration ? `Dauer: ${duration} Minuten` : undefined,
              },
              unit_amount: Math.round(Number(amount) * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${cleanOrigin}/?payment=success&bookingId=${bookingId || ''}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${cleanOrigin}/?payment=cancelled&bookingId=${bookingId || ''}`,
        customer_email: clientEmail || undefined,
        client_reference_id: bookingId || undefined,
        metadata: {
          bookingId: bookingId || '',
          coachId: coachId || '',
          coachName: coachName || '',
          clientName: clientName || '',
          clientEmail: clientEmail || ''
        }
      });

      return res.status(200).json({
        success: true,
        id: session.id,
        url: session.url
      });
    } catch (error: any) {
      console.error('Error creating Stripe Checkout session:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Fehler beim Erstellen der Stripe Checkout-Session.'
      });
    }
  }
);

// -----------------------------------------------------------------------------
// Stripe Retrieve Session Status Endpoint
// -----------------------------------------------------------------------------
app.get(
  ['/api/session-status', '/api/stripe-session-status'],
  async (req, res) => {
    try {
      const sessionId = req.query.session_id as string;
      if (!sessionId) {
        return res.status(400).json({ success: false, error: 'Session ID erforderlich.' });
      }

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return res.status(200).json({
        success: true,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        metadata: session.metadata
      });
    } catch (error: any) {
      console.error('Error retrieving Stripe Checkout session:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Fehler beim Abrufen der Stripe Checkout-Session.'
      });
    }
  }
);

// Export Cloud Function
export const api = onRequest({ secrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] }, app);

// Only start standalone server in local development
if (process.env.NODE_ENV !== 'production' && !process.env.FUNCTION_TARGET && !process.env.K_SERVICE) {
  (async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Local dev server running on http://localhost:${PORT}`);
    });
  })();
}
