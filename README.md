# Hidden URL Gateway

이벤트마다 로고를 바꿔 걸고, 허용된 이메일만 목적지 페이지를 보게 하는 게이트웨이입니다. 실제 URL은 브라우저에 내려주지 않습니다.

## GitHub

- 저장소: https://github.com/dave-jin/hidden-url-gateway
- 기본 공개 범위: Private (Settings에서 Public으로 바꿀 수 있습니다)

```bash
git clone https://github.com/dave-jin/hidden-url-gateway.git
cd hidden-url-gateway
```

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3847` 을 엽니다.

- 게이트: `/`
- 어드민: `/admin`
- 데모 이메일: `demo@spacexai.com`

## 동작

1. 어드민에서 행사 로고, 허용 이메일, 목적지 URL을 등록합니다.
2. 사용자는 이메일만 입력합니다.
3. 허용된 이메일이면 서버가 목적지 페이지를 대신 열어 줍니다. 주소창과 페이지 소스에 실제 URL이 나가지 않습니다.

첫 행사는 **Grok Bot Credit Access** 입니다.
