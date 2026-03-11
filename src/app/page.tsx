export default function Home() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1rem',
      }}
    >
      <h1 className="text-gradient">BagBliss BD</h1>
      <p>Bangladesh&apos;s Most Trendy Mini Crossbody Bag Store</p>
      <span className="badge badge-accent">Launching June 1, 2026</span>
    </main>
  )
}
