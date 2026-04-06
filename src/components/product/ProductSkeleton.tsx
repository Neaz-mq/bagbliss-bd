export default function ProductSkeleton() {
  return (
    <div className="product-card product-skeleton-card">
      <div className="product-image-container">
        <div
          className="skeleton"
          style={{ height: '280px', borderRadius: 'var(--radius-lg)' }}
        />
      </div>
      <div className="product-info" style={{ gap: '0.6rem' }}>
        <div
          className="skeleton"
          style={{ height: '12px', width: '60px', borderRadius: '4px' }}
        />
        <div
          className="skeleton"
          style={{ height: '18px', width: '100%', borderRadius: '4px' }}
        />
        <div
          className="skeleton"
          style={{ height: '14px', width: '80px', borderRadius: '4px' }}
        />
        <div
          className="skeleton"
          style={{ height: '20px', width: '70px', borderRadius: '4px' }}
        />
      </div>
      <div
        className="skeleton"
        style={{
          height: '42px',
          borderRadius: 'var(--radius-full)',
          margin: '0 1rem 1rem',
        }}
      />
    </div>
  )
}
