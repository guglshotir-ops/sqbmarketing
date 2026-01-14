import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gatnhnezkxtionzcuork.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdG5obmV6a3h0aW9uemN1b3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NzgxOCwiZXhwIjoyMDgzODYzODE4fQ.AcbeQfwC_sOBV57UesDDZq6K9hdwoPW4XJQFKC_qLEc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function cleanupVideos() {
  console.log('🧹 Starting video cleanup...\n');

  try {
    // Get all videos
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`📹 Found ${videos.length} videos\n`);

    let fixed = 0;
    let deleted = 0;
    let skipped = 0;

    for (const video of videos) {
      const url = video.url;
      let needsUpdate = false;
      let newUrl = url;
      let shouldDelete = false;

      // Check for old relative paths (from old project)
      if (url.startsWith('/sqbmarketing/') || url.startsWith('/videos/')) {
        console.log(`❌ [DELETE] Old relative path: ${url}`);
        shouldDelete = true;
      }
      // Check for old Google Drive format
      else if (url.includes('drive.google.com') && url.includes('/uc?export=download')) {
        const fileIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          newUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
          console.log(`🔧 [FIX] Converting Google Drive URL:`);
          console.log(`   Old: ${url}`);
          console.log(`   New: ${newUrl}`);
          needsUpdate = true;
        } else {
          console.log(`❌ [DELETE] Invalid Google Drive URL: ${url}`);
          shouldDelete = true;
        }
      }
      // Check for valid Supabase Storage URLs
      else if (url.includes('supabase.co/storage/v1/object/public/videos/')) {
        console.log(`✅ [OK] Valid Supabase Storage URL: ${url.substring(0, 80)}...`);
        skipped++;
        continue;
      }
      // Check for valid Google Drive preview URLs
      else if (url.includes('drive.google.com/file/d/') && url.includes('/preview')) {
        console.log(`✅ [OK] Valid Google Drive preview URL: ${url.substring(0, 80)}...`);
        skipped++;
        continue;
      }
      // Check for other valid direct URLs
      else if (url.startsWith('http://') || url.startsWith('https://')) {
        console.log(`✅ [OK] Valid direct URL: ${url.substring(0, 80)}...`);
        skipped++;
        continue;
      }
      // Unknown format - delete
      else {
        console.log(`❌ [DELETE] Unknown/invalid URL format: ${url}`);
        shouldDelete = true;
      }

      if (shouldDelete) {
        const { error: deleteError } = await supabase
          .from('videos')
          .delete()
          .eq('id', video.id);

        if (deleteError) {
          console.error(`   ⚠️  Error deleting: ${deleteError.message}`);
        } else {
          console.log(`   ✓ Deleted\n`);
          deleted++;
        }
      } else if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('videos')
          .update({ url: newUrl })
          .eq('id', video.id);

        if (updateError) {
          console.error(`   ⚠️  Error updating: ${updateError.message}\n`);
        } else {
          console.log(`   ✓ Updated\n`);
          fixed++;
        }
      }
    }

    console.log('\n📊 Cleanup Summary:');
    console.log(`   ✅ Fixed: ${fixed}`);
    console.log(`   ❌ Deleted: ${deleted}`);
    console.log(`   ⏭️  Skipped (OK): ${skipped}`);
    console.log(`   📹 Total processed: ${videos.length}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupVideos();
