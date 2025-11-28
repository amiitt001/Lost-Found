import { Item } from '../types';

const KIRAPAY_API_BASE_URL = 'https://kirapay-api.holatech.app/api';

export interface PaymentRequest {
    amount: number;
    currency: string; // e.g., 'USDT', 'SOL'
    description?: string;
    customerEmail?: string;
}

export interface PaymentResponse {
    paymentUrl: string;
    transactionId: string;
    status: string;
}

export const createPaymentTransaction = async (paymentDetails: PaymentRequest): Promise<PaymentResponse> => {
    const apiKey = import.meta.env.VITE_KIRAPAY_API_KEY;
}),
        });

if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Payment creation failed with status ${response.status}`);
}

const data = await response.json();

// Mapping the response to our internal interface
return {
    paymentUrl: data.payment_url || data.url, // Adjust based on actual response
    transactionId: data.id || data.transaction_id,
    status: data.status,
};

    } catch (error) {
    console.error('Error creating KiraPay transaction:', error);
    throw error;
}
};

export const verifyPaymentStatus = async (transactionId: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_KIRAPAY_API_KEY;
    if (!apiKey) {
        throw new Error('KiraPay API Key is missing');
    }

    try {
        const response = await fetch(`${KIRAPAY_API_BASE_URL}/payments/${transactionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            }
        });

        if (!response.ok) {
            throw new Error('Failed to verify payment status');
        }

        const data = await response.json();
        return data.status;
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
}
