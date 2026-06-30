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

        @media (max-width: 1024px) {
          .hs-container {
            flex-direction: column;
            align-items: flex-start;
            padding: 32px clamp(1.5rem, 4vw, 4rem);
          }
          .hs-contacts {
            gap: 28px;
          }
        }

        @media (max-width: 640px) {
          .hs-section { min-height: auto; }
          .hs-container {
            padding: 28px 1.25rem;
            gap: 24px;
          }
          .hs-text { max-width: 100%; }
          .hs-title { font-size: 1.3rem; }
          .hs-subtitle { font-size: 0.85rem; }
          .hs-contacts {
            flex-direction: column;
            align-items: flex-start;
            gap: 18px;
            width: 100%;
          }
        }
      `}</style>

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