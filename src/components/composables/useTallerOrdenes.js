/**
 * Composable para gestionar órdenes del taller
 * Centraliza la lógica de negocio y filtrado
 */

import { ref, computed } from 'vue';
import ordenesService from '@/services/ordenes.service';

export function useTallerOrdenes() {
  // Estado
  const ordenes = ref([]);
  const cargando = ref(false);
  const busqueda = ref('');
  const filtroEstado = ref('todos');
  const filtroOrigen = ref('todos');
  const error = ref(null);

  // Estados disponibles para el taller
  const estadosDisponibles = [
    { title: 'Pendiente', value: 'pendiente' },
    { title: 'En Proceso', value: 'en proceso' },
    { title: 'En Producción', value: 'en produccion' },
    { title: 'Finalizado', value: 'finalizado' },
    { title: 'Entregado', value: 'entregado' },
    { title: 'Cancelado', value: 'cancelado' }
  ];

  // Orígenes disponibles
  const origenesDisponibles = [
    { title: 'Local', value: 'local' },
    { title: 'Web', value: 'web' }
  ];

  // Estados activos del taller (no finalizados)
  const estadosActivos = ['pendiente', 'en proceso', 'en produccion'];

  // Computed: Estadísticas
  const ordenesPendientes = computed(() => 
    ordenes.value.filter(o => o.estado === 'pendiente').length
  );

  const ordenesEnProceso = computed(() => 
    ordenes.value.filter(o => o.estado === 'en proceso').length
  );

  const ordenesEnProduccion = computed(() => 
    ordenes.value.filter(o => o.estado === 'en produccion').length
  );

  const ordenesLocales = computed(() =>
    ordenes.value.filter(o => o.origen === 'local').length
  );

  const ordenesWeb = computed(() =>
    ordenes.value.filter(o => o.origen === 'web').length
  );

  // Computed: Filtrado múltiple
  const ordenesFiltradas = computed(() => {
    let resultado = ordenes.value;

    // Filtro por estado
    if (filtroEstado.value && filtroEstado.value !== 'todos') {
      resultado = resultado.filter(o => o.estado === filtroEstado.value);
    }

    // Filtro por origen
    if (filtroOrigen.value && filtroOrigen.value !== 'todos') {
      resultado = resultado.filter(o => o.origen === filtroOrigen.value);
    }

    // Filtro por búsqueda (cliente)
    if (busqueda.value && busqueda.value.trim()) {
      const termino = busqueda.value.toLowerCase().trim();
      resultado = resultado.filter(o => 
        o.cliente_nombre?.toLowerCase().includes(termino) ||
        o.cliente_telefono?.includes(termino) ||
        o.cliente_nit?.includes(termino)
      );
    }

    return resultado;
  });

  // Métodos: Cargar órdenes
  const obtenerOrdenes = async () => {
    cargando.value = true;
    error.value = null;
    
    try {
      // Obtener órdenes de los últimos 60 días (sin paginación)
      const response = await ordenesService.getAll({ 
        diasAtras: 60  // Últimos 60 días para optimizar rendimiento
      });
      
      // Manejar tanto respuesta paginada como array directo
      const data = Array.isArray(response) ? response : (response.ordenes || response.data || []);
      
      console.log('🔍 Respuesta del backend:', { 
        tipo: Array.isArray(response) ? 'array' : 'objeto',
        total: data.length,
        filtro: 'últimos 60 días'
      });
      
      // Filtrar solo órdenes en proceso de producción
      // Excluir: finalizado, entregado, cancelado (ya no están en taller)
      const estadosExcluidos = ['finalizado', 'entregado', 'cancelado'];
      
      ordenes.value = data
        .filter(o => !estadosExcluidos.includes(o.estado))
        .map(o => ({
          ...o,
          estadoOriginal: o.estado,
          estadoCambiado: false,
          loading: false
        }));

      console.log('✅ Órdenes cargadas:', ordenes.value.length);
      console.log('📊 Estados encontrados:', [...new Set(ordenes.value.map(o => o.estado))]);
      console.log('🚫 Estados excluidos del taller:', estadosExcluidos);
      return ordenes.value;
    } catch (err) {
      console.error('❌ Error al cargar órdenes:', err);
      error.value = err.message || 'Error al cargar órdenes';
      throw err;
    } finally {
      cargando.value = false;
    }
  };

  // Métodos: Obtener orden completa con items
  const obtenerOrdenCompleta = async (ordenId) => {
    try {
      const data = await ordenesService.getById(ordenId);
      return data;
    } catch (err) {
      console.error('Error al cargar orden completa:', err);
      throw new Error('Error al cargar los items de la orden');
    }
  };

  // Métodos: Actualizar estado
  const actualizarEstado = async (orden, nuevoEstado) => {
    try {
      orden.loading = true;
      
      await ordenesService.update(orden.id, {
        estado: nuevoEstado,
        id_usuario: 1 // TODO: Obtener del contexto de autenticación
      });

      orden.estadoOriginal = nuevoEstado;
      orden.estado = nuevoEstado;
      orden.estadoCambiado = false;

      // Remover de la lista si ya no está en estados activos
      if (!estadosActivos.includes(nuevoEstado)) {
        ordenes.value = ordenes.value.filter(o => o.id !== orden.id);
      }

      return { success: true };
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      throw new Error('Error al guardar el estado');
    } finally {
      orden.loading = false;
    }
  };

  // Métodos: Cambio de estado (marca como cambiado)
  const marcarEstadoCambiado = (orden) => {
    orden.estadoCambiado = orden.estado !== orden.estadoOriginal;
  };

  // Métodos: Guardar cambio de estado
  const guardarEstado = async (orden) => {
    return await actualizarEstado(orden, orden.estado);
  };

  // Métodos: Cambio rápido de estado (siguiente estado lógico)
  const cambiarEstadoRapido = async (orden, nuevoEstado) => {
    return await actualizarEstado(orden, nuevoEstado);
  };

  // Helpers: Obtener color por estado
  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': 'orange',
      'en proceso': 'blue',
      'en produccion': 'purple',
      'finalizado': 'green',
      'entregado': 'success',
      'cancelado': 'red'
    };
    return colores[estado] || 'grey';
  };

  // Helpers: Obtener ícono por estado
  const getEstadoIcono = (estado) => {
    const iconos = {
      'pendiente': 'mdi-clock-outline',
      'en proceso': 'mdi-cogs',
      'en produccion': 'mdi-factory',
      'finalizado': 'mdi-check-circle-outline',
      'entregado': 'mdi-truck-check',
      'cancelado': 'mdi-cancel'
    };
    return iconos[estado] || 'mdi-help-circle-outline';
  };

  // Helpers: Obtener color por origen
  const getOrigenColor = (origen) => {
    const colores = {
      'local': 'indigo',
      'web': 'teal'
    };
    return colores[origen] || 'grey';
  };

  // Helpers: Obtener ícono por origen
  const getOrigenIcono = (origen) => {
    const iconos = {
      'local': 'mdi-store',
      'web': 'mdi-web'
    };
    return iconos[origen] || 'mdi-help-circle-outline';
  };

  // Helpers: Obtener acción rápida según estado actual
  const getAccionRapida = (estado) => {
    const acciones = {
      'pendiente': {
        nuevoEstado: 'en proceso',
        icon: 'mdi-cogs',
        color: 'blue',
        tooltip: 'Procesar'
      },
      'en proceso': {
        nuevoEstado: 'en produccion',
        icon: 'mdi-factory',
        color: 'purple',
        tooltip: 'Enviar a Producción'
      },
      'en produccion': {
        nuevoEstado: 'finalizado',
        icon: 'mdi-check-circle-outline',
        color: 'green',
        tooltip: 'Finalizar'
      }
    };
    return acciones[estado] || null;
  };

  // Helpers: Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helpers: Calcular días transcurridos
  const calcularDiasTranscurridos = (fecha) => {
    const dias = Math.floor((new Date() - new Date(fecha)) / (1000 * 60 * 60 * 24));
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    return `Hace ${dias} días`;
  };

  return {
    // Estado
    ordenes,
    cargando,
    busqueda,
    filtroEstado,
    filtroOrigen,
    error,

    // Configuración
    estadosDisponibles,
    origenesDisponibles,
    estadosActivos,

    // Computed
    ordenesPendientes,
    ordenesEnProceso,
    ordenesEnProduccion,
    ordenesLocales,
    ordenesWeb,
    ordenesFiltradas,

    // Métodos
    obtenerOrdenes,
    obtenerOrdenCompleta,
    actualizarEstado,
    marcarEstadoCambiado,
    guardarEstado,
    cambiarEstadoRapido,

    // Helpers
    getEstadoColor,
    getEstadoIcono,
    getOrigenColor,
    getOrigenIcono,
    getAccionRapida,
    formatearFecha,
    calcularDiasTranscurridos
  };
}
