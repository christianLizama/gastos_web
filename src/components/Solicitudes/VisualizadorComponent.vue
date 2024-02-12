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
          {{ item.lineaSolicitud }}
        </v-chip>
      </template>
      <template v-slot:[`item.viaje`]="{ item }">
          {{ item.viaje }}
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

      <template v-slot:[`item.comentario`]="{ item }">
        <v-textarea
          class="mt-5"
          auto-grow
          outlined
          label="Comentario"
          :value="item.comentario"
        ></v-textarea>
      </template>

      <!-- <template v-slot:[`item.actions`]="{ item }">
        <v-select label="Cambiar estado" :items="item"></v-select>
      </template> -->
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    solicitudes: {
      type: Array,
      required: true,
    },
  },
  created() {},
  data() {
    return {
      singleSelect: false,
      selected: [],
      options: {},
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
        { text: "Estado", value: "estado", sortable: false },
        { text: "Creado Por", value: "creadoPor", sortable: false },
        { text: "Aprobado Por", value: "aprobadoPor", sortable: false },
        { text: "Empresa", value: "empresa", sortable: false },
        { text: "Montos", value: "montos", sortable: false, width: "130px" },
        {
          text: "Comentario",
          value: "comentario",
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
  watch: {},
  methods: {
    obtenerMontos(montos) {
      console.log(montos[0]);
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
        case "RECHZADA":
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
