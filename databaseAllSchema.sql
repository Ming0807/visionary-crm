-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.campaign_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid,
  customer_id uuid,
  status character varying DEFAULT 'sent'::character varying CHECK (status::text = ANY (ARRAY['sent'::character varying, 'delivered'::character varying, 'opened'::character varying, 'clicked'::character varying, 'failed'::character varying]::text[])),
  message_content text,
  sent_at timestamp with time zone DEFAULT now(),
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  error_message text,
  CONSTRAINT campaign_logs_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_logs_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id),
  CONSTRAINT campaign_logs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  campaign_type character varying NOT NULL CHECK (campaign_type::text = ANY (ARRAY['birthday'::character varying, 're_engagement'::character varying, 'point_expiration'::character varying, 'promotion'::character varying, 'custom'::character varying]::text[])),
  status character varying DEFAULT 'draft'::character varying CHECK (status::text = ANY (ARRAY['draft'::character varying, 'active'::character varying, 'paused'::character varying, 'completed'::character varying]::text[])),
  target_audience jsonb DEFAULT '{}'::jsonb,
  message_template text NOT NULL,
  coupon_id uuid,
  send_channel character varying DEFAULT 'line'::character varying CHECK (send_channel::text = ANY (ARRAY['line'::character varying, 'email'::character varying, 'both'::character varying]::text[])),
  schedule_type character varying DEFAULT 'manual'::character varying CHECK (schedule_type::text = ANY (ARRAY['manual'::character varying, 'daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'once'::character varying]::text[])),
  scheduled_at timestamp with time zone,
  last_run_at timestamp with time zone,
  total_sent integer DEFAULT 0,
  total_opened integer DEFAULT 0,
  total_clicked integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT campaigns_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id)
);
CREATE TABLE public.chat_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid,
  platform character varying NOT NULL DEFAULT 'line'::character varying,
  direction character varying NOT NULL,
  message_type character varying NOT NULL DEFAULT 'text'::character varying,
  content text,
  platform_message_id character varying,
  reply_token character varying,
  metadata jsonb DEFAULT '{}'::jsonb,
  replied_by uuid,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_logs_pkey PRIMARY KEY (id),
  CONSTRAINT chat_logs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.claims_returns (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid,
  order_item_id uuid,
  customer_id uuid NOT NULL,
  claim_type text NOT NULL DEFAULT 'return'::claim_type,
  reason character varying,
  description text,
  images jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending'::claim_status_type,
  admin_notes text,
  refund_amount numeric,
  refund_points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  resolved_by uuid,
  resolution_notes text,
  CONSTRAINT claims_returns_pkey PRIMARY KEY (id),
  CONSTRAINT claims_returns_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT claims_returns_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id),
  CONSTRAINT claims_returns_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.coupon_usages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coupon_id uuid,
  order_id uuid,
  customer_id uuid,
  discount_amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coupon_usages_pkey PRIMARY KEY (id),
  CONSTRAINT coupon_usages_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id),
  CONSTRAINT coupon_usages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT coupon_usages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  description text,
  discount_type character varying NOT NULL CHECK (discount_type::text = ANY (ARRAY['percentage'::character varying, 'fixed'::character varying]::text[])),
  discount_value numeric NOT NULL,
  min_purchase numeric DEFAULT 0,
  max_discount numeric,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  per_customer_limit integer DEFAULT 1,
  starts_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coupons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customer_behaviors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid,
  behavior_type character varying NOT NULL,
  variant_id uuid,
  product_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_behaviors_pkey PRIMARY KEY (id),
  CONSTRAINT customer_behaviors_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT customer_behaviors_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id),
  CONSTRAINT customer_behaviors_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text,
  phone text,
  email text,
  address jsonb DEFAULT '{}'::jsonb,
  tier character varying DEFAULT 'member'::character varying,
  points integer DEFAULT 0,
  total_spent numeric DEFAULT 0.00,
  style_tags ARRAY,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  rfm_segment character varying,
  rfm_score character varying,
  last_purchase_at timestamp with time zone,
  purchase_count integer DEFAULT 0,
  avg_order_value numeric DEFAULT 0,
  birthday date,
  last_order_date timestamp with time zone,
  order_count integer DEFAULT 0,
  profile_image_url text,
  profile_status character varying DEFAULT 'incomplete'::character varying,
  address_json jsonb,
  join_date date DEFAULT CURRENT_DATE,
  segment character varying DEFAULT 'new'::character varying,
  last_order_at timestamp with time zone,
  last_message_at timestamp with time zone,
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inventory (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  variant_id uuid,
  quantity integer NOT NULL DEFAULT 0,
  reserved_quantity integer DEFAULT 0,
  location character varying DEFAULT 'main_warehouse'::character varying,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inventory_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.loyalty_tiers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL UNIQUE,
  min_spending numeric NOT NULL DEFAULT 0,
  points_multiplier numeric DEFAULT 1.00,
  benefits jsonb DEFAULT '[]'::jsonb,
  color_code character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT loyalty_tiers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid,
  variant_id uuid,
  product_name_snapshot text,
  sku_snapshot text,
  quantity integer NOT NULL DEFAULT 1,
  price_per_unit numeric NOT NULL,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid,
  platform_source USER-DEFINED DEFAULT 'web'::platform_type,
  external_order_ref text,
  subtotal numeric DEFAULT 0.00,
  discount_amount numeric DEFAULT 0.00,
  shipping_cost numeric DEFAULT 0.00,
  total_amount numeric NOT NULL DEFAULT 0.00,
  payment_status USER-DEFINED DEFAULT 'pending_payment'::order_status_type,
  fulfillment_status USER-DEFINED DEFAULT 'unfulfilled'::fulfillment_status_type,
  slip_image_url text,
  shipping_address jsonb,
  tracking_number text,
  shipping_carrier character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  coupon_id uuid,
  coupon_code character varying,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT orders_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id)
);
CREATE TABLE public.point_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  order_id uuid,
  points integer NOT NULL DEFAULT 0,
  amount integer DEFAULT 0,
  transaction_type character varying DEFAULT 'earn'::character varying,
  type character varying DEFAULT 'earn'::character varying,
  reason text,
  reference_id uuid,
  description text,
  created_by text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT point_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT point_transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT point_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.product_mappings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  variant_id uuid,
  platform USER-DEFINED NOT NULL,
  external_variant_id text NOT NULL,
  external_product_id text,
  sync_status boolean DEFAULT true,
  last_synced_at timestamp with time zone,
  CONSTRAINT product_mappings_pkey PRIMARY KEY (id),
  CONSTRAINT product_mappings_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid,
  sku text NOT NULL UNIQUE,
  color_name character varying,
  color_code character varying,
  frame_material character varying,
  size_label character varying,
  price numeric NOT NULL,
  cost_price numeric DEFAULT 0.00,
  images jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  brand character varying,
  category character varying,
  gender character varying DEFAULT 'unisex'::character varying,
  base_price numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.referral_codes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  code character varying NOT NULL UNIQUE,
  uses_count integer DEFAULT 0,
  max_uses integer DEFAULT 10,
  reward_points integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT referral_codes_pkey PRIMARY KEY (id),
  CONSTRAINT referral_codes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.site_settings (
  key character varying NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (key)
);
CREATE TABLE public.social_identities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid,
  platform USER-DEFINED NOT NULL,
  social_user_id text NOT NULL,
  profile_data jsonb,
  is_following boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  display_name character varying,
  picture_url text,
  status_message text,
  language character varying,
  last_active timestamp with time zone DEFAULT now(),
  CONSTRAINT social_identities_pkey PRIMARY KEY (id),
  CONSTRAINT social_identities_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  role character varying NOT NULL,
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (id)
);
CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_name character varying NOT NULL,
  avatar_url text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  product_name character varying,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  customer_id uuid,
  CONSTRAINT testimonials_pkey PRIMARY KEY (id),
  CONSTRAINT testimonials_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);