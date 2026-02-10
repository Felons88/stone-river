# Privacy & Location Setup Guide

## Current Setup: St. Cloud, MN (Privacy Protected)

### ✅ What's Configured

**Business Location:**
- **Public Address:** "St. Cloud, MN 56301" (general area only)
- **No exact address shown** - protects your apartment privacy
- **Service Area Business** - customers know you serve the area, not a fixed storefront

**Service Coverage:**
- St. Cloud (56301, 56303, 56304)
- Waite Park (56302, 56395)
- Sartell (56377)
- Sauk Rapids (56387)
- St. Joseph (56379)
- St. Augusta (56374)
- **Service Radius:** 25 miles from St. Cloud

**Business Hours:**
- Monday-Friday: 8:00 AM - 6:00 PM
- Saturday: 9:00 AM - 4:00 PM
- Sunday: Closed

---

## 🔒 Privacy Protection Strategy

### Current Approach (Operating from Apartment):
1. ✅ Only show "St. Cloud, MN" as location
2. ✅ No street address displayed publicly
3. ✅ Service area business model (you go to customers)
4. ✅ Contact via phone/email only
5. ✅ Bookings show service address, not your address

### What Customers See:
- Business name: StoneRiver Junk Removal
- Location: St. Cloud, MN
- Service area: St. Cloud and surrounding cities
- Contact: Phone and email
- **They never see your apartment address**

---

## 🚀 Future: Google Business Profile Setup

### When You're Ready (Recommended Options):

**Option 1: PO Box (Cheapest)**
- Cost: ~$50-100/year
- Get a PO Box in St. Cloud
- Use for Google Business Profile
- Shows as "St. Cloud, MN" location

**Option 2: Virtual Office/Mailbox**
- Cost: ~$50-150/month
- Companies like Regus, Davinci Virtual
- Get a St. Cloud business address
- Can use for Google Business Profile
- Some include mail forwarding

**Option 3: UPS Store Mailbox**
- Cost: ~$20-40/month
- Get a street address (not PO Box)
- Better for Google Business Profile
- Looks more professional

### Setting Up Google Business Profile:

1. **Choose an address option above**
2. **Create Google Business Profile:**
   - Go to https://business.google.com
   - Add business name: "StoneRiver Junk Removal"
   - Category: "Waste Management Service" or "Junk Removal Service"
   - **Important:** Select "I deliver goods and services to my customers"
   - Add your chosen address (PO Box/Virtual Office)
   - Set service area: St. Cloud + surrounding cities
   - Add phone: (612) 685-4696
   - Add website: stoneriverjunk.com

3. **Verification:**
   - Google will mail a postcard to your address
   - Enter verification code
   - Profile goes live

4. **Update Your System:**
   - Get your Google Place ID from Business Profile
   - Add to Admin Panel → Settings → API Keys
   - Add Google Places API key
   - Reviews will sync automatically

---

## 📍 Current Website Display

### Homepage/Footer Shows:
```
StoneRiver Junk Removal
Serving St. Cloud, MN and surrounding areas
(612) 685-4696
noreply@stoneriverjunk.com
```

### Booking Form:
- Customers enter THEIR address (where you'll pick up junk)
- Your address is never shown or requested

### Invoices:
- Show customer's service address
- Show your business name and contact info
- No physical address required

---

## 🛡️ Privacy Best Practices

### Do's:
✅ Use "St. Cloud, MN" as general location
✅ Emphasize "service area business"
✅ Meet customers at their location
✅ Use phone/email for all communication
✅ Get PO Box or virtual office when ready
✅ Keep apartment address completely private

### Don'ts:
❌ Never list apartment address publicly
❌ Don't use apartment for Google Business
❌ Don't show exact location on website
❌ Don't meet customers at your apartment
❌ Don't use apartment in marketing materials

---

## 📊 Service Area ZIP Codes

Currently configured to serve:
- 56301, 56303, 56304 - St. Cloud
- 56302, 56395 - Waite Park
- 56377 - Sartell
- 56387 - Sauk Rapids
- 56379 - St. Joseph
- 56374 - St. Augusta

**To add more ZIP codes:**
1. Go to Admin Panel → Settings → Business Info
2. Edit service_area_zipcodes
3. Add new ZIP codes to the list
4. Save

---

## 🔧 Technical Implementation

### Database Configuration:
All settings stored in `business_config` table:
- `business_address`: "St. Cloud, MN 56301"
- `show_exact_address`: false
- `is_service_area_business`: true
- `service_area_zipcodes`: [array of ZIPs]
- `service_radius_miles`: 25

### Frontend Display:
- Website shows general location only
- Booking form collects customer address
- No map showing your location
- Contact info displayed prominently

### Google Reviews:
- Currently links to Google search
- Will link to Business Profile once set up
- Reviews sync automatically with API key

---

## 💡 Tips for Growth

### While Operating from Apartment:
1. **Professional Image:**
   - Use business phone number (you have this)
   - Use business email (you have this)
   - Get business cards with PO Box
   - Create professional invoices (you have this)

2. **Marketing:**
   - Focus on "serving St. Cloud area"
   - Emphasize convenience (you come to them)
   - Highlight eco-friendly disposal
   - Show before/after photos (not locations)

3. **Scaling Up:**
   - When revenue grows, get virtual office
   - Set up Google Business Profile
   - Get business insurance
   - Consider LLC formation
   - Eventually: storage unit or small warehouse

### Current Advantages:
- ✅ Low overhead (no rent)
- ✅ Flexible operations
- ✅ Privacy protected
- ✅ Professional appearance
- ✅ Can scale gradually

---

## 📝 Next Steps

### Immediate (Free):
- [x] Business location set to St. Cloud
- [x] Service area configured
- [x] Privacy settings enabled
- [ ] Test booking flow
- [ ] Verify no address leaks on website

### Short Term ($50-100):
- [ ] Get PO Box in St. Cloud
- [ ] Order business cards
- [ ] Update marketing materials

### Medium Term ($100-200):
- [ ] Set up Google Business Profile
- [ ] Get Google Places API key
- [ ] Enable review sync
- [ ] Get business insurance

### Long Term (When Profitable):
- [ ] Consider virtual office
- [ ] Form LLC
- [ ] Get dedicated workspace
- [ ] Hire help

---

**Last Updated:** February 5, 2026  
**Status:** Privacy protected, operating from apartment safely  
**Location:** St. Cloud, MN (general area)
