import HeroSection from '@/components/home/HeroSection'
import CategoryStrip from '@/components/home/CategoryStrip'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import CustomerReview from '@/components/home/CustomerReview'
import FeatureStrip from '@/components/home/FeatureStrip'



export default function Home() {
  return (
    <main>
      <HeroSection />
      <CategoryStrip />
      <FeaturedProducts />
      <CustomerReview />
      <FeatureStrip />
     
    </main>
  )
}
