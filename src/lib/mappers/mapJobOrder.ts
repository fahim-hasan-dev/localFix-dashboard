import { resolveAssetUrl, resolveAssetUrls } from "@/lib/resolveAssetUrl";
import { pick, pickNumber, pickString } from "@/lib/unwrapList";
import type {
  JobLead,
  JobQuote,
  JobStatus,
  JobUrgency,
  Order,
  PropertyType,
} from "@/types/common.types";

function mapUrgency(raw: string): JobUrgency {
  const value = raw.toLowerCase();
  if (value.includes("emergency") || value.includes("asap")) return "emergency_asap";
  if (value.includes("week")) return "this_week";
  return "flexible";
}

function mapJobStatus(raw: string): JobStatus {
  const value = raw.toLowerCase();
  if (value.includes("await") && value.includes("quote")) return "getting_quotes";
  if (value === "quoted" || (value.includes("quote") && value.includes("in"))) return "quotes_in";
  if (value.includes("hired") || value.includes("accepted")) return "hired";
  if (value.includes("schedule")) return "scheduled";
  if (value.includes("route") || value.includes("on_the_way")) return "en_route";
  if (value.includes("await") || value.includes("pending_completion")) return "awaiting_confirm";
  if (value.includes("progress") || value.includes("active")) return "in_progress";
  if (value.includes("complete")) return "completed";
  if (value.includes("dispute")) return "disputed";
  if (value.includes("cancel")) return "cancelled";
  return "getting_quotes";
}

function mapFulfillment(raw: string): Order["fulfillmentStatus"] {
  const value = raw.toLowerCase();
  if (value.includes("cancel")) return "cancelled";
  if (value.includes("dispute")) return "disputed";
  if (value.includes("pending_completion") || (value.includes("await") && !value.includes("quote"))) {
    return "awaiting_confirm";
  }
  if (value.includes("on_the_way") || value.includes("route")) return "on_the_way";
  if (value.includes("progress") || value.includes("start")) return "in_progress";
  if (value.includes("complete") || value.includes("done")) return "completed";
  return "scheduled";
}

function mapPayment(raw: string): Order["paymentStatus"] {
  const value = raw.toLowerCase();
  if (value.includes("refund")) return "refunded";
  if (value.includes("dispute")) return "disputed";
  if (value.includes("pending")) return "direct_pending";
  if (value.includes("paid")) return "paid_direct";
  return "direct_pending";
}

function mapQuoteStatus(raw: string): JobQuote["status"] {
  const value = raw.toLowerCase();
  if (value.includes("hire") || value.includes("accept")) return "accepted";
  if (value.includes("declin") || value.includes("reject")) return "declined";
  if (value.includes("withdraw")) return "withdrawn";
  return "pending";
}

function mapQuotes(raw: unknown): JobQuote[] {
  const list =
    pick<unknown[]>(raw, [
      "quotes",
      "quotations",
      "proposals",
      "quoteBiddingHistory",
      "biddingHistory",
    ]) ?? [];
  if (!Array.isArray(list)) return [];

  return list.map((item, index) => ({
    id: pickString(item, ["_id", "id"], `quote-${index}`),
    jobId: pickString(item, ["jobRequest._id", "jobRequest", "jobId", "job._id"], ""),
    proId: pickString(item, ["professional._id", "pro._id", "pro.id", "proId", "professional"]),
    proName: pickString(item, ["professional.name", "pro.name", "proName", "user.name"], "Pro"),
    proBusiness: pickString(item, [
      "professional.companyName",
      "pro.companyName",
      "proBusiness",
      "professional.name",
      "pro.name",
    ]),
    proAvatar:
      resolveAssetUrl(
        pickString(item, ["professional.profileImage", "pro.profileImage", "pro.avatar", "proAvatar"]),
      ) || undefined,
    proRating: pickNumber(item, ["professional.rating", "pro.rating", "proRating", "rating"]),
    amount: pickNumber(item, ["totalRate", "amount", "price", "rate"]),
    message: pickString(item, ["scopeOfWork", "proposalNote", "message", "additionalNotes", "description"]),
    estimatedDuration: pickString(item, ["estimatedDuration", "duration"], "—"),
    earliestAvailability: pickString(
      item,
      ["earliestAvailableDate", "arrivalTimeWindow", "earliestAvailability", "duration"],
      "—",
    ),
    createdAt: pickString(item, ["createdAt", "submittedAt"]),
    status: mapQuoteStatus(pickString(item, ["status"], "pending")),
  }));
}

function mapPropertyType(raw: string): PropertyType {
  const value = raw.toLowerCase();
  if (value.includes("condo") || value.includes("apartment")) return "condo_apartment";
  if (value.includes("town")) return "townhouse";
  if (value.includes("commercial")) return "commercial";
  return "single_family";
}

function nestedUser(raw: unknown, key: string) {
  return pick<unknown>(raw, [key, `${key}Id`]);
}

/** Admin job request → JobLead */
export function mapAdminJob(raw: unknown): JobLead {
  const homeowner = nestedUser(raw, "homeOwner") ?? nestedUser(raw, "homeowner") ?? {};
  const location = pick<unknown>(raw, ["serviceLocation", "location"]) ?? {};
  const category = pick<unknown>(raw, ["category"]) ?? {};

  const quotes = mapQuotes(raw);
  const status = mapJobStatus(pickString(raw, ["status", "jobStatus"], "getting_quotes"));

  return {
    id: pickString(raw, ["_id", "id"]),
    title: pickString(raw, ["headline", "title", "name"], "Job request"),
    category:
      typeof category === "string"
        ? category
        : pickString(category, ["name"], pickString(raw, ["categoryName"], "General")),
    subCategory: pickString(raw, ["subCategory"]) || undefined,
    description: pickString(raw, ["description"], ""),
    homeownerId: pickString(homeowner, ["_id", "id"], pickString(raw, ["homeOwner", "homeowner"])),
    homeownerName: pickString(homeowner, ["name"], pickString(raw, ["homeownerName"], "Homeowner")),
    homeownerEmail: pickString(homeowner, ["email"], pickString(raw, ["homeownerEmail"])),
    homeownerPhone: pickString(homeowner, ["phone"], pickString(raw, ["homeownerPhone"])),
    zipCode: pickString(location, ["zipCode"], pickString(raw, ["zipCode"])),
    city: pickString(location, ["city"], pickString(raw, ["city"])),
    state: pickString(location, ["state"], pickString(raw, ["state"])),
    address: pickString(location, ["address"], pickString(raw, ["address"])) || undefined,
    urgency: mapUrgency(pickString(raw, ["timeframe", "urgency", "preferredArrivalWindow"])),
    propertyType: mapPropertyType(pickString(raw, ["propertyType"], "Single-Family Home")),
    budgetRange: pickString(raw, ["estimatedBudget", "budgetRange"])
      ? `$${pickString(raw, ["estimatedBudget", "budgetRange"])}`
      : "—",
    status,
    postedAt: pickString(raw, ["createdAt", "postedAt"]),
    scheduledDate: pickString(raw, ["scheduledDate"]) || undefined,
    completedDate: pickString(raw, ["completedDate", "completedAt"]) || undefined,
    quotesCount: quotes.length || pickNumber(raw, ["quotesCount", "quotationCount"]),
    quotes,
    selectedQuoteId: pickString(raw, ["selectedQuoteId"]) || undefined,
    hiredProId: pickString(raw, ["hiredProId", "professional._id"]) || undefined,
    photos: resolveAssetUrls(pick<string[]>(raw, ["projectPhotos", "photos"]) ?? []),
  };
}

/** Admin booking/order → Order */
export function mapAdminOrder(raw: unknown): Order {
  const homeowner =
    nestedUser(raw, "homeownerInformation") ??
    nestedUser(raw, "homeOwner") ??
    nestedUser(raw, "homeowner") ??
    {};
  const pro =
    nestedUser(raw, "hiredPro") ?? nestedUser(raw, "professional") ?? nestedUser(raw, "pro") ?? {};
  const job = pick<unknown>(raw, ["jobRequest", "job", "quotation.jobRequest"]) ?? {};
  const location =
    pick<unknown>(raw, ["serviceLocation", "jobRequest.serviceLocation", "homeownerInformation"]) ?? {};

  return {
    id: pickString(raw, ["_id", "id"]),
    jobTitle: pickString(
      raw,
      ["jobTitle", "service", "title", "headline", "jobRequest.headline"],
      pickString(job, ["headline", "title"], "Order"),
    ),
    category: pickString(
      raw,
      ["categoryName", "category.name", "category", "jobRequest.category.name"],
      "General",
    ),
    homeownerId: pickString(homeowner, ["_id", "id"]),
    homeownerName: pickString(homeowner, ["name"], pickString(raw, ["homeownerName", "clientName"], "Homeowner")),
    homeownerEmail: pickString(homeowner, ["email"], pickString(raw, ["homeownerInformation.email"])),
    homeownerPhone: pickString(homeowner, ["phone"], pickString(raw, ["homeownerInformation.phone"])),
    proId: pickString(pro, ["_id", "id"]),
    proName: pickString(pro, ["name"], pickString(raw, ["proName", "professionalName"], "Pro")),
    proBusiness: pickString(pro, ["companyName", "name"], "Pro Business"),
    amount: pickNumber(raw, [
      "totalAmount",
      "finalPrice",
      "paymentSummary.finalPrice",
      "amount",
      "quotation.totalRate",
    ]),
    platformFee: pickNumber(raw, ["platformFee", "paymentSummary.platformFee", "fee"], 0),
    paymentMethod:
      pickString(raw, ["paymentSummary.paymentMethod", "settledPaymentMethod", "paymentMethod"]) || undefined,
    paymentStatus: mapPayment(
      pickString(raw, ["paymentStatus", "paymentSummary.paymentStatus"], "pending"),
    ),
    fulfillmentStatus: mapFulfillment(
      pickString(raw, ["status", "liveStage", "stage", "fulfillmentStatus"], "scheduled"),
    ),
    orderDate: pickString(raw, ["appointmentDate", "createdAt", "orderDate", "confirmedDate"]),
    completedDate: pickString(raw, ["homeownerCompletedAt", "completedAt", "completedDate"]) || undefined,
    transactionId:
      pickString(raw, ["stripePaymentIntentId", "paymentSummary.transactionId", "transactionId"]) || undefined,
    address: pickString(
      location,
      ["address"],
      pickString(raw, ["homeownerInformation.address", "address"]),
    ),
    description: pickString(raw, ["clientDescription", "description", "jobRequest.description"]),
    notes: pickString(raw, ["completionNotes", "contractorCompletionNote", "notes"]) || undefined,
    photos: resolveAssetUrls(
      pick<string[]>(raw, ["damagePhotos", "projectPhotos", "photos"]) ?? [],
    ),
    budgetRange: pickString(raw, ["budget", "budgetRange"]) || undefined,
    proRating: pickNumber(pro, ["rating"]) || undefined,
    proAvatar: resolveAssetUrl(pickString(pro, ["profileImage", "avatar"])) || undefined,
    quotes: mapQuotes(raw),
  };
}
