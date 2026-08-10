import { create } from 'zustand';

export interface CartItem {
  cart_item_id: number;
  product_id: number;
  quantity: number;
  subtotal: number;
  product: {
    product_id: number;
    product_name: string;
    price: number;
    image: string | null;
    factory: { factory_name: string };
    category: { category_name: string };
  };
}

export interface Cart {
  cart_id: number;
  total_price: number;
  cartItems: CartItem[];
}

interface CartState {
  cart: Cart | null;
  itemCount: number;
  setCart: (cart: Cart) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  itemCount: 0,

  setCart: (cart) =>
    set({
      cart,
      itemCount: cart.cartItems.reduce((sum, item) => sum + item.quantity, 0),
    }),

  clearCart: () => set({ cart: null, itemCount: 0 }),
}));
