import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `photostudio.ng <${process.env.GMAIL_USER}>`;

function baseTemplate({ accentColor = '#D30E15', studioName, preheader, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${studioName}</title>
</head>
<body style="margin:0;padding:0;background:#f9f8f6;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <div style="display:none;max-height:0;overflow:hidden;color:#f9f8f6;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo bar -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-family:Georgia,serif;font-size:22px;letter-spacing:-0.5px;color:#1a1a1a;font-weight:bold;">${studioName}</span>
              <br/>
              <span style="font-size:8px;letter-spacing:4px;text-transform:uppercase;font-weight:700;color:${accentColor};">Photography</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e8e8e4;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="font-size:11px;color:#aaa;letter-spacing:1px;text-transform:uppercase;margin:0;">
                Powered by <span style="color:${accentColor};font-weight:700;">photostudio.ng</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendBookingConfirmation({
  to,
  clientName,
  studioName,
  studioEmail,
  studioPhone,
  serviceName,
  sessionDate,
  depositAmount,
  balanceAmount,
  notes,
  accentColor,
}) {
  const formattedDate = sessionDate
    ? new Date(sessionDate).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'To be confirmed';

  const body = `
    <!-- Header stripe -->
    <tr style="display:block;">
      <td style="background:${accentColor};padding:6px 0;display:block;"></td>
    </tr>

    <tr>
      <td style="padding:40px 40px 0;">
        <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${accentColor};font-weight:700;margin:0 0 12px;">Booking Confirmed</p>
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1a1a;margin:0 0 8px;font-weight:normal;">Hi ${clientName},</h1>
        <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 32px;">
          Your session with <strong style="color:#1a1a1a;">${studioName}</strong> has been booked.
          We're looking forward to working with you.
        </p>
      </td>
    </tr>

    <!-- Details block -->
    <tr>
      <td style="padding:0 40px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f6;border:1px solid #ece9e4;">
          ${sessionDate ? `
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid #ece9e4;">
              <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 4px;">Session Date</p>
              <p style="font-size:14px;color:#1a1a1a;font-weight:600;margin:0;">${formattedDate}</p>
            </td>
          </tr>` : ''}
          ${serviceName ? `
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid #ece9e4;">
              <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 4px;">Service</p>
              <p style="font-size:14px;color:#1a1a1a;font-weight:600;margin:0;">${serviceName}</p>
            </td>
          </tr>` : ''}
          ${depositAmount > 0 ? `
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid #ece9e4;">
              <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 4px;">Deposit</p>
              <p style="font-size:14px;color:#1a1a1a;font-weight:600;margin:0;">₦${Number(depositAmount).toLocaleString()}</p>
            </td>
          </tr>` : ''}
          ${balanceAmount > 0 ? `
          <tr>
            <td style="padding:16px 20px;">
              <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 4px;">Balance Due</p>
              <p style="font-size:14px;color:#1a1a1a;font-weight:600;margin:0;">₦${Number(balanceAmount).toLocaleString()}</p>
            </td>
          </tr>` : ''}
        </table>
      </td>
    </tr>

    ${notes ? `
    <tr>
      <td style="padding:0 40px 32px;">
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 8px;">Notes</p>
        <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">${notes}</p>
      </td>
    </tr>` : ''}

    <!-- What happens next -->
    <tr>
      <td style="padding:0 40px 32px;border-top:1px solid #f0ede8;">
        <p style="font-size:13px;color:#555;line-height:1.7;margin:24px 0 0;">
          After your session, you'll receive a private link to your gallery where you can select
          your favourite photos. Your full gallery will be unlocked once the balance is settled.
        </p>
      </td>
    </tr>

    <!-- Studio contact -->
    <tr>
      <td style="padding:24px 40px 40px;background:#f9f8f6;border-top:1px solid #ece9e4;">
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 8px;">Questions?</p>
        <p style="font-size:13px;color:#555;margin:0;">
          ${studioEmail ? `<a href="mailto:${studioEmail}" style="color:${accentColor};text-decoration:none;">${studioEmail}</a>` : ''}
          ${studioEmail && studioPhone ? ' &nbsp;·&nbsp; ' : ''}
          ${studioPhone ? `<a href="https://wa.me/${studioPhone.replace(/[^0-9]/g, '')}" style="color:${accentColor};text-decoration:none;">${studioPhone}</a>` : ''}
        </p>
      </td>
    </tr>
  `;

  return transporter.sendMail({
    from: FROM,
    to,
    subject: `Your session is booked — ${studioName}`,
    html: baseTemplate({ accentColor, studioName, preheader: `Your session with ${studioName} is confirmed.`, body }),
  });
}

export async function sendGalleryReady({ to, clientName, studioName, galleryUrl, accentColor }) {
  const body = `
    <tr>
      <td style="background:${accentColor};padding:6px 0;display:block;"></td>
    </tr>
    <tr>
      <td style="padding:40px;">
        <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${accentColor};font-weight:700;margin:0 0 12px;">Gallery Ready</p>
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1a1a;margin:0 0 16px;font-weight:normal;">Hi ${clientName},</h1>
        <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 32px;">
          Your photos from <strong style="color:#1a1a1a;">${studioName}</strong> are ready.
          Open your private gallery and select your favourites.
        </p>
        <a href="${galleryUrl}"
          style="display:inline-block;background:${accentColor};color:#fff;text-decoration:none;
                 font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;
                 padding:16px 32px;">
          View My Gallery →
        </a>
      </td>
    </tr>
  `;

  return transporter.sendMail({
    from: FROM,
    to,
    subject: `Your gallery is ready — ${studioName}`,
    html: baseTemplate({ accentColor, studioName, preheader: `Your photos from ${studioName} are ready for selection.`, body }),
  });
}

export async function sendPaymentReminder({ to, clientName, studioName, amountDue, paymentUrl, accentColor }) {
  const body = `
    <tr>
      <td style="background:${accentColor};padding:6px 0;display:block;"></td>
    </tr>
    <tr>
      <td style="padding:40px;">
        <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${accentColor};font-weight:700;margin:0 0 12px;">Balance Due</p>
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1a1a;margin:0 0 16px;font-weight:normal;">Hi ${clientName},</h1>
        <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 8px;">
          Your balance of <strong style="color:#1a1a1a;">₦${Number(amountDue).toLocaleString()}</strong> is due
          to unlock your full gallery from <strong style="color:#1a1a1a;">${studioName}</strong>.
        </p>
        <p style="font-size:13px;color:#aaa;margin:0 0 32px;">Pay now to download your full-resolution photos.</p>
        <a href="${paymentUrl}"
          style="display:inline-block;background:${accentColor};color:#fff;text-decoration:none;
                 font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;
                 padding:16px 32px;">
          Pay ₦${Number(amountDue).toLocaleString()} →
        </a>
      </td>
    </tr>
  `;

  return transporter.sendMail({
    from: FROM,
    to,
    subject: `Balance due to unlock your gallery — ${studioName}`,
    html: baseTemplate({ accentColor, studioName, preheader: `₦${Number(amountDue).toLocaleString()} due to unlock your gallery.`, body }),
  });
}
