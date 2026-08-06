/**
 * Lightweight NSFW image classifier using @tensorflow/tfjs directly.
 *
 * Replaces the `nsfwjs` npm package (which had a low Socket supply-chain
 * score) with a direct TensorFlow.js implementation that loads the same
 * MobileNetV2 model from the official public CDN.
 *
 * API surface is intentionally minimal — only what FanUploadForm needs:
 *   loadNsfwModel()  → returns a model wrapper
 *   model.classify() → returns class predictions
 */

import * as tf from '@tensorflow/tfjs';

// The 5 NSFW classes in the order the model outputs them
const NSFW_CLASSES: Record<number, string> = {
  0: 'Drawing',
  1: 'Hentai',
  2: 'Neutral',
  3: 'Porn',
  4: 'Sexy'
};

// Official nsfwjs MobileNetV2 model hosted on public CDN
const MODEL_URL = 'https://nsfwjs-model.s3.us-west-2.amazonaws.com/mobilenet_v2/model.json';
const IMAGE_SIZE = 224; // MobileNetV2 input size

export interface NsfwPrediction {
  className: string;
  probability: number;
}
export interface NsfwModel {
  classify(img: HTMLImageElement | HTMLCanvasElement, topk?: number): Promise<NsfwPrediction[]>;
  dispose(): void;
}

/**
 * Load the NSFW MobileNetV2 graph model and warm it up with a dummy pass.
 */
export async function loadNsfwModel(): Promise<NsfwModel> {
  const model = await tf.loadGraphModel(MODEL_URL);

  // Warm-up pass — ensures WebGL shaders are compiled so first real
  // classify() call doesn't stall the UI.
  const warmup = tf.tidy(() => model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])));
  if (warmup instanceof tf.Tensor) {
    await warmup.data();
    warmup.dispose();
  }
  return {
    async classify(img, topk = 5): Promise<NsfwPrediction[]> {
      const logits = tf.tidy(() => {
        const tensor = tf.browser.fromPixels(img) as tf.Tensor3D;
        // Normalize 0-255 → 0-1
        const normalized = tensor.toFloat().div(255) as tf.Tensor3D;
        // Resize to model input size
        const resized = tensor.shape[0] !== IMAGE_SIZE || tensor.shape[1] !== IMAGE_SIZE ? tf.image.resizeBilinear(normalized, [IMAGE_SIZE, IMAGE_SIZE], true) : normalized;
        const batched = resized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
        return model.predict(batched) as tf.Tensor;
      });
      const values = await logits.data();
      logits.dispose();

      // Sort by probability descending, take topk
      const indexed = Array.from(values).map((probability, index) => ({
        probability,
        index
      })).sort((a, b) => b.probability - a.probability).slice(0, topk);
      return indexed.map(({
        probability,
        index
      }) => ({
        className: NSFW_CLASSES[index] || `Unknown_${index}`,
        probability
      }));
    },
    dispose() {
      model.dispose();
    }
  };
}