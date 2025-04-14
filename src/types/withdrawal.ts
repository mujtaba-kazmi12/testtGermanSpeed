export interface WithdrawalInvoice {
    id: string
    status: string
  }
  
  export interface WithdrawalRequest {
    id: string
    status: string
    withdrawal: string
    currency: string
    amount: string
    invoice: WithdrawalInvoice
  }
  
  export interface WithdrawalResponse {
    message: string
    data: WithdrawalRequest[]
    total?: number
    page?: number
    limit?: number
  }
  

  