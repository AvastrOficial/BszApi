class BszNubeAPI {
    constructor() {
        this.baseURL = 'https://bsznubeapi.github.io';
        this.jsonBinConfig = {
            binId: '68f66c28d0ea881f40aed3bd',
            apiKey: '$2a$10$zBWrcQ9BKnHeMj9ijUB/ie0d5wDkEVuTCqmTgYwLVeLrtGDnvUBm.'
        };
        this.maxRecords = 100;
    }

    // Método mejorado para obtener datos
    async getFromJSONBin() {
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${this.jsonBinConfig.binId}`, {
                headers: { 
                    'X-Master-Key': this.jsonBinConfig.apiKey
                }
            });
            
            if (!response.ok) throw new Error('Error fetching data');
            
            const data = await response.json();
            return data.record || {};
        } catch (error) {
            console.error('Error con JSONBin:', error);
            // Fallback a datos locales
            const localResponse = await fetch(`${this.baseURL}/data/db.json`);
            return await localResponse.json();
        }
    }

    // Método para guardar en JSONBin
    async saveToJSONBin(data) {
        try {
            await fetch(`https://api.jsonbin.io/v3/b/${this.jsonBinConfig.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.jsonBinConfig.apiKey
                },
                body: JSON.stringify(data)
            });
            return true;
        } catch (error) {
            console.error('Error saving to JSONBin:', error);
            return false;
        }
    }

    // ✅ NUEVO: Crear colección personalizada
    async createCollection(collectionName, initialData = []) {
        const allData = await this.getFromJSONBin();
        
        if (!allData[collectionName]) {
            allData[collectionName] = initialData;
            await this.saveToJSONBin(allData);
            return { success: true, message: `Colección ${collectionName} creada` };
        }
        return { success: false, message: `La colección ${collectionName} ya existe` };
    }

    // ✅ NUEVO: Agregar item con estructura personalizada
    async addCustomItem(collection, customItem) {
        const allData = await this.getFromJSONBin();
        
        if (!allData[collection]) {
            allData[collection] = [];
        }

        // Generar ID si no existe
        if (!customItem.id) {
            customItem.id = Date.now().toString();
        }

        // Agregar timestamp
        if (!customItem.createdAt) {
            customItem.createdAt = new Date().toISOString();
        }

        // Limitar a 100 registros
        if (allData[collection].length >= this.maxRecords) {
            allData[collection].shift();
        }

        allData[collection].push(customItem);
        await this.saveToJSONBin(allData);
        return customItem;
    }

    // ✅ NUEVO: Agregar múltiples items
    async addMultipleItems(collection, items) {
        const allData = await this.getFromJSONBin();
        
        if (!allData[collection]) {
            allData[collection] = [];
        }

        const newItems = items.map(item => ({
            id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
            createdAt: new Date().toISOString(),
            ...item
        }));

        // Combinar y limitar a 100 registros
        allData[collection] = [...allData[collection], ...newItems];
        if (allData[collection].length > this.maxRecords) {
            allData[collection] = allData[collection].slice(-this.maxRecords);
        }

        await this.saveToJSONBin(allData);
        return newItems;
    }

    // ✅ NUEVO: Buscar items por campo específico
    async findByField(collection, field, value) {
        const allData = await this.getFromJSONBin();
        const collectionData = allData[collection] || [];
        
        return collectionData.filter(item => item[field] === value);
    }

    // ✅ NUEVO: Actualizar campo específico
    async updateField(collection, id, field, value) {
        const allData = await this.getFromJSONBin();
        
        if (!allData[collection]) {
            throw new Error(`Colección ${collection} no existe`);
        }

        const index = allData[collection].findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`ID ${id} no encontrado`);
        }

        allData[collection][index][field] = value;
        allData[collection][index].updatedAt = new Date().toISOString();
        
        await this.saveToJSONBin(allData);
        return allData[collection][index];
    }

    // ✅ NUEVO: Obtener todas las colecciones
    async getCollections() {
        const allData = await this.getFromJSONBin();
        return Object.keys(allData);
    }

    // ✅ NUEVO: Eliminar colección completa
    async deleteCollection(collection) {
        const allData = await this.getFromJSONBin();
        
        if (allData[collection]) {
            delete allData[collection];
            await this.saveToJSONBin(allData);
            return { success: true, message: `Colección ${collection} eliminada` };
        }
        
        return { success: false, message: `Colección ${collection} no existe` };
    }

    // Métodos originales (mejorados)
    async get(collection) {
        const allData = await this.getFromJSONBin();
        return allData[collection] || [];
    }

    async post(collection, item) {
        return await this.addCustomItem(collection, item);
    }

    async put(collection, id, updates) {
        const allData = await this.getFromJSONBin();
        
        if (!allData[collection]) {
            throw new Error(`Colección ${collection} no existe`);
        }

        const index = allData[collection].findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`ID ${id} no encontrado`);
        }

        allData[collection][index] = {
            ...allData[collection][index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await this.saveToJSONBin(allData);
        return allData[collection][index];
    }

    async delete(collection, id) {
        const allData = await this.getFromJSONBin();
        
        if (!allData[collection]) {
            throw new Error(`Colección ${collection} no existe`);
        }

        const filteredData = allData[collection].filter(item => item.id !== id);
        
        if (filteredData.length === allData[collection].length) {
            throw new Error(`ID ${id} no encontrado`);
        }

        allData[collection] = filteredData;
        await this.saveToJSONBin(allData);
        return { deleted: true, id };
    }

    async getById(collection, id) {
        const data = await this.get(collection);
        const item = data.find(item => item.id === id);
        
        if (!item) {
            throw new Error('Item no encontrado');
        }
        
        return item;
    }
}

// Crear instancia global
window.bszAPI = new BszNubeAPI();
