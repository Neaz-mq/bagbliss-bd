import ReactDOM from 'react-dom'
import HeroSection from '@/components/home/HeroSection'
import CategoryStrip from '@/components/home/CategoryStrip'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import CustomerReview from '@/components/home/CustomerReview'
import FeatureStrip from '@/components/home/FeatureStrip'
import HelpSection from '@/components/home/HelpSection'
import { HERO_IMAGE_SRC } from '@/components/home/heroAssets'

export default function Home() {
  // ⚡ সবচেয়ে বড় ছবি (LCP) JS লোডের অপেক্ষা না করে আগেই নামানো শুরু
  ReactDOM.preload(HERO_IMAGE_SRC, { as: 'image', fetchPriority: 'high' })

  return (
    <main>
      <HeroSection />
      <CategoryStrip />
      <FeaturedProducts />
      <CustomerReview />
      <FeatureStrip />
      <HelpSection />
    </main>
  )
}