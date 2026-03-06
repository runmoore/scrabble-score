## 1. Table Layout Changes

- [x] 1.1 Remove the "View" column (the `<div className="flex-1 text-right">` block) from the All Games table rows
- [x] 1.2 Replace `flex-1` on all remaining columns with proportional width classes: date `w-[28%]`, game type `w-[20%]`, winner `w-[22%]`, score `w-[30%]`
- [x] 1.3 Add `truncate` class to game type and winner columns to handle overflow with ellipsis
- [x] 1.4 Change row hover from `hover:bg-gray-50 dark:hover:bg-gray-800` to `hover:bg-blue-50 dark:hover:bg-blue-900/30` for a more visible clickability signal on desktop

## 2. Verification

- [x] 2.1 Verify the table renders correctly at 375px width with 3-digit scores (e.g., "312 - 287")
- [x] 2.2 Verify columns stay aligned across all rows and long names truncate properly
