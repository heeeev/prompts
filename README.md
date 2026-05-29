# Prompt Library

자주 쓰는 AI 프롬프트를 모아놓고 클릭 한 번에 복사하는 개인 라이브러리.

🌐 **Live**: https://heeeev.github.io/prompts/

## 새 프롬프트 추가

### 1. 본문이 짧은 경우 — `prompts.json`에 직접 작성

```json
{
  "id": "unique-id",
  "title": "프롬프트 제목",
  "description": "한 줄 설명",
  "category": "writing",
  "tags": ["tag1", "tag2"],
  "model": "GPT-4o",
  "prompt": "프롬프트 본문...",
  "usage": "사용법",
  "createdAt": "2026-05-29",
  "updatedAt": "2026-05-29"
}
```

### 2. 본문이 긴 경우 — 별도 파일로 분리

1. `public/data/prompts/<id>.md` 파일 생성 후 본문 작성
2. `prompts.json`에 메타데이터 추가하고 `"promptFile": "data/prompts/<id>.md"` 지정

### 3. 푸시 → 자동 배포

```bash
git add . && git commit -m "feat: add new prompt" && git push
```

푸시하면 1~2분 후 사이트에 반영됨.

## 카테고리

| ID | 라벨 |
|---|---|
| `3d` | 3D / 모델링 |
| `bbz` | BBZ |
| `image` | 이미지 생성 |
| `writing` | 글쓰기 / 카피 |
| `dev` | 개발 / 코딩 |
| `etc` | 기타 |

새 카테고리 추가는 `prompts.json`의 `categories` 배열 + `styles/theme.css`의 색상 변수(`--color-cat-<id>`) 동시 수정.

## 로컬 미리보기

```bash
cd public && python3 -m http.server 8000
# → http://localhost:8000
```

## 구조

```
prompts/
├── public/                     ← 배포 대상
│   ├── index.html
│   ├── styles/                 ← reset / theme / main
│   ├── scripts/                ← app / render / filter / clipboard
│   ├── data/
│   │   ├── prompts.json        ← 메타데이터
│   │   └── prompts/*.md        ← 본문 파일
│   └── assets/
└── .github/workflows/deploy.yml
```
