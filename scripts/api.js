class SimpleAPI {
  constructor() {
    this.baseURL = window.location.origin;
    this.maxRecords = 100;
  }

  async loadData() {
    try {
      const response = await fetch(`${this.baseURL}/data/db.json`);
      return await response.json();
    } catch (error) {
      console.error('Error loading data:', error);
      return {};
    }
  }

  async saveData(data) {
    // En un entorno real, esto se conectaría con GitHub Actions
    // Por ahora, solo guardamos en localStorage para testing
    localStorage.setItem('mockapi_data', JSON.stringify(data));
    return { success: true };
  }

  async get(collection) {
    const data = await this.loadData();
    return data[collection] || [];
  }

  async post(collection, item) {
    const data = await this.loadData();
    
    if (!data[collection]) {
      data[collection] = [];
    }

    // Generar ID único
    const id = Date.now().toString();
    const newItem = { id, ...item, createdAt: new Date().toISOString() };

    // Limitar a 100 registros
    if (data[collection].length >= this.maxRecords) {
      data[collection].shift(); // Eliminar el más antiguo
    }

    data[collection].push(newItem);
    
    await this.saveData(data);
    return newItem;
  }

  async put(collection, id, updates) {
    const data = await this.loadData();
    
    if (data[collection]) {
      const index = data[collection].findIndex(item => item.id === id);
      if (index !== -1) {
        data[collection][index] = { 
          ...data[collection][index], 
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await this.saveData(data);
        return data[collection][index];
      }
    }
    return null;
  }

  async delete(collection, id) {
    const data = await this.loadData();
    
    if (data[collection]) {
      const index = data[collection].findIndex(item => item.id === id);
      if (index !== -1) {
        const deleted = data[collection].splice(index, 1)[0];
        await this.saveData(data);
        return deleted;
      }
    }
    return null;
  }
}

// Crear instancia global
window.mockAPI = new SimpleAPI();
