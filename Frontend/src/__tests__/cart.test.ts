import { describe, expect, it } from 'vitest';
import { cartSubtotal, shippingFee } from '../lib/cart';

describe('cart totals', () => {
  it('calculates subtotal', () => {
    expect(cartSubtotal([{ price: 100000, qty: 2 }])).toBe(200000);
  });
  it('makes shipping free at 500000', () => {
    expect(shippingFee(500000)).toBe(0);
  });
});
