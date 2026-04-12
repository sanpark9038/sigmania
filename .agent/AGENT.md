# AGENT.md (Antigravity Orchestration Core)

이 파일은 `revfactory/harness`를 Antigravity 환경에 맞게 이식한 중앙 관리 문서입니다.
현재 프로젝트의 에이전트 팀 구성과 운영 정책을 정의합니다.

## 🏛️ 에이전트 및 운영 정보 (Agent & Ops)

| 명칭 | 핵심 임무 | 정의/위치 |
| :--- | :--- | :--- |
| **El-Rade Park (엘레이드박)** | CTO & Creative Director (UI/UX 총괄) | [.agent/el-rade-park.md](file:///.agent/el-rade-park.md) |
| **Workflows** | Behavioral Guidelines (행동 지침) | [.agent/workflows/](file:///.agent/workflows/) |
| **Skills** | Specialized Capabilities (전문 스킬) | [.agent/skills/](file:///.agent/skills/) |

> [!NOTE]
> 현재 시스템은 **엘레이드박(Antigravity)**이 모든 실행 권한을 가지고 직접 작업을 수행합니다.

## 🛠️ 운영 정책 (Operational Rules)

1.  **Direct Execution**: 박부장이 기획부터 구현, 검토까지 원스톱으로 처리합니다.
2.  **Surgical Edits Only**: 파일 전체를 다시 쓰지 마십시오. 필요한 부분만 정확하게 수정합니다.
3.  **Premium Design**: 모든 UI는 `ui-ux-pro-max` 및 `frontend-design` 스킬을 참고하여 최상급 품질로 제작합니다.
4.  **Flat Architecture**: 모든 에이전트 설정은 `.agent/` 루트 폴더 내에서 관리합니다.

## 🏗️ 프로젝트 가이드
- 기능을 확장하려면 `.agent/skills/`에 새로운 스킬을 정의하십시오.
- **중요**: 모든 작업 시작 전 `.planning/PROJECT.md`와 `.planning/active/TASK.md`를 반드시 먼저 읽으십시오.
- 모든 디버깅 기록은 `.planning/debug/`에 아카이빙합니다.
