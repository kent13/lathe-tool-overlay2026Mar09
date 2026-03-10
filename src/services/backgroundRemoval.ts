import { removeBackground } from "@imgly/background-removal";

console.log('backgroundRemoval.ts is loaded');

export async function removeBackgroundLocal(base64Image: string): Promise<string | null> {
  try {
    // The library can take a string (URL or base64), Blob, or File
    const blob = await removeBackground(base64Image, {
      progress: (key, current, total) => {
        // console.log(`Downloading ${key}: ${current} of ${total}`);
      },
      model: 'isnet_fp16',
      output: {
        format: 'image/png',
        quality: 0.8,
      },
    });
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error removing background locally:", error);
    return null;
  }
}
