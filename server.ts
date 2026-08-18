import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createServer as createViteServer } from 'vite';
import firebaseConfig from './firebase-applet-config.json';

// Load environment variables from .env.local and .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = 3000;

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

    let event: Stripe.Event;

    try {
      if (sig && webhookSecret) {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
      } else {
        const bodyStr = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
        event = JSON.parse(bodyStr) as Stripe.Event;
      }
    } catch (err: any) {
      console.error('⚠️ Stripe Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId || session.client_reference_id;

      console.log(`✅ [Stripe Webhook] Checkout Session completed! Booking ID: ${bookingId}, Stripe Session: ${session.id}`);

      if (bookingId) {
        try {
          const bookingRef = doc(firestoreDb, 'bookings', bookingId);
          await setDoc(
            bookingRef,
            {
              paymentStatus: 'paid',
              status: 'confirmed',
              paidAt: serverTimestamp(),
              stripeSessionId: session.id,
              stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : '',
              customerEmail: session.customer_details?.email || session.customer_email || '',
              customerName: session.customer_details?.name || '',
              amountTotal: session.amount_total ? session.amount_total / 100 : 0,
              currency: session.currency || 'chf',
              updatedAt: serverTimestamp()
            },
            { merge: true }
          );

          // Also update customRequests document if applicable
          try {
            const reqRef = doc(firestoreDb, 'customRequests', bookingId);
            await setDoc(
              reqRef,
              {
                status: 'bestaetigt',
                paymentStatus: 'paid',
                paidAt: serverTimestamp(),
                stripeSessionId: session.id,
                updatedAt: serverTimestamp()
              },
              { merge: true }
            );
          } catch {
            // ignore if not a custom request
          }

          console.log(`✅ [Firestore] Booking ${bookingId} marked as paymentStatus: 'paid' and status: 'confirmed'.`);
        } catch (dbError: any) {
          console.error('❌ [Firestore Error] Failed to update booking from Stripe Webhook:', dbError);
        }
      }
    }

    return res.status(200).json({ received: true });
  }
);

// Standard JSON parser for other API routes
app.use(express.json());

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    stripe_configured: Boolean(process.env.STRIPE_SECRET_KEY || true),
    webhook_configured: Boolean(process.env.STRIPE_WEBHOOK_SECRET || true),
    firestore_db: firebaseConfig.firestoreDatabaseId,
    timestamp: new Date().toISOString()
  });
});

// Stripe Checkout Session Creation Handler
const handleCheckoutSessionCreation = async (req: express.Request, res: express.Response) => {
  try {
    const {
      amount,
      price,
      coachName = 'Coach',
      bookingId = '',
      sessionId = '',
      title = 'Sport Coaching',
      sport = 'Sport',
      date = '',
      time = '',
      customerEmail = '',
      customerName = '',
      paymentMethod = 'all'
    } = req.body;

    const finalAmount = Number(price !== undefined ? price : amount);
    const resolvedBookingId = String(bookingId || sessionId || `book_${Date.now()}`);

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Ungültiger Betrag: Preis (CHF) muss größer als 0 sein.'
      });
    }

    const stripe = getStripe();

    // Determine host origin for redirect URLs
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
    const origin = `${proto}://${host}`;

    // Payment methods: card and twint for Swiss Francs (CHF)
    let paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = ['card', 'twint'];

    if (paymentMethod === 'TWINT') {
      paymentMethodTypes = ['twint', 'card'];
    } else if (paymentMethod === 'Kreditkarte' || paymentMethod === 'card') {
      paymentMethodTypes = ['card'];
    }

    // Build line item description
    const descriptionParts = [
      sport ? `Sportart: ${sport}` : '',
      date ? `Datum: ${date}` : '',
      time ? `Zeit: ${time}` : '',
      `Coach: ${coachName}`,
      `Buchungs-ID: ${resolvedBookingId}`
    ].filter(Boolean);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: `${sport ? sport + ' - ' : ''}${title} (${coachName})`,
              description: descriptionParts.join(' | ') || `GET A COACH Buchung #${resolvedBookingId}`,
              metadata: {
                coachName: String(coachName),
                sport: String(sport),
                bookingId: resolvedBookingId,
                sessionId: String(sessionId || resolvedBookingId),
                price: String(finalAmount),
                date: String(date)
              }
            },
            unit_amount: Math.round(finalAmount * 100) // Rappen (1 CHF = 100 Cents)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking/cancel`,
      client_reference_id: resolvedBookingId,
      metadata: {
        bookingId: resolvedBookingId,
        sessionId: String(sessionId || resolvedBookingId),
        coachName: String(coachName || ''),
        price: String(finalAmount),
        sport: String(sport || ''),
        date: String(date || ''),
        time: String(time || ''),
        customerName: String(customerName || ''),
        customerEmail: String(customerEmail || '')
      }
    };

    if (customerEmail && customerEmail.includes('@')) {
      sessionParams.customer_email = customerEmail;
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (createErr: any) {
      if (createErr.message && (createErr.message.includes('twint') || createErr.message.includes('payment_method_types'))) {
        console.warn('⚠️ Stripe checkout error with twint, falling back to card payment method:', createErr.message);
        sessionParams.payment_method_types = ['card'];
        session = await stripe.checkout.sessions.create(sessionParams);
      } else {
        throw createErr;
      }
    }

    return res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      bookingId: resolvedBookingId
    });
  } catch (error: any) {
    console.error('Error creating Stripe Checkout session:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Erstellen der Stripe Checkout-Session.'
    });
  }
};

// Register endpoints for checkout session
app.post('/api/createCheckoutSession', handleCheckoutSessionCreation);
app.post('/api/create-checkout-session', handleCheckoutSessionCreation);
app.post('/api/checkout', handleCheckoutSessionCreation);

// Retrieve Checkout Session Status
app.get('/api/checkout/session/:id', async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.id);

    return res.json({
      success: true,
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      amount_total: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
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
});

async function start() {
  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GET A COACH fullstack server running on http://localhost:${PORT}`);
  });
}

start();
