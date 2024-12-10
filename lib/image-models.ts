export interface ImageModelConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  model: string;
  defaultParams: {
    width: number;
    height: number;
    steps: number;
    n: number;
  };
  supportedSizes: Array<{
    width: number;
    height: number;
    label: string;
  }>;
  maxSteps: number;
  maxImages: number;
}

export const imageModels: ImageModelConfig[] = [
  {
    id: "flux-free",
    name: "FLUX Free",
    description: "快速生成高质量图像，适合日常使用",
    icon: "✨",
    model: "black-forest-labs/FLUX.1-schnell-Free",
    defaultParams: {
      width: 1024,
      height: 1024,
      steps: 4,
      n: 1,
    },
    supportedSizes: [
      { width: 1024, height: 1024, label: "1:1" },
      { width: 1024, height: 768, label: "4:3" },
      { width: 768, height: 1024, label: "3:4" },
      { width: 1024, height: 576, label: "16:9" },
      { width: 576, height: 1024, label: "9:16" },
    ],
    maxSteps: 4,
    maxImages: 1,
  },
  {
    id: "flux-pro",
    name: "FLUX Pro",
    description: "专业级图像生成，支持更��高级设置",
    icon: "🌟",
    model: "black-forest-labs/FLUX.1.1-pro",
    defaultParams: {
      width: 1024,
      height: 1024,
      steps: 1,
      n: 1,
    },
    supportedSizes: [
      { width: 1024, height: 1024, label: "1:1" },
      { width: 1024, height: 768, label: "4:3" },
      { width: 768, height: 1024, label: "3:4" },
      { width: 1024, height: 576, label: "16:9" },
      { width: 576, height: 1024, label: "9:16" },
      { width: 1024, height: 448, label: "21:9" },
      { width: 448, height: 1024, label: "9:21" },
    ],
    maxSteps: 1,
    maxImages: 4,
  },
]; 