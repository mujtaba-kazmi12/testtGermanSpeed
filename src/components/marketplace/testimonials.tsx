"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Sparkles, Star } from "lucide-react"
import { useTranslations } from 'next-intl';

// Define the Testimonial type
interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  avatar: string
  content: string
  rating: number
}

export function TestimonialsSection() {
  // Initialize translations
  const t = useTranslations('TestimonialsSection');

  // Use translation keys for mock testimonials data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: t('testimonial1Role'),
      company: t('testimonial1Company'),
      avatar: "/placeholder.svg?height=80&width=80",
      content: t('testimonial1Content'),
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: t('testimonial2Role'),
      company: t('testimonial2Company'),
      avatar: "/placeholder.svg?height=80&width=80",
      content: t('testimonial2Content'),
      rating: 4.5,
    },
    {
      id: 3,
      name: "Jessica Williams",
      role: t('testimonial3Role'),
      company: t('testimonial3Company'),
      avatar: "/placeholder.svg?height=80&width=80",
      content: t('testimonial3Content'),
      rating: 5,
    },
    {
      id: 4,
      name: "David Rodriguez",
      role: t('testimonial4Role'),
      company: t('testimonial4Company'),
      avatar: "/placeholder.svg?height=80&width=80",
      content: t('testimonial4Content'),
      rating: 4.8,
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-violet-50/50 to-white">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge className="inline-flex bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-700 border-violet-200">
              <Sparkles className="mr-1 h-3 w-3" /> {t('badge')}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight glow-text">
              <span className="gradient-text">{t('title1')}</span> {t('title2')}
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              {t('description')}
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Carousel className="w-full">
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3 p-2">
                  <Card className="h-full border-0 hover-card-effect bg-white shadow-md">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="border-2 border-violet-200">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                            {testimonial.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{testimonial.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}, {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(testimonial.rating) ? "fill-fuchsia-500 text-fuchsia-500" : "text-muted"}`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground">{testimonial.content}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-6">
              <CarouselPrevious className="relative mr-2 border-violet-200 hover:bg-violet-50 hover:text-violet-700" />
              <CarouselNext className="relative border-violet-200 hover:bg-violet-50 hover:text-violet-700" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  )
}

