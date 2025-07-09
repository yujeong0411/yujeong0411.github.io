---
title: "SQL 실전 문제 풀이 - 코딩테스트 시리즈 3편"
meta_title: "SQL 기본 문법 실전 가이드"
description: "SQL 코딩테스트에서 반드시 알아야 할 핵심 문법들을 실제 예제와 함께 정리했습니다. SELECT부터 JOIN, 윈도우 함수까지 실전 중심으로 설명합니다."
date: 2025-07-09T15:30:00+09:00
image: "https://res.cloudinary.com/dofrfwdqh/image/upload/v1751696152/post-4-thumbnail.png"
categories: ["코딩테스트", "SQL"]
tags: ["코딩테스트", "SQL", "데이터"]
draft: false
---

> **SQL 코딩 테스트 완전 정복 시리즈**
> 
> 📌 [1편: SQL 코딩 테스트 벼락치기](/sql-codeing-test)  <br/>
> 📖 [2편: SQL 기본 문법 실전 가이드](/sql-grammar-guide)  
> 🚀 **3편: SQL 코딩테스트 실전 문제 풀이** (현재글)

대부분의 회사들이 프로그래머스와 같은 형식이기 때문에 저는 프로그래머스로 연습하였습니다. <br/>
연습 중 헷갈리는 부분, 익숙하지 않은 함수 위주로 정리하였습니다.

---

## 1. 날짜 필터링 

**[프로그래머스] 조건에 맞는 회원수 구하기 - MySQL**

다음과 같은 USER_INFO 테이블에서 2021년에 가입한 20대 사용자 수를 구해야 합니다.<br/>
이를 구현하는 3가지 방법을 비교해보겠습니다.

**USER_INFO 테이블**
| USER_ID | JOINED     | AGE | NAME  |
|---------|------------|-----|-------|
| 1       | 2021-03-15 | 25  | 홍길동 |
| 2       | 2021-08-20 | 27  | 김철수 |
| 3       | 2020-12-31 | 24  | 이영희 |
| 4       | 2022-01-01 | 22  | 박민수 |
| 5       | 2021-12-31 | 29  | 최지현 |

### BETWEEN 방식 (추천)
```sql
SELECT COUNT(*) AS USERS
FROM USER_INFO
WHERE JOINED BETWEEN '2021-01-01' AND '2021-12-31' 
  AND AGE BETWEEN 20 AND 29;
```

**작동 원리**
- `JOINED BETWEEN '2021-01-01' AND '2021-12-31'`: 정확히 2021년 1월 1일부터 12월 31일까지
- `AGE BETWEEN 20 AND 29`: 20세 이상 29세 이하
- 양쪽 경계값 모두 포함 (inclusive)

**장점**
- 정확성: 날짜 범위를 명확하게 지정
- 성능: 인덱스를 효율적으로 활용
- 안전성: 잘못된 날짜 형식 자동 배제
- 가독성: 의도가 명확함

### LIKE 패턴 매칭
```sql
SELECT COUNT(*) AS USERS
FROM USER_INFO
WHERE JOINED LIKE '2021%' 
  AND AGE >= 20 AND AGE <= 29;
```

**작동 원리**
- `JOINED LIKE '2021%'`: 2021로 시작하는 모든 문자열
- `%`는 0개 이상의 임의 문자를 의미
- `AGE >= 20 AND AGE <= 29`: 20세 이상 29세 이하

**장점**
- 간단함: 코드가 짧고 직관적
- 유연함: 문자열 패턴으로 다양한 조건 가능

**단점**
- 위험성: 잘못된 데이터도 포함될 수 있음
- 성능: 패턴 매칭으로 인한 성능 저하

### LEFT 함수
```sql
SELECT COUNT(*) AS USERS
FROM USER_INFO
WHERE LEFT(JOINED, 4) = '2021' 
  AND AGE BETWEEN 20 AND 29;
```

**작동 원리**
- `LEFT(JOINED, 4)`: JOINED 컬럼의 왼쪽부터 4글자 추출
- `= '2021'`: 추출한 4글자가 '2021'과 일치하는지 비교

**장점**
- 명시적: 정확히 4자리 연도만 추출
- 학습용: 문자열 함수 사용법 연습

**단점**
- 성능 저하: 모든 행에서 함수 실행으로 인덱스 활용 불가
- 위험성: 여전히 잘못된 데이터 포함 가능
- 느림: 데이터가 많을수록 현저한 성능 저하

### 다른 연도 필터링 방법

**YEAR 함수**
```sql
-- 간단하지만 인덱스 활용 불가
SELECT COUNT(*) 
FROM USER_INFO
WHERE YEAR(JOINED) = 2021 
  AND AGE BETWEEN 20 AND 29;
```

**DATE_FORMAT**
```sql
-- 유연하지만 성능 저하
SELECT COUNT(*) 
FROM USER_INFO
WHERE DATE_FORMAT(JOINED, '%Y') = '2021' 
  AND AGE BETWEEN 20 AND 29;
```

**부등호 조합**
```sql
-- BETWEEN과 동일한 성능
SELECT COUNT(*) 
FROM USER_INFO
WHERE JOINED >= '2021-01-01' 
  AND JOINED <= '2021-12-31'
  AND AGE BETWEEN 20 AND 29;
```

> 💡 **함수 사용 팁!** <br/>
> - 컬럼에 함수 적용 → ❌ 지양 (인덱스 못 씀)
> - 상수값 생성 함수 → ✅ 괜찮음 (인덱스 활용 가능)
> - 우변/범위값 함수 → ✅ 괜찮음
> - 복잡한 계산 함수 → 상황에 따라 판단
> ```sql
> -- ✅ 이런 건 괜찮아요.
> WHERE 컬럼 >= 함수()                    -- 우변에 함수
> WHERE 컬럼 BETWEEN 함수1() AND 함수2()   -- 범위값에 함수
> WHERE 컬럼 IN (값1, 함수(), 값3)         -- 리스트에 함수
> 
> -- ❌ 이런 건 피하세요. -> 모든 행에서 계산   
> WHERE 함수(컬럼) = 값                   -- 좌변(컬럼)에 함수
> WHERE 함수(컬럼) > 함수()               -- 좌변에 함수
> ```

---

## 2. 자식 개수 구하기 (LEFT JOIN의 활용)

**[프로그래머스] 대장균들의 자식의 수 구하기**

대장균들은 일정 주기로 분화하며, 각 개체의 자식 개수를 구해야 합니다.

**ECOLI_DATA 테이블**
| ID | PARENT_ID | SIZE_OF_COLONY | DIFFERENTIATION_DATE | GENOTYPE |
|----|-----------|----------------|----------------------|----------|
| 1  | NULL      | 10             | 2019/01/01           | 5        |
| 2  | NULL      | 2              | 2019/01/01           | 3        |
| 3  | 1         | 100            | 2020/01/01           | 4        |
| 4  | 2         | 17             | 2020/01/01           | 4        |
| 5  | 2         | 10             | 2020/01/01           | 6        |
| 6  | 4         | 101            | 2021/01/01           | 22       |

### 최적화된 해법: LEFT JOIN 

```sql
SELECT 
    e1.ID,
    COUNT(e2.ID) AS CHILD_COUNT
FROM ECOLI_DATA e1
LEFT JOIN ECOLI_DATA e2 ON e1.ID = e2.PARENT_ID
GROUP BY e1.ID
ORDER BY e1.ID;
```

**실행 과정**
1. **LEFT JOIN**: 모든 개체와 그들의 자식들을 연결
2. **COUNT(e2.ID)**: 자식이 있으면 개수, 없으면 0
3. **GROUP BY**: 각 개체별로 그룹화

**결과**
| ID | CHILD_COUNT |
|----|-------------|
| 1  | 1           |
| 2  | 2           |
| 3  | 0           |
| 4  | 1           |
| 5  | 0           |
| 6  | 0           |

### 대안 해법들

**서브쿼리 방식** ⭐⭐⭐
```sql
SELECT 
    ID,
    (SELECT COUNT(*) 
     FROM ECOLI_DATA e2 
     WHERE e2.PARENT_ID = e1.ID) AS CHILD_COUNT
FROM ECOLI_DATA e1
ORDER BY ID;
```

**CTE 방식** ⭐⭐⭐⭐
```sql
WITH CHILD_COUNTS AS (
    SELECT 
        PARENT_ID,
        COUNT(*) AS CHILD_COUNT
    FROM ECOLI_DATA
    WHERE PARENT_ID IS NOT NULL
    GROUP BY PARENT_ID
)
SELECT 
    e.ID,
    COALESCE(cc.CHILD_COUNT, 0) AS CHILD_COUNT
FROM ECOLI_DATA e
LEFT JOIN CHILD_COUNTS cc ON e.ID = cc.PARENT_ID
ORDER BY e.ID;
```

### 성능 비교

| 방법        | 성능 | 가독성 | 복잡도 | 추천도 |
|-------------|------|--------|--------|--------|
| LEFT JOIN   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 서브쿼리    | ⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐   |
| CTE         | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐⭐   |

---

## 3. WHERE 절 고급 활용

**IN 연산자의 다양한 활용**

```sql
-- 기본 형태
WHERE column IN (값1, 값2, 값3)

-- 역방향 검색
WHERE 'KeyWord' IN (Col1, Col2, Col3)

-- 서브쿼리와 함께
WHERE ID IN (SELECT PARENT_ID FROM ECOLI_DATA WHERE PARENT_ID IS NOT NULL)
```

---

## 4. JOIN vs EXISTS 

**DEVELOPERS 테이블**
| ID | EMAIL         | FIRST_NAME | LAST_NAME | SKILL_CODE |
|----|---------------|------------|-----------|------------|
| 1  | hong@test.com | 홍길동      | 홍        | 6          |
| 2  | kim@test.com  | 김철수      | 김        | 11         |
| 3  | lee@test.com  | 이영희      | 이        | 4          |
| 4  | park@test.com | 박민수      | 박        | 0          |

**SKILLCODES 테이블**
| CODE | NAME       |
|------|------------|
| 1    | HTML       |
| 2    | Python     |
| 4    | C#         |
| 8    | Java       |
| 16   | JavaScript |

**SKILL_CODE는 어떻게 계산될까요?**
```sql
-- 홍길동 (SKILL_CODE = 6)
Python(2) + C#(4) = 6

-- 이진수로 보면:
Python:  0010
C#:      0100  
합계:    0110 = 6

-- 김철수 (SKILL_CODE = 11)  
HTML(1) + Python(2) + Java(8) = 11

-- 이진수로 보면:
HTML:    0001
Python:  0010
Java:    1000
합계:    1011 = 11
```

**비트 AND 연산 (&) 동작:**
```sql
-- 홍길동이 Python 스킬을 가지고 있나?
6 & 2 = 2 > 0 → TRUE ✅

-- 홍길동이 Java 스킬을 가지고 있나?  
6 & 8 = 0 > 0 → FALSE ❌
```

### 방법 1: JOIN 방식 

```sql
SELECT DISTINCT D.ID, D.EMAIL, D.FIRST_NAME, D.LAST_NAME
FROM DEVELOPERS D
JOIN SKILLCODES S ON (D.SKILL_CODE & S.CODE > 0)
WHERE S.NAME IN ('Python', 'C#')
ORDER BY D.ID
```

**실행 과정 분석**

1. **개발자와 매칭되는 스킬들이 조합됨**

| ID | NAME  | SKILL_CODE | S.CODE | S.NAME | 비트연산결과 |
|----|-------|------------|--------|--------|-------------|
| 1  | 홍길동 | 6          | 2      | Python | 6&2=2>0 ✅  |
| 1  | 홍길동 | 6          | 4      | C#     | 6&4=4>0 ✅  |
| 2  | 김철수 | 11         | 1      | HTML   | 11&1=1>0 ✅ |
| 2  | 김철수 | 11         | 2      | Python | 11&2=2>0 ✅ |
| 2  | 김철수 | 11         | 8      | Java   | 11&8=8>0 ✅ |
| 3  | 이영희 | 4          | 4      | C#     | 4&4=4>0 ✅  |
| 4  | 박민수 | 0          | (매칭 없음) |

2. **WHERE 필터링**

| ID | NAME  | S.NAME |
|----|-------|--------|
| 1  | 홍길동 | Python |
| 1  | 홍길동 | C#     | ← 중복!
| 2  | 김철수 | Python |
| 3  | 이영희 | C#     |

3. **DISTINCT 적용**

| ID | EMAIL         | FIRST_NAME | LAST_NAME |
|----|---------------|------------|-----------|
| 1  | hong@test.com | 홍길동      | 홍        |
| 2  | kim@test.com  | 김철수      | 김        |
| 3  | lee@test.com  | 이영희      | 이        |

**JOIN 방식의 특징**

✅ **장점**
- 직관적: 테이블 조인의 일반적인 패턴
- 확장성: 여러 스킬 조건을 IN으로 쉽게 추가
- 디버깅 용이: 중간 결과를 단계별로 확인 가능

⚠️ **단점**
- 중복 데이터: Python과 C# 둘 다 가진 개발자는 2번 나타남
- DISTINCT 필수: 중복 제거를 위한 추가 처리 필요
- 메모리 사용량: 중간 결과가 실제 필요한 것보다 많음

### 방법 2: EXISTS 방식 (추천)

"서브쿼리에 결과가 있으면 TRUE, 없으면 FALSE"

```sql
-- 기본 문법
SELECT * 
FROM 테이블A
WHERE EXISTS (
    SELECT 1          -- 뭘 SELECT해도 상관없음 (1, *, 컬럼명 등)
    FROM 테이블B 
    WHERE 조건
);

SELECT D.ID, D.EMAIL, D.FIRST_NAME, D.LAST_NAME
FROM DEVELOPERS D
WHERE EXISTS (
    SELECT 1
    FROM SKILLCODES S
    WHERE S.NAME IN ('Python', 'C#')
        AND D.SKILL_CODE & S.CODE > 0
)
ORDER BY D.ID
```

**실행 과정 분석**

```sql
-- 홍길동 (ID=1, SKILL_CODE=6):
-- Python 체크: 6 & 2 = 2 > 0 → TRUE ✅ (여기서 바로 종료)
-- C# 체크: 실행 안 됨 (이미 TRUE이므로)

-- 김철수 (ID=2, SKILL_CODE=11):  
-- Python 체크: 11 & 2 = 2 > 0 → TRUE ✅ (여기서 바로 종료)

-- 이영희 (ID=3, SKILL_CODE=4):
-- Python 체크: 4 & 2 = 0 > 0 → FALSE
-- C# 체크: 4 & 4 = 4 > 0 → TRUE ✅

-- 박민수 (ID=4, SKILL_CODE=0):
-- Python 체크: 0 & 2 = 0 > 0 → FALSE  
-- C# 체크: 0 & 4 = 0 > 0 → FALSE
-- 결과: FALSE (포함 안 됨)
```

| ID | EMAIL         | FIRST_NAME | LAST_NAME |
|----|---------------|------------|-----------|
| 1  | hong@test.com | 홍길동      | 홍        |
| 2  | kim@test.com  | 김철수      | 김        |
| 3  | lee@test.com  | 이영희      | 이        |

**EXISTS 방식의 특징**

✅ **장점**
- 중복 없음: 각 개발자당 최대 1번만 결과에 포함
- DISTINCT 불필요: 애초에 중복이 생기지 않음
- 조기 종료: 첫 번째 매칭 스킬을 찾으면 즉시 중단
- 메모리 효율: 불필요한 중간 데이터 생성하지 않음

⚠️ **단점**
- 복잡성: 서브쿼리 개념 이해 필요
- 디버깅 어려움: 중간 과정을 보기 어려움

### 언제 어떤 방법을 사용할까?

**EXISTS를 추천하는 경우**

1. 성능이 중요한 상황
2. 존재 여부만 확인하면 되는 경우
3. 중복이 많이 발생하는 상황

**JOIN을 추천하는 경우**

1. 스킬 정보도 함께 보여줘야 하는 경우
2. 집계가 필요한 경우
3. 개발/디버깅 단계

---

## 5. 비트 연산 완전 정복 (GENOTYPE 활용)

**[프로그래머스] 특정 형질을 가지는 대장균 찾기**

GENOTYPE을 이용해 특정 형질을 가진 대장균을 찾는 문제입니다. 비트 연산의 핵심을 완전히 이해해보겠습니다!

```sql
-- 2번 형질은 없고, 1번 또는 3번 형질을 가진 대장균 개수
SELECT COUNT(ID) AS COUNT
FROM ECOLI_DATA
WHERE GENOTYPE & 2 = 0
    AND (GENOTYPE & 4 >= 1 OR GENOTYPE & 1 >= 1);
```

### GENOTYPE과 형질의 관계

먼저 **형질이 어떻게 저장되는지** 이해해보겠습니다.

**형질 번호와 비트 위치**
```
비트 위치:  4자리  3자리  2자리  1자리
형질 번호:   4번    3번    2번    1번
10진수값:    8      4      2      1
```

**형질 저장 방식**
- **형질이 있음**: 해당 비트가 `1`
- **형질이 없음**: 해당 비트가 `0`

### 구체적인 예시로 이해하기

**GENOTYPE = 5인 경우**
```sql
10진수: 5
2진수: 0101

비트 분석:
4자리(8): 0 → 4번 형질 없음
3자리(4): 1 → 3번 형질 있음 ✅
2자리(2): 0 → 2번 형질 없음  
1자리(1): 1 → 1번 형질 있음 ✅

결론: 1번, 3번 형질을 가지고 있음
```

**GENOTYPE = 6인 경우**
```sql
10진수: 6
2진수: 0110

비트 분석:
4자리(8): 0 → 4번 형질 없음
3자리(4): 1 → 3번 형질 있음 ✅
2자리(2): 1 → 2번 형질 있음 ✅
1자리(1): 0 → 1번 형질 없음

결론: 2번, 3번 형질을 가지고 있음
```

### 비트 AND 연산 동작 원리

**& 연산의 규칙**
```sql
1 & 1 = 1  ✅ (둘 다 1일 때만 1)
1 & 0 = 0
0 & 1 = 0  
0 & 0 = 0
```

**2번 형질 확인: GENOTYPE & 2**

```sql
-- GENOTYPE = 5인 경우:
  0101  (5를 2진수로)
& 0010  (2를 2진수로)
-------
  0000  (결과: 0) → 2번 형질 없음!

-- GENOTYPE = 6인 경우:
  0110  (6을 2진수로)  
& 0010  (2를 2진수로)
-------
  0010  (결과: 2) → 2번 형질 있음!
```

### 왜 >= 1을 쓸까?

**핵심:** 컴퓨터는 이진수로 계산하지만, **결과를 십진수로 변환해서 보여줍니다!**

**각 형질별 비트 연산 결과값**

| 형질 확인 | 형질 있을 때 결과 | 형질 없을 때 결과 |
|-----------|-------------------|-------------------|
| `GENOTYPE & 1` (1번) | `1` | `0` |
| `GENOTYPE & 2` (2번) | `2` | `0` |
| `GENOTYPE & 4` (3번) | `4` | `0` |
| `GENOTYPE & 8` (4번) | `8` | `0` |

**따라서 두 가지 방법이 가능합니다:**

```sql
-- 방법 1: 정확한 값으로 비교 (각각 다른 값)
WHERE GENOTYPE & 2 = 0          -- 2번 형질 없음
  AND (GENOTYPE & 4 = 4         -- 3번 형질 있음 (결과값 4와 비교)
       OR GENOTYPE & 1 = 1);    -- 1번 형질 있음 (결과값 1과 비교)

-- 방법 2: >= 1로 통일 (추천!)
WHERE GENOTYPE & 2 = 0          -- 2번 형질 없음 (0과 비교)
  AND (GENOTYPE & 4 >= 1        -- 3번 형질 있음 (0이 아닌 값)
       OR GENOTYPE & 1 >= 1);   -- 1번 형질 있음 (0이 아닌 값)
```

### >= 1 방식의 장점

**1. 일관성**
```sql
-- ❌ 헷갈리는 방식: 각각 다른 값
GENOTYPE & 1 = 1
GENOTYPE & 2 = 2  
GENOTYPE & 4 = 4
GENOTYPE & 8 = 8

-- ✅ 직관적인 방식: 모두 동일한 패턴
GENOTYPE & 1 >= 1
GENOTYPE & 2 >= 1
GENOTYPE & 4 >= 1  
GENOTYPE & 8 >= 1
```

**2. 실수 방지**
```sql
-- ❌ 실수하기 쉬움
WHERE GENOTYPE & 4 = 1  -- 틀림! 4여야 함

-- ✅ 실수하기 어려움
WHERE GENOTYPE & 4 >= 1  -- 0이 아니면 OK
```

**3. 코드 가독성**
```sql
-- "형질이 있나?" 라는 의미가 더 명확
WHERE GENOTYPE & 4 >= 1  -- "3번 형질이 있나?"
WHERE GENOTYPE & 4 > 0   -- "3번 형질이 있나?" (같은 의미)
```

### 다른 비트 연산자들

SQL에서 사용할 수 있는 비트 연산자들:

```sql
-- 비트 AND (&) - 가장 많이 사용
SELECT 12 & 10;  -- 결과: 8 (1100 & 1010 = 1000)

-- 비트 OR (|)  
SELECT 12 | 10;  -- 결과: 14 (1100 | 1010 = 1110)

-- 비트 XOR (^) - MySQL에서 지원
SELECT 12 ^ 10;  -- 결과: 6 (1100 ^ 1010 = 0110)
```

### 실전 팁

**비트 연산 마스터 공식**
```sql
-- 형질 확인 패턴
GENOTYPE & (형질값) = 0     → 그 형질이 없음
GENOTYPE & (형질값) >= 1    → 그 형질이 있음

-- 형질값 암기법
1번 형질 → 1  (2^0)
2번 형질 → 2  (2^1)
3번 형질 → 4  (2^2)
4번 형질 → 8  (2^3)
n번 형질 → 2^(n-1)
```

**복합 조건 예시**
```sql
-- 1번과 3번 형질을 모두 가진 경우
WHERE GENOTYPE & 1 >= 1 AND GENOTYPE & 4 >= 1

-- 2번 형질은 없고, 1번 또는 3번 중 하나는 있는 경우  
WHERE GENOTYPE & 2 = 0 
    AND (GENOTYPE & 1 >= 1 OR GENOTYPE & 4 >= 1)

-- 특정 형질 조합을 가진 경우 (비트마스킹)
WHERE GENOTYPE & 5 = 5  -- 1번(1)과 3번(4) 형질 모두 필요: 1+4=5
```

---

## 6. 윈도우 함수 완전 정복 (순위, 백분위, 그룹화)

**[프로그래머스] 대장균 개체의 크기별 분류**

대장균 개체의 크기를 내림차순으로 정렬했을 때 상위 0%~25%를 'CRITICAL', 26%~50%를 'HIGH', 51%~75%를 'MEDIUM', 76%~100%를 'LOW'로 분류하는 문제입니다.

**ECOLI_DATA 테이블**
| ID | SIZE_OF_COLONY |
|----|----------------|
| 1  | 100           |
| 2  | 150           |
| 3  | 80            |
| 4  | 150           |
| 5  | 200           |

### 윈도우 함수가 뭔가요?

**일반 집계함수 vs 윈도우 함수의 차이**

```sql
-- ❌ 일반 집계: 전체가 하나의 값으로 압축됨
SELECT AVG(SIZE_OF_COLONY) FROM ECOLI_DATA;  
-- 결과: 1행 (전체 평균만)

-- ✅ 윈도우 함수: 각 행이 유지되면서 계산됨  
SELECT ID, SIZE_OF_COLONY, 
       AVG(SIZE_OF_COLONY) OVER() AS 전체평균
FROM ECOLI_DATA;  
-- 결과: 5행 (각자 크기 + 전체평균)
```

**핵심:** 윈도우 함수는 **각 행에서 다른 행들을 "엿볼 수" 있게** 해주는 함수입니다!

### OVER 함수 기본 구조

```sql
-- 기본 문법
함수명() OVER (PARTITION BY 컬럼 ORDER BY 컬럼)

-- 옵션들
OVER()                          -- 전체 데이터에 대해
OVER(ORDER BY 컬럼)             -- 정렬된 순서로  
OVER(PARTITION BY 컬럼)         -- 그룹별로
OVER(PARTITION BY 컬럼 ORDER BY 컬럼)  -- 그룹별로 정렬해서
```

### 순위 함수들 완전 비교

예시 데이터로 각 함수의 차이점을 살펴보겠습니다:

| ID | SIZE_OF_COLONY |
|----|----------------|
| 5  | 200           |
| 2  | 150           | ← 동점!
| 4  | 150           | ← 동점!
| 1  | 100           |
| 3  | 80            |

```sql
SELECT ID, SIZE_OF_COLONY,
    ROW_NUMBER() OVER (ORDER BY SIZE_OF_COLONY DESC) AS 순번,
    RANK() OVER (ORDER BY SIZE_OF_COLONY DESC) AS 순위,
    DENSE_RANK() OVER (ORDER BY SIZE_OF_COLONY DESC) AS 조밀순위,
    PERCENT_RANK() OVER (ORDER BY SIZE_OF_COLONY DESC) AS 백분위
FROM ECOLI_DATA;
```

**결과:**
| ID | SIZE | 순번 | 순위 | 조밀순위 | 백분위 |
|----|------|------|------|----------|--------|
| 5  | 200  | 1    | 1    | 1        | 0.0    |
| 2  | 150  | 2    | 2    | 2        | 0.25   |
| 4  | 150  | 3    | 2    | 2        | 0.25   |
| 1  | 100  | 4    | 4    | 3        | 0.75   |
| 3  | 80   | 5    | 5    | 4        | 1.0    |

### 각 함수별 특징 상세 분석

#### 1. ROW_NUMBER() - 순번 매기기
```sql
ROW_NUMBER() OVER (ORDER BY SIZE_OF_COLONY DESC)
```
- **특징**: 무조건 1, 2, 3, 4, 5... 연속 번호
- **동점 처리**: 같은 값이어도 다른 번호 부여
- **용도**: 중복 제거, 상위 N개 선택

#### 2. RANK() - 순위 (동점시 다음 순위 건너뜀)
```sql
RANK() OVER (ORDER BY SIZE_OF_COLONY DESC)
```
- **특징**: 동점자는 같은 순위, 다음 순위는 건너뜀
- **결과**: 1, 2, 2, 4, 5 (3등이 없음)
- **용도**: 일반적인 순위 매기기 (올림픽 방식)

#### 3. DENSE_RANK() - 조밀한 순위
```sql
DENSE_RANK() OVER (ORDER BY SIZE_OF_COLONY DESC)
```
- **특징**: 동점자는 같은 순위, 다음 순위 건너뛰지 않음
- **결과**: 1, 2, 2, 3, 4 (연속적)
- **용도**: 등급 분류, 레벨 시스템

#### 4. PERCENT_RANK() - 백분위 순위
```sql
PERCENT_RANK() OVER (ORDER BY SIZE_OF_COLONY DESC)
```
- **특징**: 0~1 사이의 백분위 값
- **공식**: (RANK - 1) / (총개수 - 1)
- **용도**: 상위 몇 % 계산

### 대장균 분류 문제 해결

이제 실제 문제를 여러 방법으로 해결해보겠습니다!

#### 방법 1: ROW_NUMBER + COUNT (⭐⭐⭐)
```sql
SELECT D.ID,
    CASE
        WHEN D.R <= D.TOTAL_COUNT * 0.25 THEN 'CRITICAL'  -- 상위 25%
        WHEN D.R <= D.TOTAL_COUNT * 0.5 THEN 'HIGH'       -- 상위 50%
        WHEN D.R <= D.TOTAL_COUNT * 0.75 THEN 'MEDIUM'    -- 상위 75%
        ELSE 'LOW'                                         -- 나머지
    END AS COLONY_NAME
FROM (
    SELECT ID,
        ROW_NUMBER() OVER (ORDER BY SIZE_OF_COLONY DESC) AS R,
        COUNT(*) OVER() AS TOTAL_COUNT
    FROM ECOLI_DATA
) D
ORDER BY D.ID;
```

**장점**: 정확한 순번으로 계산  
**단점**: 두 번의 윈도우 함수 호출, 나눗셈 연산

#### 방법 2: PERCENT_RANK (⭐⭐⭐⭐)
```sql
SELECT D.ID,
    CASE
        WHEN D.R <= 0.25 THEN 'CRITICAL'  -- 상위 25%
        WHEN D.R <= 0.5 THEN 'HIGH'       -- 상위 50% 
        WHEN D.R <= 0.75 THEN 'MEDIUM'    -- 상위 75%
        ELSE 'LOW'                         -- 나머지
    END AS COLONY_NAME
FROM (
    SELECT ID,
        PERCENT_RANK() OVER (ORDER BY SIZE_OF_COLONY DESC) AS R
    FROM ECOLI_DATA
) D
ORDER BY D.ID;
```

**장점**: 백분위 직접 계산, 조건 비교 간단  
**단점**: 동점자 처리가 복잡할 수 있음

#### 방법 3: NTILE (⭐⭐⭐⭐⭐) - 최고 추천!
```sql
SELECT ID,
    CASE NTILE(4) OVER (ORDER BY SIZE_OF_COLONY DESC)
        WHEN 1 THEN 'CRITICAL'  -- 1사분위 (상위 25%)
        WHEN 2 THEN 'HIGH'      -- 2사분위 (26%~50%)
        WHEN 3 THEN 'MEDIUM'    -- 3사분위 (51%~75%)
        WHEN 4 THEN 'LOW'       -- 4사분위 (76%~100%)
    END AS COLONY_NAME
FROM ECOLI_DATA
ORDER BY ID;
```

**NTILE(n)의 특징:**
- 데이터를 n개 그룹으로 **균등 분할**
- 각 그룹은 1, 2, 3, 4로 표시
- 가장 직관적이고 목적에 부합

### 성능 비교

| 방법           | 성능 | 가독성 | 메모리 | 추천도 |
|----------------|------|--------|--------|--------|
| ROW_NUMBER     | ⭐⭐⭐   | ⭐⭐⭐   | ⭐⭐⭐   | ⭐⭐⭐   |
| PERCENT_RANK   | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| NTILE          | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 이전/다음 값 참조하기 (LAG/LEAD)

```sql
-- 전월 대비 증감률 계산
SELECT 
    month,
    sales,
    LAG(sales, 1) OVER (ORDER BY month) AS 전월매출,
    LEAD(sales, 1) OVER (ORDER BY month) AS 다음월매출,
    ROUND((sales - LAG(sales, 1) OVER (ORDER BY month)) / 
          LAG(sales, 1) OVER (ORDER BY month) * 100, 2) AS 증감률
FROM monthly_sales;
```

**LAG/LEAD 함수:**
- **LAG(컬럼, n)**: n행 이전의 값
- **LEAD(컬럼, n)**: n행 이후의 값
- **용도**: 전월 대비, 전년 대비, 순차 비교

### 그룹별 윈도우 함수 (PARTITION BY)

```sql
-- 부서별 급여 순위
SELECT 
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS 부서내순위,
    AVG(salary) OVER (PARTITION BY department) AS 부서평균급여
FROM employees;
```

**PARTITION BY의 효과:**
- 각 부서별로 독립적인 순위 계산
- 1반에서의 1등, 2반에서의 1등이 각각 존재

### 윈도우 함수 실전 패턴

#### 1. 그룹별 상위 N개 추출
```sql
-- 각 부서별 상위 3명
SELECT * FROM (
    SELECT name, department, salary,
           ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
    FROM employees
) WHERE rn <= 3;
```

#### 2. 누적합 계산
```sql
SELECT 
    date,
    amount,
    SUM(amount) OVER (ORDER BY date) AS 누적합
FROM daily_sales;
```

#### 3. 이동평균 계산
```sql
SELECT 
    date,
    amount,
    AVG(amount) OVER (
        ORDER BY date 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS 3일이동평균
FROM daily_sales;
```

### 윈도우 함수 선택 가이드

**언제 어떤 함수를 쓸까?**

| 상황 | 추천 함수 | 이유 |
|------|-----------|------|
| 중복 제거하고 순번 | ROW_NUMBER | 무조건 유니크한 번호 |
| 일반적인 순위 | RANK | 동점자 같은 순위, 올림픽 방식 |
| 등급/레벨 분류 | DENSE_RANK | 연속적인 순위 |
| 상위 몇 % 계산 | PERCENT_RANK | 백분위 직접 제공 |
| 균등 그룹 분할 | NTILE | 목적에 최적화 |
| 전월/전년 대비 | LAG/LEAD | 시계열 비교 |

### 💡 핵심 정리

**윈도우 함수의 강력함:**
1. **행 유지**: 원본 데이터를 유지하면서 계산
2. **유연성**: PARTITION BY로 그룹별 계산
3. **성능**: 효율적인 순위/집계 연산
4. **직관성**: 복잡한 로직을 간단하게 표현

**코딩테스트 필수 패턴:**
- 그룹별 순위: `RANK() OVER (PARTITION BY ... ORDER BY ...)`
- 상위 N개: `ROW_NUMBER() + WHERE rn <= N`
- 백분위 분류: `NTILE()` 또는 `PERCENT_RANK()`
- 시계열 비교: `LAG()` / `LEAD()`

이제 윈도우 함수로 웬만한 순위/분류 문제는 다 해결할 수 있어요! 🚀

---

## 마무리

SQL 코딩테스트에서 자주 나오는 패턴들을 정리해보았습니다. 

**핵심 포인트**
1. **날짜 필터링**: `BETWEEN`이 가장 안전하고 효율적
2. **자식 개수**: `LEFT JOIN`이 직관적이고 성능도 좋음
3. **존재 여부 확인**: `EXISTS`가 `JOIN`보다 메모리 효율적
4. **비트 연산**: `&` 연산자로 형질/플래그 체크, `>= 1` 패턴 활용

**비트 연산 핵심 암기 포인트**
- 형질값: 1번(1), 2번(2), 3번(4), 4번(8) = 2^(n-1)
- 형질 있음: `GENOTYPE & 형질값 >= 1`
- 형질 없음: `GENOTYPE & 형질값 = 0`
- 결과는 십진수로 표시되므로 `>= 1`이 편리함!

실제 코딩테스트에서는 **정확성**과 **가독성**을 우선시하되, 시간 복잡도가 중요한 문제에서는 **성능 최적화**도 고려해야 합니다!

