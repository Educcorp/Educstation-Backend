const Publicacion = require('../models/publicacionesModel');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Obtener todas las publicaciones
const getAllPublicaciones = async (req, res) => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    const estado = req.query.estado || null;

    console.log(`Obteniendo publicaciones: limite=${limite}, offset=${offset}, estado=${estado}`);
    const publicaciones = await Publicacion.getAll(limite, offset, estado);
    console.log(`Retornando ${publicaciones.length} publicaciones`);
    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Obtener las últimas publicaciones (endpoint simplificado y alternativo)
const getLatestPublicaciones = async (req, res) => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    
    // Usar una consulta directa más simple para evitar problemas
    // Siempre con estado 'publicado'
    const publicaciones = await Publicacion.getLatest(limite);
    
    console.log(`Retornando ${publicaciones.length} publicaciones desde getLatestPublicaciones`);
    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener últimas publicaciones:', error);
    res.status(500).json({ detail: 'Error al obtener las últimas publicaciones' });
  }
};

// Obtener publicación por ID
const getPublicacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const publicacion = await Publicacion.findById(id);

    if (!publicacion) {
      return res.status(404).json({ detail: 'Publicación no encontrada' });
    }

    // Obtener categorías e imágenes asociadas
    const categorias = await Publicacion.getCategorias(id);
    const imagenes = await Publicacion.getImagenes(id);

    res.json({
      ...publicacion,
      categorias,
      imagenes
    });
  } catch (error) {
    console.error('Error al obtener publicación:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Crear una nueva publicación
const createPublicacion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Log detallado de la solicitud
    console.log('Datos recibidos para crear publicación:', req.body);

    const { titulo, contenido, resumen, estado, categorias, Imagen_portada } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!titulo || !contenido) {
      return res.status(400).json({ detail: 'El título y el contenido son obligatorios' });
    }

    // Usar el ID de administrador del middleware de autenticación
    // Si no existe req.adminId, intentamos buscarlo o crearlo
    let id_administrador;
    if (req.adminId) {
      id_administrador = req.adminId;
      console.log('Usando ID administrador del middleware:', id_administrador);
    } else {
      // Intentamos obtener el administrador por el ID de usuario
      const Administrador = require('../models/adminModel');
      const admin = await Administrador.findByUserId(req.userId);
      
      if (!admin) {
        return res.status(403).json({ 
          detail: 'No tienes permisos para crear publicaciones. Contacta al administrador del sistema.'
        });
      }
      
      id_administrador = admin.ID_administrador;
      console.log('ID administrador obtenido del modelo:', id_administrador);
    }

    // Validar categorías
    let categoriasArray = [];
    if (categorias && Array.isArray(categorias)) {
      categoriasArray = categorias.filter(id => typeof id === 'number' && id > 0);
      console.log('Categorías validadas:', categoriasArray);
    } else {
      console.log('No se proporcionaron categorías válidas');
    }

    const publicacionData = {
      titulo,
      contenido,
      resumen: resumen || titulo.substring(0, 100), // Si no hay resumen, usar parte del título
      estado: estado || 'borrador',
      id_administrador,
      categorias: categoriasArray,
      Imagen_portada: Imagen_portada || null
    };

    console.log('Datos a guardar en la base de datos:', publicacionData);

    try {
      const publicacionId = await Publicacion.create(publicacionData);
      console.log('Publicación creada con ID:', publicacionId);

      res.status(201).json({
        id: publicacionId,
        message: 'Publicación creada exitosamente'
      });
    } catch (dbError) {
      console.error('Error al guardar en la base de datos:', dbError);
      res.status(500).json({ 
        detail: 'Error al guardar en la base de datos',
        error: dbError.message,
        sqlState: dbError.sqlState,
        sqlMessage: dbError.sqlMessage
      });
    }
  } catch (error) {
    console.error('Error detallado al crear publicación:', error);
    res.status(500).json({ detail: 'Error en el servidor', error: error.message });
  }
};

// Crear una publicación a partir de un archivo HTML
const createPublicacionFromHTML = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Log detallado de la solicitud
    console.log('Datos recibidos para crear publicación HTML:', req.body);

    if (!req.body.htmlContent) {
      return res.status(400).json({ detail: 'El contenido HTML es requerido' });
    }

    const { titulo, resumen, estado, categorias, htmlContent, Imagen_portada } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!titulo || !htmlContent) {
      return res.status(400).json({ detail: 'El título y el contenido HTML son obligatorios' });
    }

    // Usar el ID de administrador del middleware de autenticación
    // Si no existe req.adminId, intentamos buscarlo o crearlo
    let id_administrador;
    if (req.adminId) {
      id_administrador = req.adminId;
      console.log('Usando ID administrador del middleware:', id_administrador);
    } else {
      // Intentamos obtener el administrador por el ID de usuario
      const Administrador = require('../models/adminModel');
      const admin = await Administrador.findByUserId(req.userId);
      
      if (!admin) {
        return res.status(403).json({ 
          detail: 'No tienes permisos para crear publicaciones. Contacta al administrador del sistema.'
        });
      }
      
      id_administrador = admin.ID_administrador;
      console.log('ID administrador obtenido del modelo:', id_administrador);
    }

    // Validar categorías
    let categoriasArray = [];
    if (categorias && Array.isArray(categorias)) {
      categoriasArray = categorias.filter(id => typeof id === 'number' && id > 0);
      console.log('Categorías validadas:', categoriasArray);
    } else {
      console.log('No se proporcionaron categorías válidas');
    }

    const publicacionData = {
      titulo,
      contenido: htmlContent, // El contenido es directamente el HTML
      resumen: resumen || titulo.substring(0, 100), // Si no hay resumen, usar parte del título
      estado: estado || 'borrador',
      id_administrador,
      categorias: categoriasArray,
      Imagen_portada: Imagen_portada || null
    };

    console.log('Datos a guardar en la base de datos (HTML):', publicacionData);

    try {
      const publicacionId = await Publicacion.create(publicacionData);
      console.log('Publicación HTML creada con ID:', publicacionId);

      res.status(201).json({
        id: publicacionId,
        message: 'Publicación creada exitosamente a partir del HTML'
      });
    } catch (dbError) {
      console.error('Error al guardar publicación HTML en la base de datos:', dbError);
      res.status(500).json({ 
        detail: 'Error al guardar en la base de datos',
        error: dbError.message,
        sqlState: dbError.sqlState,
        sqlMessage: dbError.sqlMessage
      });
    }
  } catch (error) {
    console.error('Error detallado al crear publicación desde HTML:', error);
    res.status(500).json({ detail: 'Error en el servidor', error: error.message });
  }
};

// Actualizar una publicación existente
const updatePublicacion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { titulo, contenido, resumen, estado, categorias } = req.body;

    // Verificar que la publicación existe
    const publicacion = await Publicacion.findById(id);
    if (!publicacion) {
      return res.status(404).json({ detail: 'Publicación no encontrada' });
    }

    const publicacionData = {
      titulo,
      contenido,
      resumen,
      estado,
      categorias
    };

    const updated = await Publicacion.update(id, publicacionData);

    if (updated) {
      res.json({ message: 'Publicación actualizada exitosamente' });
    } else {
      res.status(400).json({ detail: 'No se pudo actualizar la publicación' });
    }
  } catch (error) {
    console.error('Error al actualizar publicación:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Eliminar una publicación
const deletePublicacion = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la publicación existe
    const publicacion = await Publicacion.findById(id);
    if (!publicacion) {
      return res.status(404).json({ detail: 'Publicación no encontrada' });
    }

    const deleted = await Publicacion.delete(id);

    if (deleted) {
      res.json({ message: 'Publicación eliminada exitosamente' });
    } else {
      res.status(400).json({ detail: 'No se pudo eliminar la publicación' });
    }
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Buscar publicaciones
const searchPublicaciones = async (req, res) => {
  try {
    const { term } = req.query;
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    if (!term) {
      return res.status(400).json({ detail: 'Término de búsqueda requerido' });
    }

    const results = await Publicacion.search(term, limite, offset);
    res.json(results);
  } catch (error) {
    console.error('Error al buscar publicaciones:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Buscar publicaciones por título
const searchByTitle = async (req, res) => {
  try {
    const { term } = req.query;
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    if (!term) {
      return res.status(400).json({ detail: 'Término de búsqueda requerido' });
    }

    const results = await Publicacion.searchByTitle(term, limite, offset);
    res.json(results);
  } catch (error) {
    console.error('Error al buscar publicaciones por título:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Buscar publicaciones por contenido
const searchByContent = async (req, res) => {
  try {
    const { term } = req.query;
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    if (!term) {
      return res.status(400).json({ detail: 'Término de búsqueda requerido' });
    }

    const results = await Publicacion.searchByContent(term, limite, offset);
    res.json(results);
  } catch (error) {
    console.error('Error al buscar publicaciones por contenido:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Buscar publicaciones por etiquetas/categorías
const searchByTags = async (req, res) => {
  try {
    const { categorias } = req.query;
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    if (!categorias) {
      return res.status(400).json({ detail: 'Se requiere al menos una categoría' });
    }

    // Convertir string de categorías a array de IDs
    const categoryIds = categorias.split(',').map(id => parseInt(id));

    if (categoryIds.length === 0) {
      return res.status(400).json({ detail: 'Formato inválido de categorías' });
    }

    const results = await Publicacion.searchByTags(categoryIds, limite, offset);
    res.json(results);
  } catch (error) {
    console.error('Error al buscar publicaciones por etiquetas:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Búsqueda avanzada
const advancedSearch = async (req, res) => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    // Parámetros de búsqueda
    const criteria = {
      titulo: req.query.titulo || null,
      contenido: req.query.contenido || null,
      fechaDesde: req.query.fechaDesde || null,
      fechaHasta: req.query.fechaHasta || null,
      estado: req.query.estado || null,
      ordenarPor: req.query.ordenarPor || null
    };

    // Procesar categorías si existen
    if (req.query.categorias) {
      criteria.categorias = req.query.categorias.split(',').map(id => parseInt(id));
    }

    // Validar que haya al menos un criterio de búsqueda
    const hasCriteria = Object.values(criteria).some(val => val !== null);
    if (!hasCriteria) {
      return res.status(400).json({ detail: 'Se requiere al menos un criterio de búsqueda' });
    }

    const results = await Publicacion.advancedSearch(criteria, limite, offset);
    res.json(results);
  } catch (error) {
    console.error('Error en búsqueda avanzada:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Obtener publicaciones por ID de usuario
const getPublicacionesByUserId = async (req, res) => {
  try {
    const userId = req.userId; // Obtener el ID del usuario autenticado
    if (!userId) {
      return res.status(401).json({ detail: 'Usuario no autenticado' });
    }
    // Asegura que los valores sean enteros válidos
    const limite = parseInt(req.query.limite, 10);
    const offset = parseInt(req.query.offset, 10);
    const safeLimite = isNaN(limite) ? 10 : limite;
    const safeOffset = isNaN(offset) ? 0 : offset;
    const publicaciones = await Publicacion.getByUserId(userId, safeLimite, safeOffset);
    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener publicaciones del usuario:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Obtener publicaciones por ID de administrador
const getPublicacionesByAdminId = async (req, res) => {
  try {
    // Si no hay adminId en la solicitud, intentamos obtenerlo
    let adminId;
    
    if (req.adminId) {
      adminId = req.adminId;
      console.log(`Usando adminId del middleware: ${adminId}`);
    } else {
      // Intentamos obtener el administrador por el ID de usuario
      const Administrador = require('../models/adminModel');
      console.log(`Buscando administrador para userId: ${req.userId}`);
      const admin = await Administrador.findByUserId(req.userId);
      
      if (!admin) {
        console.log(`No se encontró administrador para userId: ${req.userId}`);
        return res.status(403).json({ 
          detail: 'No tienes permisos de administrador. Contacta al administrador del sistema.'
        });
      }
      
      adminId = admin.ID_administrador;
      console.log(`Administrador encontrado, ID: ${adminId}`);
    }
    
    if (!adminId) {
      console.error('Error: No se pudo determinar el ID de administrador');
      return res.status(400).json({ detail: 'ID de administrador no válido' });
    }
    
    const limite = req.query.limite ? parseInt(req.query.limite) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    
    console.log(`Obteniendo publicaciones para administrador ID: ${adminId}, limite: ${limite}, offset: ${offset}`);
    const publicaciones = await Publicacion.getByAdminId(adminId, limite, offset);
    
    console.log(`Retornando ${publicaciones.length} publicaciones del administrador ${adminId}`);
    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener publicaciones del administrador:', error);
    res.status(500).json({ detail: 'Error en el servidor', error: error.message });
  }
};

// Obtener todas las publicaciones para administradores (sin filtros)
const getAllPublicacionesAdmin = async (req, res) => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    
    console.log(`Admin solicitando todas las publicaciones: limite=${limite}, offset=${offset}`);
    
    // Consulta directa a la base de datos para obtener todas las publicaciones
    const { pool } = require('../config/database');
    const query = `
      SELECT p.*, a.Nombre as NombreAdmin 
      FROM Publicaciones p
      LEFT JOIN Administrador a ON p.ID_administrador = a.ID_administrador
      ORDER BY p.Fecha_modificacion DESC, p.Fecha_creacion DESC
      LIMIT ${limite} OFFSET ${offset}
    `;
    
    const [publicaciones] = await pool.query(query);
    
    // Procesar las imágenes de portada
    for (const publicacion of publicaciones) {
      if (publicacion.Imagen_portada) {
        // Si es un Buffer, convertir a string
        if (publicacion.Imagen_portada instanceof Buffer) {
          try {
            const imgString = publicacion.Imagen_portada.toString('utf8');
            if (imgString.startsWith('data:image')) {
              publicacion.Imagen_portada = imgString;
            } else {
              // Si no es una imagen válida, establecer a null
              publicacion.Imagen_portada = null;
            }
          } catch (error) {
            console.error(`Error al procesar imagen de portada para publicación ${publicacion.ID_publicaciones}:`, error);
            publicacion.Imagen_portada = null;
          }
        } else if (typeof publicacion.Imagen_portada !== 'string' || publicacion.Imagen_portada === '[object Object]') {
          // Manejar datos no string que no son buffer
          publicacion.Imagen_portada = null;
        }
      }
    }
    
    console.log(`Recuperadas ${publicaciones.length} publicaciones para administrador`);
    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener publicaciones para administrador:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Dar like a una publicación
const likePublicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Publicacion.incrementarLikes(id);
    if (success) {
      res.json({ success: true, message: 'Like registrado' });
    } else {
      res.status(404).json({ success: false, message: 'Publicación no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al dar like' });
  }
};

// Quitar like a una publicación (opcional)
const unlikePublicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Publicacion.decrementarLikes(id);
    if (success) {
      res.json({ success: true, message: 'Like retirado' });
    } else {
      res.status(404).json({ success: false, message: 'Publicación no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al quitar like' });
  }
};

module.exports = {
  getAllPublicaciones,
  getAllPublicacionesAdmin,
  getLatestPublicaciones,
  getPublicacionById,
  createPublicacion,
  createPublicacionFromHTML,
  updatePublicacion,
  deletePublicacion,
  searchPublicaciones,
  searchByTitle,
  searchByContent,
  searchByTags,
  advancedSearch,
  getPublicacionesByUserId,
  getPublicacionesByAdminId,
  likePublicacion,
  unlikePublicacion
};