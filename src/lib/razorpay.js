import Razorpay from 'razorpay';
import crypto from 'crypto';

// Use test keys by default if not set
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TYVq9F1g2m7w1X';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'gPvZq5N9T2X0M8O9H9L2G1Q0';

export const razorpayClient = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * Verifies the cryptographic signature returned by Razorpay UI
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');

  return generatedSignature === signature;
}
