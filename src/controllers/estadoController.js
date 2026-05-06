const db = require('../config/db'); // Asegúrate de que `db.js` esté configurado correctamente

// Obtener todos los estados
exports.getAllEstados = async (req, res) => {
  try {
    const [estados] = await db.query('SELECT * FROM estados');
    res.json(estados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Obtener un estado por ID
exports.getEstadoById = async (req, res) => {
  try {
    const [estado] = await db.query('SELECT * FROM estados WHERE id = ?', [req.params.id]);
    if (estado.length === 0) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }
    res.json(estado[0]); // Retornamos el primer resultado
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo estado
exports.createEstado = async (req, res) => {
  try {
    const { 
      estado_principal, 
      codigo, 
      tipo_estado, 
      categoria, 
      proceso // Nuevo campo agregado
    } = req.body;

    const [result] = await db.query(
      'INSERT INTO estados (estado_principal, codigo, tipo_estado, categoria, proceso) VALUES (?, ?, ?, ?, ?)',
      [estado_principal, codigo, tipo_estado, categoria, proceso]
    );

    res.status(201).json({
      id: result.insertId,
      estado_principal,
      codigo,
      tipo_estado,
      categoria,
      proceso
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un estado por ID
exports.updateEstado = async (req, res) => {
  try {
    const { estado_principal, codigo, tipo_estado, categoria, proceso } = req.body; // Agregar el campo proceso
    const { id } = req.params;

    // Verificar si el estado existe
    const [estado] = await db.query('SELECT * FROM estados WHERE id = ?', [id]);
    if (estado.length === 0) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }

    // Actualizar el estado con los campos correctos
    await db.query(
      'UPDATE estados SET estado_principal = ?, codigo = ?, tipo_estado = ?, categoria = ?, proceso = ? WHERE id = ?',
      [estado_principal, codigo, tipo_estado, categoria, proceso, id]
    );

    res.json({ id, estado_principal, codigo, tipo_estado, categoria, proceso });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un estado por ID
exports.deleteEstado = async (req, res) => {
  try {
    const { id } = req.params;

    const [estado] = await db.query('SELECT * FROM estados WHERE id = ?', [id]);
    if (estado.length === 0) {
      return res.status(404).json({ error: 'Estado no encontrado' });
    }

    await db.query('DELETE FROM estados WHERE id = ?', [id]);
    res.json({ message: 'Estado eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener estados por proceso
exports.getEstadosByProceso = async (req, res) => {
  try {
    const { proceso } = req.params;

    const [estados] = await db.query(
      'SELECT * FROM estados WHERE proceso = ?',
      [proceso]
    );

    if (estados.length === 0) {
      return res.status(404).json({ error: 'No se encontraron estados para ese proceso' });
    }

    res.json(estados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};