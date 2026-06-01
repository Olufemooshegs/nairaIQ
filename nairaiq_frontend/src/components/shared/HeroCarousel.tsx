import React, { useEffect, useState } from 'react'

const slides = [
  { id: 1, image: 'https://wallethub.pro/assets/hero-1-D7njtvPV.jpg', title: 'Smart Finance Management' },
  { id: 2, image: 'https://wallethub.pro/assets/hero-2-DF3Zwe5D.jpg', title: 'Real-time insights' },
  { id: 3, image: 'https://wallethub.pro/assets/hero-3-D7U8SuK9.jpg', title: 'Set goals and track progress' }
]

export default function HeroCarousel({ interval = 5000 }: { interval?: number }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % slides.length), interval)
    return () => clearInterval(t)
  }, [interval])

  return (
    <div className="hero-carousel" aria-hidden>
      {slides.map((s, i) => (
        <div key={s.id} className={`slide ${i === index ? 'active' : ''}`} style={{ backgroundImage: `url(${s.image})` }} />
      ))}
      <div className="hero-overlay" />
    </div>
  )
}
