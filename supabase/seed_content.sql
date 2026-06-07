-- =========================================================
-- nyam (team-6) 데모 콘텐츠 시드
-- schema.sql 실행 후 SQL Editor 에 붙여넣어 실행하세요.
-- 데모 유저 3명 + 서울 장소 6곳 + 리뷰/좋아요/북마크
-- =========================================================

-- ---------- 데모 유저 ----------
insert into users (email, nickname, gender, birth) values
  ('nyam_demo@nyam.io', '냠냠이', 'female', '95-10-23'),
  ('sungsu@nyam.io',    '성수러버', 'none',   null),
  ('mukbang@nyam.io',   '먹킷리스트', 'male',  '92-03-11')
on conflict (email) do nothing;

-- ---------- 데모 장소 (서울) ----------
insert into places (kakao_id, name, category, address, road_address, phone, place_url, lat, lng) values
  ('demo-1', '대림창고 갤러리 컬럼비아', '음식점 > 카페 > 커피전문점', '서울 성동구 성수동2가 78-78', '서울 성동구 성수이로 78', '02-498-7474', 'https://place.map.kakao.com/demo1', 37.54462, 127.05601),
  ('demo-2', '어니언 성수', '음식점 > 카페', '서울 성동구 성수동2가 277-135', '서울 성동구 아차산로9길 8', '070-7816-2710', 'https://place.map.kakao.com/demo2', 37.54470, 127.05772),
  ('demo-3', '도산분식 가로수길', '음식점 > 분식', '서울 강남구 신사동 533-6', '서울 강남구 강남대로162길 41', '02-545-4150', 'https://place.map.kakao.com/demo3', 37.52190, 127.02270),
  ('demo-4', '연남동 감자탕집', '음식점 > 한식 > 감자탕', '서울 마포구 연남동 239-1', '서울 마포구 성미산로 161', '02-333-0001', 'https://place.map.kakao.com/demo4', 37.56020, 126.92550),
  ('demo-5', '을지로 노가리 호프', '음식점 > 술집 > 호프,요리주점', '서울 중구 을지로3가 12', '서울 중구 충무로 30', '02-2266-0002', 'https://place.map.kakao.com/demo5', 37.56620, 126.99100),
  ('demo-6', '망원동 티라미수', '음식점 > 카페 > 디저트카페', '서울 마포구 망원동 414-58', '서울 마포구 포은로 100', '02-322-0003', 'https://place.map.kakao.com/demo6', 37.55560, 126.90130)
on conflict (kakao_id) do nothing;

-- ---------- 데모 리뷰 ----------
insert into reviews (user_id, place_id, content)
select u.id, p.id, v.content
from (values
  ('nyam_demo@nyam.io', 'demo-1', '벽돌 창고 그대로 살린 분위기가 진짜 미쳤어요. 라떼 한 잔 시켜놓고 사진만 백 장 찍고 왔네요 ㅎㅎ 주말엔 웨이팅 각오.'),
  ('nyam_demo@nyam.io', 'demo-3', '떡볶이 국물이 꾸덕하고 튀김이랑 같이 먹으면 끝이에요. 가로수길 쇼핑하다 들르기 딱 좋은 위치라 자주 옵니다.'),
  ('sungsu@nyam.io',    'demo-1', '커피 맛도 좋고 디저트도 알차요. 천장이 높아서 공간이 탁 트인 느낌. 평일 오전에 가면 한적해서 더 좋습니다.'),
  ('sungsu@nyam.io',    'demo-2', '어니언 성수는 빵이 진리예요. 팡도르는 무조건 시켜야 하고 오픈런 추천. 인더스트리얼 인테리어 감성 최고.'),
  ('mukbang@nyam.io',   'demo-4', '뼈에 살이 통통하게 붙어있고 국물이 깊어요. 셋이 가서 대자 시키니 배 터지게 먹었네요. 해장으로도 굿굿.'),
  ('mukbang@nyam.io',   'demo-5', '노가리에 생맥 조합은 못 참지. 가성비 좋고 안주도 빨리 나와요. 퇴근하고 한잔 하기 딱 좋은 을지로 노포 감성.')
) as v(email, kakao_id, content)
join users u on u.email = v.email
join places p on p.kakao_id = v.kakao_id
where not exists (
  select 1 from reviews r where r.user_id = u.id and r.place_id = p.id
);

-- ---------- 데모 북마크 (리뷰 없이 저장만 = 회색 별) ----------
insert into bookmarks (user_id, place_id)
select u.id, p.id
from (values
  ('nyam_demo@nyam.io', 'demo-2'),
  ('nyam_demo@nyam.io', 'demo-6')
) as v(email, kakao_id)
join users u on u.email = v.email
join places p on p.kakao_id = v.kakao_id
on conflict (user_id, place_id) do nothing;

-- ---------- 데모 좋아요 ----------
insert into likes (user_id, review_id)
select u.id, r.id
from reviews r
join users u on u.email in ('sungsu@nyam.io', 'mukbang@nyam.io')
where r.place_id = (select id from places where kakao_id = 'demo-1')
on conflict (user_id, review_id) do nothing;
