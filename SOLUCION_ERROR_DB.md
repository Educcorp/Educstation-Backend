# Solución al error "Unknown database 'educcorp_educs'"

Este error ocurre porque estás intentando acceder a una base de datos que no existe. Hemos actualizado los scripts para que primero creen la base de datos automáticamente.

## Cómo resolver el problema

1. **Verifica que tienes la última versión de los scripts**
   - `add-user.js`
   - `setup-railway.js`
   - `migrations.js`

2. **Prueba ejecutando los scripts en este orden:**

   ```bash
   # Primero ejecutar migraciones para crear la base de datos y tablas
   npm run migrate
   
   # Luego crear usuarios
   npm run add-user
   ```

3. **Si sigues teniendo problemas**, prueba una de estas soluciones:

   a) **Crear la base de datos manualmente**:
   
   ```sql
   CREATE DATABASE IF NOT EXISTS educcorp_educs;
   ```
   
   b) **Especificar otro nombre para la base de datos** en tu archivo .env:
   
   ```
   DB_NAME=mi_base_de_datos
   ```

## Para administradores: Configuración para un nuevo equipo

1. **Configura primero la base de datos en Railway**:
   - Asegúrate de tener un servicio MySQL funcionando
   - Obtén la URL de conexión

2. **Ejecuta el script de instalación inicial**:
   ```bash
   npm install
   npm run migrate
   ```

3. **Crea usuarios para tu equipo**:
   ```bash
   npm run add-user
   ```

4. **Comparte las instrucciones con tu equipo**:
   - Para usuarios directos de Railway: Usa el script `setup-railway.js`
   - Para usuarios con credenciales individuales: Proporciona el archivo .env generado

## Estructura de permisos de MySQL

Para que todo funcione correctamente, el usuario que ejecuta los scripts debe tener permisos para:

1. Crear bases de datos
2. Crear tablas
3. Crear usuarios
4. Otorgar permisos

Si estás en un entorno compartido o gestionado (como Railway), es posible que algunos de estos permisos estén limitados. En ese caso, contacta al administrador de la base de datos para obtener los permisos necesarios.

## Variables de entorno necesarias

Para una configuración local completa, necesitas estas variables en tu archivo .env:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=educcorp_educs
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=tu_secreto_refresh
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

Para Railway, basta con:

```
MYSQL_URL=mysql://usuario:contraseña@host:puerto/nombre_db
JWT_SECRET=tu_secreto_jwt
JWT_REFRESH_SECRET=tu_secreto_refresh
``` 