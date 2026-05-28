import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-mail.outlook.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { ciphers: "SSLv3" },
});

interface LoanApprovalEmailProps {
  toEmail: string;
  firstName: string;
  lastName: string;
  loanId: string;
  approvedAmount: number;
  dueDate: string;
  processingFee: number;
}

interface LoanDenialEmailProps {
  toEmail: string;
  firstName: string;
  lastName: string;
  denialReason?: string;
}

interface PaymentReceiptEmailProps {
  toEmail: string;
  firstName: string;
  lastName: string;
  amountPaid: number;
  balanceAfter: number;
  paymentDate: string;
  loanId: string;
}

interface PasswordResetEmailProps {
  toEmail: string;
  firstName: string;
  resetLink: string;
}

export async function sendLoanApprovalEmail(props: LoanApprovalEmailProps) {
  const { toEmail, firstName, lastName, approvedAmount, dueDate, processingFee } = props;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Loan Approved – Harvey's Loans</title></head>
    <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(12,24,39,0.12);">
            <tr><td style="background:#1e3a5f;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#f4c21a;font-size:26px;letter-spacing:1px;">HARVEY'S LOANS LLC</h1>
              <p style="margin:6px 0 0;color:#abbfdd;font-size:13px;">Your Trusted Financial Partner</p>
            </td></tr>
            <tr><td style="padding:40px;">
              <div style="background:#e8f5e9;border-left:4px solid #4caf50;padding:16px 20px;border-radius:6px;margin-bottom:28px;">
                <p style="margin:0;color:#2e7d32;font-weight:700;font-size:16px;">✓ Your Loan Application Has Been Approved!</p>
              </div>
              <p style="color:#1e3a5f;font-size:15px;">Dear <strong>${firstName} ${lastName}</strong>,</p>
              <p style="color:#4a5568;line-height:1.7;">We are pleased to inform you that your loan application with <strong>Harvey's Loans LLC</strong> has been reviewed and approved.</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border-radius:8px;overflow:hidden;margin:24px 0;">
                <tr><td style="padding:20px 24px;">
                  <h3 style="margin:0 0 16px;color:#1e3a5f;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Loan Details</h3>
                  <table width="100%" cellpadding="8" cellspacing="0">
                    <tr><td style="color:#718096;font-size:14px;">Approved Amount</td><td style="color:#1e3a5f;font-weight:700;font-size:16px;text-align:right;">$${approvedAmount.toFixed(2)}</td></tr>
                    <tr><td style="color:#718096;font-size:14px;">Processing Fee (Non-refundable)</td><td style="color:#e53e3e;font-weight:600;font-size:14px;text-align:right;">$${processingFee.toFixed(2)}</td></tr>
                    <tr style="border-top:1px solid #e2e8f0;"><td style="color:#718096;font-size:14px;padding-top:12px;">Net Amount to Receive</td><td style="color:#1e3a5f;font-weight:700;font-size:16px;text-align:right;padding-top:12px;">$${(approvedAmount - processingFee).toFixed(2)}</td></tr>
                    <tr><td style="color:#718096;font-size:14px;">First Payment Due</td><td style="color:#1e3a5f;font-weight:600;font-size:14px;text-align:right;">${dueDate}</td></tr>
                  </table>
                </td></tr>
              </table>
              <div style="background:#fff8e1;border:1px solid #f4c21a;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <h4 style="margin:0 0 10px;color:#1e3a5f;font-size:13px;">⚠️ Late Payment Interest Rates</h4>
                <table width="100%" cellpadding="4" cellspacing="0" style="font-size:13px;">
                  <tr><td style="color:#718096;">1st Week Missed</td><td style="color:#d97706;font-weight:600;text-align:right;">+8%</td></tr>
                  <tr><td style="color:#718096;">2nd Week Missed</td><td style="color:#d97706;font-weight:600;text-align:right;">+15%</td></tr>
                  <tr><td style="color:#718096;">3rd Week Missed</td><td style="color:#dc2626;font-weight:600;text-align:right;">+25%</td></tr>
                  <tr><td style="color:#718096;">4th Week Missed</td><td style="color:#dc2626;font-weight:700;text-align:right;">+30%</td></tr>
                </table>
              </div>
              <p style="color:#4a5568;font-size:13px;line-height:1.7;border-top:1px solid #e2e8f0;padding-top:20px;">This loan is governed by the <strong>Cayman Islands Money Lenders Law (as revised)</strong>. Non-payment may result in civil debt recovery proceedings under applicable Cayman law.</p>
              <p style="color:#4a5568;font-size:14px;">Please log in to your dashboard to view full loan details and payment schedule.</p>
              <p style="color:#1e3a5f;font-size:14px;margin-top:28px;">Warm regards,<br><strong>Harvey's Loans LLC</strong><br><a href="mailto:harveysloansllc@outlook.com" style="color:#f4c21a;">harveysloansllc@outlook.com</a></p>
            </td></tr>
            <tr><td style="background:#f8f9ff;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#a0aec0;font-size:12px;">© ${new Date().getFullYear()} Harvey's Loans LLC. All rights reserved. | Regulated under Cayman Islands Law</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Harvey's Loans LLC" <harveysloansllc@outlook.com>`,
    to: toEmail,
    cc: "harveysloansllc@outlook.com",
    subject: "✓ Your Loan Application Has Been Approved – Harvey's Loans LLC",
    html,
  });
}

export async function sendLoanDenialEmail(props: LoanDenialEmailProps) {
  const { toEmail, firstName, lastName, denialReason } = props;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Loan Application Update – Harvey's Loans</title></head>
    <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(12,24,39,0.12);">
            <tr><td style="background:#1e3a5f;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#f4c21a;font-size:26px;letter-spacing:1px;">HARVEY'S LOANS LLC</h1>
              <p style="margin:6px 0 0;color:#abbfdd;font-size:13px;">Your Trusted Financial Partner</p>
            </td></tr>
            <tr><td style="padding:40px;">
              <div style="background:#fff5f5;border-left:4px solid #e53e3e;padding:16px 20px;border-radius:6px;margin-bottom:28px;">
                <p style="margin:0;color:#c53030;font-weight:700;font-size:16px;">Application Status Update</p>
              </div>
              <p style="color:#1e3a5f;font-size:15px;">Dear <strong>${firstName} ${lastName}</strong>,</p>
              <p style="color:#4a5568;line-height:1.7;">Thank you for your interest in Harvey's Loans LLC. After careful review of your application, we regret to inform you that we are unable to approve your loan request at this time.</p>
              ${denialReason ? `<div style="background:#f8f9ff;border-radius:8px;padding:16px 20px;margin:24px 0;"><p style="margin:0;color:#718096;font-size:13px;font-weight:600;">Reason:</p><p style="margin:8px 0 0;color:#4a5568;font-size:14px;">${denialReason}</p></div>` : ""}
              <p style="color:#4a5568;line-height:1.7;">We encourage you to reapply in the future or contact us for guidance on improving your application. Our team is committed to helping you achieve your financial goals.</p>
              <p style="color:#1e3a5f;font-size:14px;margin-top:28px;">Warm regards,<br><strong>Harvey's Loans LLC</strong><br><a href="mailto:harveysloansllc@outlook.com" style="color:#f4c21a;">harveysloansllc@outlook.com</a></p>
            </td></tr>
            <tr><td style="background:#f8f9ff;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#a0aec0;font-size:12px;">© ${new Date().getFullYear()} Harvey's Loans LLC. All rights reserved.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Harvey's Loans LLC" <harveysloansllc@outlook.com>`,
    to: toEmail,
    cc: "harveysloansllc@outlook.com",
    subject: "Update on Your Loan Application – Harvey's Loans LLC",
    html,
  });
}

export async function sendPaymentReceiptEmail(props: PaymentReceiptEmailProps) {
  const { toEmail, firstName, lastName, amountPaid, balanceAfter, paymentDate } = props;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Payment Receipt – Harvey's Loans</title></head>
    <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(12,24,39,0.12);">
            <tr><td style="background:#1e3a5f;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#f4c21a;font-size:26px;letter-spacing:1px;">HARVEY'S LOANS LLC</h1>
              <p style="margin:6px 0 0;color:#abbfdd;font-size:13px;">Payment Receipt</p>
            </td></tr>
            <tr><td style="padding:40px;">
              <div style="background:#e8f5e9;border-left:4px solid #4caf50;padding:16px 20px;border-radius:6px;margin-bottom:28px;">
                <p style="margin:0;color:#2e7d32;font-weight:700;font-size:16px;">✓ Payment Received</p>
              </div>
              <p style="color:#1e3a5f;font-size:15px;">Dear <strong>${firstName} ${lastName}</strong>,</p>
              <p style="color:#4a5568;">We have successfully recorded your payment.</p>
              <table width="100%" cellpadding="10" cellspacing="0" style="background:#f8f9ff;border-radius:8px;margin:24px 0;font-size:14px;">
                <tr><td style="color:#718096;">Amount Paid</td><td style="color:#2e7d32;font-weight:700;font-size:18px;text-align:right;">$${amountPaid.toFixed(2)}</td></tr>
                <tr><td style="color:#718096;">Payment Date</td><td style="color:#1e3a5f;font-weight:600;text-align:right;">${paymentDate}</td></tr>
                <tr style="border-top:1px solid #e2e8f0;"><td style="color:#718096;padding-top:14px;">Remaining Balance</td><td style="color:#1e3a5f;font-weight:700;font-size:16px;text-align:right;padding-top:14px;">$${balanceAfter.toFixed(2)}</td></tr>
              </table>
              <p style="color:#4a5568;font-size:14px;">Thank you for your payment. Please keep this email as your official receipt.</p>
              <p style="color:#1e3a5f;font-size:14px;margin-top:28px;">Warm regards,<br><strong>Harvey's Loans LLC</strong></p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Harvey's Loans LLC" <harveysloansllc@outlook.com>`,
    to: toEmail,
    cc: "harveysloansllc@outlook.com",
    subject: `Payment Receipt – $${amountPaid.toFixed(2)} – Harvey's Loans LLC`,
    html,
  });
}

export async function sendPasswordResetEmail(props: PasswordResetEmailProps) {
  const { toEmail, firstName, resetLink } = props;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Reset Your Password – Harvey's Loans</title></head>
    <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(12,24,39,0.12);">
            <tr><td style="background:#1e3a5f;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#f4c21a;font-size:26px;letter-spacing:1px;">HARVEY'S LOANS LLC</h1>
            </td></tr>
            <tr><td style="padding:40px;">
              <p style="color:#1e3a5f;font-size:15px;">Dear <strong>${firstName}</strong>,</p>
              <p style="color:#4a5568;">We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetLink}" style="background:#f4c21a;color:#1e3a5f;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:8px;display:inline-block;">Reset My Password</a>
              </div>
              <p style="color:#718096;font-size:13px;">If you did not request a password reset, please ignore this email. Your account remains secure.</p>
              <p style="color:#1e3a5f;font-size:14px;margin-top:28px;">Harvey's Loans LLC</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Harvey's Loans LLC" <harveysloansllc@outlook.com>`,
    to: toEmail,
    subject: "Reset Your Password – Harvey's Loans LLC",
    html,
  });
}

export async function sendAdminNewApplicationEmail(data: {
  applicantName: string;
  applicantEmail: string;
  requestedAmount: number;
  jobTitle: string;
  loanId: string;
}) {
  const { applicantName, applicantEmail, requestedAmount, jobTitle, loanId } = data;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(12,24,39,0.12);">
            <tr><td style="background:#1e3a5f;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#f4c21a;font-size:24px;">NEW LOAN APPLICATION</h1>
            </td></tr>
            <tr><td style="padding:32px 40px;">
              <p style="color:#1e3a5f;font-weight:700;font-size:15px;">A new loan application has been submitted and requires your review.</p>
              <table width="100%" cellpadding="10" cellspacing="0" style="background:#f8f9ff;border-radius:8px;margin:20px 0;font-size:14px;">
                <tr><td style="color:#718096;">Applicant</td><td style="color:#1e3a5f;font-weight:600;text-align:right;">${applicantName}</td></tr>
                <tr><td style="color:#718096;">Email</td><td style="color:#1e3a5f;text-align:right;">${applicantEmail}</td></tr>
                <tr><td style="color:#718096;">Requested Amount</td><td style="color:#1e3a5f;font-weight:700;font-size:16px;text-align:right;">$${requestedAmount.toFixed(2)}</td></tr>
                <tr><td style="color:#718096;">Job Title</td><td style="color:#1e3a5f;text-align:right;">${jobTitle}</td></tr>
                <tr><td style="color:#718096;">Application ID</td><td style="color:#718096;font-size:12px;text-align:right;">${loanId}</td></tr>
              </table>
              <p style="color:#4a5568;font-size:14px;">Please log in to the admin dashboard to review the full application, uploaded documents, and approve or deny this request.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Harvey's Loans System" <harveysloansllc@outlook.com>`,
    to: "harveysloansllc@outlook.com",
    subject: `🔔 New Loan Application – ${applicantName} – $${requestedAmount.toFixed(2)}`,
    html,
  });
}
