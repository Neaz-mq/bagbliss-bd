export const SSL_CONFIG = {
  store_id:   process.env.SSLCOMMERZ_STORE_ID ?? '',
  store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD ?? '',
  is_live:    process.env.SSLCOMMERZ_IS_LIVE === 'true',
}

export const SSL_URL = {
  init:     SSL_CONFIG.is_live
    ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
    : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
  validate: SSL_CONFIG.is_live
    ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
    : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
}

export interface SSLInitPayload {
  tran_id:        string
  total_amount:   number
  currency:       string
  success_url:    string
  fail_url:       string
  cancel_url:     string
  ipn_url:        string
  product_name:   string
  product_category: string
  product_profile: string
  cus_name:       string
  cus_email:      string
  cus_phone:      string
  cus_add1:       string
  cus_city:       string
  cus_country:    string
  ship_name:      string
  ship_add1:      string
  ship_city:      string
  ship_country:   string
  shipping_method: string
  num_of_item:    number
  value_a?:       string  // we store orderId here
}

export interface SSLInitResponse {
  status:          string
  failedreason?:   string
  sessionkey?:     string
  gw?:             Record<string, unknown>
  redirectGatewayURL?:     string
  GatewayPageURL?: string
}

export async function initiateSSLPayment(
  payload: SSLInitPayload
): Promise<SSLInitResponse> {
  const form = new URLSearchParams({
    store_id:       SSL_CONFIG.store_id,
    store_passwd:   SSL_CONFIG.store_passwd,
    ...Object.fromEntries(
      Object.entries(payload).map(([k, v]) => [k, String(v)])
    ),
  })

  const res = await fetch(SSL_URL.init, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    form.toString(),
  })

  if (!res.ok) throw new Error(`SSLCommerz init failed: ${res.statusText}`)
  return res.json()
}

export async function validateSSLPayment(val_id: string): Promise<Record<string, string>> {
  const params = new URLSearchParams({
    val_id,
    store_id:     SSL_CONFIG.store_id,
    store_passwd: SSL_CONFIG.store_passwd,
    format:       'json',
  })

  const res = await fetch(`${SSL_URL.validate}?${params}`)
  if (!res.ok) throw new Error('SSL validation request failed')
  return res.json()
}