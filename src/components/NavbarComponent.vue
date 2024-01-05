<template>
  <div>
    <v-app-bar color="" app height="56%" elevation="1">
      <v-app-bar-nav-icon @click="cambiar()"></v-app-bar-nav-icon>

      <v-spacer></v-spacer>

      <v-img
        class="imagen mr-3"
        max-height="55"
        max-width="55"
        src="../assets/logo.e34e8d2.png"
      ></v-img>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" icon @click="changeThemeColor">
            <v-icon>{{
              $vuetify.theme.dark
                ? "mdi-white-balance-sunny"
                : "mdi-weather-night"
            }}</v-icon>
          </v-btn>
        </template>
        <span>Tema {{ $vuetify.theme.dark ? "Claro" : "Oscuro" }}</span>
      </v-tooltip>
    </v-app-bar>

    <v-navigation-drawer
      :expand-on-hover="observarMini"
      :permanent="!$vuetify.breakpoint.xsOnly"
      :mini-variant="observarMini"
      v-model="drawer"
      dark
      color="#212529"
      app
    >
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-icon>mdi-account</v-icon>
        </v-list-item-avatar>

        <v-list-item-title v-if="user">{{
          user.nombreCompleto
        }}</v-list-item-title>

        <v-tooltip bottom color="blue">
          <template v-slot:activator="{ on, attrs }">
            <div v-on="on" v-bind="attrs"></div>
            <v-btn @click="salir" icon dark v-bind="attrs" v-on="on">
              <v-icon>mdi-logout-variant</v-icon>
            </v-btn>
          </template>
          <span>Salir</span>
        </v-tooltip>
      </v-list-item>

      <v-divider elevation="1"></v-divider>

      <v-list>
        <v-list-item active-class="white--text" link to="/">
          <v-list-item-icon>
            <v-icon>mdi-monitor-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item active-class="white--text" link to="/usuarios">
          <v-list-item-icon>
            <v-icon>mdi-human-male-boy</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Usuarios</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        
        <v-list-item active-class="white--text" link to="/calendarioEventos">
          <v-list-item-icon>
            <v-icon>mdi-calendar</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Calendario</v-list-item-title>
          </v-list-item-content>
        </v-list-item>


        <v-divider></v-divider>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      usuarioActual: "",
      drawer: false,
      mini: true,
      expand: true,
    };
  },

  created() {
    // this.obtenerContenedores();
  },

  computed: {
    ...mapState(["user"]),
    esAdmin() {
      return (
        this.$store.state.usuario && this.$store.state.usuario.rol == "admin"
      );
    },
    observarMini() {
      return this.comprobarMini();
    },
  },

  methods: {
    usuario() {
      return this.$store.state.usuario;
    },

    salir() {
      this.$store.dispatch("logout");
    },

    cambiar() {
      if (this.$vuetify.breakpoint.xsOnly) {
        this.drawer = !this.drawer;
      } else {
        this.mini = !this.mini;
      }
    },

    comprobarMini() {
      return this.mini && !this.$vuetify.breakpoint.xsOnly;
    },

    changeThemeColor() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },

    toRoute(nombre) {
      this.$router.push(nombre);
    },
  },
};
</script>
