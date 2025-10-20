class BszNubeAPI {
    constructor() {
        this.baseURL = 'https://bsznubeapi.github.io';
        this.jsonBinConfig = {
            binId: '68f66c28d0ea881f40aed3bd',
            apiKey: '$2a$10$zBWrcQ9BKnHeMj9ijUB/ie0d5wDkEVuTCqmTgYwLVeLrtGDnvUBm.'
        };
        this.maxRecords = 100;
    }

    // Método para obtener datos de JSONBin
    async getFromJSONBin(collection) {
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${this.jsonBinConfig.binId}`, {
                headers: { 
                    'X-Master-Key': this.jsonBinConfig.apiKey
                }
            });
            
            if (!response.ok) throw new Error('Error fetching data');
            
            const data = await response.json();
            return data.record[collection] || [];
        } catch (error) {
            console.error('Error con JSONBin, usando datos locales:', error);
            // Fallback a datos locales
            const localResponse = await fetch(`${this.baseURL}/data/db.json`);
            const localData = await localResponse.json();
            return localData[collection] || [];
        }
    }

    // Método para guardar en JSONBin
    async saveToJSONBin(collection, data) {
        try {
            // Primero obtener datos actuales
            const currentResponse = await fetch(`https://api.jsonbin.io/v3/b/${this.jsonBinConfig.binId}`, {
                headers: { 
                    'X-Master-Key': this.jsonBinConfig.apiKey
                }
            });
            
            const currentData = await currentResponse.json();
            const updatedData = {
                ...currentData.record,
                [collection]: data
            };

            // Guardar datos actualizados
            await fetch(`https://api.jsonbin.io/v3/b/${this.jsonBinConfig.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.jsonBinConfig.apiKey
                },
                body: JSON.stringify(updatedData)
            });
            
            return true;
        } catch (error) {
            console.error('Error saving to JSONBin:', error);
            return false;
        }
    }

    // GET - Obtener todos los items de una colección
    async get(collection) {
        return await this.getFromJSONBin(collection);
    }

    // POST - Crear nuevo item
    async post(collection, item) {
        const currentData = await this.getFromJSONBin(collection);
        
        const newItem = {
            id: Date.now().toString(),
            ...item,
            createdAt: new Date().toISOString()
        };

        // Limitar a 100 registros
        const updatedData = [...currentData, newItem];
        if (updatedData.length > this.maxRecords) {
            updatedData.shift(); // Eliminar el más antiguo
        }

        await this.saveToJSONBin(collection, updatedData);
        return newItem;
    }

    // PUT - Actualizar item existente
    async put(collection, id, updates) {
        const currentData = await this.getFromJSONBin(collection);
        const index = currentData.findIndex(item => item.id === id);
        
        if (index === -1) {
            throw new Error('Item no encontrado');
        }

        currentData[index] = {
            ...currentData[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await this.saveToJSONBin(collection, currentData);
        return currentData[index];
    }

    // DELETE - Eliminar item
    async delete(collection, id) {
        const currentData = await this.getFromJSONBin(collection);
        const filteredData = currentData.filter(item => item.id !== id);
        
        if (filteredData.length === currentData.length) {
            throw new Error('Item no encontrado');
        }

        await this.saveToJSONBin(collection, filteredData);
        return { deleted: true, id };
    }

    // GET por ID - Obtener item específico
    async getById(collection, id) {
        const data = await this.getFromJSONBin(collection);
        const item = data.find(item => item.id === id);
        
        if (!item) {
            throw new Error('Item no encontrado');
        }
        
        return item;
    }
}

// Crear instancia global
window.bszAPI = new BszNubeAPI();
