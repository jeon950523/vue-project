<script setup>
import JobItem from './JobItem.vue';

defineProps({
    jobs:{
        type : Array,
        default : ()=>[]
    }
})

</script>

<template>
<section class="result">
    <p v-if="jobs.length === 0">표시할 공고가 없습니다.</p>
    <JobItem
    v-for="job in jobs"
    :key="job_id"
    :job="job"
    />
</section>
</template>

<style scoped>
.result{
    margin-top: 16px;
}
</style>