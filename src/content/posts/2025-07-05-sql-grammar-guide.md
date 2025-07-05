---
title: "SQL 기본 문법 실전 가이드 - 코딩테스트 시리즈 2편"
meta_title: "SQL 기본 문법 실전 가이드"
description: "SQL 코딩테스트에서 반드시 알아야 할 핵심 문법들을 실제 예제와 함께 정리했습니다. SELECT부터 JOIN, 윈도우 함수까지 실전 중심으로 설명합니다."
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

이제 본격적으로 SQL 문법을 파해쳐보겠습니다. <br/> 코딩테스트에서 자주 나오는 패턴들을 중심으로 정리했으니, 실전에서 바로 써먹을 수 있을 거예요.

---

## 1. SELECT 기본기 다지기
<h5 class="mt-5 mb-0">기본 문법 다지기</h5>

```sql
SELECT column1, column2, column3 AS col3
FROM table_name
WHERE 조건
GROUP BY column1
HAVING 집계함수_조건
ORDER BY column1 ASC, colums2 DESC
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

<h5 class="mt-12 mb-0 text-lg">💡 TIP : WHERE vs HAVING 언제 써야 할까요?</h5>

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

<h5 class="mt-12 mb-0">핵심 집계함수</h5>

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

<h5 class="mt-12 mb-0">GROUP BY와 함께 사용</h5>

**GROUP BY가 왜 필요한가요?** <br/>
집계함수만 쓰면 전체에 대한 하나의 값만 나오게 됩니다.
하지만 "부서별로", "월별로" 나누어서 보고 싶다면? → `GROUP BY` 사용!

```sql
-- ❌ 이렇게 하면: 전체 직원의 평균 급여만 나옴
SELET AVG(salary) FROM employees;

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

**JOIN이 왜 필요한가요?** 실제 데이터베이스는 여러 행태로 나누어져 있습니다. 

**예시 상황:**

- `users` 테이블: 회원 정보 (id, name, email)
- `orders` 테이블: 주문 정보 (id, user_id, amount, date)

김철수가 얼마나 주문했는지" 보려면? → 두 테이블을 연결해야 함! 

<h5 class="mt-12 mb-0">JOIN 종류별 차이점</h5>

```sql
-- INNER JOIN: 양쪽 테이블에 모두 데이터가 있는 경우만
SELECT u.name, o.amount
FROM user u
INNER JOIN orders o ON u.id = o.user_id;
-- 결과: 주문한 적 있는 회원들만 나옴

-- LEFT JOIN: 왼쪽 테이블(users) 기준, 오른쪽이 없으면 NULL
SELECT u.naem, o.amount
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

<h5 class="mt-12 mb-0">실전 문제 스타일</h5>

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

## 4. 조건문 활용하기

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
```

<h5 class="mt-12 mb-4 text-red-500">💡 이 패턴 정말 많이 나와요!</h5>

**하나의 쿼리로 여러 조건의 집계를 구할 때 사용합니다.**

---

## 5. 서브쿼리 정복하기

**서브쿼리가 뭔가요?** 쿼리 안에 들어있는 또 다른 쿼리

**왜 필요한가요?**
```sql
-- 이런 질문이 있다면: "평균보다 높은 급여를 받는 사람은?"
-- 1단계: 평균 급여 구하기
-- 2단계: 그 값보다 높은 사람 찾기
-- → 이 두 단계를 하나의 쿼리로! = 서브쿼리
```

#### WHERE절 서브쿼리

```sql
-- 평균보다 높은 급여를 받는 직원들
SELECT naem, salary
FROM employees
WHERE salary > (SELECT AVG)
```