---
title: "SQL 기본 문법 실전 가이드 - 코딩테스트 시리즈 2편"
meta_title: "SQL 기본 문법 실전 가이드"
description: "SQL 코딩테스트에서 반드시 알아야 할 핵심 문법들을 실전 예제와 함께 정리했습니다. SELECT부터 JOIN, 윈도우 함수까지 실전 중심으로 설명합니다."
date: 2025-07-05T00:30:00+09:00
image: "https://res.cloudinary.com/dofrfwdqh/image/upload/v1751642483/post-3-thumbnail.png"
categories: ["코딩테스트", "SQL"]
tags: ["코딩테스트", "SQL", "데이터"]
draft: false
---
> **SQL 코딩 테스트 완전 정복 시리즈**
> 
> 📌 [1편: SQL 코딩 테스트 벼락치기](/sql-codeing-test) <br/>
> 📖 **2편: SQL 기본 문법 실전 가이드** (현재 글)  
> 🚀 [3편: SQL 코딩테스트 실전 문제 풀이](/sql-coding-test-practice)

이제 본격적으로 SQL 문법을 살펴보겠습니다. <br/> 코딩테스트에서 자주 나오는 패턴들을 중심으로 정리해보았습니다.

---

## 1. SELECT 기본기 다지기
<h5 class="mt-5 mb-0">기본 문법 다지기</h5>

```sql
SELECT column1, column2, column3 AS col3
FROM table_name
WHERE 조건
GROUP BY column1
HAVING 집계함수_조건
ORDER BY column1 ASC, column2 DESC
LIMIT 10;
```

<h5 h5 class="mt-12 mb-0">실행 순서</h5>

```sql
FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT
```

<h5 h5 class="mt-12 mb-0">실전 예제</h5>

```sql
-- 20세 이상 회원 중 서울 거주자의 이름과 나이 조회
SELECT name, age, city
FROM users
WHERE age >=20 AND city = '서울'
ORDER BY age DESC;
```

<h5 class="mt-12 mb-0">💡 TIP : WHERE vs HAVING 언제 써야 할까요?</h5>

```sql
-- WHERE: 그룹 만들기 BEFORE 필터링 (개별 행 조건)
SELECT department, COUNT(*)
FROM employees  
WHERE salary > 3000000    -- 먼저 300만원 이상인 사람들만 걸러내고
GROUP BY department;      -- 그 다음에 부서별로 그룹핑

-- HAVING: 그룹 만든 AFTER 필터링 (그룹 조건)
SELECT department, COUNT(*)
FROM employees
GROUP BY department       -- 먼저 부서별로 그룹핑하고  
HAVING COUNT(*) >= 5;     -- 그 다음에 5명 이상인 부서만 걸러냄
```

>집계함수 쓰고 싶으면 → "HAVING", &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 일반 컬럼 조건 → "WHERE"


---
## 2. 집계함수 마스터하기

**집계함수란? 여러 행의 데이터를 하나의 값으로 요약하는 함수**

예를 들어, 100명의 학생 점수가 있을 때:
- 전체 학생 수는? → `COUNT()` 
- 평균 점수는? → `AVG()`
- 총합은? → `SUM()`
- 최고점은? → `MAX()`

#### 핵심 집계함수

```sql
SELECT 
    COUNT(*) AS 전체개수,           -- 행의 개수 (NULL 포함)
    COUNT(column_name) AS 유효개수,  -- NULL이 아닌 행의 개수
    SUM(price) AS 총합,            -- 숫자의 합계
    AVG(score) AS 평균,            -- 숫자의 평균
    MAX(created_at) AS 최신날짜,    -- 가장 큰 값
    MIN(age) AS 최소나이           -- 가장 작은 값
FROM table_name;
```

#### GROUP BY와 함께 사용

**GROUP BY가 왜 필요한가요?** <br/>
집계함수만 쓰면 전체에 대한 하나의 값만 나오게 됩니다.
하지만 "부서별로", "월별로" 나누어서 보고 싶다면? → `GROUP BY` 사용!

```sql
-- ❌ 이렇게 하면: 전체 직원의 평균 급여만 나옴
SELECT AVG(salary) FROM employees;

-- ✅ 이렇게 하면: 부서별 평균 급여가 각각 나옴
SELECT 
    department,           -- 그룹의 기준
    COUNT(*) AS 직원수,    -- 각 그룹의 집계값
    AVG(salary) AS 평균급여,
    MAX(salary) AS 최고급여
FROM employees
GROUP BY department       -- department로 그룹을 나눔
HAVING COUNT(*) >= 5      -- 5명 이상인 부서만 (그룹 조건)
ORDER BY 평균급여 DESC;
```

<h5 class="mt-12 mb-0">🔍 GROUP BY 작동 원리</h5>

- **department**가 같은 행들끼리 그룹을 만듦
- 각 그룹에서 집계함수를 계산
- 그룹별로 하나씩 결과 행이 생성됨

<h5 class="mt-12 mb-0">🎯 코딩테스트 단골 패턴</h5>

- 카테고리별 개수/평균/합계 구하기
- 조건을 만족하는 그룹만 필터링하기

---

## 3. JOIN 정복하기

**JOIN이 왜 필요한가요?** 실제 데이터베이스는 여러 형태로 나누어져 있습니다. 

**예시 상황:**

- `users` 테이블: 회원 정보 (id, name, email)
- `orders` 테이블: 주문 정보 (id, user_id, amount, date)

김철수가 얼마나 주문했는지" 보려면? → 두 테이블을 연결해야 함! 

<h5 class="mt-12 mb-0">JOIN 종류별 차이점</h5>

```sql
-- INNER JOIN: 양쪽 테이블에 모두 데이터가 있는 경우만
SELECT u.name, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
-- 결과: 주문한 적 있는 회원들만 나옴

-- LEFT JOIN: 왼쪽 테이블(users) 기준, 오른쪽이 없으면 NULL
SELECT u.name, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- 결과: 모든 회원이 나옴 (주문 안 한 사람은 amount가 NULL)
```

<h5 class="mt-12 mb-0">JOIN 선택 기준</h5>

- 양쪽 다 있는 데이터만 → `INNER JOIN`
- 한쪽은 모두, 다른 쪽은 있으면 → `LEFT/RIGHT JOIN`

> 💡 TIP 별칭 선언 <br/>
> FROM 절이나 JOIN 절에서 user u, order o 처럼 별칭을 선언하면 다른 곳에서 사용 가능 <br/>
> 하지만 별칭 선언 후엔 원래 이름은 사용할 수 없으니 주의!

<h5 class="mt-12 mb-0">실전 예제</h5>

```sql
-- 주문한 적 없는 회원 찾기 (LEFT JOIN + IS NULL 패턴)
SELECT u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.user_id IS NULL;

-- 3개 테이블 조인
SELECT 
    u.name AS 회원명,
    p.name AS 상품명,
    o.amount AS 주문금액
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN products p ON o.product_id = p.id
WHERE o.order_date >= '2024-01-01';
```

<h5 class="mt-12 mb-0 text-red-500">🔥 JOIN 문제에서 자주 나오는 패턴</h5>

- "~한 적 없는" → LEFT JOIN + IS NULL
- "모든 ~에 대해" → RIGHT JOIN 또는 LEFT JOIN
- 3개 이상 테이블 연결

---

## 4. CASE WHEN (조건문)

**CASE WHEN이 뭔가요?** <br/>
프로그래밍의 if-else와 같은 조건문

```sql
-- 이런 상황: 나이에 따라 연령대를 분류하고 싶다
-- 20세 미만 → "10대"
-- 30세 미만 → "20대" 
-- 40세 미만 → "30대"
-- 그 외 → "40대 이상"
```

<h5 class="mt-12 mb-0">CASE WHEN으로 새로운 컬럼 만들기</h5>

```sql
-- 나이대별 분류
SELECT 
    name,
    age,
    CASE 
        WHEN age < 20 THEN '10대'      -- 조건1
        WHEN age < 30 THEN '20대'      -- 조건2  
        WHEN age < 40 THEN '30대'      -- 조건3
        ELSE '40대 이상'               -- 나머지
    END AS 연령대                     -- 새로운 컬럼명
FROM users;
```

<h5 class="mt-12 mb-0">🔍 작동 원리</h5>

- 위에서부터 순서대로 조건 체크
- 첫 번째 만족하는 조건의 값 반환
- 모든 조건 불만족 시 ELSE 값 반환

<h5 class="mt-12 mb-0">집계와 함께 활용 (꿀팁!)</h5>

```sql
-- 조건별 카운팅
SELECT 
    COUNT(CASE WHEN age < 30 THEN 1 END) AS 젊은층,
    COUNT(CASE WHEN age >= 30 THEN 1 END) AS 중장년층,
    COUNT(*) AS 전체
FROM users;

-- 조건부 집계
SELECT 
    department,
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS 완료금액,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS 대기건수
FROM orders
GROUP BY department;
```

<h5 class="mt-12 mb-4 text-red-500">💡 이 패턴 정말 많이 나와요!</h5>

**하나의 쿼리로 여러 조건의 집계를 구할 때 사용합니다.**

---

## 5. 서브쿼리 정복하기

**서브쿼리가 뭔가요?** 쿼리 안에 들어있는 또 다른 쿼리

**왜 필요한가요?**
- 이런 질문이 있다면: "평균보다 높은 급여를 받는 사람은?"
- 1단계: 평균 급여 구하기
- 2단계: 그 값보다 높은 사람 찾기

→ 이 두 단계를 하나의 쿼리로! = 서브쿼리

#### WHERE절 서브쿼리

```sql
-- 평균보다 높은 급여를 받는 직원들
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
--              ↑ 이 부분이 서브쿼리 (괄호 안)

-- 특정 조건의 목록 찾기 (IN 사용)
SELECT name
FROM products
WHERE category_id IN (
    SELECT id 
    FROM categories 
    WHERE name LIKE '%전자%'
);
-- 1단계: 전자 관련 카테고리 ID들 찾기
-- 2단계: 그 ID에 해당하는 상품들 찾기
```

#### FROM절 서브쿼리

```sql
-- 부서별 최고 급여자
SELECT name, department, salary
FROM (
    SELECT 
        name,
        department,
        salary,
        ROW_NUMBER() OVER(PARTITION BY department ORDER BY salary DESC) AS rn
    FROM employees
) ranked
WHERE rn = 1;
```

<h5 class="mt-12 mb-0">서브쿼리 활용 패턴</h5>

- 평균/최대/최소와 비교
- 특정 조건 만족하는 ID 목록 찾기
- 복잡한 계산 결과를 임시 테이블로 활용

---

## 6. 윈도우 함수 (고득점의 비밀!)

**윈도우 함수가 뭔가요?** 각 행에서 다른 행들을 "엿볼 수" 있게 해주는 함수

**왜 필요한가요?**
- 각 학생의 점수와 전체 평균을 함께 보고 싶다면?
- 일반 집계함수로는 불가능!


<h5 class="mt-12 mb-0">일반 집계함수 vs 윈도우 함수</h5>

```sql
-- ❌ 일반 집계: 전체가 하나의 값으로 압축됨
SELECT AVG(score) FROM students;  -- 결과: 1행 (전체 평균)

-- ✅ 윈도우 함수: 각 행이 유지되면서 계산됨  
SELECT name, score, 
       AVG(score) OVER() AS 전체평균
FROM students;  -- 결과: 학생 수만큼 행 (각자 점수 + 전체평균)
```

#### 순위 함수

```sql
-- 점수별 순위 매기기
SELECT 
    name,
    score,
    RANK() OVER(ORDER BY score DESC) AS 순위,           -- 동점자 있으면 다음 순위 건너뜀 (1,2,2,4)
    DENSE_RANK() OVER(ORDER BY score DESC) AS 조밀순위,  -- 동점자 있어도 연속 (1,2,2,3)
    ROW_NUMBER() OVER(ORDER BY score DESC) AS 순번       -- 무조건 연속 번호 (1,2,3,4)
FROM students;

-- 그룹별 순위 (PARTITION BY = 그룹 나누기)
SELECT 
    name,
    class,
    score,
    RANK() OVER(PARTITION BY class ORDER BY score DESC) AS 반내순위
FROM students;
-- 1반에서의 순위, 2반에서의 순위를 각각 계산
```

#### 이전/다음 값 가져오기
```sql
-- 전월 대비 매출 증감
SELECT 
    month,
    sales,
    LAG(sales, 1) OVER(ORDER BY month) AS 전월매출,
    LEAD(sales, 1) OVER(ORDER BY month) AS 다음월매출,
    sales - LAG(sales, 1) OVER(ORDER BY month) AS 증감
FROM monthly_sales;
```

#### 누적 계산
```sql
-- 누적합, 이동평균
SELECT 
    date,
    amount,
    SUM(amount) OVER(ORDER BY date) AS 누적합,
    AVG(amount) OVER(ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS 3일이동평균
FROM daily_sales;
```

**🎯 윈도우 함수 단골 문제:**
- 그룹별 1등, 2등, 3등 찾기
- 이전 값과 비교하기
- 누적합, 이동평균 구하기

---

## 7. 내장 함수 마스터하기

#### 날짜 함수

**💡 DATE_FORMAT이 뭔가요?**
날짜 데이터를 원하는 형식의 문자열로 바꿔주는 함수

```sql
-- 원본 데이터: 2024-07-05 14:30:25
-- 원하는 형태: "2024-07-05"

SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS 날짜
FROM posts;

-- 자주 쓰는 포맷들
SELECT
    DATE_FORMAT(created_at, '%Y-%m-%d') AS 년월일,        -- 2024-07-05
    DATE_FORMAT(created_at, '%Y-%m') AS 년월,             -- 2024-07  
    DATE_FORMAT(created_at, '%m-%d') AS 월일,             -- 07-05
    DATE_FORMAT(created_at, '%Y년 %m월 %d일') AS 한글날짜  -- 2024년 07월 05일
FROM posts;
```

**📅 DATE_FORMAT 주요 기호:**
- `%Y`: 4자리 연도 (2024)
- `%y`: 2자리 연도 (24)  
- `%m`: 2자리 월 (07)
- `%d`: 2자리 일 (05)
- `%H`: 24시간 형식 시간 (14)
- `%i`: 분 (30)

```sql
-- 년월별 집계
SELECT 
    DATE_FORMAT(order_date, '%Y-%m') AS 년월,
    COUNT(*) AS 주문수
FROM orders
GROUP BY DATE_FORMAT(order_date, '%Y-%m');
```

#### 문자열 함수

```sql
-- 기본 문자열 조작
SELECT 
    CONCAT(first_name, ' ', last_name) AS 전체이름,    -- 문자열 붙이기
    SUBSTRING(phone, 1, 3) AS 지역번호,              -- 부분 문자열 (1번째부터 3글자)
    LENGTH(email) AS 이메일길이,                      -- 문자열 길이
    REPLACE(content, 'old', 'new') AS 바뀐내용,      -- 문자열 교체
    TRIM(name) AS 공백제거,                          -- 앞뒤 공백 제거
    UPPER(email) AS 대문자변환,                      -- 대문자 변환
    LOWER(email) AS 소문자변환                       -- 소문자 변환
FROM users;

-- LIKE 패턴 매칭 (검색할 때 유용!)
SELECT * FROM products
WHERE name LIKE '%스마트폰%'   -- 앞뒤 어디든 "스마트폰" 포함
   OR name LIKE '아이폰%'      -- "아이폰"으로 시작
   OR name LIKE '%Pro';       -- "Pro"로 끝남
```

**🔍 LIKE 패턴 기호:**
- `%`: 0개 이상의 임의 문자 (뭐든 상관없음)
- `_`: 정확히 1개의 임의 문자
- 예: `LIKE '201_-__-__'` → "2010-01-01", "2019-12-31" 등 매칭


#### 수학함수
```sql
-- 자주 쓰는 수학 함수
SELECT 
    ROUND(price, 2) AS 반올림,        -- 소수점 둘째 자리까지 반올림
    CEIL(price) AS 올림,              -- 올림
    FLOOR(price) AS 내림,             -- 내림
    ABS(profit) AS 절댓값             -- 절댓값
FROM products;
```

---

## 8. NULL 처리

**NULL이 뭔가요?** "값이 없음"을 나타내는 특별한 표시

> 일반적인 빈 값과는 달라요:
>  - 빈 문자열 `''`: 값이 있는데 그게 빈 것
>  - 숫자 `0`: 값이 있는데 그게 0
>  - `NULL`: 아예 값이 없음 (모름, 미입력, 해당없음)

#### 값 대체
```sql
SELECT 
    name,
    name,
    COALESCE(phone, email, '연락처없음') AS 연락방법, -- 왼쪽부터 순서대로 NULL이 아닌 첫 번째 값을 반환 
    -- 실제 동작 예시:
    -- phone='010-1234',  email='a@b.com'  → 결과: '010-1234'
    -- phone=NULL,       email='a@b.com'  → 결과: 'a@b.com'  
    -- phone=NULL,       email=NULL       → 결과: '연락처없음'
    IFNULL(address, '주소미등록') AS 주소             -- 첫 번째 값이 NULL이면 두 번째 값을 반환 
    -- 실제 동작 예시:
    -- address='서울시'  → 결과: '서울시'
    -- address=NULL     → 결과: '주소미등록'
FROM users;
```

#### NULL 값으로 조건 처리하기
```sql
-- NULL 값으로 조건 처리하기
SELECT * FROM users
WHERE phone IS NOT NULL    -- NULL 제외 (≠이 아님!)
  AND email IS NULL;       -- NULL만 선택
```

> **⚠️ 주의:** `= NULL`이 아니라 `IS NULL`을 써야 해요! <br/>
> ```sql
> -- 이 모든 비교의 결과는 NULL (참도 거짓도 아님)
> SELECT 
>    NULL = NULL,     -- 결과: NULL
>    NULL != NULL,    -- 결과: NULL  
>    NULL = 'hello',  -- 결과: NULL
>    5 = NULL;        -- 결과: NULL
> ```
> WHERE 절은 참(TRUE)인 행만 선택하는데, NULL = NULL의 결과는 NULL이라서 참이 아님.


<h5 class="mt-12 mb-0">실전 예제</h5>

```sql
-- 연락 가능한 사용자만 찾기
SELECT name, phone, email
FROM users
WHERE phone IS NOT NULL 
   OR email IS NOT NULL;

-- 완전한 정보가 없는 사용자 찾기  
SELECT name
FROM users
WHERE phone IS NULL 
  AND email IS NULL 
  AND address IS NULL;

-- NULL을 기본값으로 대체해서 정렬
SELECT 
    name,
    COALESCE(score, 0) AS 점수
FROM students
ORDER BY COALESCE(score, 0) DESC;
```

---

## 9. 실전 꿀팁 모음

#### 효율적인 쿼리 작성
```sql
-- ❌ 비효율적: 인덱스 사용 불가
SELECT * FROM users WHERE YEAR(created_at) = 2024;

-- ✅ 효율적: 인덱스 사용 가능
SELECT * FROM users 
WHERE created_at >= '2024-01-01' 
  AND created_at < '2025-01-01';
```

#### 중복 제거
```sql
-- DISTINCT로 중복 제거
SELECT DISTINCT city FROM users;

-- GROUP BY로 중복 제거 + 집계
SELECT city, COUNT(*) 
FROM users 
GROUP BY city;
```

#### UNION vs UNION ALL
```sql
-- UNION: 중복 제거됨 (느림)
SELECT name FROM table1
UNION
SELECT name FROM table2;

-- UNION ALL: 중복 허용 (빠름)
SELECT name FROM table1
UNION ALL
SELECT name FROM table2;
```

> **UNION**
> - 결과를 합치고 중복을 제거
> - 정렬도 자동으로 됨
> - 속도가 느림 (중복 제거 작업 때문에)
> - SELECT 컬럼 수가 맞아야 함.
>
> **UNION ALL**
> - 결과를 합치고 중복 그대로 유지
> - 정렬 안 됨
> - 속도가 빠름
>
> "중복 제거가 필요하면 `UNION`, 모든 데이터가 필요하고 속도가 중요하면 `UNION ALL`을 사용"

#### EXISTS vs IN
```sql
-- EXISTS: 존재 여부만 확인 (빠름)
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = u.id
);

-- IN: 실제 값 비교 (상대적으로 느림)
SELECT * FROM users
WHERE id IN (
    SELECT user_id FROM orders
);
```
---

## 10. 코딩테스트 문제 접근법

<h5 class="mt-4 mb-0">1단계: 문제 파악</h5>

- 어떤 테이블들이 있는지 확인
- 원하는 결과가 무엇인지 파악
- 어떤 조건들이 있는지 정리

<h5 class="mt-12 mb-0">2단계: 쿼리 설계</h5>

1) 어떤 테이블을 FROM 할까?
2) JOIN이 필요한가?
3) WHERE 조건은?
4) GROUP BY가 필요한가?
5) 어떻게 정렬할까?

<h5 class="mt-12 mb-0">3단계: 검증</h5>

- 결과가 맞는지 확인
- 조건을 모두 만족하는지 체크
- 정렬 순서가 맞는지 확인

<h5 class="mt-12 mb-0">🎯 자주 나오는 문제 유형별 해결 패턴</h5>

**순위 문제** → 윈도우 함수 (RANK, ROW_NUMBER)
```sql
SELECT name, score, 
       RANK() OVER(ORDER BY score DESC) AS 순위
FROM students;
```

**그룹별 최대/최소** → 윈도우 함수 또는 서브쿼리
```sql
-- 부서별 최고 급여자
SELECT * FROM (
    SELECT *, 
           ROW_NUMBER() OVER(PARTITION BY dept ORDER BY salary DESC) AS rn
    FROM employees
) WHERE rn = 1;
```

**조건부 집계** → CASE WHEN
```sql
SELECT 
    SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) AS 성공금액,
    COUNT(CASE WHEN status = 'fail' THEN 1 END) AS 실패건수
FROM transactions;
```

**"~한 적 없는" 문제** → LEFT JOIN + IS NULL
```sql
SELECT u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.user_id IS NULL;
```

---

## 마무리

SQL 문법 정복의 핵심은 **패턴 인식**입니다. 

**자주 나오는 패턴들:**
- 그룹별 순위/최대값/최소값 → 윈도우 함수
- "~한 적 없는" → LEFT JOIN + IS NULL
- 조건별 카운팅 → CASE WHEN + COUNT
- 날짜 형식 → DATE_FORMAT
- 평균/최대값과 비교 → 서브쿼리

다음 3편에서는 문제를 풀어보면서 각각 적용하는지 알아보겠습니다!

**연습 추천 순서:**
1. 기본 SELECT, WHERE, ORDER BY로 워밍업
2. GROUP BY + 집계함수로 분석 연습  
3. JOIN으로 테이블 연결 마스터
4. 윈도우 함수로 고급 분석 도전

화이팅! 🚀