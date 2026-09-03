<template>
  <div class="surface-card overflow-hidden">
    <div class="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-end sm:px-8">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Interactive system diagram</p>
        <h3 class="mt-1 text-2xl font-black tracking-tight text-slate-950">Services, resources, and their connections</h3>
        <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Follow the solid request path from left to right. The lower lanes show the deployment, runtime configuration, and observability resources supporting both application fleets.</p>
      </div>
      <span class="flex w-fit items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700"><span class="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Every outlined resource is clickable</span>
    </div>

    <div class="overflow-x-auto">
      <div class="min-w-[1380px] bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,.08),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(34,211,238,.08),transparent_28%)] p-8">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Synchronous request path</p>
          <div class="flex items-center gap-4 text-[10px] font-bold text-slate-400"><span class="flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-sm bg-cyan-400" /> Public</span><span class="flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-sm bg-brand-500" /> Shared VPC</span><span class="flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Managed AWS</span></div>
        </div>

        <div class="grid grid-cols-[100px_36px_145px_36px_1fr_36px_145px] items-stretch">
          <DiagramNode eyebrow="Demand" title="Browser" icon="U" tone="slate" description="Public user" />
          <DiagramArrow label="HTTPS" />
          <DiagramNode eyebrow="Global edge" title="CloudFront" icon="C" tone="cyan" description="HTTPS + asset cache" interactive @click="emit('explore', 'cloudfront')" />
          <DiagramArrow label="Origin" />

          <div class="rounded-[1.75rem] border-2 border-dashed border-brand-300 bg-brand-50/30 p-4">
            <div class="mb-4 flex items-center justify-between"><button type="button" class="flex items-center gap-2 rounded-xl p-1 text-left transition hover:bg-brand-100/70 focus:outline-none focus:ring-4 focus:ring-brand-500/10" @click="emit('explore', 'vpc')"><span class="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-xs font-black text-brand-700">V</span><span class="text-xs font-black uppercase tracking-[0.13em] text-brand-700">Shared VPC · 10.20.0.0/16</span></button><span class="text-[10px] font-bold text-brand-500">2 availability zones</span></div>
            <div class="grid grid-cols-[1fr_30px_1fr_30px_1fr_30px_1fr_30px_1fr] items-stretch">
              <div class="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-3">
                <p class="text-[9px] font-black uppercase tracking-[0.12em] text-cyan-700">Public subnets</p>
                <button type="button" class="mt-2 rounded-lg bg-amber-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-amber-700 transition hover:bg-amber-200" @click="emit('explore', 'waf')">WAF protected · click</button><button type="button" class="mt-2 w-full rounded-xl border border-cyan-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" @click="emit('explore', 'alb')"><span class="block text-sm font-black text-slate-950">Public ALB</span><span class="mt-1 block text-[10px] text-slate-500">Listener :80 · healthy Nuxt targets</span></button>
              </div>
              <DiagramArrow compact label=":3000" />
              <button type="button" class="rounded-2xl border border-brand-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" @click="emit('explore', 'nuxt')"><p class="text-[9px] font-black uppercase tracking-[0.12em] text-brand-600">Private subnets</p><span class="mt-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-sm font-black text-brand-700">N</span><span class="mt-3 block text-sm font-black text-slate-950">Nuxt ASG</span><span class="mt-1 block text-[10px] leading-4 text-slate-500">2–10 EC2 · SSR facade</span></button>
              <DiagramArrow compact label="HTTP" />
              <div class="rounded-2xl border border-violet-200 bg-violet-50/80 p-3"><p class="text-[9px] font-black uppercase tracking-[0.12em] text-violet-700">Private route</p><button type="button" class="mt-2 w-full rounded-xl border border-violet-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" @click="emit('explore', 'internal-alb')"><span class="text-[10px] font-bold text-slate-400">VPC only</span><span class="mt-1 block text-sm font-black text-slate-950">Internal ALB</span><span class="mt-1 block text-[10px] text-slate-500">Nuxt ingress only</span></button></div>
              <DiagramArrow compact label=":4000" />
              <button type="button" class="rounded-2xl border border-violet-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" @click="emit('explore', 'express')"><p class="text-[9px] font-black uppercase tracking-[0.12em] text-violet-700">Private subnets</p><span class="mt-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">E</span><span class="mt-3 block text-sm font-black text-slate-950">Express ASG</span><span class="mt-1 block text-[10px] leading-4 text-slate-500">2–6 EC2 · business core</span></button>
              <DiagramArrow compact label="Private" />
              <button type="button" class="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md" @click="emit('explore', 'ddb-endpoint')"><p class="text-[9px] font-black uppercase tracking-[0.12em] text-amber-700">VPC route tables</p><span class="mt-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-sm font-black text-amber-700">G</span><span class="mt-3 block text-sm font-black text-slate-950">DynamoDB endpoint</span><span class="mt-1 block text-[10px] leading-4 text-slate-500">Gateway endpoint · no NAT</span></button>
            </div>
          </div>

          <DiagramArrow label="AWS private" />
          <DiagramNode eyebrow="Managed service" title="DynamoDB" icon="D" tone="amber" description="Reached through VPC endpoint" interactive @click="emit('explore', 'dynamodb')" />
        </div>

        <div class="my-7 border-t border-dashed border-slate-300" />

        <div class="grid grid-cols-3 gap-5">
          <section class="rounded-3xl border border-blue-200 bg-blue-50/60 p-4">
            <div class="flex items-center justify-between"><p class="text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">Deployment lane</p><span class="rounded-lg bg-white px-2 py-1 text-[9px] font-bold text-slate-500">Independent releases</span></div>
            <div class="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2"><MiniNode icon="G" title="GitHub" stacked /><span class="text-brand-400">→</span><MiniNode icon="P" title="2× Pipelines" stacked interactive @click="emit('explore', 'pipeline')" /><span class="text-brand-400">→</span><MiniNode icon="R" title="2× ECR repos" stacked interactive @click="emit('explore', 'ecr')" /><span class="text-brand-400">→</span><MiniNode icon="C" title="CodeDeploy" stacked interactive @click="emit('explore', 'codedeploy')" /></div>
            <p class="mt-3 text-[10px] leading-4 text-slate-500">Builds Docker images and rolls them across tagged Nuxt and Express instances half at a time.</p>
          </section>

          <section class="rounded-3xl border border-violet-200 bg-violet-50/60 p-4">
            <div class="flex items-center justify-between"><p class="text-[10px] font-black uppercase tracking-[0.14em] text-violet-700">Runtime configuration</p><span class="rounded-lg bg-white px-2 py-1 text-[9px] font-bold text-slate-500">IAM scoped</span></div>
            <div class="mt-4 flex items-center gap-3"><MiniNode icon="S" title="Secrets Manager" wide interactive @click="emit('explore', 'secrets-manager')" /><span class="text-violet-400">→</span><MiniNode icon="I" title="Express IAM role" wide interactive @click="emit('explore', 'iam')" /></div>
            <p class="mt-3 text-[10px] leading-4 text-slate-500">The private API instance role reads its named runtime secret; secrets are not embedded in images or templates.</p>
          </section>

          <section class="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div class="flex items-center justify-between"><p class="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Observability lane</p><span class="rounded-lg bg-white px-2 py-1 text-[9px] font-bold text-slate-500">Shared platform</span></div>
            <div class="mt-4 flex items-center gap-2"><MiniNode icon="L" title="App logs" interactive @click="emit('explore', 'cloudwatch')" /><span class="text-emerald-500">→</span><MiniNode icon="W" title="CloudWatch" interactive @click="emit('explore', 'cloudwatch')" /><span class="text-emerald-500">→</span><MiniNode icon="S" title="SNS alarms" interactive @click="emit('explore', 'sns')" /></div>
            <p class="mt-3 text-[10px] leading-4 text-slate-500">Both fleets write to the retained log group; dashboards provide visibility and SNS is the alarm notification channel.</p>
          </section>
        </div>

        <div class="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-[10px] font-bold text-slate-500"><span class="text-brand-500">↑</span> Supporting lanes feed the application resources above without joining the synchronous request path.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArchitectureDetailId } from "~/types";

const emit = defineEmits<{
  explore: [id: ArchitectureDetailId];
}>();
</script>
