<template>
  <v-app>
    <notifications :duration="5000" width="60%" position="bottom center">
      <template slot="body" slot-scope="props">
        <div :class="['custom-template', getNotificationClass(props.item.type)]">
          <div class="custom-template-icon">
            <v-icon large>{{ getIcon(props.item.type) }}</v-icon>
          </div>
          <div class="custom-template-content">
            <div class="custom-template-title">
              {{ props.item.title }}
            </div>
            <div v-html="props.item.text"></div>
          </div>
          <div class="custom-template-close" @click="props.close">
            <v-icon large>mdi-close</v-icon>
          </div>
        </div>
      </template>
    </notifications>

    <navbar-component v-if="token"></navbar-component>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import NavbarComponent from "./components/NavbarComponent.vue";
import { mapState } from "vuex";

export default {
  components: { NavbarComponent },
  name: "App",

  data: () => ({
    //
  }),
  computed: {
    ...mapState(["token"]),
  },
  methods: {
    clean(group) {
      this.$notify({ group, clean: true });
    },
    getNotificationClass(type) {
      return `custom-template-${type.toLowerCase()}`;
    },
    getIcon(type) {
      switch (type) {
        case "success":
          return "mdi-check-circle";
        case "error":
          return "mdi-alert-circle";
        case "warn":
          return "mdi-alert";
        case "info":
          return "mdi-information";
      }
    },
  },
};
</script>

<style lang="scss">
.custom-template {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  text-align: left;
  font-size: 17px; 
  margin: 10px; 
  margin-bottom: 3;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 2px solid transparent;
  border-radius: 10px;

  /* Estilos específicos para el tipo 'SUCCESS' */
  &.custom-template-success {
    background: #5fde72;
  }

  /* Estilos específicos para el tipo 'ERROR' */
  &.custom-template-error {
    background: #fe5e5e;
  }

  .custom-template-icon {
    flex: 0 1 auto;
    // color: #15c371;
    padding: 0 10px;
    margin-left: 15px;
  }

  .custom-template-close {
    flex: 0 1 auto;
    padding: 0 20px;
    opacity: 0.2;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  .custom-template-content {
    padding: 20px; /* Aumenté el espacio interno a 20px */
    flex: 1 0 auto;
    color: white;

    .custom-template-title {
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 20px; /* Aumenté el tamaño del título a 14px */
      font-weight: 600;
    }
  }
}
</style>
