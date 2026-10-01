import { getHubFacetsFromDb, getModelsFromDb } from '../frontend/lib/models-db.ts';

async function testPerf() {
  console.log('Testing DB query performance...');
  
  const t0 = Date.now();
  const facets = await getHubFacetsFromDb();
  console.log(`getHubFacetsFromDb took: ${Date.now() - t0}ms`);
  console.log('Total models in facets:', facets.totalModels);
  console.log('Capabilities count in facets:', facets.capabilities.length);

  const t1 = Date.now();
  const cardChat = await getModelsFromDb({ cardSlug: 'chat', limit: 100 });
  console.log(`getModelsFromDb(chat) took: ${Date.now() - t1}ms`);
  console.log('Chat total:', cardChat.total);
  console.log('Chat returned rows:', cardChat.data.length);

  const t2 = Date.now();
  const cardAll = await getModelsFromDb({ cardSlug: 'all', limit: 100 });
  console.log(`getModelsFromDb(all) took: ${Date.now() - t2}ms`);
  console.log('All total:', cardAll.total);
  console.log('All returned rows:', cardAll.data.length);
}

testPerf().catch(console.error);
