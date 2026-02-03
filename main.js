import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("Bot de WhatsApp funcionando");
});

/* Verificación del webhook */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("Webhook verificado");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/* Recepción de mensajes */
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body;

    console.log("Mensaje recibido:", text);

    await sendMessage(from, `Recibí tu mensaje: ${text}`);
  }

  res.sendStatus(200);
});

/* Enviar mensaje */
async function sendMessage(to, text) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: text,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Mensaje enviado OK:", response.data);
  } catch (error) {
    console.error(
      "Error enviando mensaje:",
      error.response?.data || error.message
    );
  }
}


app.listen(process.env.PORT, () => {
  console.log(`Bot corriendo en puerto ${process.env.PORT}`);
});