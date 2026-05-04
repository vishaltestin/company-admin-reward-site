# 💳 Wallet & Payment Module Documentation

## 1. Architectural Overview
This module allows `business_head` users to view their company's internal "Points" balance, view a paginated ledger of all financial activity (credits, debits, top-ups), and simulate purchasing more points using INR (₹).

### Security Measures in Place
*   **Regulatory Compliance:** By converting INR to non-withdrawable "Points," the platform avoids falling under RBI's strict Prepaid Payment Instrument (PPI) licensing.
*   **ACID Compliance:** Database transactions (`DB::transaction`) are used. If the server crashes between updating the transaction ledger and updating the wallet balance, the entire operation rolls back.
*   **RBAC:** The API strictly verifies that the user is a `business_head` before allowing a top-up. Sub-admins can view the balance but cannot initiate purchases.

---

## 2. Backend Implementation (Laravel)

### `PaymentController.php`
*   **`balance()`:** Fetches the company's wallet balance, the custom name for their points (`points_name`), and the conversion rate (`point_multiplier`).
*   **`transactions()`:** Returns a paginated list of the wallet's ledger. It gracefully handles the edge case where a wallet might not exist yet by returning an empty array.
*   **`mockTopUp()`:** 
    1. Validates the minimum fiat amount (₹100).
    2. Calculates the points to credit (`fiat * multiplier`).
    3. Calls your existing `$wallet->credit()` model method inside a database transaction, passing the `fiat_amount` so it is recorded in the ledger for future accounting.

---

## 3. Frontend Implementation (React)

### State Management (`usePayment.ts`)
*   **Strict Typing:** Interfaces (`PaymentBalanceResponse`, `Transaction`, `PaginatedTransactionsResponse`) ensure that if the Laravel API changes, TypeScript will catch the mismatch in React.
*   **Mutation Lifecycle:** On a successful top-up, `queryClient.invalidateQueries` silently refetches the transaction list in the background, while `setUser` instantly updates the user's wallet balance in the Zustand store for immediate UI feedback.

### Form Handling (`PaymentPage.tsx`)
*   **Zod Schema:** Validates that the input is a number between 100 and 500,000.
*   **React 19 Compatibility:** We bypassed the `watch()` function warning by using the `useWatch` hook.
*   **`valueAsNumber`:** HTML inputs return strings. By passing `{ valueAsNumber: true }` to the `register` function, we ensure React Hook Form parses it as a strict integer before passing it to Zod, preventing type coercion errors.

---

## 4. 🚀 Future Roadmap: Integrating DodoPayments (or Razorpay)

Right now, the flow is **Synchronous**: User clicks Pay $\rightarrow$ Backend adds points $\rightarrow$ User sees success.

When you integrate a real payment gateway like DodoPayments, the flow becomes **Asynchronous**. You cannot trust the frontend to say "Payment Successful." You must rely on a **Webhook** from the payment gateway to your backend.

Here is the exact step-by-step guide on how you will migrate this module in the future:

### Step 1: Update the Frontend
Instead of telling the backend to add points, the frontend will ask the backend to *create a payment session*.
1. User enters ₹5,000 and clicks "Pay".
2. React calls a new endpoint: `POST /payment/checkout-session`.
3. The Laravel backend responds with a URL (e.g., `[https://checkout.dodopayments.com/pay/123](https://checkout.dodopayments.com/pay/123)`).
4. React redirects the user to that URL using `window.location.href = data.url`.

### Step 2: Update the Backend (Checkout Initiation)
You will replace `mockTopUp` with a method that talks to DodoPayments.
1. Laravel receives the request for ₹5,000.
2. Laravel calls the DodoPayments API (using their secret key) to create a payment link. You will pass a `metadata` payload containing the `company_id` and the `points_to_credit`.
3. Return the generated payment link to React.

### Step 3: The Webhook (The Most Important Part)
You will create a completely new, public route in Laravel (e.g., `POST /api/webhooks/dodopayments`).
1. The user completes the payment on the DodoPayments hosted page.
2. DodoPayments sends a secure POST request to your webhook URL in the background.
3. **Verify the Signature:** Your Laravel code MUST verify the webhook signature using a secret key provided by DodoPayments to prove the request isn't from a hacker.
4. **Credit the Wallet:** Once verified, you extract the `company_id` and `points_to_credit` from the payload's metadata. *This* is where you will call `$wallet->credit()`.
5. Return a `200 OK` to DodoPayments so they know you received it.

### Step 4: The Return URL
After the user pays on DodoPayments, they will be redirected back to your app (e.g., `[yoursite.com/admin/payment/success](https://yoursite.com/admin/payment/success)`).
1. You create a simple "Payment Successful! Processing..." page in React.
2. Because webhooks can sometimes be delayed by a few seconds, this page will simply ping your `balance` endpoint or listen to a WebSocket until the balance updates, then redirect them back to the main wallet page.

This is the industry-standard "Checkout & Webhook" pattern used by Stripe, Razorpay, and DodoPayments alike. You are in a perfect position to implement it because your `$wallet->credit()` logic is already perfectly encapsulated!