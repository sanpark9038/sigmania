const fs = require('fs');

try {
  // 1. sample_refined.json 읽기
  const sampleRefined = JSON.parse(fs.readFileSync('sample_refined.json', 'utf8'));
  const sampleMap = new Map();
  sampleRefined.forEach(item => {
    sampleMap.set(item.sig_number.toString(), item.title);
  });

  // 2. site_names_json.txt 읽기 (Supabase DB 결과)
  let dbRaw = fs.readFileSync('site_names_json.txt', 'utf8');
  dbRaw = dbRaw.replace(/^\uFEFF/, '');
  
  const dbData = JSON.parse(dbRaw);
  const siteNames = dbData.rows.map(item => item.name);
  const siteSet = new Set(siteNames);

  // 3. 분석 진행
  const inSiteNotInSample = [];
  const inSampleNotInSite = [];

  // 사이트에는 있는데 샘플에는 없는 경우
  siteNames.forEach(name => {
    if (!sampleMap.has(name)) {
      inSiteNotInSample.push(name);
    }
  });

  // 샘플에는 있는데 사이트에는 없는 경우
  sampleRefined.forEach(item => {
    const num = item.sig_number.toString();
    if (!siteSet.has(num)) {
      inSampleNotInSite.push({ number: num, title: item.title });
    }
  });

  // 4. 리포트 생성
  let report = `# 📊 Sigmania 자산 분석 리포트\n\n`;
  report += `분석 일시: ${new Date().toLocaleString()}\n\n`;

  report += `## ❌ 사이트에는 있으나 샘플(sample_refined.json)에 없는 항목 (${inSiteNotInSample.length}개)\n`;
  if (inSiteNotInSample.length > 0) {
    report += inSiteNotInSample.sort((a,b) => Number(a)-Number(b)).map(n => `- ${n}`).join('\n') + '\n';
  } else {
    report += `데이터가 완벽하게 일치합니다.\n`;
  }

  report += `\n## ❓ 샘플(sample_refined.json)에는 있으나 사이트에 누락된 항목 (${inSampleNotInSite.length}개)\n`;
  if (inSampleNotInSite.length > 0) {
    report += inSampleNotInSite.sort((a,b) => Number(a.number)-Number(b.number)).map(item => `- **${item.number}**: ${item.title}`).join('\n') + '\n';
  } else {
    report += `누락된 항목이 없습니다.\n`;
  }

  fs.writeFileSync('ASSET_DISCREPANCY_REPORT.md', report);
  console.log('ASSET_DISCREPANCY_REPORT.md 생성 완료');

} catch (error) {
  console.error('분석 중 오류 발생:', error);
  process.exit(1);
}
