import type { Category } from "./site";
export interface NoteSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  code?: string;
}
export interface TechnicalNote {
  kind: "technical-note";
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  category: Category;
  tags: Category[];
  summary: string;
  minutes: number;
  illustration: "authorization" | "oauth" | "code";
  sections: NoteSection[];
  sources: { title: string; href: string }[];
}
export interface PublicCaseStudy {
  kind: "case-study";
  slug: string;
  title: string;
  summary: string;
  category: Category;
  publicationApproved: true;
  approvedOn: string;
  disclosureDate: string;
  program: string;
  publicReference: string;
  illustration?: "authorization" | "oauth" | "code";
  references?: { title: string; href: string }[];
  sections: NoteSection[];
}
export const caseStudies: PublicCaseStudy[] = [];
export const notes: TechnicalNote[] = [
  {
    kind: "technical-note",
    slug: "authorization-boundaries",
    number: "01",
    title: "Understanding authorization boundaries in modern APIs",
    shortTitle: "When identity isn’t permission.",
    category: "API Security",
    tags: ["API Security", "Access Control", "Web Application Security"],
    summary:
      "A valid identity answers who is asking. Object-level authorization answers whether that identity may act on this particular resource.",
    minutes: 6,
    illustration: "authorization",
    sections: [
      {
        id: "identity-and-permission",
        title: "Two questions, two different controls",
        paragraphs: [
          "A request can carry a legitimate session and still ask for something the caller should never receive. Authentication establishes an identity. Authorization evaluates permission for an action in a particular context. Treating the first decision as sufficient for the second leaves a boundary undefined.",
          "Imagine a small document service with two workspace members. Both can sign in and both can use the document endpoint. Their membership does not mean every document is shared. A private draft, a workspace document, and an archived administrative record can require different decisions even when the HTTP route is identical. This is a conceptual teaching example, not a disclosed finding.",
        ],
      },
      {
        id: "decision-context",
        title: "Model the decision, not just the identifier",
        paragraphs: [
          "A useful way to reason about an access decision is to write it as a relationship among a subject, an action, a resource, and context. The subject is the verified caller. The action might be read, edit, export, or delete. The resource includes ownership and tenant information. Context can include a sharing grant or a workflow state.",
          "An opaque identifier does not establish that relationship. A UUID can make enumeration harder while the underlying policy remains absent. Equally, checking that a requested record belongs to the current user is too narrow for applications with legitimate sharing. The right policy reflects the product’s intended relationships.",
        ],
        code: `// Conceptual pseudocode — not a complete implementation.
subject = requireVerifiedSession(request)
resource = lookupWithinTenant(subject.tenant, request.documentId)

if resource is missing:
    return notFound()

if not policy.allows(subject, "read", resource):
    return deniedAccordingToResponsePolicy()

return serializePermittedFields(resource)`,
      },
      {
        id: "follow-the-object",
        title: "Follow the object through the system",
        paragraphs: [
          "Start with the decision closest to the operation and work backward. Where was the caller established? Which layer loads the object? Is the policy evaluated before any sensitive fields are returned or any mutation is committed? A check in a page component tells you little about a background job or an alternate API path.",
          "In GraphQL, a single transport endpoint can contain many object access paths. The review unit is the resolver and the operation it performs, rather than the existence of a login check on the endpoint. Nested relationships and bulk operations deserve the same attention as direct object lookups.",
        ],
        bullets: [
          "Record who may perform each action and under which ownership or sharing conditions.",
          "Compare normal, cross-owner, cross-tenant, and revoked-access contexts using controlled test accounts.",
          "Examine read, update, delete, and export paths separately; a secure read path does not prove a secure mutation.",
          "Look for partial authorization in lists and bulk operations, including objects reached through nested relationships.",
        ],
      },
      {
        id: "controlled-validation",
        title: "Make the boundary observable",
        paragraphs: [
          "An authorized test should be designed to answer a specific question with minimal exposure. Create resources under accounts you control, assign a known sharing relationship, and compare the behavior against that relationship. Keep the test’s expected result explicit before inspecting the observed response.",
          "A response status alone is incomplete evidence. A rejected request may still have changed a record, and a successful response may contain only fields intended to be public. Observe the application’s relevant state and permitted representation. Respect scope, stop after sufficient evidence, and report uncertainty rather than extending a test into unrelated data.",
        ],
      },
      {
        id: "durable-controls",
        title: "Turn the model into durable controls",
        paragraphs: [
          "Document the product policy in terms that developers and reviewers can test. Place enforcement where the resource and caller context are available, reuse the policy across entry points, and build regression cases for the relationships the application supports.",
          "The strongest review outcome is more than a patched endpoint. It is a clear account of the missing decision, the paths that rely on it, and the tests that will expose the same mistake when the application changes. Authentication and authorization remain separate responsibilities throughout that process.",
        ],
      },
    ],
    sources: [
      {
        title: "OWASP API Security: Broken Object Level Authorization",
        href: "https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/",
      },
      {
        title: "OWASP Authorization Cheat Sheet",
        href: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
      },
    ],
  },
  {
    kind: "technical-note",
    slug: "oauth-redirect-validation",
    number: "02",
    title: "OAuth security and the importance of redirect validation",
    shortTitle: "A redirect is a trust decision.",
    category: "Authentication and Identity",
    tags: ["Authentication and Identity", "Web Application Security"],
    summary:
      "Following an OAuth authorization flow through client registration, the callback, and the checks that bind a response to its original request.",
    minutes: 7,
    illustration: "oauth",
    sections: [
      {
        id: "trust-relationships",
        title: "Map the parties before the parameters",
        paragraphs: [
          "OAuth delegates access between distinct parties: a resource owner, a client, an authorization server, and a resource server. The browser carries parts of the conversation but is not the place to establish every trust decision. OAuth itself is an authorization framework; OpenID Connect adds an identity layer for authentication.",
          "For a code flow, the client directs the browser to the authorization server. After authorization, the server sends the browser to a registered callback with a short-lived code. The client redeems that code at the token endpoint. Each step has a different obligation: recognize the client, deliver the response to its intended destination, and bind code redemption to the original transaction.",
        ],
      },
      {
        id: "redirect-validation",
        title: "The callback is a delivery boundary",
        paragraphs: [
          "The redirect URI identifies where an authorization response is allowed to go. Review registration, request validation, and token redemption as a connected process. An imprecise destination check can route sensitive material away from the legitimate client.",
          "RFC 9700 specifies exact string matching against registered redirect URIs, with a limited exception for the port of native-app localhost redirects. Broad subdomain rules, substring checks, or prefix comparisons do not express the same constraint. An open redirect on an otherwise legitimate callback path also needs attention because the next navigation can change the effective destination.",
        ],
        code: `// Illustrative policy; URI examples use reserved .example names.
registered = "https://client.example/oauth/callback"

request.redirect_uri == registered       // expected destination
request.redirect_uri startsWith registered // insufficient rule

// Also review downstream redirects on the callback itself.`,
      },
      {
        id: "bind-the-response",
        title: "Bind the response to its transaction",
        paragraphs: [
          "A callback arriving at the correct address is still not enough. The client must establish that the response belongs to an authorization transaction started in the relevant browser session, rather than accepting unsolicited responses.",
          "When state is used for CSRF protection, generate an unpredictable value, associate it with the user-agent session and transaction, validate it, and consume it once. PKCE binds authorization-code redemption to a verifier created for the initiating flow. Use the S256 challenge method. These controls solve related but distinct problems; their presence does not compensate for permissive redirect registration.",
          "For OpenID Connect, validate the ID token and its issuer, audience, signature, expiry, and nonce where required by the chosen flow. A deployment with multiple authorization servers also needs defenses against issuer mix-up. Follow the protocol and library guidance for the actual flow, rather than treating every parameter as interchangeable.",
        ],
      },
      {
        id: "review-sequence",
        title: "Review the flow as a sequence",
        paragraphs: [
          "Draw the legitimate transaction first. Then examine each point where the destination, client, session, or issuer is selected. In a permitted test environment, change one assumption at a time and compare against a known baseline. This avoids attributing a callback error to a control that is enforced elsewhere.",
        ],
        bullets: [
          "Check registered destinations and exact-match enforcement at the authorization server.",
          "Confirm that the callback does not accept arbitrary post-login redirect destinations.",
          "Inspect the lifecycle of state, the PKCE verifier, and any OpenID Connect nonce.",
          "Verify code handling, redirect consistency, issuer validation, and safe error behavior.",
          "Check that codes and tokens do not leak through logs, unnecessary URL exposure, or third-party callback resources.",
        ],
      },
      {
        id: "implementation-notes",
        title: "Keep responsibility explicit",
        paragraphs: [
          "Prefer maintained protocol libraries, but read their integration contract. A library may validate a token while the surrounding application still chooses an unsafe callback destination or stores transaction state incorrectly. Registration policy and application routing remain part of the security model.",
          "Record the exact flow, participating components, and security responsibilities in the review. OAuth security becomes easier to reason about when each trust decision has an owner and an observable expected result. The diagrams here describe protocol concepts and do not represent a vulnerability found in a real service.",
        ],
      },
    ],
    sources: [
      {
        title: "IETF RFC 9700: Best Current Practice for OAuth 2.0 Security",
        href: "https://www.rfc-editor.org/rfc/rfc9700.html",
      },
      {
        title: "IETF RFC 7636: Proof Key for Code Exchange",
        href: "https://www.rfc-editor.org/rfc/rfc7636.html",
      },
      {
        title: "OpenID Connect Core 1.0",
        href: "https://openid.net/specs/openid-connect-core-1_0.html",
      },
    ],
  },
  {
    kind: "technical-note",
    slug: "security-critical-code-review",
    number: "03",
    title: "Security-critical assumptions in source-code review",
    shortTitle: "Follow the data. Find the assumption.",
    category: "Source-Code Analysis",
    tags: [
      "Source-Code Analysis",
      "Cloud-Native Security",
      "Web Application Security",
    ],
    summary:
      "A practical framework for following input, identity, authorization, and data flow through security-sensitive application code.",
    minutes: 6,
    illustration: "code",
    sections: [
      {
        id: "start-with-behavior",
        title: "Begin with a behavior, not a suspicious line",
        paragraphs: [
          "A security review asks whether the application enforces its intended rules under unexpected conditions. A suspicious function call is only a lead. To evaluate it, understand the caller, the input, the deployment, and the product rule that should hold.",
          "Take a conceptual export feature. The visible handler might load a record and queue a job. The worker later assembles an archive and writes a download location. Reviewing only the handler would miss how identity, permission, and storage access behave after the asynchronous handoff. This teaching example is not a report about an actual product.",
        ],
      },
      {
        id: "trace-the-flow",
        title: "Write down the chain of assumptions",
        paragraphs: [
          "Identify the entry point and trace a value to the operation it influences. Keep a separate trace for identity. A request parameter, a verified session claim, and a database relationship may all be strings, but they carry different authority. Names such as trustedUser or safePath do not establish that a value is trustworthy.",
          "At every handoff, ask what the next component assumes has already happened. A service might assume that all its callers perform authorization. A worker might assume that a queue message contains a verified tenant. A rendering function might assume an earlier layer chose the correct encoding for its output context.",
        ],
        code: `// Conceptual review map
request input → handler → service → queue → worker → storage
                  │         │                  │
identity source ──┘   policy decision     resource decision

Ask at each arrow:
  What is supplied? What is verified? What is assumed?`,
      },
      {
        id: "review-invariants",
        title: "Turn intent into reviewable invariants",
        paragraphs: [
          "An invariant is a condition that should remain true throughout a relevant operation. Examples include tenant-scoped resource access, a permitted state transition, or a download URL that never exposes a private record to an unauthorized caller. Write the invariant in product terms before translating it into implementation checks.",
          "Review both successful and exceptional paths. A validation failure should not leave a partial mutation behind. A cache should not collapse two different authorization contexts into one entry. A job retry should not bypass a prerequisite that was only checked during the original request. These questions make the review follow behavior rather than syntax.",
        ],
        bullets: [
          "Input: distinguish validation, normalization, parameterization, and output encoding.",
          "Identity: establish where the caller context is verified and how it reaches downstream work.",
          "Authorization: identify the policy decision for the specific operation and resource.",
          "State: examine prerequisites, concurrency, retries, and transitions between business states.",
          "Data: follow sensitive values into responses, caches, logs, and storage.",
        ],
      },
      {
        id: "validate-in-context",
        title: "A hypothesis needs contextual evidence",
        paragraphs: [
          "Once a plausible missing control is identified, trace the actual execution path before declaring a vulnerability. Framework middleware, database rules, a service wrapper, or infrastructure configuration may enforce a condition that is not visible at the first call site. Conversely, a comment may promise a control that the execution path never reaches.",
          "Validate in an authorized local or test environment with controlled data. Build a minimal reproduction around the invariant and observe the final state. Record relevant versions and configuration, because a conclusion about one environment should not silently become a claim about every deployment.",
        ],
      },
      {
        id: "communicate-the-cause",
        title: "Explain the missing decision",
        paragraphs: [
          "A useful report connects the product rule to the implementation gap. Explain the entry point, the transformations, the security-sensitive operation, and the condition that should have been enforced. State the prerequisites and distinguish confirmed behavior from possible consequences.",
          "Remediation should address the same chain. Moving a check to a shared policy layer, preserving verified identity through an asynchronous boundary, or changing a cache key can be more durable than patching one caller. Tests should exercise the affected invariant and alternate paths, so the protection survives future changes.",
        ],
      },
    ],
    sources: [
      {
        title: "OWASP Secure Code Review Cheat Sheet",
        href: "https://cheatsheetseries.owasp.org/cheatsheets/Secure_Code_Review_Cheat_Sheet.html",
      },
      {
        title: "OWASP Authorization Cheat Sheet",
        href: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
      },
      {
        title: "OWASP Input Validation Cheat Sheet",
        href: "https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html",
      },
    ],
  },
];

// Public disclosures use the same presentation model, with an explicit approval gate.
export const publishedResearch = [
  ...notes,
  ...caseStudies
    .filter(
      (study) =>
        study.publicationApproved === true &&
        study.approvedOn &&
        study.publicReference,
    )
    .map((study) => ({
      ...study,
      number: "Disclosure",
      shortTitle: study.title,
      tags: [study.category],
      minutes: Math.max(
        1,
        Math.ceil(
          study.sections
            .flatMap((section) => section.paragraphs)
            .join(" ")
            .split(/\s+/).length / 200,
        ),
      ),
      illustration: study.illustration ?? ("authorization" as const),
      sources: study.references ?? [
        { title: "Public disclosure reference", href: study.publicReference },
      ],
    })),
];
export type ResearchEntry = (typeof publishedResearch)[number];
