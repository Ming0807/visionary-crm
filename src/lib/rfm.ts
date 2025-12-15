// RFM Segmentation Utilities
// RFM = Recency, Frequency, Monetary

export interface RFMScores {
    recency: number;    // 1-5, 5 = most recent
    frequency: number;  // 1-5, 5 = most frequent
    monetary: number;   // 1-5, 5 = highest value
}

export interface CustomerRFMData {
    daysSinceLastPurchase: number;
    orderCount: number;
    totalSpent: number;
}

export type RFMSegment =
    | 'Champion'
    | 'Loyal'
    | 'New Customer'
    | 'Promising'
    | 'At Risk'
    | 'Cant Lose'
    | 'Hibernating'
    | 'Others';

// Thresholds for RFM scoring (adjust based on your business)
const RECENCY_THRESHOLDS = [30, 60, 90, 180]; // days
const FREQUENCY_THRESHOLDS = [2, 3, 5, 10];   // order count
const MONETARY_THRESHOLDS = [5000, 10000, 20000, 50000]; // THB

/**
 * Calculate RFM score (1-5) based on value and thresholds
 * Higher score = better (for all metrics)
 */
function calculateScore(value: number, thresholds: number[], inverse: boolean = false): number {
    let score = 1;
    for (let i = 0; i < thresholds.length; i++) {
        if (inverse) {
            // For recency: lower is better
            if (value <= thresholds[i]) {
                score = 5 - i;
                break;
            }
            if (i === thresholds.length - 1) {
                score = 1;
            }
        } else {
            // For frequency/monetary: higher is better
            if (value >= thresholds[thresholds.length - 1 - i]) {
                score = 5 - i;
                break;
            }
        }
    }
    return score;
}

/**
 * Calculate RFM scores from customer data
 */
export function calculateRFMScores(data: CustomerRFMData): RFMScores {
    return {
        recency: calculateScore(data.daysSinceLastPurchase, RECENCY_THRESHOLDS, true),
        frequency: calculateScore(data.orderCount, FREQUENCY_THRESHOLDS, false),
        monetary: calculateScore(data.totalSpent, MONETARY_THRESHOLDS, false),
    };
}

/**
 * Determine customer segment based on RFM scores
 */
export function getRFMSegment(scores: RFMScores): RFMSegment {
    const { recency: r, frequency: f, monetary: m } = scores;

    // Champions: High on all metrics
    if (r >= 4 && f >= 4 && m >= 4) {
        return 'Champion';
    }

    // Loyal: Good on all metrics
    if (r >= 3 && f >= 3 && m >= 3) {
        return 'Loyal';
    }

    // New Customer: Recent but low frequency
    if (r >= 4 && f <= 2) {
        return 'New Customer';
    }

    // Promising: Frequent but low monetary
    if (r >= 3 && f >= 3 && m <= 2) {
        return 'Promising';
    }

    // At Risk: Good frequency but haven't purchased recently
    if (r <= 2 && f >= 3) {
        return 'At Risk';
    }

    // Can't Lose: High value but inactive
    if (r <= 2 && f <= 2 && m >= 3) {
        return 'Cant Lose';
    }

    // Hibernating: Low on all metrics
    if (r <= 2 && f <= 2) {
        return 'Hibernating';
    }

    return 'Others';
}

/**
 * Get segment description and recommended action
 */
export function getSegmentInfo(segment: RFMSegment): { description: string; action: string } {
    const info: Record<RFMSegment, { description: string; action: string }> = {
        'Champion': {
            description: 'Your best customers - high recency, frequency, and monetary',
            action: 'Reward them! Offer exclusive products, early access, or VIP perks',
        },
        'Loyal': {
            description: 'Consistent customers with good engagement',
            action: 'Upsell higher-value products, referral programs',
        },
        'New Customer': {
            description: 'Recently acquired, haven\'t built habit yet',
            action: 'Onboard well, provide excellent first experience, follow-up offers',
        },
        'Promising': {
            description: 'Frequent shoppers but lower basket size',
            action: 'Increase AOV with bundles, cross-sells, minimum spend offers',
        },
        'At Risk': {
            description: 'Good customers who haven\'t purchased recently',
            action: 'Re-engage with win-back campaigns, personalized recommendations',
        },
        'Cant Lose': {
            description: 'High-value customers who became inactive',
            action: 'Urgent! Personal outreach, exclusive offers, surveys to understand why',
        },
        'Hibernating': {
            description: 'Low engagement across all metrics',
            action: 'Try reactivation campaign, if no response consider list hygiene',
        },
        'Others': {
            description: 'Uncategorized customers',
            action: 'Gather more data to properly segment',
        },
    };

    return info[segment];
}

/**
 * Format RFM score as string (e.g., "555", "312")
 */
export function formatRFMScore(scores: RFMScores): string {
    return `${scores.recency}${scores.frequency}${scores.monetary}`;
}

/**
 * Get segment color for UI
 */
export function getSegmentColor(segment: RFMSegment): { bg: string; text: string } {
    const colors: Record<RFMSegment, { bg: string; text: string }> = {
        'Champion': { bg: 'bg-green-100', text: 'text-green-700' },
        'Loyal': { bg: 'bg-blue-100', text: 'text-blue-700' },
        'New Customer': { bg: 'bg-purple-100', text: 'text-purple-700' },
        'Promising': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
        'At Risk': { bg: 'bg-orange-100', text: 'text-orange-700' },
        'Cant Lose': { bg: 'bg-red-100', text: 'text-red-700' },
        'Hibernating': { bg: 'bg-gray-100', text: 'text-gray-600' },
        'Others': { bg: 'bg-gray-50', text: 'text-gray-500' },
    };

    return colors[segment];
}
