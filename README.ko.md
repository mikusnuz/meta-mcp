[English](README.md) | **한국어**

# meta-mcp

[![npm version](https://img.shields.io/npm/v/@mikusnuz/meta-mcp)](https://www.npmjs.com/package/@mikusnuz/meta-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Instagram Graph API**, **Threads API**, **Meta 플랫폼** 관리를 위한 완전한 MCP 서버입니다.

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.ko.md">한국어</a>
</p>

## 주요 기능

- **52개 도구**: Instagram(31), Threads(15), Meta 플랫폼(6)
- **Instagram**: 사진/영상/릴스/스토리/캐러셀 게시, 댓글 관리, 인사이트 조회, 해시태그 검색, DM 관리
- **Threads**: 텍스트/이미지/영상/캐러셀 게시, 답글 관리, 인사이트 조회
- **Meta**: token 교환/갱신/디버그, 웹훅 관리
- **2개 리소스**: Instagram 프로필, Threads 프로필
- **2개 프롬프트**: 크로스 플랫폼 콘텐츠 게시, 분석 리포트
- `x-app-usage` 헤더를 통한 속도 제한 추적

## 계정 요건

| 플랫폼 | 계정 유형 | 참고 |
|--------|-----------|------|
| **Instagram** | 비즈니스 또는 크리에이터 계정 | 개인 계정은 Graph API를 사용할 수 없습니다. Instagram 설정에서 무료로 전환 가능합니다 |
| **Threads** | 모든 계정 | 모든 Threads 계정이 API를 사용할 수 있습니다 |
| **Meta** (token/웹훅 도구) | Meta 개발자 앱 | [developers.facebook.com](https://developers.facebook.com)에서 생성하세요 |

## 설치

### npx (권장)

```json
{
  "mcpServers": {
    "meta": {
      "command": "npx",
      "args": ["-y", "@mikusnuz/meta-mcp"],
      "env": {
        "INSTAGRAM_ACCESS_TOKEN": "your_ig_token",
        "INSTAGRAM_USER_ID": "your_ig_user_id",
        "THREADS_ACCESS_TOKEN": "your_threads_token",
        "THREADS_USER_ID": "your_threads_user_id"
      }
    }
  }
}
```

### 수동 설치

```bash
git clone https://github.com/mikusnuz/meta-mcp.git
cd meta-mcp
npm install
npm run build
```

```json
{
  "mcpServers": {
    "meta": {
      "command": "node",
      "args": ["/path/to/meta-mcp/dist/index.js"],
      "env": {
        "INSTAGRAM_ACCESS_TOKEN": "your_ig_token",
        "INSTAGRAM_USER_ID": "your_ig_user_id",
        "THREADS_ACCESS_TOKEN": "your_threads_token",
        "THREADS_USER_ID": "your_threads_user_id"
      }
    }
  }
}
```

## 환경 변수

| 변수 | 필수 여부 | 설명 |
|------|-----------|------|
| `INSTAGRAM_ACCESS_TOKEN` | Instagram 사용 시 | Instagram Graph API access token |
| `INSTAGRAM_USER_ID` | Instagram 사용 시 | Instagram 비즈니스/크리에이터 계정 ID |
| `THREADS_ACCESS_TOKEN` | Threads 사용 시 | Threads API access token |
| `THREADS_USER_ID` | Threads 사용 시 | Threads 사용자 ID |
| `META_APP_ID` | token/웹훅 도구 사용 시 | Meta 앱 ID |
| `META_APP_SECRET` | token/웹훅 도구 사용 시 | Meta 앱 시크릿 |

사용하는 플랫폼에 해당하는 변수만 설정하면 됩니다. 예를 들어 Threads만 사용한다면 `THREADS_ACCESS_TOKEN`과 `THREADS_USER_ID`만 설정하세요.

## 도구 목록

### Meta 플랫폼 (6)

| 도구 | 설명 |
|------|------|
| `meta_exchange_token` | 단기 token을 장기 token으로 교환 (~60일) |
| `meta_refresh_token` | 만료 전 장기 token 갱신 |
| `meta_debug_token` | token 유효성, 만료일, 권한 범위 확인 |
| `meta_get_app_info` | Meta 앱 정보 조회 |
| `meta_subscribe_webhook` | 웹훅 알림 구독 |
| `meta_get_webhook_subscriptions` | 현재 웹훅 구독 목록 조회 |

### Instagram — 게시 (6)

| 도구 | 설명 |
|------|------|
| `ig_publish_photo` | 사진 게시 |
| `ig_publish_video` | 영상 게시 |
| `ig_publish_carousel` | 캐러셀/앨범 게시 (2~10개 항목) |
| `ig_publish_reel` | 릴스 게시 |
| `ig_publish_story` | 스토리 게시 (24시간) |
| `ig_get_container_status` | 미디어 컨테이너 처리 상태 확인 |

### Instagram — 미디어 (5)

| 도구 | 설명 |
|------|------|
| `ig_get_media_list` | 게시된 미디어 목록 조회 |
| `ig_get_media` | 미디어 상세 정보 조회 |
| `ig_delete_media` | 미디어 게시물 삭제 |
| `ig_get_media_insights` | 미디어 분석 데이터 조회 |
| `ig_toggle_comments` | 게시물 댓글 활성화/비활성화 |

### Instagram — 댓글 (7)

| 도구 | 설명 |
|------|------|
| `ig_get_comments` | 게시물의 댓글 조회 |
| `ig_get_comment` | 댓글 상세 정보 조회 |
| `ig_post_comment` | 댓글 작성 |
| `ig_get_replies` | 댓글의 답글 조회 |
| `ig_reply_to_comment` | 댓글에 답글 작성 |
| `ig_hide_comment` | 댓글 숨기기/숨기기 해제 |
| `ig_delete_comment` | 댓글 삭제 |

### Instagram — 프로필 & 인사이트 (3)

| 도구 | 설명 |
|------|------|
| `ig_get_profile` | 계정 프로필 정보 조회 |
| `ig_get_account_insights` | 계정 수준 분석 데이터 조회 |
| `ig_business_discovery` | 다른 비즈니스 계정 조회 |

### Instagram — 해시태그 (4)

| 도구 | 설명 |
|------|------|
| `ig_search_hashtag` | 이름으로 해시태그 검색 |
| `ig_get_hashtag` | 해시태그 정보 조회 |
| `ig_get_hashtag_recent` | 해시태그의 최근 미디어 조회 |
| `ig_get_hashtag_top` | 해시태그의 인기 미디어 조회 |

### Instagram — 멘션 & 태그 (2)

| 도구 | 설명 |
|------|------|
| `ig_get_mentioned_comments` | 나를 멘션한 댓글 조회 |
| `ig_get_tagged_media` | 나를 태그한 미디어 조회 |

### Instagram — 메시징 (4)

| 도구 | 설명 |
|------|------|
| `ig_get_conversations` | DM 대화 목록 조회 |
| `ig_get_messages` | 대화 내 메시지 조회 |
| `ig_send_message` | DM 전송 |
| `ig_get_message` | 메시지 상세 정보 조회 |

### Threads — 게시 (5)

| 도구 | 설명 |
|------|------|
| `threads_publish_text` | 텍스트 게시물 게시 |
| `threads_publish_image` | 이미지 게시물 게시 |
| `threads_publish_video` | 영상 게시물 게시 |
| `threads_publish_carousel` | 캐러셀 게시 (2~20개 항목) |
| `threads_get_container_status` | 컨테이너 처리 상태 확인 |

### Threads — 미디어 (2)

| 도구 | 설명 |
|------|------|
| `threads_get_posts` | 게시된 게시물 목록 조회 |
| `threads_get_post` | 게시물 상세 정보 조회 |

### Threads — 답글 (4)

| 도구 | 설명 |
|------|------|
| `threads_get_replies` | 게시물의 답글 조회 |
| `threads_reply` | 게시물에 답글 작성 |
| `threads_hide_reply` | 답글 숨기기 |
| `threads_unhide_reply` | 답글 숨기기 해제 |

### Threads — 프로필 (2)

| 도구 | 설명 |
|------|------|
| `threads_get_profile` | Threads 프로필 정보 조회 |
| `threads_get_user_threads` | 사용자의 스레드 목록 조회 |

### Threads — 인사이트 (2)

| 도구 | 설명 |
|------|------|
| `threads_get_post_insights` | 게시물 분석 데이터 조회 |
| `threads_get_user_insights` | 계정 수준 분석 데이터 조회 |

## 리소스

| 리소스 URI | 설명 |
|-----------|------|
| `instagram://profile` | Instagram 계정 프로필 데이터 |
| `threads://profile` | Threads 계정 프로필 데이터 |

## 프롬프트

| 프롬프트 | 설명 |
|---------|------|
| `content_publish` | Instagram과 Threads에 동시 게시 |
| `analytics_report` | 통합 분석 리포트 생성 |

## Access Token 발급 방법

### Instagram

1. [developers.facebook.com](https://developers.facebook.com)에서 Meta 앱을 생성합니다
2. "Instagram Graph API" 제품을 추가합니다
3. Instagram 비즈니스 또는 크리에이터 계정을 연결합니다
4. Graph API Explorer에서 필요한 권한으로 token을 생성합니다
5. `meta_exchange_token`을 사용하여 장기 token(60일)으로 변환합니다

### Threads

1. [developers.facebook.com](https://developers.facebook.com)에서 Meta 앱을 생성합니다
2. "Threads API" 제품을 추가합니다
3. 인가 플로우를 완료하여 access token을 발급받습니다
4. `meta_exchange_token`을 사용하여 장기 token으로 변환합니다

## 라이선스

MIT
