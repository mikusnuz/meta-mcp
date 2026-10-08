[English](README.md) | **한국어**

# meta-mcp

[![npm version](https://img.shields.io/npm/v/@mikusnuz/meta-mcp)](https://www.npmjs.com/package/@mikusnuz/meta-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Badge](https://lobehub.com/badge/mcp/mikusnuz-meta-mcp)](https://lobehub.com/discover/mcp/mikusnuz-meta-mcp)

**Instagram Graph API** (v26.0), **Threads API**, **Meta 플랫폼** 관리를 위한 완전한 MCP 서버입니다.

## 이런 경우에 사용하세요

AI 어시스턴트에 이렇게 말해보세요:

- **"인스타그램에 사진 올려줘"** — 사진, 영상, 릴스, 스토리, 캐러셀 게시
- **"Threads에 글 올려줘"** — 투표, GIF, 링크, 토픽 태그를 포함한 텍스트 게시물
- **"인스타그램 팔로워 수와 인사이트 확인해줘"** — 계정/게시물 수준 분석
- **"캐러셀 게시물 만들어줘"** — Instagram(2-10장) 또는 Threads(2-20장) 멀티 이미지 앨범
- **"최근 게시물 댓글에 답변해줘"** — 두 플랫폼의 댓글 읽기 및 답변
- **"인스타그램과 Threads에 동시 게시해줘"** — 내장 `content_publish` 프롬프트 활용
- **"Threads 계정 분석 데이터 보여줘"** — 조회수, 좋아요, 답글, 리포스트, 인용, 클릭
- **"인스타그램 DM 관리해줘"** — 대화 목록 조회, 메시지 읽기, 답장

> **AI 에이전트 연동**: [`llms.txt`](llms.txt)에서 머신 가독 요약을 확인하거나, [`templates/CLAUDE.md`](templates/CLAUDE.md) / [`templates/AGENTS.md`](templates/AGENTS.md)를 프로젝트에 복사하여 자동 MCP 검색을 활성화하세요.

## 주요 기능

- **66개 도구**: Instagram(33), Threads(27), Meta 플랫폼(6)
- **Instagram**: 사진/영상/릴스/스토리/캐러셀 게시(alt text 지원), 댓글 관리, 인사이트 조회, 해시태그 검색, DM 관리, 협업 초대 관리
- **Threads**: 텍스트/이미지/영상/캐러셀 게시(투표, GIF, 토픽 태그, 링크 첨부, alt text, 스포일러, 고스트 게시물, 답글 승인, 위치 태그, 인스타그램 스토리 크로스 공유 지원), 답글 및 대기 중인 답글 승인 관리, 게시물/위치 검색, 프로필/멘션 조회, oEmbed, 인사이트 조회, 게시물 삭제
- **Meta**: token 교환/갱신/디버그, 웹훅 관리
- **2개 리소스**: Instagram 프로필, Threads 프로필
- **2개 프롬프트**: 크로스 플랫폼 콘텐츠 게시, 분석 리포트
- `x-app-usage` 헤더를 통한 속도 제한 추적

## v2.2.0 변경사항

- Instagram 비즈니스 계정 조회와 협업 초대 요청을 수정했습니다. 초대에는 `media_id`와 `accept`를 사용하며 기존 `invite_id`와 `action`도 별칭으로 지원합니다.
- 계정 인사이트에 `metric_type`, `breakdown`, 인구통계용 `timeframe`을 지원합니다. `views` 등은 `total_value`를 자동 선택합니다.
- 단독 동영상은 피드에 공유되는 릴스로 게시합니다. 사진·릴스·캐러셀의 AI 정보 및 유료 파트너십 라벨과 릴스의 `trial_params`를 지원합니다.
- 공개 Threads oEmbed는 토큰 없이 동작합니다. v2.1.1 이후 토큰 갱신, Instagram 메시징, 게시 및 답글 처리 수정도 포함합니다.

## v2.1.0 변경사항

- **Graph API v26.0**: v25.0에서 업그레이드 (v26.0 변경사항의 폐기 항목/엔드포인트는 사용하지 않고 있음을 확인)
- **Tenor 제거**: GIPHY가 유일한 GIF 제공자가 됨 (Tenor는 2026년 3월 31일 서비스 종료), `gif_provider` 파라미터 삭제
- **Threads 고스트 게시물**: `threads_publish_text`에 `is_ghost_post` 추가 (24시간 후 자동 보관)
- **Threads 답글 승인**: 게시 도구에 `enable_reply_approvals` 추가, `threads_get_pending_replies` / `threads_manage_pending_reply` 신규
- **Threads → 인스타그램 스토리 크로스 공유**: 모든 게시 도구에 `crossreshare_to_ig` / `crossreshare_to_ig_dark_mode` 추가
- **Threads 위치 태그**: 게시 도구에 `location_id` 추가, `threads_search_locations` / `threads_get_location` 신규
- **Threads 프로필 조회**: `threads_lookup_profile`, `threads_get_profile_posts` 신규
- **Threads 멘션**: `threads_get_mentions` 신규
- **Threads oEmbed**: `threads_get_oembed` 신규
- **Threads 대화 조회**: `threads_get_conversation` (중첩 답글까지 평탄화하여 조회) 신규
- **`threads_search_posts` 버그 수정**: 존재하지 않는 엔드포인트 대신 올바른 `/keyword_search` 엔드포인트와 정확한 `search_mode`/`search_type` 파라미터 사용
- 게시물/답글 필드에 `is_verified`, `profile_picture_url`, `location_id`, `root_post`, `replied_to`, `reply_audience` 추가

## v2.0.0 변경사항

- **Graph API v25.0**: v21.0(2025년 9월 만료)에서 v25.0(현재)으로 업그레이드
- **폐기된 지표 수정**: `impressions`, `video_views`, `engagement`를 `views`, `reach`, `saved`, `shares`로 교체
- **Threads 투표**: 대화형 투표 첨부 게시물 생성
- **Threads GIF**: GIPHY 또는 Tenor에서 GIF 첨부
- **Threads 토픽 태그**: 게시물에 토픽 태그 분류
- **Threads 링크 첨부**: 텍스트 게시물에 URL 미리보기 카드 첨부
- **Threads 게시물 검색**: 키워드 또는 토픽 태그로 공개 게시물 검색
- **Threads 게시물 삭제**: 게시물 삭제 (하루 100개 제한)
- **Threads 게시 제한 확인**: 남은 할당량 확인
- **Threads 인용 게시물**: ID로 다른 게시물 인용
- **Threads 스포일러 플래그**: 콘텐츠를 스포일러로 표시
- **Threads alt text**: 모든 미디어 유형에 접근성 설명 추가
- **Threads 새 답글 제어**: `parent_post_author_only`, `followers_only` 옵션 추가
- **Instagram alt text**: 사진, 릴스, 캐러셀 항목에 alt text 지원
- **Instagram 협업 초대**: 협업 초대 조회 및 응답
- **업데이트된 인사이트 지표**: 새 `clicks`, `reposts`, `reels_skip_rate` 지표

## 계정 요건

| 플랫폼 | 계정 유형 | 참고 |
|--------|-----------|------|
| **Instagram** | 비즈니스 또는 크리에이터 계정 | 개인 계정은 Graph API를 사용할 수 없습니다. Instagram 설정에서 무료로 전환 가능합니다 |
| **Threads** | 모든 계정 | 모든 Threads 계정이 API를 사용할 수 있습니다 (2025년 9월부터 Instagram 계정 연결 불필요) |
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
        "INSTAGRAM_MESSAGING_ACCESS_TOKEN": "your_page_access_token",
        "INSTAGRAM_PAGE_ID": "your_linked_page_id",
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
        "INSTAGRAM_MESSAGING_ACCESS_TOKEN": "your_page_access_token",
        "INSTAGRAM_PAGE_ID": "your_linked_page_id",
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
| `INSTAGRAM_MESSAGING_ACCESS_TOKEN` | Instagram DM 사용 시 | Facebook Login 기반 Instagram Messaging용 Page access token |
| `INSTAGRAM_PAGE_ID` | Instagram DM 사용 시 | Instagram 프로페셔널 계정과 연결된 Facebook Page ID |
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
| `meta_refresh_token` | `platform`에 따라 Instagram/Facebook token 연장 또는 Threads token 갱신 |
| `meta_debug_token` | token 유효성, 만료일, 권한 범위 확인 |
| `meta_get_app_info` | Meta 앱 정보 조회 |
| `meta_subscribe_webhook` | 웹훅 알림 구독 |
| `meta_get_webhook_subscriptions` | 현재 웹훅 구독 목록 조회 |

### Instagram — 게시 (6)

| 도구 | 설명 |
|------|------|
| `ig_publish_photo` | 사진 게시 (alt_text 지원) |
| `ig_publish_video` | 영상 게시 |
| `ig_publish_carousel` | 캐러셀/앨범 게시 (2~10개 항목, 항목별 alt_text 지원) |
| `ig_publish_reel` | 릴스 게시 (alt_text 지원) |
| `ig_publish_story` | 스토리 게시 (24시간) |
| `ig_get_container_status` | 미디어 컨테이너 처리 상태 확인 |

### Instagram — 미디어 (5)

| 도구 | 설명 |
|------|------|
| `ig_get_media_list` | 게시된 미디어 목록 조회 |
| `ig_get_media` | 미디어 상세 정보 조회 |
| `ig_delete_media` | 미디어 게시물 삭제 |
| `ig_get_media_insights` | 미디어 분석 데이터 조회 (views, reach, saved, shares) |
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

### Instagram — 프로필 & 인사이트 (5)

| 도구 | 설명 |
|------|------|
| `ig_get_profile` | 계정 프로필 정보 조회 |
| `ig_get_account_insights` | 계정 수준 분석 데이터 조회 (views, reach, follower_count) |
| `ig_business_discovery` | 다른 비즈니스 계정 조회 |
| `ig_get_collaboration_invites` | 대기 중인 협업 초대 조회 |
| `ig_respond_collaboration_invite` | 협업 초대 수락/거절 |

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

### Threads — 게시 (7)

| 도구 | 설명 |
|------|------|
| `threads_publish_text` | 텍스트 게시물 게시 (투표, GIF, 링크 첨부, 토픽 태그, 인용 게시물, 스포일러, 고스트 게시물, 답글 승인, 위치 태그, 인스타그램 스토리 크로스 공유 지원) |
| `threads_publish_image` | 이미지 게시물 게시 (alt_text, 토픽 태그, 스포일러, 답글 승인, 위치 태그, 인스타그램 스토리 크로스 공유 지원) |
| `threads_publish_video` | 영상 게시물 게시 (alt_text, 토픽 태그, 스포일러, 답글 승인, 위치 태그, 인스타그램 스토리 크로스 공유 지원) |
| `threads_publish_carousel` | 캐러셀 게시 (2~20개 항목, 항목별 alt_text, 답글 승인, 위치 태그, 인스타그램 스토리 크로스 공유 지원) |
| `threads_delete_post` | 게시물 삭제 (하루 최대 100개) |
| `threads_get_container_status` | 컨테이너 처리 상태 확인 |
| `threads_get_publishing_limit` | 남은 게시 할당량 확인 (하루 250개) |

### Threads — 미디어 & 검색 (4)

| 도구 | 설명 |
|------|------|
| `threads_get_posts` | 게시된 게시물 목록 조회 (토픽 태그, 투표, GIF, 위치, 인증 필드 포함) |
| `threads_get_post` | 게시물 상세 정보 조회 |
| `threads_get_profile_posts` | 사용자명으로 공개 프로필의 게시물 목록 조회 (프로필 조회) |
| `threads_search_posts` | `/keyword_search` 엔드포인트로 키워드 또는 토픽 태그로 공개 게시물 검색 (미디어 유형, 작성자 필터 지원) |

### Threads — 답글 (7)

| 도구 | 설명 |
|------|------|
| `threads_get_replies` | 게시물의 최상위 답글 조회 |
| `threads_get_conversation` | 게시물의 모든 답글(중첩 포함) 평탄화하여 조회 |
| `threads_reply` | 게시물에 답글 작성 (이미지/영상 첨부 지원) |
| `threads_hide_reply` | 답글 숨기기 |
| `threads_unhide_reply` | 답글 숨기기 해제 |
| `threads_get_pending_replies` | 답글 승인이 설정된 게시물의 승인 대기 답글 조회 |
| `threads_manage_pending_reply` | 대기 중인 답글 승인 또는 무시 |

### Threads — 프로필 & 조회 (3)

| 도구 | 설명 |
|------|------|
| `threads_get_profile` | Threads 프로필 정보 조회 (is_verified 포함) |
| `threads_get_user_threads` | 사용자의 스레드 목록 조회 |
| `threads_lookup_profile` | 사용자명으로 공개 프로필 조회 (프로필 조회) |

### Threads — 멘션 (1)

| 도구 | 설명 |
|------|------|
| `threads_get_mentions` | 사용자가 @멘션된 게시물 조회 |

### Threads — 위치 (2)

| 도구 | 설명 |
|------|------|
| `threads_search_locations` | 검색어 또는 좌표로 태그할 위치 검색 |
| `threads_get_location` | ID로 위치 객체 조회 |

### Threads — 도구 & 리소스 (1)

| 도구 | 설명 |
|------|------|
| `threads_get_oembed` | 공개 게시물의 임베드 HTML/메타데이터 조회 |

### Threads — 인사이트 (2)

| 도구 | 설명 |
|------|------|
| `threads_get_post_insights` | 게시물 분석 데이터 조회 (views, likes, replies, reposts, quotes, clicks) |
| `threads_get_user_insights` | 계정 수준 분석 데이터 조회 (인스타그램 미연동 Threads 프로필도 이용 가능) |

## 리소스

| 리소스 URI | 설명 |
|-----------|------|
| `instagram://profile` | Instagram 계정 프로필 데이터 |
| `threads://profile` | Threads 계정 프로필 데이터 (is_verified 포함) |

## 프롬프트

| 프롬프트 | 설명 |
|---------|------|
| `content_publish` | Instagram과 Threads에 동시 게시 |
| `analytics_report` | 통합 분석 리포트 생성 |

## 설정 가이드

### 1단계: Meta Developer 앱 생성

모든 플랫폼(Instagram, Threads)에 Meta Developer 앱이 필요합니다.

1. [developers.facebook.com](https://developers.facebook.com)에 로그인합니다
2. **"My Apps"** → **"Create App"** 클릭
3. **"Other"** → **"Business"** (또는 개인 용도면 "None") 선택
4. 앱 이름을 입력하고 생성

**`META_APP_ID`**와 **`META_APP_SECRET`**은 **App Settings → Basic**에서 확인할 수 있습니다.

### 2단계: Instagram 설정

> **Instagram 비즈니스 또는 크리에이터 계정**이 필요합니다. Instagram 앱 → 설정 → 계정 유형에서 무료로 전환 가능합니다.

1. Meta 앱에서 **"제품 추가"** → **"Instagram Graph API"** 추가
2. **"Instagram Graph API" → "설정"**에서 Facebook 페이지를 통해 Instagram 비즈니스 계정 연결
3. [Graph API Explorer](https://developers.facebook.com/tools/explorer/) 열기
   - 앱 선택
   - 권한 추가: `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_insights`, `instagram_manage_contents`, `instagram_manage_messages`, `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`
   - **"Generate Access Token"** 클릭 후 인가
4. 생성된 토큰은 단기 토큰(~1시간)입니다. 장기 토큰(~60일)으로 교환:
   ```
   GET https://graph.facebook.com/v26.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id=YOUR_APP_ID
     &client_secret=YOUR_APP_SECRET
     &fb_exchange_token=SHORT_LIVED_TOKEN
   ```
   또는 설정 후 `meta_exchange_token` 도구를 사용할 수 있습니다.
5. **Instagram User ID 조회** — 토큰으로 다음을 호출합니다:
   ```
   GET https://graph.facebook.com/v26.0/me/accounts?fields=id,name,access_token&access_token=YOUR_TOKEN
   ```
   Facebook 페이지 목록이 반환됩니다. 각 페이지에서 연결된 Instagram 계정을 조회합니다:
   ```
   GET https://graph.facebook.com/v26.0/{page-id}?fields=instagram_business_account&access_token=YOUR_TOKEN
   ```
   `instagram_business_account.id`가 **`INSTAGRAM_USER_ID`**입니다 (숫자 ID, 예: `17841400123456789`).
   DM 도구에는 같은 Page의 `id`를 `INSTAGRAM_PAGE_ID`로, `access_token`을
   `INSTAGRAM_MESSAGING_ACCESS_TOKEN`으로 설정하세요. IG User ID나 사용자 token으로
   대체하면 안 됩니다.

### 3단계: Threads 설정

> **모든 Threads 계정**에서 사용 가능합니다 (2025년 9월부터 Instagram 계정 연결 불필요).

1. Meta 앱에서 **"제품 추가"** → **"Threads API"** 추가
2. **"Threads API" → "설정"**:
   - **"Roles"**에서 본인의 Threads 계정을 **Threads Tester**로 추가
   - Threads 앱에서 초대 수락: **설정 → 계정 → 웹사이트 권한 → 초대**
3. 인가 URL을 생성합니다:
   ```
   https://threads.net/oauth/authorize
     ?client_id=YOUR_APP_ID
     &redirect_uri=YOUR_REDIRECT_URI
     &scope=threads_basic,threads_content_publish,threads_manage_insights,threads_manage_replies,threads_read_replies,threads_keyword_search,threads_manage_mentions,threads_delete,threads_location_tagging,threads_profile_discovery
     &response_type=code
   ```
   - 로컬 테스트의 경우 redirect URI로 `https://localhost/` 사용 (App Settings → Threads API → Redirect URIs에 설정)
4. 인가 후, 코드를 access token으로 교환합니다:
   ```
   POST https://graph.threads.net/oauth/access_token
   Content-Type: application/x-www-form-urlencoded

   client_id=YOUR_APP_ID
   &client_secret=YOUR_APP_SECRET
   &grant_type=authorization_code
   &redirect_uri=YOUR_REDIRECT_URI
   &code=AUTHORIZATION_CODE
   ```
5. 장기 토큰(~60일)으로 교환합니다:
   ```
   GET https://graph.threads.net/access_token
     ?grant_type=th_exchange_token
     &client_secret=YOUR_APP_SECRET
     &access_token=SHORT_LIVED_TOKEN
   ```
6. **Threads User ID 조회** — 토큰으로 다음을 호출합니다:
   ```
   GET https://graph.threads.net/v1.0/me?fields=id,username&access_token=YOUR_TOKEN
   ```
   `id` 필드가 **`THREADS_USER_ID`**입니다 (숫자 ID, 예: `1234567890`).

### 4단계: 환경변수 설정

사용하는 플랫폼의 변수만 설정하면 됩니다:

```bash
# Instagram (비즈니스/크리에이터 계정 필요)
INSTAGRAM_ACCESS_TOKEN=EAAxxxxxxx...     # 2단계에서 발급받은 장기 토큰
INSTAGRAM_USER_ID=17841400123456789      # 2단계 5번에서 조회한 숫자 ID
INSTAGRAM_MESSAGING_ACCESS_TOKEN=EAA...  # 2단계 5번의 Page token (DM 도구 전용)
INSTAGRAM_PAGE_ID=123456789012345        # 연결된 Facebook Page ID (DM 도구 전용)

# Threads (모든 계정 사용 가능)
THREADS_ACCESS_TOKEN=THQWxxxxxxx...      # 3단계에서 발급받은 장기 토큰
THREADS_USER_ID=1234567890               # 3단계 6번에서 조회한 숫자 ID

# Meta App (토큰 관리 및 웹훅용)
META_APP_ID=123456789012345              # App Settings → Basic에서 확인
META_APP_SECRET=abcdef0123456789abcdef   # App Settings → Basic에서 확인
```

### 토큰 갱신

Access token은 약 60일 후 만료됩니다. 만료 전에 갱신하세요:

- **Instagram**: `platform=instagram`으로 `meta_refresh_token` 사용 (`META_APP_ID`, `META_APP_SECRET` 필요)
- **Threads**: `platform=threads`로 `meta_refresh_token` 사용 또는 다음 호출:
  ```
  GET https://graph.threads.net/refresh_access_token
    ?grant_type=th_refresh_token
    &access_token=CURRENT_LONG_LIVED_TOKEN
  ```

`meta_debug_token`으로 언제든지 토큰 상태를 확인할 수 있습니다.

## 폐기된 지표 (v22.0+)

다음 Instagram 지표는 Graph API v22.0(2025년 1월)에서 폐기되었으며, 2025년 4월 21일에 모든 버전에서 제거되었습니다:

| 폐기된 지표 | 대체 지표 |
|------------|----------|
| `impressions` | `views` |
| `video_views` | `views` |
| `plays` | `views` |
| `clips_replays_count` | `views` |
| `engagement` | `saves` + `shares` + `likes` + `comments` |
| `email_contacts` | 제거됨 (대체 없음) |
| `phone_call_clicks` | 제거됨 (대체 없음) |
| `text_message_clicks` | 제거됨 (대체 없음) |
| `get_directions_clicks` | 제거됨 (대체 없음) |
| `website_clicks` | 제거됨 (대체 없음) |
| `profile_views` | 제거됨 (대체 없음) |

## 라이선스

MIT
