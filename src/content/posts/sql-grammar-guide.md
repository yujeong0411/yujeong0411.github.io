---
title: "SQL 기본 문법 실전 가이드 - 코딩테스트 시리즈 2편"
meta_title: "SQL 기본 문법 실전 가이드"
description: "SQL 코딩테스트에서 반드시 알아야 할 핵심 문법들을 실제 예제와 함께 정리했습니다. SELECT부터 JOIN, 윈도우 함수까지 실전 중심으로 설명합니다."
date: 2025-07-05
image: "https://res.cloudinary.com/dofrfwdqh/image/upload/v1751642483/post-3-thumbnail.png"
categories: ["코딩테스트", "SQL"]
tags: ["코딩테스트", "SQL", "데이터"]
draft: false
---
> **SQL 코딩 테스트 완전 정복 시리즈**
> 
> 📌 [1편: SQL 코딩 테스트 벼락치기](/sql-codeing-test) ← 여기에 실제 파일명 입력  
> 📖 **2편: SQL 기본 문법 실전 가이드** (현재 글)  
> 🚀 3편: SQL 코딩테스트 실전 문제 풀이 (coming soon)

이제 본격적으로 SQL 문법을 파해쳐보겠습니다. <br/> 코딩테스트에서 자주 나오는 패턴들을 중심으로 정리했으니, 실전에서 바로 써먹을 수 있을 거예요.
<h5 h5 class="mt-12 mb-0 text-lg"> </h5>

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
