<template>
  <v-card class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <div class="text-center">
          <v-select
            :items="empresas"
            v-model="selectedEmpresa"
            label="Empresa"
            class="mr-3 d-inline-flex"
            outlined
          ></v-select>
          <v-select
            :disabled="!selectedEmpresa"
            :items="usuariosDeEmpresa"
            multiple
            label="Usuario"
            item-text="nombreCompleto"
            v-model="usuariosSeleccionados"
            return-object
            class="d-inline-flex"
            outlined
          >
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="index === 0">
                <span>{{ item.email }}</span>
              </v-chip>
              <span v-if="index === 1" class="grey--text text-caption">
                (+{{ usuariosSeleccionados.length - 1 }} Usuario(s))
              </span>
            </template>
          </v-select>
        </div>
      </v-col>
      <v-col cols="12" class="text-center">
        <div class="mx-auto mb-3" style="max-width: 450px">
          <v-date-picker
            color="black"
            full-width
            locale="cl"
            v-model="selectedDates"
            multiple
            @update:picker-date="onMonthChange"
          ></v-date-picker>
        </div>
      </v-col>
    </v-row>
    <div class="d-flex justify-center mb-5">
      <v-btn small class="mr-3" @click="crearEventos('descanso')"
        >Agregar Descanso
        <v-icon right>mdi-weather-night</v-icon>
      </v-btn>
      <v-btn small class="ml-3" @click="crearEventos('ausente')">
        Agregar Ausentismo
        <v-icon right>mdi-account-off</v-icon>
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="Users"
      :options.sync="options"
      :server-items-length="totalUsers"
      :loading="loading"
      class="elevation-1 mx-auto"
    >
      <template
        v-for="header in headers"
        v-slot:[`item.${header.value}`]="{ item }"
      >
        <td
          :style="{ backgroundColor: getColor(item[header.value]) }"
          :key="header.value"
        >
          {{ item[header.value] || "T" }}
        </td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import UserService from "@/services/UserService";
import axios from "axios";
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
      totalUsers: 0,
      eventosPorUsuario: {},
      mesActual: new Date().getMonth(),
    };
  },
  watch: {
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
    mesActual() {
      this.getDataFromApi();
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

      this.mesActual = new Date(actualDate).getMonth();
      //this.getDataFromApi();
    },
    getColor(value) {
      switch (value) {
        case "T":
          return "white"; // Blanco
        case "V":
          return "green"; // Celeste
        case "A":
          return "#E57373"; // Rojo
        case "L":
          return "orange"; // naranjo
        case "D":
          return "#90CAF9"; // azul
        default:
          return ""; // Color predeterminado o ninguno
      }
    },
    getDataFromApi() {
      this.loading = true;
      this.ApiCall(this.mesActual).then((data) => {
        this.Users = data.items;
        this.totalUsers = data.total;
        this.loading = false;
      });
    },
    /**
     * In a real application this would be a call to fetch() or axios.get()
     */
    async ApiCall(month) {
      try {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        
        const token = this.$store.state.token;
        // Obtener los usuarios
        const response = await UserService.getConductores(token,month);
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

    async crearEventos(eventName) {
      if (
        (eventName !== "ausente" && eventName !== "descanso") ||
        !this.selectedDates.length ||
        !this.usuariosSeleccionados.length
      ) {
        return; // Si el evento no es "ausente" ni "descanso", o si no se seleccionaron fechas o usuarios, no hacemos nada
      }

      const eventos = [];

      this.usuariosSeleccionados.forEach((usuarioSeleccionado) => {
        this.selectedDates.forEach((selectedDate) => {
          const formattedDate = selectedDate.replace(/-/g, "/");
          const evento = {
            nombre: eventName,
            descripcion:
              eventName === "ausente" ? "Ausencia justificada" : "descanso",
            fecha: formattedDate,
            user: usuarioSeleccionado._id, // Supongamos que el ID del usuario está en _id
          };
          eventos.push(evento);
        });
      });

      const token = this.$store.state.token;
      // Enviar eventos al servidor
      await axios
        .post(
          "usuario/agregarEventos",
          { eventos: eventos },
          {
            headers: {
              token: token, // Incluir el token en el encabezado
            },
          }
        )
        .then((response) => {
          const eventosCreados = response.data;
          eventosCreados.forEach((eventoCreado) => {
            const idUser = eventoCreado.usuario;
            const eventosUser = eventoCreado.eventos;

            this.Users.forEach((user) => {
              if (user._id === idUser) {
                eventosUser.forEach((evento) => {
                  const formattedDate = new Date(evento.fecha).getDate(); // Obtén el día del evento
                  const nombreDia = `dia${formattedDate}`; // Crea el nombre del día: diaX
                  // Asigna el valor del evento al día correspondiente del usuario
                  user[nombreDia] = evento[nombreDia];
                });
              }
            });
          });
        })
        .catch((error) => {
          // Manejar errores si la solicitud falla
          console.error("Error al crear eventos:", error);
        });

      // Limpiar las fechas seleccionadas después de agregar los eventos
      this.selectedDates = [];
      this.usuariosSeleccionados = [];
    },
    // crearEventos(eventName) {
    //   if (!this.eventNames.includes(eventName) || !this.selectedDates.length) {
    //     return; // Si el nombre del evento no es válido o no se seleccionó una fecha, no hacemos nada
    //   }
    //   this.selectedDates.forEach((selectedDate) => {
    //     const existingEvent = this.events.find(
    //       (event) =>
    //         event.start.toDateString() ===
    //         new Date(selectedDate.replace(/-/g, "/")).toDateString()
    //     );

    //     if (!existingEvent) {
    //       const events = [...this.events];
    //       const colorRandom = this.colors[this.rnd(0, this.colors.length - 1)];

    //       const formattedDate = selectedDate.replace(/-/g, "/");

    //       const nuevoEvento = {
    //         name: eventName.charAt(0).toUpperCase() + eventName.slice(1),
    //         start: new Date(formattedDate),
    //         end: new Date(formattedDate),
    //         color: colorRandom,
    //         timed: false,
    //       };

    //       events.push(nuevoEvento);
    //       this.events = events;
    //     } else {
    //       console.log(selectedDate + " ya existe");
    //     }
    //   });

    //   // Limpiar las fechas seleccionadas después de crear los eventos
    //   this.selectedDates = [];
    // },
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
