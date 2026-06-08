/** Checkout Pro: redireciona para o ambiente do Mercado Pago em vez de tokenizar cartão no app. */
export const usarCheckoutPro = import.meta.env.VITE_MP_CHECKOUT_PRO === 'true'
