<template>
  <div class="flex-1 pb-16">
    <section class="page-shell pt-12 sm:pt-16">
      <div class="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-2xl shadow-slate-900/20 sm:px-10 sm:py-14 lg:px-14">
        <div class="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div class="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div class="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              <span class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.12)]" />
              System blueprint
            </div>
            <h1 class="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">Built to stay fast as every layer scales.</h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">A public Nuxt edge, a private Express core, and independent delivery rails—all connected inside one resilient AWS network.</p>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div v-for="metric in metrics" :key="metric.label" class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p class="text-2xl font-black text-white sm:text-3xl">{{ metric.value }}</p>
              <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{{ metric.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="page-shell mt-8">
      <div class="surface-card overflow-hidden">
        <div class="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Live request path</p>
            <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-950">From click to data and back</h2>
          </div>
          <div class="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span class="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" /> Healthy path
          </div>
        </div>

        <div class="overflow-hidden bg-[radial-gradient(circle_at_center,rgba(99,102,241,.07),transparent_55%)] px-5 py-8 sm:px-8 sm:py-10">
          <div class="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
            <template v-for="(node, index) in requestPath" :key="node.title">
              <button
                type="button"
                class="group relative min-h-40 rounded-3xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                :class="selectedNode === index ? 'border-brand-300 bg-white shadow-lg shadow-brand-500/10' : 'border-slate-200 bg-white/80 hover:border-brand-200'"
                :aria-label="`Explore ${node.title} architecture`"
                @click="openDetail(index, node.id)"
              >
                <span class="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black" :class="node.color">{{ node.icon }}</span>
                <span class="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{{ node.layer }}</span>
                <span class="mt-1 block text-base font-black text-slate-950">{{ node.title }}</span>
                <span class="mt-2 block text-xs leading-5 text-slate-500">{{ node.caption }}</span>
                <span class="mt-4 flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.1em] text-brand-600 opacity-70 transition group-hover:opacity-100">Explore <span aria-hidden="true">↗</span></span>
              </button>
              <div v-if="index < requestPath.length - 1" class="flex items-center justify-center text-brand-400" aria-hidden="true">
                <svg class="h-5 w-5 rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M5 12h14m-5-5 5 5-5 5" /></svg>
              </div>
            </template>
          </div>

          <div class="mt-5 flex flex-col gap-3 rounded-2xl border border-brand-100 bg-brand-50/80 p-5 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
            <div>
              <p class="text-sm font-black text-slate-950">{{ requestPath[selectedNode].title }}</p>
              <p class="mt-1 text-sm leading-6 text-brand-800">{{ requestPath[selectedNode].detail }}</p>
            </div>
            <span class="shrink-0 rounded-xl bg-white px-3 py-2 font-mono text-xs font-bold text-brand-700 shadow-sm">{{ requestPath[selectedNode].protocol }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="page-shell mt-8 grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
      <div class="surface-card p-6 sm:p-8">
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Network topology</p>
            <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-950">One VPC, two availability zones</h2>
          </div>
          <span class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">Private application subnets</span>
        </div>

        <div class="mt-7 rounded-[1.75rem] border-2 border-dashed border-brand-200 bg-brand-50/30 p-4 sm:p-6">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 text-sm font-black text-brand-800"><span class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100">V</span> URL Shortener VPC</div>
            <span class="text-xs font-bold text-brand-500">10.0.0.0/16</span>
          </div>

          <div class="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-center">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Public load balancer · spans both zones</p>
          </div>

          <div class="my-3 flex justify-center text-slate-300">↓</div>
          <div class="grid gap-4 md:grid-cols-2">
            <div v-for="zone in zones" :key="zone.name" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div class="flex items-center justify-between"><p class="text-sm font-black text-slate-900">{{ zone.name }}</p><span class="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600">Available</span></div>
              <div class="mt-4 space-y-3">
                <div class="flex items-center gap-3 rounded-xl bg-brand-50 p-3"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 font-black text-brand-700">N</span><div><p class="text-xs font-black text-slate-900">Nuxt EC2</p><p class="text-[11px] text-slate-500">Auto Scaling member</p></div></div>
                <div class="flex items-center gap-3 rounded-xl bg-violet-50 p-3"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 font-black text-violet-700">E</span><div><p class="text-xs font-black text-slate-900">Express EC2</p><p class="text-[11px] text-slate-500">Auto Scaling member</p></div></div>
              </div>
            </div>
          </div>
          <div class="my-3 flex justify-center text-slate-300">↓</div>
          <div class="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-center">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">Internal load balancer · Nuxt access only · WAF attached</p>
          </div>
        </div>

        <div class="mt-4 flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-black text-amber-700">D</span>
          <div><p class="text-sm font-black text-slate-900">DynamoDB managed data plane</p><p class="mt-1 text-xs leading-5 text-slate-500">Reached privately through a VPC gateway endpoint. On-demand capacity, point-in-time recovery, and TTL deletion.</p></div>
        </div>
      </div>

      <aside class="space-y-4">
        <div class="surface-card p-6">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Capacity envelope</p>
          <div class="mt-5 space-y-6">
            <div v-for="scale in scaling" :key="scale.name">
              <div class="flex items-end justify-between"><div><p class="text-sm font-black text-slate-900">{{ scale.name }}</p><p class="text-xs text-slate-500">CPU target: 60%</p></div><p class="text-lg font-black text-slate-950">{{ scale.min }}–{{ scale.max }}</p></div>
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" :style="{ width: `${(scale.min / scale.max) * 100}%` }" /></div>
              <p class="mt-2 text-[11px] font-semibold text-slate-400">Minimum {{ scale.min }} instances always online</p>
            </div>
          </div>
        </div>

        <div class="surface-card p-6">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Data lifecycle</p>
          <div class="mt-5 space-y-4">
            <div v-for="(step, index) in dataLifecycle" :key="step.title" class="flex gap-3">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white">{{ index + 1 }}</span>
              <div><p class="text-sm font-black text-slate-900">{{ step.title }}</p><p class="mt-1 text-xs leading-5 text-slate-500">{{ step.text }}</p></div>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <section class="page-shell mt-8">
      <div class="surface-card overflow-hidden">
        <div class="border-b border-slate-100 px-6 py-6 sm:px-8">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Continuous delivery</p>
          <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-950">Independent release rails</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Client and server can ship independently without taking the other runtime offline.</p>
        </div>
        <div class="grid gap-px bg-slate-100 lg:grid-cols-2">
          <div v-for="lane in pipelines" :key="lane.name" class="bg-white p-6 sm:p-8">
            <div class="flex items-center justify-between"><div class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-2xl font-black" :class="lane.color">{{ lane.icon }}</span><div><p class="text-base font-black text-slate-950">{{ lane.name }}</p><p class="text-xs text-slate-500">CodePipeline V2</p></div></div><span class="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Rolling</span></div>
            <div class="mt-6 flex flex-wrap items-center gap-2">
              <template v-for="(stage, index) in lane.stages" :key="stage">
                <span class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">{{ stage }}</span>
                <span v-if="index < lane.stages.length - 1" class="text-slate-300">→</span>
              </template>
            </div>
            <p class="mt-5 text-xs leading-5 text-slate-500">{{ lane.detail }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="page-shell mt-8">
      <div class="grid gap-4 md:grid-cols-3">
        <article v-for="guard in security" :key="guard.title" class="surface-card p-6">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl text-lg" :class="guard.color">{{ guard.icon }}</span>
          <h3 class="mt-5 text-lg font-black text-slate-950">{{ guard.title }}</h3>
          <p class="mt-2 text-sm leading-6 text-slate-500">{{ guard.text }}</p>
        </article>
      </div>
    </section>

    <ArchitectureDetailModal :node="activeDetail" @close="activeDetail = null" />
  </div>
</template>

<script setup lang="ts">
import ArchitectureDetailModal from "~/components/ArchitectureDetailModal.vue";

type DetailId = "cloudfront" | "alb" | "nuxt" | "express" | "dynamodb";

const selectedNode = ref(0);
const activeDetail = ref<DetailId | null>(null);
const metrics = [
  { value: "2", label: "Availability zones" },
  { value: "14", label: "Max app instances" },
  { value: "7", label: "CDK stacks" },
];
const requestPath = [
  { id: "cloudfront" as DetailId, layer: "Edge", title: "CloudFront", icon: "C", color: "bg-cyan-50 text-cyan-700", caption: "Global HTTPS entry", detail: "Terminates public HTTPS and caches immutable Nuxt assets close to users.", protocol: "HTTPS :443" },
  { id: "alb" as DetailId, layer: "Web", title: "Public ALB", icon: "L", color: "bg-blue-50 text-blue-700", caption: "Health-aware routing", detail: "Balances requests only across healthy Nuxt targets in both availability zones.", protocol: "HTTP :80" },
  { id: "nuxt" as DetailId, layer: "SSR", title: "Nuxt fleet", icon: "N", color: "bg-brand-50 text-brand-700", caption: "2–8 private instances", detail: "Renders the public application and acts as the server-side facade for private API calls.", protocol: "Nitro :3000" },
  { id: "express" as DetailId, layer: "API", title: "Express core", icon: "E", color: "bg-violet-50 text-violet-700", caption: "2–6 private instances", detail: "Receives traffic through an internal ALB protected by security groups and a WAF rate rule.", protocol: "REST :4000" },
  { id: "dynamodb" as DetailId, layer: "Data", title: "DynamoDB", icon: "D", color: "bg-amber-50 text-amber-700", caption: "On-demand + TTL", detail: "Stores users and redirects with point-in-time recovery; numeric ttl values expire records asynchronously.", protocol: "AWS SDK" },
];
const zones = [{ name: "Availability Zone A" }, { name: "Availability Zone B" }];
const scaling = [{ name: "Nuxt fleet", min: 2, max: 8 }, { name: "Express fleet", min: 2, max: 6 }];
const dataLifecycle = [
  { title: "UTC intent", text: "The API keeps expiresAt as an ISO UTC string." },
  { title: "Epoch conversion", text: "The repository derives ttl in epoch seconds for the write item." },
  { title: "Managed expiry", text: "DynamoDB removes expired records asynchronously." },
];
const pipelines = [
  { name: "Client delivery", icon: "N", color: "bg-brand-50 text-brand-700", stages: ["GitHub", "Docker build", "ECR", "CodeDeploy", "CDN invalidate"], detail: "Publishes an immutable Nuxt image, replaces half the fleet at a time, then refreshes CloudFront." },
  { name: "Server delivery", icon: "E", color: "bg-violet-50 text-violet-700", stages: ["GitHub", "Docker build", "ECR", "CodeDeploy"], detail: "Publishes an immutable Express image and rolls it across half the fleet at a time with health validation and rollback." },
];
const security = [
  { title: "Private compute", icon: "◇", color: "bg-brand-50 text-brand-700", text: "Both EC2 fleets run without public IPs in private application subnets." },
  { title: "Least-access API", icon: "⌁", color: "bg-violet-50 text-violet-700", text: "The internal Express load balancer accepts network traffic from Nuxt instances only." },
  { title: "Rate guardrail", icon: "◷", color: "bg-amber-50 text-amber-700", text: "AWS WAF blocks an IP after 2,000 requests in a five-minute window." },
];

function openDetail(index: number, id: DetailId) {
  selectedNode.value = index;
  activeDetail.value = id;
}

useHead({ title: "Architecture — Linkora" });
</script>
