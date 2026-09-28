import crypto from 'crypto';

const PHONEPE_HOST = process.env.PHONEPE_ENV === 'PROD' 
  ? 'https://api.phonepe.com/apis/hermes' 
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
const SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

/**
 * Generates the X-VERIFY header for PhonePe requests
 */
export function generateChecksum(payloadBase64, endpoint) {
  const stringToSign = payloadBase64 + endpoint + SALT_KEY;
  const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
  return `${sha256}###${SALT_INDEX}`;
}

/**
 * Creates a PhonePe Payment Request
 * @param {string} transactionId 
 * @param {number} amountInRupees 
 * @param {string} userId 
 * @param {string} redirectUrl 
 */
export async function createPhonePeOrder(transactionId, amountInRupees, userId, redirectUrl) {
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: transactionId,
    merchantUserId: userId,
    amount: amountInRupees * 100, // PhonePe expects amount in paise
    redirectUrl: redirectUrl,
    redirectMode: "POST",
    callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/phonepe/callback`,
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE"
    }
  };

  const payloadString = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadString).toString('base64');
  const endpoint = "/pg/v1/pay";
  
  const checksum = generateChecksum(payloadBase64, endpoint);

  const response = await fetch(`${PHONEPE_HOST}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': MERCHANT_ID
    },
    body: JSON.stringify({ request: payloadBase64 })
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'PhonePe payment creation failed');
  }

  return data.data; // contains instrumentResponse.redirectInfo.url
}

/**
 * Verifies a PhonePe Payment Status
 * @param {string} transactionId 
 */
export async function verifyPhonePeStatus(transactionId) {
  const endpoint = `/pg/v1/status/${MERCHANT_ID}/${transactionId}`;
  
  // For status check, payload is empty string, but we just sign the endpoint
  const stringToSign = endpoint + SALT_KEY;
  const checksum = crypto.createHash('sha256').update(stringToSign).digest('hex') + "###" + SALT_INDEX;

  const response = await fetch(`${PHONEPE_HOST}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': MERCHANT_ID
    }
  });

  const data = await response.json();
  return data;
}
