<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="solicitudes"
      :items-per-page="5"
      class="elevation-1"
      :single-select="false"
      show-select
      item-key="lineaSolicitud"
    >
      <template v-slot:[`item.lineaSolicitud`]="{ item }">
        <v-chip color="gray" dark>
          <strong>{{ item.lineaSolicitud }}</strong>
        </v-chip>
      </template>
      <template v-slot:[`item.viaje`]="{}">
        <!-- {{ item.viaje }} -->
      </template>
      <template v-slot:[`item.conductor`]="{ item }">
        {{ item.conductor.nombreCompleto }}
      </template>
      <template v-slot:[`item.creadoPor`]="{ item }">
        {{ item.creadoPor.nombreCompleto }} - {{ item.creadoPor.email }}
      </template>
      <template v-slot:[`item.estado`]="{ item }">
        <v-chip :color="getColor(item.estado)" dark>
          {{ item.estado }}
        </v-chip>
      </template>
      <template v-slot:[`item.montos`]="{ item }">
        <div v-for="(monto, index) in item.montos" :key="index">
          {{ monto.tipo }}: {{ monto.monto }}
        </div>
      </template>
      <template v-slot:[`item.fechaSolicitud`]="{ item }">
        {{ new Date(item.fechaSolicitud).toLocaleString() }}
      </template>
      <template v-slot:[`item.fechaAprobacion`]="{ item }">
        <span v-if="item.fechaAprobacion !== null">
          {{ new Date(item.fechaAprobacion).toLocaleString() }}
        </span>
        <span v-else>
          <!-- Manejo para el caso en que fechaAprobacion es null -->
          Fecha no disponible
        </span>
      </template>

      <template v-slot:[`item.fechaActualizacion`]="{ item }">
        {{ new Date(item.fechaActualizacion).toLocaleString() }}
      </template>

      <template v-slot:[`item.comentarios`]="{ item }">
        <v-textarea
          class="mt-5"
          auto-grow
          outlined
          label="Comentario"
          :value="item.comentarios"
          v-model="item.comentarios"
        ></v-textarea>
      </template>
      <template v-slot:[`footer.prepend`]>
        <v-btn color="primary" dark class="ma-2" @click="buttonCallback">
          Guardar Cambios
          <v-icon medium right>mdi-content-save</v-icon>
        </v-btn>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-select
          v-model="item.estado"
          label="Cambiar estado"
          :items="estados"
        ></v-select>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import solicitudService from "@/services/SolicitudService";
export default {
  props: {
    solicitudes: {
      type: Array,
      required: true,
    },
  },
  created() {
    // Guardar una copia de las solicitudes originales
    this.originalSolicitudes = JSON.parse(JSON.stringify(this.solicitudes));
  },
  data() {
    return {
      estados: ["PENDIENTE", "APROBADA", "RECHAZADA", "CORREGIR"],
      singleSelect: false,
      selected: [],
      options: {},
      originalSolicitudes: [],
      headers: [
        {
          text: "Linea de Solicitud",
          align: "center",
          sortable: false,
          value: "lineaSolicitud",
        },
        {
          text: "Conductor",
          align: "start",
          sortable: false,
          value: "conductor",
        },
        { text: "Viaje", value: "viaje", sortable: false },
        { text: "Fecha Solicitud", value: "fechaSolicitud", sortable: false },
        {
          text: "Fecha Aprobación",
          value: "fechaAprobacion",
          sortable: false,
        },
        {
          text: "Fecha Actualización",
          value: "fechaActualizacion",
          sortable: false,
        },
        { text: "Creado Por", value: "creadoPor", sortable: false },
        { text: "Aprobado Por", value: "aprobadoPor", sortable: false },
        { text: "Empresa", value: "empresa", sortable: false },
        { text: "Montos", value: "montos", sortable: false, width: "130px" },
        { text: "Estado", value: "estado", sortable: false },
        {
          text: "Comentarios",
          value: "comentarios",
          sortable: false,
          width: "250px",
        },
        {
          text: "Acciones",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
    };
  },
  watch: {
    solicitudes: function (nuevoValor) {
      this.originalSolicitudes = JSON.parse(JSON.stringify(nuevoValor));
      this.selected = [];
    },
  },
  methods: {
    resetChanges() {
      this.$emit("update:solicitudes", this.originalSolicitudes);
    },

    // Método que se ejecuta al hacer clic en el botón "Guardar Cambios"
    async buttonCallback() {
      // Verificar si hay solicitudes seleccionadas
      if (this.selected.length === 0) {
        this.$notify({
          title: "Error",
          text: "Debe seleccionar al menos una solicitud",
          type: "error",
        });
        return;
      } else {
        try {
          // Enviar las solicitudes seleccionadas al servidor
          const response = await solicitudService.updateSolicitudes(
            this.selected
          );
          if (response.status === 200) {
            //Verificar si el largo de las solicitudes seleccionadas es distinto al largo de las solicitudes originales para actualizar el estado de las solicitudes
            if (this.selected.length !== this.originalSolicitudes.length) {
              console.log("No son iguales");

              let solicitudesActualizadas = response.data.solicitudes;

              // Crear un conjunto (Set) de IDs de las solicitudes actualizadas
              const idsSolicitudesActualizadas = new Set(
                solicitudesActualizadas.map((solicitud) => solicitud._id)
              );

              // Filtrar las solicitudes originales para obtener aquellas cuyos IDs no están en el conjunto de IDs actualizados
              const solicitudesNoActualizadas = this.originalSolicitudes.filter(
                (solicitud) => !idsSolicitudesActualizadas.has(solicitud._id)
              );

              // Agregar las solicitudes no actualizadas a las solicitudes actualizadas
              solicitudesActualizadas = solicitudesActualizadas.concat(
                solicitudesNoActualizadas
              );

              //Actualizar las solicitudes en el componente padre
              this.$emit("update:solicitudes", solicitudesActualizadas);

              console.log("Solicitudes actualizadas", solicitudesActualizadas);
              this.originalSolicitudes = JSON.parse(
                JSON.stringify(solicitudesActualizadas)
              );
              this.selected = [];
            } else {
              this.$notify({
                title: "Éxito",
                text: "Solicitudes actualizadas correctamente",
                type: "success",
              });
              this.$emit("update:solicitudes", response.data.solicitudes);
              this.originalSolicitudes = JSON.parse(
                JSON.stringify(this.selected)
              );
              this.selected = [];
            }
          }
        } catch (error) {
          this.$notify({
            title: "Error",
            text: "Ocurrió un error al actualizar las solicitudes",
            type: "error",
          });
          this.resetChanges();
          this.selected = [];
        }
      }
    },
    obtenerMontos(montos) {
      let monto = "";
      montos.forEach((montoItem) => {
        const tipoMonto = montoItem.tipo;
        const montoValor = montoItem.monto;
        monto += `${tipoMonto}: ${montoValor} \n`;
      });
      return monto;
    },
    obtenerNombres(conductores) {
      let nombres = "";
      conductores.forEach((conductor) => {
        nombres += conductor.nombreCompleto + ", ";
      });
      return nombres;
    },
    getColor(item) {
      switch (item) {
        case "PENDIENTE":
          return "orange";
        case "APROBADA":
          return "green";
        case "RECHAZADA":
          return "red";
        case "CORREGIR":
          return "yellow";
        case "PAGADA":
          return "blue";
        default:
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
