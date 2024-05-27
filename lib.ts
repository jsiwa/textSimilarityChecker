import { TfIdf, LevenshteinDistance } from 'natural';
import cosineSimilarity from 'cosine-similarity';

// 示例文本
const text1 = await Bun.file('./text1.txt').text()
const text2 = await Bun.file('./text2.txt').text()

// 计算 Jaccard 相似度
function jaccardSimilarity(text1: string, text2: string): number {
    const wordsText1 = new Set(text1.split(/\s+/));
    const wordsText2 = new Set(text2.split(/\s+/));
    const intersection = new Set([...wordsText1].filter(word => wordsText2.has(word)));
    const union = new Set([...wordsText1, ...wordsText2]);
    return intersection.size / union.size;
}

// 计算余弦相似度
function cosineSimilarityTexts(text1: string, text2: string): number {
    const tfidf = new TfIdf();
    tfidf.addDocument(text1);
    tfidf.addDocument(text2);

    const vectors: number[][] = [[], []];
    const terms = new Set<string>();
    
    tfidf.listTerms(0).forEach(item => terms.add(item.term));
    tfidf.listTerms(1).forEach(item => terms.add(item.term));

    terms.forEach(term => {
        vectors[0].push(tfidf.tfidf(term, 0));
        vectors[1].push(tfidf.tfidf(term, 1));
    });

    return cosineSimilarity(vectors[0], vectors[1]);
}

// 计算莱文斯坦距离
function levenshteinDistance(text1: string, text2: string): number {
    const maxLen = Math.max(text1.length, text2.length);
    return 1 - (LevenshteinDistance(text1, text2) / maxLen);
}

// 综合相似度计算（简单平均）
function overallSimilarity(jaccard: number, cosine: number, levenshtein: number): number {
    return (jaccard + cosine + levenshtein) / 3;
}

// 计算相似度
const jaccard = jaccardSimilarity(text1, text2);
const cosine = cosineSimilarityTexts(text1, text2);
const levenshtein = levenshteinDistance(text1, text2);
const overall = overallSimilarity(jaccard, cosine, levenshtein);

// 判断相似度等级
let similarityLevel = "";
if (overall > 0.8) {
    similarityLevel = "高相似度";
} else if (overall > 0.5) {
    similarityLevel = "中等相似度";
} else {
    similarityLevel = "低相似度";
}

// 输出结果
console.log(`${similarityLevel}`);
console.log(`综合：${overall.toFixed(2)}`);
console.log(`Jaccard：${jaccard.toFixed(2)}`);
console.log(`Cosine：${cosine.toFixed(2)}`);
console.log(`Levenshtein：${levenshtein.toFixed(2)}`);
