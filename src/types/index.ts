// Shapes returned by the Supabase backend. See docs/BACKEND_CONTRACT.md.
// After the backend exists you can generate exact types with `supabase gen types`.

export type Role = "student" | "seller" | "admin";

export interface Profile {
  id: string;
  /** Mirrored from auth.users by the database (used by admin screens). */
  email?: string | null;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  whatsapp: string | null;
  faculty: string | null;
  department: string | null;
  level: string | null;
  hostel: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_suspended: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  path: string;
  position: number;
}

export type ProductStatus = "pending" | "approved" | "rejected" | "sold" | "archived";
export type ProductCondition = "new" | "like_new" | "used";

export interface SellerPublic {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string | null;
  title: string;
  description: string;
  price: number;
  condition: ProductCondition;
  quantity: number;
  location: string | null;
  status: ProductStatus;
  moderation_note: string | null;
  created_at: string;
  updated_at: string;
  categories?: Pick<Category, "id" | "name" | "slug"> | null;
  product_images?: ProductImage[];
}

export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  title: string;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: OrderStatus;
  total: number;
  note: string | null;
  created_at: string;
  order_items?: OrderItem[];
  buyer?: { full_name: string | null } | null;
  seller?: { full_name: string | null } | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export type SellerApplicationStatus = "pending" | "approved" | "rejected";

export interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  categories_text: string | null;
  phone: string;
  status: SellerApplicationStatus;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  profiles?: { full_name: string | null } | null;
}

export type PaymentStatus = "pending" | "success" | "failed" | "abandoned" | "refunded";

export interface Payment {
  id: string;
  user_id: string;
  reference: string;
  amount_kobo: number;
  currency: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

export type MembershipKind = "free_lifetime" | "paid";

export interface MembershipEntitlement {
  user_id: string;
  kind: MembershipKind;
  status: "active" | "expired" | "revoked";
  free_slot_number: number | null;
  paid_until: string | null;
  created_at: string;
}

export type MembershipState = "free_lifetime" | "active" | "expired" | "none";

export interface MembershipInfo {
  state: MembershipState;
  /** True when the user may sell, order and see seller contacts. */
  hasAccess: boolean;
  freeSlotNumber: number | null;
  paidUntil: string | null;
  /** Paid member close enough to expiry to pay again. Always false for free members. */
  canRenew: boolean;
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface AdminStats {
  users: number;
  verified_users: number;
  sellers: number;
  free_members: number;
  paid_members: number;
  free_slots_remaining: number;
  products_total: number;
  products_pending: number;
  orders_total: number;
  orders_completed: number;
  revenue_kobo: number;
  pending_applications: number;
}
