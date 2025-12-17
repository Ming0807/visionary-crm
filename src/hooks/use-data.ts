import useSWR from 'swr';

// Global fetcher function
const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
});

// SWR config defaults
const defaultConfig = {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute deduplication
};

// Types
interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface Customer {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    tier: string;
    points: number;
    total_spent: number;
    purchase_count: number;
    rfm_segment: string | null;
    rfm_score: string | null;
    birthday: string | null;
    created_at: string;
}

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    payment_status: string;
    fulfillment_status: string;
    platform_source: string;
    created_at: string;
    customer: { id: string; name: string; phone: string } | null;
}

interface Product {
    id: string;
    name: string;
    brand: string | null;
    category: string | null;
    base_price: number;
    is_active: boolean;
    created_at: string;
    variants?: Array<{
        id: string;
        sku: string;
        price: number;
        color_name: string | null;
        images: string[];
    }>;
}

interface Campaign {
    id: string;
    name: string;
    description: string | null;
    campaign_type: string;
    status: string;
    message_template: string;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    created_at: string;
}

// ============= CUSTOMERS =============
interface CustomersResponse {
    customers: Customer[];
    pagination: Pagination;
}

export function useCustomers(page = 1, limit = 20, search = '', tier = '') {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(tier && { tier }),
    });

    const { data, error, isLoading, mutate } = useSWR<CustomersResponse>(
        `/api/customers?${params}`,
        fetcher,
        defaultConfig
    );

    return {
        customers: data?.customers || [],
        pagination: data?.pagination,
        isLoading,
        isError: !!error,
        mutate,
    };
}

// ============= ORDERS =============
interface OrdersResponse {
    orders: Order[];
    pagination: Pagination;
}

export function useOrders(
    page = 1,
    limit = 20,
    search = '',
    paymentStatus = '',
    fulfillmentStatus = ''
) {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(paymentStatus && { payment_status: paymentStatus }),
        ...(fulfillmentStatus && { fulfillment_status: fulfillmentStatus }),
    });

    const { data, error, isLoading, mutate } = useSWR<OrdersResponse>(
        `/api/orders?${params}`,
        fetcher,
        defaultConfig
    );

    return {
        orders: data?.orders || [],
        pagination: data?.pagination,
        isLoading,
        isError: !!error,
        mutate,
    };
}

// ============= PRODUCTS =============
interface ProductsResponse {
    products: Product[];
    pagination: Pagination;
}

export function useProducts(
    page = 1,
    limit = 20,
    search = '',
    category = '',
    includeVariants = true
) {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        variants: String(includeVariants),
        ...(search && { search }),
        ...(category && { category }),
    });

    const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
        `/api/products?${params}`,
        fetcher,
        { ...defaultConfig, dedupingInterval: 120000 } // 2 min for products
    );

    return {
        products: data?.products || [],
        pagination: data?.pagination,
        isLoading,
        isError: !!error,
        mutate,
    };
}

// ============= CAMPAIGNS =============
interface CampaignsResponse {
    campaigns: Campaign[];
    pagination: Pagination;
}

export function useCampaigns(page = 1, limit = 20, status = '', type = '') {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(status && { status }),
        ...(type && { type }),
    });

    const { data, error, isLoading, mutate } = useSWR<CampaignsResponse>(
        `/api/campaigns?${params}`,
        fetcher,
        defaultConfig
    );

    return {
        campaigns: data?.campaigns || [],
        pagination: data?.pagination,
        isLoading,
        isError: !!error,
        mutate,
    };
}

// ============= ANALYTICS =============
interface AnalyticsData {
    summary: {
        todayRevenue: number;
        todayOrders: number;
        monthRevenue: number;
        monthOrders: number;
        totalCustomers: number;
        pendingOrders: number;
    };
    revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
    ordersByStatus: Array<{ status: string; count: number }>;
    customersByTier: Array<{ tier: string; count: number }>;
    topProducts: Array<{ name: string; sold: number; revenue: number }>;
}

export function useAnalytics(range = 7) {
    const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
        `/api/analytics/overview?range=${range}`,
        fetcher,
        { ...defaultConfig, refreshInterval: 60000 } // Auto-refresh every minute
    );

    return {
        data,
        isLoading,
        isError: !!error,
        mutate,
    };
}

// ============= BIRTHDAYS =============
interface BirthdayResponse {
    customers: Array<{
        id: string;
        name: string | null;
        phone: string | null;
        birthday: string;
        daysUntil: number;
        birthdayDate: string;
        tier: string;
    }>;
    count: number;
}

export function useBirthdays(days = 7) {
    const { data, error, isLoading, mutate } = useSWR<BirthdayResponse>(
        `/api/customers/birthdays?days=${days}`,
        fetcher,
        { ...defaultConfig, refreshInterval: 300000 } // Refresh every 5 min
    );

    return {
        birthdays: data?.customers || [],
        count: data?.count || 0,
        isLoading,
        isError: !!error,
        mutate,
    };
}
