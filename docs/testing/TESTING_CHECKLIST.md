# ✅ Testing Checklist - Notification Center & Admin Dashboard

**Date**: October 13, 2025  
**Tester**: _______________  
**Time Started**: _______________

---

## 🔐 Step 1: Login

- [ ] Navigate to http://localhost:5173
- [ ] See login page
- [ ] Enter credentials:
  - Email: `teste@hpo.com`
  - Password: `senha1234`
- [ ] Click "Entrar" button
- [ ] **SUCCESS**: Dashboard loads, see user name in header

**Notes**: _______________________________________

---

## 👑 Step 2: Access Admin Dashboard

- [ ] Look at header - see **👑 Admin** button
- [ ] Click **👑 Admin** button
- [ ] Admin dashboard loads
- [ ] See 4 stats cards:
  - Pending translations
  - Pending conflicts
  - Low quality items
  - Approved for sync
- [ ] See moderation queue below
- [ ] **SUCCESS**: See list of pending translations

**Stats Values**:
- Pending: _____
- Conflicts: _____
- Low Quality: _____
- Approved for Sync: _____

**Notes**: _______________________________________

---

## ✅ Step 3: Approve a Translation

- [ ] Find a translation in the moderation queue
- [ ] Note the translation details:
  - HPO ID: _______________
  - Term: _______________
  - Translation: _______________
- [ ] Click **✅ Aprovar** button
- [ ] Approve modal opens
- [ ] See translation details in modal
- [ ] Click "Confirmar Aprovação" button
- [ ] **SUCCESS**: See success message
- [ ] Translation removed from queue
- [ ] Look at header - bell icon should show red badge

**Badge Count**: _____

**Notes**: _______________________________________

---

## 🔔 Step 4: View Notifications

- [ ] Look at header - see 🔔 bell icon with red badge
- [ ] Badge shows count: _____
- [ ] Click bell icon
- [ ] Dropdown opens (400x600px modal)
- [ ] See notification list
- [ ] **SUCCESS**: See approved translation notification
- [ ] Notification has:
  - Blue background (#eff6ff)
  - Blue dot on left
  - Title (bold)
  - Message
  - Timestamp
  - Trash icon (🗑️)

**Notification Text**: _______________________________________

**Notes**: _______________________________________

---

## 📖 Step 5: Mark Notification as Read

- [ ] Click on the notification (not the trash icon)
- [ ] **SUCCESS**: 
  - Blue dot disappears
  - Background turns white
  - Badge count decrements (if was 1, now 0)
  - Page navigates to History

**New Badge Count**: _____

**Notes**: _______________________________________

---

## 🗑️ Step 6: Delete Notification

- [ ] Click bell icon again
- [ ] See notification list (notification now white background)
- [ ] Click 🗑️ trash icon on a notification
- [ ] **SUCCESS**: Notification disappears from list

**Remaining Notifications**: _____

**Notes**: _______________________________________

---

## 🔄 Step 7: Test Auto-Refresh

- [ ] Keep app open
- [ ] Note current time: _______________
- [ ] Wait 30 seconds
- [ ] Time after wait: _______________
- [ ] Go to Admin Dashboard
- [ ] Approve another translation
- [ ] Note time: _______________
- [ ] Wait and watch bell icon
- [ ] **SUCCESS**: Badge updates within 30 seconds without refresh

**Time for badge update**: _____ seconds

**Notes**: _______________________________________

---

## 🎯 Step 8: Mark All as Read

### Setup (need multiple notifications):
- [ ] Go to Admin Dashboard
- [ ] Approve 2-3 more translations
- [ ] Click bell icon
- [ ] See multiple unread notifications (blue background)

### Test:
- [ ] Click "Marcar todas como lidas" button
- [ ] **SUCCESS**:
  - All notifications turn white
  - All blue dots disappear
  - Badge shows 0

**Notifications marked**: _____

**Notes**: _______________________________________

---

## ❌ Step 9: Reject a Translation (Bonus)

- [ ] Go to Admin Dashboard
- [ ] Find a translation in queue
- [ ] Click **❌ Rejeitar** button
- [ ] Reject modal opens
- [ ] Select reason code from dropdown: _______________
- [ ] Type detailed reason (min 10 characters)
- [ ] Click "Confirmar Rejeição"
- [ ] **SUCCESS**: 
  - See success message
  - Translation removed from queue
  - Bell badge increments (new notification)

**Badge Count**: _____

**Notes**: _______________________________________

---

## 🔍 Step 10: Verify Notification Content

- [ ] Click bell icon
- [ ] See rejected translation notification
- [ ] Read notification message
- [ ] **SUCCESS**: Message includes reason code and details

**Notification includes**:
- [ ] Clear title
- [ ] Rejection reason
- [ ] Detailed explanation
- [ ] Timestamp

**Notes**: _______________________________________

---

## 🌐 Step 11: Test Deep Links

- [ ] Click bell icon
- [ ] Click a notification
- [ ] **SUCCESS**: Navigates to History page
- [ ] Go back to Admin Dashboard
- [ ] Notification should be marked as read (white)

**Pages navigated**:
- From: _______________
- To: _______________

**Notes**: _______________________________________

---

## 🎨 Step 12: Visual Verification

### Bell Icon:
- [ ] Visible in header (between Admin and user info)
- [ ] Shows 🔔 emoji
- [ ] Badge appears when unread count > 0
- [ ] Badge is red with white text
- [ ] Badge shows "99+" if count > 99

### Notification Dropdown:
- [ ] Fixed position (top-right)
- [ ] 400px wide
- [ ] White background
- [ ] Shadow effect visible
- [ ] Header with title and buttons
- [ ] Scrollable list
- [ ] Close button (×) works

### Individual Notifications:
- [ ] Unread: Blue background, blue dot
- [ ] Read: White background, no dot
- [ ] Title is bold (unread) or normal (read)
- [ ] Message text is clear
- [ ] Timestamp in Portuguese format
- [ ] Trash icon visible and clickable

**Visual Issues**: _______________________________________

---

## 🐛 Bug Report Section

### Issues Found:

**Issue 1**:
- **Severity**: [ ] Critical  [ ] Major  [ ] Minor
- **Description**: _______________________________________
- **Steps to Reproduce**: _______________________________________
- **Expected**: _______________________________________
- **Actual**: _______________________________________

**Issue 2**:
- **Severity**: [ ] Critical  [ ] Major  [ ] Minor
- **Description**: _______________________________________
- **Steps to Reproduce**: _______________________________________
- **Expected**: _______________________________________
- **Actual**: _______________________________________

**Issue 3**:
- **Severity**: [ ] Critical  [ ] Major  [ ] Minor
- **Description**: _______________________________________
- **Steps to Reproduce**: _______________________________________
- **Expected**: _______________________________________
- **Actual**: _______________________________________

---

## ✅ Overall Assessment

### Functionality Score:
- [ ] All features working (100%)
- [ ] Most features working (80-99%)
- [ ] Some features working (50-79%)
- [ ] Major issues found (<50%)

### Performance:
- [ ] Fast (< 100ms response)
- [ ] Good (100-500ms response)
- [ ] Acceptable (500ms-1s response)
- [ ] Slow (> 1s response)

### User Experience:
- [ ] Excellent - Intuitive and smooth
- [ ] Good - Easy to understand
- [ ] Fair - Some confusion
- [ ] Poor - Difficult to use

### Design/UI:
- [ ] Professional
- [ ] Clean and functional
- [ ] Acceptable
- [ ] Needs improvement

---

## 📝 Final Notes

**What worked well**:
_______________________________________
_______________________________________
_______________________________________

**What needs improvement**:
_______________________________________
_______________________________________
_______________________________________

**Suggestions**:
_______________________________________
_______________________________________
_______________________________________

**Ready for production?**: [ ] Yes  [ ] No  [ ] With fixes

**Tested by**: _______________
**Date Completed**: _______________
**Time Completed**: _______________
**Total Testing Time**: _____ minutes

---

## 🎯 Success Criteria

- [ ] Login successful
- [ ] Admin dashboard visible
- [ ] Can approve translation
- [ ] Notification appears
- [ ] Badge shows count
- [ ] Can view notifications
- [ ] Can mark as read
- [ ] Can delete notification
- [ ] Auto-refresh works
- [ ] Mark all as read works
- [ ] Deep links work
- [ ] No console errors
- [ ] No visual glitches

**Total Passed**: _____ / 13

---

**Status**: [ ] ✅ PASS  [ ] ⚠️ PASS WITH ISSUES  [ ] ❌ FAIL
