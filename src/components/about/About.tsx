"use client"
import {  Users, Target, Award, Lightbulb} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "../marketplace/header"
import { Footer } from "../marketplace/footer"
import ourMission from "../../../public/our-mission.webp"
import Image from "next/image"
// Import translation hook
import { useTranslations } from 'next-intl';

export default function About() {
  // Initialize translations
  const t = useTranslations('AboutPage');

  // Keep appName and foundingYear as variables
  const appName = "German Guest Post"
  const foundingYear = "2025"

  // Use translations for milestones
  const milestones = [
    {
      year: "2018",
      title: t('milestone1Title'),
      description: t('milestone1Description', { appName }),
    },
    {
      year: "2019",
      title: t('milestone2Title'),
      description: t('milestone2Description'),
    },
    {
      year: "2020",
      title: t('milestone3Title'),
      description: t('milestone3Description'),
    },
    {
      year: "2021",
      title: t('milestone4Title'),
      description: t('milestone4Description'),
    },
    {
      year: "2022",
      title: t('milestone5Title'),
      description: t('milestone5Description'),
    },
    {
      year: "2023",
      title: t('milestone6Title'),
      description: t('milestone6Description', { appName }),
    },
  ]

  // Use translations for core values
  const coreValues = [
    {
      title: t('value1Title'),
      description: t('value1Description'),
      icon: <Award className="h-6 w-6" />,
    },
    {
      title: t('value2Title'),
      description: t('value2Description'),
      icon: <Lightbulb className="h-6 w-6" />,
    },
    {
      title: t('value3Title'),
      description: t('value3Description'),
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: t('value4Title'),
      description: t('value4Description'),
      icon: <Target className="h-6 w-6" />,
    },
  ]

  return (
    <>
    <Header/>
   
    <div className="min-h-screen bg-[#f8f0ff] pb-16">
      {/* Header */}
      <div
        className="w-full py-16 px-4 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(160,32,240,0.15) 0%, rgba(160,32,240,0.05) 100%)",
          borderBottom: "1px solid rgba(160,32,240,0.1)",
        }}
      >
        <div className="container mx-auto max-w-4xl">
          {/* Use translated title and subtitle with variables */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 gradient-text">
            {t('pageTitle', { appName })}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('pageSubtitle', { year: foundingYear })}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Company Overview */}
          <section>
            <Card className="border shadow-md overflow-hidden " style={{ borderColor: "rgba(160,32,240,0.1)"  , padding:0}}>
              <div className="md:flex ">
                <div className="md:w-1/2 p-8 " >
                  {/* Use translated mission title and paragraphs */}
                  <h2 className="text-2xl font-bold mb-4 gradient-text" >
                    {t('missionTitle')}
                  </h2>
                  <p className="text-gray-700 mb-4">
                    {t('missionParagraph1', { appName })}
                  </p>
                  <p className="text-gray-700">
                    {t('missionParagraph2')}
                  </p>
                </div>
                <div
                  className="md:w-1/2 flex items-center justify-center"
                >
               <Image
                        src={ourMission}
                        alt="image..." // Consider translating alt text if needed
                        className="w-full h-full object-cover aspect-square"
                      />
                   
                </div>
              </div>
            </Card>
          </section>

          {/* Core Values */}
          <section>
            {/* Use translated values title */}
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text" >
              {t('valuesTitle')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Values are already using translated data from the array */}
              {coreValues.map((value, index) => (
                <Card key={index} className="border shadow-md" style={{ borderColor: "rgba(160,32,240,0.1)" }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
                        style={{
                          backgroundColor: "rgba(160,32,240,0.1)",
                          color: "#a020f0",
                        }}
                      >
                        {value.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: "#a020f0" }}>
                          {value.title}
                        </h3>
                        <p className="text-gray-700">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Company Timeline */}
          <section>
            {/* Use translated journey title */}
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text" >
              {t('journeyTitle')}
            </h2>
            <div className="relative border-l-2 ml-4 pl-8 py-4" style={{ borderColor: "rgba(160,32,240,0.3)" }}>
              {/* Milestones are already using translated data from the array */}
              {milestones.map((milestone, index) => (
                <div key={index} className="mb-10 relative">
                  <div
                    className="absolute -left-12 w-6 h-6 rounded-full"
                    style={{
                      backgroundColor: "rgba(160,32,240,0.2)",
                      border: "2px solid #a020f0",
                      top: "0px",
                    }}
                  />
                  <div
                    className="inline-block text-sm font-medium px-3 py-1 rounded-full mb-2"
                    style={{
                      backgroundColor: "rgba(160,32,240,0.1)",
                      color: "#a020f0",
                    }}
                  >
                    {milestone.year}
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "#a020f0" }}>
                    {milestone.title}
                  </h3>
                  <p className="text-gray-700">{milestone.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  )
}

