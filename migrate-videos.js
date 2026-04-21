import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config'; // Make sure dot env is loaded

// Setup the backend client specifically with write-access
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1dg5ciuj',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function main() {
  console.log("🚀 Starting Sanity Video Migration Engine...");
  
  if (!process.env.SANITY_API_TOKEN) {
    console.error("❌ CRITICAL ERROR: SANITY_API_TOKEN is not defined in your environment!");
    console.error("Please add it to your .env.local file, then run this script again.");
    process.exit(1);
  }

  const filePath = path.join(process.cwd(), 'public', 'data', 'videos.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const categoriesArray = JSON.parse(fileContents);

  let totalMigrated = 0;
  
  // We process category by category, chunking the uploads to prevent hammering the Sanity API
  for (const group of categoriesArray) {
    console.log(`\n📂 Scanning Category: ${group.category} (${group.videos.length} videos)`);
    
    let transaction = client.transaction();
    let transactionCount = 0;

    for (const video of group.videos) {
      // Build the Sanity Document Shape securely to match our new schema fields
      const doc = {
        _id: `yt-vid-${video.id}`, // Custom idempotent ID to avoid exact duplicates
        _type: 'video',
        title: video.title,
        youtubeId: video.id,
        category: group.category, // e.g. "Live Feeds", "Official Music Videos"
        year: video.year,
        duration: video.duration || '',
        description: video.description || '',
        viewCount: video.viewCount || '',
      };

      transaction.createOrReplace(doc);
      transactionCount++;
      totalMigrated++;

      // If we hit 50 videos in the current bucket, aggressively dispatch the transaction
      if (transactionCount >= 50) {
        console.log(`   --> Dispatching transaction chunk (${transactionCount} videos)...`);
        await transaction.commit();
        transaction = client.transaction(); // Reset for next batch
        transactionCount = 0;
      }
    }

    // Flush any remaining videos in the transaction buffer for this category
    if (transactionCount > 0) {
      console.log(`   --> Dispatching final segment (${transactionCount} videos)...`);
      await transaction.commit();
    }
  }

  console.log(`\n✅ MIGRATION COMPLETE! Successfully uploaded ${totalMigrated} videos directly into Sanity CMS.`);
}

main().catch(console.error);
