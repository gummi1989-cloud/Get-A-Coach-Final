/**
 * Stripe Client-Side Service for GetACoach
 * Manages Stripe Checkout Session creation and customer redirects.
 */

export const STRIPE_PUBLISHABLE_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) ||
  'pk_test_51U5qpbJLwN6a1hwZl5UuGTHdX1M6xG5Ig8zfZ1N8G1Ee0Saw4z3sNMayhfYCi4TGghjVCvZPtosU8nkai8CDEcOv00IE0GQ1bZ';

export interface CreateCheckoutSessionParams {
  coachName: string;
  price: number; // in CHF
  bookingId: string;
  sessionId?: string;
  title?: string;
  sport?: string;
  date?: string;
  time?: string;
  customerEmail?: string;
  customerName?: string;
  paymentMethod?: 'TWINT' | 'Kreditkarte' | 'all';
}

export interface CheckoutSessionResponse {
  success: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
}

/**
 * Calls the backend createCheckoutSession endpoint and redirects the user to Stripe Checkout.
 */
export async function createAndRedirectToCheckout(
  params: CreateCheckoutSessionParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/createCheckoutSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coachName: params.coachName,
        price: params.price,
        amount: params.price,
        bookingId: params.bookingId,
        sessionId: params.sessionId || params.bookingId,
        title: params.title || 'Sport Coaching',
        sport: params.sport || 'Coaching',
        date: params.date || '',
        time: params.time || '',
        customerEmail: params.customerEmail || '',
        customerName: params.customerName || '',
        paymentMethod: params.paymentMethod || 'all',
      }),
    });

    const data: CheckoutSessionResponse = await res.json();

    if (!data.success || !data.url) {
      throw new Error(data.error || 'Konnte keine Stripe Checkout Session erstellen.');
    }

    // Save pending booking reference locally for checkout return verification
    try {
      localStorage.setItem(
        'pending_stripe_booking',
        JSON.stringify({
          bookingId: params.bookingId,
          sessionId: params.sessionId || params.bookingId,
          coachName: params.coachName,
          price: params.price,
          sport: params.sport,
          date: params.date,
          stripeSessionId: data.sessionId,
          timestamp: new Date().toISOString(),
        })
      );
    } catch {
      // ignore storage access errors
    }

    // Redirect to Stripe hosted checkout
    window.location.href = data.url;
    return { success: true };
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return {
      success: false,
      error: error.message || 'Verbindung zu Stripe fehlgeschlagen.',
    };
  }
}
