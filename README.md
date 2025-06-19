# Garda Racing Yacht Club

A premium yacht racing experience booking platform built with React, TypeScript, Supabase, and Stripe.

## Features

- **Yacht Racing Experiences**: Book authentic racing experiences on Lake Garda
- **Corporate Events**: Team building and corporate sailing packages
- **User Dashboard**: Manage bookings, view payment history, and track experiences
- **Admin Panel**: Comprehensive management system for bookings, clients, and content
- **Stripe Integration**: Secure payment processing for bookings and subscriptions
- **Real-time Calendar**: Dynamic availability management with Supabase real-time updates

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Edge Functions)
- **Payments**: Stripe (Checkout, Webhooks, Subscriptions)
- **Deployment**: Netlify
- **State Management**: React Context + Custom Hooks

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd garda-racing-yacht-club
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase and Stripe credentials in `.env`.

4. Set up Supabase:
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Deploy the Edge Functions in `supabase/functions/`

5. Configure Stripe:
   - Create products and prices in your Stripe dashboard
   - Update the price IDs in `src/stripe-config.ts`
   - Set up webhook endpoints pointing to your Supabase Edge Functions

6. Start the development server:
```bash
npm run dev
```

## Stripe Integration

### Setup

1. **Create Stripe Products**: In your Stripe dashboard, create products for:
   - Yacht racing experiences (one-time payment)
   - Premium memberships (recurring subscription)

2. **Configure Webhooks**: Set up a webhook endpoint in Stripe pointing to:
   ```
   https://your-project.supabase.co/functions/v1/stripe-webhook
   ```

3. **Update Configuration**: Replace the placeholder price IDs in `src/stripe-config.ts` with your actual Stripe price IDs.

### Edge Functions

The app uses two Supabase Edge Functions for Stripe integration:

- **stripe-checkout**: Creates Stripe checkout sessions
- **stripe-webhook**: Handles Stripe webhook events

### Database Schema

Stripe-related tables:
- `stripe_customers`: Links Supabase users to Stripe customers
- `stripe_subscriptions`: Stores subscription data
- `stripe_orders`: Stores one-time payment data

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin dashboard components
│   └── ...
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── context/            # React context providers
├── lib/                # Utility libraries (Supabase client)
├── utils/              # Helper functions
└── stripe-config.ts    # Stripe product configuration

supabase/
├── functions/          # Edge Functions
│   ├── stripe-checkout/
│   └── stripe-webhook/
└── migrations/         # Database migrations
```

## Key Features

### Payment Processing
- Secure Stripe Checkout integration
- Support for one-time payments and subscriptions
- Automatic customer creation and management
- Real-time webhook processing

### Booking System
- Real-time calendar availability
- Dynamic time slot management
- Automated booking confirmations
- Integration with payment processing

### Admin Dashboard
- Comprehensive booking management
- Client relationship management
- Calendar and availability control
- Media library management
- Database administration tools

### User Experience
- Responsive design for all devices
- Progressive Web App capabilities
- Real-time updates
- Professional photography integration

## Deployment

The app is configured for deployment on Netlify with automatic redirects for client-side routing.

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

## Environment Variables

Required environment variables:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (for Edge Functions)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Garda Racing Yacht Club.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/illiya5555/gardafile)
