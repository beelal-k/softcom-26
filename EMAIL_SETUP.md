# Email Invitation Setup Complete! ✅

## How It Works

1. **Send Invitation**: POST `/api/invitations`
   - Creates invitation token in database
   - Sends email with clickable link to invitee
   - Link: `http://localhost:3000/invitations/accept/{token}`

2. **User Clicks Link**: Opens `/invitations/accept/{token}` page
   - Automatically verifies JWT token from localStorage
   - Calls `/api/invitations/{token}/accept` 
   - Adds user to team
   - Redirects to dashboard

3. **Permission Checks**:
   - ✅ Only team admins/org owners can send invitations
   - ✅ Email must match authenticated user to accept
   - ✅ Token expires in 7 days
   - ✅ Invitation must be 'pending' status

## Setup Instructions

### 1. Add to your `.env.local`:

```env
# Email (SMTP) - Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Gmail Setup (Recommended):
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use generated password in `SMTP_PASS`

### 3. Alternative SMTP Providers:
- **SendGrid**: smtp.sendgrid.net (port 587)
- **Mailgun**: smtp.mailgun.org (port 587)
- **AWS SES**: email-smtp.{region}.amazonaws.com (port 587)

## API Flow

```bash
# 1. Send invitation (admin/owner only)
POST /api/invitations
Headers: { Authorization: Bearer <token> }
Body: {
  "email": "user@example.com",
  "teamId": "team-id",
  "organizationId": "org-id",
  "role": "member"
}

# Email sent automatically with link
# User clicks: http://localhost:3000/invitations/accept/{token}

# 2. Accept invitation (auto-called by page)
POST /api/invitations/{token}/accept
Headers: { Authorization: Bearer <token> }
# User added to team ✅
```

## Features

- ✅ Automatic email sending with nodemailer
- ✅ Beautiful HTML email template
- ✅ Secure token-based invitations
- ✅ Auto-accept page with loading states
- ✅ Permission checks enforced
- ✅ 7-day expiration
- ✅ Error handling (continues if email fails)

## Testing Without Email

To test without setting up email:
1. Send invitation via API
2. Check response for `token`
3. Manually visit: `http://localhost:3000/invitations/accept/{token}`

