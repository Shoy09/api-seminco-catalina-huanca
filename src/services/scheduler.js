const cron = require('node-cron');

const { enviarCorreo } = require('./mailer');

const destinatarios = require('./recipients.json');

async function tareaDiaria() {

    console.log(`[scheduler] ${new Date().toISOString()} - Ejecutando envío programado...`);

    try {

        await enviarCorreo({

            to: destinatarios,

            subject: 'Reporte diario',

            html: `
                <h2>Reporte diario</h2>

                <p>Este es un envío automático generado el
                ${new Date().toLocaleString('es-PE')}.</p>
            `,

        });

    } catch (error) {

        console.error('[scheduler] Error:', error);

    }

}

function iniciarProgramacion() {

    const expresion = process.env.CRON_SCHEDULE || '0 8 * * *';

    if (!cron.validate(expresion)) {

        throw new Error(`Expresión cron inválida: ${expresion}`);

    }

    cron.schedule(expresion, tareaDiaria, {

        timezone: process.env.TZ || 'America/Lima',

    });

    console.log(

        `[scheduler] Tarea programada con cron "${expresion}"`

    );

}

module.exports = {

    iniciarProgramacion,

    tareaDiaria,

};