const { createClient } = require('@supabase/supabase-js')
const sdk = require('node-appwrite')
const fs = require('fs')

// .env.local 수동 파싱
const envContent = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) env[key.trim()] = vals.join('=').trim()
})

const client = new sdk.Client()
  .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_KEY)

const dbs = new sdk.Databases(client)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function migrate() {
  console.log('=== Sigmania 데이터 마이그레이션 시작 ===')
  console.log('[1] Supabase에서 전체 데이터 추출 중...')
  
  let all = []
  let from = 0
  while (true) {
    const { data, error } = await supabase.from('files').select('*').range(from, from + 999)
    if (error) throw error
    all = all.concat(data)
    console.log(`  현재까지 추출: ${all.length}개`)
    if (data.length < 1000) break
    from += 1000
  }
  
  console.log(`\n[2] 총 ${all.length}개 발견! Appwrite로 이사 시작...`)
  
  let ok = 0
  let fail = 0
  for (const item of all) {
    try {
      await dbs.createDocument('sigmania', 'files', sdk.ID.unique(), {
        name: item.name || '',
        image_url: item.image_url || null,
        image_name: item.image_name || null,
        audio_url: item.audio_url || null,
        audio_name: item.audio_name || null,
      })
      ok++
      if (ok % 50 === 0) console.log(`  이사 완료: ${ok}개...`)
    } catch (e) {
      fail++
    }
  }
  
  console.log(`\n=== 완료! 성공: ${ok}개 / 실패: ${fail}개 ===`)
  console.log('Appwrite 대시보드 [Databases > sigmania > files]에서 확인하세요!')
}

migrate().catch(console.error)
