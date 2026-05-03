import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `photostudio.ng <${process.env.GMAIL_USER}>`;

function baseTemplate({ accentColor = '#F0940A', studioName, preheader, body }) {
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
  pdfAttachment,
  invoiceNumber,
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
    attachments: pdfAttachment ? [{
      filename: `${invoiceNumber || 'Invoice'}.pdf`,
      content: pdfAttachment,
      contentType: 'application/pdf',
    }] : undefined,
  });
}

export async function sendInvoiceEmail({
  to,
  clientName,
  clientEmail,
  clientPhone,
  studioName,
  studioLogoUrl,
  studioEmail,
  studioPhone,
  accentColor,
  bankName,
  accountNumber,
  accountName,
  serviceName,
  sessionDate,
  depositAmount,
  balanceAmount,
  depositPaid,
  balancePaid,
  notes,
  invoiceNumber,
  invoiceDate,
  pdfAttachment,
}) {
  const accent = accentColor || '#D30E15';
  const total = depositAmount + balanceAmount;
  const totalPaid = (depositPaid ? depositAmount : 0) + (balancePaid ? balanceAmount : 0);
  const totalDue = total - totalPaid;

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const formattedSession = sessionDate
    ? new Date(sessionDate).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const logoHtml = studioLogoUrl
    ? `<img src="${studioLogoUrl}" alt="${studioName}" style="height:48px;width:auto;object-fit:contain;display:block;margin-bottom:8px;" />`
    : `<p style="font-family:Georgia,serif;font-size:22px;color:#1a1a1a;font-weight:bold;margin:0 0 4px;">${studioName}</p>`;

  const statusBadge = (paid) => paid
    ? `<span style="display:inline-block;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#166534;background:#f0fdf4;border:1px solid #bbf7d0;padding:2px 8px;">✓ Paid</span>`
    : `<span style="display:inline-block;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#92400e;background:#fffbeb;border:1px solid #fde68a;padding:2px 8px;">Unpaid</span>`;

  const body = `
    <tr><td style="background:${accent};padding:6px 0;display:block;"></td></tr>
    <tr>
      <td style="padding:40px 40px 32px;">
        <!-- Studio header -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              ${logoHtml}
              <span style="font-size:9px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${accent};">Photography</span>
            </td>
            <td style="text-align:right;vertical-align:top;">
              <p style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#aaa;margin:0 0 4px;">Invoice</p>
              <p style="font-family:Georgia,serif;font-size:20px;color:#1a1a1a;margin:0 0 4px;">${invoiceNumber}</p>
              <p style="font-size:12px;color:#888;margin:0;">${fmtDate(invoiceDate)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Billed to + session -->
    <tr>
      <td style="padding:0 40px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f6;border:1px solid #ece9e4;">
          <tr>
            <td style="padding:20px 24px;border-right:1px solid #ece9e4;width:50%;vertical-align:top;">
              <p style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#aaa;margin:0 0 10px;">Billed To</p>
              <p style="font-size:14px;font-weight:700;color:#1a1a1a;margin:0 0 4px;">${clientName}</p>
              <p style="font-size:12px;color:#666;margin:0 0 2px;">${clientEmail}</p>
              ${clientPhone ? `<p style="font-size:12px;color:#666;margin:0;">${clientPhone}</p>` : ''}
            </td>
            <td style="padding:20px 24px;width:50%;vertical-align:top;">
              <p style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#aaa;margin:0 0 10px;">Session</p>
              ${serviceName ? `<p style="font-size:14px;font-weight:700;color:#1a1a1a;margin:0 0 4px;">${serviceName}</p>` : ''}
              ${formattedSession ? `<p style="font-size:12px;color:#666;margin:0;">${formattedSession}</p>` : '<p style="font-size:12px;color:#aaa;margin:0;font-style:italic;">Date to be confirmed</p>'}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Payment breakdown -->
    <tr>
      <td style="padding:0 40px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ece9e4;">
          <thead>
            <tr style="background:${accent}14;">
              <th style="text-align:left;font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#888;padding:12px 16px;">Description</th>
              <th style="text-align:center;font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#888;padding:12px 16px;">Status</th>
              <th style="text-align:right;font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#888;padding:12px 16px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${depositAmount > 0 ? `
            <tr style="border-top:1px solid #f0ede8;">
              <td style="padding:14px 16px;font-size:13px;color:#1a1a1a;">Deposit</td>
              <td style="padding:14px 16px;text-align:center;">${statusBadge(depositPaid)}</td>
              <td style="padding:14px 16px;text-align:right;font-size:13px;color:#1a1a1a;font-weight:600;">₦${depositAmount.toLocaleString()}</td>
            </tr>` : ''}
            ${balanceAmount > 0 ? `
            <tr style="border-top:1px solid #f0ede8;">
              <td style="padding:14px 16px;font-size:13px;color:#1a1a1a;">Balance</td>
              <td style="padding:14px 16px;text-align:center;">${statusBadge(balancePaid)}</td>
              <td style="padding:14px 16px;text-align:right;font-size:13px;color:#1a1a1a;font-weight:600;">₦${balanceAmount.toLocaleString()}</td>
            </tr>` : ''}
          </tbody>
          <tfoot>
            ${totalPaid > 0 && totalPaid < total ? `
            <tr style="border-top:1px solid #ece9e4;">
              <td colspan="2" style="padding:10px 16px;text-align:right;font-size:11px;color:#aaa;">Amount Paid</td>
              <td style="padding:10px 16px;text-align:right;font-size:12px;color:#888;">₦${totalPaid.toLocaleString()}</td>
            </tr>` : ''}
            <tr style="border-top:2px solid #ece9e4;">
              <td colspan="2" style="padding:14px 16px;text-align:right;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1a1a1a;">
                ${totalDue > 0 ? 'Balance Due' : 'Total'}
              </td>
              <td style="padding:14px 16px;text-align:right;font-family:Georgia,serif;font-size:20px;color:${totalDue > 0 ? accent : '#16a34a'};">
                ₦${(totalDue > 0 ? totalDue : total).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </td>
    </tr>

    <!-- Bank + Notes -->
    ${(bankName || accountNumber || notes) ? `
    <tr>
      <td style="padding:0 40px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            ${(bankName || accountNumber) ? `
            <td style="width:50%;vertical-align:top;padding-right:16px;">
              <p style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#aaa;margin:0 0 10px;">Payment Details</p>
              ${bankName ? `<p style="font-size:12px;color:#555;margin:0 0 4px;">Bank: <span style="color:#1a1a1a;font-weight:600;">${bankName}</span></p>` : ''}
              ${accountName ? `<p style="font-size:12px;color:#555;margin:0 0 4px;">Account Name: <span style="color:#1a1a1a;font-weight:600;">${accountName}</span></p>` : ''}
              ${accountNumber ? `<p style="font-size:12px;color:#555;margin:0;">Account Number: <span style="color:#1a1a1a;font-weight:700;letter-spacing:1px;">${accountNumber}</span></p>` : ''}
            </td>` : '<td></td>'}
            ${notes ? `
            <td style="width:50%;vertical-align:top;padding-left:16px;border-left:1px solid #ece9e4;">
              <p style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#aaa;margin:0 0 10px;">Notes</p>
              <p style="font-size:12px;color:#666;line-height:1.6;margin:0;">${notes}</p>
            </td>` : '<td></td>'}
          </tr>
        </table>
      </td>
    </tr>` : ''}

    <!-- Footer -->
    <tr>
      <td style="padding:24px 40px;background:#f9f8f6;border-top:1px solid #ece9e4;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="font-size:12px;color:#888;margin:0;">
                Thank you for choosing <strong style="color:#1a1a1a;">${studioName}</strong>.
                ${studioEmail || studioPhone ? `<br/>Questions? ${studioEmail ? `<a href="mailto:${studioEmail}" style="color:${accent};text-decoration:none;">${studioEmail}</a>` : ''}${studioEmail && studioPhone ? ' · ' : ''}${studioPhone ? `<a href="https://wa.me/${studioPhone.replace(/[^0-9]/g, '')}" style="color:${accent};text-decoration:none;">${studioPhone}</a>` : ''}` : ''}
              </p>
            </td>
            <td style="text-align:right;">
              <p style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#aaa;margin:0;">
                Powered by <span style="color:${accent};">photostudio.ng</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return transporter.sendMail({
    from: FROM,
    to,
    subject: `Invoice ${invoiceNumber} from ${studioName}`,
    html: baseTemplate({ accentColor: accent, studioName, preheader: `Your invoice from ${studioName} — ${invoiceNumber}`, body }),
    attachments: pdfAttachment ? [{
      filename: `${invoiceNumber}.pdf`,
      content: pdfAttachment,
      contentType: 'application/pdf',
    }] : undefined,
  });
}

export async function sendBookingNotification({
  to,
  clientName,
  clientEmail,
  clientPhone,
  studioName,
  serviceName,
  sessionDate,
  notes,
  bookingUrl,
  accentColor,
}) {
  const formattedDate = sessionDate
    ? new Date(sessionDate).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Not specified';

  const body = `
    <tr>
      <td style="background:${accentColor};padding:6px 0;display:block;"></td>
    </tr>
    <tr>
      <td style="padding:40px 40px 0;">
        <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${accentColor};font-weight:700;margin:0 0 12px;">New Booking</p>
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a1a1a;margin:0 0 8px;font-weight:normal;">You have a new booking.</h1>
        <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 32px;">
          <strong style="color:#1a1a1a;">${clientName}</strong> just submitted a booking request on your studio website.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f6;border:1px solid #ece9e4;">
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid #ece9e4;">
              <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 4px;">Client</p>
              <p style="font-size:14px;color:#1a1a1a;font-weight:600;margin:0;">${clientName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid #ece9e4;">
              <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 4px;">Email</p>
              <p style="font-size:14px;color:#1a1a1a;font-weight:600;margin:0;">
                <a href="mailto:${clientEmail}" style="color:${accentColor};text-decoration:none;">${clientEmail}</a>
              </p>
            </td>
          </tr>
          ${clientPhone ? `
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid #ece9e4;">
              <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 4px;">Phone</p>
              <p style="font-size:14px;color:#1a1a1a;font-weight:600;margin:0;">
                <a href="https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}" style="color:${accentColor};text-decoration:none;">${clientPhone}</a>
              </p>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid #ece9e4;">
              <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 4px;">Session Date</p>
              <p style="font-size:14px;color:#1a1a1a;font-weight:600;margin:0;">${formattedDate}</p>
            </td>
          </tr>
          ${serviceName ? `
          <tr>
            <td style="padding:16px 20px;border-bottom:1px solid #ece9e4;">
              <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 4px;">Service</p>
              <p style="font-size:14px;color:#1a1a1a;font-weight:600;margin:0;">${serviceName}</p>
            </td>
          </tr>` : ''}
          ${notes ? `
          <tr>
            <td style="padding:16px 20px;">
              <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;font-weight:700;margin:0 0 4px;">Notes</p>
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">${notes}</p>
            </td>
          </tr>` : ''}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 40px;text-align:center;">
        <a href="${bookingUrl}"
          style="display:inline-block;background:${accentColor};color:#fff;text-decoration:none;
                 font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;
                 padding:16px 32px;">
          View Booking →
        </a>
      </td>
    </tr>
  `;

  return transporter.sendMail({
    from: FROM,
    to,
    subject: `New booking from ${clientName}`,
    html: baseTemplate({ accentColor, studioName, preheader: `${clientName} just booked a session on your studio website.`, body }),
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
