<!-- Interactive architecture drill-downs keep the overview page compact while exposing implementation detail. -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="activeDetail"
        class="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`${activeDetail.id}-detail-title`"
        @click.self="emit('close')"
      >
        <div class="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-t-[2rem] bg-slate-50 shadow-2xl sm:max-h-[90vh] sm:rounded-[2rem]">
          <header class="sticky top-0 z-20 flex items-start justify-between gap-5 border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur sm:px-8">
            <div class="flex min-w-0 items-start gap-4">
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black" :class="activeDetail.color">{{ activeDetail.icon }}</span>
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">{{ activeDetail.eyebrow }}</p>
                <h2 :id="`${activeDetail.id}-detail-title`" class="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{{ activeDetail.title }}</h2>
                <p class="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{{ activeDetail.summary }}</p>
              </div>
            </div>
            <button type="button" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-500 transition hover:border-slate-300 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-brand-500/10" aria-label="Close architecture details" @click="emit('close')">×</button>
          </header>

          <div class="p-5 sm:p-8">
            <!-- DynamoDB uses an entity/access-pattern diagram because the application uses one physical table. -->
            <template v-if="activeDetail.id === 'dynamodb'">
              <div class="rounded-[1.75rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 sm:p-7">
                <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <p class="text-xs font-bold uppercase tracking-[0.15em] text-amber-700">Single-table entity map</p>
                    <h3 class="mt-1 text-xl font-black text-slate-950">One table, three item shapes</h3>
                  </div>
                  <span class="w-fit rounded-xl border border-amber-200 bg-white px-3 py-2 font-mono text-xs font-bold text-amber-800">PK + SK · GSI1PK + GSI1SK</span>
                </div>

                <div class="mt-7 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
                  <template v-for="(entity, index) in entities" :key="entity.name">
                    <article class="h-full rounded-2xl border bg-white p-5 shadow-sm" :class="entity.border">
                      <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black" :class="entity.color">{{ entity.icon }}</span><h4 class="font-black text-slate-950">{{ entity.name }}</h4></div>
                        <span class="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{{ entity.cardinality }}</span>
                      </div>
                      <div class="mt-4 space-y-2">
                        <div v-for="field in entity.fields" :key="field.name" class="flex items-start justify-between gap-3 border-t border-slate-100 pt-2 text-xs">
                          <span class="font-mono font-bold text-slate-700">{{ field.name }}</span>
                          <span class="text-right text-slate-400">{{ field.value }}</span>
                        </div>
                      </div>
                    </article>
                    <div v-if="index < entities.length - 1" class="flex flex-col items-center justify-center text-center text-amber-600">
                      <span class="hidden text-xl lg:block">→</span><span class="text-xl lg:hidden">↓</span>
                      <span class="mt-1 text-[10px] font-black uppercase tracking-wide">{{ relations[index] }}</span>
                    </div>
                  </template>
                </div>
              </div>

              <div class="mt-5 grid gap-4 md:grid-cols-3">
                <article v-for="pattern in accessPatterns" :key="pattern.title" class="rounded-2xl border border-slate-200 bg-white p-5">
                  <p class="text-xs font-bold uppercase tracking-[0.12em] text-brand-600">{{ pattern.label }}</p>
                  <h4 class="mt-2 text-sm font-black text-slate-950">{{ pattern.title }}</h4>
                  <p class="mt-2 font-mono text-xs leading-5 text-slate-500">{{ pattern.key }}</p>
                </article>
              </div>

              <div class="mt-5 flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-black text-emerald-700">T</span>
                <div><p class="text-sm font-black text-slate-950">TTL is persistence-only</p><p class="mt-1 text-sm leading-6 text-slate-600"><code>expiresAt</code> remains an ISO UTC string in the domain object. The repository derives numeric epoch-seconds <code>ttl</code> only inside the DynamoDB write item, and DynamoDB removes it asynchronously.</p></div>
              </div>
            </template>

            <!-- All runtime layers share a readable request-flow presentation. -->
            <template v-else>
              <div class="rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-7">
                <p class="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">Inside this layer</p>
                <div class="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
                  <template v-for="(step, index) in activeDetail.flow" :key="step.title">
                    <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">0{{ index + 1 }}</span>
                      <h3 class="mt-3 text-sm font-black text-slate-950">{{ step.title }}</h3>
                      <p class="mt-2 text-xs leading-5 text-slate-500">{{ step.text }}</p>
                    </article>
                    <div v-if="index < activeDetail.flow.length - 1" class="flex items-center justify-center text-brand-400" aria-hidden="true"><span class="rotate-90 text-xl lg:rotate-0">→</span></div>
                  </template>
                </div>
              </div>

              <div class="mt-5 grid gap-4 md:grid-cols-3">
                <article v-for="fact in activeDetail.facts" :key="fact.label" class="rounded-2xl border border-slate-200 bg-white p-5">
                  <p class="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">{{ fact.label }}</p>
                  <p class="mt-2 text-base font-black text-slate-950">{{ fact.value }}</p>
                  <p class="mt-2 text-xs leading-5 text-slate-500">{{ fact.text }}</p>
                </article>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type DetailId = "cloudfront" | "alb" | "nuxt" | "express" | "dynamodb";

interface ArchitectureDetail {
  id: DetailId;
  eyebrow: string;
  title: string;
  summary: string;
  icon: string;
  color: string;
  flow: Array<{ title: string; text: string }>;
  facts: Array<{ label: string; value: string; text: string }>;
}

const props = defineProps<{ node: DetailId | null }>();
const emit = defineEmits<{ close: [] }>();

const details: Record<DetailId, ArchitectureDetail> = {
  cloudfront: {
    id: "cloudfront", eyebrow: "Edge delivery", title: "CloudFront distribution", icon: "C", color: "bg-cyan-50 text-cyan-700",
    summary: "The global front door serves immutable client assets quickly while forwarding dynamic SSR requests to the public application load balancer.",
    flow: [
      { title: "Viewer request", text: "A browser connects over public HTTPS at the nearest edge location." },
      { title: "Behavior match", text: "CloudFront separates immutable /_nuxt assets from dynamic application routes." },
      { title: "Origin fetch", text: "Cache misses and SSR traffic are forwarded to the public Nuxt ALB." },
      { title: "Edge response", text: "Cacheable assets stay close to users; dynamic responses return immediately." },
    ],
    facts: [
      { label: "Public protocol", value: "HTTPS :443", text: "The only globally exposed application entry point." },
      { label: "Origin", value: "Nuxt public ALB", text: "The Express service is never configured as an edge origin." },
      { label: "Release hook", value: "CDN invalidation", text: "The client pipeline refreshes stale assets after deployment." },
    ],
  },
  alb: {
    id: "alb", eyebrow: "Public traffic", title: "Nuxt application load balancer", icon: "L", color: "bg-blue-50 text-blue-700",
    summary: "A multi-zone public load balancer is the stable origin for CloudFront and distributes requests only to healthy Nuxt instances.",
    flow: [
      { title: "Listener", text: "The public listener accepts traffic forwarded by the CloudFront distribution." },
      { title: "Target group", text: "Health state and routing rules select an available target." },
      { title: "Zone balancing", text: "Traffic is spread across private application subnets in both zones." },
      { title: "Nuxt target", text: "The chosen EC2 instance receives the request on the Nitro server port." },
    ],
    facts: [
      { label: "Targets", value: "Nuxt EC2 only", text: "Express instances belong to a separate internal load balancer." },
      { label: "Application port", value: "HTTP :3000", text: "Security-group rules constrain traffic to the expected path." },
      { label: "Availability", value: "2 zones", text: "Unhealthy targets are removed from request routing." },
    ],
  },
  nuxt: {
    id: "nuxt", eyebrow: "Public application", title: "Nuxt server fleet", icon: "N", color: "bg-brand-50 text-brand-700",
    summary: "Nuxt renders the public experience and provides the server-side boundary that brokers browser requests to the private Express API.",
    flow: [
      { title: "Page route", text: "Vue pages and layouts render the interactive browser experience." },
      { title: "Nitro server", text: "SSR and server API handlers run inside the standalone Nuxt process." },
      { title: "Auth boundary", text: "HTTP-only session cookies stay server-readable and are not exposed to client JavaScript." },
      { title: "Private gateway", text: "Nitro calls the internal Express load balancer from inside the shared VPC." },
    ],
    facts: [
      { label: "Fleet size", value: "2–8 instances", text: "CPU target tracking scales horizontally while keeping two nodes online." },
      { label: "Network", value: "Private subnets", text: "Instances have no public IP; only the load balancer is public." },
      { label: "Deployment", value: "ECR → CodeDeploy", text: "Each immutable Nuxt image rolls across half the fleet at a time." },
    ],
  },
  express: {
    id: "express", eyebrow: "Private service", title: "Express application core", icon: "E", color: "bg-violet-50 text-violet-700",
    summary: "The API owns authentication, users, and redirects behind an internal load balancer that only the Nuxt tier can reach.",
    flow: [
      { title: "Internal ALB", text: "Requests arrive from Nuxt through the VPC-only service endpoint." },
      { title: "Middleware", text: "Request context, authentication, validation, and rate controls run first." },
      { title: "Use cases", text: "Domain services execute login, logout, user, and redirect workflows." },
      { title: "Repository", text: "Infrastructure adapters persist and query single-table DynamoDB items." },
    ],
    facts: [
      { label: "Fleet size", value: "2–6 instances", text: "The service scales separately from the public rendering tier." },
      { label: "Application port", value: "REST :4000", text: "The security group allows ingress from the Nuxt tier only." },
      { label: "Rate limit", value: "2,000 / 5 min", text: "A WAF IP rule protects the internal load-balancer request path." },
      { label: "Deployment", value: "ECR → CodeDeploy", text: "Each immutable Docker image rolls across half the fleet at a time." },
    ],
  },
  dynamodb: {
    id: "dynamodb", eyebrow: "Data model", title: "DynamoDB entity & access map", icon: "D", color: "bg-amber-50 text-amber-700",
    summary: "The API stores users, email uniqueness trackers, and redirects as distinct item shapes in one on-demand DynamoDB table.", flow: [], facts: [],
  },
};

const entities = [
  { name: "User", icon: "U", cardinality: "profile", color: "bg-brand-50 text-brand-700", border: "border-brand-200", fields: [
    { name: "pk", value: "USER#{id}" }, { name: "sk", value: "META" }, { name: "gsi1pk", value: "EMAIL#{email}" }, { name: "gsi1sk", value: "META" }, { name: "attributes", value: "name · email · passwordHash · isVerfied" },
  ] },
  { name: "Email tracker", icon: "@", cardinality: "1 : 1", color: "bg-cyan-50 text-cyan-700", border: "border-cyan-200", fields: [
    { name: "pk", value: "EMAIL#{email}" }, { name: "sk", value: "TRACKER" }, { name: "userId", value: "User.id" },
  ] },
  { name: "Redirect", icon: "R", cardinality: "1 : many", color: "bg-amber-50 text-amber-700", border: "border-amber-200", fields: [
    { name: "pk", value: "REDIRECT#{id}" }, { name: "sk", value: "META" }, { name: "gsi1pk", value: "AUTHOR#{userId}" }, { name: "gsi1sk", value: "DATE#{createdAt}" }, { name: "attributes", value: "origin · expiresAt · ttl?" },
  ] },
];
const relations = ["reserves email", "user owns"];
const accessPatterns = [
  { label: "Primary key", title: "Resolve a short redirect", key: "PK = REDIRECT#{id} · SK = META" },
  { label: "Global index", title: "Find a user by email", key: "GSI1PK = EMAIL#{email}" },
  { label: "Global index", title: "List a user's redirects", key: "GSI1PK = AUTHOR#{userId} · sort by DATE" },
];

const activeDetail = computed(() => props.node ? details[props.node] : null);

function handleEscape(event: KeyboardEvent) {
  if (event.key === "Escape" && props.node) emit("close");
}

watch(() => props.node, (node) => {
  if (!import.meta.client) return;
  document.body.style.overflow = node ? "hidden" : "";
});
onMounted(() => window.addEventListener("keydown", handleEscape));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEscape);
  document.body.style.overflow = "";
});
</script>
