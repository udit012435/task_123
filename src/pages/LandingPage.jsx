import Navbar from '../components/Navbar/Navbar'
import Hero from '../components/Hero/Hero'
import Destinations from '../components/Destinations/Destinations'
import WhyChooseUs from '../components/WhyChooseUs/WhyChooseUs'
import DestinationZoom from '../components/DestinationZoom/DestinationZoom'
import Packages from '../components/Packages/Packages'
import Footer from '../components/Footer/Footer'

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Destinations />
      <WhyChooseUs />
      <DestinationZoom />
      <Packages />
      <Footer />
    </>
  )
}

export default LandingPage
