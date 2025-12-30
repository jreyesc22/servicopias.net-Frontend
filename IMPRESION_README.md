# Sistema de Impresión - Documentación

## Arquitectura

El sistema de impresión está modularizado en 3 capas:

### 1. **printerCommands.js** - Comandos ESC/POS
Contiene todos los comandos de impresora térmica (cortar, abrir cajón, formateo).

```javascript
import { abrirCajon, cortarPapel, finalizarImpresion } from '@/utils/printerCommands';

// Abrir cajón
const comandoCajon = abrirCajon(); // Pin 2 por defecto
const comandoCajon5 = abrirCajon(5); // Pin 5

// Cortar papel
const comandoCorte = cortarPapel('full'); // 'full', 'partial', 'full-feed'

// Finalizar impresión (líneas extra + cajón + corte)
const comandosFinal = finalizarImpresion({
  abrirCajon: true,
  lineasExtra: 3,
  tipoCorte: 'full'
});
```

### 2. **ticketTemplate.js** - Plantillas de ticket
Genera el contenido del ticket sin comandos de impresora.

```javascript
import { generarContenidoTicket, generarTicket } from '@/utils/ticketTemplate';

// Solo contenido (sin comandos ESC/POS)
const contenido = generarContenidoTicket(orden, pago);

// Ticket completo con comandos (compatibilidad)
const ticketCompleto = generarTicket(orden, pago);
```

### 3. **printer.service.js** - Servicio de impresión
Maneja la comunicación con el servidor de impresión.

```javascript
import { printerService } from '@/services/printer.service';

// Configurar
printerService.configurar({
  servidorUrl: 'http://192.168.1.15:3005',
  timeout: 5000,
  reintentos: 2
});

// Imprimir raw
await printerService.imprimirRaw(texto, { abrirCajon: true, cortar: true });

// Imprimir con plantilla
await printerService.imprimirTicket(plantillaFn, datos, options);

// Solo abrir cajón
await printerService.abrirCajon();

// Solo cortar papel
await printerService.cortarPapel();
```

## Uso en Componentes

### Opción 1: Usar el componente TicketPrinter (Recomendado para órdenes)

```vue
<template>
  <div>
    <v-btn @click="imprimir">Imprimir</v-btn>
    
    <TicketPrinter
      ref="printer"
      :orden="orden"
      :pago="pago"
      servidor-impresion="http://192.168.1.15:3005"
      @impresion-exitosa="onExito"
      @impresion-error="onError"
    />
  </div>
</template>

<script>
import TicketPrinter from '@/components/TicketPrinter.vue';

export default {
  components: { TicketPrinter },
  methods: {
    async imprimir() {
      await this.$refs.printer.imprimir();
    },
    onExito(evento) {
      console.log('Impreso:', evento);
    },
    onError(evento) {
      console.error('Error:', evento);
    }
  }
};
</script>
```

### Opción 2: Usar el composable usePrinter (Recomendado para Composition API)

```vue
<template>
  <div>
    <v-btn 
      @click="imprimirOrden" 
      :loading="imprimiendo"
      :disabled="imprimiendo"
    >
      Imprimir
    </v-btn>
    
    <v-alert v-if="ultimoError" type="error">
      {{ ultimoError }}
    </v-alert>
  </div>
</template>

<script setup>
import { usePrinter } from '@/components/composables/usePrinter';

const { 
  imprimiendo, 
  ultimoError, 
  imprimirTicket, 
  abrirCajon,
  configurar 
} = usePrinter();

// Configurar al iniciar
configurar({ 
  servidorUrl: 'http://192.168.1.15:3005' 
});

const orden = ref({ /* ... */ });
const pago = ref({ /* ... */ });

async function imprimirOrden() {
  try {
    await imprimirTicket(orden.value, pago.value);
    console.log('Ticket impreso');
  } catch (error) {
    console.error('Error al imprimir:', error);
  }
}
</script>
```

### Opción 3: Usar el servicio directamente

```vue
<script>
import { printerService } from '@/services/printer.service';
import { generarContenidoTicket } from '@/utils/ticketTemplate';

export default {
  methods: {
    async imprimirPersonalizado() {
      // Configurar
      printerService.configurar({ 
        servidorUrl: 'http://192.168.1.15:3005' 
      });
      
      // Generar contenido
      const contenido = generarContenidoTicket(this.orden, this.pago);
      
      // Imprimir
      const resultado = await printerService.imprimirRaw(contenido, {
        abrirCajon: true,
        cortar: true
      });
      
      if (resultado.success) {
        console.log('Impreso exitosamente');
      }
    },
    
    async soloAbrirCajon() {
      await printerService.abrirCajon();
    }
  }
};
</script>
```

## Ejemplos Avanzados

### Imprimir con comandos personalizados

```javascript
import { printerService } from '@/services/printer.service';
import { formatearTexto, abrirCajon, cortarPapel } from '@/utils/printerCommands';

async function imprimirRecibo() {
  let texto = '';
  
  // Encabezado centrado y en negrita
  texto += formatearTexto('SERVICOPIAS.NET', {
    bold: true,
    align: 'center',
    size: 'double-both'
  });
  
  texto += '\n\n';
  texto += 'Recibo de caja\n';
  texto += 'Monto: Q 100.00\n';
  texto += '\n\n\n';
  
  // Agregar comandos al final
  texto += abrirCajon();
  texto += cortarPapel();
  
  await printerService.imprimirRaw(texto, {
    abrirCajon: false, // Ya incluido manualmente
    cortar: false      // Ya incluido manualmente
  });
}
```

### Crear plantilla personalizada

```javascript
// En tu componente
import { usePrinter } from '@/components/composables/usePrinter';

const { imprimirTicket } = usePrinter();

// Plantilla personalizada
function miPlantilla(datos) {
  return `
    *** MI NEGOCIO ***
    
    Orden: ${datos.numero}
    Cliente: ${datos.cliente}
    Total: Q ${datos.total}
    
    Gracias por su compra
  `;
}

// Usar
await imprimirTicket(miPlantilla, { 
  numero: 123, 
  cliente: 'Juan', 
  total: 100 
});
```

## Migración desde código existente

### Antes (código antiguo):
```javascript
// Antes: Lógica mezclada en el componente
async imprimir() {
  const ticket = generarTicket(this.orden);
  await fetch('http://192.168.1.15:3005', {
    method: 'POST',
    body: ticket
  });
}
```

### Después (nuevo sistema):
```javascript
// Opción A: Usar composable
import { usePrinter } from '@/components/composables/usePrinter';
const { imprimirTicket } = usePrinter();
await imprimirTicket(this.orden, this.pago);

// Opción B: Usar servicio
import { printerService } from '@/services/printer.service';
const contenido = generarContenidoTicket(this.orden);
await printerService.imprimirRaw(contenido, { abrirCajon: true });
```

## Ventajas del nuevo sistema

✅ **Modular**: Separación clara de responsabilidades
✅ **Reutilizable**: Usa en cualquier componente
✅ **Testeable**: Cada módulo se puede probar independientemente
✅ **Configurable**: Opciones flexibles de impresión
✅ **Mantenible**: Cambios centralizados
✅ **Compatible**: Mantiene funcionalidad existente

## Notas importantes

1. **TicketPrinter.vue** sigue funcionando igual, solo usa el nuevo servicio internamente
2. **generarTicket()** sigue existiendo para compatibilidad
3. Nuevos componentes deberían usar **usePrinter** composable
4. Para texto simple usar **imprimirRaw()**, para tickets usar **imprimirTicket()**
