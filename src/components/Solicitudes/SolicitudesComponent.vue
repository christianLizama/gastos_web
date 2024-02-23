<template>
  <v-card max-width="98.6%" elevation="5" outlined class="mx-auto mb-8 mt-3">
    <v-data-table
      :headers="headers"
      :items="contenedores"
      :options.sync="options"
      :server-items-length="totalContenedores"
      :loading="loading"
      class="elevation-1"
      :items-per-page="5"
      :footer-props="{
        'items-per-page-options': [5, 10, 15, 20, 25, 30],
      }"
    >
      <template v-slot:[`item.conductores`]="{ item }">
        {{ obtenerNombres(item.conductores) }}
      </template>
      <template v-slot:[`item.estado`]="{ item }">
        <v-chip :color="getColor(item.estado)" dark>
          {{ item.estado }}
        </v-chip>
      </template>
      <template v-slot:[`item.creadoPor`]="{ item }">
        {{ item.creadoPor.nombreCompleto }} - {{ item.creadoPor.email }}
      </template>

      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Solicitudes</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>

          <v-text-field
            v-model="search"
            label="Busqueda por correlativo"
            single-line
            hide-details
          ></v-text-field>
          <v-btn icon @click="searchData" color="primary">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">mdi-magnify</v-icon>
              </template>
              Buscar
            </v-tooltip>
          </v-btn>
          <v-btn icon @click="clearSearch" color="primary">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">mdi-filter-remove</v-icon>
              </template>
              Limpiar busqueda
            </v-tooltip>
          </v-btn>
          <v-spacer></v-spacer>

          <v-dialog
            persistent
            v-model="dialog"
            :fullscreen="fullScr"
            max-width="100vh"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                color="primary"
                class="ma-2 white--text"
              >
                Agregar Solicitud
                <v-icon right dark> mdi-pencil-plus </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-overlay :absolute="absolute" :value="loadingStep2">
                <v-progress-circular
                  color="primary"
                  indeterminate
                  size="64"
                ></v-progress-circular>
              </v-overlay>
              <v-toolbar dark color="black lighten-3" dense flat>
                <v-btn icon dark @click="dialog = !dialog">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title
                  class="text-body-4 font-weight-bold white--text"
                >
                  {{ formTitle }}
                </v-toolbar-title>
              </v-toolbar>
              <v-stepper elevation="0" v-model="e1" v-if="editedIndex == -1">
                <v-stepper-header>
                  <v-stepper-step :complete="e1 > 1" step="1">
                    Seleccionar empresa
                  </v-stepper-step>

                  <v-divider></v-divider>

                  <v-stepper-step :complete="e1 > 2" step="2">
                    Confirmar datos de usuarios
                  </v-stepper-step>
                </v-stepper-header>

                <v-stepper-items>
                  <v-stepper-content step="1">
                    <v-form ref="form" v-model="valid" lazy-validation>
                      <v-select
                        :items="empresas"
                        v-model="empresaSeleccionada"
                        label="Empresa"
                      ></v-select>
                    </v-form>
                  </v-stepper-content>

                  <v-stepper-content step="2" class="flex">
                    <v-form ref="form" v-model="valid" lazy-validation>
                      <div v-for="(item, index) in solicitudes" :key="index">
                        <v-card
                          outlined
                          elevation="2"
                          tile
                          class="mb-5 rounded-lg"
                          :id="'card-' + index"
                        >
                          <v-card-text class="d-flex justify-space-between">
                            <v-btn @click="toggleExpand(index)" icon>
                              <v-icon>
                                {{
                                  item.expandida
                                    ? "mdi-chevron-up"
                                    : "mdi-chevron-down"
                                }}
                              </v-icon>
                            </v-btn>
                            <div class="d-flex align-center">
                              <h5 v-if="!item.expandida" class="mb-0">
                                {{ item.viaje.nombreCliente }}
                              </h5>
                            </div>

                            <!-- Texto centrado vertical y horizontalmente -->
                            <div class="d-flex align-center">
                              <h5 v-if="!item.expandida" class="mb-0">
                                {{ item.conductor.nombreCompleto }}
                              </h5>
                            </div>
                            <v-tooltip
                              bottom
                              v-if="
                                (solicitudes.length > 1 || index > 0) &&
                                !item.expandida
                              "
                            >
                              <template v-slot:activator="{ on }">
                                <v-btn
                                  @click="removeFieldSolicitud(index)"
                                  icon
                                  v-on="on"
                                >
                                  <v-icon color="red darken-1"
                                    >mdi-delete</v-icon
                                  >
                                </v-btn>
                              </template>
                              <span>Eliminar solicitud</span>
                            </v-tooltip>
                          </v-card-text>
                          <v-expand-transition>
                            <v-card-text v-show="item.expandida">
                              <h1>Conductor {{ index + 1 }}</h1>
                              <v-autocomplete
                                :items="obtenerClientes(empresaSeleccionada)"
                                v-model="item.viaje.cliente"
                                label="RUT Cliente - Nombre"
                                item-text="RutCliente"
                                item-value="RutCliente"
                                :filter="customFilter"
                                return-object
                              >
                                <template v-slot:item="{ item }">
                                  {{ item.RutCliente }} -
                                  {{ item.NombreCliente }}
                                </template>
                              </v-autocomplete>

                              <v-select
                                
                                :items="empresas"
                                v-model="item.empresaConductor"
                                label="Empresa a la que pertenece el conductor"
                              ></v-select>

                              <v-autocomplete
                                v-if="item.empresaConductor"
                                :items="
                                  getConductoresPorEmpresa(
                                    item.empresaConductor
                                  )
                                "
                                v-model="item.conductor"
                                label="Conductor"
                                item-text="rut"
                                item-value="nombreCompleto"
                                :filter="customFilterConductor"
                                @change="obtenerPedidosConductor(item.conductor.rut,item.viaje.cliente.RutCliente)"
                                return-object
                              >
                                <template v-slot:item="{ item }">
                                  {{ item.rut }} - {{ item.nombreCompleto }} 
                                </template>
                              </v-autocomplete>

                              <!-- Pedidos de conductor -->

                              <v-autocomplete
                                label="Pedido"
                                :items="pedidosConductor"
                                item-text=""
                                item-value=""
                                :loading="loadingPedidos"
                              >
                                <template v-slot:prepend-item="">
                                  <v-row class="pa-3">
                                    <v-col>
                                      <v-subheader class="font-weight-bold"
                                        >Documento SAP</v-subheader
                                      >
                                    </v-col>
                                    <v-col>
                                      <v-subheader class="font-weight-bold"
                                        >Linea SAP</v-subheader
                                      >
                                    </v-col>
                                  </v-row>
                                </template>

                                <template v-slot:item="{ item }">
                                  <v-row class="pa-3">
                                    <v-col>
                                      <v-chip class="mr-2">{{
                                        item.DocSap
                                      }}</v-chip>
                                    </v-col>
                                    <v-col>
                                      <v-chip class="mr-2">{{
                                        item.LineaSap
                                      }}</v-chip>
                                    </v-col>
                                  </v-row>
                                </template>
                              </v-autocomplete>
                              
                              <v-text-field
                                v-model="item.viaje.origen"
                                label="Origen"
                              ></v-text-field>
                              <v-text-field
                                v-model="item.viaje.destino"
                                label="Destino"
                              ></v-text-field>

                              <p>Tipo Moneda:</p>
                              <v-text-field
                                v-if="item.empresa != ''"
                                label="CLP"
                                v-model="solicitudes[index].montos[0].monto"
                              ></v-text-field>
                              <v-text-field
                                v-model="solicitudes[index].montos[1].monto"
                                v-if="item.empresa == 'TIR'"
                                label="USD"
                              ></v-text-field>
                              <v-text-field
                                v-model="solicitudes[index].montos[2].monto"
                                v-if="item.empresa == 'TIR'"
                                label="ARS"
                              ></v-text-field>
                              <v-text-field
                                v-model="solicitudes[index].montos[3].monto"
                                v-if="solicitudes[index].empresa == 'TIR'"
                                label="REAL"
                              ></v-text-field>
                            </v-card-text>
                          </v-expand-transition>

                          <v-tooltip
                            bottom
                            v-if="
                              (solicitudes.length > 1 || index > 0) &&
                              item.expandida
                            "
                          >
                            <template v-slot:activator="{ on }">
                              <div class="d-flex justify-center mt-5">
                                <v-btn
                                  @click="removeFieldSolicitud(index)"
                                  icon
                                  v-on="on"
                                >
                                  <v-icon color="red darken-1"
                                    >mdi-delete</v-icon
                                  >
                                </v-btn>
                              </div>
                            </template>
                            <span>Eliminar solicitud</span>
                          </v-tooltip>
                        </v-card>
                      </div>

                      <!-- Botón "+" fuera de la card -->
                      <v-tooltip bottom v-if="solicitudes.length > 0">
                        <template v-slot:activator="{ on }">
                          <div class="d-flex justify-center mt-5">
                            <v-btn
                              @click="addFieldSolicitud(solicitudes.length - 1)"
                              icon
                              v-on="on"
                            >
                              <v-icon x-large color="green">mdi-plus</v-icon>
                            </v-btn>
                          </div>
                        </template>
                        <span>Agregar nueva solicitud</span>
                      </v-tooltip>
                    </v-form>
                  </v-stepper-content>
                </v-stepper-items>
              </v-stepper>

              <v-card-text v-if="editedIndex != -1" class="pa-4">
                <v-form ref="form" v-model="valid" lazy-validation> </v-form>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <!-- <v-btn color="blue darken-1" text @click="close"> Cancelar </v-btn> -->
                <v-btn
                  v-if="e1 == 2"
                  color="blue darken-1"
                  text
                  @click="comeback"
                >
                  <v-icon>mdi-arrow-left-bold</v-icon>
                  Volver atrás
                </v-btn>
                <v-btn v-if="e1 == 2" color="primary" @click="save">
                  Guardar
                </v-btn>
                <v-btn v-if="editedIndex != -1" color="primary" @click="save">
                  Guardar
                </v-btn>
                <v-btn
                  v-if="e1 == 1 && editedIndex == -1"
                  color="primary"
                  @click="nextStep"
                >
                  Continuar
                  <v-icon>mdi-arrow-right-bold</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog persistent v-model="dialogSolicitud">
            <v-toolbar dark color="black lighten-3" dense flat>
              <v-btn
                small
                icon
                dark
                @click="dialogSolicitud = !dialogSolicitud"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-toolbar-title class="text-body-4 font-weight-bold white--text">
                Solicitudes
              </v-toolbar-title>
            </v-toolbar>
            <visualizador-component
              :solicitudes="solicitudesActuales"
              @update:dialogo="cerrarDialogSolicitud"
              @update:solicitudes="handleSolicitudesUpdate"
            />
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-toolbar dark color="grey darken-3" dense flat>
                <v-icon color="red" class="mr-2">mdi-alert</v-icon>
                <v-toolbar-title
                  class="text-body-4 font-weight-bold white--text"
                >
                  ¿Estás seguro?
                </v-toolbar-title>
              </v-toolbar>
              <v-card-text class="pa-4 black--text font-weight-bold">
                <strong>EL usuario eliminado no podrá ser recuperado</strong>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="grey"
                  text
                  class="body-2 font-weight-bold"
                  @click="closeDelete"
                  >Cancelar</v-btn
                >
                <v-btn
                  color="red"
                  class="body-2 font-weight-bold"
                  outlined
                  @click="deleteItemConfirm"
                >
                  Eliminar
                </v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon medium class="mr-2" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon medium class="mr-2" @click="mostrarSolicitudes(item)"
          >mdi-eye
        </v-icon>
        <v-icon medium @click="deleteItem(item)"> mdi-delete </v-icon>
      </template>
      <template v-slot:no-data>
        <!-- <v-btn color="primary" @click="initialize"> Reset </v-btn> -->
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import UserService from "@/services/UserService";
import ContenedorService from "@/services/ContenedorService";
import VisualizadorComponent from "./VisualizadorComponent.vue";
import ClienteService from "@/services/ClienteService";

export default {
  components: {
    VisualizadorComponent,
  },
  data: () => ({
    valid: false,
    e1: 1,
    dialog: false,
    search: "",
    fullScr: false,
    dialogDelete: false,
    dialogSolicitud: false,
    loading: true,
    loadingStep2: false,
    clientesTIR: [],
    clientesTRN: [],
    solicitudesActuales: [],
    loadingPedidos: false,
    contenedorActual: {},
    headers: [
      {
        text: "Correlativo",
        align: "center",
        sortable: false,
        value: "correlativo",
      },
      {
        text: "Conductores",
        align: "start",
        sortable: false,
        value: "conductores",
      },
      { text: "Estado", value: "estado", sortable: false },
      { text: "Empresa", value: "empresa", sortable: true },
      { text: "Creado por", value: "creadoPor", sortable: true },
      { text: "Actions", value: "actions", sortable: false, align: "center" },
    ],
    editedIndex: -1,
    rols: [],
    empresas: ["TRN", "TIR"],
    solicitudes: [],
    conductoresTIR: [],
    conductoresTRN: [],
    pedidosConductor: [],
    empresaSeleccionada: "",
    contenedores: [],
    totalContenedores: 0,
    options: {},
    absolute: true,
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Usuario" : "Editar Usuario";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
  },

  methods: {
    obtenerClientes(empresa) {
      if (empresa === "TRN") {
        return this.clientesTRN;
      } else {
        return this.clientesTIR;
      }
    },

    getConductoresPorEmpresa(empresa) {
      if (empresa === "TRN") {
        return this.conductoresTRN;
      } else {
        return this.conductoresTIR;
      }
    },
    customFilter(item, queryText) {
      const searchText = queryText.toLowerCase();
      const rutMatches = item.RutCliente.toLowerCase().includes(searchText);
      const nombreMatches =
        item.NombreCliente.toLowerCase().includes(searchText);
      return rutMatches || nombreMatches;
    },
    customFilterConductor(item, queryText) {
      const searchText = queryText.toLowerCase();
      const rutMatches = item.rut.toLowerCase().includes(searchText);
      const nombreMatches = item.nombreCompleto
        .toLowerCase()
        .includes(searchText);
      return rutMatches || nombreMatches;
    },
    expand(index) {
      this.$set(this.solicitudes, index, {
        ...this.solicitudes[index],
        expandida: true,
      });
    },
    collapse(index) {
      this.$set(this.solicitudes, index, {
        ...this.solicitudes[index],
        expandida: false,
      });
    },
    toggleExpand(index) {
      this.$set(this.solicitudes, index, {
        ...this.solicitudes[index],
        expandida: !this.solicitudes[index].expandida,
      });
    },
    handleSolicitudesUpdate(solicitudes) {
      //ordenar solicitudes por correlativo
      solicitudes.sort((a, b) => a.correlativo - b.correlativo);

      this.solicitudesActuales = solicitudes;
      //Buscar esas solicitudes en el array de contenedores y actualizarlas
      this.contenedores.forEach((contenedor) => {
        if (contenedor._id === this.contenedorActual._id) {
          console.log("Contenedor encontrado: ", contenedor);
          contenedor.solicitudes = JSON.parse(JSON.stringify(solicitudes));
        }
      });
    },
    cerrarDialogSolicitud() {
      this.dialogSolicitud = false;
      this.solicitudesActuales = [];
      this.contenedorActual = {};
    },
    mostrarSolicitudes(item) {
      this.solicitudesActuales = JSON.parse(JSON.stringify(item.solicitudes));
      this.contenedorActual = item;
      this.dialogSolicitud = true;
    },
    getColor(item) {
      switch (item) {
        case "NINGUNA":
          return "red";
        case "PARCIALMENTE":
          return "orange";
        case "TODO":
          return "green";
        default:
          break;
      }
    },
    obtenerNombres(conductores) {
      let nombres = "";
      conductores.forEach((conductor) => {
        nombres += conductor.nombreCompleto + ", ";
      });
      return nombres;
    },
    comeback() {
      this.fullScr = false;
      this.e1 = 1;
      // this.editedItem = Object.assign({}, this.defaultItem);
      this.solicitudes = [];
    },

    searchData() {
      // Cuando se ingresa texto en el campo de búsqueda, vuelve a la página 1
      this.options.page = 1;
      this.getDataFromApi();
    },
    clearSearch() {
      this.search = ""; // Establece la búsqueda como una cadena vacía
      this.getDataFromApi(); // Vuelve a cargar los datos sin filtro
    },
    getDataFromApi() {
      this.loading = true;
      this.apiCall().then((data) => {
        this.contenedores = data.docs;
        this.totalContenedores = data.totalDocs;
        this.loading = false;
        this.loadingStep2 = false;
      });
    },
    apiCall() {
      return new Promise((resolve) => {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        this.getServerData(sortBy, sortDesc, page, itemsPerPage)
          .then((data) => {
            resolve(data);
          })
          .catch((error) => {
            console.error("Error al obtener datos del servidor:", error);
            this.loading = false;
            resolve({
              contenedores: [],
              total: 0,
            });
          });
      });
    },

    async getPedidosConductorTRN(cliente) {
      try {
        this.loadingPedidos = true;
        const response = await ClienteService.obtenerPedidosConductorTRN(
          cliente.RutTrabajador
        );
        this.loadingPedidos = false;
        this.pedidosTRN = response.data;
      } catch (error) {
        console.error("Error al obtener pedidos del cliente:", error);
        this.loadingPedidos = false;
      }
    },
    async getPedidosClienteTIR() {},

    async getServerData(sortBy, sortDesc, page, itemsPerPage) {
      try {
        const response = await ContenedorService.getContenedores(
          sortBy,
          sortDesc,
          this.search,
          page,
          itemsPerPage
        );
        return response;
      } catch (error) {
        //console.error("Error al obtener datos del servidor:", error);
        this.loading = false;
        return []; // Devuelve un array vacío en caso de error
      }
    },

    editItem(item) {
      this.editedIndex = this.contenedores.indexOf(item);
      // this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.contenedores.indexOf(item);
      // this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.borrarUsuario();
      this.closeDelete();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        // this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.e1 = 1;
        this.solicitudes = [];
        this.loadingStep2 = false;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        // this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    removeFieldSolicitud(index) {
      this.expand(index - 1);
      this.solicitudes.splice(index, 1);
      this.$nextTick(() => {
        const newCard = document.getElementById(
          `card-${this.solicitudes.length - 1}`
        );
        if (newCard) {
          setTimeout(() => {
            newCard.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
          }, 140); // Ajusta este valor si es necesario
        }
      });
    },

    addFieldSolicitud(index) {
      this.collapse(index);
      let viaje = {
        clienteID: "",
        nombreCliente: "",
        origen: "",
        destino: "",
        pais: "",
        fecha: "",
        conductor: "",
        estado: "NOREALIZADO",
      };

      let solicitudUsuario = {
        expandida: true,
        conductor: "",
        empresa: this.empresaSeleccionada,
        creadoPor: "",
        empresaConductor: "",
        viaje: { ...viaje },
        montos: [
          {
            tipo: "CLP",
            monto: 0,
          },
          {
            tipo: "USD",
            monto: 0,
          },
          {
            tipo: "ARS",
            monto: 0,
          },
          {
            tipo: "REAL",
            monto: 0,
          },
        ],
      };
      // Clonar el objeto solicitudUsuario y asignar una nueva instancia de viaje y montos
      this.solicitudes.push({
        ...solicitudUsuario,
        viaje: { ...viaje },
        montos: solicitudUsuario.montos.map((monto) => ({ ...monto })),
      });

      this.$nextTick(() => {
        const newCard = document.getElementById(
          `card-${this.solicitudes.length - 1}`
        );
        if (newCard) {
          setTimeout(() => {
            newCard.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
          }, 100); // Ajusta este valor si es necesario
        }
      });
    },

    async nextStep() {
      try {
        this.e1 = 2;
        this.loadingStep2 = true;
        this.fullScr = true;

        if (this.empresaSeleccionada === "") {
          this.$notify({
            title: "Error",
            text: "Debe seleccionar una empresa",
            type: "error",
          });
          return;
        }

        const clientesTRN = await ClienteService.obtenerClientesTRN();
        this.clientesTRN = clientesTRN.data;

        const clientesTIR = await ClienteService.obtenerClientesTIR();
        this.clientesTIR = clientesTIR.data;

        const conductoresTIR = await UserService.obtenerUsuariosPorEmpresa(
          "TIR",
          this.$store.state.token
        );

        const conductoresTRN = await UserService.obtenerUsuariosPorEmpresa(
          "TRN",
          this.$store.state.token
        );

        this.conductoresTIR = conductoresTIR;
        this.conductoresTRN = conductoresTRN;

        let viaje = {
          cliente: {},
          nombreCliente: "",
          origen: "",
          destino: "",
          pais: "",
          fecha: "",
          conductor: "",
          estado: "NOREALIZADO",
        };

        let solicitudUsuario = {
          expandida: true,
          conductor: "",
          empresa: this.empresaSeleccionada,
          creadoPor: "",
          empresaConductor: "",
          viaje: { ...viaje },
          montos: [
            {
              tipo: "CLP",
              monto: 0,
            },
            {
              tipo: "USD",
              monto: 0,
            },
            {
              tipo: "ARS",
              monto: 0,
            },
            {
              tipo: "REAL",
              monto: 0,
            },
          ],
        };

        // Clonar el objeto solicitudUsuario y asignar una nueva instancia de viaje y montos
        this.solicitudes.push({
          ...solicitudUsuario,
          viaje: { ...viaje },
          montos: solicitudUsuario.montos.map((monto) => ({ ...monto })),
        });
        this.loadingStep2 = false;
        //console.log("Solicitudes: ", this.solicitudes);
      } catch (error) {
        console.error("Error: ", error);
      }
    },
    async agregarContenedor() {
      try {
        const response = await ContenedorService.addContenedor(
          this.solicitudes
        );

        this.$notify({
          title: "Exitoso",
          text: response.message,
          type: "success",
        });

        this.getDataFromApi();
      } catch (error) {
        console.error("Error al agregar el contenedor:", error);
      }
    },

    save() {
      // Si se está editando un parametro existente
      if (this.editedIndex > -1) {
        this.actualizarUser();
      }
      // Si se está creando un nuevo usuario
      else {
        this.agregarContenedor();
      }
      this.close();
    },
  },
};
</script>

<style scoped>
.table-row {
  border-bottom: 1px solid #ccc; /* Línea de borde inferior para cada fila */
}

.table-cell {
  border-right: 1px solid #ccc; /* Línea de borde derecha para cada celda */
  padding: 8px; /* Ajusta el espaciado según tus necesidades */
}
</style>
