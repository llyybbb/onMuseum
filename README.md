# MuseOn
![alt text](image.png)

**작품을 넘기며 감상하고, AI 도슨트의 해설로 이야기를 발견하는 온라인 미술관**

onMuseum은 메트로폴리탄 미술관의 컬렉션 데이터를 활용한 웹 전시 서비스입니다. 작품을 탐색하는 과정에 다양한 인터랙션을 더해, 사용자가 웹에서도 전시를 둘러보는 즐거움을 느끼고 작품 감상에 몰입할 수 있도록 했습니다.

부서별 전시와 키워드 검색으로 작품을 탐색하고, 작품 정보와 Claude 기반 해설을 함께 살펴볼 수 있습니다.

커버플로 슬라이더와 작품 확대 보기를 통해 웹에서도 작품 감상에 집중할 수 있는 경험을 구현했습니다.

## 서비스 바로가기
https://gorgeous-kangaroo-5530c0.netlify.app/

## 주요 화면 구성
### 랜딩 페이지
과거와 현재를 잇는 예술이라는 서비스의 콘셉트를 전달하기 위해, 랜딩 페이지를 우주 배경으로 구성했습니다. 스크롤에 따라 작품이 차례로 나타나도록 연출해, 사용자가 시간과 공간을 여행하며 예술을 만나는 듯한 경험을 담았습니다.

<img width="480" height="267" alt="Image" src="https://github.com/user-attachments/assets/f678dba4-f746-400a-a447-d983ac242e94" />

<img width="480" height="267" alt="Image" src="https://github.com/user-attachments/assets/e4e4a748-b58f-4c74-bf2f-5a003df8b201" />


```Three.js```와 GSAP ```ScrollTrigger```를 활용해 스크롤 기반의 3D 랜딩 페이지를 구현했습니다. 우주 공간에 배치된 작품과 카메라의 움직임을 스크롤에 연동하고, 마우스 움직임에 반응하는 패럴랙스 효과를 더해 시간과 공간을 여행하며 작품을 만나는 듯한 경험을 연출했습니다.

### 전시관 페이지

해당 페이지의 디자인 컨셉은 작품의 상세정보를 포함하면서도 작품 감상에 방해가 되지 않도록 Apple의 liquid glass 스타일을 차용했습니다. 

<img width="480" height="267" alt="Image" src="https://github.com/user-attachments/assets/857d834a-8c8a-4d67-9f92-13be5401c5ce" />

```Swiper```의 ```Coverflow``` 효과를 활용해 작품을 입체적으로 탐색할 수 있는 전시관을 구현했습니다. ```TanStack Query```의 무한 쿼리로 작품을 점진적으로 불러오고, 탐색 중 다음 데이터를 미리 요청하도록 구성했습니다. 또한 ```GSAP``` 기반의 ```Marquee``` 애니메이션으로 긴 작품 정보를 표시하고, 스켈레톤 UI로 로딩 상태를 안내했습니다.

### 작품 상세보기와 AI 도슨트



