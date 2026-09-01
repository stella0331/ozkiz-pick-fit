# 오즈키즈 픽앤핏 (OZKIZ Pick & Fit)

노션 제품DB · 모델DB를 실시간으로 불러와서 모델 착장을 조합해보고, 조합을 저장/공유하는 내부 도구입니다.

## 1. 로컬 없이 바로 Netlify에 배포하는 법

1. 이 폴더 전체를 GitHub 저장소에 올리거나, Netlify 대시보드에서 이 폴더를 드래그&드롭으로 배포합니다.
2. Netlify 사이트 설정 → **Environment variables** 에서 아래 값을 추가합니다.
   - `NOTION_TOKEN` : 노션 인테그레이션의 Internal Integration Secret (`ntn_...` 또는 `secret_...`로 시작하는 값)
3. 배포가 끝나면 사이트 주소로 접속해서 바로 사용할 수 있습니다.

> 노션 데이터베이스 ID(제품DB / 모델DB)는 코드 안에 이미 넣어뒀습니다.
> `netlify/functions/products.js`, `netlify/functions/models.js` 상단의 `PRODUCT_DB_ID`, `MODEL_DB_ID` 값이에요.
> 만약 나중에 DB를 새로 만들거나 옮기면 이 값만 바꿔주면 됩니다.

## 2. 노션 쪽 준비 (완료하셨다면 건너뛰어도 됨)

1. https://www.notion.so/my-integrations 에서 인테그레이션 생성 → Internal Integration Secret 복사
2. 제품DB, 모델DB 각각의 페이지에서 **공유(Share)** → 방금 만든 인테그레이션 연결 추가
3. 두 DB가 아래 속성 이름을 그대로 쓰고 있어야 앱이 정상 작동합니다.

**제품DB**
- 제품명 (제목)
- 대표이미지 (파일과 미디어)
- 복종 (셀렉트 — 원피스/세트/상의/하의/신발/부츠/아우터/잡화 등)
- 성별, 시즌, 제품유형, 진행상태

**모델DB**
- 이름 (제목)
- 이미지 (파일과 미디어)
- 카테고리 (키즈/주니어/AI버추얼)
- 진행여부, 국적, 사이즈, 인스타그램

속성 이름을 바꾸셨다면 `netlify/functions/products.js`, `netlify/functions/models.js` 안의 `getTitle(page, "제품명")` 같은 문자열도 함께 바꿔주세요.

## 3. 촬영회차 & 조합표 기능

앱에 들어가면 먼저 **촬영회차 목록**이 나옵니다. "+ 새 촬영 만들기"로 카테고리(컨셉 촬영 / 호리존 촬영)를 고르고 큰제목을 입력하면 새 촬영회차가 만들어져요. 각 촬영회차는 수정·삭제가 가능합니다.

촬영회차 안에 들어가면:
1. **모델 선택** — 여러 명 체크 가능. 체크한 인원만큼 Y축(세로) 행이 생깁니다.
2. **표 만들기** 누르면 조합표가 생성됩니다. X축(가로)은 "착장" 컬럼이고, "+ 착장 추가"로 얼마든지 늘릴 수 있어요. 컬럼 제목은 클릭해서 바로 수정 가능합니다.
3. 왼쪽 사이드바에서 제품명 검색 · 시즌/유형/카테고리 칩 필터로 제품을 찾고, 썸네일을 표의 셀(모델 × 착장) 위로 드래그해서 놓으면 담깁니다. 셀 안 썸네일의 × 버튼으로 개별 제거도 가능해요.
4. **표 저장**으로 조합표 전체를 저장하고, "저장된 조합표" 탭에서 다시 불러오거나 삭제할 수 있습니다.
촬영회차를 삭제하면 그 안의 저장된 조합표도 함께 삭제됩니다.

## 4. 조합 저장은 어디에 저장되나요?

Netlify Blobs(사이트에 내장된 저장소)를 사용합니다. 보통은 별도 설정 없이 자동으로 동작하지만, 사이트에 따라 "The environment has not been configured to use Netlify Blobs" 오류가 날 수 있어요. 그럴 땐 아래 두 값을 Netlify 환경변수에 추가하고 재배포하면 해결됩니다.

- `NETLIFY_SITE_ID` : Netlify 사이트 설정 → General → Site details에 있는 **Site ID**(API ID라고도 표시됨)를 복사해서 넣습니다.
- `NETLIFY_BLOBS_TOKEN` : Netlify 우측 상단 프로필 → User settings → Applications → **New access token**으로 발급한 Personal Access Token을 넣습니다. 이 토큰은 계정 전체 권한을 가지니 외부에 공유하지 마세요.

두 값이 없으면 자동 설정 방식을 그대로 시도하고, 두 값이 다 있으면 그 값으로 직접 연결합니다.

## 5. 로컬에서 테스트하고 싶다면

```bash
npm install -g netlify-cli
npm install
netlify dev
```

`netlify dev`를 실행하기 전, 프로젝트 루트에 `.env` 파일을 만들고 아래처럼 넣어주세요.

```
NOTION_TOKEN=ntn_여기에_토큰
```

## 폴더 구조

```
netlify/functions/
  _notion.js      노션 API 호출 공통 함수
  products.js     제품DB 조회 API (/api/products)
  models.js       모델DB 조회 API (/api/models)
  looks.js        조합 저장/조회/삭제 API (/api/looks)
public/
  index.html      화면 구조
  style.css       디자인
  app.js          화면 동작 로직
```
