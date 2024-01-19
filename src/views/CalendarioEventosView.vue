<template>
  <v-card class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <div class="text-center">
          <v-autocomplete
            v-if="
              user.rol === 'ADMIN' ||
              user.rol === 'ADMINAPP' ||
              user.rol === 'LECTOR' ||
              user.rol === 'EDITOR'
            "
            :items="empresas"
            v-model="selectedEmpresa"
            label="Empresa"
            class="mr-3 d-inline-flex"
            outlined
          ></v-autocomplete>

          <v-autocomplete
            v-if="
              user.rol === 'ADMINTRN' ||
              user.rol === 'LECTORTRN' ||
              user.role === 'EDITORTRN'
            "
            :items="[empresas[0]]"
            v-model="selectedEmpresa"
            label="Empresa"
            class="mr-3 d-inline-flex"
            outlined
          ></v-autocomplete>

          <v-autocomplete
            v-if="
              user.rol === 'ADMINTIR' ||
              user.rol === 'LECTORTIR' ||
              user.role === 'EDITORTIR'
            "
            :items="[empresas[1]]"
            v-model="selectedEmpresa"
            label="Empresa"
            class="mr-3 d-inline-flex"
            outlined
          ></v-autocomplete>

          <v-autocomplete
            v-if="
              user.rol === 'ADMIN' ||
              user.rol === 'ADMINAPP' ||
              user.rol === 'ADMINTRN' ||
              user.rol === 'ADMINTIR' ||
              user.rol === 'EDITOR' ||
              user.rol === 'EDITORTRN' ||
              user.rol === 'EDITORTIR'
            "
            :style="{ width: '450px' }"
            :disabled="!selectedEmpresa"
            :items="usuariosDeEmpresa"
            multiple
            label="Usuario"
            :item-text="(usuario) => `${usuario.nombreCompleto} - ${usuario.rut}`"
            v-model="usuariosSeleccionados"
            return-object
            class="d-inline-flex"
            outlined
            :filter="customFilter"
          >
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="index === 0">
                <span>{{ item.nombreCompleto }} </span>
              </v-chip>
              <span v-if="index === 1" class="grey--text text-caption">
                (+{{ usuariosSeleccionados.length - 1 }} Usuario(s))
              </span>
            </template>
          </v-autocomplete>
        </div>
      </v-col>
    </v-row>
    <v-row justify="center" class="mb-3">
      <v-col cols="4" class="text-center" style="max-width: ">
        <v-card height="97.2%" class="">
          <!-- Contenido de la leyenda -->
          <v-app-bar dark>
            <v-toolbar-title class="flex text-center text-body-3 font-weight-bold">
              Leyendas
            </v-toolbar-title>
          </v-app-bar>

          <v-card-text>
            <p :style="{ color: getColor(item) }" v-for="item in eventLetter" :key="item">
              {{ item }}: {{ getEventName(item) }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4" class="text-center">
        <v-card class="mb-3">
          <v-date-picker
            color="black"
            full-width
            locale="cl"
            v-model="selectedDates"
            multiple
            @update:picker-date="onMonthChange"
          ></v-date-picker>
        </v-card>
      </v-col>
      <v-col
        cols="4"
        class="text-center"
        v-if="
          user.rol === 'ADMIN' ||
          user.rol === 'ADMINTRN' ||
          user.rol === 'ADMINTIR' ||
          user.rol === 'ADMINAPP' ||
          user.rol === 'EDITOR' ||
          user.rol === 'EDITORTIR' ||
          user.rol === 'EDITORTRN'
        "
      >
        <v-card height="97.2%">
          <v-app-bar dark>
            <v-toolbar-title class="flex text-center text-body-3 font-weight-bold">
              Acción
            </v-toolbar-title>
          </v-app-bar>
          <v-card-text class="text-h6 font-weight-bold">
            Seleccione un(os) usuario(s) y una fecha para agregar un descanso o medio día
            de trabajo:
          </v-card-text>
          <v-spacer></v-spacer>
          <v-card-actions class="justify-center align-end">
            <v-btn color="#90CAF9" class="mb-3" @click="crearEventos('descanso')">
              Agregar Descanso
              <v-icon right>mdi-weather-night</v-icon>
            </v-btn>
            <v-btn
              color="#546E7A"
              dark
              class="mb-3"
              @click="crearEventos('mediotrabajo')"
            >
              Agregar Medio Trabajo
              <v-icon right>mdi-sun-clock-outline</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-card>
      <v-data-table
        :headers="headers"
        :items="Users"
        :options.sync="options"
        :server-items-length="totalUsers"
        :loading="loading"
        :items-per-page="-1"
        :footer-props="{
          'items-per-page-options': [-1],
        }"
        class="elevation-1 mx-auto"
      >
        <template v-for="header in headers" v-slot:[`item.${header.value}`]="{ item }">
          <td
            :style="{
              backgroundColor: getColor(item[header.value]),
              cursor: 'pointer' /* Agrega un cursor de puntero al pasar el ratón */,
            }"
            :key="header.value"
            @click="
              item[header.value] !== 'V' &&
                item[header.value] !== 'A' &&
                item[header.value] !== 'L' &&
                item[header.value] !== 'NC' &&
                item[header.value] !== 'TC' &&
                item[header.value] &&
                header.value !== 'nombreCompleto' &&
                header.value !== 'rut' &&
                openDeleteDialog(item, header.value)
            "
            @mouseover="handleMouseOver"
            @mouseleave="handleMouseLeave"
          >
            {{ item[header.value] || "T" }}
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-toolbar dark color="grey darken-3" dense flat>
          <v-icon color="red" class="mr-2">mdi-alert</v-icon>
          <v-toolbar-title class="text-body-4 font-weight-bold white--text">
            ¿Estás seguro?
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pa-4 black--text">
          Si borras este evento se eliminará de forma permanente.
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" class="body-2 font-weight-bold" outlined @click="deleteEvent"
            >Eliminar</v-btn
          >
          <v-btn @click="dialog = false" color="grey" text class="body-2 font-weight-bold"
            >Cancelar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import UserService from "@/services/UserService";
import axios from "axios";
import { mapState } from "vuex";
export default {
  data() {
    return {
      type: "month",
      value: "",
      events: [],
      search: "",
      eventNames: ["trabaja", "ausente", "descanso"],
      eventLetter: ["T", "MT", "A", "D", "V", "L", "NC", "TC"],
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
      anoActual: new Date().getFullYear(),
      dialog: false,
      evento: {},
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
    anoActual() {
      this.getDataFromApi();
    },
    selectedEmpresa(newValue, oldValue) {
      if (newValue !== oldValue) {
        // Si son diferentes, limpia la lista de usuarios seleccionados
        this.usuariosSeleccionados = [];
      }
      if (newValue) {
        this.obtenerUsuariosPorEmpresa(newValue);
        this.getDataFromApi();
      } else {
        this.usuariosDeEmpresa = [];
      }
    },
  },
  computed: {
    ...mapState(["user"]),
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
    customFilter(item, queryText) {
      const searchText = queryText.toLowerCase();
      const itemData = `${item.nombreCompleto.toLowerCase()} ${item.rut.toLowerCase()}`;
      return itemData.indexOf(searchText) > -1;
    },
    openDeleteDialog(item, column) {
      this.dialog = true;
      this.evento = {
        _id: item._id,
        dia: column,
        mesActual: this.mesActual,
        añoActual: this.anoActual,
      };
    },
    handleMouseOver(event) {
      event.target.style.backgroundColor = "yellow"; // Cambia el color al pasar el ratón
    },
    handleMouseLeave(event) {
      const value = event.target.innerText.trim() || "T"; // Obtén el valor del td
      event.target.style.backgroundColor = this.getColor(value); // Restaura el color original
    },
    async deleteEvent() {
      const token = this.$store.state.token;
      const fecha = {
        dia: this.evento.dia,
        mesActual: this.evento.mesActual,
        anoActual: this.evento.añoActual,
      };
      const idUser = this.evento._id;

      try {
        const response = await UserService.eliminarEvento(idUser, fecha, token);
        const eventoEliminado = response.evento;

        // Eliminar el evento del usuario
        this.Users.forEach((user) => {
          if (user._id === idUser) {
            delete user[eventoEliminado];
          }
        });

        this.evento = {};
      } catch (error) {
        console.error("Error al eliminar el evento:", error);
        // Realiza una acción si la solicitud falla por algún motivo general
      }

      this.dialog = false;
    },
    async obtenerUsuariosPorEmpresa(empresa) {
      try {
        const token = this.$store.state.token;
        const usuarios = await UserService.obtenerUsuariosPorEmpresa(empresa, token); // Método para obtener usuarios por empresa desde la API
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
          text: "Rut",
          align: "start",
          sortable: false,
          value: "rut",
        },
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
      this.anoActual = new Date(actualDate).getFullYear();
      //this.getDataFromApi();
    },
    getColor(value) {
      switch (value) {
        //Trabaja
        case "T":
          return ""; // Blanco
        case "MT":
          return "#546E7A"; //
        //Vacaciones
        case "V":
          return "#81C784"; // Verde
        //Ausentismo
        case "A":
          return "#E57373"; // Rojo
        //Licencia
        case "L":
          return "#FFB74D"; // naranjo
        //Descanso
        case "D":
          return "#90CAF9"; // azul
        //No aplica
        case "NC":
          return "#BDBDBD"; // gris
        //Finiquitado
        case "TC":
          return "#BDBDBD"; // gris
        default:
          return ""; // Color predeterminado o ninguno
      }
    },
    getEventName(value) {
      switch (value) {
        //Trabaja
        case "T":
          return "Trabajado";
        //Trabaja medio dia
        case "MT":
          return "Medio Trabajado";
        //Vacaciones
        case "V":
          return "Vacaciones";
        //Ausentismo
        case "A":
          return "Ausentismo";
        //Licencia
        case "L":
          return "Licencia";
        //Descanso
        case "D":
          return "Descanso";
        //No aplica
        case "NC":
          return "No contratado";
        //Finiquitado
        case "TC":
          return "Termino de Contrato";
        default:
          return "";
      }
    },
    getDataFromApi() {
      this.loading = true;
      this.ApiCall(this.mesActual, this.anoActual, this.selectedEmpresa).then((data) => {
        this.Users = data.items;
        this.totalUsers = data.total;
        this.loading = false;
      });
    },
    /**
     * In a real application this would be a call to fetch() or axios.get()
     */
    async ApiCall(month, year, empresa) {
      try {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;

        const token = this.$store.state.token;
        // Obtener los usuarios
        const response = await UserService.getConductores(token, month, year, empresa);

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
        console.log("Error al obtener usuarios:", error);
        return {
          items: [], // Devuelve un array vacío en caso de error
          total: 0, // Inicializa total como 0 en caso de error
        };
      }
    },

    async crearEventos(eventName) {
      if (
        (eventName !== "mediotrabajo" && eventName !== "descanso") ||
        !this.selectedDates.length ||
        !this.usuariosSeleccionados.length
      ) {
        this.$notify({
          duration: 3500,
          title: "Error",
          type: "error",
          text: "Debe seleccionar al menos una fecha y un usuario",
        });
        return; // Si el evento no es "ausente" ni "descanso", o si no se seleccionaron fechas o usuarios, no hacemos nada
      }

      const eventos = [];

      this.usuariosSeleccionados.forEach((usuarioSeleccionado) => {
        this.selectedDates.forEach((selectedDate) => {
          const formattedDate = selectedDate.replace(/-/g, "/");
          let tipoTrabajo = "";
          if (eventName === "mediotrabajo") {
            tipoTrabajo = "trabajo medio día";
          } else if (eventName === "descanso") {
            tipoTrabajo = "descanso";
          }
          const evento = {
            nombre: eventName,
            fecha: formattedDate,
            user: usuarioSeleccionado._id,
            tipo: tipoTrabajo,
          };
          eventos.push(evento);
        });
      });

      const fechas = {
        mesActual: this.mesActual,
        anoActual: this.anoActual,
      };

      const token = this.$store.state.token;
      // Enviar eventos al servidor
      await axios
        .post(
          "usuario/agregarEventos",
          { eventos: eventos, fechas: fechas },
          {
            headers: {
              token: token, // Incluir el token en el encabezado
            },
          }
        )
        .then((response) => {
          const eventosCreados = response.data.eventos;
          const eventosFallidos = response.data.eventosNoAgregados;
          let cantidadEventosCreados = 0;
          // let cantidadEventosFallidos = 0;

          if (eventosCreados) {
            cantidadEventosCreados = eventosCreados.length;
          }
          const usuariosFallidos = new Set();
          let users = [];
          if (eventosFallidos) {
            // cantidadEventosFallidos = eventosFallidos.length;
            //Guardar los nombres de los usuarios que no se pudieron agregar
            eventosFallidos.forEach((eventoFallido) => {
              usuariosFallidos.add(eventoFallido.user.nombreCompleto); // Suponiendo que 'nombre' es la propiedad que contiene el nombre del usuario
            });
            users = Array.from(usuariosFallidos);
          }

          const notificacion = `<p>Eventos agregados: ${cantidadEventosCreados}</p><p>Eventos no agregados para: ${users.join(
            ", "
          )}</p>`;

          this.$notify({
            duration: 3500,
            title: "Eventos",
            type: "success",
            text: notificacion,
          });

          eventosCreados.forEach((eventoCreado) => {
            const idUser = eventoCreado.usuario;
            const eventosUser = eventoCreado.eventos;
            this.Users.forEach((user) => {
              if (user._id === idUser) {
                eventosUser.forEach((evento) => {
                  //Split a la fecha del evento para obtener el día, mes y año
                  const [anioMesDia] = evento.fecha.split("T");
                  const [anio, mes, dia] = anioMesDia.split("-");
                  const formattedDate = new Date(anio, mes, dia).getDate(); // Obtén el día del evento
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
