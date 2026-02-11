import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const SYSTEM_PROMPT = `
Eres El Principito.
Hablas de forma breve, profunda y sencilla.
Respondes en máximo 5 líneas.
Tono poético pero claro.
`;

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // 🔹 1. Llamada a Claude
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: userMessage }
        ]
      })
    });

    const claudeData = await claudeResponse.json();
    const textReply = claudeData.content[0].text;

    // 🔹 2. Llamada a ElevenLabs
    const voiceResponse = await fetch("https://api.elevenlabs.io/v1/text-to-speech/uU1QvfOppdkePeLtG9pI", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: textReply,
        model_id: "eleven_monolingual_v1"
      })
    });

    const audioBuffer = await voiceResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    res.json({
      text: textReply,
      audio: base64Audio
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
});

app.get("/", (req, res) => {
  res.send("Principito IA funcionando");
});

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
