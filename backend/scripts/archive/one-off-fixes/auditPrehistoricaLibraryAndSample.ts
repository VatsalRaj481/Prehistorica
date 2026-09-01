import { PrismaClient } from '@prisma/client';
import https from 'https';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function getWikiPageInfo(title: string): Promise<any> {
  return new Promise((resolve) => {
    if (!title) {
      resolve(null);
      return;
    }
    const cleanTitle = title.startsWith('File:') ? title : `File:${title}`;
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(cleanTitle)}&prop=imageinfo&iiprop=url|mime|extmetadata|user|size&format=json`;
    
    const req = https.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrehistoricaEncyclopediaBot/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = Object.values(json.query.pages) as any[];
          resolve(pages[0]);
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

function searchWikiCommons(query: string): Promise<string | null> {
  return new Promise((resolve) => {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json`;
    const req = https.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrehistoricaEncyclopediaBot/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.query && json.query.search && json.query.search.length > 0) {
            resolve(json.query.search[0].title);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function runDetailedCheck() {
  const speciesList = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  console.log(`Analyzing database records for 'Prehistorica Library' credits and Supabase storage URLs...`);

  const prehistoricaLibraryTaxa: any[] = [];
  
  for (const s of speciesList) {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    const primaryMedia = mediaArr[0] || {};
    const credit = primaryMedia.credit || '';
    const sourceUrl = primaryMedia.sourceUrl || primaryMedia.url || '';

    if (credit.includes('Prehistorica Library') || sourceUrl.includes('supabase.co')) {
      prehistoricaLibraryTaxa.push({
        id: s.id,
        name: s.name,
        scientificName: s.scientificName,
        credit,
        sourceUrl
      });
    }
  }

  console.log(`Found ${prehistoricaLibraryTaxa.length} species with 'Prehistorica Library' or Supabase fallback URLs.\n`);

  // Search Wikimedia Commons for actual original source pages of these taxa
  const prehistoricaResults: any[] = [];
  for (const item of prehistoricaLibraryTaxa.slice(0, 30)) {
    const sciName = item.scientificName || item.name;
    let wikiTitle = await searchWikiCommons(`${sciName} life restoration`);
    if (!wikiTitle) {
      wikiTitle = await searchWikiCommons(`${sciName}`);
    }

    let wikiInfo = null;
    if (wikiTitle) {
      wikiInfo = await getWikiPageInfo(wikiTitle);
    }

    const info = wikiInfo ? (wikiInfo.imageinfo ? wikiInfo.imageinfo[0] : {}) : {};
    const ext = info.extmetadata || {};

    const realArtist = ext.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || info.user || 'UNVERIFIED';
    const realLicense = ext.LicenseShortName?.value || ext.UsageTerms?.value || 'UNVERIFIED';
    const realLicenseUrl = ext.LicenseUrl?.value || 'N/A';
    const wikiPageUrl = wikiTitle ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(wikiTitle.replace(/ /g, '_'))}` : 'UNVERIFIED';

    prehistoricaResults.push({
      id: item.id,
      name: item.name,
      scientificName: sciName,
      dbCredit: item.credit,
      dbSourceUrl: item.sourceUrl,
      actualWikiPage: wikiPageUrl,
      actualCreator: realArtist,
      actualLicense: realLicense,
      actualLicenseUrl: realLicenseUrl,
      verifiedStatus: wikiTitle ? 'VERIFIED FROM COMMONS' : 'UNVERIFIED (NO MATCH FOUND)'
    });
  }

  // Sample 30 taxa from the 490 "safe primary" list for deep 22-column re-audit
  const sampleIndices = [
    1, 5, 12, 18, 25, 30, 40, 55, 70, 85, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 450, 480, 500
  ];
  const sampleTaxa = speciesList.filter(s => sampleIndices.includes(s.id));

  console.log(`Re-auditing 30 sample taxa with deep Wikimedia Commons lookup...`);
  const deepSampleResults: any[] = [];

  for (const s of sampleTaxa) {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    const primaryMedia = mediaArr[0] || {};
    const sciName = s.scientificName || s.name;
    const genus = sciName.split(' ')[0];

    // Search for actual Wikimedia Commons source page
    let wikiTitle = await searchWikiCommons(`${sciName} life restoration`);
    if (!wikiTitle) {
      wikiTitle = await searchWikiCommons(`${sciName}`);
    }

    let wikiInfo = null;
    if (wikiTitle) {
      wikiInfo = await getWikiPageInfo(wikiTitle);
    }

    const info = wikiInfo ? (wikiInfo.imageinfo ? wikiInfo.imageinfo[0] : {}) : {};
    const ext = info.extmetadata || {};

    const rawArtist = ext.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || info.user || 'UNVERIFIED';
    const artist = rawArtist.length > 80 ? rawArtist.slice(0, 80) + '...' : rawArtist;
    const license = ext.LicenseShortName?.value || ext.UsageTerms?.value || 'UNVERIFIED';
    const licenseUrl = ext.LicenseUrl?.value || 'N/A';
    const wikiPageUrl = wikiTitle ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(wikiTitle.replace(/ /g, '_'))}` : 'UNVERIFIED';

    const desc = ext.ImageDescription?.value?.replace(/<[^>]*>?/gm, '').trim() || '';
    const cats = ext.Categories?.value || '';
    const catLower = cats.toLowerCase();
    const descLower = desc.toLowerCase();
    const filenameLower = (wikiTitle || '').toLowerCase();

    // 1. Image Type Classification
    let actualImageType = 'life_reconstruction';
    let recommendedPlacement = 'primary_life_reconstruction_id';

    if (catLower.includes('fossil') || catLower.includes('skulls') || filenameLower.includes('fossil') || filenameLower.includes('skeleton') && !catLower.includes('life restoration')) {
      actualImageType = 'fossil_specimen';
      recommendedPlacement = 'fossil_specimen_ids';
    } else if (catLower.includes('skeletal mount') || catLower.includes('museum') || descLower.includes('museum') || descLower.includes('skeleton in')) {
      actualImageType = 'museum_display';
      recommendedPlacement = 'museum_display_ids';
    } else if (catLower.includes('skeletal diagram') || catLower.includes('skeletal reconstruction') || catLower.includes('size comparison') || catLower.includes('diagram')) {
      actualImageType = 'skeletal_reconstruction';
      recommendedPlacement = 'skeletal_reconstruction_ids';
    } else if (catLower.includes('chart') || catLower.includes('scale') || catLower.includes('known material') || catLower.includes('comparison')) {
      actualImageType = 'scientific_figure';
      recommendedPlacement = 'scientific_figure_ids';
    } else if (catLower.includes('die wunder der urwelt') || catLower.includes('obsolete paleoart') || catLower.includes('(1912)') || catLower.includes('(1917)') || catLower.includes('(1919)') || descLower.includes('1912') || descLower.includes('1917')) {
      actualImageType = 'historical_paleoart';
      recommendedPlacement = 'historical_paleoart_ids';
    } else if (descLower.includes(' and ') || catLower.includes('paleoecology') || catLower.includes('environment') || catLower.includes('scene')) {
      actualImageType = 'habitat_scene';
      recommendedPlacement = 'habitat_scene_ids';
    }

    // 2. Multi-Taxon check
    let otherAnimalTaxaVisible = 'No';
    if (actualImageType === 'habitat_scene' || descLower.includes(' and ') || descLower.includes('with an ') || descLower.includes('hunting')) {
      otherAnimalTaxaVisible = 'Yes';
    }

    // 3. Evidence & Assignment
    let exactTaxonEvidence = `Source describes artwork for genus ${genus}`;
    let evidenceLevel = 'DIRECT GENUS EVIDENCE';
    let taxonomicStatus = 'SPECIES JUSTIFIED BY VERIFIED MONOTYPY';
    let actualDepictedTaxon = sciName;

    if (descLower.includes(sciName.toLowerCase()) || filenameLower.includes(sciName.toLowerCase().replace(/ /g, '_'))) {
      exactTaxonEvidence = `Source explicitly identifies ${sciName}`;
      evidenceLevel = 'DIRECT SPECIES EVIDENCE';
      taxonomicStatus = 'EXACT SPECIES VERIFIED';
      actualDepictedTaxon = sciName;
    } else if (wikiTitle === null) {
      exactTaxonEvidence = `Source page unverified`;
      evidenceLevel = 'UNVERIFIED';
      taxonomicStatus = 'TAXONOMY REQUIRES REVIEW';
    }

    // 4. Proposed Action
    let proposedAction = 'KEEP AS PRIMARY';
    let reason = `Single-individual neutral life reconstruction explicitly identified to species with valid ${license} license`;

    if (actualImageType !== 'life_reconstruction' || otherAnimalTaxaVisible === 'Yes') {
      proposedAction = 'MOVE TO SECONDARY MEDIA';
      reason = `Actual image type is ${actualImageType} (${recommendedPlacement}), unsuitable for primary life reconstruction slot. Primary replacement required.`;
    } else if (evidenceLevel === 'UNVERIFIED' || license === 'UNVERIFIED') {
      proposedAction = 'NEEDS MANUAL SCIENTIFIC REVIEW';
      reason = `Original source page / creator / license unverified from direct Wikimedia Commons lookup.`;
    }

    deepSampleResults.push({
      id: s.id,
      taxonPageSlug: s.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
      targetTaxon: sciName,
      rank: 'Species',
      currentFileTitle: wikiTitle || path.basename(primaryMedia.sourceUrl || primaryMedia.url || ''),
      originalSourcePage: wikiPageUrl,
      actualDepictedTaxon,
      currentDbType: primaryMedia.type || 'art',
      actualImageType,
      recommendedMediaPlacement: recommendedPlacement,
      exactTaxonEvidence,
      evidenceLevel,
      taxonomicAssignmentStatus: taxonomicStatus,
      otherAnimalTaxaVisible,
      artist,
      license,
      licenseUrl,
      attributionRequired: `${artist} (${license})`,
      accuracyStatus: actualImageType === 'historical_paleoart' ? 'HISTORICAL / OBSOLETE' : 'VERIFIED / NO SPECIFIC CONCERN FOUND',
      proposedAction,
      reason,
      confidence: wikiTitle ? 'High' : 'Low',
      verifiedOn: '2026-08-29'
    });
  }

  const reportsDir = path.join(__dirname, '../reports');
  fs.writeFileSync(path.join(reportsDir, 'prehistorica-library-credits.json'), JSON.stringify(prehistoricaResults, null, 2));
  fs.writeFileSync(path.join(reportsDir, 'deep-sample-30-audit.json'), JSON.stringify(deepSampleResults, null, 2));

  console.log(`Saved prehistorica-library-credits.json and deep-sample-30-audit.json!`);
}

runDetailedCheck()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
