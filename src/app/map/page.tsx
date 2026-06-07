"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRequireAuth } from "@/lib/useSession";
import { getMySavedPlaces } from "@/lib/store";
import { isKakaoConfigured, loadKakao, searchPlaces } from "@/lib/kakao";
import type { KakaoPlace, SavedPlace } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { BottomNav } from "@/components/BottomNav";
import { PlaceSheet } from "@/components/PlaceSheet";
import { GpsIcon, SearchIcon, StarIcon } from "@/components/icons";
import { Spinner } from "@/components/Spinner";

const SEOUL = { lat: 37.5665, lng: 126.978 };

export default function MapPage() {
  const { user, ready } = useRequireAuth();
  const toast = useToast();

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<KakaoPlace[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<KakaoPlace | null>(null);
  const [kakaoReady, setKakaoReady] = useState(false);

  const configured = isKakaoConfigured();

  // 지도 초기화
  useEffect(() => {
    if (!ready || !configured) return;
    let alive = true;
    loadKakao()
      .then((kakao) => {
        if (!alive || !mapEl.current) return;
        const center = new kakao.maps.LatLng(SEOUL.lat, SEOUL.lng);
        const map = new kakao.maps.Map(mapEl.current, { center, level: 7 });
        map.setMaxLevel(11);
        mapRef.current = map;
        setKakaoReady(true);
        // 현재 위치로 이동 시도
        moveToCurrentLocation(false);
      })
      .catch(() => toast("지도를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, configured]);

  // 저장된 장소 마커 렌더
  const renderMarkers = useCallback(
    (places: SavedPlace[], kakao: any) => {
      const map = mapRef.current;
      if (!map) return;
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];

      places.forEach((p) => {
        const el = document.createElement("div");
        el.style.cursor = "pointer";
        el.style.transform = "translateY(-50%)";
        el.innerHTML = starSvg(p.star);
        el.addEventListener("click", () => {
          setResults(null);
          setSelected(p);
        });
        const overlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(p.lat, p.lng),
          content: el,
          yAnchor: 1,
          clickable: true,
        });
        overlay.setMap(map);
        overlaysRef.current.push(overlay);
      });
    },
    []
  );

  const reloadSaved = useCallback(async () => {
    if (!user || !mapRef.current || !window.kakao) return;
    try {
      const places = await getMySavedPlaces(user.id);
      renderMarkers(places, window.kakao);
    } catch {
      /* 마커 로드 실패는 조용히 무시 */
    }
  }, [user, renderMarkers]);

  useEffect(() => {
    if (kakaoReady) reloadSaved();
  }, [kakaoReady, reloadSaved]);

  const moveToCurrentLocation = (notify = true) => {
    if (!navigator.geolocation || !mapRef.current || !window.kakao) {
      if (notify) toast("위치 정보를 사용할 수 없어요.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = new window.kakao.maps.LatLng(latitude, longitude);
        mapRef.current.setLevel(5);
        mapRef.current.panTo(loc);
      },
      () => {
        if (notify) toast("위치 권한이 없어 기본 위치로 표시해요.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const runSearch = async () => {
    const q = keyword.trim();
    if (!q) return;
    setSearching(true);
    try {
      const map = mapRef.current;
      const center = map
        ? { lat: map.getCenter().getLat(), lng: map.getCenter().getLng() }
        : SEOUL;
      const found = await searchPlaces(q, center);
      setResults(found);
      if (found.length === 0) {
        toast("검색 결과가 없어요");
      } else if (map && window.kakao) {
        map.panTo(new window.kakao.maps.LatLng(found[0].lat, found[0].lng));
      }
    } catch {
      toast("일치하는 장소가 없어요. 다른 키워드로 검색해보세요!");
    } finally {
      setSearching(false);
    }
  };

  const pickResult = (p: KakaoPlace) => {
    setResults(null);
    setKeyword("");
    if (mapRef.current && window.kakao) {
      mapRef.current.setLevel(4);
      mapRef.current.panTo(new window.kakao.maps.LatLng(p.lat, p.lng));
    }
    setSelected(p);
  };

  if (!ready || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="text-key" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col">
      {/* 지도 */}
      <div className="relative flex-1">
        {configured ? (
          <div ref={mapEl} className="kakao-map absolute inset-0" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-field px-8 text-center">
            <p className="text-sm font-semibold text-ink">카카오 지도 키가 필요해요</p>
            <p className="text-xs leading-relaxed text-sub">
              <code>.env.local</code> 에 <code>NEXT_PUBLIC_KAKAO_MAP_KEY</code> 를
              설정하면 지도가 표시됩니다.
            </p>
          </div>
        )}

        {/* 검색창 */}
        <div className="absolute inset-x-0 top-0 z-20 px-4 pt-3">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-white/95 px-4 py-2.5 shadow-card backdrop-blur">
            <SearchIcon className="h-5 w-5 text-sub" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="주소, 상호명 검색"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-sub"
            />
            {searching && <Spinner className="text-key" />}
          </div>

          {/* 검색 결과 */}
          {results && results.length > 0 && (
            <div className="mt-2 max-h-[50vh] overflow-y-auto rounded-2xl border border-line bg-white shadow-card">
              {results.map((p) => (
                <button
                  key={p.kakaoId}
                  onClick={() => pickResult(p)}
                  className="flex w-full flex-col items-start border-b border-line px-4 py-3 text-left last:border-0 hover:bg-field"
                >
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="mt-0.5 truncate text-xs text-sub">
                    {p.roadAddress || p.address}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS 버튼 */}
        {configured && (
          <button
            onClick={() => moveToCurrentLocation(true)}
            className="absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink shadow-card transition active:scale-95"
            aria-label="현재 위치"
          >
            <GpsIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <BottomNav />

      {selected && (
        <PlaceSheet
          kakaoPlace={selected}
          userId={user.id}
          onClose={() => setSelected(null)}
          onChanged={reloadSaved}
        />
      )}
    </div>
  );
}

// 마커용 별 SVG
function starSvg(star: "gray" | "fill"): string {
  const fill = star === "fill" ? "#ffc83d" : "#9aa0a6";
  return `<svg width="30" height="30" viewBox="0 0 24 24" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">
    <path d="M12 2.6l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.9l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.94L12 2.6z"
      fill="${fill}" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`;
}
