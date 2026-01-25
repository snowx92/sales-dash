# Leads Section Updates - TODO

## Task Overview
Add onboarding feedback accordion, created date display, and fix edit modal feedback field

## Files to Update

### 1. `src/components/leads/types.ts` ✅
- [x] Add `onboardingFeedback` field to Lead interface (parsed JSON array)
- [x] Add `createdAtRaw` field for original createdAt timestamp
- [x] Updated UpcomingLead interface with same fields

### 2. `src/lib/api/leads/utils.ts` ✅
- [x] Parse `feedback` JSON string into `onboardingFeedback` array
- [x] Extract questions and answers from the parsed feedback
- [x] Add `createdAtRaw` and `onboardingFeedback` to both Lead and UpcomingLead mappings

### 3. `src/components/leads/LeadsTable.tsx` ✅
- [x] Add created date column display (with calendar icon)
- [x] Add new accordion section for onboarding feedback
- [x] Display questions and answers in a readable format (question/answer pairs)
- [x] Style the onboarding feedback section with indigo theme

### 4. `src/components/leads/EditLeadModal.tsx` ✅
- [x] Initialize feedback field as empty when opening the edit form
- [x] Use lazy initialization with useState to set feedback to ''

## Implementation Details

### Onboarding Feedback Format from API:
```json
[
  {"question": "Do you already have a business?", "answer": "Starting a new business"},
  {"question": "Do You have a website for your business?", "answer": "No, I don't have a website"},
  {"question": "What are you planing to sell ?", "answer": "Physical Products"},
  {"question": "Where did you hear about us ?", "answer": "From a friend"},
  {"question": "What is your goal ?", "answer": "Increase sales"}
]
```

### UI Structure:
```
[Row Expanded]
├── Onboarding Info (Accordion/Collapsible) ✅
│   └── Question → Answer pairs displayed side-by-side
│
└── Previous Feedback
    └── Feedback history entries
```

### Created Date Display:
- Added calendar icon next to attempts count
- Shows date on hover (full datetime)

### Edit Modal Feedback Field:
- Feedback field is now empty by default when opening the edit form
- This allows sales to add fresh feedback without seeing pre-filled data

## Progress ✅
- [x] Analyzed the codebase structure
- [x] Understood the API response format
- [x] Confirmed implementation plan with user
- [x] Update types.ts
- [x] Update utils.ts
- [x] Update LeadsTable.tsx
- [x] Update EditLeadModal.tsx
- [x] Build verification - Success!

