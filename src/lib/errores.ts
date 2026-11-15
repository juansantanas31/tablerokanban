export interface DetalleError {
  campo: string;
  mensaje: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly detalles?: DetalleError[];

  constructor(mensaje: string, statusCode: number = 500, detalles?: DetalleError[]) {
    super(mensaje);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.detalles = detalles;
  }
}

export class ErrorValidacion extends AppError {
  constructor(mensaje: string = "Error de validación en la solicitud", detalles?: DetalleError[]) {
    super(mensaje, 400, detalles);
  }
}

export class ErrorNoAutenticado extends AppError {
  constructor(mensaje: string = "Autenticación requerida para acceder a este recurso") {
    super(mensaje, 401);
  }
}

export class ErrorProhibido extends AppError {
  constructor(mensaje: string = "No tienes permiso para realizar esta acción") {
    super(mensaje, 403);
  }
}

export class ErrorNoEncontrado extends AppError {
  constructor(mensaje: string = "El recurso solicitado no fue encontrado") {
    super(mensaje, 404);
  }
}

export class ErrorConflicto extends AppError {
  constructor(mensaje: string = "Conflicto con el estado actual del recurso") {
    super(mensaje, 409);
  }
}
