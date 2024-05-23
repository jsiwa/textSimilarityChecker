import { calculateCombinedSimilarity, getSimilarityDescription } from './similarity';

(async () => {
  const text1 = await Bun.file('./text1.txt').text();
  const text2 = await Bun.file('./text2.txt').text();

  const combinedSimilarity = calculateCombinedSimilarity(text1, text2);
  const similarityDescription = getSimilarityDescription(combinedSimilarity);

  console.log(`综合相似度: ${combinedSimilarity}`);
  console.log(`相似度描述: ${similarityDescription}`);
})();
