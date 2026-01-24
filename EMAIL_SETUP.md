# Email Configuration for Reservations

The reservation form will send email notifications to `campbell.ryan.r@gmail.com` when guests submit reservation requests.

## Setup Instructions

### Option 1: Resend (Recommended)

1. Sign up for a free account at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to your environment variables:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
4. Verify your sending domain or use the Resend sandbox for testing

### Option 2: SendGrid

1. Sign up for a free account at [sendgrid.com](https://sendgrid.com)
2. Create an API key with Mail Send permissions
3. Add to your environment variables:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```
4. Verify your sending domain

## Development Mode

Without an API key configured, reservation submissions will:
- Log the reservation details to the server console
- Return a success message indicating email service is not configured
- Still validate and accept the form submission

This allows you to test the form functionality without setting up an email service.

## Deployment

For Vercel deployment, add the environment variable in your project settings:
1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add `RESEND_API_KEY` or `SENDGRID_API_KEY`
4. Redeploy the project

## Email Content

Each reservation email includes:
- Guest name, email, and phone
- Check-in and check-out dates
- Number of adults and children
- Special requests
- Submission timestamp
