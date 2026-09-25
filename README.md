# Hidden URL Gateway

**KO** 이벤트마다 로고를 바꿔 걸고, 허용된 이메일만 목적지 페이지를 보게 하는 게이트웨이입니다. 실제 URL은 브라우저에 내려주지 않습니다.

**EN** An event-branded gateway that shows a destination page only to allowlisted emails. The real URL never leaves the server.

첫 행사는 **Grok Bot Credit Access** 입니다.  
The first event is **Grok Bot Credit Access**.

---

## 저장소 / Repository

- GitHub: https://github.com/dave-jin/hidden-url-gateway
- **KO** 기본 공개 범위는 Private입니다. Settings에서 Public으로 바꿀 수 있습니다.
- **EN** The repository starts as Private. You can switch it to Public in Settings.

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

---

## 환경 변수 / Environment

| 변수 / Variable | 설명 / Description |
| --- | --- |
| `ADMIN_SECRET` | 어드민 비밀번호 / Admin password |
| `SESSION_SECRET` | 세션 서명 키 / Session signing key |

로컬 기본 어드민 비밀번호는 `.env.example`의 `spacexai` 입니다.  
The local default admin password is `spacexai` in `.env.example`.
