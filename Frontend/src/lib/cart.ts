import type { CartItem } from '../types';
export const cartSubtotal=(items:Pick<CartItem,'price'|'qty'>[])=>items.reduce((s,i)=>s+i.price*i.qty,0);
export const shippingFee=(subtotal:number)=>subtotal>=500000?0:30000;
export const formatVnd=(n:number)=>n.toLocaleString('vi-VN')+'đ';
