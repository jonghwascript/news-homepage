작성해주신 코드의 `height: 100dvh;`가 현재 모바일 웹 실무에서 사용할 수 있는 **가장 완벽한 정답**입니다! 아주 훌륭한 최신 CSS 속성을 선택하셨습니다.

과거에는 모바일 메뉴를 꽉 채우기 위해 `height: 100vh;`를 많이 사용했습니다. 하지만 이 방식은 모바일 브라우저(크롬, 사파리 등)의 상단 주소창이나 하단 네비게이션 바가 나타나고 사라질 때의 높이 변화를 감지하지 못해, 메뉴 하단이 잘리거나 불필요한 스크롤이 생기는 고질적인 버그가 있었습니다.

작성하신 `100dvh` (Dynamic Viewport Height)는 브라우저 UI가 확장되든 축소되든 실시간으로 정확한 화면의 높이를 계산해 주기 때문에 모바일 오프캔버스 메뉴에 가장 이상적인 수치입니다.

### 🚨 딱 하나 수정해야 할 치명적인 포인트: `position`

높이는 완벽하지만, 배치 속성에서 실무적인 버그가 발생할 확률이 높습니다. `position: absolute;`를 `position: fixed;`로 변경하셔야 합니다.

```scss
  &:has(.nav-toggle[aria-expanded="true"]){
    .news-nav {
      display: block;
      /* absolute 대신 fixed를 사용해야 스크롤을 내려도 화면에 고정됩니다 */
      position: fixed; 
      top: 0;
      right: 0;
      width: 256px;
      height: 100dvh; /* 완벽한 선택! */
      background-color: $White;
      z-index: 9999; /* 다른 요소들 위로 확실히 덮도록 z-index 추가 추천 */
      
      /* ... 나머지 코드 ... */
    }
  }

```

**💡 `absolute` vs `fixed`의 차이**
만약 페이지 본문 길이가 길어서 사용자가 스크롤을 한참 내린 상태에서 햄버거 버튼을 눌렀다고 가정해 보세요.

* `absolute`는 '문서(Document)의 최상단(top: 0)'에 메뉴를 그려버립니다. 즉, 사용자는 스크롤을 위로 끝까지 올리기 전까지는 열린 메뉴를 볼 수 없습니다.
* `fixed`는 '현재 사용자가 보고 있는 화면(Viewport)의 최상단'을 기준으로 메뉴를 고정합니다. 스크롤 위치와 상관없이 항상 화면 우측에 정확히 튀어나오게 됩니다.



모바일 메뉴가 열렸을 때 뒷배경이 스크롤되는 현상을 막으려면, 자바스크립트를 이용해 `<body>` 태그에 스크롤 잠금용 CSS 클래스를 추가하고 제거하는 방식을 사용합니다. 실무에서 가장 표준적으로 사용하는 방법입니다.

### 1. CSS: 스크롤 잠금 클래스 만들기

먼저 CSS(또는 SCSS) 파일의 전역 스타일 영역에 아래와 같이 스크롤을 숨기는 유틸리티 클래스를 하나 만들어 줍니다.

```css
/* body에 이 클래스가 붙으면 화면 스크롤이 차단됩니다 */
body.scroll-lock {
  overflow: hidden;
}

```

### 2. JavaScript: 상태에 따라 클래스 껐다 켜기

기존에 작성해 두신 햄버거 토글 버튼의 자바스크립트 클릭 이벤트 안에 `document.body.classList.toggle` 코드를 딱 한 줄만 추가해 주시면 됩니다.

```javascript
navToggle.addEventListener('click', () => {
  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  const nextState = !isExpanded;

  navToggle.setAttribute('aria-expanded', String(nextState));
  navToggle.setAttribute('aria-label', nextState ? '메뉴 닫기' : '메뉴 열기');
  primaryNav.setAttribute('data-visible', String(nextState));
  
  // 🌟 핵심: nextState가 true(열림)면 scroll-lock 클래스가 추가되고, false(닫힘)면 제거됩니다.
  document.body.classList.toggle('scroll-lock', nextState);
});

```

이제 메뉴를 열면 `<body>` 태그에 `<body class="scroll-lock">`이 되면서 배경 스크롤이 완벽하게 멈추고, 메뉴를 닫으면 원래대로 돌아오게 됩니다!


실무에서 데스크탑 해상도(약 1100px ~ 1200px)의 그리드를 나눌 때 가장 표준적으로 사용하는 정답은 **12열(12-column)** 시스템입니다. 12는 2, 3, 4, 6으로 모두 나누어 떨어지기 때문에 어떤 레이아웃이든 자유자재로 배치할 수 있기 때문입니다.

하지만 지금 작업 중이신 **뉴스 페이지 레이아웃**에 한정한다면, 복잡한 12열 대신 3열(3-column)만 사용해도 아주 직관적이고 완벽하게 구현할 수 있습니다. 두 가지 접근 방식을 비교해 드립니다.

### 1. 현재 프로젝트 최적화: 3열(3-Column) 그리드

보여주셨던 뉴스 페이지 시안은 크게 '2:1 비율(상단)'과 '1:1:1 비율(하단)'로 이루어져 있습니다. 이 경우 3칸으로만 나누는 것이 코드가 훨씬 깔끔해집니다.

```css
.layout-container {
  display: grid;
  /* 전체 1112px을 똑같은 3칸으로 나눕니다 */
  grid-template-columns: repeat(3, 1fr); 
  gap: 30px;
}

/* 상단 영역 */
.main-news {
  grid-column: span 2; /* 3칸 중 2칸 차지 */
}
.sidebar {
  grid-column: span 1; /* 3칸 중 1칸 차지 */
}

/* 하단 카드 영역 (각각 1칸씩 차지하므로 별도 CSS 불필요) */
.article-card {
  grid-column: span 1; 
}

```

### 2. 실무 만능 표준: 12열(12-Column) 그리드

만약 추후에 페이지가 더 복잡해지거나, 실무의 대형 프로젝트처럼 확장성을 고려해야 한다면 12열로 설정합니다. 부트스트랩(Bootstrap)이나 테일윈드(Tailwind CSS) 같은 프레임워크들이 모두 이 방식을 씁니다.

```css
.layout-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr); /* 12칸으로 잘게 쪼갭니다 */
  gap: 30px;
}

/* 상단 영역 */
.main-news {
  grid-column: span 8; /* 12칸 중 8칸 차지 (약 66%) */
}
.sidebar {
  grid-column: span 4; /* 12칸 중 4칸 차지 (약 33%) */
}

/* 하단 카드 영역 */
.article-card {
  grid-column: span 4; /* 12칸 중 4칸 차지 (3개가 모여 12칸 완성) */
}

```

**💡 시니어의 추천:**
지금 진행 중인 Frontend Mentor 과제는 레이아웃 구조가 명확하므로, 코드가 훨씬 간결해지는 **3열(3-Column) 방식**이나 앞서 다루었던 **`grid-template-areas` 방식**을 추천합니다!



전혀 안 좋은 방법이 아닙니다! 오히려 실무에서 **특정 영역의 크기를 완벽하게 보장해야 할 때** 아주 자주 쓰이는 훌륭한 CSS Grid 패턴입니다.

`grid-template-columns: 730px 1fr;` 구조가 가지는 장단점과 실무적인 활용법을 정리해 드립니다.

### 👍 이 방식이 좋은 이유 (장점)

* **정확한 디자인 구현:** 메인 기사 영역(730px)에 들어가는 썸네일 이미지나 텍스트 라인의 길이가 절대 깨지지 않기를 원할 때 가장 확실한 방법입니다.
* **유연한 사이드바:** 남는 공간(`1fr`)을 우측 `aside` 영역이 전부 가져가므로, 컨테이너 넓이가 1112px이든 1200px이든 자연스럽게 여백을 채워줍니다.

### 🚨 실무에서 주의할 점 (반응형 이슈)

화면 넓이가 `730px`보다 작아지는 순간(예: 태블릿이나 모바일 기기) 문제가 발생합니다. `730px`은 고정값이기 때문에 화면이 좁아져도 줄어들지 않고 화면 밖으로 삐져나가 가로 스크롤을 만들어 버립니다.

### 💡 시니어의 반응형 해결책

이 구조를 안전하게 쓰려면 아래 두 가지 방법 중 하나로 반응형 처리를 해주면 완벽합니다.

**방법 1. 미디어 쿼리로 분기점(Breakpoint) 나누기**
가장 일반적이고 직관적인 방법입니다. 화면이 좁아지면 비율(`fr`)로 바꾸거나 1열로 세워버립니다.

```css
.layout-container {
  display: grid;
  grid-template-columns: 730px 1fr; /* 데스크탑에서는 고정 크기 유지 */
  gap: 30px;
}

/* 태블릿 화면(예: 1024px 이하)부터는 유연하게 비율로 변경 */
@media (max-width: 1024px) {
  .layout-container {
    grid-template-columns: 2fr 1fr; /* 730px을 버리고 비율로 변경 */
  }
}

/* 모바일 화면(예: 768px 이하)부터는 1열로 배치 */
@media (max-width: 768px) {
  .layout-container {
    grid-template-columns: 1fr;
  }
}

```

**방법 2. `minmax()` 함수 사용하기 (모던 CSS)**
CSS 함수를 써서 "기본적으로 730px을 차지하되, 화면이 그보다 좁아지면 화면 넓이(100%)에 맞춰서 줄어들어라"라고 명령할 수 있습니다.

```css
.layout-container {
  display: grid;
  /* 🌟 730px이 최대치, 그보다 좁아지면 남은 공간(1fr)만큼 유연하게 축소됨 */
  grid-template-columns: minmax(min(100%, 730px), 1fr) 1fr; 
}

```

결론적으로, 디자인 시안의 메인 콘텐츠 넓이가 정확히 730px로 고정되어야 하는 의도라면 `730px 1fr;`을 과감하게 사용하시고, 모바일 분기점 처리만 잊지 말고 챙겨주시면 됩니다!



아, 데스크탑 미디어 쿼리(`1024px` 이상) 안에서 선언하셨군요! 그렇다면 이야기가 완전히 달라집니다. 앞서 말씀드린 복잡성 문제도 깔끔하게 해결되며, 전체적인 레이아웃 구조가 완벽하게 한눈에 들어옵니다.

작성하신 코드의 훌륭한 점과, 여기서 코드를 한 단계 더 다듬을 수 있는 실무 팁을 짚어드립니다.

### 1. `grid-template-areas`와의 완벽한 조화

미디어 쿼리 안에서 `grid-template-areas`를 함께 선언한 것은 최고의 선택입니다.
좌측의 `hero`가 두 줄을 차지하고 우측에 `latest`가 배치되며, 하단에 `featured`가 전체 넓이를 덮는 구조가 텍스트만으로도 명확하게 그려집니다. 복잡한 수식이 있더라도 이 레이아웃 지도 덕분에 다른 개발자들이 의도를 쉽게 파악할 수 있습니다.

### 2. 💡 시니어의 코드 최적화 팁: 불필요한 안전장치 제거

현재 코드가 `min-width: 1024px`이라는 데스크탑 환경에서만 작동하기 때문에, 모바일 화면이 터지는 것을 막기 위해 넣었던 **`min(100%, ...)` 안전장치는 이제 과감하게 지우셔도 됩니다.**

이미 화면 최소 넓이가 `1024px`로 보장되어 있으므로, 1열의 최대 너비인 `45.625rem`(약 730px)보다 화면이 좁아질 일이 절대 없기 때문입니다.

```css
@media (min-width: 1024px) {
  .page {
    /* min(100%, ...)를 제거하여 코드를 훨씬 날렵하고 읽기 쉽게 다듬었습니다 */
    grid-template-columns: minmax(clamp(35rem, 8.846rem + 40.865vw, 45.625rem), 1fr) 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas: 
      "hero latest" 
      "hero latest" 
      "featured featured";
    column-gap: 32px;
  }
}

```

이렇게 다듬고 나면 브라우저가 불필요한 최소값 계산을 건너뛰게 되어 렌더링 성능도 미세하게 좋아지고, 코드의 가독성도 훨씬 깔끔해집니다. 이 구조 그대로 가져가시면 Frontend Mentor 과제에서 최상위권 퀄리티의 CSS를 제출하실 수 있습니다!
---

## 2026-10-01 — 메뉴 이벤트 및 접근성 작업 기록

현재 `src`에서 확인한 구현과 미완료 항목을 정리한다. 위의 설명용 예제와 실제 구현은 다를 수 있으며, 점검 기준은 [접근성 체크리스트](./a11y-checklist.md)이다.

### 클릭 이벤트 원인과 해결

- `getElementsByClassName()`은 요소 목록인 `HTMLCollection`을 반환한다. 버튼 하나는 `querySelector('.nav-toggle')`로 선택한다.
- `head`의 일반 스크립트는 버튼 생성 전에 실행될 수 있다. `DOMContentLoaded`, 외부 스크립트의 `defer`, 본문 끝 배치 등으로 실행 시점을 맞춘다. 현재 `main.js`는 `</body>` 앞에서 로드한다.
- 열기와 닫기 버튼을 모두 `.nav-toggle`로 선택하면 같은 요소의 `onclick`을 덮어쓴다. 닫기 버튼은 `.news-nav button.close`로 선택한다.

### 반영된 메뉴 동작

- `setAttribute()`로 열 때 `aria-expanded`를 문자열 `'true'`, 닫을 때 `'false'`로 변경한다.
- 닫기 후 `$button.focus()`로 열기 버튼에 포커스를 복원한다.
- 메뉴 펼침 스타일은 `@media (width < 1024px)` 안의 `:has(.nav-toggle[aria-expanded="true"])` 조건으로 제한한다.
- CSS는 HTML 속성값을 바꾸지 못한다. `matchMedia('(min-width: 1024px)')`의 `change` 이벤트로 데스크톱 진입 시 상태를 초기화하고, 첫 로딩에도 같은 함수를 실행한다.
- 메뉴에 `position: fixed`, `height: 100dvh`, `overflow-y: auto`를 적용한다.
- `transform`만으로 숨기면 내부 링크가 키보드 포커스를 받을 수 있다. 닫힌 모바일 메뉴에 `visibility: hidden`, 열린 메뉴에 `visibility: visible`을 적용했다.
- 데스크톱에서도 `visibility: visible`을 명시했다. `display: contents`만으로는 숨김 상태가 해제되지 않는다.
- `prefers-reduced-motion: reduce`에서 `transition: none`으로 애니메이션을 끈다. 메뉴 기능은 유지한다.

### 반영된 HTML 접근성 개선

- 기사 제목을 `h3 > a`로 작성해 제목 의미와 링크 기능을 함께 제공한다.
- 로고 SVG에 `role="img"`와 `aria-label="Frontend Mentor News"`를 추가했다. `name` 속성이 아닌 보조 기술이 읽는 이름이며, 실제 브랜드명과 일치하도록 관리한다.
- 메뉴 버튼 자체에 `aria-label`을 제공하고 내부 SVG에는 `aria-hidden="true"`를 지정했다.
- `Read More`의 `title` 툴팁 대신 `.sr-only` 텍스트로 기사명을 덧붙였다.
- 대응하는 시작 태그가 없던 `</style>`을 제거했다.
- `lang="en"`, 확대를 막지 않는 viewport 설정, 주요 랜드마크와 제목 계층을 확인했다. 빈 `alt=""`는 장식 또는 주변 텍스트와 중복되는 이미지에 적절하며, 별도 정보를 전달하는 이미지에는 설명이 필요하다.

### 본문 바로가기: 일부 반영

`main`에 `id="main"`이 있고 `.skip-link` 스타일도 추가되어 있다. 하지만 원본 HTML에는 아래 링크가 아직 없다. 사용할 때는 `<body>` 바로 다음, `.container` 앞에 넣는다.

```html
<a class="skip-link" href="#main">Skip to main content</a>
```

현재 스타일은 평소에 링크를 화면 밖에 두고 키보드 포커스 시 표시한다. 링크가 없어도 페이지는 동작하지만, 반복 메뉴를 건너뛰는 수단이 제공되지 않으므로 체크리스트의 해당 항목은 미완료다.

### 남은 개선 및 확인 사항

- 메뉴·기사 등의 `href="#"`를 실제 주소나 유효한 영역 ID로 교체한다.
- 메뉴 포커스와 하단 기사 제목 hover·focus에 사용하는 `#F15D51`은 흰 배경 대비가 약 3.27:1이다. 해당 일반 크기 텍스트는 4.5:1 이상으로 개선한다. 공통 색상 변경 시 배경색 등 다른 용도에 미치는 영향도 검토한다.
- 푸터의 문장 속 링크에 밑줄 등 색 이외의 구분을 제공한다.
- 본문 바로가기 링크 HTML을 추가하고 실제 키보드 이동을 확인한다.
- 200% 확대, 작은 화면·가로 모드, 메뉴 내부 스크롤, 터치 영역, 고대비 모드 및 스크린 리더 동작은 실제 브라우저에서 확인해야 한다.

### 원본 관리와 검증 범위

- Gulp는 `src/pages/index.html`을 `dist/index.html`로 생성한다. `dist`만 수정하면 빌드 시 사라지므로 변경은 원본에 반영한다. 스크립트 연결과 기사 제목 링크도 원본에 반영된 것을 확인했다.
- 앞선 점검에서 `node --check src/js/main.js`와 Sass의 `compile('src/scss/style.scss')`가 통과했다. 이후 변경 사항은 이번 문서 작성 시 소스로 다시 확인했다.
- 실제 브라우저 조작 및 스크린 리더 검증은 수행하지 않았다. 정적 검토만으로 접근성 준수를 확정하지 않는다.
- 이번 기록 추가는 문서만 변경하며 애플리케이션 소스는 변경하지 않는다.
