# BszNubeAPI 🚀

Un servidor Mock personalizado usando GitHub Pages + JSONBin.io

## 🌟 Características

- ✅ **Siempre activo** (24/7 via GitHub Pages)
- ✅ **Máximo 100 registros** por colección
- ✅ **Operaciones CRUD completas** (GET, POST, PUT, DELETE)
- ✅ **Almacenamiento persistente** con JSONBin.io
- ✅ **Interfaz web** para testing
- ✅ **CORS habilitado**

## 🛠️ Uso Rápido

```javascript
// Obtener todos los usuarios
const users = await bszAPI.get('users');

// Crear nuevo usuario
const newUser = await bszAPI.post('users', {
  name: 'Juan Pérez',
  email: 'juan@example.com'
});

// Actualizar usuario
const updated = await bszAPI.put('users', 'ID_DEL_USUARIO', {
  name: 'María García'
});

// Eliminar usuario
const deleted = await bszAPI.delete('users', 'ID_DEL_USUARIO');

// Obtener usuario específico
const user = await bszAPI.getById('users', 'ID_DEL_USUARIO');

```
📁 Colecciones Disponibles
- users - Usuarios del sistema
- posts - Publicaciones o artículos
- products - Productos del catálogo

## 🔧 Configuración
**El servidor usa JSONBin.io para almacenamiento:

- Bin ID: 68f66c28xxxxxxxxxxxxxx
- API Key: Configurada en el código

## 🚀 Despliegue
- El sitio se despliega automáticamente en GitHub Pages
- Los datos se almacenan en JSONBin.io
- Accesible 24/7 desde cualquier lugar

## 📞 Soporte
Para problemas o preguntas, abre un issue en el repositorio.

## Paso 3: Configuración Final

1. **Sube todos los archivos** a tu repositorio GitHub
2. **Habilita GitHub Pages** en Settings → Pages → Source: main branch
3. **Tu API estará disponible en:** `https://bsznubeapi.github.io`

## Paso 4: Probar la API

**Una vez desplegado, puedes usar tu API desde cualquier lugar:

```javascript
// Desde cualquier sitio web
const users = await bszAPI.get('users');
console.log(users);

// O directamente via fetch
fetch('https://bsznubeapi.github.io')
  .then(response => response.json())
  .then(data => console.log(data));
```
