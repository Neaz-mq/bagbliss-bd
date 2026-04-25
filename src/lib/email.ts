import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM  = process.env.FROM_EMAIL  ?? 'onboarding@resend.dev'
export const ADMIN = process.env.ADMIN_EMAIL ?? 'neazmorshed666@gmail.com'

export interface OrderEmailData {
  orderNumber:   string
  customerName:  string
  customerEmail: string
  items: {
    name:      string
    color:     string
    quantity:  number
    price:     number
    image?:    string
  }[]
  shipping: {
    fullName:    string
    phone:       string
    address:     string
    thana:       string
    district:    string
    division:    string
    postalCode?: string
  }
  subtotal:    number
  deliveryFee: number
  total:       number
  payment:     string
  delivery:    string
  orderNote?:  string
  createdAt:   string
}

const PAYMENT_LABELS: Record<string, string> = {
  cod:        'Cash on Delivery',
  bkash:      'bKash',
  nagad:      'Nagad',
  card:       'Card Payment',
  sslcommerz: 'Online Payment',
}

const DELIVERY_LABELS: Record<string, string> = {
  standard: 'Standard (3–5 business days)',
  express:  'Express (1–2 business days)',
}

// ── Send both emails ──────────────────────────────────────────────────────
export async function sendOrderEmails(order: OrderEmailData) {
  await Promise.allSettled([
    sendCustomerConfirmation(order),
    sendAdminOrderAlert(order),
  ])
}

// ── Customer confirmation ─────────────────────────────────────────────────
export async function sendCustomerConfirmation(order: OrderEmailData) {
  if (!order.customerEmail) return
  try {
    await resend.emails.send({
      from:    `BagBliss BD <${FROM}>`,
      to:      order.customerEmail,
      subject: `✅ Order Confirmed — #${order.orderNumber} | BagBliss BD`,
      html:    buildCustomerEmail(order),
    })
    console.log(`[EMAIL] Customer confirmation sent → ${order.customerEmail}`)
  } catch (err) {
    console.error('[EMAIL] Customer confirmation failed:', err)
  }
}

// ── Admin new order alert ─────────────────────────────────────────────────
export async function sendAdminOrderAlert(order: OrderEmailData) {
  try {
    await resend.emails.send({
      from:    `BagBliss Alerts <${FROM}>`,
      to:      ADMIN,
      subject: `🛍️ New Order #${order.orderNumber} — ৳${order.total.toLocaleString()} | BagBliss BD`,
      html:    buildAdminEmail(order),
    })
    console.log(`[EMAIL] Admin alert sent → ${ADMIN}`)
  } catch (err) {
    console.error('[EMAIL] Admin alert failed:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────

function base(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1A1A2E 0%,#2d1b4e 100%);padding:32px 40px;text-align:center;">
            <div style="font-size:40px;margin-bottom:12px;">👜</div>
            <h1 style="color:white;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">
              BagBliss BD
            </h1>
            <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:6px 0 0;">
              Bangladesh&apos;s most trendy mini crossbody bag store
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">${body}</td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">
              BagBliss BD &mdash; Dhaka, Bangladesh
            </p>
            <p style="margin:0;">
              <a href="https://bagbliss-bd.vercel.app/shop"
                 style="color:#e91e8c;font-size:12px;text-decoration:none;margin:0 8px;">Shop</a>
              <a href="https://bagbliss-bd.vercel.app/account/orders"
                 style="color:#e91e8c;font-size:12px;text-decoration:none;margin:0 8px;">My Orders</a>
              <a href="mailto:neazmorshed666@gmail.com"
                 style="color:#e91e8c;font-size:12px;text-decoration:none;margin:0 8px;">Contact Us</a>
            </p>
            <p style="color:#cbd5e1;font-size:11px;margin:12px 0 0;">
              &copy; ${new Date().getFullYear()} BagBliss BD. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function itemRows(items: OrderEmailData['items']): string {
  return items.map(item => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;width:60px;">
              ${item.image
                ? `<img src="${item.image}" width="50" height="50" alt="${item.name}"
                     style="border-radius:10px;object-fit:cover;display:block;"/>`
                : `<div style="width:50px;height:50px;background:rgba(233,30,140,0.08);
                     border-radius:10px;text-align:center;line-height:50px;font-size:22px;">👜</div>`
              }
            </td>
            <td style="vertical-align:middle;padding-left:14px;">
              <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 4px;">
                ${item.name}
              </p>
              <p style="font-size:12px;color:#94a3b8;margin:0;">
                Color: ${item.color} &bull; Qty: ${item.quantity}
              </p>
            </td>
            <td style="vertical-align:middle;text-align:right;white-space:nowrap;">
              <p style="font-size:15px;font-weight:800;color:#e91e8c;margin:0;">
                ৳${(item.price * item.quantity).toLocaleString()}
              </p>
              ${item.quantity > 1
                ? `<p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">
                     ৳${item.price.toLocaleString()} each
                   </p>`
                : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')
}

// ─────────────────────────────────────────────────────────────────────────
//  CUSTOMER EMAIL
// ─────────────────────────────────────────────────────────────────────────

function buildCustomerEmail(o: OrderEmailData): string {
  const freeShipping = o.deliveryFee === 0

  const body = `
    <!-- Success banner -->
    <div style="background:rgba(34,197,94,0.07);border:1.5px solid rgba(34,197,94,0.2);
      border-radius:14px;padding:22px 24px;margin-bottom:28px;text-align:center;">
      <div style="font-size:40px;margin-bottom:10px;">🎉</div>
      <h2 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 6px;">
        Order Confirmed!
      </h2>
      <p style="font-size:14px;color:#64748b;margin:0;">
        Hi <strong>${o.customerName}</strong>, your order has been placed successfully.
      </p>
    </div>

    <!-- Order number -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:rgba(233,30,140,0.07);
        border:1.5px solid rgba(233,30,140,0.2);border-radius:12px;padding:12px 28px;">
        <p style="font-size:11px;color:#94a3b8;margin:0 0 5px;font-weight:700;
          letter-spacing:0.08em;text-transform:uppercase;">Order Number</p>
        <p style="font-size:22px;font-weight:800;color:#e91e8c;margin:0;font-family:monospace;">
          #${o.orderNumber}
        </p>
      </div>
    </div>

    <!-- Items -->
    <h3 style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;
      letter-spacing:0.08em;margin:0 0 4px;">Your Items</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${itemRows(o.items)}
    </table>

    <!-- Totals -->
    <div style="background:#f8fafc;border-radius:12px;padding:18px 20px;
      margin-bottom:24px;border:1px solid #f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#64748b;">Subtotal</td>
          <td style="padding:5px 0;font-size:13px;color:#1e293b;font-weight:600;text-align:right;">
            ৳${o.subtotal.toLocaleString()}
          </td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#64748b;">Shipping</td>
          <td style="padding:5px 0;font-size:13px;text-align:right;font-weight:700;
            color:${freeShipping ? '#16a34a' : '#1e293b'};">
            ${freeShipping ? 'FREE 🎉' : `৳${o.deliveryFee}`}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:10px 0 0;border-top:1px solid #e2e8f0;"></td>
        </tr>
        <tr>
          <td style="font-size:15px;font-weight:800;color:#0f172a;">Total</td>
          <td style="font-size:18px;font-weight:800;color:#e91e8c;text-align:right;">
            ৳${o.total.toLocaleString()}
          </td>
        </tr>
      </table>
    </div>

    <!-- Shipping + Payment grid -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:8px;">
          <div style="background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #f1f5f9;">
            <p style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;
              letter-spacing:0.08em;margin:0 0 10px;">📍 Delivery Address</p>
            <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 4px;">
              ${o.shipping.fullName}
            </p>
            <p style="font-size:13px;color:#64748b;margin:0 0 2px;">${o.shipping.phone}</p>
            <p style="font-size:13px;color:#64748b;margin:0;line-height:1.6;">
              ${o.shipping.address}<br/>
              ${o.shipping.thana}, ${o.shipping.district}<br/>
              ${o.shipping.division}
              ${o.shipping.postalCode ? ` – ${o.shipping.postalCode}` : ''}
            </p>
          </div>
        </td>
        <td style="width:50%;vertical-align:top;padding-left:8px;">
          <div style="background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #f1f5f9;">
            <p style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;
              letter-spacing:0.08em;margin:0 0 10px;">💳 Payment & Delivery</p>
            <p style="font-size:13px;color:#64748b;margin:0 0 8px;">
              <strong style="color:#1e293b;display:block;margin-bottom:2px;">Payment</strong>
              ${PAYMENT_LABELS[o.payment] ?? o.payment}
            </p>
            <p style="font-size:13px;color:#64748b;margin:0 0 8px;">
              <strong style="color:#1e293b;display:block;margin-bottom:2px;">Delivery</strong>
              ${DELIVERY_LABELS[o.delivery] ?? o.delivery}
            </p>
            <p style="font-size:13px;color:#64748b;margin:0;">
              <strong style="color:#1e293b;display:block;margin-bottom:2px;">Date</strong>
              ${new Date(o.createdAt).toLocaleDateString('en-US', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        </td>
      </tr>
    </table>

    ${o.orderNote ? `
    <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);
      border-radius:12px;padding:14px 16px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:800;color:#b45309;text-transform:uppercase;
        letter-spacing:0.08em;margin:0 0 6px;">📝 Your Note</p>
      <p style="font-size:13px;color:#92400e;margin:0;">${o.orderNote}</p>
    </div>` : ''}

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="https://bagbliss-bd.vercel.app/account/orders"
         style="display:inline-block;background:linear-gradient(135deg,#e91e8c,#f43f5e);
           color:white;font-size:14px;font-weight:700;padding:14px 32px;
           border-radius:999px;text-decoration:none;
           box-shadow:0 4px 16px rgba(233,30,140,0.4);">
        Track My Order →
      </a>
    </div>

    <!-- Trust badges -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="border-top:1px solid #f1f5f9;padding-top:24px;">
      <tr>
        <td style="text-align:center;padding:0 8px;">
          <div style="font-size:24px;margin-bottom:6px;">🚚</div>
          <p style="font-size:12px;font-weight:700;color:#1e293b;margin:0 0 2px;">Fast Delivery</p>
          <p style="font-size:11px;color:#94a3b8;margin:0;">All 64 districts</p>
        </td>
        <td style="text-align:center;padding:0 8px;">
          <div style="font-size:24px;margin-bottom:6px;">🛡️</div>
          <p style="font-size:12px;font-weight:700;color:#1e293b;margin:0 0 2px;">Secure Payment</p>
          <p style="font-size:11px;color:#94a3b8;margin:0;">SSLCommerz secured</p>
        </td>
        <td style="text-align:center;padding:0 8px;">
          <div style="font-size:24px;margin-bottom:6px;">💬</div>
          <p style="font-size:12px;font-weight:700;color:#1e293b;margin:0 0 2px;">24/7 Support</p>
          <p style="font-size:11px;color:#94a3b8;margin:0;">Always here to help</p>
        </td>
      </tr>
    </table>
  `

  return base(`Order Confirmed — #${o.orderNumber}`, body)
}

// ─────────────────────────────────────────────────────────────────────────
//  ADMIN EMAIL
// ─────────────────────────────────────────────────────────────────────────

function buildAdminEmail(o: OrderEmailData): string {
  const body = `
    <!-- Alert -->
    <div style="background:rgba(233,30,140,0.07);border:1.5px solid rgba(233,30,140,0.2);
      border-radius:14px;padding:20px 24px;margin-bottom:24px;">
      <h2 style="font-size:18px;font-weight:800;color:#0f172a;margin:0 0 6px;">
        🛍️ New Order Received!
      </h2>
      <p style="font-size:14px;color:#64748b;margin:0;">
        Order <strong style="color:#e91e8c;">#${o.orderNumber}</strong>
        &bull; ৳${o.total.toLocaleString()}
        &bull; ${PAYMENT_LABELS[o.payment] ?? o.payment}
      </p>
    </div>

    <!-- Quick stats -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        ${[
          { label: 'Total',   value: `৳${o.total.toLocaleString()}`, color: '#e91e8c' },
          { label: 'Items',   value: `${o.items.reduce((a, i) => a + i.quantity, 0)}`, color: '#6366f1' },
          { label: 'Payment', value: PAYMENT_LABELS[o.payment] ?? o.payment, color: '#10b981' },
        ].map(({ label, value, color }) => `
          <td style="padding:0 5px;text-align:center;">
            <div style="background:#f8fafc;border-radius:12px;padding:14px 10px;border:1px solid #f1f5f9;">
              <p style="font-size:10px;color:#94a3b8;margin:0 0 5px;font-weight:700;
                text-transform:uppercase;letter-spacing:0.06em;">${label}</p>
              <p style="font-size:15px;font-weight:800;color:${color};margin:0;">${value}</p>
            </div>
          </td>
        `).join('')}
      </tr>
    </table>

    <!-- Customer -->
    <h3 style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;
      letter-spacing:0.08em;margin:0 0 10px;">Customer</h3>
    <div style="background:#f8fafc;border-radius:12px;padding:16px;
      border:1px solid #f1f5f9;margin-bottom:20px;">
      <p style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 5px;">
        ${o.shipping.fullName}
      </p>
      <p style="font-size:13px;color:#64748b;margin:0 0 3px;">📞 ${o.shipping.phone}</p>
      ${o.customerEmail
        ? `<p style="font-size:13px;color:#64748b;margin:0;">✉️ ${o.customerEmail}</p>`
        : ''}
    </div>

    <!-- Address -->
    <h3 style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;
      letter-spacing:0.08em;margin:0 0 10px;">Delivery Address</h3>
    <div style="background:#f8fafc;border-radius:12px;padding:16px;
      border:1px solid #f1f5f9;margin-bottom:20px;">
      <p style="font-size:13px;color:#64748b;margin:0;line-height:1.7;">
        ${o.shipping.address}<br/>
        ${o.shipping.thana}, ${o.shipping.district}, ${o.shipping.division}
        ${o.shipping.postalCode ? ` – ${o.shipping.postalCode}` : ''}
      </p>
      <p style="font-size:12px;color:#94a3b8;margin:8px 0 0;">
        Delivery: ${DELIVERY_LABELS[o.delivery] ?? o.delivery}
        ${o.deliveryFee === 0 ? ' (FREE)' : ` — ৳${o.deliveryFee}`}
      </p>
    </div>

    <!-- Items -->
    <h3 style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;
      letter-spacing:0.08em;margin:0 0 4px;">Items Ordered</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${itemRows(o.items)}
    </table>

    <!-- Total -->
    <div style="background:rgba(233,30,140,0.05);border:1.5px solid rgba(233,30,140,0.15);
      border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:15px;font-weight:700;color:#0f172a;">Order Total</td>
          <td style="font-size:22px;font-weight:800;color:#e91e8c;text-align:right;">
            ৳${o.total.toLocaleString()}
          </td>
        </tr>
      </table>
    </div>

    ${o.orderNote ? `
    <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);
      border-radius:12px;padding:14px 16px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:800;color:#b45309;text-transform:uppercase;
        letter-spacing:0.08em;margin:0 0 6px;">📝 Customer Note</p>
      <p style="font-size:13px;color:#92400e;margin:0;">${o.orderNote}</p>
    </div>` : ''}

    <!-- CTA -->
    <div style="text-align:center;">
      <a href="https://bagbliss-bd.vercel.app/admin/orders"
         style="display:inline-block;background:linear-gradient(135deg,#e91e8c,#f43f5e);
           color:white;font-size:14px;font-weight:700;padding:14px 32px;
           border-radius:999px;text-decoration:none;
           box-shadow:0 4px 16px rgba(233,30,140,0.35);">
        View in Admin Panel →
      </a>
    </div>
  `

  return base(`New Order #${o.orderNumber} — ৳${o.total.toLocaleString()}`, body)
}