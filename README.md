# 📊 Student Performance Dashboard

A modern, interactive web-based dashboard for analyzing and visualizing student performance across multiple subjects and weeks. Built with a focus on real-time insights, clean UI, and practical analytics.

---

## 🚀 Features

### 📈 Data Visualization

* Multi-line charts for subject-wise weekly performance
* Individual student performance graphs
* Comparative analytics across subjects
* Trend analysis (improving / declining / stable)

### 👨‍🎓 Student Analytics

* Overall average score
* Best and weakest subject detection
* Subject-wise breakdown
* Smart performance insights & suggestions

### 📂 File Upload Support

* Upload **CSV** or **Excel (.xlsx)** files
* Flexible column detection (supports varied formats)
* Automatic data normalization
* Validation with error & warning reporting

### 📥 Export Functionality

* Download:

  * Full dataset report (Excel & CSV)
  * Individual student reports
  * Sample template files
* Multi-sheet Excel reports:

  * Performance Data
  * Analytics Summary
  * Class Summary

### 🧠 Smart Insights Engine

* Automatically generates:

  * Performance feedback
  * Improvement suggestions
  * Subject-specific analysis

### 🎨 UI/UX

* Clean and modern dashboard design
* Responsive layout
* Interactive charts
* Smooth transitions

---

## 🏗️ Tech Stack

* **Frontend:** React (Vite)
* **Styling:** Tailwind CSS
* **Charts:** Recharts
* **File Parsing:**

  * PapaParse (CSV)
  * SheetJS (XLSX)
* **Data Export:** SheetJS (xlsx)

---

## 📁 Supported Data Format

### ✅ Recommended Format (Flat Structure)

| Student Name | Roll No | Subject | Week 1 | Week 2 | Week 3 | Week 4 |
| ------------ | ------- | ------- | ------ | ------ | ------ | ------ |
| John Doe     | 101     | Okta    | 80     | 85     | 78     | 90     |
| John Doe     | 101     | Cloud   | 70     | 75     | 72     | 80     |

* Each row represents **one subject per student**
* 4 rows per student (one per subject)

### ⚠️ Rules

* Marks must be between **0–100**
* Subjects supported:

  * Okta
  * SailPoint
  * Cyber Security Foundations
  * Cloud

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/student-performance-dashboard.git

# Navigate into the project
cd student-performance-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🧪 Usage

1. Upload your dataset (CSV or Excel)
2. View:

   * Dashboard analytics
   * Student-wise performance
3. Click on any student for detailed insights
4. Export reports as needed

---

## 📊 Dashboard Modules

* **Overview Dashboard**

  * Class performance trends
  * Subject averages
* **Student Table**

  * Search & filter
* **Individual Analysis**

  * Graphs + insights
* **Reports**

  * Export options

---

## ⚡ Key Highlights

* Handles real-world messy data (flexible parsing)
* Multi-format export system
* Modular and scalable architecture
* Clean separation of parsing, analytics, and UI

---

## 🐛 Known Edge Cases Handled

* Missing subjects (auto-filled)
* Invalid marks detection
* Duplicate entries handling
* Inconsistent student naming warnings

---

## 📌 Future Enhancements

* 📊 Predictive analytics (ML-based performance forecasting)
* 📄 PDF report generation
* 🌐 Backend integration (database support)
* 🔐 Authentication system
* 📈 Advanced analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request.

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

**Saran Shabu**
MCA Student | Full Stack Developer | IAM & Cybersecurity Enthusiast

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and share it!
