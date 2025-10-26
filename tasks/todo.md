# Todo List: Fix Missing Translation Key `navigation.home`

## Goal
Add the missing `navigation.home` translation key to English and Georgian translation files to fix the i18next missing key errors.

## Problem
The application is showing multiple console errors:
```
i18next::translator: missingKey en translation navigation.home Home
```

The `navigation.home` key is used in FlowiseChatWindow.tsx (line 980) but is missing from:
- English translation file
- Georgian translation file
- Russian translation file has it, so we can use that as a reference

## Tasks

- [ ] Add `home` key to English navigation translation file
- [ ] Add `home` key to Georgian navigation translation file

## Files to Update
- `/src/i18n/translations/en/navigation.ts` - Add `home: 'Home'` key
- `/src/i18n/translations/ka/navigation.ts` - Add `home: 'მთავარი'` key (Georgian for "Home")

## Reference
Russian translation already has: `home: 'Главная'`
