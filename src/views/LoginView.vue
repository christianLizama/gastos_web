<template>
  <v-container style="background-color: #f2f2f2" fluid class="fill-height">
    <snackbar ref="childComponent"></snackbar>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-card-text>
          <h1 class="text-center">Iniciar Sesión</h1>
          <v-row align="center" justify="center">
            <v-col cols="12" sm="5" md="3" lg="2">
              <v-text-field
                v-model="email"
                label="Email"
                outlined
                dense
                color="blue"
                autocomplete="false"
                class="mt-16"
              />
              <v-text-field
                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show1 ? 'text' : 'password'"
                name="input-10-2"
                class="input-group--focused"
                @click:append="show1 = !show1"
                v-model="password"
                label="Contraseña"
                outlined
                dense
                color="blue"
                autocomplete="false"
              />
              <v-btn
                class="mb-4 rounded"
                color="primary"
                dark
                block
                tile
                @click="login()"
                >Iniciar Sesión</v-btn
              >
              <div class="ajustes2">
                <router-link to="/recuperarClave"
                  >Olvidaste la contraseña?</router-link
                >
                <p></p>
                <v-img
                  class="img"
                  max-height="80"
                  max-width="80"
                  src="../assets/logo.e34e8d2.png"
                ></v-img>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Snackbar from "../components/SnackbarComponent.vue";
import axios from "axios";
export default {
  components: { Snackbar },
  data() {
    return {
      show1: false,
      email: "",
      password: "",
    };
  },
  methods: {
    async login() {
      // Aquí se puede agregar la lógica de inicio de sesión
      //this.loading = true;
      await axios
        .post("usuario/login", {
          email: this.email.toLowerCase(),
          password: this.password,
        })
        .then((respuesta) => {
          return respuesta.data;
        })
        .then((data) => {
          this.$store.dispatch("guardarToken", data);
          this.$router.push("/").catch(() => {});
          this.$refs.childComponent.SnackbarShow(
            "success",
            "Sesión iniciada con exito"
          );
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          if (error.response.status == 404) {
            this.$refs.childComponent.SnackbarShow(
              "error",
              "No existe el usuario o las credenciales son incorrectas."
            );
          } else {
            this.$refs.childComponent.SnackbarShow(
              "error",
              "Ocurrio un error con el servidor"
            );
          }
        });
    },
  },
};
</script>
<style>
.img {
  vertical-align: middle;
}
.ajustes2 {
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
