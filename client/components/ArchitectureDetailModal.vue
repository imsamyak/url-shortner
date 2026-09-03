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
            <div class="mb-5 grid gap-4 lg:grid-cols-2">
              <article class="rounded-2xl border border-brand-200 bg-brand-50 p-5">
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Why Linkora needs it</p>
                <p class="mt-2 text-sm leading-6 text-slate-700">{{ activeDetail.why }}</p>
              </article>
              <article class="rounded-2xl border border-slate-200 bg-white p-5">
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Design decision &amp; trade-off</p>
                <p class="mt-2 text-sm leading-6 text-slate-700">{{ activeDetail.decision }}</p>
              </article>
            </div>

            <!-- DynamoDB uses an entity/access-pattern diagram because the application uses one physical table. -->
            <template v-if="activeDetail.id === 'dynamodb'">
              <div class="rounded-[1.75rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 dark:from-amber-950/30 dark:to-slate-900 sm:p-7">
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
import type { ArchitectureDetailId } from "~/types";

interface ArchitectureDetail {
  id: ArchitectureDetailId;
  eyebrow: string;
  title: string;
  summary: string;
  icon: string;
  color: string;
  why: string;
  decision: string;
  flow: Array<{ title: string; text: string }>;
  facts: Array<{ label: string; value: string; text: string }>;
}

const props = defineProps<{ node: ArchitectureDetailId | null }>();
const emit = defineEmits<{ close: [] }>();

const details: Record<ArchitectureDetailId, ArchitectureDetail> = {
  cloudfront: {
    id: "cloudfront", eyebrow: "Edge delivery", title: "CloudFront distribution", icon: "C", color: "bg-cyan-50 text-cyan-700",
    summary: "The global front door serves immutable client assets quickly while forwarding dynamic SSR requests to the public application load balancer.",
    why: "It gives every user a nearby HTTPS entry point and prevents repeated downloads of versioned client assets from reaching the EC2 fleet.",
    decision: "Dynamic SSR and API-facing routes are not cached. Only immutable Nuxt assets receive long-lived edge caching, avoiding stale personalized responses.",
    flow: [
      { title: "Viewer request", text: "A browser connects over public HTTPS at the nearest edge location." },
      { title: "Behavior match", text: "CloudFront separates immutable /_nuxt assets from dynamic application routes." },
      { title: "Origin fetch", text: "Cache misses and SSR traffic are forwarded to the public Nuxt ALB." },
      { title: "Edge response", text: "Cacheable assets stay close to users; dynamic responses return immediately." },
    ],
    facts: [
      { label: "Viewer protocol", value: "HTTPS :443", text: "The intended global entry point for application traffic." },
      { label: "Origin", value: "Nuxt public ALB", text: "The Express service is never configured as an edge origin." },
      { label: "Release hook", value: "CDN invalidation", text: "The client pipeline refreshes stale assets after deployment." },
    ],
  },
  alb: {
    id: "alb", eyebrow: "Public traffic", title: "Nuxt application load balancer", icon: "L", color: "bg-blue-50 text-blue-700",
    summary: "A multi-zone public load balancer is the stable origin for CloudFront and distributes requests only to healthy Nuxt instances.",
    why: "The fleet's private IP addresses change as instances scale and deploy. The ALB provides one durable endpoint and removes unhealthy instances from rotation.",
    decision: "The ALB is public while every Nuxt instance stays private. CloudFront is the intended front door; direct ALB reachability can later be restricted with origin controls.",
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
  vpc: {
    id: "vpc", eyebrow: "Network boundary", title: "Shared application VPC", icon: "V", color: "bg-emerald-50 text-emerald-700",
    summary: "A two-AZ network contains both compute fleets, their load balancers, security groups, and private routes to AWS services.",
    why: "Nuxt and Express need controlled, low-latency private communication while public ingress remains limited to the Nuxt load balancer.",
    decision: "The current /16 VPC uses public and private-with-egress subnets across two zones with one NAT gateway. One NAT is economical, but it is a cross-zone dependency during an AZ failure.",
    flow: [
      { title: "Public edge", text: "CloudFront reaches the internet-facing Nuxt ALB in public subnets." },
      { title: "Private compute", text: "Nuxt and Express instances run without public IP addresses." },
      { title: "Service path", text: "Nuxt reaches Express through an internal ALB and security-group references." },
      { title: "AWS access", text: "Endpoint routes reach DynamoDB; remaining outbound traffic uses NAT." },
    ],
    facts: [
      { label: "Address space", value: "10.20.0.0/16", text: "Leaves room for multiple application services and subnet tiers." },
      { label: "Availability", value: "2 AZs", text: "Load balancers and Auto Scaling groups span both zones." },
      { label: "Outbound", value: "1 NAT gateway", text: "A conscious development-stage cost and resilience trade-off." },
    ],
  },
  waf: {
    id: "waf", eyebrow: "Edge protection", title: "AWS WAF web ACL", icon: "W", color: "bg-red-50 text-red-700",
    summary: "Regional web ACL rules inspect HTTP requests before they are forwarded through an application load balancer.",
    why: "Common exploit traffic and abusive request bursts should be rejected before consuming application capacity.",
    decision: "Managed common rules and IP-based rate limits provide a first filter, not complete security. Authentication, authorization, and input validation still run in the application.",
    flow: [
      { title: "Request arrives", text: "The request reaches the ALB-associated regional web ACL." },
      { title: "Managed rules", text: "AWS CommonRuleSet checks broadly known web exploit patterns." },
      { title: "Rate rule", text: "Requests are counted by source IP over a rolling five-minute window." },
      { title: "Allow or block", text: "Accepted traffic continues to the ALB; matched traffic stops here." },
    ],
    facts: [
      { label: "Nuxt threshold", value: "2,000 / 5 min", text: "Protects the public application entry path." },
      { label: "Express threshold", value: "1,000 / 5 min", text: "A stricter policy is defined for the service load balancer." },
      { label: "Scope", value: "Regional", text: "These ACLs attach to ALBs, rather than the CloudFront global scope." },
    ],
  },
  "internal-alb": {
    id: "internal-alb", eyebrow: "Private service discovery", title: "Internal Express load balancer", icon: "L", color: "bg-violet-50 text-violet-700",
    summary: "A VPC-only load balancer gives Nuxt a stable Express endpoint while distributing work across a changing API fleet.",
    why: "Auto Scaling replaces instances and changes private addresses. Nuxt needs one health-aware address that survives those changes.",
    decision: "A second ALB has a fixed cost, but earns its place by preserving a private boundary and allowing Nuxt and Express to scale and deploy independently.",
    flow: [
      { title: "Private DNS", text: "Nuxt resolves the internal ALB DNS name from inside the VPC." },
      { title: "Security group", text: "The listener accepts traffic from the Nuxt application tier only." },
      { title: "Health routing", text: "The target group continuously checks each Express /health endpoint." },
      { title: "Express target", text: "A healthy private instance receives the request on port 4000." },
    ],
    facts: [
      { label: "Exposure", value: "VPC only", text: "There is no independent public route to Express." },
      { label: "Listener", value: "HTTP :80", text: "Traffic remains on the private VPC network before target forwarding." },
      { label: "Targets", value: "Express :4000", text: "Target membership changes automatically with the fleet." },
    ],
  },
  "ddb-endpoint": {
    id: "ddb-endpoint", eyebrow: "Private AWS routing", title: "DynamoDB gateway endpoint", icon: "↗", color: "bg-amber-50 text-amber-700",
    summary: "The endpoint adds DynamoDB-specific routes to selected VPC route tables without creating an ENI or placing DynamoDB inside the VPC.",
    why: "Express can reach DynamoDB without sending requests through a NAT gateway or the public internet, reducing cost and simplifying the network path.",
    decision: "Routing and authorization are separate controls. The endpoint makes the path private; IAM policies authorize operations. An endpoint policy or aws:SourceVpce condition can tighten it further.",
    flow: [
      { title: "SDK request", text: "Express signs a normal DynamoDB API request with its instance role." },
      { title: "Route match", text: "The subnet route table matches DynamoDB's AWS-managed prefix list." },
      { title: "Gateway endpoint", text: "AWS carries the request privately to the regional DynamoDB service." },
      { title: "IAM evaluation", text: "DynamoDB permits or rejects the requested table operation." },
    ],
    facts: [
      { label: "Endpoint type", value: "Gateway", text: "It modifies routes and does not create private ENIs." },
      { label: "NAT usage", value: "None for DynamoDB", text: "DynamoDB traffic avoids NAT processing charges." },
      { label: "Security", value: "IAM + policies", text: "Having a network route alone never grants table access." },
    ],
  },
  nuxt: {
    id: "nuxt", eyebrow: "Public application", title: "Nuxt server fleet", icon: "N", color: "bg-brand-50 text-brand-700",
    summary: "Nuxt renders the public experience and brokers browser requests to Express through the dedicated VPC-only ALB.",
    why: "It combines the browser UI, server-side rendering, and a backend-for-frontend boundary that keeps internal service addresses and HTTP-only cookies away from browser code.",
    decision: "The extra Nuxt-to-Express hop costs some latency, but it produces a cleaner public boundary and lets the UI and API fleets scale independently.",
    flow: [
      { title: "Page route", text: "Vue pages and layouts render the interactive browser experience." },
      { title: "Nitro server", text: "SSR and server API handlers run inside the standalone Nuxt process." },
      { title: "Auth boundary", text: "HTTP-only session cookies stay server-readable and are not exposed to client JavaScript." },
      { title: "Private gateway", text: "Nitro calls the internal Express load balancer from inside the shared VPC, never the public API route." },
    ],
    facts: [
      { label: "Fleet size", value: "2–10 instances", text: "CPU target tracking scales horizontally while keeping two nodes online." },
      { label: "Network", value: "Private subnets", text: "Instances have no public IP; only the load balancer is public." },
      { label: "Deployment", value: "ECR → CodeDeploy", text: "Each immutable Nuxt image rolls across half the fleet at a time." },
    ],
  },
  express: {
    id: "express", eyebrow: "Private service", title: "Express application core", icon: "E", color: "bg-violet-50 text-violet-700",
    summary: "The API owns authentication, users, and redirects behind an internal load balancer that only the Nuxt tier can reach.",
    why: "Business rules and persistence stay in one private service boundary instead of being duplicated in Nuxt handlers or exposed directly to the internet.",
    decision: "Keeping Express private reduces attack surface but means every public API interaction must pass through Nuxt. That is intentional for this deployment.",
    flow: [
      { title: "Internal ALB", text: "Requests arrive from Nuxt through the VPC-only service endpoint." },
      { title: "Middleware", text: "Request context, authentication, validation, and rate controls run first." },
      { title: "Use cases", text: "Domain services execute login, logout, user, and redirect workflows." },
      { title: "Repository", text: "Infrastructure adapters persist and query single-table DynamoDB items." },
    ],
    facts: [
      { label: "Fleet size", value: "2–6 instances", text: "The service scales separately from the public rendering tier." },
      { label: "Application port", value: "REST :4000", text: "The security group allows ingress from the internal load balancer only." },
      { label: "Rate limit", value: "1,000 / 5 min", text: "A WAF IP rule protects the internal load-balancer request path." },
      { label: "Deployment", value: "ECR → CodeDeploy", text: "Each immutable Docker image rolls across half the fleet at a time." },
    ],
  },
  pipeline: {
    id: "pipeline", eyebrow: "Continuous delivery", title: "Service delivery pipelines", icon: "P", color: "bg-sky-50 text-sky-700",
    summary: "Independent CodePipeline workflows turn repository changes into tested Docker artifacts and controlled EC2 deployments.",
    why: "A repeatable release path prevents manual server drift and allows the client and Express service to ship independently.",
    decision: "Path-filtered pipelines reduce unnecessary builds, but every pipeline adds configuration and operational cost that must be maintained with its service.",
    flow: [
      { title: "Source", text: "A GitHub connection observes the configured branch and relevant repository paths." },
      { title: "Build", text: "CodeBuild installs dependencies, verifies code, and builds the Docker image." },
      { title: "Publish", text: "The image is tagged and pushed to the service's ECR repository." },
      { title: "Deploy", text: "CodeDeploy rolls the release across matching EC2 instances." },
    ],
    facts: [
      { label: "Pipeline type", value: "CodePipeline V2", text: "Each runtime owns its delivery workflow." },
      { label: "Build runtime", value: "CodeBuild", text: "Privileged Docker builds create the deployable artifact." },
      { label: "Isolation", value: "Path filtered", text: "Client changes do not need to release the Express fleet and vice versa." },
    ],
  },
  ecr: {
    id: "ecr", eyebrow: "Container registry", title: "Amazon ECR repositories", icon: "R", color: "bg-orange-50 text-orange-700",
    summary: "Separate repositories store versioned Nuxt and Express container images between the build and deployment stages.",
    why: "Deployments need a durable, private artifact that is identical across every instance and can be traced back to a release.",
    decision: "Repositories scan pushed images and retain a bounded history. Mutable tags are convenient today; immutable release tags would further prevent accidental replacement.",
    flow: [
      { title: "Authenticate", text: "The build role obtains a short-lived ECR authorization token." },
      { title: "Push image", text: "CodeBuild uploads the service image and its layers." },
      { title: "Select release", text: "Deployment metadata identifies the exact image tag to run." },
      { title: "Pull image", text: "EC2 instance roles pull only the repository images they need." },
    ],
    facts: [
      { label: "Isolation", value: "Per service", text: "Nuxt and Express image histories remain independent." },
      { label: "Security", value: "Scan on push", text: "Registry scanning surfaces known image vulnerabilities." },
      { label: "Lifecycle", value: "50 images", text: "Old artifacts are pruned to control storage growth." },
    ],
  },
  codedeploy: {
    id: "codedeploy", eyebrow: "Fleet rollout", title: "AWS CodeDeploy", icon: "D", color: "bg-indigo-50 text-indigo-700",
    summary: "CodeDeploy coordinates container updates on tagged EC2 instances using versioned deployment bundles and lifecycle hooks.",
    why: "Replacing a container across many instances needs ordering, health awareness, visible status, and automatic failure handling.",
    decision: "Half-at-a-time rolling deployment preserves serving capacity but requires enough fleet headroom to handle traffic while half the targets update.",
    flow: [
      { title: "Select targets", text: "Deployment groups locate the intended fleet through EC2 tags." },
      { title: "Fetch bundle", text: "The agent downloads the AppSpec and deployment scripts." },
      { title: "Replace container", text: "Lifecycle hooks pull and start the selected ECR image." },
      { title: "Verify or rollback", text: "Failed hooks stop the rollout and retain a recoverable release path." },
    ],
    facts: [
      { label: "Strategy", value: "Half at a time", text: "Capacity stays available throughout normal deployments." },
      { label: "Targeting", value: "EC2 tags", text: "Client and server deployments reach only their own fleet." },
      { label: "Contract", value: "AppSpec hooks", text: "Scripts make the host update procedure explicit and repeatable." },
    ],
  },
  "secrets-manager": {
    id: "secrets-manager", eyebrow: "Runtime secrets", title: "AWS Secrets Manager", icon: "S", color: "bg-violet-50 text-violet-700",
    summary: "Sensitive Express runtime values are retrieved from a managed secret rather than embedded in code, images, or CloudFormation output.",
    why: "JWT or service credentials must be rotated and access-controlled independently from application source and container builds.",
    decision: "The secret is expected to exist outside the application stack. This protects its lifecycle, but a missing or malformed secret becomes an explicit startup dependency.",
    flow: [
      { title: "Instance identity", text: "Express runs with an IAM instance role instead of static AWS keys." },
      { title: "Read request", text: "The runtime requests only the configured secret value." },
      { title: "IAM check", text: "Secrets Manager evaluates the role's scoped read permission." },
      { title: "In-memory config", text: "The service validates and uses the secret without baking it into the image." },
    ],
    facts: [
      { label: "Consumer", value: "Express only", text: "The Nuxt fleet does not receive server-only credentials." },
      { label: "Delivery", value: "Runtime read", text: "Secret material is absent from Docker image layers." },
      { label: "Control", value: "IAM scoped", text: "The instance role is granted access to the intended secret." },
    ],
  },
  iam: {
    id: "iam", eyebrow: "Workload identity", title: "EC2 instance roles", icon: "I", color: "bg-emerald-50 text-emerald-700",
    summary: "Each fleet receives a role that supplies short-lived AWS credentials and limits which managed resources its instances can use.",
    why: "Applications need ECR, logging, deployment, and data access without storing long-lived access keys on servers.",
    decision: "Roles are separated by workload. Shared operational permissions stay consistent, while Express alone receives DynamoDB and secret grants.",
    flow: [
      { title: "Launch", text: "The Auto Scaling launch template attaches the fleet's instance profile." },
      { title: "Temporary credentials", text: "EC2 supplies rotating role credentials through instance metadata." },
      { title: "Signed request", text: "AWS SDKs automatically sign ECR, logs, secret, or DynamoDB calls." },
      { title: "Policy evaluation", text: "AWS permits only actions and resources allowed by the role." },
    ],
    facts: [
      { label: "Static keys", value: "None", text: "Credentials rotate automatically with the role session." },
      { label: "Express grants", value: "DDB + secret", text: "Business-data access is not shared with Nuxt." },
      { label: "Operations", value: "SSM enabled", text: "Systems Manager supports controlled host administration." },
    ],
  },
  cloudwatch: {
    id: "cloudwatch", eyebrow: "Operations", title: "CloudWatch logs & dashboard", icon: "O", color: "bg-cyan-50 text-cyan-700",
    summary: "Container output and infrastructure metrics are centralized so fleet behavior can be inspected without logging into individual instances.",
    why: "Auto Scaling instances are replaceable. Local-only logs would disappear with a terminated host and make multi-instance incidents hard to correlate.",
    decision: "A shared observability surface is simple to operate today. As services grow, per-service log groups and stronger alarms can improve isolation and ownership.",
    flow: [
      { title: "Application output", text: "Nuxt and Express write structured output to their container streams." },
      { title: "Log driver", text: "The awslogs driver forwards each stream to CloudWatch Logs." },
      { title: "Retention", text: "The log group retains a bounded operational history." },
      { title: "Dashboard", text: "Operators correlate request symptoms with ALB and compute signals." },
    ],
    facts: [
      { label: "Retention", value: "1 month", text: "Useful history is kept without unlimited storage growth." },
      { label: "Coverage", value: "Both fleets", text: "Nuxt and Express behavior is visible from one AWS service." },
      { label: "Host access", value: "Not required", text: "Routine diagnosis does not depend on SSH or a surviving instance." },
    ],
  },
  sns: {
    id: "sns", eyebrow: "Notification fan-out", title: "SNS alarm topic", icon: "N", color: "bg-red-50 text-red-700",
    summary: "A protected topic provides one destination from which operational alarms can fan out to future email, webhook, or incident integrations.",
    why: "Monitoring should publish an event once and allow notification consumers to change without rewriting every alarm.",
    decision: "The topic enforces encrypted transport. Subscriptions and complete alarm coverage remain environment choices, so creating the topic alone does not notify anyone.",
    flow: [
      { title: "Signal crosses threshold", text: "A CloudWatch alarm changes state after its evaluation window." },
      { title: "Publish", text: "The alarm sends a small state-change message to the SNS topic." },
      { title: "Fan out", text: "SNS evaluates subscriptions configured for that environment." },
      { title: "Notify", text: "Confirmed consumers receive the same operational event independently." },
    ],
    facts: [
      { label: "Transport", value: "SSL enforced", text: "The topic rejects insecure publish or subscription access." },
      { label: "Pattern", value: "Publish / subscribe", text: "One alarm event can reach multiple notification channels." },
      { label: "Current boundary", value: "Topic foundation", text: "Subscriptions must be configured before humans receive alerts." },
    ],
  },
  dynamodb: {
    id: "dynamodb", eyebrow: "Data model", title: "DynamoDB entity & access map", icon: "D", color: "bg-amber-50 text-amber-700",
    summary: "The API stores users, email uniqueness trackers, and redirects in one on-demand table reached privately through the VPC's DynamoDB gateway endpoint.",
    why: "On-demand capacity removes database-server operations and single-table access patterns answer the application's known queries without joins.",
    decision: "DynamoDB is an AWS-managed regional service, not a resource inside the VPC. A gateway endpoint gives private routing; IAM still decides who may access the table.",
    flow: [], facts: [],
  },
};

const entities = [
  { name: "User", icon: "U", cardinality: "profile", color: "bg-brand-50 text-brand-700", border: "border-brand-200", fields: [
    { name: "pk", value: "USER#{id}" }, { name: "sk", value: "META" }, { name: "gsi1pk", value: "EMAIL#{email}" }, { name: "gsi1sk", value: "META" }, { name: "attributes", value: "name · email · passwordHash · isVerified" },
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
