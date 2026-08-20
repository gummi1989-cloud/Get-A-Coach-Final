import { Booking } from '../types';

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || "";
const FROM_EMAIL = 'GetACoach <headcoach@get-a-coach.ch>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('[EmailService] Kein Resend API-Key hinterlegt.');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[EmailService] Fehler beim Versand:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[EmailService] Netzwerkfehler:', error);
    return false;
  }
}

// 1. Buchungsbestaetigung & Quittung an Kunden
export async function sendBookingConfirmationEmail(booking: Booking, coachEmail?: string): Promise<void> {
  const formattedPrice = `CHF ${booking.pricePaid.toFixed(2)}`;
  const dateFormatted = new Date(booking.date).toLocaleDateString('de-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="background-color: #0B1528; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #F1600D; margin: 0; font-size: 24px;">GetACoach</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #0B1528; margin-top: 0;">Buchungsbestaetigung & Quittung</h2>
        <p>Hallo ${booking.userName},</p>
        <p>deine Buchung ist erfolgreich bestaetigt! Hier sind deine Trainingsdetails:</p>
        
        <div style="background-color: #f9fafb; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Training:</strong> ${booking.sessionTitle} (${booking.sport})</p>
          <p style="margin: 6px 0;"><strong>Coach:</strong> ${booking.coachName}</p>
          <p style="margin: 6px 0;"><strong>Datum & Zeit:</strong> ${dateFormatted}, ${booking.time} Uhr</p>
          <p style="margin: 6px 0;"><strong>Ort:</strong> ${booking.locationName} (${booking.canton})</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />
          <p style="margin: 6px 0;"><strong>Bezahlter Betrag:</strong> ${formattedPrice}</p>
          <p style="margin: 6px 0;"><strong>Zahlungsmethode:</strong> ${booking.paymentMethod}</p>
          <p style="margin: 6px 0; font-size: 12px; color: #6b7280;">Buchungs-ID: ${booking.id}</p>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          Fragen zum Training? Antworte einfach direkt auf diese E-Mail.
        </p>
        <p style="margin-top: 24px; font-weight: bold; color: #0B1528;">Dein GetACoach Team</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: booking.userEmail,
    subject: `Buchungsbestaetigung: ${booking.sessionTitle} mit ${booking.coachName}`,
    html: customerHtml,
  });

  if (coachEmail) {
    const coachHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <div style="background-color: #0B1528; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #F1600D; margin: 0; font-size: 24px;">GetACoach</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0B1528; margin-top: 0;">Neue Buchung erhalten!</h2>
          <p>Hallo ${booking.coachName},</p>
          <p>du hast eine neue Trainingsbuchung erhalten:</p>
          
          <div style="background-color: #f9fafb; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 6px 0;"><strong>Teilnehmer:</strong> ${booking.userName}</p>
            <p style="margin: 6px 0;"><strong>Training:</strong> ${booking.sessionTitle}</p>
            <p style="margin: 6px 0;"><strong>Datum & Zeit:</strong> ${dateFormatted}, ${booking.time} Uhr</p>
            <p style="margin: 6px 0;"><strong>Ort:</strong> ${booking.locationName}</p>
          </div>
          <p style="margin-top: 24px; font-weight: bold; color: #0B1528;">Dein GetACoach Team</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: coachEmail,
      subject: `Neues Training gebucht: ${booking.userName} (${booking.sessionTitle})`,
      html: coachHtml,
    });
  }
}

// 2. Stornierungs-E-Mail
export async function sendCancellationEmail(booking: Booking, refundText: string): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="background-color: #0B1528; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #F1600D; margin: 0; font-size: 24px;">GetACoach</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #ef4444; margin-top: 0;">Stornierungsbestaetigung</h2>
        <p>Hallo ${booking.userName},</p>
        <p>deine Stornierung fuer das folgende Training wurde verarbeitet:</p>
        
        <div style="background-color: #f9fafb; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Training:</strong> ${booking.sessionTitle}</p>
          <p style="margin: 6px 0;"><strong>Coach:</strong> ${booking.coachName}</p>
          <p style="margin: 6px 0;"><strong>Datum:</strong> ${booking.date}, ${booking.time} Uhr</p>
          <p style="margin: 6px 0;"><strong>Erstattungsstatus:</strong> ${refundText}</p>
        </div>

        <p style="margin-top: 24px; font-weight: bold; color: #0B1528;">Dein GetACoach Team</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: booking.userEmail,
    subject: `Stornierungsbestaetigung: ${booking.sessionTitle}`,
    html: html,
  });
}
