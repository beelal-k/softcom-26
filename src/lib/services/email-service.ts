import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendInvitationEmail(
  to: string,
  data: {
    token: string;
    teamName: string;
    organizationName: string;
    inviterName: string;
    role: string;
  }
) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invitations/accept/${data.token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `You've been invited to join ${data.teamName}`,
    html: `
      <h2>Team Invitation</h2>
      <p>Hi there!</p>
      <p><strong>${data.inviterName}</strong> has invited you to join the team <strong>${data.teamName}</strong> in <strong>${data.organizationName}</strong> as a <strong>${data.role}</strong>.</p>
      <p><a href="${acceptUrl}" style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Accept Invitation</a></p>
      <p>Or copy this link: ${acceptUrl}</p>
      <p>This invitation expires in 7 days.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, you can ignore this email.</p>
    `
  });
}

