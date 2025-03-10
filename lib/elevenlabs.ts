export async function textToSpeech(text: string) {
  const ELEVEN_LABS_API_KEY = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY;
  const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";


  console.log("ELEVEN_LABS_API_KEY", ELEVEN_LABS_API_KEY);
  if (!ELEVEN_LABS_API_KEY) {
    throw new Error("Missing Eleven Labs API key");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!response.ok) {
    console.log("===>", response);
    throw new Error("Failed to generate speech");
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
} 