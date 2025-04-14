export interface Invoice {
    id?: string; // ✅ Optional ID (if exists in API)
    _id: string; // ✅ Existing ID (if API sends _id instead of id)
    orderNumber: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: string;
    orderInvoice?: string; // ✅ Optional property if API has it
  }
  
  
  export interface GetInvoicesResponse {
    message: string;
    total: number; // ✅ Total invoices count
    items: Invoice[]; // ✅ Array of invoices
  }
  