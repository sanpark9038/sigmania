---
name: bbs-inline-visual-design
description: "게시판(BBS) 제약 환경에서 inline style만으로 프리미엄 비주얼 질감을 구현하는 전문 가이드. SOOP TV / 아프리카TV / 네이버 카페 등 HTML 에디터 환경에 최적화."
risk: low
source: sanpark-internal
date_added: "2026-04-11"
---

# BBS Inline Visual Design Skill

## 🎯 목적

이 스킬은 **게시판 HTML 에디터의 제약** (외부 CSS 불가, `<style>` 태그 삭제, flexbox 무력화) 환경에서
**inline style만으로 방송급 프리미엄 비주얼**을 구현하기 위한 검증된 레시피와 기획 워크플로우를 포함한다.

---

## 🏗️ 0. 기획 및 설계 워크플로우 (Master Workflow)

BBS 상세페이지 제작 시 기술적 구현 이전에 다음의 기획 단계를 거친다.

1.  **정보 구조화 (Data Set)**: 타이틀, 스케줄, 참여 정보, 상금, 운영 정책을 모듈화한다.
2.  **비주얼 컨셉 확정 (Token)**: 컨셉에 맞는 그라디언트와 글로우 컬러(Emerald/Gold 등)를 선정한다.
3.  **레이아웃 매핑 (Mapping)**: `float` 기반의 다중 컬럼 구조를 설계한다. (800px ~ 1000px 기준)
4.  **컴포넌트 조립 (Assemble)**: 마스터 레시피를 활용하여 Hero 섹션부터 Footer까지 조립한다.

---

---

## 1. 🛡️ BBS 에디터 생존 법칙 (검증된 사실)

### ✅ 살아남는 속성 (SOOP TV 기준 검증 완료)
| 속성 | 사용 가능 | 비고 |
|:---|:---:|:---|
| `background: linear-gradient(...)` | ✅ | 다중 레이어도 가능 |
| `background: radial-gradient(...)` | ✅ | |
| `border`, `border-radius` | ✅ | `border-image`는 불안정 |
| `box-shadow` | ✅ | 다중 레이어 가능 (글로우 핵심) |
| `text-shadow` | ✅ | 네온 발광 핵심 |
| `color`, `font-size`, `font-weight` | ✅ | |
| `padding`, `margin` | ✅ | |
| `display: block / inline-block` | ✅ | |
| `float: left / right` | ✅ | **가로 배열의 유일한 안전 수단** |
| `overflow: hidden` | ✅ | float clearfix 필수 |
| `opacity` | ✅ | |
| `letter-spacing`, `line-height` | ✅ | |
| `min-height` | ✅ | |
| `box-sizing: border-box` | ✅ | float 레이아웃 필수 |

### ❌ 제거/무력화되는 속성 (절대 사용 금지)
| 속성 | 상태 | 대안 |
|:---|:---:|:---|
| `display: flex` | ❌ 무력화 | `float: left` |
| `display: grid` | ❌ 무력화 | `float: left` |
| `<table>` 태그 | ⚠️ 불안정 | 가로 배열 시 사용 금지 |
| `position: absolute/relative` | ⚠️ 불안정 | 사용 지양 |
| 빈 `<div>` (내용 없음) | ❌ 에디터 삭제 | 내용 있는 span으로 대체 |
| `<h1>`, `<h2>` | ⚠️ 크기 초기화됨 | `<span style="display:block; font-size:...">` |
| `<style>` 태그 | ❌ 완전 삭제 | 모든 style은 inline으로 |
| `calc()` | ⚠️ 불안정 | 고정값 또는 % 사용 |
| `border-image` | ⚠️ 불안정 | `background` 그라디언트로 대체 |

---

## 2. 🏗️ 레이아웃 구현 공식

### 2-1. 다단 컬럼 배열 (가로 3열 예시)
```html
<!-- 필수: 부모에 overflow:hidden -->
<div style="overflow:hidden;">
    <!-- 열1: float:left + width % -->
    <div style="float:left; width:30%; box-sizing:border-box;">
        [내용]
    </div>
    <!-- 열2: float:left + margin으로 간격 -->
    <div style="float:left; width:34%; margin:0 3%; box-sizing:border-box;">
        [내용]
    </div>
    <!-- 열3 -->
    <div style="float:left; width:30%; box-sizing:border-box;">
        [내용]
    </div>
    <!-- clearfix: 반드시 필요 -->
    <div style="clear:both;"></div>
</div>
```
> **규칙**: 열 너비 합계 + margin 합계 = 100% 이하로 맞출 것 (예: 30+3+34+3+30 = 100%)

### 2-2. 섹션 헤더 + 그라디언트 엣지 라인
```html
<!-- float으로 텍스트 왼쪽 고정, overflow:hidden으로 나머지 영역 점유 -->
<div style="overflow:hidden; margin-bottom:30px;">
    <span style="float:left; font-size:26px; font-weight:700; color:#00ffcc; line-height:40px;">
        섹션 제목
    </span>
    <!-- 나머지 영역에 그라디언트 선 배치 -->
    <div style="overflow:hidden; padding-left:16px;">
        <div style="height:40px; display:flex; align-items:center;">
            <div style="width:100%; height:1px; background:linear-gradient(to right, rgba(0,255,204,0.9) 0%, rgba(0,255,204,0.3) 30%, rgba(0,255,204,0) 100%); box-shadow:0 0 6px rgba(0,255,204,0.5);">
                <!-- 삭제 방지 공백 -->
                <span style="display:block; height:1px; font-size:1px; color:transparent;">.</span>
            </div>
        </div>
    </div>
    <div style="clear:both;"></div>
</div>
```

### 2-3. 제목 텍스트 (h1/h2 대체)
```html
<!-- h1/h2 사용 금지: 에디터가 font-size를 초기화함 -->
<!-- span + display:block 조합 사용 -->
<span style="font-size:62px; font-weight:900; color:#fff; display:block; line-height:1.1; letter-spacing:-2px;">
    메인 타이틀
</span>
```

---

## 3. 🎨 에메랄드 다크 색상 팔레트 토큰

```
/* === 에메랄드 글로우 팔레트 === */

[Primary Glow]   : #00ffcc          /* 에메랄드 발광 원색 */
[Primary Dim]    : rgba(0,255,204,0.7) /* 약한 에메랄드 */
[Primary Ghost]  : rgba(0,255,204,0.15) /* 아주 연한 에메랄드 */

[Dark Base]      : #000000          /* 최심부 */
[Dark 01]        : #050505          /* 거의 검정 */
[Dark 02]        : #0a0a0a          /* 카드 배경 */
[Dark 03]        : #111111          /* 구분선 배경 */
[Dark 04]        : #1e1e1e          /* 테두리 */
[Dark 05]        : #252525          /* 비활성 테두리 */

[Emerald Deep]   : #001a15          /* 에메랄드 딥 다크 */
[Emerald Mid]    : #002b20          /* 에메랄드 중간 */
[Emerald Bright] : #003535          /* 하이라이트 카드 배경 */

[Text White]     : #ffffff
[Text Bright]    : #f0f0f0
[Text Mid]       : #d0d0d0
[Text Dim]       : #888888
[Text Muted]     : #555555

[Accent Red]     : #ff5555          /* 경고/마감 */
[Accent Gold]    : #ffd700          /* 우승/특별 */
```

---

## 4. ✨ 비주얼 질감 레시피

### 4-1. 에메랄드 광석 카드 (하이라이트 버전)
```css
background: linear-gradient(160deg, #003535 0%, #001a15 50%, #000e0b 100%);
border: 1px solid rgba(0,255,204,0.7);
border-bottom: 3px solid #00ffcc;
border-radius: 14px;
box-shadow:
    0 0 25px rgba(0,255,204,0.18),    /* 외부 글로우 */
    0 0 60px rgba(0,255,204,0.06),    /* 넓은 아우라 */
    inset 0 1px 0 rgba(0,255,204,0.15),  /* 상단 하이라이트 선 */
    inset 0 0 20px rgba(0,255,204,0.04); /* 내부 발광 */
```

### 4-2. 다크 무광 카드 (일반 버전)
```css
background: linear-gradient(160deg, #0f0f0f 0%, #080808 100%);
border: 1px solid #252525;
border-bottom: 3px solid #252525;
border-radius: 14px;
box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.04),  /* 상단 미묘한 하이라이트 */
    0 4px 15px rgba(0,0,0,0.5);            /* 아래 그림자 */
```

### 4-3. 상금/CTA 카드 (에메랄드 결정체)
```css
background: linear-gradient(135deg,
    rgba(0,60,45,0.6) 0%,
    rgba(0,30,25,0.8) 40%,
    rgba(0,5,5,1) 100%
);
border: 1px solid rgba(0,255,204,0.3);
border-radius: 16px;
box-shadow:
    0 0 30px rgba(0,255,204,0.07),
    0 10px 40px rgba(0,0,0,0.7),
    inset 0 1px 0 rgba(0,255,204,0.12);
```

### 4-4. 정보 리스트 카드 (다크 패널)
```css
background: linear-gradient(160deg, #0d0d0d 0%, #050505 100%);
border: 1px solid #1e1e1e;
border-radius: 16px;
box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.03),
    0 6px 20px rgba(0,0,0,0.6);
```

### 4-5. 히어로 헤더 배경 (다중 레이어 깊이감)
```css
background:
    radial-gradient(ellipse at 70% 20%, rgba(0,80,60,0.6) 0%, transparent 55%),
    radial-gradient(ellipse at 30% 80%, rgba(0,40,40,0.4) 0%, transparent 50%),
    #000;
```

---

## 5. 💡 text-shadow 네온 발광 레시피

### 강한 에메랄드 발광 (숫자/핵심 텍스트)
```css
text-shadow:
    0 0 15px rgba(0,255,204,0.7),   /* 1차 글로우 */
    0 0 40px rgba(0,255,204,0.2),   /* 2차 넓은 아우라 */
    0 0 80px rgba(0,255,204,0.05);  /* 3차 원거리 아우라 */
```

### 흰색 텍스트 미묘한 발광 (제목)
```css
text-shadow:
    0 0 30px rgba(0,255,204,0.25),
    0 2px 4px rgba(0,0,0,0.8);
```

### 보조 에메랄드 발광 (서브 텍스트)
```css
text-shadow: 0 0 10px rgba(0,255,204,0.5);
```

---

## 6. 🚨 아티팩트 방지 체크리스트

작업 전 반드시 확인:

- [ ] 빈 `<div>` 있는가? → `<span style="color:transparent;font-size:1px;">.</span>` 으로 채울 것
- [ ] `display: flex` 사용했는가? → `float: left`로 교체
- [ ] `<h1>`, `<h2>` 사용했는가? → `<span style="display:block">` 으로 교체
- [ ] float 컨테이너에 `<div style="clear:both;">` 있는가?
- [ ] float 카드 너비 합산이 100% 이하인가?
- [ ] `<style>` 태그 없는가?
- [ ] 모든 스타일이 inline으로만 작성됐는가?
- [ ] `calc()` 없는가?

---

## 7. 📋 검증된 환경 정보

- **타겟 환경**: SOOP TV (아프리카TV) 게시판 HTML 에디터
- **최대 폭**: `800px` (max-width 기준)
- **폰트**: `'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif`
- **기준 배경색**: `#000000`
- **주 강조색**: `#00ffcc` (에메랄드 발광)
- **검증 날짜**: 2026-04-11
- **검증자**: 박부장 (Antigravity / El-Rade Park)
