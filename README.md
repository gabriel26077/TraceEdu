# TraceEdu 🎓

> **Transforming spreadsheet chaos into academic traceability.**

TraceEdu is a school management solution designed for small and medium-sized institutions that still depend on manual processes, decentralized spreadsheets, and filling out report cards via text editing.

## 📌 The Problem

Neighborhood schools face critical bottlenecks during the grade closing period:

* **Disorganization:** Grades scattered across multiple Google Sheets files or flash drives.
* **Human Error:** Teachers entering data into the wrong classes or columns due to visual failure.
* **Operational Slowness:** The process of transcribing grades from spreadsheets to personalized report cards can take **2 to 3 weeks**.
* **Loss of History:** Extreme difficulty in locating the performance of former students after years, requiring exhaustive searches in fragmented physical or digital archives.

## 🚀 The Solution

TraceEdu centralizes academic intelligence in a secure platform where data integrity is the priority.

### Key Features

* **Shielded Entry:** Teachers only view and edit the classes they are linked to. This eliminates the risk of cross-filling errors common in open tables.
* **Instant Report Card Generation:** Total automation of personalized document creation. What used to take weeks is now done with just a few clicks.
* **Statistics Engine:** Analytical view of performance by subject, class, or school year, making it easier to identify struggling students.
* **Traceability:** Through an architecture based on persistent IDs, any student's history can be retrieved instantly, even years after completing the course.

## 🛠️ Architecture and Security

The modeling was designed for scalability:

* **Access Profiles:** Clear distinction between Administrators (full management) and Teachers (management of their classes).
* **Extensibility:** The system was designed to allow students to log in and check their own data in the future without the need to restructure the database.
* **Data Security:** Concurrency control and change logs to ensure that every grade entered has a source.

---

### 💡 Why "TraceEdu"?

The name comes from the ability to **trace** the student's educational journey from the first to the last day, eliminating the "digital amnesia" that affects institutions that do not have a centralized database.

---
### 💡 Technical Stack

- **Backend**: Python (FastAPI)
- **Frontend**: NextJS, TypeScript (React)
- **Database**: PostgreSQL
- **Containerization**: Docker