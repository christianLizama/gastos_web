<template>
  <v-card max-width="98.6%" elevation="5" outlined class="mx-auto mb-8 mt-3">
    <v-data-table
      :headers="headers"
      :items="usuarios"
      :options.sync="options"
      :server-items-length="totalUsuarios"
      :loading="loading"
      class="elevation-1"
      :items-per-page="5"
      :footer-props="{
        'items-per-page-options': [5, 10, 15, 20, 25, 30],
      }"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Usuarios</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>

          <v-text-field
            v-model="search"
            label="Busqueda por nombre o por rut"
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
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" color="primary" class="ma-2 white--text">
                Agregar Usuario
                <v-icon right dark> mdi-pencil-plus </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-toolbar dark color="black lighten-3" dense flat>
                <v-btn icon dark @click="dialog = !dialog">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title class="text-body-4 font-weight-bold white--text">
                  {{ formTitle }}
                </v-toolbar-title>
              </v-toolbar>

              <v-card-text class="pa-4">
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-text-field
                    v-model="editedItem.nombreCompleto"
                    label="Nombre"
                  ></v-text-field>
                  <v-text-field v-model="editedItem.rut" label="Rut"></v-text-field>
                  <v-text-field v-model="editedItem.email" label="Email"></v-text-field>
                  <v-text-field
                    v-if="editedIndex == -1"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    name="input-10-2"
                    hint="Debe contener 8 caracteres"
                    class="input-group--focused"
                    @click:append="show1 = !show1"
                    v-model="editedItem.clave"
                    label="Clave"
                  ></v-text-field>
                  <v-select v-model="editedItem.rol" :items="rols" label="Rol"></v-select>
                  <v-select
                    v-model="editedItem.empresa"
                    :items="empresas"
                    label="Empresa"
                  ></v-select>
                  <v-select
                    v-if="editedIndex != -1"
                    v-model="opcion"
                    label="Cambiar Contraseña"
                    :items="newPasswordOptions"
                  >
                  </v-select>
                  <v-text-field
                    v-if="editedIndex != -1"
                    :disabled="newPassword"
                    v-model="editedItem.newClave"
                    label="Nueva Contraseña"
                    :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show2 ? 'text' : 'password'"
                    name="input-10-2"
                    hint="Debe contener 8 caracteres"
                    class="input-group--focused"
                    @click:append="show2 = !show2"
                  ></v-text-field>
                  <v-text-field
                    v-if="editedIndex != -1"
                    :disabled="newPassword"
                    v-model="editedItem.reNewClave"
                    label="Repetir Contraseña"
                    :append-icon="show3 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show3 ? 'text' : 'password'"
                    name="input-10-2"
                    hint="Debe contener 8 caracteres"
                    class="input-group--focused"
                    @click:append="show3 = !show3"
                  ></v-text-field>
                </v-form>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
                <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-toolbar dark color="grey darken-3" dense flat>
                <v-icon color="red" class="mr-2">mdi-alert</v-icon>
                <v-toolbar-title class="text-body-4 font-weight-bold white--text">
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
                  >Cancel</v-btn
                >
                <v-btn
                  color="red"
                  class="body-2 font-weight-bold"
                  outlined
                  @click="deleteItemConfirm"
                  >Eliminar</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
      </template>
      <template v-slot:no-data>
        <!-- <v-btn color="primary" @click="initialize"> Reset </v-btn> -->
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import UserService from "@/services/UserService";

export default {
  data: () => ({
    valid: false,
    search: "",
    dialog: false,
    dialogDelete: false,
    newPassword: true,
    loading: true,
    show1: false,
    show2: false,
    show3: false,
    headers: [
      {
        text: "Nombre",
        align: "start",
        sortable: false,
        value: "nombreCompleto",
      },
      { text: "Rut", value: "rut", sortable: false },
      { text: "Correo", value: "email", sortable: false },
      { text: "Rol", value: "rol", sortable: false },
      { text: "Empresa", value: "empresa", sortable: true },
      { text: "Actions", value: "actions", sortable: false },
    ],
    usuarios: [],
    editedIndex: -1,
    rols: [],
    empresas: ["TRN", "TIR"],
    newPasswordOptions: ["No", "Si"],
    opcion: "No",
    editedItem: {
      _id: "",
      nombreCompleto: "",
      rol: "",
      email: "",
      clave: "",
      newClave: "",
      reNewClave: "",
      empresa: "",
      cambioClave: false,
    },
    defaultItem: {
      _id: "",
      nombreCompleto: "",
      rol: "",
      email: "",
      clave: "",
      newClave: "",
      reNewClave: "",
      empresa: "",
      cambioClave: false,
    },
    totalUsuarios: 0,
    options: {},
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Usuario" : "Editar Usuario";
    },
  },

  watch: {
    opcion(newValue) {
      if (newValue === "Si") {
        this.newPassword = false;
        this.editedItem.cambioClave = true;
      } else {
        this.editedItem.cambioClave = false;
        this.newPassword = true;
      }
    },
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
        this.usuarios = data.data;
        this.totalUsuarios = data.totalItems;
        this.loading = false;
        this.rols = data.roles;
      });
    },
    apiCall() {
      return new Promise((resolve) => {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        this.getServerData(sortBy, sortDesc, page, itemsPerPage)
          .then((data) => {
            resolve(data);
          })
          .catch(() => {
            //console.error("Error al obtener datos del servidor:", error);
            this.loading = false;
            resolve({
              items: [],
              total: 0,
            });
          });
      });
    },

    async getServerData(sortBy, sortDesc, page, itemsPerPage) {
      try {
        const response = await UserService.getUsers(
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
      this.editedIndex = this.usuarios.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.usuarios.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.borrarUsuario();
      this.closeDelete();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async borrarUsuario() {
      try {
        await UserService.deleteUser(this.editedItem._id);
        this.getDataFromApi();
        this.$notify({
          title: "Success",
          text: "Usuario eliminado correctamente",
          type: "success",
        });
      } catch (error) {
        if (error.response && error.response.status === 403) {
          // Manejar el código 403, por ejemplo, cerrar sesión
          this.$notify({
            title: "Error",
            text: "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.",
            type: "error",
          });
        } else {
          // Otro manejo de errores, por ejemplo, mostrar un mensaje genérico
          //console.error("Error al eliminar el usuario:", error.message);
          this.$notify({
            title: "Error",
            text: "Ha ocurrido un error al eliminar el usuario.",
            type: "error",
          });
        }
      }
    },

    async agregarUsuario() {
      try {
        const response = await UserService.addUser(this.editedItem);
        this.$notify({
          title: "Success",
          text: response.message,
          type: "success",
        });
        this.getDataFromApi();
      } catch (error) {
        //console.error("Error al agregar el usuario:", error);
        let errorMessage = "Error al agregar el usuario";

        if (error.message) {
          errorMessage = error.message;
        } else if (error.response && error.response.status === 400) {
          if (error.response.data.message === "El correo ya existe") {
            errorMessage = "El correo ya existe";
          } else {
            errorMessage = "Error de validación";
          }
        }

        this.$notify({
          title: "Error",
          text: errorMessage,
          type: "error",
        });
      }
    },
    async actualizarUser() {
      try {
        //Verificar si se cambia la contraseña
        if (this.opcion == "Si") {
          //Verificar si la contraseña nueva y la repetida son iguales
          if (this.editedItem.newClave === this.editedItem.reNewClave) {
            //Actualizar usuario con nueva contraseña
            const response = await UserService.updateUser(this.editedItem);
            this.$notify({
              title: "Success",
              text: response.message,
              type: "success",
            });
            this.getDataFromApi();
          } else {
            this.$notify({
              title: "Error",
              text: "Las contraseñas no coinciden",
              type: "error",
            });
          }
        } else {
          //Actualizar usuario sin cambiar contraseña
          const response = await UserService.updateUser(this.editedItem);
          this.$notify({
            title: "Success",
            text: response.message,
            type: "success",
          });
          this.getDataFromApi();
        }
      } catch (error) {
        // Manejar excepciones específicas que provienen de UserService.updateUser
        if (
          error.message === "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión."
        ) {
          // Cerrar sesión u otra acción
          this.$notify({
            title: "Error",
            text: error.message,
            type: "error",
          });
        } else if (error.message === "El correo ya existe") {
          this.$notify({
            title: "Error",
            text: error.message,
            type: "error",
          });
        } else if (error.message === "Todos los campos son obligatorios") {
          this.$notify({
            title: "Error",
            text: error.message,
            type: "error",
          });
        } else {
          this.$notify({
            title: "Error",
            text: "Error al actualizar el usuario",
            type: "error",
          });
        }
      }
    },
    save() {
      // Si se está editando un parametro existente
      if (this.editedIndex > -1) {
        this.actualizarUser();
      }
      // Si se está creando un nuevo usuario
      else {
        this.agregarUsuario();
      }
      this.close();
    },
  },
};
</script>
