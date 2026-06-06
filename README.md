# Apex Fit Landing Page

Static landing page with a Vercel serverless function for Stripe Checkout.

## Stripe setup

Add this environment variable in Vercel before deploying:

```text
STRIPE_SECRET_KEY=sk_live_...
```

Optional:

```text
SITE_URL=https://fitnessgo-one.vercel.app
```

If `SITE_URL` is not set, the checkout function will use the deployed Vercel host.

## Payment flow

1. Customer enters their name, email, and phone number.
2. The form still sends the registration to the existing Google Sheet script.
3. The site creates a Stripe Checkout session for the $1/month Elite Starter Package.
4. Stripe redirects the customer back to the landing page after payment or cancellation.
