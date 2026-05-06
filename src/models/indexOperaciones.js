const OperacionTalLargo = require('./OperacionTalLargo');
const OperacionTalHorizontal = require('./OperacionTalHorizontal');
const OperacionEmpernador = require('./OperacionEmpernador');
const OperacionCarguio = require('./OperacionCarguio');
const OperacionRompebanco = require('./OperacionRompebanco');
const OperacionScissor = require('./OperacionScissor');
const OperacionAnfochanger = require('./OperacionAnfochanger');
const OperacionScalamin = require('./OperacionScalamin');
const OperacionDumper = require('./OperacionDumper');

const modelos = {
  tal_largo: OperacionTalLargo,
  tal_horizontal: OperacionTalHorizontal,
  empernador: OperacionEmpernador,
  carguio: OperacionCarguio,
  rompebanco: OperacionRompebanco,
  scissor: OperacionScissor,
  anfochanger: OperacionAnfochanger,
  scalamin: OperacionScalamin,
  dumper: OperacionDumper
};

module.exports = modelos;