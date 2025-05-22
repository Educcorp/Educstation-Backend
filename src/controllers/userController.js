const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../config/config');

// Función para generar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, is_staff: user.is_staff, is_superuser: user.is_superuser },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
};

// Controlador para registro de usuarios
exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ detail: 'El nombre de usuario ya existe' });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ detail: 'El email ya está registrado' });
    }

    // Crear nuevo usuario
    const userId = await User.create({
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName
    });

    // Obtener el usuario recién creado
    const newUser = await User.findById(userId);

    // Generar token
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        is_staff: newUser.is_staff,
        is_superuser: newUser.is_superuser
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Controlador para login de usuarios
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ detail: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ detail: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_staff: user.is_staff,
        is_superuser: user.is_superuser,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Controlador para obtener datos del usuario actual
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Controlador para actualizar avatar del usuario
exports.updateAvatar = async (req, res) => {
  try {
    const { avatarData, userId: bodyUserId } = req.body;
    
    // Intentar obtener el ID de usuario del token decodificado o del cuerpo de la solicitud
    const userId = req.user?.id || bodyUserId;
    
    console.log('ID del usuario obtenido:', {
      'De token (req.user.id)': req.user?.id,
      'Del cuerpo (bodyUserId)': bodyUserId,
      'ID final utilizado': userId
    });
    
    // Verificación adicional del token decodificado
    console.log('Token decodificado:', req.user);

    if (!userId) {
      console.error('Error: No se pudo determinar el ID del usuario');
      return res.status(400).json({ detail: 'ID de usuario no proporcionado' });
    }

    if (!avatarData) {
      console.log('No se proporcionaron datos para el avatar');
      return res.status(400).json({ detail: 'No se proporcionaron datos para el avatar' });
    }

    // Verificar tamaño del avatar (registrar información)
    const dataSize = avatarData.length;
    console.log(`Tamaño de datos recibidos: ${Math.round(dataSize/1024)} KB`);

    // Extraer datos base64 si tienen el prefijo data:image
    let avatarBase64 = avatarData;
    if (avatarData.includes('base64,')) {
      console.log('Formato data:URL detectado, extrayendo datos base64');
      const parts = avatarData.split('base64,');
      if (parts.length >= 2 && parts[1]) {
        avatarBase64 = parts[1];
        console.log(`Tamaño después de extraer datos: ${Math.round(avatarBase64.length/1024)} KB`);
      } else {
        console.error('Error: Formato base64 inválido, no se pudo extraer la parte de datos');
        return res.status(400).json({ detail: 'Formato de imagen inválido' });
      }
    }

    // Verificación adicional para evitar valores undefined
    if (!avatarBase64) {
      console.error('Error: avatarBase64 es undefined o null después del procesamiento');
      return res.status(400).json({ detail: 'Datos de imagen inválidos después del procesamiento' });
    }

    try {
      // Usar userId en lugar de req.user.id
      const success = await User.updateAvatar(userId, avatarBase64);

      if (!success) {
        console.log('No se pudo actualizar el avatar - 0 filas afectadas');
        return res.status(400).json({ detail: 'No se pudo actualizar el avatar' });
      }

      console.log('Avatar actualizado con éxito para el usuario ID:', userId);
      res.json({ detail: 'Avatar actualizado con éxito' });
    } catch (dbError) {
      console.error('Error específico de la base de datos al actualizar avatar:', dbError);
      
      // Manejar errores específicos de MySQL
      if (dbError.message && dbError.message.includes('demasiado grande')) {
        return res.status(413).json({ detail: dbError.message });
      } else if (dbError.code === 'ER_DATA_TOO_LONG') {
        return res.status(413).json({ detail: 'La imagen es demasiado grande para almacenar en la base de datos' });
      } else if (dbError.code === 'ER_NET_PACKET_TOO_LARGE') {
        return res.status(413).json({ detail: 'La imagen excede el tamaño máximo permitido para el paquete de red' });
      } else if (dbError.message && dbError.message.includes('Bind parameters must not contain undefined')) {
        return res.status(400).json({ detail: 'Parámetros de imagen inválidos' });
      }
      
      throw dbError; // Propagar el error para el manejador general
    }
  } catch (error) {
    console.error('Error general al actualizar avatar:', error);
    res.status(500).json({ detail: 'Error en el servidor', message: error.message });
  }
};