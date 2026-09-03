<template>
  <div class="flex-1 pb-24">
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
            <h1 class="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">How Linkora works, from edge to data.</h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">A complete technical walkthrough of the public Nuxt tier, private Express core, shared AWS platform, persistence model, security boundaries, and independent deployment paths.</p>
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

    <nav class="page-shell sticky top-16 z-40 mt-5" aria-label="Architecture sections">
      <div class="flex gap-2 overflow-x-auto rounded-2xl border border-white/70 bg-white/90 p-2 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90">
        <a v-for="item in sectionLinks" :key="item.id" :href="`#${item.id}`" class="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-slate-500 transition hover:bg-brand-50 hover:text-brand-700">
          <span class="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-700">{{ item.number }}</span>
          {{ item.label }}
        </a>
      </div>
    </nav>

    <section id="overview" class="page-shell scroll-mt-36 pt-16">
      <SectionHeading number="01" eyebrow="Overview" title="The entire platform in one path" text="Start here for the system story. A request enters through the global edge, reaches horizontally scaled Nuxt servers, crosses a private service boundary into Express, and finishes at the shared DynamoDB data plane. Select any node for a focused drill-down." />

      <div class="surface-card mt-8 overflow-hidden">
        <div class="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
          <div><p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Live request path</p><h3 class="mt-1 text-2xl font-black tracking-tight text-slate-950">Browser → edge → application → API → data</h3></div>
          <div class="flex items-center gap-2 text-xs font-bold text-slate-500"><span class="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" /> Healthy path</div>
        </div>
        <div class="overflow-hidden bg-[radial-gradient(circle_at_center,rgba(99,102,241,.07),transparent_55%)] px-5 py-8 sm:px-8 sm:py-10">
          <div class="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
            <template v-for="(node, index) in requestPath" :key="node.title">
              <button type="button" class="group relative min-h-44 rounded-3xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10" :class="selectedNode === index ? 'border-brand-300 bg-white shadow-lg shadow-brand-500/10' : 'border-slate-200 bg-white/80 hover:border-brand-200'" :aria-label="`Explore ${node.title} architecture`" @click="openDetail(index, node.id)">
                <span class="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black" :class="node.color">{{ node.icon }}</span>
                <span class="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{{ node.layer }}</span><span class="mt-1 block text-base font-black text-slate-950">{{ node.title }}</span><span class="mt-2 block text-xs leading-5 text-slate-500">{{ node.caption }}</span>
                <span class="mt-4 flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.1em] text-brand-600 opacity-70 transition group-hover:opacity-100">Explore <span aria-hidden="true">↗</span></span>
              </button>
              <div v-if="index < requestPath.length - 1" class="flex items-center justify-center text-brand-400" aria-hidden="true"><svg class="h-5 w-5 rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M5 12h14m-5-5 5 5-5 5" /></svg></div>
            </template>
          </div>
          <div class="mt-5 flex flex-col gap-3 rounded-2xl border border-brand-100 bg-brand-50/80 p-5 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
            <div><p class="text-sm font-black text-slate-950">{{ requestPath[selectedNode].title }}</p><p class="mt-1 text-sm leading-6 text-brand-800">{{ requestPath[selectedNode].detail }}</p></div>
            <span class="shrink-0 rounded-xl bg-white px-3 py-2 font-mono text-xs font-bold text-brand-700 shadow-sm">{{ requestPath[selectedNode].protocol }}</span>
          </div>
        </div>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article v-for="pillar in overviewPillars" :key="pillar.title" class="surface-card p-6"><span class="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black" :class="pillar.color">{{ pillar.icon }}</span><h3 class="mt-5 text-lg font-black text-slate-950">{{ pillar.title }}</h3><p class="mt-2 text-sm leading-6 text-slate-500">{{ pillar.text }}</p></article>
      </div>
    </section>

    <section id="hld" class="page-shell scroll-mt-36 pt-24">
      <SectionHeading number="02" eyebrow="High-level design" title="Boundaries, responsibilities, and scale" text="The HLD explains where each major component sits and why it exists. Public traffic is intentionally separated from private application and data concerns, while each runtime scales independently according to its own load." />

      <div class="mt-8">
        <ArchitectureSystemDiagram @explore="activeDetail = $event" />
      </div>

      <div class="surface-card mt-8 p-6 sm:p-8">
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">System context</p><h3 class="mt-1 text-2xl font-black tracking-tight text-slate-950">Three trust zones, one controlled route</h3></div><span class="w-fit rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">No direct browser → Express access</span></div>
        <div class="mt-7 space-y-4">
          <article v-for="zone in trustZones" :key="zone.name" class="rounded-3xl border p-5 sm:p-6" :class="zone.border">
            <div class="grid gap-5 lg:grid-cols-[13rem_1fr] lg:items-start"><div><p class="text-[10px] font-black uppercase tracking-[0.16em]" :class="zone.labelColor">{{ zone.label }}</p><h4 class="mt-2 text-lg font-black text-slate-950">{{ zone.name }}</h4><p class="mt-2 text-xs leading-5 text-slate-500">{{ zone.purpose }}</p></div><div class="grid gap-3 md:grid-cols-3"><div v-for="component in zone.components" :key="component.name" class="rounded-2xl bg-white p-4 shadow-sm"><div class="flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black" :class="component.color">{{ component.icon }}</span><p class="text-sm font-black text-slate-950">{{ component.name }}</p></div><p class="mt-3 text-xs leading-5 text-slate-500">{{ component.text }}</p></div></div></div>
          </article>
        </div>
      </div>

      <div class="surface-card mt-6 p-6 sm:p-8">
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Network topology</p><h3 class="mt-1 text-2xl font-black tracking-tight text-slate-950">Shared VPC across two availability zones</h3></div><span class="rounded-xl bg-slate-100 px-3 py-2 font-mono text-xs font-bold text-slate-500">10.20.0.0/16</span></div>
        <div class="mt-7 rounded-[1.75rem] border-2 border-dashed border-brand-200 bg-brand-50/30 p-4 sm:p-6">
          <div class="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-center"><p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Public subnets · internet-facing Nuxt ALB · one NAT gateway</p></div><div class="my-3 flex justify-center text-slate-300">↓</div>
          <div class="grid gap-4 md:grid-cols-2"><div v-for="zone in availabilityZones" :key="zone.name" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div class="flex items-center justify-between"><p class="text-sm font-black text-slate-900">{{ zone.name }}</p><span class="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600">Multi-AZ</span></div><p class="mt-1 text-[11px] text-slate-400">Public /24 + private-with-egress /24</p><div class="mt-4 space-y-3"><div class="flex items-center gap-3 rounded-xl bg-brand-50 p-3"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 font-black text-brand-700">N</span><div><p class="text-xs font-black text-slate-900">Nuxt EC2 target</p><p class="text-[11px] text-slate-500">Private subnet · no public IP</p></div></div><div class="flex items-center gap-3 rounded-xl bg-violet-50 p-3"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 font-black text-violet-700">E</span><div><p class="text-xs font-black text-slate-900">Express EC2 target</p><p class="text-[11px] text-slate-500">Private subnet · no public IP</p></div></div></div></div></div>
          <div class="my-3 flex justify-center text-slate-300">↓</div><div class="grid gap-3 md:grid-cols-2"><div class="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-center"><p class="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">Internal Express ALB · Nuxt-only private route</p></div><div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center"><p class="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">DynamoDB gateway endpoint · route-table access</p></div></div>
        </div>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="surface-card p-6 sm:p-8"><p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Independent capacity</p><h3 class="mt-1 text-xl font-black text-slate-950">Scale the bottleneck, not the whole system</h3><div class="mt-7 space-y-7"><div v-for="scale in scaling" :key="scale.name"><div class="flex items-end justify-between"><div><p class="text-sm font-black text-slate-900">{{ scale.name }}</p><p class="text-xs text-slate-500">CPU target tracking at 60%</p></div><p class="text-lg font-black text-slate-950">{{ scale.min }}–{{ scale.max }}</p></div><div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" :style="{ width: `${(scale.min / scale.max) * 100}%` }" /></div><p class="mt-2 text-[11px] font-semibold text-slate-400">At least {{ scale.min }} healthy instances remain available across the fleet.</p></div></div></div>
        <div class="surface-card p-6 sm:p-8"><p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Reliability strategy</p><h3 class="mt-1 text-xl font-black text-slate-950">Failures are contained by layer</h3><div class="mt-6 space-y-4"><div v-for="item in reliability" :key="item.title" class="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">{{ item.icon }}</span><div><p class="text-sm font-black text-slate-950">{{ item.title }}</p><p class="mt-1 text-xs leading-5 text-slate-500">{{ item.text }}</p></div></div></div></div>
      </div>
    </section>

    <section id="lld" class="page-shell scroll-mt-36 pt-24">
      <SectionHeading number="03" eyebrow="Low-level design" title="What happens inside every request" text="The LLD follows execution through concrete ports, health checks, server boundaries, data access patterns, IAM grants, and deployment mechanics. This is the implementation-level view behind the HLD boxes." />

      <div class="surface-card mt-8 overflow-hidden"><div class="border-b border-slate-100 px-6 py-6 sm:px-8"><p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Dynamic request sequence</p><h3 class="mt-1 text-2xl font-black tracking-tight text-slate-950">A redirect or API request, step by step</h3></div><div class="p-6 sm:p-8"><ol class="relative space-y-0 before:absolute before:bottom-6 before:left-[1.15rem] before:top-6 before:w-px before:bg-slate-200 sm:before:left-[1.4rem]"><li v-for="(step, index) in requestSequence" :key="step.title" class="relative grid gap-4 pb-7 last:pb-0 sm:grid-cols-[3rem_1fr_auto] sm:items-start"><span class="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white shadow-lg sm:h-12 sm:w-12">{{ String(index + 1).padStart(2, '0') }}</span><div class="pl-14 sm:pl-0"><p class="text-base font-black text-slate-950">{{ step.title }}</p><p class="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{{ step.text }}</p></div><code class="ml-14 w-fit rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 sm:ml-0">{{ step.technical }}</code></li></ol></div></div>

      <div class="mt-6 space-y-6"><article v-for="service in serviceInternals" :key="service.name" class="surface-card overflow-hidden"><div class="grid lg:grid-cols-[18rem_1fr]"><div class="p-6 sm:p-8" :class="service.panel"><span class="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black" :class="service.color">{{ service.icon }}</span><p class="mt-6 text-xs font-bold uppercase tracking-[0.16em]" :class="service.accent">{{ service.role }}</p><h3 class="mt-2 text-2xl font-black text-slate-950">{{ service.name }}</h3><p class="mt-3 text-sm leading-6 text-slate-500">{{ service.summary }}</p></div><div class="grid gap-px bg-slate-100 sm:grid-cols-2"><div v-for="unit in service.units" :key="unit.title" class="bg-white p-6"><p class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{{ unit.label }}</p><h4 class="mt-2 text-sm font-black text-slate-950">{{ unit.title }}</h4><p class="mt-2 text-xs leading-5 text-slate-500">{{ unit.text }}</p></div></div></div></article></div>

      <div class="surface-card mt-6 p-6 sm:p-8">
        <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p class="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Persistence design</p><h3 class="mt-1 text-2xl font-black tracking-tight text-slate-950">Single-table DynamoDB model</h3><p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Users, uniqueness trackers, and redirects share one physical table. Key prefixes separate item types and GSI1 supports alternate lookup paths.</p></div><button type="button" class="btn-secondary !rounded-xl !px-4 !py-2.5" @click="activeDetail = 'dynamodb'">Open ER view ↗</button></div>
        <div class="mt-7 grid gap-4 lg:grid-cols-3"><article v-for="entity in dataEntities" :key="entity.name" class="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div class="flex items-center justify-between"><h4 class="font-black text-slate-950">{{ entity.name }}</h4><span class="rounded-lg bg-white px-2 py-1 text-[10px] font-bold uppercase text-slate-500">{{ entity.kind }}</span></div><dl class="mt-4 space-y-3"><div v-for="field in entity.fields" :key="field.key" class="border-t border-slate-200 pt-3"><dt class="font-mono text-[11px] font-black text-slate-700">{{ field.key }}</dt><dd class="mt-1 text-xs text-slate-500">{{ field.value }}</dd></div></dl></article></div>
        <div class="mt-5 grid gap-4 md:grid-cols-3"><div v-for="step in dataLifecycle" :key="step.title" class="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-700">{{ step.number }}</span><div><p class="text-sm font-black text-slate-950">{{ step.title }}</p><p class="mt-1 text-xs leading-5 text-slate-500">{{ step.text }}</p></div></div></div>
      </div>

      <div class="surface-card mt-6 overflow-hidden"><div class="border-b border-slate-100 px-6 py-6 sm:px-8"><p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Continuous delivery</p><h3 class="mt-1 text-2xl font-black tracking-tight text-slate-950">Two independent Docker release rails</h3><p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Path filters prevent unrelated changes from rebuilding both applications. Each pipeline produces an immutable image, deploys through CodeDeploy, and rolls back a failed release.</p></div><div class="grid gap-px bg-slate-100 lg:grid-cols-2"><div v-for="lane in pipelines" :key="lane.name" class="bg-white p-6 sm:p-8"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-2xl font-black" :class="lane.color">{{ lane.icon }}</span><div><p class="text-base font-black text-slate-950">{{ lane.name }}</p><p class="text-xs text-slate-500">CodePipeline V2</p></div></div><span class="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Half at a time</span></div><div class="mt-6 flex flex-wrap items-center gap-2"><template v-for="(stage, index) in lane.stages" :key="stage"><span class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">{{ stage }}</span><span v-if="index < lane.stages.length - 1" class="text-slate-300">→</span></template></div><p class="mt-5 text-xs leading-5 text-slate-500">{{ lane.detail }}</p></div></div></div>

      <div class="mt-6 grid gap-4 md:grid-cols-3"><article v-for="guard in security" :key="guard.title" class="surface-card p-6"><span class="flex h-11 w-11 items-center justify-center rounded-2xl text-lg" :class="guard.color">{{ guard.icon }}</span><h3 class="mt-5 text-lg font-black text-slate-950">{{ guard.title }}</h3><p class="mt-2 text-sm leading-6 text-slate-500">{{ guard.text }}</p></article></div>
    </section>

    <section id="aws-stacks" class="page-shell scroll-mt-36 pt-24">
      <SectionHeading number="04" eyebrow="AWS stacks" title="Twelve deployable CloudFormation units" text="Infrastructure is split by lifecycle and ownership: platform stacks provide shared foundations, client stacks own the public Nuxt service, and server stacks own the private Express service. Explicit dependencies protect deployment order when resources are connected through CloudFormation exports." />
      <div class="mt-8 space-y-8">
        <article v-for="group in stackGroups" :key="group.name" class="surface-card overflow-hidden"><header class="border-b border-slate-100 p-6 sm:p-8" :class="group.header"><div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p class="text-xs font-bold uppercase tracking-[0.16em]" :class="group.accent">{{ group.label }}</p><h3 class="mt-1 text-2xl font-black text-slate-950">{{ group.name }}</h3><p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{{ group.text }}</p></div><span class="w-fit rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm">{{ group.stacks.length }} stacks</span></div></header><div class="divide-y divide-slate-100"><div v-for="(stack, index) in group.stacks" :key="stack.name" class="grid gap-5 p-6 sm:p-8 lg:grid-cols-[3rem_15rem_1fr]"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">{{ String(index + 1).padStart(2, '0') }}</span><div><p class="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">{{ stack.namespace }}</p><h4 class="mt-2 text-lg font-black text-slate-950">{{ stack.name }}</h4><p class="mt-2 text-xs leading-5 text-slate-500">{{ stack.purpose }}</p></div><div class="grid gap-3 sm:grid-cols-3"><div class="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p class="text-[10px] font-black uppercase tracking-[0.12em] text-brand-600">Creates</p><p class="mt-2 text-xs leading-5 text-slate-600">{{ stack.creates }}</p></div><div class="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p class="text-[10px] font-black uppercase tracking-[0.12em] text-violet-700">Imports / depends on</p><p class="mt-2 text-xs leading-5 text-slate-600">{{ stack.depends }}</p></div><div class="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p class="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">Key behavior</p><p class="mt-2 text-xs leading-5 text-slate-600">{{ stack.behavior }}</p></div></div></div></div></article>
      </div>
      <div class="mt-8 rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl sm:p-8"><div class="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-center"><div><p class="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Deployment order</p><h3 class="mt-2 text-2xl font-black">Foundation before workloads</h3><p class="mt-3 text-sm leading-6 text-slate-300">Platform is deployed first. Service repositories precede compute, compute precedes firewalls and CDN, and pipelines come last because they consume repository, compute, and distribution outputs.</p></div><div class="flex flex-wrap items-center gap-2 text-xs font-black"><template v-for="(step, index) in deploymentOrder" :key="step"><span class="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">{{ step }}</span><span v-if="index < deploymentOrder.length - 1" class="text-cyan-300">→</span></template></div></div></div>
    </section>

    <ArchitectureDetailModal :node="activeDetail" @close="activeDetail = null" />
  </div>
</template>

<script setup lang="ts">
import ArchitectureDetailModal from "~/components/ArchitectureDetailModal.vue";
import type { ArchitectureDetailId } from "~/types";

const selectedNode = ref(0);
const activeDetail = ref<ArchitectureDetailId | null>(null);
const sectionLinks = [{ id: "overview", number: "01", label: "Overview" }, { id: "hld", number: "02", label: "HLD" }, { id: "lld", number: "03", label: "LLD" }, { id: "aws-stacks", number: "04", label: "AWS stacks" }];
const metrics = [{ value: "2", label: "Availability zones" }, { value: "16", label: "Max app instances" }, { value: "12", label: "CDK stacks" }];

const requestPath = [
  { id: "cloudfront" as ArchitectureDetailId, layer: "Edge", title: "CloudFront", icon: "C", color: "bg-cyan-50 text-cyan-700", caption: "Global HTTPS entry and static asset cache", detail: "Redirects viewers to HTTPS, forwards dynamic routes, and caches optimized /_nuxt assets close to users.", protocol: "HTTPS :443" },
  { id: "alb" as ArchitectureDetailId, layer: "Web", title: "Public ALB", icon: "L", color: "bg-blue-50 text-blue-700", caption: "Multi-AZ, health-aware traffic routing", detail: "Balances requests across healthy Nuxt targets in both availability zones.", protocol: "HTTP :80" },
  { id: "nuxt" as ArchitectureDetailId, layer: "SSR", title: "Nuxt fleet", icon: "N", color: "bg-brand-50 text-brand-700", caption: "2–10 private EC2 instances", detail: "Renders the public application and acts as the server-side facade for calls to the private API.", protocol: "Nitro :3000" },
  { id: "express" as ArchitectureDetailId, layer: "API", title: "Express core", icon: "E", color: "bg-violet-50 text-violet-700", caption: "2–6 private EC2 instances", detail: "Runs authentication, user, and redirect use cases behind a VPC-only load balancer.", protocol: "REST :4000" },
  { id: "dynamodb" as ArchitectureDetailId, layer: "Data", title: "DynamoDB", icon: "D", color: "bg-amber-50 text-amber-700", caption: "On-demand single table with GSI and TTL", detail: "Stores users and redirects with point-in-time recovery, deletion protection, and asynchronous TTL expiry.", protocol: "AWS SDK" },
];

const overviewPillars = [
  { icon: "↗", title: "Public experience", color: "bg-cyan-50 text-cyan-700", text: "Only CloudFront and the Nuxt load balancer form the public delivery path. Application instances remain private." },
  { icon: "↔", title: "Private service call", color: "bg-violet-50 text-violet-700", text: "Nuxt reaches Express through an internal ALB; security groups allow this service-to-service path explicitly." },
  { icon: "D", title: "Private data route", color: "bg-amber-50 text-amber-700", text: "Express reaches the platform-owned DynamoDB service through a gateway endpoint attached to VPC route tables." },
  { icon: "∞", title: "Independent delivery", color: "bg-emerald-50 text-emerald-700", text: "Client and server own separate ECR repositories, compute fleets, firewalls, and CodePipeline release flows." },
];

const trustZones = [
  { label: "Zone 1 · Internet", name: "Public delivery boundary", purpose: "Accept users globally while keeping origin behavior controlled.", border: "border-cyan-200 bg-cyan-50/60", labelColor: "text-cyan-700", components: [
    { icon: "U", name: "Browser", color: "bg-white text-slate-700", text: "Loads pages, static assets, and calls same-origin Nuxt server routes." }, { icon: "C", name: "CloudFront", color: "bg-cyan-100 text-cyan-700", text: "Enforces HTTPS, applies response security headers, and caches /_nuxt assets." }, { icon: "W", name: "Client WAF", color: "bg-amber-100 text-amber-700", text: "Applies AWS common rules and a forwarded viewer-IP rate limit of 2,000 per five minutes." },
  ] },
  { label: "Zone 2 · VPC", name: "Application boundary", purpose: "Separate public rendering from private business logic and scale both independently.", border: "border-brand-200 bg-brand-50/60", labelColor: "text-brand-700", components: [
    { icon: "L", name: "Public Nuxt ALB", color: "bg-blue-50 text-blue-700", text: "Lives in public subnets and routes only to healthy Nuxt targets." }, { icon: "N", name: "Nuxt ASG", color: "bg-brand-100 text-brand-700", text: "Runs Nitro on port 3000 in private-with-egress subnets and scales from 2 to 10." }, { icon: "E", name: "Express ASG", color: "bg-violet-100 text-violet-700", text: "Runs the private API on port 4000 behind a Nuxt-only internal ALB and scales from 2 to 6." },
  ] },
  { label: "Zone 3 · Managed AWS", name: "Platform services boundary", purpose: "Keep durable data, images, logs, alerts, and delivery control outside individual instances.", border: "border-amber-200 bg-amber-50/60", labelColor: "text-amber-700", components: [
    { icon: "D", name: "DynamoDB + endpoint", color: "bg-amber-100 text-amber-700", text: "The managed table is reached privately through a gateway endpoint installed in the VPC route tables." }, { icon: "R", name: "ECR", color: "bg-red-100 text-red-700", text: "Stores scanned Docker images for Nuxt and Express in separate retained repositories." }, { icon: "O", name: "CloudWatch + SNS", color: "bg-emerald-100 text-emerald-700", text: "Centralizes application logs, dashboard visibility, and an SSL-enforced alarm topic." },
  ] },
];

const availabilityZones = [{ name: "Availability Zone A" }, { name: "Availability Zone B" }];
const scaling = [{ name: "Nuxt fleet", min: 2, max: 10 }, { name: "Express fleet", min: 2, max: 6 }];
const reliability = [
  { icon: "AZ", title: "Multi-zone placement", text: "Public and private subnets are created in two availability zones, and both target groups continuously remove unhealthy instances." },
  { icon: "AS", title: "Self-healing fleets", text: "Auto Scaling replaces failed EC2 instances and CPU target tracking adjusts fleet size without coupling client and server capacity." },
  { icon: "RB", title: "Release rollback", text: "CodeDeploy updates half the tagged fleet at a time and automatically rolls back failed or manually stopped deployments." },
  { icon: "DR", title: "Protected persistence", text: "DynamoDB uses point-in-time recovery, deletion protection, a RETAIN removal policy, and AWS-managed encryption." },
];

const requestSequence = [
  { title: "Viewer opens Linkora", text: "The browser resolves the CloudFront domain and connects using HTTPS at the nearest edge location.", technical: "HTTPS :443" },
  { title: "CloudFront chooses a behavior", text: "Immutable /_nuxt assets use optimized caching; dynamic SSR and API-facing routes forward all viewer context to the origin.", technical: "/_nuxt/* | default" },
  { title: "The public ALB evaluates health", text: "The internet-facing listener selects a healthy Nuxt target. Root-path health checks accept HTTP 200–399 every 30 seconds.", technical: "ALB :80 → :3000" },
  { title: "Nitro renders or brokers", text: "Nuxt renders the page or handles a server API route. Session cookies stay at the server boundary instead of exposing credentials to browser JavaScript.", technical: "Nuxt/Nitro" },
  { title: "Nuxt enters the private API path", text: "The Nuxt Auto Scaling Group is explicitly allowed to reach the internal Express load balancer; outside clients cannot route to it.", technical: "Internal ALB :80" },
  { title: "Express runs the use case", text: "Middleware establishes request context, authenticates, validates input, and dispatches the user, auth, or redirect service.", technical: "Express :4000" },
  { title: "Repository maps the operation", text: "The infrastructure adapter converts the domain operation into DynamoDB PK/SK and GSI1 access patterns and derives ttl only in the write item.", technical: "AWS SDK" },
  { title: "Response returns through the same boundaries", text: "Express responds to Nuxt, Nuxt forms the public response, the ALB returns it to CloudFront, and the edge sends it to the viewer.", technical: "JSON / HTML" },
];

const serviceInternals = [
  { name: "Nuxt application", role: "Public server-side facade", icon: "N", panel: "bg-brand-50/60", color: "bg-brand-100 text-brand-700", accent: "text-brand-700", summary: "Owns rendering and browser-facing behavior while shielding private services from direct internet access.", units: [
    { label: "Presentation", title: "Vue pages and components", text: "Render the home, login, dashboard, and interactive architecture experiences." }, { label: "State", title: "Pinia user store", text: "Coordinates authenticated client state and calls same-origin Nuxt server endpoints." }, { label: "Server boundary", title: "Nitro API handlers", text: "Forward requests to the private API and manage HTTP-only cookie behavior." }, { label: "Runtime", title: "Docker on EC2", text: "A launch template boots Amazon Linux 2023, pulls from ECR, and runs the image on port 3000." },
  ] },
  { name: "Express service", role: "Private business core", icon: "E", panel: "bg-violet-50/60", color: "bg-violet-100 text-violet-700", accent: "text-violet-700", summary: "Owns authentication, user, and redirect rules, with infrastructure concerns kept behind adapters.", units: [
    { label: "Transport", title: "Routes and middleware", text: "Parse requests, attach authentication context, validate inputs, and translate failures into HTTP responses." }, { label: "Application", title: "Use-case services", text: "Coordinate login, logout, users, and redirects without depending directly on transport code." }, { label: "Infrastructure", title: "DynamoDB and JWT packages", text: "Implement persistence and token behavior behind package-level configuration and interfaces." }, { label: "Runtime", title: "Secret-backed Docker process", text: "EC2 reads the runtime secret, receives scoped DynamoDB and log permissions, and runs the API on port 4000." },
  ] },
];

const dataEntities = [
  { name: "User", kind: "Profile", fields: [{ key: "PK / SK", value: "USER#{id} / META" }, { key: "GSI1", value: "EMAIL#{email} / META" }, { key: "Attributes", value: "name, email, passwordHash, isVerified" }] },
  { name: "Email tracker", kind: "Unique lock", fields: [{ key: "PK / SK", value: "EMAIL#{email} / TRACKER" }, { key: "Reference", value: "userId points back to the owning user" }, { key: "Purpose", value: "Reserves a normalized email independently" }] },
  { name: "Redirect", kind: "Aggregate", fields: [{ key: "PK / SK", value: "REDIRECT#{id} / META" }, { key: "GSI1", value: "AUTHOR#{userId} / DATE#{createdAt}" }, { key: "Expiry", value: "expiresAt domain string + optional ttl write field" }] },
];
const dataLifecycle = [{ number: "1", title: "UTC domain intent", text: "expiresAt remains an ISO UTC string used by application logic." }, { number: "2", title: "Write-item conversion", text: "The repository adds ttl in epoch seconds only to the DynamoDB item parameters." }, { number: "3", title: "Managed cleanup", text: "DynamoDB detects the ttl attribute and removes expired records asynchronously." }];
const pipelines = [
  { name: "Client delivery", icon: "N", color: "bg-brand-50 text-brand-700", stages: ["GitHub", "CodeBuild", "ECR", "CodeDeploy", "CDN invalidate"], detail: "Builds client/Dockerfile, pushes commit-specific and current tags, deploys to tagged Nuxt instances, validates the process, and invalidates CloudFront paths." },
  { name: "Server delivery", icon: "E", color: "bg-violet-50 text-violet-700", stages: ["GitHub", "CodeBuild", "ECR", "CodeDeploy"], detail: "Runs the server build asset, publishes the Express image and deployment bundle, then updates tagged API instances with health validation." },
];
const security = [
  { title: "Private compute", icon: "◇", color: "bg-brand-50 text-brand-700", text: "Both EC2 fleets run in private-with-egress subnets, require IMDSv2, and use SSM rather than public management access." },
  { title: "Least-access API", icon: "⌁", color: "bg-violet-50 text-violet-700", text: "The internal Express ALB is not internet-facing. Its network path is opened specifically from the Nuxt Auto Scaling Group." },
  { title: "Layered WAF rules", icon: "◷", color: "bg-amber-50 text-amber-700", text: "Client and server ALBs each receive AWS managed common rules plus rate-based blocking: 2,000 and 1,000 requests per five minutes respectively." },
];

const stackGroups = [
  { label: "Shared foundation", name: "Platform stacks", header: "bg-emerald-50/40", accent: "text-emerald-700", text: "Environment-wide resources are provisioned once and imported by application services through named CloudFormation outputs.", stacks: [
    { name: "NetworkStack", namespace: "urlshortner-{env}-network", purpose: "Creates the regional network shared by Nuxt and Express.", creates: "VPC, two public /24 subnets, two private-with-egress /24 subnets, route tables, one NAT gateway, and a DynamoDB gateway endpoint.", depends: "No application stack. This is the first infrastructure foundation.", behavior: "Exports VPC, subnet, and route-table IDs; the gateway endpoint keeps DynamoDB traffic on the AWS private network." },
    { name: "DataStack", namespace: "urlshortner-{env}-data", purpose: "Owns durable application data independently from compute lifecycles.", creates: "One PAY_PER_REQUEST DynamoDB table with PK/SK, GSI1, AWS-managed encryption, ttl, PITR, and deletion protection.", depends: "Express imports its table ARN and reaches the service through the platform VPC gateway endpoint.", behavior: "RETAIN prevents stack deletion from destroying data; TTL performs asynchronous expiry without changing the domain model." },
    { name: "ObservabilityStack", namespace: "urlshortner-{env}-observability", purpose: "Provides shared operational visibility and alert transport.", creates: "CloudWatch dashboard, one-month retained application log group, and an SSL-enforced SNS alarm topic.", depends: "Independent foundation. Both compute stacks import the shared log group.", behavior: "Exports log identifiers for service IAM grants while dashboard and topic remain environment-level resources." },
  ] },
  { label: "Public application", name: "Client / Nuxt stacks", header: "bg-brand-50/40", accent: "text-brand-700", text: "The client owns the internet-facing delivery layer and can release independently from the private API.", stacks: [
    { name: "RepositoryStack", namespace: "urlshortner-{env}-client-repository", purpose: "Stores deployable Nuxt container images.", creates: "AES-256 ECR repository with scan-on-push, retained contents, and a 50-image lifecycle limit.", depends: "Independent service foundation; compute pulls and CodeBuild pushes.", behavior: "Repository survives routine stack removal and keeps recent build history without unbounded image growth." },
    { name: "ComputeStack", namespace: "urlshortner-{env}-client-compute", purpose: "Runs the public server-rendered application at horizontal scale.", creates: "Launch template, IAM role, security group, 2–10 EC2 ASG, CPU scaling policy, public ALB, listener, target group, and health check.", depends: "Imports platform VPC/log group, client ECR, and the server ALB; depends explicitly on the client repository.", behavior: "Grants image pull, log writes, SSM access, and the Nuxt-to-Express network path. Targets run on port 3000." },
    { name: "FirewallStack", namespace: "urlshortner-{env}-client-firewall", purpose: "Protects the public Nuxt load balancer.", creates: "Regional WAF Web ACL, ALB association, forwarded-IP rate rule, and AWS common managed rule group.", depends: "Imports the client ALB ARN and explicitly depends on Client ComputeStack.", behavior: "Blocks a viewer IP after 2,000 requests in five minutes while recording metrics and sampled requests." },
    { name: "CdnStack", namespace: "urlshortner-{env}-client-cdn", purpose: "Provides the global public edge for the application.", creates: "CloudFront distribution with HTTP/2 and HTTP/3, compression, security headers, dynamic and /_nuxt cache behaviors.", depends: "Uses the public Nuxt ALB DNS as its HTTP origin and depends on Client ComputeStack.", behavior: "Redirects viewers to HTTPS, disables dynamic caching, and applies optimized caching only to immutable Nuxt assets." },
    { name: "PipelineStack", namespace: "urlshortner-{env}-client-pipeline", purpose: "Builds and rolls out Nuxt releases.", creates: "CodePipeline V2, CodeStar source action, privileged CodeBuild project, CodeDeploy application/group, artifact bucket, and CDN invalidation project.", depends: "Depends on client Repository, Compute, and CDN stacks; consumes ECR, instance role, and distribution outputs.", behavior: "Path-filtered Docker delivery updates half the fleet at a time, auto-rolls back failures, then invalidates CloudFront." },
  ] },
  { label: "Private service", name: "Server / Express stacks", header: "bg-violet-50/40", accent: "text-violet-700", text: "The API owns business workflows and persistence access without exposing its compute or load balancer to the public internet.", stacks: [
    { name: "RepositoryStack", namespace: "urlshortner-{env}-server-repository", purpose: "Stores deployable Express container images.", creates: "AES-256 ECR repository with scan-on-push, retained contents, and a 50-image lifecycle limit.", depends: "Independent service foundation; server compute pulls and server CodeBuild pushes.", behavior: "Separates backend image history and lifecycle from the Nuxt application." },
    { name: "ComputeStack", namespace: "urlshortner-{env}-server-compute", purpose: "Runs private business logic behind an internal endpoint.", creates: "Launch template, IAM role, security group, 2–6 EC2 ASG, CPU scaling, internal ALB, listener, target group, and /health check.", depends: "Imports platform VPC, DynamoDB, logs, server ECR, and reads a named Secrets Manager runtime secret.", behavior: "Grants DynamoDB read/write, ECR pull, CloudWatch writes, secret read, and SSM access. API targets run on port 4000." },
    { name: "FirewallStack", namespace: "urlshortner-{env}-server-firewall", purpose: "Adds request controls at the private API load balancer.", creates: "Regional WAF Web ACL, internal ALB association, source-IP rate rule, and AWS common managed rules.", depends: "Imports the server ALB ARN and explicitly depends on Server ComputeStack.", behavior: "Blocks an IP after 1,000 requests in five minutes and publishes WAF metrics and request samples." },
    { name: "PipelineStack", namespace: "urlshortner-{env}-server-pipeline", purpose: "Builds and safely rolls out Express releases.", creates: "CodePipeline V2, CodeStar source action, CodeBuild project, CodeDeploy application/group, and artifact bucket.", depends: "Depends on Server Repository and Compute stacks and consumes ECR and instance-role outputs.", behavior: "Server-path-filtered builds deploy half the fleet at a time with failed/stopped deployment rollback." },
  ] },
];

const deploymentOrder = ["Platform: network/data/observability", "Service repositories", "Server compute", "Client compute", "Firewalls + CDN", "Pipelines"];

function openDetail(index: number, id: ArchitectureDetailId) { selectedNode.value = index; activeDetail.value = id; }
useHead({ title: "Architecture — Linkora" });
</script>
