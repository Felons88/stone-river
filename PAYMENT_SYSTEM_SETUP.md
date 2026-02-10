# Payment System Setup Guide

## ✅ What's Been Built

### 1. **Payment Gateway Integration**
- ✅ Stripe (Credit/Debit Cards)
- ✅ PayPal (PayPal Accounts)
- ✅ Cash App (Manual Verification)
- ✅ Venmo (Manual Verification)

### 2. **Database Schema**
- ✅ `payment_transactions` - All payment records with risk scoring
- ✅ `payment_events` - Complete event logging
- ✅ `payment_risk_rules` - Fraud detection rules
- ✅ `payment_disputes` - Chargeback handling
- ✅ `payment_refunds` - Refund tracking

### 3. **Backend Endpoints** (server.js)
- ✅ `/api/payment/stripe` - Process Stripe payments
- ✅ `/api/payment/paypal/create` - Create PayPal order
- ✅ `/api/payment/paypal/capture` - Capture PayPal payment
- ✅ `/api/payment/manual` - Handle CashApp/Venmo confirmations

### 4. **Admin Dashboard**
- ✅ Payments Management Page with:
  - Transaction monitoring (completed, pending, failed, flagged)
  - Risk management dashboard
  - Real-time stats (revenue, pending, failed, high-risk)
  - Transaction details viewer
  - Approve/Reject pending payments
  - Search and filter capabilities

### 5. **Customer Payment Flow**
- ✅ Invoice Payment Page with "PAY NOW" button
- ✅ Payment Gateway Selector (choose payment method)
- ✅ Individual checkout flows for each gateway
- ✅ Success/Failure handling with retry logic
- ✅ Auto-update invoice status on payment completion

---

## 🔧 Setup Instructions

### Step 1: Run Database Migration

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/fzzhzhtyywjgopphvflr/sql/new
2. Copy contents of `CLEAN_PAYMENT_MIGRATION.sql`
3. Paste and click **Run**

This creates all payment tables, triggers, and functions.

### Step 2: Install Payment Dependencies

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js @paypal/checkout-server-sdk @paypal/react-paypal-js
```

### Step 3: Add Environment Variables

Add these to `.env.server`:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# PayPal API Keys
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # or 'live' for production

# Supabase (if not already set)
SUPABASE_URL=https://fzzhzhtyywjgopphvflr.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### Step 4: Get API Keys

**Stripe:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)

**PayPal:**
1. Go to https://developer.paypal.com/dashboard/
2. Create a new app or use existing
3. Copy **Client ID** and **Secret**
4. Use sandbox mode for testing

**CashApp/Venmo:**
- Set your payment handles in the checkout components:
  - CashApp: `$StoneRiverJunk`
  - Venmo: `@StoneRiverJunk`

### Step 5: Start the Backend Server

```bash
node server.js
```

Server will run on `http://localhost:3001`

---

## 💳 Payment Flow

### Customer Side:
1. Customer receives invoice via email/SMS with payment link
2. Clicks link → Opens invoice payment page
3. Clicks "PAY NOW" → Payment gateway selector appears
4. Selects payment method (Stripe/PayPal/CashApp/Venmo)
5. Completes payment through chosen gateway
6. Invoice automatically updates to "paid" status

### Admin Side:
1. Go to Admin Panel → **Payments** tab
2. View all transactions with real-time stats
3. Monitor pending payments (CashApp/Venmo require manual verification)
4. Approve or reject pending payments
5. View transaction details, risk scores, and event logs
6. Handle disputes and refunds

---

## 🛡️ Risk Management Features

### Automatic Risk Scoring:
- **Transaction Velocity** - Multiple transactions in short time (+15-30 points)
- **Failed Attempts** - Multiple failed payments from same IP (+20-40 points)
- **High Amount** - Transactions over $2,000 (+10-25 points)
- **Risk Levels:** Low (0-30), Medium (31-60), High (61-80), Blocked (81-100)

### Admin Actions:
- **Pending Payments** - Require manual approval (CashApp/Venmo)
- **Flagged Transactions** - High risk score, needs review
- **Failed Payments** - Can retry or investigate
- **Event Logs** - Full audit trail of all payment events

---

## 📊 Admin Dashboard Features

### Stats Cards:
- **Total Revenue** - Sum of all completed payments
- **Pending Review** - Awaiting verification (CashApp/Venmo)
- **Failed Payments** - Requires attention
- **Flagged/High Risk** - Security review needed

### Transaction Table:
- Transaction ID, Gateway, Amount, Customer
- Status (completed, pending, failed)
- Risk Score and Level
- Date and Actions

### Filters:
- All, Completed, Pending, Failed, High Risk
- Search by transaction ID, email, or gateway

### Actions:
- **View Details** - Full transaction information
- **Approve** - Complete pending payment
- **Reject** - Decline pending payment

---

## 🧪 Testing

### Test Stripe Payment:
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any CVC (e.g., 123)

### Test PayPal:
- Use PayPal sandbox account
- Create test buyer/seller accounts in PayPal Developer Dashboard

### Test CashApp/Venmo:
- Submit with any transaction ID
- Payment will be marked "pending"
- Admin can approve/reject from Payments tab

---

## 🚀 Next Steps

1. **Run the database migration** (`CLEAN_PAYMENT_MIGRATION.sql`)
2. **Install payment dependencies** (npm install)
3. **Add API keys** to `.env.server`
4. **Start backend server** (node server.js)
5. **Test payment flow** with test cards
6. **Configure production keys** when ready to go live

---

## 📝 Notes

- **Stripe** - Instant processing, 2.9% + $0.30 fee
- **PayPal** - Instant processing, 2.9% + $0.30 fee
- **CashApp/Venmo** - Manual verification, no fees
- All payments automatically update invoice status
- Event logging tracks all payment activities
- Risk management flags suspicious transactions
- Admin can approve/reject manual payments

---

## 🔐 Security Features

✅ Payment data encrypted in transit (HTTPS)
✅ No card data stored on server (Stripe handles)
✅ Risk scoring on all transactions
✅ Fraud detection rules
✅ Event logging for audit trail
✅ Manual review for high-risk payments
✅ IP tracking and velocity checks

---

## Support

For issues or questions:
- Check server logs: `node server.js`
- Check browser console for frontend errors
- Review payment_events table for transaction history
- Contact Stripe/PayPal support for gateway issues
