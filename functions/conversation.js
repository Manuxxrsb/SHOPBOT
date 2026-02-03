import { scrapeKnasta } from './scraper.js';

export async function conversation(from, profileName, text) {
    try {
        console.log(`Iniciando conversación con ${profileName} (${from})`);
        
        const product = text.slice(7).trim(); 
        
        if (!product) {
            console.log("⚠️ No se proporcionó un nombre de producto");
            return [];
        }

        const list = await scrapeKnasta(product, 3);
        
        return list;
        
    } catch (error) {
        console.error(`Error en la conversación con ${profileName}:`, error);
        return [];
    }
}