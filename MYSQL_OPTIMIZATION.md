# MySQL Optimization for EducStation

This document provides instructions for optimizing the MySQL server configuration to handle large images in the EducStation application.

## Database Schema Optimization

The application has been configured to use the following optimized data types:

- `Imagen_portada`: Changed from `TEXT` to `LONGBLOB` for better handling of binary data
- Other large text content uses `LONGTEXT` data type

## MySQL Server Configuration

For optimal performance with large images, the following MySQL server settings are recommended:

### 1. Increase max_allowed_packet

The `max_allowed_packet` parameter controls the maximum size of a single packet or a single row. For large images, this should be increased.

**Current setting:** 64MB (67108864 bytes)
**Recommended setting:** 100MB (104857600 bytes) or 200MB (209715200 bytes)

To change this setting temporarily (until server restart):

```sql
SET GLOBAL max_allowed_packet=104857600;  -- For 100MB
```

To make this change permanent, add to your MySQL configuration file:

```ini
[mysqld]
max_allowed_packet = 100M
```

### 2. Increase Timeout Settings

```sql
SET GLOBAL net_read_timeout = 600;
SET GLOBAL net_write_timeout = 600;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;
```

Add to your MySQL configuration file:

```ini
[mysqld]
net_read_timeout = 600
net_write_timeout = 600
wait_timeout = 600
interactive_timeout = 600
```

### 3. MySQL Configuration File Locations

- **Windows:** `C:\ProgramData\MySQL\MySQL Server X.X\my.ini`
- **Linux:** `/etc/mysql/my.cnf` or `/etc/my.cnf`
- **macOS:** `/usr/local/mysql/etc/my.cnf`

After modifying the configuration file, restart the MySQL server for changes to take effect.

## Application Optimization

The application includes the following optimizations for handling large images:

1. **Front-end compression**: Images larger than 4MB are automatically compressed before upload
2. **Maximum size limit**: Files larger than 15MB are rejected before upload
3. **Progressive compression**: Larger images undergo more aggressive compression
4. **Image size verification**: Images are checked after compression to ensure they're under 45MB

## Troubleshooting

If you encounter the error "Data too long for column 'Imagen_portada'":

1. Run the database migration script:
   ```
   node src/migrations/fix-imagen-portada-blob.js
   ```

2. Verify your MySQL server settings:
   ```
   node update-mysql-config.js
   ```

3. Check the current column type:
   ```
   node check-schema.js
   ```

If needed, manually change the column type:

```sql
ALTER TABLE Publicaciones MODIFY COLUMN Imagen_portada LONGBLOB;
```

## Contact Support

For further assistance, please contact the development team:
- Email: support@educstation.com 