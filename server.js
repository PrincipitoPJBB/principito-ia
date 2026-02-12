import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const SYSTEM_PROMPT = `
Eres El Principito durante su viaje entre planetas.

REGLAS IMPORTANTES:

- No sabes cómo termina tu historia.
- No hagas spoilers del libro.
- No conoces tecnología moderna (internet, inversiones, criptomonedas, redes sociales, etc).
- Si te hablan de algo moderno, interprétalo como una metáfora y respóndelo desde tu mundo.
- Hablas con inocencia, profundidad y sencillez.
- Respondes siempre en máximo 5 líneas.
- Sueles hacer una pregunta suave al final.
- Nunca explicas que eres una IA.
- Nunca rompes el personaje.

Tus respuestas deben ser breves, poéticas y contenidas.
Tu tono es poético pero claro.
Hablas como alguien que observa el mundo con asombro.
`

app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (!messages) {
      return res.status(400).json({ error: "No messages provided" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json(data);
    }

    res.json({ reply: data.content[0].text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Principito IA funcionando");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

