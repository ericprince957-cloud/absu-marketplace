# ABSU Marketplace — owner launch checklist

Use this checklist as the release gate. Do not announce a public launch until every required item has been checked with evidence.

## A. Repository and build

- [ ] Confirm the latest `main` commit is deployed to the intended Vercel project.
- [ ] Confirm the Vercel project root points to this repository root.
- [ ] Add environment variables from [DEPLOYMENT.md](DEPLOYMENT.md).
- [ ] Run `npm ci`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Open the deployed website on desktop and mobile; check browser and server logs.

## B. Supabase and authentication

- [ ] Confirm the existing project ref is `inrwfjubwumvtbviuwek`; do not reset it.
- [ ] Confirm email confirmation is enabled.
- [ ] Set the production Site URL and callback redirect allow-list.
- [ ] Configure custom SMTP and test delivery to a real inbox.
- [ ] Test signup, verification, login, logout, password reset and callback handling.
- [ ] Verify the first confirmed test user receives a free slot if one is available.
- [ ] Verify the 50-slot limit cannot be exceeded; use a controlled test environment for concurrency tests.
- [ ] Create the first admin using the actual registered account UUID and the instructions in [BACKEND_SETUP.md](BACKEND_SETUP.md).
- [ ] Verify normal student accounts cannot access admin routes or privileged admin operations.

## C. Marketplace journey

- [ ] Create a seller application from a verified eligible account.
- [ ] Approve it as an admin and confirm seller role assignment.
- [ ] Create a product as the seller.
- [ ] Upload product images and confirm public URLs render.
- [ ] Confirm new products are pending until moderation.
- [ ] Approve a product as admin.
- [ ] Browse/search the approved product as another account.
- [ ] Save and unsave a product.
- [ ] Place an order as an eligible buyer.
- [ ] Confirm buyer and seller see the correct order.
- [ ] Test allowed order status transitions and stock restoration on cancellation.
- [ ] Confirm seller contact details are not exposed to anonymous users or ineligible accounts.
- [ ] Test support form submission and admin inbox access.

## D. Paystack test mode

- [ ] Add a Paystack **test** secret key as `PAYSTACK_SECRET_KEY` in Vercel. Never send it in chat or commit it.
- [ ] Set Paystack webhook URL to `https://YOUR-DOMAIN/api/paystack/webhook`.
- [ ] Redeploy after adding the environment variable.
- [ ] Use a test account that is eligible for paid membership (do not charge a free lifetime member).
- [ ] Start checkout and complete a Paystack test transaction.
- [ ] Confirm Paystack reports the correct NGN 1,500 amount.
- [ ] Confirm the app verifies the transaction server-to-server and activates 30 days of membership.
- [ ] Resend the same webhook and confirm the membership is not extended a second time.
- [ ] Test an abandoned checkout and confirm it grants no access.
- [ ] Test a wrong amount/currency/reference scenario safely in test mode and confirm no membership is granted.
- [ ] Confirm service-role and Paystack secrets are absent from browser bundles, source control and client logs.

## E. Live release

- [ ] Confirm all prior sections pass.
- [ ] Replace the Paystack test secret with the live secret in Vercel Sensitive environment variables.
- [ ] Confirm the production webhook URL in Paystack.
- [ ] Redeploy and verify the production deployment is healthy.
- [ ] Make one controlled real NGN 1,500 payment and reconcile it in Paystack and the app.
- [ ] Confirm support contact details and a person is ready to handle payment reconciliation and user reports.
- [ ] Announce the marketplace to students only after the full student-to-seller-to-order journey has passed.

## Secrets handling

The application uses a server-side Paystack secret. The current implementation does not require a Paystack public key. Never paste any secret key into ChatGPT, GitHub issues, source files, screenshots or public documentation. Enter it directly into Vercel's environment-variable settings.
