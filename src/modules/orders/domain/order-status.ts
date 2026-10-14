export enum OrderStatus {
  Pending = 0,
  Paid = 1,
  Shipped = 2,
  Completed = 3,
  Cancelled = 4,
}

// Paid/Shipped/Completed are driven by payment and fulfilment flows, never by the customer
const CUSTOMER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Pending]: [OrderStatus.Cancelled],
  [OrderStatus.Paid]: [],
  [OrderStatus.Shipped]: [],
  [OrderStatus.Completed]: [],
  [OrderStatus.Cancelled]: [],
};

export function canCustomerTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return CUSTOMER_TRANSITIONS[from].includes(to);
}
