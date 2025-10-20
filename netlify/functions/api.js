const { json } = require('micro');

// Datos en memoria (simulando base de datos)
let database = {
  users: [],
  posts: [], 
  products: []
};

// Función para limitar a 100 registros
function limitRecords(collection, newItem) {
  if (database[collection].length >= 100) {
    database[collection].shift(); // Eliminar el más antiguo
  }
  database[collection].push(newItem);
}

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.end();
  }

  const { method, url } = req;
  const path = url.split('?')[0];
  const pathParts = path.split('/').filter(part => part);

  // Verificar que la ruta empiece con /api/
  if (pathParts[0] !== 'api' || pathParts.length < 2) {
    res.statusCode = 404;
    return { error: 'Ruta no encontrada. Use /api/collection' };
  }

  const collection = pathParts[1];
  const id = pathParts[2];

  // Verificar si la colección existe
  if (!database[collection]) {
    database[collection] = [];
  }

  try {
    switch (method) {
      case 'GET':
        if (id) {
          // GET por ID
          const item = database[collection].find(item => item.id === id);
          if (!item) {
            res.statusCode = 404;
            return { error: 'Item no encontrado' };
          }
          return item;
        } else {
          // GET todos
          return database[collection];
        }

      case 'POST':
        const postData = await json(req);
        const newId = Date.now().toString();
        const newItem = {
          id: newId,
          ...postData,
          createdAt: new Date().toISOString()
        };
        
        limitRecords(collection, newItem);
        res.statusCode = 201;
        return newItem;

      case 'PUT':
        if (!id) {
          res.statusCode = 400;
          return { error: 'ID requerido' };
        }
        
        const putData = await json(req);
        const index = database[collection].findIndex(item => item.id === id);
        
        if (index === -1) {
          res.statusCode = 404;
          return { error: 'Item no encontrado' };
        }

        database[collection][index] = {
          ...database[collection][index],
          ...putData,
          updatedAt: new Date().toISOString()
        };
        
        return database[collection][index];

      case 'DELETE':
        if (!id) {
          res.statusCode = 400;
          return { error: 'ID requerido' };
        }

        const deleteIndex = database[collection].findIndex(item => item.id === id);
        if (deleteIndex === -1) {
          res.statusCode = 404;
          return { error: 'Item no encontrado' };
        }

        const deletedItem = database[collection].splice(deleteIndex, 1)[0];
        return { deleted: true, item: deletedItem };

      default:
        res.statusCode = 405;
        return { error: 'Método no permitido' };
    }
  } catch (error) {
    res.statusCode = 500;
    return { error: error.message };
  }
};
