<template>
  <div class="text-center">
    <v-date-picker v-model="selectedDates" multiple></v-date-picker>
    <div class="d-flex justify-center mt-3">
      <v-btn @click="crearEventos('trabaja')">Agregar Trabajo</v-btn>
      <v-btn @click="crearEventos('ausente')">Agregar Ausencia</v-btn>
    </div>
    <v-calendar
      ref="calendar"
      v-model="value"
      :type="type"
      :events="events"
      :event-color="getEventColor"
      @change="getEvents"
      class="mt-3"
    ></v-calendar>
  </div>
</template>

<script>
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
      eventNames: ["trabaja", "ausente"],
      selectedDates: [], // Almacena las fechas seleccionadas
    };
  },
  methods: {
    getEvents() {
      // Lógica para obtener eventos si es necesario
      return this.events;
    },
    getEventColor(event) {
      return event.color;
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
    crearEventos(eventName) {
      if (!this.eventNames.includes(eventName) || !this.selectedDates.length) {
        return; // Si el nombre del evento no es válido o no se seleccionó una fecha, no hacemos nada
      }
      this.selectedDates.forEach(selectedDate => {
        const existingEvent = this.events.find(
          event => event.start.toDateString() === new Date(selectedDate.replace(/-/g, "/")).toDateString()
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
        }
        else{
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