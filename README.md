# Hidden URL Gateway

**KO** 이벤트마다 로고를 바꿔 걸고, 허용된 이메일만 목적지 페이지를 보게 하는 게이트웨이입니다. 실제 URL은 브라우저에 내려주지 않습니다.

**EN** An event-branded gateway that shows a destination page only to allowlisted emails. The real URL never leaves the server.

첫 행사는 **Grok Bot Credit Access** 입니다.  
The first event is **Grok Bot Credit Access**.

---

## 저장소 / Repository

- GitHub: https://github.com/dave-jin/hidden-url-gateway

```bash
git clone https://github.com/dave-jin/hidden-url-gateway.git
cd hidden-url-gateway
```

---

## 동작 / How it works

**KO**

1. 어드민에서 행사 로고, 허용 이메일, 목적지 URL을 등록합니다.
2. 사용자는 게이트 페이지에서 이메일만 입력합니다.
3. 허용된 이메일이면 서버가 목적지 페이지를 대신 열어 줍니다.
4. 주소창, 페이지 소스, 네트워크 요청에 실제 URL이 나가지 않습니다.

**EN**

1. An admin registers the event logo, allowlisted emails, and destination URL.
2. Visitors only enter their email on the gate page.
3. If the email is on the list, the server opens the destination page for them.
4. The real URL is not exposed in the address bar, page source, or network requests.

---

## 로컬 실행 / Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

**KO** 브라우저에서 `http://localhost:3847` 을 엽니다.  
**EN** Open `http://localhost:3847` in your browser.

| 경로 / Route | 설명 / Description |
| --- | --- |
| `/` | 이메일 게이트 / Email gate |
| `/admin` | 행사·이메일·URL 관리 / Event, email, and URL admin |
| `/view` | 인증 후 목적지 페이지 / Destination after access is granted |

데모 이메일 / Demo email: `demo@spacexai.com`  
로컬 어드민 비밀번호 / Local admin password: `spacexai`

---

## dave-lab 공통 DB / Shared database

**KO** Vercel + Supabase 공통 프로젝트는 `dave-lab` (`dhwbcefikuhydhdihmgj`) 입니다. 이 앱은 `app_hidden_url_gateway` 스키마만 쓰며 `core.apps`에 등록됩니다.

**EN** The shared Vercel + Supabase project is `dave-lab` (`dhwbcefikuhydhdihmgj`). This app uses only the `app_hidden_url_gateway` schema and is registered in `core.apps`.

적용 SQL / Apply SQL: `supabase/migrations/20260925000000_gateway_events.sql`

| 테이블 / Table | 역할 / Role |
| --- | --- |
| `app_hidden_url_gateway.gateway_events` | 행사 이름, 로고, 숨긴 목적지 URL |
| `app_hidden_url_gateway.gateway_event_emails` | 허용 이메일 |
| `app_hidden_url_gateway.assets` | 업로드된 행사 로고 |

RLS가 켜져 있고 `anon` / `authenticated` 권한은 없습니다. 서버는 `DATABASE_URL`의 `gateway_app` 역할로만 접근합니다.

---

## 환경 변수 / Environment

| 변수 / Variable | 설명 / Description |
| --- | --- |
| `ADMIN_SECRET` | 어드민 비밀번호 / Admin password |
| `SESSION_SECRET` | 세션 서명 키 / Session signing key |
| `DATABASE_URL` | dave-lab Postgres URL / Shared dave-lab Postgres URL |

`DATABASE_URL`이 없으면 시드된 Grok Bot 행사로 읽기 전용 동작합니다.  
If `DATABASE_URL` is missing, the app serves the seeded Grok Bot event in read-only mode.
