import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { conversation } from "./functions/conversation.js";
import readfile from "fs/promises";
import generateContent from "./functions/gemini.js";

//carga de variables de entorno
dotenv.config();
const prompt = await readfile.readFile("prompt/prompt.txt", "utf-8");

//creacion del servidor express
const app = express();
app.use(express.json());

//Endpoint del boot

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
    let text = message.text?.body;
    const profileName = contacts?.profile?.name;  // Nombre del perfil de WhatsApp
    
    if(message.type === "text"){
      text = text.toLowerCase();
      if(text.includes("buscar")){
        await sendMessage(from, `Buscando "${text.slice(7).trim()}", por favor espera...`);
        const conversationResult = await conversation(from, profileName, text);
        let messageToSend;
        if (Array.isArray(conversationResult) && conversationResult.length > 0) {
          messageToSend = conversationResult.map((item, idx) => {
            return `${idx + 1}. ${item.titulo || 'Producto'}\n💰 ${item.precio || 'N/D'}\n🏪 ${item.tienda || 'N/D'}\n🔗 ${item.link || ''}`;
          }).join("\n\n");
        } else {
          messageToSend = "No se encontraron productos para tu búsqueda.";
        }
        await sendMessage(from, messageToSend);
      } else if(text === "hola" || text === "ola" || text === "hello"){
          await sendMessage(from, `Hola ${profileName}, ¿que producto vamos a buscar hoy? escribe \n "buscar + [nombre producto]" para buscar un producto \n "descripcion + [descripcion con tus palabras del producto]" para ayudarte a saber cual es tu producto.`);
      } if(text.includes("descripcion") || text.includes("descripción")){
        await sendMessage(from, `Pensando en cual puede ser su producto , por favor espera...`);
        const productName = await generateContent(process.env.GOOGLE_API_KEY, prompt + text);
        const match = productName.match(/\[([^\]]+)\]/);
        const products = match ? match[1].split(',').map(p => p.trim()) : [];
        await sendMessage(from, `posibles productos: ${products}, si encontre tu producto escribe la palabra buscar + [nombre producto] para ayudarte a cotizarlo.`);
      }else {
        await sendMessage(from, `Solo puedo procesar mensajes de texto por ahora.`);
      }
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