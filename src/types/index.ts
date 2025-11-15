// 共通型定義

export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  cart: OrderItem[];
  tableNumber: number;
  people: number;
  total: number;
  status: string;
  createdAt: any;
  receiptUrl?: string;
}

