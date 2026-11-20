# Paystack payment flow

Seller access is NGN 1,500 per 30 days. Free lifetime members never see a pay button and are rejected by the server if they try.

## The only thing you must add

```
PAYSTACK_SECRET_KEY=sk_test_...      # test first, sk_live_... only when you go live
```

Add it to `.env.local` (local) and to Vercel > Project > Settings > Environment Variables, then redeploy.
No other Paystack value exists. Paystack signs webhooks with this same secret key. **Never paste the key into chat, a commit or the browser.**

Then, once, in the Paystack dashboard (Settings > API Keys & Webhooks) set the **Webhook URL** to:

```
https://YOUR-DOMAIN/api/paystack/webhook
```

(Paystack does not require a callback URL in the dashboard; the app sends it with every checkout.)

## Flow

```
Browser                    Next.js server                    Paystack              Supabase
   |  click "Pay"                |                                |                     |
   |---POST /api/paystack/initialize-->                           |                     |
   |                             | check session, email verified, not free member       |
   |                             | create reference ABSU-<uuid>                         |
   |                             |------rpc create_pending_payment (as user)----------->|
   |                             |--- POST /transaction/initialize (amount set HERE) -->|
   |<--- authorization_url ------|<---------------------------------------------------- |
   |--- pays on checkout.paystack.com ------------------------------------------------>|
   |<-- redirect /api/paystack/callback?reference=... --------------------------------- |
   |                             |--- GET /transaction/verify/:reference -------------->|  (never trust the redirect)
   |                             |------rpc apply_seller access_payment (service role)---->|
   |<-- redirect /dashboard/seller access?payment=success                                   |
   |                             |<-- POST /api/paystack/webhook (charge.success) ------|  (backup, same code path)
```

Both the callback and the webhook call `processSeller accessPayment()` in `src/lib/paystack/process.ts`, so there is one code path to audit.

## Safety properties (each is covered by tests in `src/lib/paystack/*.test.ts`)

| Risk | Defence |
| --- | --- |
| User edits the price in the browser | The browser never sends a price. The server sets 150000 kobo and the database function re-checks it. |
| User "returns" from checkout without paying | The callback grants nothing by itself. It asks Paystack's server for the real status. |
| Fake webhook | HMAC-SHA512 of the **raw body** with the secret key, constant-time compared. Bad or missing signature = 401, nothing processed. |
| Same payment processed twice (callback + webhook, or retries) | `apply_seller access_payment` is idempotent per `reference` (row lock + `status = success` check). Second call returns `duplicate`. |
| Wrong amount or currency but "success" | Rejected, recorded as failed with a review note, access not granted. |
| Someone else's reference | Reference must match `ABSU-<uuid>`; the database matches the reference to the user who created it and checks `metadata.user_id`. |
| Paystack or database down | Callback shows "confirming"; webhook returns 500 so Paystack retries. |
| Free member charged | Blocked in `/api/paystack/initialize` and again in `create_pending_payment`. |
| Cross-site POST to initialize | Origin header must match the site. |

## Statuses

`pending` -> `success` | `failed` | `abandoned`. A previously abandoned or failed checkout can still become `success` if the customer completes it later. Payments that Paystack reports as successful but that fail our checks stay `failed` and are logged as `PAYMENT NEEDS REVIEW`; look for that in the server logs and the admin Payments page, and reconcile manually with the Paystack dashboard.

## Renewal (important design note)

v1 uses **manual monthly renewal**: each payment adds 30 days; a member can pay again during the last 7 days or after expiry; unused time is never lost. It does **not** auto-debit cards. Auto-renew would use Paystack Plans/Subscriptions and needs an extra plan code and event handling; it is a deliberate later upgrade, not a gap.

## Testing before going live

1. Use the **test** key (`sk_test_...`). Use Paystack's test cards (see Paystack docs "Test payments").
2. Register a fresh account after all 50 free slots are used (or use an account that has no free slot), open `/dashboard/seller access`, press Pay, complete checkout. You should land on `?payment=success` and see the active seller access and a payment row.
3. Use Paystack's dashboard "Resend webhook" on that transaction and confirm nothing changes (idempotent).
4. Start checkout and close it; the payment stays `pending`/`abandoned`, no access granted.
5. Only then switch to the **live** key and update the webhook if the URL differs.
