import { useEffect } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

const KakaoMap = () => {
  useEffect(() => {
    console.log('✅ KakaoMap 컴포넌트 실행 시작됨');

    const scriptId = 'kakao-map-sdk';

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove(); // 혹시 이전 실패 스크립트 제거
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src =
      'https://dapi.kakao.com/v2/maps/sdk.js?appkey=8f4f69bfafdb1980ba9b75e225d06193&autoload=false&libraries=services';
    script.async = true;

    script.onload = () => {
      console.log('✅ Kakao SDK 로딩 완료됨');

      if (!window.kakao || !window.kakao.maps) {
        console.error('❌ window.kakao 또는 maps 객체 없음');
        return;
      }

      window.kakao.maps.load(() => {
        console.log('✅ window.kakao.maps 객체 로딩됨');

        const container = document.getElementById('map');
        if (!container) return;

        const defaultPosition = new window.kakao.maps.LatLng(37.5665, 126.978);
        const map = new window.kakao.maps.Map(container, {
          center: defaultPosition,
          level: 3,
        });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const userPosition = new window.kakao.maps.LatLng(lat, lng);

              map.setCenter(userPosition);
              new window.kakao.maps.Marker({
                position: userPosition,
                map,
              });
            },
            (err) => {
              console.warn('❌ 위치 정보를 가져올 수 없음', err);
            }
          );
        }
      });
    };

    script.onerror = () => {
      console.error('❌ Kakao SDK 로딩 실패 (network or permission issue)');
    };

    document.head.appendChild(script);
  }, []);

  return (
    <div
      id="map"
      style={{
        width: '100%',
        height: '400px',
        marginTop: '2rem',
        borderRadius: '10px',
        backgroundColor: '#f0f0f0',
      }}
    />
  );
};

export default KakaoMap;
