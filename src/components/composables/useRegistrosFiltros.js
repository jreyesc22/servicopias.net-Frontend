/**
 * Composable para la lógica de filtros de periodo en el módulo de Registros.
 * Centraliza opcionesPeriodo, fechas y el cálculo automático de rangos.
 * Cada llamada crea su propia instancia (no singleton).
 */
import { ref, computed } from 'vue';

export function useRegistrosFiltros() {
  const opcionesPeriodo = [
    { label: 'Hoy',          value: 'hoy'    },
    { label: 'Esta Semana',  value: 'semana' },
    { label: 'Este Mes',     value: 'mes'    },
    { label: 'Personalizado', value: 'custom' },
  ];

  const periodoSeleccionado = ref('hoy');
  const fechaInicio        = ref('');
  const fechaFin           = ref('');

  /**
   * Label legible del periodo activo (para mostrar al usuario).
   */
  const periodoLabel = computed(() => {
    if (periodoSeleccionado.value === 'custom') {
      const desde = fechaInicio.value || '?';
      const hasta = fechaFin.value   || '?';
      return `${desde} — ${hasta}`;
    }
    const opt = opcionesPeriodo.find(o => o.value === periodoSeleccionado.value);
    return opt?.label || '';
  });

  /**
   * Calcula y asigna fechaInicio / fechaFin según el periodo seleccionado.
   * No hace nada si el periodo es 'custom' (el usuario ingresa las fechas manualmente).
   */
  const establecerFechasPorPeriodo = () => {
    if (periodoSeleccionado.value === 'custom') return;

    const hoy      = new Date();
    const formatIso = (d) => d.toISOString().split('T')[0];

    if (periodoSeleccionado.value === 'hoy') {
      fechaInicio.value = formatIso(hoy);
      fechaFin.value    = formatIso(hoy);

    } else if (periodoSeleccionado.value === 'semana') {
      const inicioSemana = new Date(hoy);
      const dayOfWeek    = hoy.getDay();
      const diff         = hoy.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lunes
      inicioSemana.setDate(diff);
      fechaInicio.value = formatIso(inicioSemana);
      fechaFin.value    = formatIso(hoy);

    } else if (periodoSeleccionado.value === 'mes') {
      const inicioMes   = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      fechaInicio.value = formatIso(inicioMes);
      fechaFin.value    = formatIso(hoy);
    }
  };

  return {
    opcionesPeriodo,
    periodoSeleccionado,
    fechaInicio,
    fechaFin,
    periodoLabel,
    establecerFechasPorPeriodo,
  };
}
