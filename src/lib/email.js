import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Lumis Platform <noreply@photostudio.ng>';

export async function sendBookingConfirmation({ to, clientName, studioName, sessionDate, depositAmount }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Booking Confirmed — ${studioName}`,
    html: `
      <p>Hi ${clientName},</p>
      <p>Your session with <strong>${studioName}</strong> is confirmed for <strong>${sessionDate}</strong>.</p>
      <p>Deposit paid: ₦${depositAmount.toLocaleString()}</p>
      <p>You will receive a link to your private gallery after your session.</p>
    `,
  });
}

export async function sendGalleryReady({ to, clientName, studioName, galleryUrl }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your Gallery is Ready — ${studioName}`,
    html: `
      <p>Hi ${clientName},</p>
      <p>Your photos from <strong>${studioName}</strong> are ready for selection.</p>
      <p><a href="${galleryUrl}">View your gallery →</a></p>
      <p>Select your favourite photos and we'll prepare your final delivery.</p>
    `,
  });
}

export async function sendPaymentReminder({ to, clientName, studioName, amountDue, paymentUrl }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Balance Due — ${studioName}`,
    html: `
      <p>Hi ${clientName},</p>
      <p>Your balance of <strong>₦${amountDue.toLocaleString()}</strong> is due to unlock your full gallery from <strong>${studioName}</strong>.</p>
      <p><a href="${paymentUrl}">Pay now →</a></p>
    `,
  });
}
