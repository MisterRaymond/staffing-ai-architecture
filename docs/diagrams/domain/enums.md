# Enums

```mermaid
classDiagram
    class Plan {
        <<enumeration>>
        TRIAL
        STARTER
        PRO
        ENTERPRISE
    }

    class OrgStatus {
        <<enumeration>>
        ACTIVE
        SUSPENDED
        CHURNED
    }

    class PermissionScope {
        <<enumeration>>
        own
        team
        all
    }

    class PermissionModule {
        <<enumeration>>
        candidates
        pool
        missions
        job_descriptions
        matching
        pipeline
        clients
        finance
        teams
        placements
        admin
        integrations
    }

    class PoolStatus {
        <<enumeration>>
        IN_POOL
        ACTIVE_PROCESS
        ON_MISSION
        BLACKLISTED
        DO_NOT_CONTACT
    }

    class CandidateSource {
        <<enumeration>>
        MANUAL_IMPORT
        SMART_RECRUITERS
        LINKEDIN_RECRUITER
        INDEED
        MONSTER
        WELCOME_TO_JUNGLE
        APEC
        JOBBOARD_OTHER
        REFERRAL
        INBOUND
        CAREER_SITE
    }

    class MissionStatus {
        <<enumeration>>
        DRAFT
        OPEN
        IN_PROGRESS
        FILLED
        CLOSED
        CANCELLED
    }

    class PipelineStage {
        <<enumeration>>
        NEW
        PRESELECTED
        INTERNAL_INTERVIEW
        PROPOSED_TO_CLIENT
        CLIENT_INTERVIEW
        VALIDATED
        ON_MISSION
        REJECTED
        CANCELLED
    }

    class SkillLevel {
        <<enumeration>>
        BEGINNER
        INTERMEDIATE
        ADVANCED
        EXPERT
    }

    class SkillCategory {
        <<enumeration>>
        LANGUAGE
        FRAMEWORK
        DATABASE
        CLOUD
        DEVOPS
        METHODOLOGY
        SOFT_SKILL
        OTHER
    }

    class Recommendation {
        <<enumeration>>
        STRONG_MATCH
        GOOD_MATCH
        PARTIAL_MATCH
        WEAK_MATCH
    }

    class ContractType {
        <<enumeration>>
        CDI
        CDD
        FREELANCE
        PORTAGE
    }

    class RemotePolicy {
        <<enumeration>>
        ON_SITE
        HYBRID
        FULL_REMOTE
    }

    class Availability {
        <<enumeration>>
        IMMEDIATE
        ONE_MONTH
        TWO_MONTHS
        THREE_MONTHS_PLUS
        NOT_AVAILABLE
    }

    class Seniority {
        <<enumeration>>
        JUNIOR
        MID
        SENIOR
        LEAD
        ARCHITECT
    }

    class PlacementStatus {
        <<enumeration>>
        ACTIVE
        COMPLETED
        EARLY_TERMINATION
        RENEWED
    }

    class AuditAction {
        <<enumeration>>
        CREATE
        UPDATE
        DELETE
        LOGIN
        EXPORT
        IMPERSONATE
    }

    class ParsingStatus {
        <<enumeration>>
        PENDING
        PROCESSING
        COMPLETED
        FAILED
    }
```
