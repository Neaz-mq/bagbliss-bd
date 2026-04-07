import HeroSection from '@/components/home/HeroSection'
import CategoryStrip from '@/components/home/CategoryStrip'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import FlashSale from '@/components/home/FlashSale'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CategoryStrip />
      <FeaturedProducts />
      <FlashSale />
    </main>
  )
}
