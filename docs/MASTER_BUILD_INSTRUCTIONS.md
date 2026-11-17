# ABSU MARKETPLACE — MASTER BUILD INSTRUCTIONS

Act as a senior full-stack engineer, software architect, UI/UX designer and security engineer.

We are rebuilding **ABSU Marketplace** from scratch. This is a real product intended for students of Abia State University (ABSU), Nigeria. Do not create a simple demo or a frontend-only prototype. Build a functional, secure, production-ready application.

## 1. Product vision

Build a modern marketplace where ABSU students can:
- Register and create accounts.
- Discover products listed by other students.
- Search and filter products.
- View product details and seller information.
- Become sellers and manage their listings.
- Contact sellers and place orders.
- Manage their accounts and membership.

The experience must be simple enough for an average student to use without technical knowledge.

## 2. Technology stack

Use:
- Next.js with App Router.
- TypeScript.
- Tailwind CSS.
- Supabase Authentication.
- Supabase PostgreSQL database.
- Supabase Storage for product images.
- Paystack for payments.
- Vercel for deployment.

Use server-side operations for sensitive actions. Never expose secret keys in browser code.

## 3. Design requirements

Create a clean, premium, mobile-first interface.

Design direction:
- Modern university marketplace.
- Simple navigation.
- Professional typography.
- Clear product cards.
- Fast-loading pages.
- Excellent mobile experience.
- Accessible forms and buttons.
- Consistent spacing and visual hierarchy.

Avoid excessive animations, unnecessary gradients and clutter.

## 4. Required pages

### Public pages
- Homepage.
- Marketplace/product listing.
- Search results.
- Category pages.
- Product details.
- About page.
- Contact/support page.
- Pricing and membership page.

### Authentication
- Registration.
- Login.
- Email verification.
- Forgot password.
- Reset password.
- Logout.

### Student dashboard
- Account overview.
- Profile management.
- Membership status.
- Orders.
- Saved products.

### Seller dashboard
- Seller registration/application.
- Add product.
- Edit product.
- Delete product.
- Upload product images.
- Manage listings.
- View orders.
- View sales information.

### Admin dashboard
- Secure administrator login and authorization.
- Manage users.
- Approve or reject seller applications.
- Review and moderate products.
- Manage categories.
- View orders.
- Manage membership and payments.
- View platform statistics.

Admin access must be controlled through secure server-side role checks. Never use a hardcoded frontend password.

## 5. Membership and pricing rules

The membership model is:

- First 50 eligible registered users: permanently free.
- After the first 50: ₦1,500 per month.
- Paystack handles paid membership transactions.

Important:
- The first 50 free accounts must remain free permanently.
- The free allocation must happen atomically in the database so simultaneous registrations cannot exceed 50.
- Define and document whether the free slot is assigned after email verification.
- Do not trust browser-side counters or registration claims.
- Users must not receive paid access simply because they return from a Paystack checkout page.
- Verify payments on the server.
- Verify Paystack webhook signatures.
- Prevent duplicate payment processing.
- Store payment references and membership history.
- Handle failed, successful, renewed and cancelled payments.
- Do not charge permanently free members.

The membership payment is separate from purchases made on the marketplace.

## 6. Database and security

Design a proper relational database with suitable tables for:
- profiles
- user_roles
- membership_entitlements
- payments
- subscriptions
- categories
- products
- product_images
- orders
- order_items
- saved_products
- seller_applications
- notifications

Use UUIDs where appropriate, foreign keys, indexes, constraints and timestamps.

Implement Supabase Row Level Security properly.

Users must only edit their own profiles, products and permitted records. Admin operations must be protected.

Never expose the Supabase service-role key or Paystack secret key to the client.

## 7. Development rules

Work in clear phases.

Phase 1: Project foundation and design system.

Phase 2: Homepage, marketplace and product pages.

Phase 3: Authentication and user profiles.

Phase 4: Database schema, security and storage.

Phase 5: Membership allocation and Paystack payments.

Phase 6: Seller dashboard.

Phase 7: Admin dashboard.

Phase 8: Testing, security review and deployment.

Do not skip phases or pretend unfinished features are functional.

Before implementing each phase:
1. Explain what will be built.
2. Identify required database changes.
3. Implement the complete feature.
4. Test the feature.
5. Report what works and what remains.

Do not use fake authentication, localStorage as the main database, placeholder payment verification or mock production data.

Use environment variables and provide a complete `.env.example` without real secrets.

## 8. Repository standards

Keep the project organized and maintainable.

Include:
- README.md
- .gitignore
- .env.example
- Database migrations
- Clear folder structure
- Setup instructions
- Deployment instructions
- Security documentation

Use meaningful component names and reusable components. Avoid giant files and duplicated logic.

## 9. Final objective

The finished ABSU Marketplace must allow a real student to register, log in, browse products, become a seller, list products, and use the membership system correctly.

Build for real users, real payments and real data.

Start by inspecting the repository, confirming its framework and dependencies, and proposing the Phase 1 implementation plan. Do not start payment integration before the database and authentication foundations are ready.