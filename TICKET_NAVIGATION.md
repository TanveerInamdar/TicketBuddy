# Ticket Navigation Flow

## Column Flow
```
Open → In Progress → QA → Resolved
```

## Button Logic

### Move Back Button (Orange)
- **In Progress** → **Open**
- **QA** → **In Progress** 
- **Resolved** → **QA**
- **Hidden** when ticket is in "Open" status

### Move Next Button (Blue)
- **Open** → **In Progress**
- **In Progress** → **QA**
- **QA** → **Resolved**
- **Hidden** when ticket is in "Resolved" status

### Reopen Button (Gray)
- **Resolved** → **Open**
- **Only shown** for resolved tickets

## Visual Indicators

### Move Back Button
- 🟠 Orange color
- ⬅️ Left arrow icon
- Tooltip shows destination column

### Move Next Button  
- 🔵 Blue color
- ➡️ Right arrow icon
- Tooltip shows destination column

### Reopen Button
- ⚫ Gray color
- 🔄 Refresh icon
- Tooltip explains reopening action

## Status Transitions

| Current Status | Move Back → | Move Next → |
|----------------|-------------|-------------|
| Open           | (hidden)    | In Progress |
| In Progress    | Open        | QA          |
| QA             | In Progress | Resolved    |
| Resolved       | QA          | (hidden)    |

## User Experience

1. **Bidirectional Navigation**: Users can move tickets both forward and backward
2. **Visual Feedback**: Clear button colors and icons indicate direction
3. **Tooltips**: Hover tooltips show exactly where the ticket will move
4. **Smart Hiding**: Buttons are hidden when not applicable
5. **Consistent Layout**: All tickets have the same button layout regardless of status
