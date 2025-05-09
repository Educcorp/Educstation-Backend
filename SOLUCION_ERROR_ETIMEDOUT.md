# Solución al error "Error: connect ETIMEDOUT"

El error `ETIMEDOUT` indica que la conexión a MySQL está agotando el tiempo de espera. Esto significa que el servidor no está respondiendo o no es accesible.

## Causas comunes

1. **Servidor MySQL no está ejecutándose**
2. **Dirección IP o puerto incorrectos**
3. **Firewall bloqueando la conexión**
4. **Restricciones de acceso en MySQL**
5. **Problemas con Railway o el proveedor de base de datos**

## Soluciones para entorno LOCAL

### 1. Verifica que MySQL esté instalado y ejecutándose

```bash
# En Windows (desde PowerShell como admin)
Get-Service -Name "mysql*"

# En Linux
sudo systemctl status mysql

# En macOS
brew services list | grep mysql
```

### 2. Comprueba la configuración en tu archivo .env

```
DB_HOST=localhost  # Cambia a 127.0.0.1 si localhost no funciona
DB_PORT=3306       # Verifica que sea el puerto correcto
DB_USER=root       # O el usuario que hayas configurado
DB_PASSWORD=tu_contraseña
DB_NAME=educcorp_educs
```

### 3. Prueba la conexión directamente con el cliente MySQL

```bash
mysql -h localhost -u root -p
```

### 4. Reinicia el servicio MySQL

```bash
# En Windows
net stop mysql
net start mysql

# En Linux
sudo systemctl restart mysql

# En macOS
brew services restart mysql
```

## Soluciones para Railway

### 1. Verifica que el servicio de Railway esté activo

- Comprueba en el dashboard de Railway que el servicio de MySQL esté en estado "Running"
- Asegúrate de que no hayas alcanzado límites de uso/consumo en tu plan

### 2. Comprueba que tu IP esté permitida

Railway requiere que agregues tu IP a la lista blanca para conexiones externas:

1. Ve al panel de control de Railway
2. Selecciona tu proyecto y el servicio MySQL
3. En "Settings" > "Networking", agrega tu IP pública
   - Puedes obtener tu IP pública en [whatismyip.com](https://www.whatismyip.com/)

### 3. Verifica la URL de conexión

Debe tener este formato:
```
mysql://usuario:contraseña@host:puerto/nombre_db
```

Asegúrate de que:
- El usuario y contraseña sean correctos
- El host y puerto estén bien escritos
- El nombre de la base de datos exista

### 4. Prueba usando nuestra herramienta de diagnóstico

```bash
node test-connection.js
```

## Para compartir acceso con tu equipo en Railway

1. Crea un usuario específico para cada miembro:

```bash
npm run add-user
```

2. Configura las variables de entorno correctamente:

```
# Para Railway
MYSQL_URL=mysql://usuario:contraseña@host:puerto/nombre_db

# O para configuración directa
DB_HOST=host_de_railway
DB_PORT=puerto_de_railway
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=educcorp_educs
```

3. Asegúrate de que cada miembro del equipo agregue su IP a la lista blanca de Railway

## Lista de verificación final

- [ ] MySQL está instalado y en ejecución
- [ ] Las credenciales son correctas
- [ ] El puerto no está bloqueado por ningún firewall
- [ ] La IP está en la lista blanca (para Railway)
- [ ] La base de datos existe
- [ ] El usuario tiene permisos suficientes 