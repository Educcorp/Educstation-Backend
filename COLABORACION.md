# Guía de Colaboración - EducStation Backend

## Configuración para nuevos colaboradores

Para trabajar en este proyecto, necesitarás configurar acceso a la base de datos. Hay dos opciones:

### Opción 1: Configuración con Railway (Recomendada para el equipo)

1. Pide al administrador del proyecto las siguientes credenciales:
   - URL de conexión MySQL de Railway
   - Clave JWT_SECRET
   - Clave JWT_REFRESH_SECRET

2. Clona el repositorio:
   ```
   git clone <url-del-repositorio>
   cd Educstation-Backend
   ```

3. Ejecuta el script de configuración:
   ```
   npm run setup-railway
   ```

4. Sigue las instrucciones y proporciona las credenciales que te dio el administrador.

5. Instala las dependencias e inicia el servidor:
   ```
   npm install
   npm run dev
   ```

### Opción 2: Configuración con usuario individual (Para trabajo local)

1. Pide al administrador que ejecute el script para crear un nuevo usuario de base de datos:
   ```
   npm run add-user
   ```

2. El administrador te proporcionará los datos para tu archivo .env.

3. Clona el repositorio:
   ```
   git clone <url-del-repositorio>
   cd Educstation-Backend
   ```

4. Crea un archivo `.env` en la raíz del proyecto con la información proporcionada.

5. Instala las dependencias e inicia el servidor:
   ```
   npm install
   npm run dev
   ```

## Para administradores: Cómo dar acceso a nuevos miembros del equipo

### Método 1: Compartir acceso a Railway

1. Asegúrate de tener las variables de entorno correctas en tu proyecto.

2. Para cada nuevo miembro, puedes compartir las credenciales de Railway directamente (URL de conexión, JWT_SECRET, etc.).

3. Indícales que usen el script `npm run setup-railway` para configurar su entorno.

### Método 2: Crear usuarios individuales

1. Ejecuta el script para crear un nuevo usuario:
   ```
   npm run add-user
   ```

2. Sigue las instrucciones e ingresa un nombre de usuario y contraseña para el nuevo miembro.

3. El script te mostrará la información que debe incluirse en el archivo .env del nuevo miembro.

4. Comparte esta información con el nuevo colaborador de manera segura.

## Notas importantes

- **Nunca compartas tu archivo .env en el repositorio**
- Asegúrate de que `.env` esté incluido en el archivo `.gitignore`
- Las credenciales son personales, no las compartas con otros miembros del equipo
- Si Railway invalida las credenciales o cambia la URL de conexión, el administrador debe actualizar y redistribuir la información

## Solución de problemas

Si encuentras errores de conexión, verifica:

1. Que tu archivo .env contenga las credenciales correctas
2. Que tu IP esté permitida en Railway (si es necesario, pide al administrador que la agregue)
3. Que el servicio de Railway esté activo y funcionando correctamente 