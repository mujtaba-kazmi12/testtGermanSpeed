export interface ClientContentApiResponse {
    success: boolean;
    message: string;
    orderId?: string;
    data: {
        orderNumber: number;
        file: string;
        totalAmount: number;
        contentProvidedBy: string;
        orderStatus: string;
        address_qr_code: string;
        url: string; 
        uuid: string;
        expired_at: string;
        payment_status: string;
        payer_amount: string; // ✅ Added
        payer_currency: string; // ✅ Added
        network?: string; // ✅ Optional, since it's missing from your example API response
        address: string; // ✅ Added
        backupEmail: string;
        notes: string;
        products: { 
            productId: string;
            siteName: string;
            adjustedPrice: string;
            category: string[];
            niche: string;
            turnAroundTime: number;   
            language: string;
            currency: string;
        }[];
        createdAt: string;
        updatedAt: string;
    };
}
