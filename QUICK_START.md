# Quick Start Guide - New Features

## 🚀 Getting Started

### 1. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The backend runs on `http://localhost:3000` and frontend on `http://localhost:3001`

## 📋 Feature Walkthroughs

### Feature 1: Creating a Location with Limit and Viewers

1. Navigate to **المواقع** (Locations) in the sidebar
2. Click **إضافة موقع جديد** (Add New Location)
3. Fill in the form:
   - **اسم الموقع** (Name): e.g., "محطة وسط المدينة"
   - **الوصف** (Description): Optional description
   - **الحد الأقصى للحجوزات المتزامنة** (Max Concurrent Reservations): e.g., 10
   - **عدد المشاهدين الشهري** (Monthly Viewers): e.g., 50000
   - **نشط** (Active): Toggle on/off
4. Click **حفظ** (Save)

### Feature 2: Testing the Reservation Limit

1. Create a location with **Limit = 2**
2. Create first reservation:
   - Go to calendar or list page
   - Click to create reservation
   - Select your location
   - Choose any date/time range
   - Save → Should succeed ✅
3. Create second reservation with **overlapping time**:
   - Same location
   - Overlapping time period
   - Save → Should succeed ✅
4. Try to create third reservation with **overlapping time**:
   - Same location
   - Overlapping time period
   - Save → Should show error toast ❌
   - Error message: "⚠️ الموقع ممتلئ! Location has reached its maximum limit of 2 concurrent reservations"

### Feature 3: Using the Cost Calculator

1. Navigate to **حاسبة التكلفة** (Cost Calculator) in the sidebar
2. In the **معلمات الحساب** (Parameters) section:
   - Enter **التكلفة الإجمالية** (Total Cost): e.g., 10000
   - Select **تاريخ البداية** (Start Date): e.g., today
   - Select **تاريخ النهاية** (End Date): e.g., 10 days from now
3. In the **اختيار المواقع** (Select Locations) section:
   - Check 2-3 locations you want to compare
   - You'll see monthly viewers for each
4. Click **احسب التكلفة** (Calculate Cost)
5. View results:
   - **إجمالي المشاهدات** (Total Viewers)
   - **تكلفة المشاهدة الواحدة** (Cost Per View)
   - Breakdown for each location
6. Click **احصل على أفضل خطة** (Get Best Plan)
7. View recommended locations sorted by efficiency

### Feature 4: Viewing Location Capacity in Analytics

1. Navigate to **التحليلات** (Analytics) in the sidebar
2. Scroll down to **حالة سعة المواقع** (Location Capacity Status) section
3. You'll see three categories:
   - **🔴 مواقع ممتلئة** (Full Locations) - 100% capacity
   - **🟡 قرب الامتلاء** (Nearly Full) - ≥80% capacity
   - **🟢 مواقع متاحة** (Available Locations) - <80% capacity
4. Each location shows:
   - Current active reservations
   - Maximum limit
   - Remaining capacity
   - Visual progress bar

## 🧪 Test Scenarios

### Scenario 1: Full Location Test
```
Goal: Verify location limit works correctly

Steps:
1. Create location "Test Station" with limit = 3
2. Create reservation #1: 10:00 - 12:00 → Success ✅
3. Create reservation #2: 11:00 - 13:00 → Success ✅
4. Create reservation #3: 11:30 - 14:00 → Success ✅
5. Create reservation #4: 11:45 - 15:00 → Error ❌
   Expected: "Location has reached its maximum limit of 3"

Verify in Analytics:
- Go to Analytics → Location Capacity Status
- "Test Station" should appear in "Full Locations" (red section)
- Should show "3 / 3" active reservations
```

### Scenario 2: Cost Calculator Test
```
Goal: Calculate cost per view for multiple locations

Setup:
- Location A: 30,000 monthly viewers
- Location B: 20,000 monthly viewers
- Location C: 10,000 monthly viewers
- Total Cost: 12,000
- Date Range: 10 days

Steps:
1. Select all 3 locations
2. Enter cost: 12000
3. Select date range: 10 days
4. Click "Calculate Cost"

Expected Results:
- Location A: ~10,000 viewers (30k/30 * 10)
- Location B: ~6,666 viewers (20k/30 * 10)
- Location C: ~3,333 viewers (10k/30 * 10)
- Total: ~20,000 viewers
- Cost per view: 12,000 / 20,000 = 0.60

5. Click "Get Best Plan"

Expected:
- Location A should be #1 (highest viewers)
- Location B should be #2
- Location C should be #3
```

### Scenario 3: Analytics Capacity View Test
```
Goal: Monitor location capacity in real-time

Setup:
- Location 1: Limit 5, Active reservations: 5 → 100% full
- Location 2: Limit 10, Active reservations: 8 → 80% nearly full
- Location 3: Limit 20, Active reservations: 5 → 25% available

Steps:
1. Create the 3 locations with specified limits
2. Create reservations to match the setup
3. Navigate to Analytics page
4. Scroll to "Location Capacity Status"

Expected Display:
- Location 1 in RED "Full Locations" section
- Location 2 in YELLOW "Nearly Full" section
- Location 3 in GREEN "Available Locations" section
```

## 🎯 Key Points to Remember

### Reservation Limits
- ✅ Multiple reservations **CAN** overlap on same location
- ❌ Total overlapping reservations **CANNOT** exceed location limit
- ⏰ Only counts WAITING, ACTIVE, and ENDING_SOON reservations
- ✅ COMPLETED reservations don't count toward limit

### Viewer Calculations
- **Monthly Viewers** = Base value you set per location
- **Weekly Viewers** = Monthly / 4.33
- **Daily Viewers** = Monthly / 30
- **Date Range Viewers** = Daily × Number of Days

### Cost Calculator
- Uses viewers from selected date range
- Shows both selected locations AND best plan recommendations
- Best plan analyzes ALL locations (not just selected)
- Efficiency = Total viewers (higher is better)

## 🔍 API Testing (Optional)

You can test the APIs directly using the Swagger documentation:

1. Open browser: `http://localhost:3000/api-docs`
2. Find **Viewer Statistics** section
3. Click "Authorize" and enter your JWT token
4. Try these endpoints:
   - `GET /api/v1/viewer-statistics/all` - Get all locations viewers
   - `POST /api/v1/viewer-statistics/cost-per-view` - Calculate costs
   - `POST /api/v1/viewer-statistics/best-plan` - Get recommendations

## 📱 Mobile/Responsive Testing

All new pages are fully responsive:
- Cost Calculator works on mobile devices
- Analytics capacity view adapts to small screens
- Location forms are mobile-friendly

## ⚠️ Common Issues

### Issue: "Location not found" error
**Solution:** Make sure location exists and is active

### Issue: Can't see viewers in Cost Calculator
**Solution:** Ensure locations have `monthlyViewers` > 0

### Issue: Best plan shows no recommendations
**Solution:** Make sure you have active locations with viewers set

### Issue: Limit validation not working
**Solution:** Check that reservations have overlapping time periods

## 📚 Next Steps

1. ✅ Create some test locations with different limits and viewers
2. ✅ Test the reservation limit by creating overlapping reservations
3. ✅ Use the Cost Calculator to compare locations
4. ✅ Monitor capacity in the Analytics page
5. ✅ Adjust limits and viewers based on your business needs

## 💡 Tips

- Set realistic viewer numbers based on actual location traffic
- Use the Cost Calculator before creating campaigns
- Monitor the Analytics page regularly to see which locations are filling up
- Adjust limits based on capacity trends

---

**Happy Testing! 🎉**

For detailed technical information, see [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
