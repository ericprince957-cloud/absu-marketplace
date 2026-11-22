"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { attachProductImages, deleteProductImage, saveProduct, type SaveProductResult } from "@/app/seller/actions";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { MAX_IMAGES_PER_PRODUCT, PRODUCT_CONDITIONS, STORAGE_BUCKET } from "@/config/site";
import { compressImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/browser";
import { publicImageUrl } from "@/lib/utils";
import type { Category, Product } from "@/types";

export function ProductForm({ userId, categories, product }: { userId: string; categories: Category[]; product?: Product }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<SaveProductResult>({});
  const [files, setFiles] = useState<File[]>([]);
  const [existing, setExisting] = useState(product?.product_images ?? []);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(product?.category_id ?? "");
  const isStudyMaterial = ["0370b302-780b-48ff-a75a-e1b4754c9aac", "745bc3a9-214f-4263-990f-1e46e3a21254"].includes(selectedCategory);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const room = MAX_IMAGES_PER_PRODUCT - existing.length;
  const fe = state.fieldErrors;

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    setNotice(null);
    const next = [...files, ...picked].slice(0, room);
    if (files.length + picked.length > room) setNotice(`You can have up to ${MAX_IMAGES_PER_PRODUCT} photos in total.`);
    setFiles(next);
  }

  async function removeExisting(id: string) {
    const res = await deleteProductImage(id);
    if (res.ok) setExisting((list) => list.filter((i) => i.id !== id));
    else setNotice(res.error ?? "Could not remove the photo.");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setState({});
    setNotice(null);

    const res = await saveProduct(product?.id ?? null, new FormData(e.currentTarget));
    if (!res.ok || !res.productId) {
      setState(res);
      setPending(false);
      return;
    }

    if (files.length > 0) {
      try {
        const supabase = createClient();
        const paths: string[] = [];
        for (const file of files) {
          const blob = await compressImage(file);
          const path = `${userId}/${res.productId}/${crypto.randomUUID()}.jpg`;
          const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
            contentType: "image/jpeg",
            cacheControl: "31536000",
            upsert: false,
          });
          if (error) throw new Error(error.message);
          paths.push(path);
        }
        const attached = await attachProductImages(res.productId, paths);
        if (!attached.ok) throw new Error(attached.error ?? "Could not save photos.");
      } catch (err) {
        setState({ ok: false, error: `Your listing was saved, but the photos did not upload: ${err instanceof Error ? err.message : "unknown error"}. Add them again below.` });
        setPending(false);
        if (!product) router.replace(`/seller/products/${res.productId}/edit`);
        return;
      }
    }

    router.push("/seller/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField label="Title" name="title" defaultValue={product?.title} required error={fe?.title} placeholder="e.g. HP EliteBook 840 G5, 8GB RAM" />
        </div>
        <TextField label="Price (₦)" name="price" type="number" min={1} step="any" inputMode="decimal" defaultValue={product?.price} required error={fe?.price} />
        <TextField label="Quantity in stock" name="quantity" type="number" min={1} defaultValue={product?.quantity ?? 1} required error={fe?.quantity} />
        <SelectField label="Category" name="category_id" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required error={fe?.category_id}>
          <option value="" disabled>Choose a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </SelectField>
        <SelectField label="Condition" name="condition" defaultValue={product?.condition ?? "used"} required error={fe?.condition}>
          {PRODUCT_CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </SelectField>
        <SelectField label="Campus area" name="campus_area" defaultValue={product?.campus_area ?? ""} error={fe?.campus_area}>
          <option value="">Choose area (optional)</option><option>Main Campus</option><option>Permanent Site</option><option>Annex</option><option>Off-Campus</option><option>Town</option>
        </SelectField>
        <TextField label="Hostel / lodge (optional)" name="hostel_name" defaultValue={product?.hostel_name ?? ""} error={fe?.hostel_name} placeholder="e.g. Hostel B, Umuahia Lodge" />
        <div className="sm:col-span-2">
          <TextField label="Pickup landmark (optional)" name="location" defaultValue={product?.location ?? ""} error={fe?.location} placeholder="e.g. Near Main Gate" />
        </div>
        {isStudyMaterial ? <>
          <div className="sm:col-span-2 rounded-xl border border-brand-200 bg-brand-50 p-4">
            <p className="mb-3 text-sm font-semibold text-brand-900">Academic details (required for study materials)</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <TextField label="Department" name="academic_department" defaultValue={product?.academic_department ?? ""} required error={fe?.academic_department} placeholder="e.g. Mathematics" />
              <SelectField label="Level" name="academic_level" defaultValue={product?.academic_level ?? ""} required error={fe?.academic_level}><option value="">Select level</option>{["100L","200L","300L","400L","500L"].map((v)=><option key={v}>{v}</option>)}</SelectField>
              <TextField label="Course code" name="course_code" defaultValue={product?.course_code ?? ""} required error={fe?.course_code} placeholder="e.g. MTH 101" />
            </div>
          </div>
        </> : null}
        <div className="sm:col-span-2">
          <TextAreaField label="Description" name="description" rows={6} defaultValue={product?.description} required error={fe?.description} hint="Be honest: mention defects, age and what is included." />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-stone-800">Photos ({existing.length + files.length}/{MAX_IMAGES_PER_PRODUCT})</legend>
        {notice ? <p role="alert" className="text-sm font-medium text-red-600">{notice}</p> : null}
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {existing.map((img) => {
            const url = publicImageUrl(img.path);
            return (
              <li key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                {url ? <Image src={url} alt="" fill sizes="120px" className="object-cover" /> : null}
                <button type="button" onClick={() => removeExisting(img.id)} aria-label="Remove photo" className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-white/95 shadow ring-1 ring-stone-200">
                  <X className="size-4" aria-hidden />
                </button>
              </li>
            );
          })}
          {previews.map((url, i) => (
            <li key={url} className="relative aspect-square overflow-hidden rounded-xl border border-brand-300 bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-full object-cover" />
              <button type="button" onClick={() => setFiles((f) => f.filter((_, idx) => idx !== i))} aria-label="Remove selected photo" className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-white/95 shadow ring-1 ring-stone-200">
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
          {room - files.length > 0 ? (
            <li>
              <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-stone-300 bg-white text-center text-xs font-medium text-stone-600 hover:border-brand-500 hover:bg-brand-50 focus-within:ring-2 focus-within:ring-brand-600">
                <span className="grid place-items-center gap-1">
                  <ImagePlus className="size-6" aria-hidden />
                  Add photos
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={onPick} />
              </label>
            </li>
          ) : null}
        </ul>
        <p className="text-xs text-stone-500">JPG, PNG or WebP. Photos are resized automatically. The first photo is the cover.</p>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-stone-100 pt-5">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <><Loader2 className="size-4 animate-spin" aria-hidden /> Saving...</> : product ? "Save changes" : "Submit listing"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.push("/seller/products")} disabled={pending}>
          Cancel
        </Button>
        <p className="text-xs text-stone-500">New and edited listings are reviewed before they appear publicly.</p>
      </div>
    </form>
  );
}
