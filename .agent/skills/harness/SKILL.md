# harness-orchestration
이 스킬은 `revfactory/harness`를 기반으로 하며, Antigravity 환경에서 복잡한 작업을 위해 자율적인 에이전트 팀을 구성하고 진두지휘하는 능력을 제공합니다.

## 🏛️ 하네스 워크플로우 (Orchestration Workflow)

1.  **팀 구성 (Team Assembly)**:
    - 작업의 규모에 따라 오케스트레이터(Orchestrator), 수행자(Worker), 검토자(Reviewer) 역할을 정의합니다.
    - 기존 에이전트(`엘레이드박`, `Codex`, `Antigravity`)에게 역할을 할당합니다.

2.  **전략 수립 (Strategic Planning)**:
    - `writing-plans` 스킬을 사용하여 단계별 실행 계획을 작성합니다.
    - 각 단계의 성공 기준(Success Criteria)을 명확히 정의합니다.

3.  **병렬 실행 및 통합 (Execution & Integration)**:
    - 각 에이전트가 맡은 작업을 수행합니다.
    - `multi_replace_file_content`를 통해 변경 사항을 정밀하게 병합합니다.

4.  **검토 및 검증 (Review & Validation)**:
    - `lint-and-validate` 및 `ui-ux-pro-max`를 사용하여 결과물의 품질을 보증합니다.

## 🛠️ 하네스 전용 도구 활용법

- **`AGENT.md` 참조**: 항상 중앙 제어 파일인 `AGENT.md`를 먼저 읽어 현재 팀의 구성과 규칙을 확인하십시오.
- **`CODEX_BRIEFING.md`**: 백엔드 또는 데이터 처리가 필요한 경우 Codex 에이전트에게 전달할 브리핑 문서를 작성합니다.

## ⚠️ 주의사항
- 하네스 시스템은 자율성을 강조하지만, 산박대표님의 최종 승인(작업 진행!) 없이는 코드 수정을 시작하지 않습니다.
- 모든 로직은 `Vanilla JS`, `Tailwind`, `Supabase` 환경에 최적화되어야 합니다.
