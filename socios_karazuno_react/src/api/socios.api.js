import api from "../config/axiosConfig";

const BASE_PATH = "http://localhost:8000/socios/api/v1";

/**
 * Obtener todos los socios (usuarios con SocioInfo)
 */
export const getAllSocios = async () => {
  try {
    const response = await api.get(`${BASE_PATH}/socios-info/`);
    console.log("✅ Socios obtenidos:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching socios:", error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Obtener información de socio por ID de usuario
 */
export const getSocioById = async (usuarioId) => {
  try {
    const response = await api.get(`${BASE_PATH}/socios-info/${usuarioId}/`);
    console.log("✅ Socio obtenido:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching socio by ID:", error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Inactivar un socio (admin/dirigente)
 */
export const inactivarSocio = async (usuarioId, razon) => {
  try {
    const response = await api.post(
      `http://localhost:8000/socios/api/v1/usuarios/${usuarioId}/inactivar-socio/`,
      { razon }
    );
    console.log("✅ Socio inactivado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error inactivando socio:", error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Activar un socio inactivo (registrar pago + reactivar)
 * @param {number} usuarioId - ID del usuario socio
 * @param {object} datoPago - { medio_pago: string, comprobante?: string }
 */
export const activarSocio = async (usuarioId, datoPago) => {
  try {
    const response = await api.post(
      `${BASE_PATH}/usuarios/${usuarioId}/activar-socio/`,
      datoPago
    );
    console.log("✅ Socio activado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error activando socio:", error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Obtener cuotas pendientes de un usuario
 * @param {number} usuarioId - ID del usuario
 */
export const getCuotasPendientes = async (usuarioId) => {
  try {
    // Endpoint que devuelve cuotas sin pago completado
    const response = await api.get(
      `${BASE_PATH}/cuotas/?usuario=${usuarioId}&estado=pendiente`
    );
    console.log("✅ Cuotas pendientes obtenidas:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching cuotas pendientes:", error);
    throw error;
  }
};

/**
 * Obtener TODAS las cuotas (pagadas y pendientes) de un socio.
 * @param {number} usuarioId - ID del usuario socio
 */
export const getCuotasDeSocio = async (usuarioId) => {
  try {
    // Llamamos al endpoint de cuotas filtrando solo por usuario para traer todo su historial
    const response = await api.get(`${BASE_PATH}/cuotas/?usuario=${usuarioId}`);
    console.log(`✅ Historial de cuotas obtenido para socio ${usuarioId}:`, response.data.length);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching historial de cuotas para socio ${usuarioId}:`, error);
    throw error;
  }
};

/**
 * Obtener todos los socios que pertenecen a una categoría específica.
 * @param {number} categoriaId - El ID de la categoría por la cual filtrar.
 */
export const getSociosPorCategoria = async (categoriaId) => {
  if (!categoriaId) {
    // Evita llamadas innecesarias a la API si no hay ID
    return [];
  }
  try {
    // Usamos el filtro del backend que ya existe: /socios-info/?categoria=ID
    const response = await api.get(`${BASE_PATH}/socios-info/?categoria=${categoriaId}`);
    console.log(`✅ Jugadores obtenidos para categoría ${categoriaId}:`, response.data.length);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching jugadores para categoría ${categoriaId}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo registro de SocioInfo (Hacerse Socio).
 * @param {object} socioData - Datos para crear el socio (ej: { usuario: ID })
 */
export const createSocioInfo = async (socioData) => {
  try {
    // Usamos el endpoint base de socios-info para el POST
    const response = await api.post(`${BASE_PATH}/socios-info/`, socioData);
    console.log("✅ SocioInfo creado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creando SocioInfo:", error.response?.status, error.response?.data);
    throw error;
  }
};

/**
 * Verificar Acceso mediante Scanner QR
 * Envía el código leído (ID) al backend para validar deuda y estado.
 * @param {string} qrData - El contenido leído por el scanner (ID del socio)
 */
export const verificarAcceso = async (qrData) => {
  try {
    const response = await api.post('http://localhost:8000/socios/api/control-acceso/', { qr_data: qrData });
    console.log("✅ Verificación de acceso realizada:", response.data);
    return response; // Retornamos response completo para acceder a status y data
  } catch (error) {
    console.error("❌ Error verificando acceso:", error);
    throw error;
  }
};
export const getHistorialAccesos = async () => {
    try {

        const response = await api.get('/socios/api/control-acceso/historial/');
        console.log("✅ Historial cargado:", response.data.length);
        return response.data;
    } catch (error) {
        console.error("❌ Error cargando historial:", error);
        throw error;
    }
};
/**
 * Registrar pago de cuotas específicas de un socio activo.
 * @param {number} usuarioId - ID del usuario
 * @param {Array} cuotas - Array de objetos cuota (debe tener .id)
 * @param {object} datosPago - { medio_pago: string, comprobante: string }
 */
export const registrarPagoCuotas = async (usuarioId, cuotas, datosPago) => {
  try {
    // Extraemos solo los IDs de las cuotas
    const cuotaIds = cuotas.map(c => c.id);

    const payload = {
      cuota_ids: cuotaIds,
      medio_pago: datosPago.medio_pago,
      comprobante: datosPago.comprobante
    };

    const response = await api.post(
      `${BASE_PATH}/usuarios/${usuarioId}/registrar-pago/`,
      payload
    );
    
    console.log("✅ Pago registrado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error registrando pago:", error.response?.status, error.response?.data);
    throw error;
  }
};