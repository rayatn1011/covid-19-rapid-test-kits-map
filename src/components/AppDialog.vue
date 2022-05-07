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
      class="absolute top-4 bottom-4 left-4 w-60 p-4 bg-white rounded-lg shadow-2xl flex flex-col gap-y-2"
      v-show="props.modelValue"
    >
      <div class="shrink-0 flex items-center flex-wrap">
        <div class="grow text-stone-700 font-bold">{{ props.title }}</div>
        <button type="button" @click="closeDialog">X</button>
      </div>
      <div class="grow overflow-auto">
        <slot></slot>
      </div>
    </section>
  </transition>
</template>

<style scoped></style>
