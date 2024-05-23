import nodejieba from "nodejieba";

interface Vector {
  [word: string]: number;
}

const stopWords = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一个', '上', '也', '很', '到', '说', '要', '以',
  '而', '于', '又', '及', '与', '把', '那', '你', '这', '他', '她', '它', '我们', '你们', '他们', '她们', '它们', '这儿', '那儿', '这里', '那里', '个',
  '么', '之', '其', '或', '被', '更', '最', '但', '并', '等', '等', '那么', '因为', '所以', '如果', '虽然', '然而', '为了', '对于', '关于', '就是', '还有', '而且',
  '已经', '可以', '通过', '自己', '时候', '没有', '然后', '可能', '现在', '之前', '之后', '将', '则', '于', '与', '及', '个', '各', '每', '次', '再', '也', '又', '仍', '仍然',
  '并且', '不是', '就是', '因此', '为何', '什么', '哪', '哪里', '谁', '怎样', '如何', '为什么', '怎么', '呢', '啊', '哦', '嗯', '哎', '哈', '哦', '嗨', '喂',
  '那么', '啦', '吧', '吗', '哦', '吧', '么', '哪', '哪儿', '呢', '啊', '呀', '哦', '呐', '吗', '哪', '啥', '吖', '哇', '呀', '哟', '啰', '咯', '哪', '哪个', '哪儿', '啥', '哈', '哦', '哇', '呵', '啐', '嗯', '啧', '嘿', '唉', '咳', '哎', '唔', '哪', '哈', '啧', '哼', '啥'
  // 你可以根据需要继续添加更多的中文停用词
]);

function normalizeText(text: string): string {
  // 移除换行符并保留中文字符、字母、数字和常见标点符号
  return text.replace(/[\r\n]+/g, ' ')
             .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s.,!?;:，。！？；：]/g, '')
             .toLowerCase()
             .split(' ')
             .filter(word => !stopWords.has(word))
             .join(' ');
}

function segmentText(text: string): string[] {
  return nodejieba.cut(text);
}

// Jaccard 相似度计算
function jaccardSimilarity(tokens1: string[], tokens2: string[]): number {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

// 词频向量化
function termFrequency(tokens: string[]): Vector {
  const tf: Vector = {};
  const tokenCount = tokens.length;
  tokens.forEach(token => {
    if (!tf[token]) {
      tf[token] = 0;
    }
    tf[token] += 1 / tokenCount; // 归一化词频
  });
  return tf;
}

// 余弦相似度计算
function cosineSimilarity(vecA: Vector, vecB: Vector): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  const allWords = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  allWords.forEach(word => {
    const a = vecA[word] || 0;
    const b = vecB[word] || 0;
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  });

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

// 计算余弦相似度
function calculateCosineSimilarity(tokens1: string[], tokens2: string[]): number {
  const tf1 = termFrequency(tokens1);
  const tf2 = termFrequency(tokens2);

  return cosineSimilarity(tf1, tf2);
}

// Levenshtein 距离计算
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const dp: number[][] = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) {
    dp[i][0] = i;
  }

  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
      }
    }
  }

  return dp[len1][len2];
}

// 计算 Levenshtein 相似度
function calculateLevenshteinSimilarity(tokens1: string[], tokens2: string[]): number {
  const str1 = tokens1.join('');
  const str2 = tokens2.join('');

  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  return 1 - distance / maxLength;
}

// 综合相似度计算
export function calculateCombinedSimilarity(text1: string, text2: string): number {
  const normalizedText1 = normalizeText(text1);
  const normalizedText2 = normalizeText(text2);

  const tokens1 = segmentText(normalizedText1);
  const tokens2 = segmentText(normalizedText2);

  const jaccard = jaccardSimilarity(tokens1, tokens2);
  const cosine = calculateCosineSimilarity(tokens1, tokens2);
  const levenshtein = calculateLevenshteinSimilarity(tokens1, tokens2);

  console.log(`Jaccard 相似度: ${jaccard}`);
  console.log(`Cosine 相似度: ${cosine}`);
  console.log(`Levenshtein 相似度: ${levenshtein}`);

  // 调整权重，根据需要调整
  const weights = [0.3, 0.4, 0.3];
  const combinedSimilarity = jaccard * weights[0] + cosine * weights[1] + levenshtein * weights[2];

  return combinedSimilarity;
}

// 根据相似度返回相应的文字描述
export function getSimilarityDescription(similarity: number): string {
  if (similarity >= 0.8) {
    return "高相似度";
  } else if (similarity >= 0.5) {
    return "中等相似度";
  } else if (similarity >= 0.25) {
    return "低相似度";
  } else {
    return "非常低相似度";
  }
}
