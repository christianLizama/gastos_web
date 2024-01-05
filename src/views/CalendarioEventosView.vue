<template>
  <div>
    <v-card class="pa-4">
      <v-row align="center">
        <v-col class="d-flex" cols="12" sm="6" xl="3">
          <v-select
            :items="empresas"
            v-model="selectedEmpresa"
            label="Empresa"
          ></v-select>
          <v-select
            v-if="selectedEmpresa"
            :items="usuariosDeEmpresa"
            multiple
            label="Usuario"
            item-text="nombreCompleto"
            v-model="usuariosSeleccionados"
            return-object
          >
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="index === 0">
                <span>{{ item.email }}</span>
              </v-chip>
              <span v-if="index === 1" class="grey--text text-caption">
                (+{{ usuariosSeleccionados.length - 1 }}
                Usuario(s))
              </span>
            </template>
          </v-select>
        </v-col>
      </v-row>
      <v-date-picker
        locale="cl"
        v-model="selectedDates"
        multiple
        @update:picker-date="onMonthChange"
      ></v-date-picker>
      <div class="mt-3 mb-3">
        <!-- <v-btn color="green" @click="crearEventos('trabaja')"
          >Agregar Trabajo</v-btn
        > -->
        <v-btn color="primary" @click="crearEventos('descanso')"
          >Agregar Descanso</v-btn
        >
        <v-btn color="red" @click="crearEventos('ausente')"
          >Agregar Ausentismo</v-btn
        >
        <!-- <v-btn color="primary" @click="crearEventos('descanso')"
          >Agregar descanso</v-btn
        > -->
      </div>
      <v-data-table
        :headers="headers"
        :items="Users"
        :options.sync="options"
        :server-items-length="totalUsers"
        :loading="loading"
        class="elevation-1"
      >
        <template
          v-for="header in headers"
          v-slot:[`item.${header.value}`]="{ item }"
        >
          <td
            :style="{ backgroundColor: getColor(item[header.value]) }"
            :key="header.value"
          >
            {{ item[header.value] }}
          </td>
        </template>
      </v-data-table>
      <!-- <v-calendar
          locale="cl"
          ref="calendar"
          v-model="value"
          :type="type"
          :events="events"
          :event-color="getEventColor"
          @change="getEvents"
          class="mt-3"
        ></v-calendar> -->
    </v-card>
  </div>
</template>

<script>
import UserService from "@/services/UserService";

export default {
  data() {
    return {
      type: "month",
      value: "",
      events: [],
      colors: [
        "blue",
        "indigo",
        "deep-purple",
        "cyan",
        "green",
        "orange",
        "grey darken-1",
      ],
      eventNames: ["trabaja", "ausente", "descanso"],
      empresas: ["TRN", "TIR"],
      selectedDates: [], // Almacena las fechas seleccionadas
      Users: [],
      loading: true,
      options: {},
      headers: [],
      selectedEmpresa: null,
      usuariosDeEmpresa: [],
      usuariosSeleccionados: [],
    };
  },
  watch: {
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
    selectedEmpresa(newValue) {
      if (newValue) {
        this.obtenerUsuariosPorEmpresa(newValue);
      } else {
        this.usuariosDeEmpresa = [];
      }
    },
  },
  computed: {
    usuariosFiltrados() {
      if (this.selectedEmpresa) {
        return this.usuarios.filter(
          (usuario) => usuario.empresa === this.selectedEmpresa
        );
      }
      return [];
    },
  },
  mounted() {
    // this.$refs.calendar.checkChange();
  },
  methods: {
    async obtenerUsuariosPorEmpresa(empresa) {
      try {
        const token = this.$store.state.token;
        const usuarios = await UserService.obtenerUsuariosPorEmpresa(
          empresa,
          token
        ); // Método para obtener usuarios por empresa desde la API
        this.usuariosDeEmpresa = usuarios;
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    },
    onMonthChange(fecha) {
      const actualDate = fecha.replace(/-/g, "/");
      const daysInMonth = new Date(
        new Date(actualDate).getFullYear(),
        new Date(actualDate).getMonth() + 1,
        0
      ).getDate();

      // Generar los nuevos headers
      const newHeaders = [
        {
          text: "Usuarios",
          align: "",
          sortable: false,
          value: "nombreCompleto",
        },
      ];
      for (let i = 1; i <= daysInMonth; i++) {
        newHeaders.push({
          text: i.toString(),
          value: `dia${i}`,
          sortable: false,
        });
      }

      // Asignar los nuevos headers al estado de la componente
      this.headers = newHeaders;
    },
    getColor(value) {
      switch (value) {
        case "T":
          return "white"; // Verde
        case "V":
          return "green"; // Celeste
        case "A":
          return "red"; // Rojo
        case "L":
          return "orange"; // naranjo
        case "D":
          return "cyan"; // azul
        default:
          return ""; // Color predeterminado o ninguno
      }
    },
    getDataFromApi() {
      this.loading = true;
      this.ApiCall().then((data) => {
        this.Users = data.items;
        this.totalUsers = data.total;
        this.loading = false;
      });
    },
    /**
     * In a real application this would be a call to fetch() or axios.get()
     */
    async ApiCall() {
      try {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;

        const token = this.$store.state.token;
        // Obtener los usuarios
        const response = await UserService.getConductores(token);
        const users = response.data;
        const total = users.length;

        let items = [...users]; // Copia los usuarios para manipulación

        // Realizar ordenamiento si es necesario
        if (sortBy.length === 1 && sortDesc.length === 1) {
          items = items.sort((a, b) => {
            const sortA = a[sortBy[0]];
            const sortB = b[sortBy[0]];

            if (sortDesc[0]) {
              if (sortA < sortB) return 1;
              if (sortA > sortB) return -1;
              return 0;
            } else {
              if (sortA < sortB) return -1;
              if (sortA > sortB) return 1;
              return 0;
            }
          });
        }

        // Aplicar paginación si es necesario
        if (itemsPerPage > 0) {
          items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);
        }

        // Simular el tiempo de espera de la llamada a la API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
          items,
          total,
        };
      } catch (error) {
        console.error(error);
        throw error; // Puedes propagar el error si es necesario
      }
    },

    // setToday() {
    //   this.value = "";
    // },
    // prev() {
    //   this.$refs.calendar.prev();
    // },
    // next() {
    //   this.$refs.calendar.next();
    // },
    // getEvents() {
    //   // Lógica para obtener eventos si es necesario
    //   return this.events;
    // },
    // getEventColor(event) {
    //   return event.color;
    // },
    // rnd(a, b) {
    //   return Math.floor((b - a + 1) * Math.random()) + a;
    // },
    crearEventos(eventName) {
      if (!this.eventNames.includes(eventName) || !this.selectedDates.length) {
        return; // Si el nombre del evento no es válido o no se seleccionó una fecha, no hacemos nada
      }
      this.selectedDates.forEach((selectedDate) => {
        const existingEvent = this.events.find(
          (event) =>
            event.start.toDateString() ===
            new Date(selectedDate.replace(/-/g, "/")).toDateString()
        );

        if (!existingEvent) {
          const events = [...this.events];
          const colorRandom = this.colors[this.rnd(0, this.colors.length - 1)];

          const formattedDate = selectedDate.replace(/-/g, "/");

          const nuevoEvento = {
            name: eventName.charAt(0).toUpperCase() + eventName.slice(1),
            start: new Date(formattedDate),
            end: new Date(formattedDate),
            color: colorRandom,
            timed: false,
          };

          events.push(nuevoEvento);
          this.events = events;
        } else {
          console.log(selectedDate + " ya existe");
        }
      });

      // Limpiar las fechas seleccionadas después de crear los eventos
      this.selectedDates = [];
    },
  },
};
</script>

<style>
.text-center {
  text-align: center;
}

.justify-center {
  justify-content: center;
}
</style>
