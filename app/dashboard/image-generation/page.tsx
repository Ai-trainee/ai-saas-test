"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ImagePlus, Settings2, Sparkles } from "lucide-react"
import { imageModels, type ImageModelConfig } from "@/lib/image-models"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<ImageModelConfig>(imageModels[0])
  const [width, setWidth] = useState(selectedModel.defaultParams.width)
  const [height, setHeight] = useState(selectedModel.defaultParams.height)
  const [steps, setSteps] = useState(selectedModel.defaultParams.steps)
  const [numImages, setNumImages] = useState(selectedModel.defaultParams.n)
  const { language } = useLanguage()
  const t = translations.imageGeneration[language]

  const handleModelChange = (modelId: string) => {
    const model = imageModels.find(m => m.id === modelId)
    if (model) {
      setSelectedModel(model)
      setWidth(model.defaultParams.width)
      setHeight(model.defaultParams.height)
      setSteps(model.defaultParams.steps)
      setNumImages(model.defaultParams.n)
    }
  }

  const handleSizeChange = (size: string) => {
    const selectedSize = selectedModel.supportedSizes.find(s => s.label === size)
    if (selectedSize) {
      setWidth(selectedSize.width)
      setHeight(selectedSize.height)
    }
  }

  async function generateImage() {
    if (!prompt) {
      toast({
        title: t.toastMessages.enterPrompt,
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("https://api.together.xyz/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 885f554db544f4ceac33604841f28d923a5a9d0e80b698c061374afa229a0b79",
        },
        body: JSON.stringify({
          model: selectedModel.model,
          prompt,
          width,
          height,
          steps,
          n: numImages,
          seed: Math.floor(Math.random() * 1000000),
          response_format: "b64_json",
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setGeneratedImage(`data:image/png;base64,${data.data[0].b64_json}`)
      toast({
        title: t.toastMessages.generateSuccess,
      })
    } catch (error: any) {
      toast({
        title: t.toastMessages.generateFailed,
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t.advancedSettings}</SheetTitle>
                <SheetDescription>
                  {t.customizeParams}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label>{t.model}</Label>
                  <Select value={selectedModel.id} onValueChange={handleModelChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          <span className="inline-flex items-center">
                            <span className="mr-2">{model.icon}</span>
                            {model.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">{selectedModel.description}</p>
                </div>

                <div className="space-y-2">
                  <Label>{t.imageRatio}</Label>
                  <Select value={`${width}x${height}`} onValueChange={handleSizeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedModel.supportedSizes.map(size => (
                        <SelectItem key={size.label} value={size.label}>
                          {size.label} ({size.width}x{size.height})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.generationSteps} ({steps})</Label>
                  <Slider
                    value={[steps]}
                    onValueChange={([value]) => setSteps(value)}
                    max={selectedModel.maxSteps}
                    min={1}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.generationCount} ({numImages})</Label>
                  <Slider
                    value={[numImages]}
                    onValueChange={([value]) => setNumImages(value)}
                    max={selectedModel.maxImages}
                    min={1}
                    step={1}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder={t.promptPlaceholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            onClick={generateImage}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.generating}
              </>
            ) : (
              <>
                <ImagePlus className="mr-2 h-4 w-4" />
                {t.generateImage}
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {generatedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t.generationResult}</h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>{selectedModel.name}</span>
                </div>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border">
                <img
                  src={generatedImage}
                  alt="AI Generated Image"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 