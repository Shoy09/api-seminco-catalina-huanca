const db = require('../config/db'); // Asegúrate de que `db.js` esté configurado correctamente

// Obtener todos los checklist items
exports.getAllCheckListItems = async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM checklist_items');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un checklist item por ID
exports.getCheckListItemById = async (req, res) => {
  try {
    const [item] = await db.query('SELECT * FROM checklist_items WHERE id = ?', [req.params.id]);
    if (item.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    res.json(item[0]); // Retorna el primer resultado
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo checklist item
exports.createCheckListItem = async (req, res) => {
  try {
    const { proceso, categoria, nombre } = req.body;

    const [result] = await db.query(
      'INSERT INTO checklist_items (proceso, categoria, nombre) VALUES (?, ?, ?)',
      [proceso, categoria, nombre]
    );

    res.status(201).json({
      id: result.insertId,
      proceso,
      categoria,
      nombre
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un checklist item por ID
exports.updateCheckListItem = async (req, res) => {
  try {
    const { proceso, categoria, nombre } = req.body;
    const { id } = req.params;

    // Verificar si el item existe
    const [item] = await db.query('SELECT * FROM checklist_items WHERE id = ?', [id]);
    if (item.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Actualizar
    await db.query(
      'UPDATE checklist_items SET proceso = ?, categoria = ?, nombre = ? WHERE id = ?',
      [proceso, categoria, nombre, id]
    );

    res.json({ id, proceso, categoria, nombre });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un checklist item por ID
exports.deleteCheckListItem = async (req, res) => {
  try {
    const { id } = req.params;

    const [item] = await db.query('SELECT * FROM checklist_items WHERE id = ?', [id]);
    if (item.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    await db.query('DELETE FROM checklist_items WHERE id = ?', [id]);
    res.json({ message: 'Item eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
