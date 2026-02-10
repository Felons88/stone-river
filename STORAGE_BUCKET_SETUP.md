# 📦 Supabase Storage Bucket Setup

## ⚠️ IMPORTANT: Create Storage Bucket

You need to create a storage bucket in Supabase for photo uploads to work.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Create Storage Bucket**
   - Click on "Storage" in the left sidebar
   - Click "New bucket"
   - **Bucket name:** `jobs`
   - **Public bucket:** ✅ Yes (checked)
   - Click "Create bucket"

3. **Configure Bucket Policies**
   - Click on the `jobs` bucket
   - Go to "Policies" tab
   - Add the following policies:

### Policy 1: Public Read Access
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'jobs');
```

### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'jobs');
```

### Policy 3: Authenticated Delete
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'jobs');
```

### Policy 4: Public Upload (for unauthenticated photo uploads)
```sql
CREATE POLICY "Public can upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'jobs');
```

## 📁 Bucket Configuration

- **Name:** `jobs`
- **Public:** Yes
- **File size limit:** 5MB (recommended)
- **Allowed MIME types:** image/jpeg, image/png, image/gif, image/webp

## 🔧 Files Updated

The following files now use the correct bucket name `jobs`:

- ✅ `src/lib/storage.ts`
- ✅ `src/components/DonationScanner.tsx`
- ✅ `src/components/PhotoUpload.tsx` (uses storage.ts)

## ✅ Verification

After creating the bucket, test photo upload:

1. Go to Admin → Clients → [Select Client] → View Jobs & Photos
2. Click "Add Photos" on a booking
3. Upload a test image
4. Verify it appears in Supabase Storage → jobs bucket

## 🚨 Troubleshooting

**Error: "Bucket not found"**
- Make sure bucket name is exactly `jobs` (lowercase, no spaces)
- Verify bucket is created in Supabase dashboard
- Check bucket is set to public

**Error: "Permission denied"**
- Add the policies listed above
- Make sure bucket is public
- Check RLS policies are enabled

**Error: "File too large"**
- Default limit is 5MB
- Adjust in bucket settings if needed
- Compress images before upload

---

**Status:** Bucket name fixed in code. Create bucket in Supabase dashboard to complete setup.
