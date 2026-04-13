const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: Using service role key for deletion might be safer if RLS is strict, 
// but we will try with anon key first as it's what we have in .env.local 
// and the app usually works with it.

const supabase = createClient(supabaseUrl, supabaseKey);

const targetNumbers = [
  "1119", "1414", "1415", "1818", "6464", "6777", "10020", "10048", "10058", "10099",
  "10100", "10115", "10116", "10224", "10267", "10445", "10467", "10524", "10799",
  "10801", "12121", "12483", "16977", "20099", "26977"
];

async function cleanup() {
  console.log(`🚀 [${targetNumbers.length}]개의 불일치 항목 삭제 작업을 시작합니다.`);

  for (const num of targetNumbers) {
    try {
      // 1. DB에서 데이터 조회
      const { data: record, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('name', num)
        .single();

      if (fetchError || !record) {
        console.log(`[${num}] 항목이 DB에 없습니다. 스킵합니다.`);
        continue;
      }

      console.log(`[${num}] 삭제 중... (ID: ${record.id})`);

      // 2. 스토리지 파일 삭제
      if (record.image_url) {
        const imageName = record.image_url.split('/').pop();
        if (imageName) {
          const { error: imgErr } = await supabase.storage.from('images').remove([imageName]);
          if (imgErr) console.error(`   - [이미지] 삭제 실패: ${imageName}`, imgErr);
          else console.log(`   - [이미지] 삭제 완료: ${imageName}`);
        }
      }

      if (record.audio_url) {
        const audioName = record.audio_url.split('/').pop();
        if (audioName) {
          const { error: audErr } = await supabase.storage.from('audio').remove([audioName]);
          if (audErr) console.error(`   - [음원] 삭제 실패: ${audioName}`, audErr);
          else console.log(`   - [음원] 삭제 완료: ${audioName}`);
        }
      }

      // 3. DB 레코드 삭제
      const { error: delError } = await supabase
        .from('files')
        .delete()
        .eq('id', record.id);

      if (delError) console.error(`   - [DB] 레코드 삭제 실패`, delError);
      else console.log(`   - [DB] 레코드 삭제 완료`);

    } catch (err) {
      console.error(`[${num}] 처리 중 예상치 못한 오류:`, err);
    }
  }

  console.log('✅ 모든 삭제 작업이 완료되었습니다.');
}

cleanup();
