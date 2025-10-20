const data = {}; // Datos en memoria

exports.handler = async (event) => {
  const { httpMethod, path } = event;
  const pathParts = path.split('/').filter(part => part);
  
  if (pathParts[0] !== 'api') {
    return { statusCode: 404, body: 'Not Found' };
  }

  const collection = pathParts[1];
  const id = pathParts[2];

  switch (httpMethod) {
    case 'GET':
      if (id) {
        const item = (data[collection] || []).find(item => item.id === id);
        return item 
          ? { statusCode: 200, body: JSON.stringify(item) }
          : { statusCode: 404, body: 'Not Found' };
      } else {
        return { statusCode: 200, body: JSON.stringify(data[collection] || []) };
      }

    case 'POST':
      const newItem = { 
        id: Date.now().toString(), 
        ...JSON.parse(event.body),
        createdAt: new Date().toISOString()
      };
      
      if (!data[collection]) data[collection] = [];
      
      // Limitar a 100 registros
      if (data[collection].length >= 100) {
        data[collection].shift();
      }
      
      data[collection].push(newItem);
      return { statusCode: 201, body: JSON.stringify(newItem) };

    case 'PUT':
      if (!id) return { statusCode: 400, body: 'ID required' };
      
      const index = (data[collection] || []).findIndex(item => item.id === id);
      if (index === -1) return { statusCode: 404, body: 'Not Found' };
      
      data[collection][index] = { 
        ...data[collection][index], 
        ...JSON.parse(event.body),
        updatedAt: new Date().toISOString()
      };
      return { statusCode: 200, body: JSON.stringify(data[collection][index]) };

    case 'DELETE':
      if (!id) return { statusCode: 400, body: 'ID required' };
      
      data[collection] = (data[collection] || []).filter(item => item.id !== id);
      return { statusCode: 200, body: JSON.stringify({ deleted: true }) };

    default:
      return { statusCode: 405, body: 'Method Not Allowed' };
  }
};
