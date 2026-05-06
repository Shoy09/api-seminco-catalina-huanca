const { 
    NubeDatosTrabajoExploraciones,
    NubeDespacho,
    NubeDespachoDetalle,
    NubeDevoluciones,
    NubeDevolucionDetalle,
    NubeDetalleDespachoExplosivos,
    NubeDetalleDevolucionesExplosivos
} = require('../models/NubeDatosTrabajoExploraciones '); // Asegúrate que todos los modelos se exporten desde el archivo models

const sequelize = require('../config/sequelize');

async function crearExploracionCompleta(req, res) {
    const t = await sequelize.transaction();

    try {
        // Extraer el primer elemento si es array
        const requestData = Array.isArray(req.body) ? req.body[0] : req.body;

        // Validar datos mínimos
        if (!requestData.fecha || !requestData.taladro) {
            throw new Error('Faltan campos obligatorios: fecha y taladro.');
        }

        // 1. Crear datos principales (excluyendo relaciones e IDs)
        const { id, despachos, devoluciones, ...datosTrabajoData } = requestData;

        // Asegurar que los nuevos campos tengan valores por defecto si no vienen en la petición
        const datosTrabajoCompletos = {
            ...datosTrabajoData,
            envio: datosTrabajoData.envio || 0,
            estado: datosTrabajoData.estado || 'Creado',
            cerrado: datosTrabajoData.cerrado || 0
        };

        let datosTrabajo;
        try {
            datosTrabajo = await NubeDatosTrabajoExploraciones.create(datosTrabajoCompletos, { transaction: t });
        } catch (dbError) {
            throw new Error(`Error al insertar en NubeDatosTrabajoExploraciones: ${dbError.message}`);
        }

        // 2. Procesar despachos
        if (despachos?.length > 0) {
            try {
                await Promise.all(despachos.map(async (despacho) => {
                    const { id: despachoId, datos_trabajo_id, detalles_materiales = [], detalles_explosivos = [], ...datosDespacho } = despacho;

                    // Asegurar que el campo observaciones esté presente
                    const despachoCompleto = {
                        ...datosDespacho,
                        datos_trabajo_id: datosTrabajo.id,
                        observaciones: datosDespacho.observaciones || null
                    };

                    let despachoCreado;
                    try {
                        despachoCreado = await NubeDespacho.create(despachoCompleto, { transaction: t });
                    } catch (dbError) {
                        throw new Error(`Error al insertar en NubeDespacho: ${dbError.message}`);
                    }

                    // Crear detalles materiales
                    if (detalles_materiales.length > 0) {
                        try {
                            await NubeDespachoDetalle.bulkCreate(
                                detalles_materiales.map(({ id: _, despacho_id: __, ...detalle }) => ({
                                    ...detalle,
                                    despacho_id: despachoCreado.id
                                })),
                                { transaction: t }
                            );
                        } catch (dbError) {
                            throw new Error(`Error al insertar en NubeDespachoDetalle: ${dbError.message}`);
                        }
                    }

                    // Crear detalles explosivos
                    if (detalles_explosivos.length > 0) {
                        try {
                            await NubeDetalleDespachoExplosivos.bulkCreate(
                                detalles_explosivos.map(({ id: _, id_despacho: __, ...detalle }) => ({
                                    ...detalle,
                                    id_despacho: despachoCreado.id
                                })),
                                { transaction: t }
                            );
                        } catch (dbError) {
                            throw new Error(`Error al insertar en NubeDetalleDespachoExplosivos: ${dbError.message}`);
                        }
                    }
                }));
            } catch (error) {
                throw new Error(`Error procesando despachos: ${error.message}`);
            }
        }

        // 3. Procesar devoluciones
        if (devoluciones?.length > 0) {
            try {
                await Promise.all(devoluciones.map(async (devolucion) => {
                    const { id: devolucionId, datos_trabajo_id, detalles_materiales = [], detalles_explosivos = [], ...datosDevolucion } = devolucion;

                    // Asegurar que el campo observaciones esté presente
                    const devolucionCompleta = {
                        ...datosDevolucion,
                        datos_trabajo_id: datosTrabajo.id,
                        observaciones: datosDevolucion.observaciones || null
                    };

                    let devolucionCreada;
                    try {
                        devolucionCreada = await NubeDevoluciones.create(devolucionCompleta, { transaction: t });
                    } catch (dbError) {
                        throw new Error(`Error al insertar en NubeDevoluciones: ${dbError.message}`);
                    }

                    // Crear detalles materiales
                    if (detalles_materiales.length > 0) {
                        try {
                            await NubeDevolucionDetalle.bulkCreate(
                                detalles_materiales.map(({ id: _, devolucion_id: __, ...detalle }) => ({
                                    ...detalle,
                                    devolucion_id: devolucionCreada.id
                                })),
                                { transaction: t }
                            );
                        } catch (dbError) {
                            throw new Error(`Error al insertar en NubeDevolucionDetalle: ${dbError.message}`);
                        }
                    }

                    // Crear detalles explosivos
                    if (detalles_explosivos.length > 0) {
                        try {
                            await NubeDetalleDevolucionesExplosivos.bulkCreate(
                                detalles_explosivos.map(({ id: _, id_devolucion: __, ...detalle }) => ({
                                    ...detalle,
                                    id_devolucion: devolucionCreada.id
                                })),
                                { transaction: t }
                            );
                        } catch (dbError) {
                            throw new Error(`Error al insertar en NubeDetalleDevolucionesExplosivos: ${dbError.message}`);
                        }
                    }
                }));
            } catch (error) {
                throw new Error(`Error procesando devoluciones: ${error.message}`);
            }
        }

        await t.commit();
        res.status(201).json({
            message: 'Exploración creada con éxito',
            id: datosTrabajo.id,
            envio: datosTrabajo.envio,
            estado: datosTrabajo.estado
        });

    } catch (error) {
        await t.rollback();
        console.error('Error al crear exploración:', error);

        res.status(500).json({
            error: 'Error al crear exploración',
            details: error.message
        });
    }
}

async function marcarComoUsadosEnMediciones(req, res) {
  const t = await sequelize.transaction();

  try {
    let { ids } = req.body;

    // Asegurar que 'ids' sea un array
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    if (ids.length === 0) {
      return res.status(400).json({ message: 'No se recibieron IDs para actualizar.' });
    }

    // Actualizar registros
    const resultados = await NubeDatosTrabajoExploraciones.update(
      { medicion: 1 },
      { where: { id: ids }, transaction: t }
    );

    await t.commit();

    res.status(200).json({
      message: 'Registros actualizados correctamente',
      cantidad_actualizada: resultados[0] // devuelve cantidad de filas afectadas
    });

  } catch (error) {
    await t.rollback();
    console.error('Error en marcarComoUsadosEnMediciones:', error);
    res.status(500).json({
      message: 'Error al actualizar los registros para mediciones',
      error: error.message
    });
  }
}

async function obtenerExploracionesCompletas(req, res) {
    try {
        const { id } = req.params;
        const { envio, cerrado, empresa } = req.query;

        let whereCondition = {};
        if (id) {
            whereCondition.id = id;
        }
        
        // Filtros adicionales para los nuevos campos
        if (envio !== undefined) {
            whereCondition.envio = envio;
        }
        if (cerrado !== undefined) {
            whereCondition.cerrado = cerrado;
        }
        if (empresa) {
            whereCondition.empresa = empresa;
        }

        const exploraciones = await NubeDatosTrabajoExploraciones.findAll({
            where: whereCondition,
            include: [
                {
                    model: NubeDespacho,
                    as: 'despachos',
                    include: [
                        {
                            model: NubeDespachoDetalle,
                            as: 'detalles'
                        },
                        {
                            model: NubeDetalleDespachoExplosivos,
                            as: 'detalles_explosivos'
                        }
                    ]
                },
                {
                    model: NubeDevoluciones,
                    as: 'devoluciones',
                    include: [
                        {
                            model: NubeDevolucionDetalle,
                            as: 'detalles'
                        },
                        {
                            model: NubeDetalleDevolucionesExplosivos,
                            as: 'detalles_explosivos'
                        }
                    ]
                }
            ],
            order: [
                ['createdAt', 'DESC'],
                [{ model: NubeDespacho, as: 'despachos' }, 'createdAt', 'ASC'],
                [{ model: NubeDevoluciones, as: 'devoluciones' }, 'createdAt', 'ASC']
            ]
        });

        if (id && exploraciones.length === 0) {
            return res.status(404).json({ message: 'Exploración no encontrada' });
        }

        res.status(200).json(id ? exploraciones[0] : exploraciones);
    } catch (error) {
        console.error('Error al obtener exploraciones:', error);
        res.status(500).json({ 
            error: 'Error al obtener exploraciones',
            details: error.message 
        });
    }
}

async function actualizarMedicionExploracion(req, res) {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { medicion } = req.body;

        // Validaciones básicas
        if (!id) {
            throw new Error('Se requiere el ID de la exploración');
        }

        if (medicion === undefined || medicion === null) {
            throw new Error('El campo medicion es requerido');
        }

        // Verificar que la exploración existe
        const exploracion = await NubeDatosTrabajoExploraciones.findByPk(id, { transaction: t });
        
        if (!exploracion) {
            throw new Error('Exploración no encontrada');
        }

        // Actualizar solo el campo medicion
        await NubeDatosTrabajoExploraciones.update(
            { medicion },
            {
                where: { id },
                transaction: t,
                fields: ['medicion'] // Solo actualiza este campo
            }
        );

        await t.commit();
        
        // Obtener el registro actualizado para devolverlo
        const exploracionActualizada = await NubeDatosTrabajoExploraciones.findByPk(id);
        
        res.status(200).json({
            message: 'Medición actualizada correctamente',
            data: {
                id: exploracionActualizada.id,
                medicion: exploracionActualizada.medicion,
                estado: exploracionActualizada.estado
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('Error al actualizar medición:', error);
        
        res.status(500).json({
            error: 'Error al actualizar medición',
            details: error.message
        });
    }
}

module.exports = { 
    crearExploracionCompleta, 
    obtenerExploracionesCompletas,
    actualizarMedicionExploracion,
    marcarComoUsadosEnMediciones
};