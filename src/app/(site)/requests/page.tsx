import Link from "next/link";
import { MessageCircle, Search, Send } from "lucide-react";
import { createItemRequest, respondToItemRequest } from "@/app/(site)/actions";
import { PageHeader } from "@/components/ui/card";
import { getRoles, getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toWhatsAppNumber } from "@/lib/utils";
import { listCategories } from "@/lib/data/categories";

export const metadata = {
  title: "Request an Item",
  description: "Post what you need and let verified ABSU Trade sellers respond.",
};

const areas = ["Main Campus", "Permanent Site", "Annex", "Off-Campus", "Town"];

export default async function RequestsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const user = await getUser();
  const roles = user ? await getRoles(user.id) : [];
  const [categories] = await Promise.all([listCategories()]);
  const supabase = await createClient();
  const { data: requests, error } = await supabase
    .from("item_requests")
    .select("id,requester_id,title,description,category_id,campus_area,hostel_name,needed_by,status,created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) console.error("[requests] list failed:", error.message);

  const requestIds = (requests ?? []).map((r) => r.id);
  const { data: responses } = user && requestIds.length > 0
    ? await supabase.from("item_request_responses").select("id,request_id,seller_id,message,contact_whatsapp,created_at").in("request_id", requestIds)
    : { data: [] as { id: string; request_id: string; seller_id: string; message: string; contact_whatsapp: string | null; created_at: string }[] };

  const errorMessage = params.error === "invalid" ? "Check the title, description and location fields."
    : params.error === "date" ? "Choose a valid date that is today or later."
    : params.error === "save" ? "We couldn't publish your request. Please try again."
    : params.error === "response" ? "Enter a response between 5 and 800 characters."
    : params.error === "closed" ? "This request is no longer open."
    : params.error === "whatsapp" ? "Add your WhatsApp number to your profile before responding to requests."
    : params.error === "duplicate" ? "You have already responded to this request, or the response could not be saved."
    : null;

  return (
    <div className="space-y-7">
      <PageHeader title="Request an Item" description="Can't find what you need? Post an In Search Of (ISO) request and let verified campus sellers come to you." />
      {params.created ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">Your request is live. Sellers can now respond.</p> : null}
      {params.responded ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">Your response has been sent to the requester.</p> : null}
      {errorMessage ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{errorMessage}</p> : null}

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-800"><Search className="size-5" /></span>
          <div><h2 className="font-bold text-stone-950">Post what you&apos;re looking for</h2><p className="text-xs text-stone-500">Requests are visible to the ABSU Trade community.</p></div>
        </div>
        {user ? (
          <form action={createItemRequest} className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-stone-700 sm:col-span-2">What do you need?
              <input name="title" required minLength={5} maxLength={120} placeholder="e.g. Fairly used 6kg gas cylinder" className="h-11 w-full rounded-xl border border-stone-300 px-3 text-base" />
            </label>
            <label className="space-y-1 text-sm font-medium text-stone-700 sm:col-span-2">Add details
              <textarea name="description" required minLength={10} maxLength={1500} rows={3} placeholder="Mention the condition, budget or other details that will help sellers." className="w-full rounded-xl border border-stone-300 px-3 py-2 text-base" />
            </label>
            <label className="space-y-1 text-sm font-medium text-stone-700">Item category (optional)
              <select name="category_id" className="h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-base"><option value="">Any category</option>{categories.map((category)=><option key={category.id} value={category.id}>{category.name}</option>)}</select>
            </label>
            <label className="space-y-1 text-sm font-medium text-stone-700">Preferred campus area
              <select name="campus_area" className="h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-base"><option value="">Any area</option>{areas.map((a)=><option key={a}>{a}</option>)}</select>
            </label>
            <label className="space-y-1 text-sm font-medium text-stone-700">Hostel / lodge (optional)
              <input name="hostel_name" maxLength={100} placeholder="e.g. Hostel B" className="h-11 w-full rounded-xl border border-stone-300 px-3 text-base" />
            </label>
            <label className="space-y-1 text-sm font-medium text-stone-700">Needed by (optional)
              <input name="needed_by" type="date" min={new Date().toISOString().slice(0,10)} className="h-11 w-full rounded-xl border border-stone-300 px-3 text-base" />
            </label>
            <div className="flex items-end"><button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 text-sm font-semibold text-white hover:bg-brand-800"><Send className="size-4" /> Publish request</button></div>
          </form>
        ) : <p className="text-sm text-stone-600"><Link href="/login?next=%2Frequests" className="font-semibold text-brand-800 underline">Log in</Link> to publish an item request.</p>}
      </section>

      <section className="space-y-4">
        <div><h2 className="text-xl font-bold text-stone-950">Open requests</h2><p className="text-sm text-stone-500">See what students are currently looking for.</p></div>
        {(requests ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center"><Search className="mx-auto size-8 text-stone-400"/><p className="mt-2 font-semibold text-stone-800">No open requests yet</p><p className="mt-1 text-sm text-stone-500">Be the first to post what you need.</p></div>
        ) : (requests ?? []).map((request) => {
          const own = request.requester_id === user?.id;
          const requestResponses = (responses ?? []).filter((r) => r.request_id === request.id);
          return (
            <article key={request.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="font-bold text-stone-950">{request.title}</h3><p className="mt-1 text-xs text-stone-500">Posted {new Date(request.created_at).toLocaleDateString("en-NG")}</p></div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Open request</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-stone-700">{request.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
                {request.category_id ? <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-800">{categories.find((category)=>category.id===request.category_id)?.name ?? "Item category"}</span> : null}
                {request.campus_area ? <span className="rounded-full bg-stone-100 px-3 py-1">{request.campus_area}</span> : null}
                {request.hostel_name ? <span className="rounded-full bg-stone-100 px-3 py-1">{request.hostel_name}</span> : null}
                {request.needed_by ? <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">Needed by {new Date(request.needed_by+"T00:00:00").toLocaleDateString("en-NG")}</span> : null}
              </div>
              {own ? (
                <div className="mt-4 border-t border-stone-100 pt-3">
                  <p className="text-sm font-semibold text-stone-800">{requestResponses.length} seller response{requestResponses.length===1?"":"s"}</p>
                  {requestResponses.map((response) => {
                    const wa=toWhatsAppNumber(response.contact_whatsapp);
                    const message=encodeURIComponent("Hello, I saw your response to my ABSU Trade request: "+request.title);
                    return <div key={response.id} className="mt-3 rounded-xl bg-stone-50 p-3"><p className="text-sm text-stone-700">{response.message}</p>{wa ? <a href={`https://wa.me/${wa}?text=${message}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><MessageCircle className="size-4"/> Chat with seller on WhatsApp</a> : <p className="mt-2 text-xs text-stone-500">Seller has not provided a WhatsApp number.</p>}</div>;
                  })}
                </div>
              ) : user && roles.includes("seller") ? (
                <form action={respondToItemRequest} className="mt-4 space-y-2 border-t border-stone-100 pt-3">
                  <input type="hidden" name="request_id" value={request.id}/>
                  <label className="block text-xs font-semibold text-stone-700">Have this item? Send an offer or message
                    <textarea name="message" required minLength={5} maxLength={800} rows={2} placeholder="Describe what you have, its condition and your price." className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"/>
                  </label>
                  <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-900 px-4 text-sm font-semibold text-white"><MessageCircle className="size-4"/> Respond to request</button>
                </form>
              ) : !user ? <p className="mt-4 text-xs text-stone-500"><Link href="/login?next=%2Frequests" className="font-semibold underline">Log in</Link> to respond to requests.</p> : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
