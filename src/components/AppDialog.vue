<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  title: {
    type: String,
    default: "無標題",
  },
});
const emit = defineEmits(["update:modelValue"]);

const closeDialog = () => {
  emit("update:modelValue", false);
};
</script>

<template>
  <transition
    enter-active-class="animate__animated animate__fadeInLeft animate__faster"
    leave-active-class="animate__animated animate__fadeOutLeft animate__faster"
  >
    <section
      class="absolute top-4 bottom-4 left-4 w-80 bg-white rounded-lg shadow-2xl flex flex-col"
      v-show="props.modelValue"
    >
      <div class="shrink-0 flex items-center flex-wrap bg-stone-200 border-b rounded-t-lg px-4 py-3">
        <div class="grow text-stone-700 font-bold">{{ props.title }}</div>
        <button type="button" class="text-stone-500 transition hover:text-red-500" @click="closeDialog">X</button>
      </div>
      <div class="grow overflow-auto p-4">
        <slot></slot>
      </div>
    </section>
  </transition>
</template>

<style scoped></style>
