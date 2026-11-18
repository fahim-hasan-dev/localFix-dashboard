import { ServiceCategory } from "@/types/common.types";

export const initialCategories: ServiceCategory[] = [
  {
    "id": "cat-1",
    "name": "House Cleaning",
    "slug": "house-cleaning",
    "description": "Professional regular, deep, and move-in/move-out residential home sanitization.",
    "iconName": "Brush",
    "coverImage": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    "baseStartingPrice": 89,
    "priceUnit": "fixed_estimate",
    "isActive": true,
    "isPopular": true,
    "activeProsCount": 24,
    "completedJobsCount": 1420,
    "createdAt": "2025-01-15",
    "updatedAt": "2026-10-24",
    "questions": [
      {
        "id": "q-hc-1",
        "stepNumber": 1,
        "title": "What type of cleaning do you need",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-type-1",
            "label": "Standard maintenance clean"
          },
          {
            "id": "opt-type-2",
            "label": "Deep scrub clean"
          },
          {
            "id": "opt-type-3",
            "label": "Move-in / move-out clean"
          },
          {
            "id": "opt-type-4",
            "label": "Post-renovation cleanup"
          }
        ]
      },
      {
        "id": "q-hc-2",
        "stepNumber": 2,
        "title": "How many bedrooms need cleaning",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-bed-1",
            "label": "1 Bedroom"
          },
          {
            "id": "opt-bed-2",
            "label": "2 Bedrooms"
          },
          {
            "id": "opt-bed-3",
            "label": "3 Bedrooms"
          },
          {
            "id": "opt-bed-4",
            "label": "4 Bedrooms"
          },
          {
            "id": "opt-bed-5",
            "label": "5+ Bedrooms"
          }
        ]
      },
      {
        "id": "q-hc-3",
        "stepNumber": 3,
        "title": "How many bathrooms need cleaning",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-bath-1",
            "label": "1 Bathroom"
          },
          {
            "id": "opt-bath-2",
            "label": "2 Bathrooms"
          },
          {
            "id": "opt-bath-3",
            "label": "3 Bathrooms"
          },
          {
            "id": "opt-bath-4",
            "label": "4+ Bathrooms"
          }
        ]
      },
      {
        "id": "q-hc-4",
        "stepNumber": 4,
        "title": "How often do you need cleaning",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-freq-1",
            "label": "One-time service"
          },
          {
            "id": "opt-freq-2",
            "label": "Every 2 weeks (Bi-weekly)"
          },
          {
            "id": "opt-freq-3",
            "label": "Weekly service"
          },
          {
            "id": "opt-freq-4",
            "label": "Monthly maintenance"
          }
        ]
      },
      {
        "id": "q-hc-5",
        "stepNumber": 5,
        "title": "Are there pets in the home",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-pet-1",
            "label": "No pets"
          },
          {
            "id": "opt-pet-2",
            "label": "Yes — Dog(s)"
          },
          {
            "id": "opt-pet-3",
            "label": "Yes — Cat(s)"
          },
          {
            "id": "opt-pet-4",
            "label": "Other pets"
          }
        ]
      }
    ]
  },
  {
    "id": "cat-2",
    "name": "Plumbing Services",
    "slug": "plumbing",
    "description": "Licensed master plumbers for leaks, clogged drains, water heaters, and pipe repairs.",
    "iconName": "Wrench",
    "coverImage": "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80",
    "baseStartingPrice": 95,
    "priceUnit": "hourly",
    "isActive": true,
    "isPopular": true,
    "activeProsCount": 32,
    "completedJobsCount": 2840,
    "createdAt": "2025-01-10",
    "updatedAt": "2026-10-22",
    "questions": [
      {
        "id": "q-pl-1",
        "stepNumber": 1,
        "title": "What kind of plumbing issue is this",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-p1",
            "label": "Active pipe leak or burst"
          },
          {
            "id": "opt-p2",
            "label": "Clogged drain or toilet"
          },
          {
            "id": "opt-p3",
            "label": "Water heater repair / replace"
          },
          {
            "id": "opt-p4",
            "label": "Faucet / fixture installation"
          },
          {
            "id": "opt-p5",
            "label": "Garbage disposal problem"
          }
        ]
      },
      {
        "id": "q-pl-2",
        "stepNumber": 2,
        "title": "Where is the problem located",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-p2-1",
            "label": "Kitchen"
          },
          {
            "id": "opt-p2-2",
            "label": "Master bathroom"
          },
          {
            "id": "opt-p2-3",
            "label": "Guest / half bathroom"
          },
          {
            "id": "opt-p2-4",
            "label": "Water heater closet / garage"
          },
          {
            "id": "opt-p2-5",
            "label": "Main yard water line"
          }
        ]
      },
      {
        "id": "q-pl-3",
        "stepNumber": 3,
        "title": "Is water currently shut off",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-em-1",
            "label": "Yes, main water shut off"
          },
          {
            "id": "opt-em-2",
            "label": "No, slow isolated drip"
          },
          {
            "id": "opt-em-3",
            "label": "Not sure where shutoff is"
          }
        ]
      },
      {
        "id": "q-pl-4",
        "stepNumber": 4,
        "title": "Are hardware & parts on-site",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-pl-mat-1",
            "label": "I have all items ready"
          },
          {
            "id": "opt-pl-mat-2",
            "label": "Pro should supply anchors/parts"
          },
          {
            "id": "opt-pl-mat-3",
            "label": "Not sure / pro advise"
          }
        ]
      }
    ]
  },
  {
    "id": "cat-3",
    "name": "Electrical Services",
    "slug": "electrical",
    "description": "Licensed master electricians for panel upgrades, EV chargers, lighting, and wiring.",
    "iconName": "Zap",
    "coverImage": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    "baseStartingPrice": 110,
    "priceUnit": "hourly",
    "isActive": true,
    "isPopular": true,
    "activeProsCount": 19,
    "completedJobsCount": 1890,
    "createdAt": "2025-02-01",
    "updatedAt": "2026-10-20",
    "questions": [
      {
        "id": "q-el-1",
        "stepNumber": 1,
        "title": "What kind of electrical work is needed",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-el-1",
            "label": "Outlet, switch or GFCI fix"
          },
          {
            "id": "opt-el-2",
            "label": "Ceiling fan or light fixture"
          },
          {
            "id": "opt-el-3",
            "label": "Circuit breaker or panel upgrade"
          },
          {
            "id": "opt-el-4",
            "label": "EV charger installation"
          },
          {
            "id": "opt-el-5",
            "label": "Partial or full house rewiring"
          }
        ]
      },
      {
        "id": "q-el-2",
        "stepNumber": 2,
        "title": "Property structure & wiring age",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-pr-1",
            "label": "Single family house (Built after 2000)"
          },
          {
            "id": "opt-pr-2",
            "label": "Older home (Pre-2000 wiring)"
          },
          {
            "id": "opt-pr-3",
            "label": "Condominium / Townhome"
          },
          {
            "id": "opt-pr-4",
            "label": "Commercial office"
          }
        ]
      },
      {
        "id": "q-el-3",
        "stepNumber": 3,
        "title": "Is power currently out or sparking",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-tr-1",
            "label": "Yes — active outage / emergency"
          },
          {
            "id": "opt-tr-2",
            "label": "Breakers trip periodically"
          },
          {
            "id": "opt-tr-3",
            "label": "No — standard install / upgrade"
          }
        ]
      },
      {
        "id": "q-el-4",
        "stepNumber": 4,
        "title": "Are hardware & parts on-site",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-el-mat-1",
            "label": "I have all items ready"
          },
          {
            "id": "opt-el-mat-2",
            "label": "Pro should supply anchors/parts"
          },
          {
            "id": "opt-el-mat-3",
            "label": "Not sure / pro advise"
          }
        ]
      }
    ]
  },
  {
    "id": "cat-4",
    "name": "HVAC & Climate Control",
    "slug": "hvac",
    "description": "Certified AC repair, furnace maintenance, heat pump installations, and air quality duct cleaning.",
    "iconName": "Thermometer",
    "coverImage": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    "baseStartingPrice": 85,
    "priceUnit": "hourly",
    "isActive": true,
    "isPopular": true,
    "activeProsCount": 16,
    "completedJobsCount": 2110,
    "createdAt": "2025-02-14",
    "updatedAt": "2026-10-18",
    "questions": [
      {
        "id": "q-hv-1",
        "stepNumber": 1,
        "title": "What type of heating / cooling system do you have",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-hv-1",
            "label": "Central AC & gas furnace"
          },
          {
            "id": "opt-hv-2",
            "label": "Electric heat pump"
          },
          {
            "id": "opt-hv-3",
            "label": "Ductless mini-split"
          },
          {
            "id": "opt-hv-4",
            "label": "Package rooftop unit"
          }
        ]
      },
      {
        "id": "q-hv-2",
        "stepNumber": 2,
        "title": "What is the primary issue",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-hv-is-1",
            "label": "Unit running but not cooling/heating"
          },
          {
            "id": "opt-hv-is-2",
            "label": "System won't turn on"
          },
          {
            "id": "opt-hv-is-3",
            "label": "Strange noise or water leaking"
          },
          {
            "id": "opt-hv-is-4",
            "label": "Seasonal tune-up / maintenance"
          }
        ]
      },
      {
        "id": "q-hv-3",
        "stepNumber": 3,
        "title": "Is the system producing any airflow",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-hv-af-1",
            "label": "Blowing warm air"
          },
          {
            "id": "opt-hv-af-2",
            "label": "Weak / low airflow"
          },
          {
            "id": "opt-hv-af-3",
            "label": "No airflow at all"
          },
          {
            "id": "opt-hv-af-4",
            "label": "Normal airflow but loud noise"
          }
        ]
      },
      {
        "id": "q-hv-4",
        "stepNumber": 4,
        "title": "Approximate square footage of home",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-hv-sq-1",
            "label": "Under 1,500 sq ft"
          },
          {
            "id": "opt-hv-sq-2",
            "label": "1,500 – 2,500 sq ft"
          },
          {
            "id": "opt-hv-sq-3",
            "label": "2,500 – 3,500 sq ft"
          },
          {
            "id": "opt-hv-sq-4",
            "label": "3,500+ sq ft"
          }
        ]
      }
    ]
  },
  {
    "id": "cat-5",
    "name": "Roofing & Gutters",
    "slug": "roofing",
    "description": "Insured roofers for storm damage, shingle replacement, flashing leaks, and seamless gutter guards.",
    "iconName": "Home",
    "coverImage": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    "baseStartingPrice": 150,
    "priceUnit": "custom_quote",
    "isActive": true,
    "isPopular": true,
    "activeProsCount": 14,
    "completedJobsCount": 940,
    "createdAt": "2025-03-01",
    "updatedAt": "2026-10-21",
    "questions": [
      {
        "id": "q-rf-1",
        "stepNumber": 1,
        "title": "What kind of roofing service do you need",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-rf-1",
            "label": "Active roof leak repair"
          },
          {
            "id": "opt-rf-2",
            "label": "Missing / damaged shingles"
          },
          {
            "id": "opt-rf-3",
            "label": "Full roof replacement estimate"
          },
          {
            "id": "opt-rf-4",
            "label": "Gutter cleaning & repair"
          },
          {
            "id": "opt-rf-5",
            "label": "Hail / storm inspection"
          }
        ]
      },
      {
        "id": "q-rf-2",
        "stepNumber": 2,
        "title": "What is your roofing material",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-mat-1",
            "label": "Asphalt architectural shingles"
          },
          {
            "id": "opt-mat-2",
            "label": "Metal standing seam"
          },
          {
            "id": "opt-mat-3",
            "label": "Clay / concrete tile"
          },
          {
            "id": "opt-mat-4",
            "label": "Flat / TPO membrane"
          }
        ]
      },
      {
        "id": "q-rf-3",
        "stepNumber": 3,
        "title": "How many stories is the building",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-rf-st-1",
            "label": "1 Story"
          },
          {
            "id": "opt-rf-st-2",
            "label": "2 Stories"
          },
          {
            "id": "opt-rf-st-3",
            "label": "3+ Stories / Steep pitch"
          }
        ]
      },
      {
        "id": "q-rf-4",
        "stepNumber": 4,
        "title": "Approximate age of the roof",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-rf-ag-1",
            "label": "Under 10 years"
          },
          {
            "id": "opt-rf-ag-2",
            "label": "10 – 20 years"
          },
          {
            "id": "opt-rf-ag-3",
            "label": "20+ years"
          },
          {
            "id": "opt-rf-ag-4",
            "label": "Not sure / Just bought home"
          }
        ]
      }
    ]
  },
  {
    "id": "cat-6",
    "name": "Handyman Services",
    "slug": "handyman",
    "description": "Skilled multi-trade professionals for furniture assembly, TV wall mounting, drywall patching, and repairs.",
    "iconName": "Hammer",
    "coverImage": "https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=800&q=80",
    "baseStartingPrice": 65,
    "priceUnit": "hourly",
    "isActive": true,
    "isPopular": true,
    "activeProsCount": 28,
    "completedJobsCount": 3120,
    "createdAt": "2025-01-20",
    "updatedAt": "2026-10-19",
    "questions": [
      {
        "id": "q-hm-1",
        "stepNumber": 1,
        "title": "What kind of handyman task is this",
        "type": "multiple_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-t1",
            "label": "Mount TV or art"
          },
          {
            "id": "opt-t2",
            "label": "Drywall, door or fixture repair"
          },
          {
            "id": "opt-t3",
            "label": "Furniture assembly"
          },
          {
            "id": "opt-t4",
            "label": "Punch-list / multiple items"
          }
        ]
      },
      {
        "id": "q-hm-2",
        "stepNumber": 2,
        "title": "Estimated time required",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-dur-1",
            "label": "Under 2 hours"
          },
          {
            "id": "opt-dur-2",
            "label": "Half day (2–4 hours)"
          },
          {
            "id": "opt-dur-3",
            "label": "Full day (5+ hours)"
          }
        ]
      },
      {
        "id": "q-hm-3",
        "stepNumber": 3,
        "title": "Are hardware & parts on-site",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-hm-p1",
            "label": "I have all items ready"
          },
          {
            "id": "opt-hm-p2",
            "label": "Pro should supply anchors/parts"
          },
          {
            "id": "opt-hm-p3",
            "label": "Not sure / pro advise"
          }
        ]
      }
    ]
  },
  {
    "id": "cat-7",
    "name": "Appliance Repair",
    "slug": "appliance-repair",
    "description": "Factory-certified appliance technicians for refrigerators, washers, dryers, and dishwashers.",
    "iconName": "Cpu",
    "coverImage": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    "baseStartingPrice": 75,
    "priceUnit": "fixed_estimate",
    "isActive": true,
    "isPopular": false,
    "activeProsCount": 15,
    "completedJobsCount": 1240,
    "createdAt": "2025-03-12",
    "updatedAt": "2026-10-15",
    "questions": [
      {
        "id": "q-ap-1",
        "stepNumber": 1,
        "title": "Which appliance needs service",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-ap-1",
            "label": "Refrigerator / Freezer"
          },
          {
            "id": "opt-ap-2",
            "label": "Washing machine"
          },
          {
            "id": "opt-ap-3",
            "label": "Clothes dryer"
          },
          {
            "id": "opt-ap-4",
            "label": "Dishwasher"
          },
          {
            "id": "opt-ap-5",
            "label": "Oven / Range / Cooktop"
          }
        ]
      },
      {
        "id": "q-ap-2",
        "stepNumber": 2,
        "title": "What is the brand of the appliance",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-br-1",
            "label": "Samsung"
          },
          {
            "id": "opt-br-2",
            "label": "LG"
          },
          {
            "id": "opt-br-3",
            "label": "Whirlpool / Maytag"
          },
          {
            "id": "opt-br-4",
            "label": "GE / Profile"
          },
          {
            "id": "opt-br-5",
            "label": "Bosch / KitchenAid"
          },
          {
            "id": "opt-br-6",
            "label": "Other brand"
          }
        ]
      },
      {
        "id": "q-ap-3",
        "stepNumber": 3,
        "title": "What primary symptom is occurring",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-ap-sy-1",
            "label": "Won't turn on or start"
          },
          {
            "id": "opt-ap-sy-2",
            "label": "Actively leaking water"
          },
          {
            "id": "opt-ap-sy-3",
            "label": "Loud grinding / screeching noise"
          },
          {
            "id": "opt-ap-sy-4",
            "label": "Not cooling or not heating"
          },
          {
            "id": "opt-ap-sy-5",
            "label": "Error code flashing on panel"
          }
        ]
      }
    ]
  },
  {
    "id": "cat-8",
    "name": "Painting & Drywall",
    "slug": "painting",
    "description": "Interior room painting, exterior siding coatings, cabinet refinishing, and ceiling repairs.",
    "iconName": "Paintbrush",
    "coverImage": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80",
    "baseStartingPrice": 199,
    "priceUnit": "per_sqft",
    "isActive": true,
    "isPopular": false,
    "activeProsCount": 21,
    "completedJobsCount": 1780,
    "createdAt": "2025-02-28",
    "updatedAt": "2026-10-17",
    "questions": [
      {
        "id": "q-pt-1",
        "stepNumber": 1,
        "title": "What area requires painting",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-pt-1",
            "label": "Interior walls & ceilings"
          },
          {
            "id": "opt-pt-2",
            "label": "Whole home exterior"
          },
          {
            "id": "opt-pt-3",
            "label": "Kitchen cabinets spray refinish"
          },
          {
            "id": "opt-pt-4",
            "label": "Deck or fence staining"
          }
        ]
      },
      {
        "id": "q-pt-2",
        "stepNumber": 2,
        "title": "How many rooms need painting",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-rm-1",
            "label": "1 Room"
          },
          {
            "id": "opt-rm-2",
            "label": "2 – 3 Rooms"
          },
          {
            "id": "opt-rm-3",
            "label": "4 – 5 Rooms"
          },
          {
            "id": "opt-rm-4",
            "label": "Whole house (6+ rooms)"
          }
        ]
      },
      {
        "id": "q-pt-3",
        "stepNumber": 3,
        "title": "What surface preparation is needed",
        "type": "multiple_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-pt-ex-1",
            "label": "Heavy furniture moving & masking"
          },
          {
            "id": "opt-pt-ex-2",
            "label": "Drywall hole patching & texturing"
          },
          {
            "id": "opt-pt-ex-3",
            "label": "Baseboard, door and trim painting"
          },
          {
            "id": "opt-pt-ex-4",
            "label": "Ceiling painting"
          },
          {
            "id": "opt-pt-ex-5",
            "label": "Wallpaper removal prior to paint"
          }
        ]
      },
      {
        "id": "q-pt-4",
        "stepNumber": 4,
        "title": "Are paint and supplies on-site",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-pt-sup-1",
            "label": "I have all items ready"
          },
          {
            "id": "opt-pt-sup-2",
            "label": "Pro should supply anchors/parts"
          },
          {
            "id": "opt-pt-sup-3",
            "label": "Not sure / pro advise"
          }
        ]
      }
    ]
  },
  {
    "id": "cat-9",
    "name": "Lawn & Landscaping",
    "slug": "landscaping",
    "description": "Weekly lawn mowing, hedge trimming, tree pruning, mulching, and irrigation sprinkler care.",
    "iconName": "Scissors",
    "coverImage": "https://images.unsplash.com/photo-1558904541-efa8c4a08931?auto=format&fit=crop&w=800&q=80",
    "baseStartingPrice": 45,
    "priceUnit": "fixed_estimate",
    "isActive": true,
    "isPopular": false,
    "activeProsCount": 22,
    "completedJobsCount": 2650,
    "createdAt": "2025-01-28",
    "updatedAt": "2026-10-23",
    "questions": [
      {
        "id": "q-ls-1",
        "stepNumber": 1,
        "title": "What landscaping service do you need",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-ls-1",
            "label": "Regular lawn mowing & edging"
          },
          {
            "id": "opt-ls-2",
            "label": "Yard cleanup & weed removal"
          },
          {
            "id": "opt-ls-3",
            "label": "Hedge & bush trimming"
          },
          {
            "id": "opt-ls-4",
            "label": "Tree branch pruning"
          },
          {
            "id": "opt-ls-5",
            "label": "Sprinkler repair / tuneup"
          }
        ]
      },
      {
        "id": "q-ls-2",
        "stepNumber": 2,
        "title": "Approximate yard / lot size",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-sz-1",
            "label": "Small (Under 3,000 sq ft)"
          },
          {
            "id": "opt-sz-2",
            "label": "Medium (3,000 – 8,000 sq ft)"
          },
          {
            "id": "opt-sz-3",
            "label": "Large (Quarter to half acre)"
          },
          {
            "id": "opt-sz-4",
            "label": "Acreage (1+ Acre)"
          }
        ]
      },
      {
        "id": "q-ls-3",
        "stepNumber": 3,
        "title": "How frequently do you require service",
        "type": "single_choice",
        "isRequired": false,
        "options": [
          {
            "id": "opt-ls-fr-1",
            "label": "One-time cleanup"
          },
          {
            "id": "opt-ls-fr-2",
            "label": "Weekly regular maintenance"
          },
          {
            "id": "opt-ls-fr-3",
            "label": "Bi-weekly (Every 2 weeks)"
          },
          {
            "id": "opt-ls-fr-4",
            "label": "Monthly refresh"
          }
        ]
      }
    ]
  }
];
