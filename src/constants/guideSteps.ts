export type GuideVisualType =
  | 'walkPath'
  | 'territoryStack'
  | 'territoryBattle'
  | 'gpsRule'
  | 'loopRule'
  | 'dailyLimit'
  | 'walkControls'
  | 'walkStats'
  | 'walkTerritory'

export interface GuideStepData {
  title: string
  description: string
  visualType: GuideVisualType
}

export const SERVICE_INTRO_STEPS: GuideStepData[] = [
  {
    title: '산책으로 우리 강아지의\n영토를 만들어요',
    description: '시작과 끝이 만나야 \n우리만의 영토가 생겨요.',
    visualType: 'walkPath',
  },
  {
    title: '지도의 빈 곳을 채워나가요',
    description: '새로운 장소일수록 \n경험치가 더 크게 쌓여요.',
    visualType: 'territoryStack',
  },
  {
    title: '다른 강아지들과\n영토를 겨뤄봐요',
    description: '이웃 강아지들의 영토도 지도에서 볼 수 있어요.\n우리 동네 산책왕이 되어보세요.',
    visualType: 'territoryBattle',
  },
]

export const PRE_WALK_GUIDE_STEPS: GuideStepData[] = [
  {
    title: '산책은 항상 기록돼요',
    description:
      '영토 조건을 만족하지 못해도 일반 산책으로 저장되고,\n거리와 시간에 따른 경험치가 쌓여요.',
    visualType: 'gpsRule',
  },
  {
    title: '영토가 되려면\n이 조건이 필요해요',
    description:
      '5분 이상 걷고, 출발 지점 근처로 돌아오면 돼요.\n경로가 충분한 면적과 폭을 만들면 영토로 인정돼요.',
    visualType: 'loopRule',
  },
  {
    title: '같은 영역은 하루에\n한 번만 점령할 수 있어요',
    description:
      '24시간 동안은 같은 영토를 다시 점령할 수 없어요.\n새로운 곳을 걸어 영토를 넓혀보세요.',
    visualType: 'dailyLimit',
  },
]

export const WALK_HELP_STEPS: GuideStepData[] = [
  {
    title: '시작 버튼을 눌러\n산책을 시작해요',
    description: '시작 버튼을 누르면 GPS 경로 기록이 시작돼요.',
    visualType: 'walkControls',
  },
  {
    title: '산책 정보를 실시간으로\n확인할 수 있어요',
    description: '산책 중에 거리, 시간,\n반려견 소모 칼로리까지 확인할 수 있어요.',
    visualType: 'walkStats',
  },
  {
    title: '조건을 채우면\n영토에 도전해요',
    description:
      '조건을 만족하지 못해도 일반 산책으로 기록되고,\n거리와 시간에 따른 XP는 정상적으로 쌓여요.',
    visualType: 'walkTerritory',
  },
]
