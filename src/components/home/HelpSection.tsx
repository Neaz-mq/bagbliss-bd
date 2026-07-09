'use client'

import { AlertCircle, Phone, Mail } from 'lucide-react'

const CONTACT_ITEMS = [
  {
    icon: AlertCircle,
    title: 'Help centre',
    value: 'help.isabel.com',
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '(+63) 0123 456 789',
  },
  {
    icon: Mail,
    title: 'Email support',
    value: 'demo@demo.com',
  },
]

export default function HelpSection() {
  return (
    <>
      <style jsx global>{`
        /* Explicit white spacer so the gap always matches the page's
           actual white background instead of whatever the body/html
           default background happens to be (fixes the off-color band) */
        .hs-gap {
          width: 100%;
          height: 48px;
          background: #ffffff;
        }

        .hs-section {
          position: relative;
          width: 100%;
          min-height: 260px;
          background-image: url('https://res.cloudinary.com/dzi3u164c/image/upload/v1782831944/banner_d1cepo.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
        }

        .hs-overlay {
          position: absolute;
          inset: 0;
          background: rgba(20, 18, 16, 0.55);
        }

        .hs-container {
          position: relative;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 36px clamp(4.6rem, 4vw, 4rem);
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
        }

        .hs-text {
          max-width: 460px;
        }

        .hs-title {
          margin: 0 0 10px;
          font-family: 'Poppins', sans-serif;
          font-size: clamp(1.4rem, 2.6vw, 2rem);
          font-weight: 600;
          color: #ffffff;
          line-height: 1.2;
        }

        .hs-subtitle {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          color: #ece9e5;
        }

        .hs-contacts {
          display: flex;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .hs-contact-item {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .hs-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          background: #d08a60;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hs-icon {
          width: 20px;
          height: 20px;
          color: #ffffff;
        }

        .hs-contact-title {
          margin: 0 0 2px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
        }

        .hs-contact-value {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          font-size: 0.85rem;
          font-weight: 400;
          color: #ece9e5;
        }

        /* Centered / stacked layout: title + subtitle + contacts row all
           centered as a block. Kicks in earlier now (1250px) so mid-size
           and tablet viewports (e.g. 1190px) get the centered look instead
           of the left/right split. Each contact item itself STAYS
           icon+text side by side here — full per-item stacking only
           kicks in at the 640px mobile query. */
        @media (max-width: 1250px) {
          .hs-gap {
            height: 40px;
          }
          .hs-container {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 36px clamp(1.25rem, 4vw, 4rem);
          }
          .hs-text {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hs-contacts {
            justify-content: center;
            gap: 28px;
          }
        }

        /* Mobile: fully centered, contact items centered as a block, extra breathing room */
        @media (max-width: 640px) {
          .hs-gap {
            height: 32px;
          }
          .hs-section {
            min-height: auto;
          }
          .hs-container {
            padding: 44px 1.5rem 48px;
            gap: 30px;
            align-items: center;
            text-align: center;
          }
          .hs-text {
            max-width: 100%;
            align-items: center;
          }
          .hs-title {
            font-size: 1.3rem;
          }
          .hs-subtitle {
            font-size: 0.85rem;
          }
          .hs-contacts {
            flex-direction: column;
            align-items: center;
            gap: 22px;
            width: 100%;
          }
          .hs-contact-item {
            flex-direction: column;
            align-items: center;
            gap: 8px;
            text-align: center;
          }
        }

        /* Small mobile: match container padding used elsewhere (fs/cr/fp) */
        @media (max-width: 420px) {
          .hs-gap {
            height: 28px;
          }
          .hs-container {
            padding: 36px 0.85rem 40px;
          }
        }
      `}</style>

      <div className="hs-gap" aria-hidden="true" />

      <section className="hs-section">
        <div className="hs-overlay" aria-hidden="true" />
        <div className="hs-container">
          <div className="hs-text">
            <h2 className="hs-title">We&apos;re always here to help</h2>
            <p className="hs-subtitle">You can get help by choosing from any these options</p>
          </div>

          <div className="hs-contacts">
            {CONTACT_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <div className="hs-contact-item" key={item.title}>
                  <div className="hs-icon-circle">
                    <Icon className="hs-icon" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="hs-contact-title">{item.title}</p>
                    <p className="hs-contact-value">{item.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}