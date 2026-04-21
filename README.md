 # ReflectScan India  
### Smart Retroreflectivity Inspection & Highway Visibility Intelligence Platform  

 **Submission for the 6th NHAI Innovation Hackathon 2026**  
 **Team BrainBytes · JECRC Jaipur · Rajasthan · April 2026**

---

##  What is ReflectScan India?

ReflectScan India is an **AI-powered highway inspection platform** designed to automate the **measurement, monitoring, and management of retroreflective road safety infrastructure** across India’s National Highway network.

It replaces slow and risky manual inspections with a **smart vehicle/drone mounted system** powered by:

-  Computer Vision  
-  AI / ML Analytics  
-  GPS & GIS Mapping  
-  Mobile Survey Application  
-  Real-Time Monitoring Dashboard  

ReflectScan India enables highway authorities to inspect road assets rapidly at highway speeds under:

✅ Day  
✅ Night  
✅ Dry Roads  
✅ Wet Roads  
✅ Foggy Conditions  

---

#  Problem Statement

India’s National Highways contain millions of critical road safety assets such as:

- Traffic Sign Boards  
- Lane Markings  
- Pavement Markings  
- Road Studs (RPMs)  
- Delineators  
- Gantry Signs  
- Expressway Guidance Systems  

These assets gradually lose retroreflectivity due to:

- Dust & Pollution  
- Rain & Moisture  
- UV Sun Exposure  
- Tire Abrasion  
- Surface Damage  
- Aging Reflective Materials  

---

##  Current Challenges

Retroreflectivity measurement is still performed using handheld devices, which are:

-  Time-consuming  
-  Unsafe on high-speed highways  
-  Manpower intensive  
-  Expensive for large-scale deployment  
-  Infrequent during O&M stages  
-  Ineffective in wet/fog/night environments  
-  Not connected to any live monitoring system  

---

#  ReflectScan India Solution

ReflectScan India introduces a **3-Layer Intelligent Highway Inspection Ecosystem**

| Layer | Description |
|------|-------------|
|  Vehicle Mounted Survey Unit (VMSU) | Camera + sensor rig mounted on patrol vehicles scans road assets while moving |
|  AI Inference Engine | Detects signs, lane markings, studs and predicts reflectivity score (RL/RA) |
|  Smart Management Dashboard | GIS maps, alerts, maintenance reports, predictive analytics |

---

#  Key Features

##  Vehicle Mounted Rapid Inspection

Survey highways without stopping traffic.

Supports:

-  Day Mode  
-  Night Mode  
-  Wet Surface  
-  Foggy Conditions  
-  With / Without Streetlights  

---

##  Drone Inspection Support

Used for:

- Gantry Signs  
- Elevated Corridors  
- Bridges  
- Difficult Access Areas  

---

##  AI Detection Engine

Automatically detects:

- Faded Traffic Signs  
- Dirty / Damaged Boards  
- Worn Lane Markings  
- Missing Road Studs  
- Poor Visibility Zones  

---

##  Smart Dashboard

Provides:

- Highway-wise Safety Score  
- GIS Heatmaps  
- Real-Time Alerts  
- Auto Work Orders  
- Maintenance Priority Reports  

---

#  Live Demo

 **Prototype:**  
https://reflectscan-india-ntq1.bolt.host

---

#  Pages Included

| Route | Description |
|------|-------------|
| `/` | Home dashboard with metrics |
| `/dashboard` | Highway analytics and reports |
| `/scanner` | Live AI inspection camera page |
| `/map` | GIS highway heatmap |
| `/alerts` | Failed reflectivity alerts |
| `/reports` | Download inspection reports |
| `/fleet` | Survey vehicle status |
| `/settings` | Threshold configuration |

---

#  Highways Covered in Prototype

- NH-48  
- NH-44  
- NH-27  
- Delhi-Mumbai Expressway  
- Jaipur Ring Corridor  
- Smart Sample Routes  

---

#  Technology Stack

## Frontend

- React.js  
- Tailwind CSS  
- Flutter (Mobile App)

##  Backend

- FastAPI / Node.js

##  AI / ML

- Python  
- OpenCV  
- YOLOv8  
- TensorFlow  

##  Database

- PostgreSQL + PostGIS

##  Hosting

- Bolt / Vercel / AWS

---

 # 🔄 How It Works

```text
Vehicle / Drone Camera Feed
        ↓
Image + Sensor Data Capture
        ↓
AI detects road assets
        ↓
Reflectivity Score Generated
        ↓
GPS Tagged Upload
        ↓
Dashboard + Alerts + Reports
```


 Team
BrainBytes

JECRC Jaipur, Rajasthan

Built For
6th NHAI Innovation Hackathon 2026
Problem Statement:

Retroreflectivity Measurement of Road Signs, Pavement Markings, Road Studs & Delineators

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-gv51rv6p)
