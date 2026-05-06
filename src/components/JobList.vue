<script setup>
import JobItem from './JobItem.vue';

defineProps({
    jobs:{
        type : Array,
        default : ()=>[]
    }
})
defineEmits(['toggle-favorite', 'toggle-ignored'])


</script>

<template>
<section class="result">
    <p v-if="jobs.length === 0">표시할 공고가 없습니다.</p>
    <JobItem
    v-for="job in jobs"
    :key="job.id"
    :job="job"
    @toggle-favorite="$emit('toggle-favorite', $event)"
    @toggle-ignored="$emit('toggle-ignored', $event)"
    />
</section>
</template>

<style scoped>
.result{
    margin-top: 16px;
}
</style>
