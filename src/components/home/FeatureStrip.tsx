'use client'

import { Package, Shield, Home, RotateCw } from 'lucide-react'

const FEATURES = [
  {
    icon: Package,
    title: 'Express delivery',
    description: 'Express delivery worldwide from our blog company',
  },
  {
    icon: Shield,
    title: 'Safe payments',
    description: 'Payment in without fees from $100 of purchase',
  },
  {
    icon: Home,
    title: 'Shipping delivery',
    description: 'Express delivery worldwide from our blog company',
  },
  {
    icon: RotateCw,
    title: 'Free return',
    description: 'Free return for 7 days for any order delivered in france',
  },
]

export default function FeatureStrip() {
  return (
    <>
      <style jsx global>{`
        .fs-section {
          padding: 40px 0;
          background: #ffffff;
        }

        .fs-container {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 clamp(4.6rem, 4vw, 4rem);
          box-sizing: border-box;
        }

        .fs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .fs-card {
          background: #f6f5f3;
          border-radius: 6px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .fs-icon-wrap {
          width: 40px;
          height: 40px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d08a60;
        }

        .fs-icon {
          width: 36px;
          height: 36px;
          stroke-width: 1.5;
        }

        .fs-title {
          margin: 0 0 8px;
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #17172f;
        }

        .fs-desc {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          font-size: 0.85rem;
          font-weight: 400;
          color: #8a8a8a;
          line-height: 1.6;
        }

        @media (max-width: 1024px) {
          .fs-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
        }

        @media (max-width: 640px) {
          .fs-section { padding: 28px 0; }
          .fs-container { padding: 0 1rem; }
          .fs-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .fs-card { padding: 24px 18px; }
        }
      `}</style>

      <section className="fs-section">
        <div className="fs-container">
          <div className="fs-grid">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div className="fs-card" key={feature.title}>
                  <div className="fs-icon-wrap">
                    <Icon className="fs-icon" aria-hidden="true" />
                  </div>
                  <h3 className="fs-title">{feature.title}</h3>
                  <p className="fs-desc">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}