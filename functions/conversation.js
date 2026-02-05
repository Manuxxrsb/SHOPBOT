import { scrapeKnasta } from './scrapper.js';

export async function conversation(from, profileName, text) {
    console.log(`Iniciando busqueda para ${profileName} (${from})`);
    try {

        const product = text.slice(7).trim(); 
        
        if (!product) {
            console.log("⚠️ No se proporcionó un nombre de producto");
            return [];
        }

        const list = await scrapeKnasta(product, 3);
        return list;

    } catch (error) {
        console.error(`Error en la busqueda para ${profileName}:`, error);
        return [];
    }
}