'use server';

import { ApiClient, BibleClient } from '@youversion/platform-core';

function getBibleClient() {
  const apiClient = new ApiClient({
    appKey: process.env.YOUVERSION_API_KEY || '',
  });
  return new BibleClient(apiClient);
}

// Optionally cache these
export async function getVersions() {
  try {
    const client = getBibleClient();
    const versions = await client.getVersions('en'); // english versions
    return versions.data.map((v: any) => ({ id: v.id, title: v.title }));
  } catch (e) {
    console.error("Failed to fetch versions", e);
    return [];
  }
}

export async function getBooks(versionId: number) {
  try {
    const client = getBibleClient();
    const books = await client.getBooks(versionId);
    return books.data.map((b: any) => ({
      id: b.id,
      name: b.name || b.id, 
      chapters: b.chapters?.map((c: any) => c.title) || [],
    }));
  } catch (e) {
    console.error("Failed to fetch books", e);
    return [];
  }
}

export async function getPassage(versionId: number, passageId: string) {
  try {
    const client = getBibleClient();
    const passage = await client.getPassage(versionId, passageId);
    return { title: passage.reference, content: passage.content };
  } catch (e) {
    console.error("Failed to fetch passage", e);
    return { title: 'Error', content: '<p>Failed to load passage.</p>' };
  }
}
