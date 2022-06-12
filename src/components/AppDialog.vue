<script setup>
import { inject } from "vue";

const isMobile = inject("isMobile");
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
    :enter-active-class="
      isMobile
        ? 'animate__animated animate__fadeInUp animate__faster'
        : 'animate__animated animate__fadeInLeft animate__faster'
    "
    :leave-active-class="
      isMobile
        ? 'animate__animated animate__fadeOutDown animate__faster'
        : 'animate__animated animate__fadeOutLeft animate__faster'
    "
  >
    <section
      v-show="props.modelValue"
      class="pointer-events-none fixed inset-4 z-50 mx-auto flex items-end md:w-96 lg:left-4 lg:mx-0 lg:w-80 lg:items-start"
    >
      <div
        class="pointer-events-auto flex max-h-full w-full flex-col rounded-lg bg-white shadow-2xl"
      >
        <div
          class="flex shrink-0 flex-wrap items-center rounded-t-lg border-b bg-gray-200 px-4 py-3"
        >
          <div class="grow font-bold text-gray-700">{{ props.title }}</div>
          <button
            type="button"
            class="text-gray-400 transition hover:text-red-500"
            @click="closeDialog"
          >
            <i-mdi-close-thick />
          </button>
        </div>
        <div class="overflow-auto p-4">
          <slot></slot>
        </div>
      </div>
    </section>
  </transition>
</template>

<style scoped></style>
