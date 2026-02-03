import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { conversation } from "./functions/conversation.js";

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
  const contacts = changes?.value?.contacts?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body;
    const profileName = contacts?.profile?.name;  // Nombre del perfil de WhatsApp
    

    if(message.type === "text"){
      text = text.toLowerCase();
      if(text === "hola" || text === "hi" || text === "hello"){
          await sendMessage(from, `Hola ${profileName}, que producto vamos a buscar hoy? escribe la palabra "Buscar + [nombre producto]" para ayudarte.`);
          if (text.includes("Buscar")){
            let conversationResult = await conversation(from,profileName, text);
            await sendMessage(from,conversationResult);
          } 
      } 
      }else {
      await sendMessage(from, `Solo puedo procesar mensajes de texto por ahora.`);
      } 
    res.sendStatus(200);
  }
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